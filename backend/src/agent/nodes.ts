// backend/src/agent/nodes.ts
import { AgentStateType } from './state';
import {
  getNextProblemTool,
  runCodeTool,
  generateHintTool,
  explainPatternTool,
  analyzeSolutionTool,
  updateProgressTool,
  selectNextPatternTool
} from './tools';
import Progress from '../models/Progress';

export async function selectPatternNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const nextPattern = await selectNextPatternTool.invoke({
      userId: state.userId
    });

    return {
      ...state,
      currentPattern: nextPattern,
      patternExplanationGiven: false,
      nextAction: 'EXPLAIN_PATTERN',
      conversationHistory: [
        ...state.conversationHistory,
        {
          role: 'system',
          content: `Starting new pattern: ${nextPattern}`,
          timestamp: new Date()
        }
      ]
    };
  } catch (error) {
    console.error('Error in selectPatternNode:', error);
    throw error;
  }
}

export async function explainPatternNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const explanation = await explainPatternTool.invoke({
      pattern: state.currentPattern!,
      query: `Explain the ${state.currentPattern} pattern to a beginner`
    });

    return {
      ...state,
      patternExplanationGiven: true,
      nextAction: 'SELECT_PROBLEM',
      conversationHistory: [
        ...state.conversationHistory,
        {
          role: 'assistant',
          content: explanation,
          timestamp: new Date()
        }
      ]
    };
  } catch (error) {
    console.error('Error in explainPatternNode:', error);
    throw error;
  }
}

export async function selectProblemNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    // Determine difficulty based on progress
    const progress = await Progress.findOne({ userId: state.userId });
    const patternProblems = progress?.problemsSolved.length || 0;
    
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    if (patternProblems > 5) difficulty = 'medium';
    if (patternProblems > 10) difficulty = 'hard';

    const problem = await getNextProblemTool.invoke({
      userId: state.userId,
      currentPattern: state.currentPattern!,
      difficulty
    });

    if (!problem) {
      // No more problems in this pattern, move to next pattern
      return {
        ...state,
        nextAction: 'SELECT_PATTERN',
        conversationHistory: [
          ...state.conversationHistory,
          {
            role: 'assistant',
            content: `🎉 Congratulations! You've completed all problems in the ${state.currentPattern} pattern. Let's move to the next one!`,
            timestamp: new Date()
          }
        ]
      };
    }

    return {
      ...state,
      currentProblem: problem,
      attemptCount: 0,
      hintLevel: 0,
      userCode: null,
      executionResult: null,
      nextAction: 'WAIT_FOR_ATTEMPT',
      conversationHistory: [
        ...state.conversationHistory,
        {
          role: 'assistant',
          content: `Here's your next problem: **${problem.title}** (${problem.difficulty})\n\n${problem.description}`,
          timestamp: new Date()
        }
      ]
    };
  } catch (error) {
    console.error('Error in selectProblemNode:', error);
    throw error;
  }
}

export async function runCodeNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const result = await runCodeTool.invoke({
      code: state.userCode!,
      language: state.language,
      testCases: state.currentProblem.testCases
    });

    const newAttemptCount = state.attemptCount + 1;

    if (result.passed) {
      return {
        ...state,
        executionResult: result,
        attemptCount: newAttemptCount,
        nextAction: 'ANALYZE_SOLUTION'
      };
    } else {
      return {
        ...state,
        executionResult: result,
        attemptCount: newAttemptCount,
        nextAction: 'PROVIDE_FEEDBACK',
        conversationHistory: [
          ...state.conversationHistory,
          {
            role: 'system',
            content: `Test Results: ${result.passedTests}/${result.totalTests} passed`,
            timestamp: new Date()
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error in runCodeNode:', error);
    return {
      ...state,
      executionResult: { passed: false, error: 'Execution error' },
      nextAction: 'PROVIDE_FEEDBACK',
      conversationHistory: [
        ...state.conversationHistory,
        {
          role: 'system',
          content: 'There was an error executing your code. Please check for syntax errors.',
          timestamp: new Date()
        }
      ]
    };
  }
}

export async function provideFeedbackNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const failedTests = state.executionResult?.results?.filter((r: any) => !r.passed) || [];
  
  let feedback = `Your solution didn't pass all tests. Here's what happened:\n\n`;
  
  if (failedTests.length > 0) {
    const firstFailed = failedTests[0];
    feedback += `❌ Failed Test Case:\n`;
    feedback += `Input: ${JSON.stringify(firstFailed.input)}\n`;
    feedback += `Expected: ${JSON.stringify(firstFailed.expectedOutput)}\n`;
    feedback += `Got: ${JSON.stringify(firstFailed.actualOutput)}\n`;
    
    if (firstFailed.error) {
      feedback += `Error: ${firstFailed.error}\n`;
    }
  }

  feedback += `\nAttempt ${state.attemptCount} of unlimited attempts. `;
  feedback += state.attemptCount < 3 
    ? `You need at least 3 attempts before requesting the solution.`
    : `You can request a hint or keep trying!`;

  return {
    ...state,
    nextAction: 'WAIT_FOR_ATTEMPT',
    conversationHistory: [
      ...state.conversationHistory,
      {
        role: 'assistant',
        content: feedback,
        timestamp: new Date()
      }
    ]
  };
}

export async function generateHintNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    // Check if user has made enough attempts
    if (state.attemptCount < 1) {
      return {
        ...state,
        conversationHistory: [
          ...state.conversationHistory,
          {
            role: 'assistant',
            content: 'Please try solving the problem first before requesting a hint!',
            timestamp: new Date()
          }
        ],
        nextAction: 'WAIT_FOR_ATTEMPT'
      };
    }

    const previousHints = state.conversationHistory
      .filter(msg => msg.role === 'assistant' && msg.content.includes('Hint'))
      .map(msg => msg.content);

    const newHintLevel = Math.min(state.hintLevel + 1, 3);

    // If trying to get solution before 3 attempts
    if (newHintLevel === 3 && state.attemptCount < 3) {
      return {
        ...state,
        conversationHistory: [
          ...state.conversationHistory,
          {
            role: 'assistant',
            content: `You need at least ${3 - state.attemptCount} more attempt(s) before I can provide the complete solution. Try again! 💪`,
            timestamp: new Date()
          }
        ],
        nextAction: 'WAIT_FOR_ATTEMPT'
      };
    }

    const hint = await generateHintTool.invoke({
      problemId: state.currentProblem.id,
      userCode: state.userCode || '',
      hintLevel: newHintLevel,
      attemptCount: state.attemptCount,
      previousHints
    });

    const hintPrefix = newHintLevel === 3 ? '📝 Solution Approach' : `💡 Hint ${newHintLevel}`;

    return {
      ...state,
      hintLevel: newHintLevel,
      nextAction: 'WAIT_FOR_ATTEMPT',
      conversationHistory: [
        ...state.conversationHistory,
        {
          role: 'assistant',
          content: `${hintPrefix}:\n\n${hint}`,
          timestamp: new Date()
        }
      ]
    };
  } catch (error) {
    console.error('Error in generateHintNode:', error);
    throw error;
  }
}

export async function analyzeSolutionNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const analysis = await analyzeSolutionTool.invoke({
      code: state.userCode!,
      problemId: state.currentProblem.id
    });

    // Update progress
    await updateProgressTool.invoke({
      userId: state.userId,
      problemId: state.currentProblem.id,
      passed: true,
      hintsUsed: state.hintLevel,
      difficulty: state.currentProblem.difficulty
    });

    return {
      ...state,
      nextAction: 'SELECT_PROBLEM',
      conversationHistory: [
        ...state.conversationHistory,
        {
          role: 'assistant',
          content: `🎉 **Correct Solution!**\n\n${analysis}\n\nReady for the next challenge?`,
          timestamp: new Date()
        }
      ]
    };
  } catch (error) {
    console.error('Error in analyzeSolutionNode:', error);
    throw error;
  }
}

export async function waitForAttemptNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  // This is a human-in-the-loop node
  // It simply returns the state and waits for user input
  return state;
}

//exports
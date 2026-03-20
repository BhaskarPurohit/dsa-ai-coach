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
import { claudeService } from '../services/claude.service';

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

    // Keep last 5 attempts in code history (CodeSignal shows previous submissions)
    const newHistory = [
      ...(state.codeHistory || []).slice(-4),
      { code: state.userCode!, result, attemptNum: newAttemptCount, timestamp: new Date() }
    ];

    if (result.passed) {
      return {
        ...state,
        executionResult: result,
        attemptCount: newAttemptCount,
        codeHistory: newHistory,
        nextAction: 'ANALYZE_SOLUTION'
      };
    } else {
      return {
        ...state,
        executionResult: result,
        attemptCount: newAttemptCount,
        codeHistory: newHistory,
        nextAction: 'PROVIDE_FEEDBACK',
      };
    }
  } catch (error) {
    console.error('Error in runCodeNode:', error);
    return {
      ...state,
      executionResult: { passed: false, error: 'Execution error' },
      nextAction: 'PROVIDE_FEEDBACK',
    };
  }
}

export async function provideFeedbackNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const failedTests = state.executionResult?.results?.filter((r: any) => !r.passed) || [];
  const firstFailed = failedTests[0] || null;
  const executionError = state.executionResult?.error || null;

  // CodeSignal-style: AI reads the user's actual code and gives specific, positive feedback
  let feedback: string;
  try {
    feedback = await claudeService.generateContextualFeedback(
      state.currentProblem?.title || 'this problem',
      state.currentProblem?.description || '',
      state.userCode || '',
      state.attemptCount,
      firstFailed ? {
        input: firstFailed.input,
        expectedOutput: firstFailed.expectedOutput,
        actualOutput: firstFailed.actualOutput
      } : null,
      executionError
    );
  } catch {
    // Fallback to basic feedback if Claude fails
    const passed = state.executionResult?.passedTests ?? 0;
    const total = state.executionResult?.totalTests ?? 0;
    feedback = `Good effort! ${passed}/${total} test cases passed. Review the failing case and think about edge conditions.`;
  }

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
    // CodeSignal-style: hints are available after first attempt, no arbitrary gates
    if (state.attemptCount < 1) {
      return {
        ...state,
        conversationHistory: [
          ...state.conversationHistory,
          {
            role: 'assistant',
            content: 'Make your first attempt — even a rough start gives me something to work with when coaching you!',
            timestamp: new Date()
          }
        ],
        nextAction: 'WAIT_FOR_ATTEMPT'
      };
    }

    const previousHints = state.conversationHistory
      .filter(msg => msg.role === 'assistant' && msg.content.startsWith('[HINT'))
      .map(msg => msg.content);

    // Progress through hint levels: 1 (Socratic) → 2 (Pseudocode) → 3 (Approach)
    const newHintLevel = Math.min((state.hintLevel || 0) + 1, 3);

    const hint = await generateHintTool.invoke({
      problemId: state.currentProblem.id,
      userCode: state.userCode || '',
      hintLevel: newHintLevel,
      attemptCount: state.attemptCount,
      previousHints
    });

    // Hint type labels — shown in UI for distinct visual styling
    const hintMeta = {
      1: { prefix: '[HINT:socratic]', label: 'Think About It' },
      2: { prefix: '[HINT:pseudocode]', label: 'Pseudocode Guide' },
      3: { prefix: '[HINT:approach]', label: 'Solution Approach' },
    };
    const meta = hintMeta[newHintLevel as keyof typeof hintMeta];

    return {
      ...state,
      hintLevel: newHintLevel,
      nextAction: 'WAIT_FOR_ATTEMPT',
      conversationHistory: [
        ...state.conversationHistory,
        {
          role: 'assistant',
          content: `${meta.prefix} ${meta.label}:\n\n${hint}`,
          timestamp: new Date()
        }
      ]
    };
  } catch (error) {
    console.error('Error in generateHintNode:', error);
    throw error;
  }
}

function calculateMasteryLevel(
  problemsSolvedInPattern: number,
  avgHintsPerProblem: number
): 'developing' | 'proficient' | 'advanced' | 'expert' {
  if (problemsSolvedInPattern >= 8 && avgHintsPerProblem <= 0.5) return 'expert';
  if (problemsSolvedInPattern >= 5 && avgHintsPerProblem <= 1.0) return 'advanced';
  if (problemsSolvedInPattern >= 2 && avgHintsPerProblem <= 2.0) return 'proficient';
  return 'developing';
}

export async function analyzeSolutionNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const analysis = await analyzeSolutionTool.invoke({
      code: state.userCode!,
      problemId: state.currentProblem.id
    });

    await updateProgressTool.invoke({
      userId: state.userId,
      problemId: state.currentProblem.id,
      passed: true,
      hintsUsed: state.hintLevel,
      difficulty: state.currentProblem.difficulty
    });

    // Calculate mastery level from current progress
    const progress = await Progress.findOne({ userId: state.userId });
    const patternHistory = (progress?.attemptHistory || []).filter(
      (a: any) => a.patternId === state.currentPattern && a.solved
    );
    const solved = patternHistory.length + 1; // +1 for current
    const totalHints = patternHistory.reduce((sum: number, a: any) => sum + (a.hintsUsed || 0), 0) + state.hintLevel;
    const avgHints = solved > 0 ? totalHints / solved : 0;
    const masteryLevel = calculateMasteryLevel(solved, avgHints);

    // Mastery-aware celebration message
    const masteryMessages: Record<string, string> = {
      developing: 'You\'re building momentum — keep going!',
      proficient: 'You\'re getting the hang of this pattern.',
      advanced: 'Strong pattern recognition — you\'re ahead of the curve.',
      expert: 'Expert-level mastery. This pattern is locked in.',
    };

    return {
      ...state,
      masteryLevel,
      nextAction: 'SELECT_PROBLEM',
      conversationHistory: [
        ...state.conversationHistory,
        {
          role: 'assistant',
          content: `✅ Solved!\n\n${analysis}\n\n${masteryMessages[masteryLevel]}`,
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
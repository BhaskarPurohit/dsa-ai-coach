// backend/src/agent/tools.ts
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import Problem from '../models/Problem';
import Progress from '../models/Progress';
import { judge0Service } from '../services/judge0.service';
import { claudeService } from '../services/claude.service';
import { ragService } from '../services/rag.service';

// Tool: Get Next Problem
export const getNextProblemTool = tool(
  async ({ userId, currentPattern, difficulty }) => {
    try {
      const progress = await Progress.findOne({ userId });
      const solvedProblems = progress?.problemsSolved || [];

      const problem = await Problem.findOne({
        pattern: currentPattern,
        difficulty: difficulty,
        id: { $nin: solvedProblems }
      }).sort({ order: 1 });

      if (!problem) {
        // No more problems in this pattern/difficulty, try next difficulty
        return null;
      }

      return {
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        starterCode: problem.starterCode,
        testCases: problem.testCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput
        }))
      };
    } catch (error) {
      console.error('Error getting next problem:', error);
      throw error;
    }
  },
  {
    name: 'get_next_problem',
    description: 'Fetch the next unsolved problem for the user based on their progress and current pattern',
    schema: z.object({
      userId: z.string().describe('User ID'),
      currentPattern: z.string().describe('Current DSA pattern'),
      difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level')
    })
  }
);

// Tool: Run Code
export const runCodeTool = tool(
  async ({ code, language, testCases }) => {
    try {
      const result = await judge0Service.executeCode(code, language, testCases);
      return result;
    } catch (error) {
      console.error('Error running code:', error);
      throw error;
    }
  },
  {
    name: 'run_code',
    description: 'Execute user code against test cases using Judge0',
    schema: z.object({
      code: z.string().describe('User code to execute'),
      language: z.enum(['javascript', 'python']).describe('Programming language'),
      testCases: z.array(z.object({
        input: z.any().describe('Test input'),
        expectedOutput: z.any().describe('Expected output')
      })).describe('Array of test cases')
    })
  }
);

// Tool: Generate Hint
export const generateHintTool = tool(
  async ({ problemId, userCode, hintLevel, attemptCount, previousHints }) => {
    try {
      const problem = await Problem.findOne({ id: problemId });
      if (!problem) throw new Error('Problem not found');

      // If we have pre-defined hints and hint level is within range, use them
      if (hintLevel < problem.hints.length) {
        return problem.hints[hintLevel];
      }

      // Otherwise, generate dynamic hint using Claude
      const hint = await claudeService.generateHint(
        problem.title,
        problem.description,
        userCode,
        hintLevel,
        attemptCount,
        previousHints
      );

      return hint;
    } catch (error) {
      console.error('Error generating hint:', error);
      throw error;
    }
  },
  {
    name: 'generate_hint',
    description: 'Generate a progressive hint for the user based on their attempt',
    schema: z.object({
      problemId: z.number().describe('Problem ID'),
      userCode: z.string().describe('User code attempt'),
      hintLevel: z.number().describe('Hint level (0-3)'),
      attemptCount: z.number().describe('Number of attempts made'),
      previousHints: z.array(z.string()).describe('Previously given hints')
    })
  }
);

// Tool: Explain Pattern
export const explainPatternTool = tool(
  async ({ pattern, query }) => {
    try {
      // Get pattern knowledge from RAG
      const patternKnowledge = await ragService.getPatternByName(pattern);
      
      if (!patternKnowledge) {
        return `I don't have information about the ${pattern} pattern yet.`;
      }

      // Use Claude to generate a personalized explanation
      const explanation = await claudeService.explainPattern(
        pattern,
        patternKnowledge,
        query
      );

      return explanation;
    } catch (error) {
      console.error('Error explaining pattern:', error);
      throw error;
    }
  },
  {
    name: 'explain_pattern',
    description: 'Explain a DSA pattern using RAG knowledge base and Claude',
    schema: z.object({
      pattern: z.string().describe('Pattern name'),
      query: z.string().optional().describe('Specific question about the pattern')
    })
  }
);

// Tool: Analyze Solution
export const analyzeSolutionTool = tool(
  async ({ code, problemId }) => {
    try {
      const problem = await Problem.findOne({ id: problemId });
      if (!problem) throw new Error('Problem not found');

      const analysis = await claudeService.analyzeSolution(
        code,
        problem.title,
        problem.timeComplexity,
        problem.spaceComplexity
      );

      return analysis;
    } catch (error) {
      console.error('Error analyzing solution:', error);
      throw error;
    }
  },
  {
    name: 'analyze_solution',
    description: 'Analyze code for time/space complexity and provide feedback',
    schema: z.object({
      code: z.string().describe('User code to analyze'),
      problemId: z.number().describe('Problem ID')
    })
  }
);

// Tool: Update Progress
export const updateProgressTool = tool(
  async ({ userId, problemId, passed, hintsUsed, difficulty }) => {
    try {
      const progress = await Progress.findOne({ userId });

      if (!progress) {
        // Create new progress
        await Progress.create({
          userId,
          problemsSolved: passed ? [problemId] : [],
          totalHintsUsed: hintsUsed,
          lastActive: new Date(),
          statistics: {
            totalProblems: passed ? 1 : 0,
            easyProblems: passed && difficulty === 'easy' ? 1 : 0,
            mediumProblems: passed && difficulty === 'medium' ? 1 : 0,
            hardProblems: passed && difficulty === 'hard' ? 1 : 0,
            averageHintsPerProblem: hintsUsed
          },
          attemptHistory: [{
            problemId,
            attempts: 1,
            hintsUsed,
            solved: passed,
            solvedAt: passed ? new Date() : undefined
          }]
        });
      } else {
        // Update existing progress
        const updateData: any = {
          lastActive: new Date(),
          totalHintsUsed: progress.totalHintsUsed + hintsUsed
        };

        if (passed && !progress.problemsSolved.includes(problemId)) {
          updateData.$push = { problemsSolved: problemId };
          updateData.$inc = {
            'statistics.totalProblems': 1,
            [`statistics.${difficulty}Problems`]: 1
          };
        }

        // Update or add attempt history
        const attemptIndex = progress.attemptHistory.findIndex(
          a => a.problemId === problemId
        );

        if (attemptIndex >= 0) {
          progress.attemptHistory[attemptIndex].attempts += 1;
          progress.attemptHistory[attemptIndex].hintsUsed += hintsUsed;
          if (passed) {
            progress.attemptHistory[attemptIndex].solved = true;
            progress.attemptHistory[attemptIndex].solvedAt = new Date();
          }
        } else {
          progress.attemptHistory.push({
            problemId,
            attempts: 1,
            hintsUsed,
            solved: passed,
            solvedAt: passed ? new Date() : undefined
          });
        }

        await progress.save();
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },
  {
    name: 'update_progress',
    description: 'Update user progress in database',
    schema: z.object({
      userId: z.string().describe('User ID'),
      problemId: z.number().describe('Problem ID'),
      passed: z.boolean().describe('Whether the solution passed all tests'),
      hintsUsed: z.number().describe('Number of hints used'),
      difficulty: z.enum(['easy', 'medium', 'hard']).describe('Problem difficulty')
    })
  }
);

// Tool: Select Next Pattern
export const selectNextPatternTool = tool(
  async ({ userId }) => {
    try {
      const progress = await Progress.findOne({ userId });
      
      const allPatterns = [
        'Arrays & Hashing',
        'Two Pointers',
        'Sliding Window',
        'Binary Search',
        'Trees & BST',
        'Graphs',
        'Dynamic Programming',
        'Stack & Queue',
        'Heap / Priority Queue',
        'Backtracking'
      ];

      const completedPatterns = progress?.patternsCompleted || [];
      const incompletePatterns = allPatterns.filter(
        p => !completedPatterns.includes(p)
      );

      if (incompletePatterns.length === 0) {
        return allPatterns[0]; // Start over
      }

      return incompletePatterns[0];
    } catch (error) {
      console.error('Error selecting next pattern:', error);
      throw error;
    }
  },
  {
    name: 'select_next_pattern',
    description: 'Select the next pattern for the user to learn',
    schema: z.object({
      userId: z.string().describe('User ID')
    })
  }
);
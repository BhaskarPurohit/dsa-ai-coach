// backend/src/routes/agent.routes.ts
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { agentWorkflow } from '../agent/workflow';
import { AgentStateType } from '../agent/state';
import Progress from '../models/Progress';
import { sessionService } from '../services/session.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// All agent routes require authentication
router.use(authMiddleware);

// Start a new learning session
router.post('/start-session', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // Get or create user progress
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = await Progress.create({
        userId,
        patternsCompleted: [],
        currentPattern: null,
        problemsSolved: [],
        weakPatterns: [],
        totalHintsUsed: 0,
        streak: 0,
        lastActive: new Date(),
      });
    }

    const sessionId = uuidv4();
    const initialState: AgentStateType = {
      userId,
      sessionId,
      currentPattern: progress.currentPattern,
      currentProblem: null,
      userCode: null,
      language: 'javascript',
      attemptCount: 0,
      hintLevel: 0,
      executionResult: null,
      nextAction: 'SELECT_PATTERN',
      conversationHistory: [],
      userProgress: progress,
      patternExplanationGiven: false,
    };

    await sessionService.set(sessionId, userId, initialState);

    // Run initial workflow steps
    const result = await agentWorkflow.invoke(initialState);
    await sessionService.set(sessionId, userId, result);

    res.json({
      sessionId,
      currentPattern: result.currentPattern,
      currentProblem: result.currentProblem,
      messages: result.conversationHistory,
      nextAction: result.nextAction,
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Submit code for evaluation
router.post('/submit-code', async (req: AuthRequest, res) => {
  try {
    const { sessionId, code, language } = req.body;
    const userId = req.userId!;

    if (!sessionId || !code) {
      return res.status(400).json({ error: 'sessionId and code are required' });
    }

    const state = await sessionService.get(sessionId);
    if (!state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    state.userCode = code;
    state.language = language || 'javascript';
    state.nextAction = 'RUN_CODE';

    const result = await agentWorkflow.invoke(state);
    await sessionService.set(sessionId, userId, result);

    res.json({
      passed: result.executionResult?.passed,
      executionResult: result.executionResult,
      messages: result.conversationHistory.slice(-2),
      nextAction: result.nextAction,
      attemptCount: result.attemptCount,
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

// Request a hint
router.post('/request-hint', async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId!;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const state = await sessionService.get(sessionId);
    if (!state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    state.nextAction = 'GENERATE_HINT';

    const result = await agentWorkflow.invoke(state);
    await sessionService.set(sessionId, userId, result);

    res.json({
      hint: result.conversationHistory[result.conversationHistory.length - 1],
      hintLevel: result.hintLevel,
      nextAction: result.nextAction,
    });
  } catch (error) {
    console.error('Error requesting hint:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

// Get session state
router.get('/session/:sessionId', async (req: AuthRequest, res) => {
  const { sessionId } = req.params;
  const state = await sessionService.get(sessionId);

  if (!state) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    currentPattern: state.currentPattern,
    currentProblem: state.currentProblem,
    attemptCount: state.attemptCount,
    hintLevel: state.hintLevel,
    messages: state.conversationHistory,
    nextAction: state.nextAction,
  });
});

// Request next problem
router.post('/next-problem', async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId!;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const state = await sessionService.get(sessionId);
    if (!state) {
      return res.status(404).json({ error: 'Session not found' });
    }

    state.nextAction = 'SELECT_PROBLEM';

    const result = await agentWorkflow.invoke(state);
    await sessionService.set(sessionId, userId, result);

    res.json({
      currentProblem: result.currentProblem,
      messages: result.conversationHistory.slice(-1),
      nextAction: result.nextAction,
    });
  } catch (error) {
    console.error('Error getting next problem:', error);
    res.status(500).json({ error: 'Failed to get next problem' });
  }
});

export default router;

// backend/src/routes/problem.routes.ts
import express from 'express';
import Problem from '../models/Problem';

const router = express.Router();

// Get all problems
router.get('/', async (req, res) => {
  try {
    const { pattern, difficulty } = req.query;
    
    const filter: any = {};
    if (pattern) filter.pattern = pattern;
    if (difficulty) filter.difficulty = difficulty;

    const problems = await Problem.find(filter).sort({ order: 1 });
    
    res.json({
      success: true,
      count: problems.length,
      data: problems
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Get problem by ID
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: parseInt(req.params.id) });
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// Get problems by pattern
router.get('/pattern/:pattern', async (req, res) => {
  try {
    const { pattern } = req.params;
    const problems = await Problem.find({ pattern }).sort({ order: 1 });
    
    res.json({
      success: true,
      count: problems.length,
      data: problems
    });
  } catch (error) {
    console.error('Error fetching problems by pattern:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// Get all unique patterns
router.get('/meta/patterns', async (req, res) => {
  try {
    const patterns = await Problem.distinct('pattern');
    
    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

export default router;
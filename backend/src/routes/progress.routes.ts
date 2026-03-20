// backend/src/routes/progress.routes.ts
import express from 'express';
import Progress from '../models/Progress';
import Problem from '../models/Problem';

const router = express.Router();

// Get user progress
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
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
        lastActive: new Date()
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get detailed statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    // Get all problems to calculate percentages
    const totalProblems = await Problem.countDocuments();
    const easyCount = await Problem.countDocuments({ difficulty: 'easy' });
    const mediumCount = await Problem.countDocuments({ difficulty: 'medium' });
    const hardCount = await Problem.countDocuments({ difficulty: 'hard' });

    const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

    const stats = {
      overall: {
        solved: progress.problemsSolved.length,
        total: totalProblems,
        percentage: pct(progress.problemsSolved.length, totalProblems)
      },
      byDifficulty: {
        easy: {
          solved: progress.statistics.easyProblems,
          total: easyCount,
          percentage: pct(progress.statistics.easyProblems, easyCount)
        },
        medium: {
          solved: progress.statistics.mediumProblems,
          total: mediumCount,
          percentage: pct(progress.statistics.mediumProblems, mediumCount)
        },
        hard: {
          solved: progress.statistics.hardProblems,
          total: hardCount,
          percentage: pct(progress.statistics.hardProblems, hardCount)
        }
      },
      patterns: {
        completed: progress.patternsCompleted,   // array of names, not .length
        current: progress.currentPattern,
        weak: progress.weakPatterns
      },
      engagement: {
        streak: progress.streak,
        lastActive: progress.lastActive,
        totalHintsUsed: progress.totalHintsUsed,
        averageHintsPerProblem: progress.statistics.averageHintsPerProblem
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Update streak
router.post('/:userId/streak', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    // Check if last active was yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = new Date(progress.lastActive);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Continue streak
      progress.streak += 1;
    } else if (diffDays > 1) {
      // Reset streak
      progress.streak = 1;
    }
    // If same day, don't change streak

    progress.lastActive = new Date();
    await progress.save();

    res.json({
      success: true,
      data: { streak: progress.streak }
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
});

// Get pattern progress
router.get('/:userId/patterns/:pattern', async (req, res) => {
  try {
    const { userId, pattern } = req.params;
    const progress = await Progress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    // Get all problems in this pattern
    const allProblems = await Problem.find({ pattern }).sort({ order: 1 });
    
    const patternProgress = allProblems.map(problem => ({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      solved: progress.problemsSolved.includes(problem.id),
      attempts: progress.attemptHistory.find(a => a.problemId === problem.id)?.attempts || 0,
      hintsUsed: progress.attemptHistory.find(a => a.problemId === problem.id)?.hintsUsed || 0
    }));

    const completed = patternProgress.filter(p => p.solved).length;
    const total = patternProgress.length;

    res.json({
      success: true,
      data: {
        pattern,
        completed,
        total,
        percentage: Math.round((completed / total) * 100),
        problems: patternProgress
      }
    });
  } catch (error) {
    console.error('Error fetching pattern progress:', error);
    res.status(500).json({ error: 'Failed to fetch pattern progress' });
  }
});

export default router;
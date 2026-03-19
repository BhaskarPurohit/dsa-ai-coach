// components/ProgressTracker.tsx
'use client';

import React from 'react';
import { Trophy, Flame, Target, TrendingUp } from 'lucide-react';

interface ProgressTrackerProps {
  stats: {
    overall: {
      solved: number;
      total: number;
      percentage: number;
    };
    byDifficulty: {
      easy: { solved: number; total: number; percentage: number };
      medium: { solved: number; total: number; percentage: number };
      hard: { solved: number; total: number; percentage: number };
    };
    engagement: {
      streak: number;
      totalHintsUsed: number;
      averageHintsPerProblem: number;
    };
  };
}

export default function ProgressTracker({ stats }: ProgressTrackerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Overall Progress */}
      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Trophy className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Problems Solved</p>
            <p className="text-2xl font-bold">{stats.overall.solved}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.overall.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {stats.overall.percentage}% of {stats.overall.total} problems
        </p>
      </div>

      {/* Streak */}
      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-2xl font-bold">{stats.engagement.streak} days</p>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          Keep it up! 🔥
        </p>
      </div>

      {/* Easy Problems */}
      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-success-100 rounded-lg">
            <Target className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Easy</p>
            <p className="text-2xl font-bold">{stats.byDifficulty.easy.solved}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-success-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.byDifficulty.easy.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {stats.byDifficulty.easy.percentage}% completed
        </p>
      </div>

      {/* Medium Problems */}
      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-warning-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Medium</p>
            <p className="text-2xl font-bold">{stats.byDifficulty.medium.solved}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-warning-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.byDifficulty.medium.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {stats.byDifficulty.medium.percentage}% completed
        </p>
      </div>
    </div>
  );
}
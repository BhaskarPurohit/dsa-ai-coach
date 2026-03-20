'use client';

import { Trophy, Flame, Target, TrendingUp, Brain, Lightbulb } from 'lucide-react';

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

function StatCard({
  icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
  barColor,
  barPct,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
  barColor?: string;
  barPct?: number;
}) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 leading-none mt-0.5">{value}</p>
        </div>
      </div>
      {barPct !== undefined && barColor && (
        <div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`${barColor} h-1.5 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(barPct, 100)}%` }}
            />
          </div>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
      )}
      {barPct === undefined && sub && (
        <p className="text-xs text-gray-400">{sub}</p>
      )}
    </div>
  );
}

export default function ProgressTracker({ stats }: ProgressTrackerProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      <StatCard
        icon={<Trophy className="w-5 h-5" />}
        label="Solved"
        value={stats.overall.solved}
        iconBg="bg-primary-100"
        iconColor="text-primary-600"
        barColor="bg-primary-500"
        barPct={stats.overall.percentage}
        sub={`${stats.overall.percentage}% of ${stats.overall.total}`}
      />
      <StatCard
        icon={<Flame className="w-5 h-5" />}
        label="Streak"
        value={`${stats.engagement.streak}d`}
        iconBg="bg-orange-100"
        iconColor="text-orange-500"
        sub={stats.engagement.streak > 0 ? '🔥 Keep it up!' : 'Start your streak'}
      />
      <StatCard
        icon={<Target className="w-5 h-5" />}
        label="Easy"
        value={stats.byDifficulty.easy.solved}
        iconBg="bg-success-100"
        iconColor="text-success-600"
        barColor="bg-success-500"
        barPct={stats.byDifficulty.easy.percentage}
        sub={`${stats.byDifficulty.easy.percentage}% done`}
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Medium"
        value={stats.byDifficulty.medium.solved}
        iconBg="bg-warning-100"
        iconColor="text-warning-600"
        barColor="bg-warning-500"
        barPct={stats.byDifficulty.medium.percentage}
        sub={`${stats.byDifficulty.medium.percentage}% done`}
      />
      <StatCard
        icon={<Brain className="w-5 h-5" />}
        label="Hard"
        value={stats.byDifficulty.hard.solved}
        iconBg="bg-danger-100"
        iconColor="text-danger-600"
        barColor="bg-danger-500"
        barPct={stats.byDifficulty.hard.percentage}
        sub={`${stats.byDifficulty.hard.percentage}% done`}
      />
      <StatCard
        icon={<Lightbulb className="w-5 h-5" />}
        label="Hints Used"
        value={stats.engagement.totalHintsUsed}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        sub={`~${stats.engagement.averageHintsPerProblem.toFixed(1)} per problem`}
      />
    </div>
  );
}

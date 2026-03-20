'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { progressAPI, authAPI } from '@/lib/api';
import ProgressTracker from '@/components/ProgressTracker';
import {
  Brain,
  Play,
  TrendingUp,
  CheckCircle2,
  Circle,
  ChevronRight,
  LogOut,
  Lightbulb,
  Target,
  BookOpen,
  Lock,
  Flame,
} from 'lucide-react';

const ALL_PATTERNS = [
  { name: 'Arrays & Hashing',     icon: '🗂️',  description: 'Hash maps, frequency counting, grouping' },
  { name: 'Two Pointers',         icon: '👆',  description: 'Converging pointers on sorted arrays' },
  { name: 'Sliding Window',       icon: '🪟',  description: 'Fixed/dynamic windows over sequences' },
  { name: 'Binary Search',        icon: '🔍',  description: 'O(log n) search on sorted spaces' },
  { name: 'Trees & BST',          icon: '🌳',  description: 'DFS, BFS, tree traversals' },
  { name: 'Graphs',               icon: '🕸️',  description: 'Connected components, shortest paths' },
  { name: 'Dynamic Programming',  icon: '🧮',  description: 'Overlapping subproblems, memoisation' },
  { name: 'Stack & Queue',        icon: '📚',  description: 'LIFO/FIFO, monotonic stacks' },
  { name: 'Heap / Priority Queue',icon: '⛏️',  description: 'Top-K, running median, scheduling' },
  { name: 'Backtracking',         icon: '🔄',  description: 'Explore + prune, permutations, N-Queens' },
];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    const user = authAPI.getUser();
    if (user) {
      setUserName(user.name);
      setUserId(user.userId);
      loadStats(user.userId);
    }
  }, [router]);

  const loadStats = async (id: string) => {
    try {
      const response = await progressAPI.getStats(id);
      setStats(response.data);
    } catch {
      // stats unavailable — show empty state
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => router.push('/problem');
  const handleLogout = () => authAPI.logout();

  const completedPatterns: string[] = Array.isArray(stats?.patterns?.completed)
    ? stats.patterns.completed
    : [];
  const currentPattern: string = stats?.patterns?.current ?? '';
  const currentIndex = ALL_PATTERNS.findIndex(p => p.name === currentPattern);

  const overallPct = stats?.overall?.percentage ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your progress…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-7 h-7 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">DSA AI Coach</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartLearning}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Continue Learning
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Hero / Welcome ──────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-primary-200 text-sm font-medium mb-1">Welcome back</p>
              <h1 className="text-3xl font-bold mb-2">
                {userName ? `Hey, ${userName}! 👋` : 'Welcome back! 👋'}
              </h1>
              <p className="text-primary-100 text-sm max-w-md">
                {currentPattern
                  ? `Currently working on: ${currentPattern}`
                  : 'Ready to start your DSA journey?'}
              </p>
            </div>

            {/* Overall progress ring */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="white" strokeWidth="2.5"
                      strokeDasharray={`${overallPct} ${100 - overallPct}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold">{overallPct}%</span>
                  </div>
                </div>
                <p className="text-primary-200 text-xs mt-1">Overall</p>
              </div>

              <div className="hidden md:flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-200" />
                  <span className="text-primary-100">{completedPatterns.length}/10 patterns done</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-200" />
                  <span className="text-primary-100">{stats?.overall?.solved ?? 0} problems solved</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-primary-100">{stats?.engagement?.streak ?? 0} day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────── */}
        {stats && <ProgressTracker stats={stats} />}

        {/* ── Two-column body ────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Learning Path — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Learning Path</h2>
                <span className="text-sm text-gray-400">
                  {completedPatterns.length} / {ALL_PATTERNS.length} complete
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedPatterns.length / ALL_PATTERNS.length) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {ALL_PATTERNS.map((pattern, index) => {
                  const isCompleted = completedPatterns.includes(pattern.name);
                  const isCurrent = pattern.name === currentPattern;
                  const isLocked = !isCompleted && !isCurrent && index > (currentIndex === -1 ? 0 : currentIndex);

                  return (
                    <div
                      key={pattern.name}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                        isCurrent
                          ? 'border-primary-300 bg-primary-50 shadow-sm'
                          : isCompleted
                          ? 'border-success-200 bg-success-50'
                          : isLocked
                          ? 'border-gray-100 bg-gray-50 opacity-60'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Step indicator */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isCompleted
                            ? 'bg-success-600 text-white'
                            : isCurrent
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : index + 1}
                      </div>

                      {/* Pattern emoji */}
                      <span className="text-xl flex-shrink-0">{pattern.icon}</span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                          {pattern.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{pattern.description}</p>
                      </div>

                      {/* Status / CTA */}
                      {isCompleted && (
                        <span className="text-xs font-medium text-success-600 bg-success-100 px-2 py-1 rounded-full flex-shrink-0">
                          Done
                        </span>
                      )}
                      {isCurrent && (
                        <button
                          onClick={handleStartLearning}
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                        >
                          Continue <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                      {!isCompleted && !isCurrent && !isLocked && (
                        <span className="text-xs text-gray-400 flex-shrink-0">Up next</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar — 1/3 width */}
          <div className="space-y-6">

            {/* Quick actions */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleStartLearning}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-primary-200 bg-primary-50 hover:bg-primary-100 transition-colors text-left group"
                >
                  <div className="p-2 bg-primary-600 rounded-lg">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-900 text-sm">Continue Learning</p>
                    <p className="text-xs text-primary-600 truncate">
                      {currentPattern || 'Start Arrays & Hashing'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => router.push('/problem')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="p-2 bg-success-100 rounded-lg">
                    <Target className="w-4 h-4 text-success-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Practice Problems</p>
                    <p className="text-xs text-gray-400">Random problem session</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </button>

                <button
                  onClick={() => router.push('/problem')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="p-2 bg-warning-100 rounded-lg">
                    <BookOpen className="w-4 h-4 text-warning-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Review Patterns</p>
                    <p className="text-xs text-gray-400">Revisit completed topics</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </button>
              </div>
            </div>

            {/* Engagement stats */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Current Streak
                  </div>
                  <span className="font-bold text-gray-900">
                    {stats?.engagement?.streak ?? 0} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lightbulb className="w-4 h-4 text-purple-500" />
                    Hints Used
                  </div>
                  <span className="font-bold text-gray-900">
                    {stats?.engagement?.totalHintsUsed ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-primary-500" />
                    Avg Hints / Problem
                  </div>
                  <span className="font-bold text-gray-900">
                    {(stats?.engagement?.averageHintsPerProblem ?? 0).toFixed(1)}
                  </span>
                </div>

                {/* Difficulty breakdown */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  {[
                    { label: 'Easy',   pct: stats?.byDifficulty?.easy?.percentage   ?? 0, color: 'bg-success-500' },
                    { label: 'Medium', pct: stats?.byDifficulty?.medium?.percentage ?? 0, color: 'bg-warning-500' },
                    { label: 'Hard',   pct: stats?.byDifficulty?.hard?.percentage   ?? 0, color: 'bg-danger-500'  },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`${color} h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Motivational nudge */}
            <div className="rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-sm font-semibold text-primary-800 mb-1">Pro Tip</p>
                  <p className="text-xs text-primary-700 leading-relaxed">
                    Solve at least one problem daily to build pattern recognition. Consistency beats marathon sessions every time.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

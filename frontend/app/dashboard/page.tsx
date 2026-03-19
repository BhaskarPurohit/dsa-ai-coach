// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { progressAPI } from '@/lib/api';
import ProgressTracker from '@/components/ProgressTracker';
import { BookOpen, Play, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (!id) {
      router.push('/');
      return;
    }
    setUserId(id);
    loadStats(id);
  }, [router]);

  const loadStats = async (id: string) => {
    try {
      const response = await progressAPI.getStats(id);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    router.push('/problem');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold">DSA AI Coach</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleStartLearning}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Let's continue your DSA learning journey
          </p>
        </div>

        {/* Stats */}
        {stats && <ProgressTracker stats={stats} />}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div
            onClick={handleStartLearning}
            className="card cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Play className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Continue Learning</h3>
                <p className="text-sm text-gray-600">
                  {stats?.patterns.current || 'Start new pattern'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Patterns Completed</h3>
                <p className="text-sm text-gray-600">
                  {stats?.patterns.completed || 0} / 10
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Total Problems</h3>
                <p className="text-sm text-gray-600">
                  {stats?.overall.solved || 0} solved
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Learning Path</h2>
          <div className="space-y-3">
            {[
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
            ].map((pattern, index) => {
              const isCompleted = stats?.patterns.completed?.includes(pattern);
              const isCurrent = stats?.patterns.current === pattern;
              
              return (
                <div
                  key={pattern}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isCurrent
                      ? 'border-primary-300 bg-primary-50'
                      : isCompleted
                      ? 'border-success-300 bg-success-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isCompleted
                          ? 'bg-success-600 text-white'
                          : isCurrent
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{pattern}</p>
                      {isCurrent && (
                        <p className="text-xs text-primary-600">In Progress</p>
                      )}
                      {isCompleted && (
                        <p className="text-xs text-success-600">Completed ✓</p>
                      )}
                    </div>
                  </div>
                  {isCurrent && (
                    <button
                      onClick={handleStartLearning}
                      className="btn-primary text-sm py-1 px-3"
                    >
                      Continue
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
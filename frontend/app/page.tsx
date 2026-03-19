// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, Brain, Target, Zap, Trophy, Flame } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState('');

  const handleStart = () => {
    const id = userId || `user_${Date.now()}`;
    localStorage.setItem('userId', id);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">DSA AI Coach</span>
            </div>
            <button
              onClick={handleStart}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master DSA with
            <span className="text-primary-600"> AI-Powered Learning</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Pattern-based approach to ace coding interviews. Get personalized hints, 
            real-time feedback, and track your progress with our AI coach.
          </p>

          <div className="max-w-md mx-auto mb-12">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter your name (optional)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleStart}
                className="btn-primary px-8"
              >
                Start Learning
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">10+</p>
              <p className="text-sm text-gray-600">DSA Patterns</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">80+</p>
              <p className="text-sm text-gray-600">Problems</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">AI</p>
              <p className="text-sm text-gray-600">Powered Hints</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose DSA AI Coach?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Pattern-Based Learning"
            description="Master 10 core patterns that cover 80% of interview questions. Learn intuitively with real-world analogies."
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="AI-Powered Hints"
            description="Get progressive hints from our AI coach. Start with gentle nudges, progress to detailed explanations."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Smart Problem Selection"
            description="AI adapts to your skill level, selecting problems that challenge you without overwhelming."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Instant Feedback"
            description="Run your code against test cases and get immediate feedback on correctness and performance."
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8" />}
            title="Track Progress"
            description="Monitor your improvement across patterns, difficulties, and see detailed statistics."
          />
          <FeatureCard
            icon={<Flame className="w-8 h-8" />}
            title="Build Streaks"
            description="Stay motivated with daily streaks and achievement badges as you progress."
          />
        </div>
      </section>

      {/* Learning Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <StepCard
            number="1"
            title="Learn Pattern"
            description="Understand the intuition behind each DSA pattern with clear explanations"
          />
          <StepCard
            number="2"
            title="Solve Problems"
            description="Apply the pattern to real coding problems with our interactive editor"
          />
          <StepCard
            number="3"
            title="Get AI Hints"
            description="Stuck? Request progressive hints from subtle to detailed guidance"
          />
          <StepCard
            number="4"
            title="Track Growth"
            description="See your progress and weak areas to focus your learning"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Ace Your Interviews?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands learning DSA the smart way
          </p>
          <button
            onClick={handleStart}
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
          >
            Start Learning Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2024 DSA AI Coach. Built with ❤️ for aspiring engineers.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="p-3 bg-primary-100 rounded-lg w-fit mb-4 text-primary-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
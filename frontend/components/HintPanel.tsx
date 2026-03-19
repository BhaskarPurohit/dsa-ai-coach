// components/HintPanel.tsx
'use client';

import React from 'react';
import { Lightbulb, Lock } from 'lucide-react';

interface HintPanelProps {
  hints: Array<{ content: string; level: number }>;
  currentHintLevel: number;
  attemptCount: number;
  onRequestHint: () => void;
  loading?: boolean;
}

export default function HintPanel({ 
  hints, 
  currentHintLevel, 
  attemptCount, 
  onRequestHint,
  loading = false 
}: HintPanelProps) {
  const canRequestHint = attemptCount >= 1;
  const canGetSolution = attemptCount >= 3;

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Hints
        </h3>
        <button
          onClick={onRequestHint}
          disabled={!canRequestHint || loading}
          className={`btn-primary ${!canRequestHint || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Generating...' : 'Request Hint'}
        </button>
      </div>

      {!canRequestHint && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            💡 Try solving the problem first before requesting hints!
          </p>
        </div>
      )}

      {attemptCount > 0 && attemptCount < 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            You need {3 - attemptCount} more attempt(s) before you can request the solution.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {hints.length === 0 ? (
          <p className="text-gray-500 text-sm">No hints requested yet.</p>
        ) : (
          hints.map((hint, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                hint.level === 3 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <Lightbulb className={`w-5 h-5 mt-0.5 ${
                  hint.level === 3 ? 'text-green-600' : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">
                    {hint.level === 3 ? '📝 Solution Approach' : `💡 Hint ${hint.level}`}
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {hint.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {canGetSolution && currentHintLevel < 3 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✅ You've made enough attempts! You can now request the solution approach.
          </p>
        </div>
      )}
    </div>
  );
}
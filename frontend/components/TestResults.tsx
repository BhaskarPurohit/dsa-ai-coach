// components/TestResults.tsx
'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { ExecutionResult } from '@/lib/types';

interface TestResultsProps {
  result: ExecutionResult | null;
}

export default function TestResults({ result }: TestResultsProps) {
  if (!result) return null;

  const allFailed = result.passedTests === 0;
  const somePassed = result.passedTests > 0 && !result.passed;

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Test Results</h3>
        <div className={`badge ${result.passed ? 'badge-easy' : 'badge-hard'}`}>
          {result.passedTests}/{result.totalTests} passed
        </div>
      </div>

      {/* CodeSignal-style: positive framing on failure */}
      {!result.passed && (
        <div className={`rounded-lg p-3 mb-4 text-sm ${
          somePassed
            ? 'bg-amber-50 border border-amber-200 text-amber-800'
            : 'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {somePassed
            ? `Good progress — ${result.passedTests} of ${result.totalTests} cases passing. Check the failing case below.`
            : `No passing cases yet — that's okay. Review the input/output below and look for the pattern.`}
        </div>
      )}
      {result.passed && (
        <div className="rounded-lg p-3 mb-4 text-sm bg-success-50 border border-success-200 text-success-800">
          All test cases passed. Moving to solution analysis...
        </div>
      )}

      <div className="space-y-3">
        {result.results.map((test, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              test.passed
                ? 'bg-success-50 border-success-200'
                : 'bg-danger-50 border-danger-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {test.passed ? (
                <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-danger-600 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-2">
                  Test Case {index + 1}
                </p>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Input:</span>
                    <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                      {JSON.stringify(test.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="font-medium">Expected:</span>
                    <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                      {JSON.stringify(test.expectedOutput, null, 2)}
                    </pre>
                  </div>
                  {!test.passed && (
                    <div>
                      <span className="font-medium">Your Output:</span>
                      <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto">
                        {JSON.stringify(test.actualOutput, null, 2)}
                      </pre>
                    </div>
                  )}
                  {test.error && (
                    <div>
                      <span className="font-medium text-danger-600">Error:</span>
                      <pre className="mt-1 p-2 bg-white rounded text-xs overflow-x-auto text-danger-600">
                        {test.error}
                      </pre>
                    </div>
                  )}
                  {test.executionTime && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{test.executionTime}s</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// app/problem/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentAPI, authAPI } from '@/lib/api';
import CodeEditor from '@/components/CodeEditor';
import HintPanel from '@/components/HintPanel';
import TestResults from '@/components/TestResults';
import { Play, Lightbulb, SkipForward, Home } from 'lucide-react';

export default function ProblemPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestingHint, setRequestingHint] = useState(false);
  
  const [currentPattern, setCurrentPattern] = useState('');
  const [currentProblem, setCurrentProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [messages, setMessages] = useState<any[]>([]);
  const [hints, setHints] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    if (!authAPI.isAuthenticated()) {
      router.push('/auth');
      return;
    }
    initializeSession();
  }, [router]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      const response = await agentAPI.startSession();
      
      setSessionId(response.sessionId);
      setCurrentPattern(response.currentPattern);
      setCurrentProblem(response.currentProblem);
      setMessages(response.messages);
      
      if (response.currentProblem) {
        setCode(response.currentProblem.starterCode[language]);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code first!');
      return;
    }

    try {
      setSubmitting(true);
      setTestResults(null);
      
      const response = await agentAPI.submitCode(sessionId, code, language);
      
      setTestResults(response.executionResult);
      setAttemptCount(response.attemptCount);
      setMessages([...messages, ...response.messages]);
      
      if (response.passed) {
        setTimeout(() => {
          handleNextProblem();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      alert('Failed to submit code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestHint = async () => {
    try {
      setRequestingHint(true);
      const response = await agentAPI.requestHint(sessionId);
      
      setHints([...hints, { content: response.hint.content, level: response.hintLevel }]);
      setHintLevel(response.hintLevel);
    } catch (error) {
      console.error('Error requesting hint:', error);
      alert('Failed to get hint. Please try again.');
    } finally {
      setRequestingHint(false);
    }
  };

  const handleNextProblem = async () => {
    try {
      setLoading(true);
      setTestResults(null);
      setHints([]);
      setAttemptCount(0);
      setHintLevel(0);
      
      const response = await agentAPI.nextProblem(sessionId);
      
      setCurrentProblem(response.currentProblem);
      setCode(response.currentProblem.starterCode[language]);
      setMessages([...messages, ...response.messages]);
    } catch (error) {
      console.error('Error getting next problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang: 'javascript' | 'python') => {
    setLanguage(newLang);
    if (currentProblem) {
      setCode(currentProblem.starterCode[newLang]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your next challenge...</p>
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No problem available</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Home className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm text-gray-600">{currentPattern}</p>
                <h1 className="font-semibold">{currentProblem.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge badge-${currentProblem.difficulty}`}>
                {currentProblem.difficulty}
              </span>
              <button
                onClick={handleNextProblem}
                className="btn-secondary flex items-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem Description */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Problem Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{currentProblem.description}</p>
              </div>

              {currentProblem.examples && currentProblem.examples.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Examples:</h3>
                  <div className="space-y-4">
                    {currentProblem.examples.map((example: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium mb-1">Example {index + 1}:</p>
                        <pre className="text-sm bg-white p-2 rounded mt-2">
                          <strong>Input:</strong> {example.input}
                        </pre>
                        <pre className="text-sm bg-white p-2 rounded mt-2">
                          <strong>Output:</strong> {example.output}
                        </pre>
                        {example.explanation && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Explanation:</strong> {example.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentProblem.constraints && currentProblem.constraints.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Constraints:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {currentProblem.constraints.map((constraint: string, index: number) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Pattern Explanation from AI */}
            {messages.length > 0 && (
              <div className="card">
                <h3 className="font-semibold mb-3">AI Coach</h3>
                <div className="space-y-3">
                  {messages.slice(-3).map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.role === 'assistant'
                          ? 'bg-primary-50 border border-primary-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Code Editor</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('javascript')}
                    className={`px-3 py-1 rounded text-sm ${
                      language === 'javascript'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => handleLanguageChange('python')}
                    className={`px-3 py-1 rounded text-sm ${
                      language === 'python'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Python
                  </button>
                </div>
              </div>

              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-success flex items-center gap-2 flex-1"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Submit Code
                    </>
                  )}
                </button>
                <button
                  onClick={handleRequestHint}
                  disabled={requestingHint}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  Hint
                </button>
              </div>

              {attemptCount > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  Attempts: {attemptCount}
                </div>
              )}
            </div>

            {/* Test Results */}
            {testResults && <TestResults result={testResults} />}

            {/* Hints */}
            <HintPanel
              hints={hints}
              currentHintLevel={hintLevel}
              attemptCount={attemptCount}
              onRequestHint={handleRequestHint}
              loading={requestingHint}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
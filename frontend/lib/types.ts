// lib/types.ts
export interface Problem {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pattern: string;
  topic: string;
  description: string;
  constraints?: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: Array<{
    input: any;
    expectedOutput: any;
  }>;
  starterCode: {
    javascript: string;
    python: string;
  };
  hints: string[];
  tags: string[];
}

export interface Progress {
  userId: string;
  patternsCompleted: string[];
  currentPattern: string | null;
  problemsSolved: number[];
  weakPatterns: string[];
  totalHintsUsed: number;
  streak: number;
  lastActive: Date;
  statistics: {
    totalProblems: number;
    easyProblems: number;
    mediumProblems: number;
    hardProblems: number;
    averageHintsPerProblem: number;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ExecutionResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  results: Array<{
    passed: boolean;
    input: any;
    expectedOutput: any;
    actualOutput: any;
    error?: string;
    executionTime?: string;
  }>;
}
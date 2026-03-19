// backend/src/models/Problem.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface TestCase {
  input: any;
  expectedOutput: any;
  explanation?: string;
}

export interface StarterCode {
  javascript: string;
  python: string;
}

export interface Solution {
  javascript: string;
  python: string;
}

export interface IProblem extends Document {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pattern: string;
  topic: string;
  order: number;
  leetcodeLink?: string;
  description: string;
  constraints?: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: TestCase[];
  starterCode: StarterCode;
  solution: Solution;
  timeComplexity: string;
  spaceComplexity: string;
  hints: string[];
  tags: string[];
  companies?: string[];
}

const ProblemSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  pattern: { type: String, required: true },
  topic: { type: String, required: true },
  order: { type: Number, required: true },
  leetcodeLink: { type: String },
  description: { type: String, required: true },
  constraints: [{ type: String }],
  examples: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String }
  }],
  testCases: [{
    input: { type: Schema.Types.Mixed, required: true },
    expectedOutput: { type: Schema.Types.Mixed, required: true },
    explanation: { type: String }
  }],
  starterCode: {
    javascript: { type: String, required: true },
    python: { type: String, required: true }
  },
  solution: {
    javascript: { type: String, required: true },
    python: { type: String, required: true }
  },
  timeComplexity: { type: String, required: true },
  spaceComplexity: { type: String, required: true },
  hints: [{ type: String }],
  tags: [{ type: String }],
  companies: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.model<IProblem>('Problem', ProblemSchema);
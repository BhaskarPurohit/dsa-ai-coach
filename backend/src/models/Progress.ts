// backend/src/models/Progress.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProgress extends Document {
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
  attemptHistory: Array<{
    problemId: number;
    attempts: number;
    hintsUsed: number;
    solved: boolean;
    solvedAt?: Date;
  }>;
}

const ProgressSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  patternsCompleted: [{ type: String }],
  currentPattern: { type: String, default: null },
  problemsSolved: [{ type: Number }],
  weakPatterns: [{ type: String }],
  totalHintsUsed: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  statistics: {
    totalProblems: { type: Number, default: 0 },
    easyProblems: { type: Number, default: 0 },
    mediumProblems: { type: Number, default: 0 },
    hardProblems: { type: Number, default: 0 },
    averageHintsPerProblem: { type: Number, default: 0 }
  },
  attemptHistory: [{
    problemId: { type: Number, required: true },
    attempts: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    solved: { type: Boolean, default: false },
    solvedAt: { type: Date }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IProgress>('Progress', ProgressSchema);
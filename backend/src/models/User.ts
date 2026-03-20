// backend/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  email: string;
  name: string;
  passwordHash?: string;
  profilePicture?: string;
  preferences: {
    language: 'javascript' | 'python';
    theme: 'light' | 'dark';
    difficulty: 'easy' | 'medium' | 'hard';
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String },
  profilePicture: { type: String },
  preferences: {
    language: { type: String, enum: ['javascript', 'python'], default: 'javascript' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' }
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
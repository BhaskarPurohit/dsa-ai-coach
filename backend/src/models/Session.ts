// backend/src/models/Session.ts
import mongoose, { Schema, Document } from 'mongoose';
import { AgentStateType } from '../agent/state';

export interface ISession extends Document {
  sessionId: string;
  userId: string;
  state: AgentStateType;
  expiresAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    state: { type: Schema.Types.Mixed, required: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  },
  { timestamps: true }
);

// MongoDB TTL index — automatically deletes expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ISession>('Session', SessionSchema);

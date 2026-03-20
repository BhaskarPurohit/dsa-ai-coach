// backend/src/services/session.service.ts
import Session from '../models/Session';
import { AgentStateType } from '../agent/state';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const sessionService = {
  async get(sessionId: string): Promise<AgentStateType | null> {
    const session = await Session.findOne({ sessionId });
    if (!session) return null;
    return session.state as AgentStateType;
  },

  async set(sessionId: string, userId: string, state: AgentStateType): Promise<void> {
    await Session.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        userId,
        state,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
      { upsert: true, new: true }
    );
  },

  async delete(sessionId: string): Promise<void> {
    await Session.deleteOne({ sessionId });
  },
};

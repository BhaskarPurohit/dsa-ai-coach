// backend/src/agent/state.ts
import { Annotation } from '@langchain/langgraph';

export const AgentState = Annotation.Root({
  userId: Annotation<string>,
  sessionId: Annotation<string>,
  currentPattern: Annotation<string | null>,
  currentProblem: Annotation<any | null>,
  userCode: Annotation<string | null>,
  language: Annotation<'javascript' | 'python'>,
  attemptCount: Annotation<number>,
  hintLevel: Annotation<number>,
  executionResult: Annotation<any | null>,
  nextAction: Annotation<string>,
  conversationHistory: Annotation<Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>>,
  userProgress: Annotation<any>,
  patternExplanationGiven: Annotation<boolean>,
  // CodeSignal-inspired additions
  masteryLevel: Annotation<'developing' | 'proficient' | 'advanced' | 'expert'>,
  codeHistory: Annotation<Array<{
    code: string;
    result: any;
    attemptNum: number;
    timestamp: Date;
  }>>,
});

export type AgentStateType = typeof AgentState.State;
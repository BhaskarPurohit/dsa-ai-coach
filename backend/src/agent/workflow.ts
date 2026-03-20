// backend/src/agent/workflow.ts
import { StateGraph, END, START } from '@langchain/langgraph';
import { AgentState, AgentStateType } from './state';
import {
  selectPatternNode,
  explainPatternNode,
  selectProblemNode,
  runCodeNode,
  provideFeedbackNode,
  generateHintNode,
  analyzeSolutionNode,
  waitForAttemptNode
} from './nodes';

// Chain addNode calls — LangGraph accumulates node name types via return type
// so edges can be type-checked against the full node union.
const workflow = new StateGraph(AgentState)
  .addNode('selectPattern', selectPatternNode)
  .addNode('explainPattern', explainPatternNode)
  .addNode('selectProblem', selectProblemNode)
  .addNode('waitForAttempt', waitForAttemptNode)
  .addNode('runCode', runCodeNode)
  .addNode('provideFeedback', provideFeedbackNode)
  .addNode('generateHint', generateHintNode)
  .addNode('analyzeSolution', analyzeSolutionNode);

// Entry point
workflow.addEdge(START, 'selectPattern');

// Linear edges
workflow.addEdge('selectPattern', 'explainPattern');
workflow.addEdge('explainPattern', 'selectProblem');
workflow.addEdge('selectProblem', 'waitForAttempt');

// Conditional edges based on nextAction
workflow.addConditionalEdges(
  'waitForAttempt',
  (state: AgentStateType) => state.nextAction,
  {
    'RUN_CODE': 'runCode',
    'GENERATE_HINT': 'generateHint',
    'SELECT_PROBLEM': 'selectProblem',
    'WAIT_FOR_ATTEMPT': 'waitForAttempt'
  }
);

workflow.addConditionalEdges(
  'runCode',
  (state: AgentStateType) => state.nextAction,
  {
    'ANALYZE_SOLUTION': 'analyzeSolution',
    'PROVIDE_FEEDBACK': 'provideFeedback'
  }
);

workflow.addEdge('provideFeedback', 'waitForAttempt');
workflow.addEdge('generateHint', 'waitForAttempt');

workflow.addConditionalEdges(
  'analyzeSolution',
  (state: AgentStateType) => state.nextAction,
  {
    'SELECT_PROBLEM': 'selectProblem',
    'SELECT_PATTERN': 'selectPattern'
  }
);

// Compile the workflow
export const agentWorkflow = workflow.compile();

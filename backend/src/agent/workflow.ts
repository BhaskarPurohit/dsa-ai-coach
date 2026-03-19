// backend/src/agent/workflow.ts
import { StateGraph, END } from '@langchain/langgraph';
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

// Create the workflow graph
const workflow = new StateGraph(AgentState);

// Add nodes
workflow.addNode('selectPattern', selectPatternNode);
workflow.addNode('explainPattern', explainPatternNode);
workflow.addNode('selectProblem', selectProblemNode);
workflow.addNode('waitForAttempt', waitForAttemptNode);
workflow.addNode('runCode', runCodeNode);
workflow.addNode('provideFeedback', provideFeedbackNode);
workflow.addNode('generateHint', generateHintNode);
workflow.addNode('analyzeSolution', analyzeSolutionNode);

// Define the workflow edges
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

// Set entry point
workflow.setEntryPoint('selectPattern');

// Compile the workflow
export const agentWorkflow = workflow.compile();
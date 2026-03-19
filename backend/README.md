# DSA AI Coach - Backend

Backend API server for the DSA AI Coach platform.

## Architecture

### Agent System (LangGraph)

The core of the backend is an AI agent built with LangGraph that guides users through DSA learning:
```
User Input → Agent Workflow → Tools → Claude API → Response
```

**Agent States:**
- SELECT_PATTERN: Choose next pattern to learn
- EXPLAIN_PATTERN: Provide pattern explanation
- SELECT_PROBLEM: Pick appropriate problem
- WAIT_FOR_ATTEMPT: Wait for user code
- RUN_CODE: Execute and test code
- PROVIDE_FEEDBACK: Give test results
- GENERATE_HINT: Create progressive hints
- ANALYZE_SOLUTION: Review correct solution

**Agent Tools:**
- `getNextProblemTool`: Fetch problems based on progress
- `runCodeTool`: Execute code via Judge0
- `generateHintTool`: Create AI hints
- `explainPatternTool`: RAG-based explanations
- `analyzeSolutionTool`: Code review
- `updateProgressTool`: Track user progress

### Services

**Claude Service:**
- Generates hints
- Explains patterns
- Analyzes solutions
- Uses Claude 3.5 Sonnet

**Judge0 Service:**
- Executes user code
- Runs test cases
- Returns results with timing

**RAG Service:**
- Stores pattern knowledge in Weaviate
- Retrieves relevant information
- Enhances AI responses

## API Documentation

See main README for endpoint details.

## Database Schema

**Problems Collection:**
```typescript
{
  id: number,
  title: string,
  difficulty: 'easy' | 'medium' | 'hard',
  pattern: string,
  description: string,
  testCases: Array,
  starterCode: Object,
  solution: Object,
  hints: Array
}
```

**Progress Collection:**
```typescript
{
  userId: string,
  problemsSolved: Array,
  patternsCompleted: Array,
  statistics: Object,
  streak: number
}
```

## Development
```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Seed database
npm run seed
```

## Environment Variables

Required variables in `.env`:
- `MONGODB_URI`: MongoDB connection string
- `ANTHROPIC_API_KEY`: Claude API key
- `JUDGE0_API_KEY`: Judge0 API key
- `WEAVIATE_URL`: Weaviate endpoint

## Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```
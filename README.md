# DSA AI Coach

An AI-powered platform for mastering Data Structures and Algorithms through pattern-based learning.

## Features

- 🧠 **AI-Powered Learning**: Get personalized hints and explanations from Claude AI
- 📊 **Pattern-Based Approach**: Master 10 core DSA patterns covering 80% of interview questions
- 💻 **Interactive Code Editor**: Write and test your code in real-time
- 📈 **Progress Tracking**: Monitor your improvement with detailed statistics
- 🔥 **Streak System**: Stay motivated with daily streaks
- ⚡ **Instant Feedback**: Run code against test cases immediately
- 🎯 **Adaptive Difficulty**: Problems scale based on your progress

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- MongoDB (database)
- Weaviate (vector database for RAG)
- LangGraph (AI agent workflow)
- Claude API (LLM)
- Judge0 (code execution)

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- CodeMirror (code editor)

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Docker (for Weaviate)
- Anthropic API key
- Judge0 API key (from RapidAPI)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dsa-ai-coach
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set Up Weaviate (Vector Database)
```bash
# Run Weaviate with Docker
docker run -d \
  -p 8080:8080 \
  -e QUERY_DEFAULTS_LIMIT=25 \
  -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
  -e PERSISTENCE_DATA_PATH='/var/lib/weaviate' \
  -e DEFAULT_VECTORIZER_MODULE='text2vec-transformers' \
  -e ENABLE_MODULES='text2vec-transformers' \
  -e TRANSFORMERS_INFERENCE_API='http://t2v-transformers:8080' \
  --name weaviate \
  semitechnologies/weaviate:latest
```

### 4. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install and start MongoDB
mongod --dbpath /path/to/data
```

**Option B: MongoDB Atlas**
- Create a free cluster at mongodb.com/cloud/atlas
- Get your connection string

### 5. Get API Keys

**Anthropic API Key:**
1. Go to https://console.anthropic.com
2. Create an account and get API key
3. Free tier available

**Judge0 API Key:**
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Subscribe to free tier
3. Get your API key

### 6. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/dsa-coach
ANTHROPIC_API_KEY=your_anthropic_key_here
JUDGE0_API_KEY=your_judge0_key_here
JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
WEAVIATE_URL=http://localhost:8080
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 7. Seed the Database
```bash
# From backend directory
cd backend

# Import problems
npm run seed

# This will:
# - Connect to MongoDB
# - Import DSA problems
# - Seed pattern knowledge in Weaviate
```

### 8. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 9. Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Project Structure
```
dsa-ai-coach/
├── backend/
│   ├── src/
│   │   ├── agent/          # LangGraph agent logic
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # External services
│   │   ├── scripts/        # Database seeding
│   │   └── server.ts       # Main server
│   └── package.json
│
├── frontend/
│   ├── app/                # Next.js pages
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   └── package.json
│
└── README.md
```

## Usage

1. **Start Learning**: Click "Get Started" on the home page
2. **Learn Pattern**: Read the AI-generated pattern explanation
3. **Solve Problem**: Write code in the interactive editor
4. **Get Hints**: Request progressive hints if stuck (after 1 attempt)
5. **Submit Code**: Run against test cases for instant feedback
6. **Track Progress**: Monitor your improvement on the dashboard

## API Endpoints

### Agent Routes
- `POST /api/agent/start-session` - Start a new learning session
- `POST /api/agent/submit-code` - Submit code for evaluation
- `POST /api/agent/request-hint` - Request a hint
- `GET /api/agent/session/:sessionId` - Get session state
- `POST /api/agent/next-problem` - Get next problem

### Problem Routes
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get problem by ID
- `GET /api/problems/pattern/:pattern` - Get problems by pattern

### Progress Routes
- `GET /api/progress/:userId` - Get user progress
- `GET /api/progress/:userId/stats` - Get detailed statistics
- `POST /api/progress/:userId/streak` - Update streak

## Troubleshooting

### Weaviate Connection Issues
```bash
# Check if Weaviate is running
curl http://localhost:8080/v1/.well-known/ready

# Restart Weaviate
docker restart weaviate
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"
```

### Judge0 Rate Limits
- Free tier: 50 requests/day
- Consider upgrading or implementing caching

## Development

### Adding New Problems

Edit `backend/src/scripts/importProblems.ts`:
```typescript
const newProblem = {
  id: 4,
  title: "Your Problem",
  difficulty: "medium",
  pattern: "Arrays & Hashing",
  // ... rest of problem data
};
```

Run:
```bash
cd backend
npm run seed
```

### Adding New Patterns

Edit `backend/src/scripts/seedPatterns.ts` and add pattern knowledge.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API logs

## Roadmap

- [ ] Add more DSA problems (100+)
- [ ] Multi-language support (Java, C++, Go)
- [ ] Video explanations
- [ ] Interview preparation mode
- [ ] Company-specific problem sets
- [ ] Code review feature
- [ ] Peer comparison
- [ ] Mobile app

---

Built with ❤️ for aspiring software engineers
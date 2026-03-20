# DSA AI Coach

An AI-powered, pattern-based DSA learning platform. Instead of topic-based drill (Arrays → Linked Lists → Trees), you learn **algorithmic patterns** — Two Pointers, Sliding Window, Kadane's Algorithm, Fast & Slow Pointers, etc. — the same mental models that crack FAANG interviews.

---

## Why Pattern-Based Learning?

| Platform | Approach | Problem |
|----------|----------|---------|
| LeetCode | Topic drill | No pattern recognition guidance |
| NeetCode | Curated list | Still topic-based, no AI coaching |
| AlgoExpert | Video explanations | Passive learning, no adaptive feedback |
| **DSA AI Coach** | **Pattern-first + AI agent** | **Active coaching, Socratic hints, adapts to you** |

**Key differentiators:**
- AI coach that gives Socratic hints (never just gives the answer)
- Learns your weak patterns and surfaces them more
- Freemium with 3 free patterns — pay once, own it
- RAG-powered explanations from curated Google Sheets + YouTube transcripts
- Code execution via Judge0 (sandboxed, multi-language)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js 14 Frontend                  │
│  /auth  /dashboard  /problem  /patterns  /pricing        │
└──────────────────────┬──────────────────────────────────┘
                       │ REST (JWT)
┌──────────────────────▼──────────────────────────────────┐
│                  Express.js + TypeScript                  │
│  /api/auth   /api/agent   /api/payments   /api/patterns  │
└──────┬───────────────┬──────────────────┬───────────────┘
       │               │                  │
┌──────▼──────┐ ┌──────▼──────┐ ┌────────▼────────┐
│  MongoDB    │ │  Weaviate   │ │  Judge0 (code   │
│  (primary)  │ │  (vector)   │ │   execution)    │
└─────────────┘ └─────────────┘ └─────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│              LangGraph Agent (Claude 3.5 Sonnet)         │
│  selectPattern → explainPattern → presentProblem         │
│  evaluateCode → giveHint → trackProgress → end           │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| Next.js | 14.1 | App Router, SSR/SSG |
| Tailwind CSS | 3.4 | Utility-first styling |
| Monaco Editor | latest | In-browser code editor |
| Lucide React | latest | Icons |

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| Express.js | 4.x | HTTP server |
| TypeScript | 5.x | Type safety |
| LangGraph | 0.1.9 | Stateful AI agent workflow |
| LangChain Anthropic | 0.2.x | Claude 3.5 Sonnet integration |
| Mongoose | 8.x | MongoDB ODM |
| Weaviate Client | 2.x | Vector DB for RAG |
| Judge0 CE | self-hosted | Sandboxed code execution |
| bcryptjs | 2.x | Password hashing |
| jsonwebtoken | 9.x | JWT auth |
| Stripe | 14.x | Payments |

### Infrastructure
| Service | Purpose |
|---------|---------|
| MongoDB Atlas / local | User data, progress, sessions |
| Weaviate | Pattern knowledge embeddings |
| Redis (planned) | Hot session cache |
| Vercel | Frontend hosting |
| Railway / Fly.io | Backend hosting |
| Docker Compose | Local dev |

---

## Database Schema

### `users` collection
```typescript
{
  _id: ObjectId,
  email: string,           // unique index
  passwordHash: string,
  name: string,
  createdAt: Date,

  // Freemium
  plan: {
    type: 'trial' | 'pro' | 'lifetime',
    stripeCustomerId?: string,
    stripeSubscriptionId?: string,
    trialPatternsUsed: string[],  // pattern IDs unlocked in trial
    activatedAt?: Date,
    expiresAt?: Date,
  },

  // Progress
  currentPattern: string,
  completedPatterns: string[],
  totalSolved: number,
  streak: number,
  lastActiveAt: Date,
}
```
**Indexes:** `email` (unique), `plan.type`, `lastActiveAt`

### `problems` collection
```typescript
{
  _id: ObjectId,
  patternId: string,         // e.g. 'two-pointers'
  title: string,
  difficulty: 'easy' | 'medium' | 'hard',
  description: string,
  examples: [{ input, output, explanation }],
  constraints: string[],
  starterCode: { javascript: string, python: string },
  testCases: [{ input: any, expectedOutput: any, isHidden: boolean }],
  hints: [{ level: 1|2|3, content: string }],
  solution: { javascript: string, python: string },
  order: number,             // within pattern
  tags: string[],
}
```
**Indexes:** `patternId + order` (compound), `difficulty`

### `progress` collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users
  problemId: ObjectId,       // ref: problems
  patternId: string,
  status: 'attempted' | 'solved' | 'skipped',
  attempts: number,
  hintsUsed: number,
  solvedAt?: Date,
  lastAttemptAt: Date,
  code?: string,             // last submitted code
  language?: string,
  timeSpentMs?: number,
}
```
**Indexes:** `userId + problemId` (unique compound), `userId + patternId`, `userId + status`

### `sessions` collection
```typescript
{
  _id: ObjectId,
  sessionId: string,         // unique index
  userId: string,
  state: Mixed,              // LangGraph agent state
  expiresAt: Date,           // TTL index, auto-deletes
}
```
**Indexes:** `sessionId` (unique), `userId`, `expiresAt` (TTL, expireAfterSeconds: 0)

### `payments` collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  stripePaymentIntentId: string,
  stripeCustomerId: string,
  amount: number,            // cents
  currency: string,
  status: 'pending' | 'succeeded' | 'failed' | 'refunded',
  plan: 'pro_monthly' | 'pro_annual' | 'lifetime',
  createdAt: Date,
}
```

---

## Freemium Model

| Feature | Trial | Pro ($9/mo or $79/yr) |
|---------|-------|----------------------|
| Patterns accessible | 3 (Two Pointers, Sliding Window, BFS/DFS) | All 20+ patterns |
| Problems per pattern | Unlimited | Unlimited |
| AI hints | 3 per problem | Unlimited |
| Code execution | Yes | Yes |
| Progress tracking | Yes | Yes |
| Pattern explanations (RAG) | Yes | Yes |

**Access control:** `planGate.middleware.ts` checks `req.userId` → user's `plan.type` → if trial, verify `trialPatternsUsed` length < 3 before unlocking new pattern.

---

## Stripe Payment Flow

```
1. User clicks "Upgrade to Pro" on /pricing
2. Frontend: POST /api/payments/create-checkout-session
3. Backend: stripe.checkout.sessions.create({ ... })
4. Redirect to Stripe Checkout hosted page
5. User pays
6. Stripe webhook: POST /api/payments/webhook
7. Backend: verify signature → update user.plan.type = 'pro'
8. Redirect to /dashboard?upgraded=true
```

**Webhook events handled:**
- `checkout.session.completed` — activate pro plan
- `customer.subscription.deleted` — downgrade to trial
- `invoice.payment_failed` — email user (future)

---

## RAG Pipeline

### Ingestion (run once / on update)
```
Google Sheet (pattern metadata, problem links)
    ↓ googleapis SDK
    ↓ Parse rows → PatternKnowledge[]

YouTube playlist (pattern explanations)
    ↓ youtube-transcript-api
    ↓ Extract transcript text per video

Combined documents
    ↓ LangChain RecursiveCharacterTextSplitter (chunk: 500, overlap: 50)
    ↓ Weaviate text2vec-transformers (all-MiniLM-L6-v2)
    ↓ Store in Weaviate class "PatternKnowledge"
```

Run: `npm run seed:patterns` (from backend directory)

### Query (per request)
```
User question / pattern name
    ↓ Weaviate nearText search (top 3 chunks)
    ↓ Inject into LangGraph explainPattern node prompt
    ↓ Claude 3.5 Sonnet generates explanation
```

---

## LangGraph Agent Design

### State
```typescript
interface AgentState {
  userId: string;
  sessionId: string;
  currentPattern: string;
  currentProblem: Problem | null;
  userCode: string;
  language: 'javascript' | 'python';
  messages: BaseMessage[];
  hints: Hint[];
  hintLevel: number;
  attemptCount: number;
  passed: boolean;
  executionResult: ExecutionResult | null;
  patternContext: string;      // RAG-retrieved content
  action: AgentAction;
}
```

### Node Graph
```
START
  │
  ▼
selectPattern ──────── [RAG: fetch pattern context]
  │                     [DB: get user's current pattern]
  ▼
explainPattern ─────── [Claude: generate Socratic intro]
  │                     [RAG: inject pattern knowledge]
  ▼
presentProblem ──────── [DB: select next problem for user]
  │
  ▼ (user submits code)
evaluateCode ───────── [Judge0: run test cases]
  │
  ├── passed=true ──→ trackProgress ──→ END
  │
  └── passed=false
        │
        ├── attemptCount < 3 ──→ END (return feedback)
        │
        └── attemptCount >= 3 ──→ giveHint ──→ END
              │
              └── hintLevel 1→2→3 (Socratic → pseudocode → solution)
```

### Conditional Edge Logic
```typescript
function routeAfterEval(state: AgentState): string {
  if (state.passed) return 'trackProgress';
  if (state.attemptCount >= 3) return 'giveHint';
  return END;
}
```

---

## API Surface

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Create account |
| POST | `/api/auth/login` | None | Get JWT token |

### Agent
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/agent/session/start` | JWT | Start/resume session |
| POST | `/api/agent/session/:id/submit` | JWT | Submit code |
| POST | `/api/agent/session/:id/hint` | JWT | Request hint |
| POST | `/api/agent/session/:id/next` | JWT | Skip to next problem |

### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payments/create-checkout-session` | JWT | Stripe checkout |
| POST | `/api/payments/webhook` | Stripe sig | Handle events |
| GET | `/api/payments/status` | JWT | Current plan status |

### Patterns
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/patterns` | JWT | List all patterns + lock status |
| GET | `/api/patterns/:id` | JWT | Pattern detail + problems |
| GET | `/api/patterns/:id/progress` | JWT | User progress for pattern |

### Progress
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/progress/stats` | JWT | Dashboard stats |
| GET | `/api/progress/history` | JWT | Solved problems history |

---

## Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop
- npm 10+

### Setup

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/dsa-ai-coach.git
cd dsa-ai-coach

# Install all dependencies
npm install

# Start infrastructure (MongoDB + Weaviate)
docker compose up -d

# Backend setup
cd backend
cp .env.example .env   # fill in ANTHROPIC_API_KEY, JWT_SECRET
npm run seed:patterns  # load pattern knowledge into Weaviate
npm run dev

# Frontend setup (separate terminal)
cd frontend
cp .env.example .env   # set NEXT_PUBLIC_API_URL=http://localhost:3001
npx next dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001
Weaviate: http://localhost:8080

### Environment Variables

**backend/.env**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/dsa-coach
WEAVIATE_URL=http://localhost:8080
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=your-long-random-secret
JUDGE0_API_URL=http://localhost:2358
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**frontend/.env**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Project Structure

```
dsa-ai-coach/
├── backend/
│   ├── src/
│   │   ├── agent/              # LangGraph workflow + nodes + tools
│   │   │   ├── workflow.ts     # StateGraph definition
│   │   │   ├── nodes.ts        # Node implementations
│   │   │   └── tools.ts        # Agent tools (code eval, hints)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verification
│   │   │   └── planGate.middleware.ts # Freemium access control
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Problem.ts
│   │   │   ├── Progress.ts
│   │   │   ├── Session.ts      # MongoDB TTL sessions
│   │   │   └── Payment.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── agent.routes.ts
│   │   │   ├── patterns.routes.ts
│   │   │   ├── progress.routes.ts
│   │   │   └── payment.routes.ts
│   │   ├── services/
│   │   │   ├── rag.service.ts       # Weaviate vector search
│   │   │   ├── session.service.ts   # MongoDB session CRUD
│   │   │   ├── judge0.service.ts    # Code execution
│   │   │   └── stripe.service.ts   # Payment processing
│   │   ├── scripts/
│   │   │   ├── seedPatterns.ts     # RAG ingestion
│   │   │   └── seedProblems.ts     # Problem seeding
│   │   └── server.ts
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── auth/page.tsx        # Login / Register
│   │   ├── dashboard/page.tsx   # Main dashboard
│   │   ├── problem/page.tsx     # Problem solving interface
│   │   ├── patterns/page.tsx    # Pattern explorer
│   │   ├── pricing/page.tsx     # Upgrade page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── CodeEditor.tsx
│   │   ├── HintPanel.tsx
│   │   ├── ProgressTracker.tsx
│   │   └── TestResults.tsx
│   ├── lib/
│   │   └── api.ts               # JWT-aware API client
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Deployment

### Production Stack
| Service | Provider | Notes |
|---------|----------|-------|
| Frontend | Vercel | Auto-deploy from `main` |
| Backend | Railway / Fly.io | Dockerfile in `/backend` |
| MongoDB | MongoDB Atlas (M10+) | Enable indexing |
| Weaviate | Weaviate Cloud | Or self-host on Railway |
| Judge0 | Self-host on Fly.io | Or RapidAPI hosted |

### Deploy
```bash
# Frontend (Vercel)
cd frontend && vercel --prod

# Backend (Railway)
railway up
```

---

## Development Roadmap

### Phase 0 — Foundation (complete)
- [x] Next.js 14 + Tailwind CSS
- [x] Express.js + TypeScript backend
- [x] MongoDB models (User, Session, Problem, Progress)
- [x] JWT authentication (register / login)
- [x] LangGraph agent workflow (chained nodes)
- [x] Judge0 code execution
- [x] Weaviate RAG service
- [x] Docker Compose local dev
- [x] Dashboard UI redesign
- [x] MongoDB session persistence (TTL)
- [x] Auth middleware + protected routes

### Phase 1 — Core Product
- [ ] Freemium access control (`planGate.middleware.ts`)
- [ ] Pattern explorer page (`/patterns`)
- [ ] Stripe payment integration + pricing page
- [ ] RAG ingestion pipeline (Google Sheets + YouTube)
- [ ] Problem seeding (20+ problems across 5 patterns)
- [ ] Rate limiting + Zod request validation

### Phase 2 — Growth
- [ ] Redis session cache (hot path)
- [ ] Email verification + password reset
- [ ] Google OAuth
- [ ] Leaderboard / community
- [ ] Spaced repetition difficulty adjustment

### Phase 3 — Scale
- [ ] Mobile app (React Native)
- [ ] Team / enterprise plans
- [ ] Interview simulator (timed, no hints)
- [ ] Company-specific problem sets

---

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

MIT

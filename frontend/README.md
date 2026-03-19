# DSA AI Coach - Frontend

Next.js frontend for the DSA AI Coach platform.

## Features

- **Interactive Code Editor**: CodeMirror with syntax highlighting
- **Real-time Feedback**: Instant test results
- **Progress Dashboard**: Track your learning journey
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Support**: Eye-friendly coding

## Components

### Core Components

**CodeEditor**
- Syntax highlighting for JS/Python
- Line numbers and bracket matching
- Auto-completion
- Theme: One Dark

**HintPanel**
- Progressive hint display
- Attempt tracking
- Solution unlock logic

**ProgressTracker**
- Visual progress bars
- Statistics cards
- Streak display

**TestResults**
- Test case results
- Error messages
- Execution time

### Pages

**Home (`/`)**
- Landing page
- Feature showcase
- Get started flow

**Dashboard (`/dashboard`)**
- Progress overview
- Pattern completion
- Quick actions

**Problem (`/problem`)**
- Problem description
- Code editor
- Hint system
- Test execution

## Styling

Built with Tailwind CSS:
- Utility-first approach
- Custom color scheme
- Responsive breakpoints
- Animation utilities

## State Management

Using React hooks:
- `useState` for local state
- `useEffect` for side effects
- `useRouter` for navigation
- No external state library needed

## API Integration

See `lib/api.ts` for API client:
- Axios-based
- Type-safe
- Error handling
- Response transformation

## Development
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
# Build image
docker build -t dsa-coach-frontend .

# Run container
docker run -p 3000:3000 dsa-coach-frontend
```

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
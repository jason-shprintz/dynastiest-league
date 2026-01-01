# dynastiest-league

The Official Page for the Dynastiest League

## About

A fantasy football league landing page built with Vite, React, and TypeScript. Features include:

- Hall of Records showcasing past champions
- Current Champion spotlight
- League Constitution with rules and regulations
- Blog section for news and updates
- **Breaking News with AI Trade Analysis** - Powered by Cloudflare Workers and OpenAI
- Fully responsive design for desktop, tablet, and mobile devices

## AI Trade Analyzer

The Breaking News page features AI-powered trade analysis using:
- **Cloudflare Workers** - Serverless backend for API and scheduled jobs
- **D1 Database** - Stores cached analyses (one per trade)
- **OpenAI GPT-4o-mini** - Generates snarky, in-depth analysis as a conversation between two talking heads (Mike & Jim)

When a trade happens in your Sleeper league, the worker automatically:
1. Polls for new trades every 5 minutes
2. Generates analysis with grades, impact assessment, and commentary
3. Caches the result so all users see the same analysis

See [DEPLOYMENT.md](./DEPLOYMENT.md) for setup instructions.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### macOS `._*` files (AppleDouble)

On macOS (especially when working from an external drive), Finder can create `._*` “AppleDouble” metadata files alongside real files. If these get picked up by build tooling (Metro/Xcode/Gradle) or accidentally committed, they can cause confusing build/runtime issues.

This repo ignores them via `.gitignore`, and also includes a cleanup script to remove any that already exist:

```sh
npm run clean:appledouble
```

## Tech Stack

- React 19
- TypeScript 5
- Vite 7
- MobX 6 (State Management)
- Styled Components
- Cloudflare Workers (Serverless API)
- Cloudflare D1 (SQLite Database)
- OpenAI API (GPT-4o-mini)
- CSS3 with responsive design
- ESLint for code quality

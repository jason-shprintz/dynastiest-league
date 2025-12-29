# dynastiest-league

The Official Page for the Dynastiest League

## About

A fantasy football league landing page built with Vite, React, and TypeScript. Features include:

- Hall of Records showcasing past champions
- Current Champion spotlight
- League Constitution with rules and regulations
- Blog section for news and updates
- Fully responsive design for desktop, tablet, and mobile devices

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
- CSS3 with responsive design
- ESLint for code quality

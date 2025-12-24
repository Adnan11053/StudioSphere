# Development Setup

This project uses **Next.js** as the primary framework with **Vite** available for tooling and optimization.

## Quick Start

### Install Dependencies
```bash
pnpm install
```

### Development Server

**Recommended (Next.js with Turbopack - Fastest):**
```bash
pnpm dev
```
This uses Next.js with Turbopack enabled for the fastest development experience.

**Alternative (Standard Next.js):**
```bash
pnpm dev:next
```

**Vite (for tooling/testing):**
```bash
pnpm dev:vite
```
Note: Vite is configured but the app structure is built for Next.js. Use this for specific tooling needs.

## Available Scripts

- `pnpm dev` - Start Next.js dev server with Turbopack (recommended)
- `pnpm dev:next` - Start standard Next.js dev server
- `pnpm dev:vite` - Start Vite dev server (port 3001)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Performance

- **Turbopack** (enabled by default) provides faster HMR and builds than standard webpack
- **Vite** is included for potential tooling, testing, or future migration needs
- Both are optimized for fast development experience

## Environment Variables

Make sure to set up your `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```


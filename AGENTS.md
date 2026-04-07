# DesignGravity — Claude Code Agent Configuration

## Project
DesignGravity is a full-stack AI Creative Suite SaaS application.
Framework: Next.js 14 App Router, TypeScript strict mode.
Backend: Insforge.dev exclusively — no other database or backend service.
UI: Tailwind CSS + Shadcn/UI + Radix UI.

## Architecture
- /src/app/(auth)/ — authentication pages
- /src/app/(dashboard)/ — main application pages
- /src/app/api/ — API routes, all proxy to Insforge.dev
- /src/components/editor/ — canvas editor components
- /src/components/modules/ — feature module components
- /src/components/ui/ — shared base UI components
- /src/lib/insforge/ — Insforge.dev SDK wrapper
- /src/lib/canvas/ — Fabric.js canvas engine utilities
- /src/lib/ai/ — AI prompt builders and model routers
- /src/lib/export/ — export pipeline for all formats
- /src/stores/ — Zustand state stores
- /src/hooks/ — custom React hooks
- /src/types/ — TypeScript type definitions

## Critical Rules
- NEVER use any in TypeScript — always use explicit types
- NEVER hardcode API keys — use Insforge Vault only
- NEVER let modules import from each other directly — use Event Bus
- ALWAYS mobile-first starting at 375px
- ALWAYS feature flag every feature before rendering
- INSFORGE.DEV IS THE ONLY BACKEND — non-negotiable
- NEVER create birthday cards that look like obituaries — always joyful and vibrant
- NEVER auto-trigger voice features — user-initiated only

## Color Palette
- Primary: #7C3AED (Violet)
- Accent: #F59E0B (Amber)
- Background: #0A0A0F (near-black)
- Surface: #141420
- Border: #2A2A3E
- Text Primary: #F8F8FC
- Text Secondary: #9090A8

## How to Run
- Dev: npm run dev
- Build: npm run build
- Type check: npm run typecheck
- Validate: npx ts-node scripts/validate-safe-delete.ts

## Insforge.dev Integration
All API calls must go through /src/lib/insforge/client.ts
AI features use exclusively Insforge.dev endpoints
Asset uploads use Insforge object storage

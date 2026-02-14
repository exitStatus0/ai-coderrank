# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AI CoderRank — a Next.js 14 dashboard that displays the top 10 coding AI models from LMArena with pricing comparison. Data is fetched via web scraping (cheerio) and stored as JSON files. Deployed to Kubernetes with ArgoCD for GitOps.

## Commands

```bash
npm run dev           # Start dev server (http://localhost:3000)
npm run build         # Production build
npm run lint          # ESLint (extends next/core-web-vitals)
npm test              # Run all tests (Jest + jsdom)
npm test -- --watch   # Watch mode
npm test -- path/to/test  # Run a single test file
npm run update-data   # Fetch leaderboard data from LMArena
USE_MOCK_DATA=true npm run update-data  # Use mock data for testing
```

## Architecture

**Next.js App Router** with three API routes:
- `GET /api/models` — returns leaderboard + pricing data from JSON storage
- `GET /api/health` — Kubernetes health probe
- `GET /api/config` — runtime config (theme setting from env var)

**Data pipeline** (runs as K8s CronJob daily at 3AM UTC):
1. `src/lib/fetcher/leaderboard-fetcher.ts` — scrapes LMArena leaderboard using cheerio
2. `src/lib/pricing/pricing-service.ts` — matches models to static pricing DB with fuzzy matching
3. `src/lib/pricing/pricing-data.ts` — static pricing database (edit here to add/update model prices)
4. `src/lib/data/storage.ts` — reads/writes JSON to `data/models.json`
5. `src/scripts/update-data.ts` — orchestrates the pipeline (entry point for `npm run update-data`)

**Frontend components** (React + Recharts + Tailwind CSS):
- `Dashboard.tsx` — main orchestrator, fetches from `/api/models`
- `ThemeProvider.tsx` — dynamic theme from `/api/config` (dark/light controlled by `THEME` env var in `k8s/configmap.yaml`)
- `PriceChart.tsx` / `ScoreChart.tsx` — Recharts visualizations
- `ModelCard.tsx` / `SubscriptionCompare.tsx` — model details

**Types**: All domain types in `src/lib/types.ts`. Monetary values are USD per 1M tokens.

**Path alias**: `@/` maps to `src/` (configured in tsconfig and jest).

## Testing

Tests use Jest with jsdom environment. Structure:
- `tests/unit/` — pricing-service, leaderboard-fetcher, storage
- `tests/integration/` — API route tests

## Deployment

- Two Dockerfiles: `Dockerfile` (web app), `Dockerfile.cronjob` (data updater)
- K8s manifests in `k8s/` managed via Kustomize (`kubectl apply -k k8s/`)
- ArgoCD application defined in `argocd/application.yaml`
- CI/CD in `.github/workflows/ci.yml`: lint → test → build → Trivy scan → push to GHCR
- Images pushed to `ghcr.io` on main branch pushes

## GitOps Theme Demo

The theme is a GitOps demo feature. Change `THEME` in `k8s/configmap.yaml` ("dark" or "light"), commit, and ArgoCD syncs the change. Use `scripts/switch-theme.sh [light|dark]` for an interactive workflow.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_PATH` | `./data/models.json` | Data file location |
| `USE_MOCK_DATA` | `false` | Use mock data instead of fetching |
| `THEME` | `dark` | UI theme (dark/light) |

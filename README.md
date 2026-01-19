# AI CoderRank 🏆

> Top 10 AI Coding Models by Price — A clean, production-ready dashboard

AI CoderRank displays the top coding AI models from [LMArena](https://lmarena.ai/leaderboard) with their pricing information, helping developers choose the best value model for their needs.

![Dashboard Preview](docs/preview.png)

## Features

- 📊 **Top 10 Coding Models** — Automatically fetched from LMArena leaderboard
- 💰 **Price Comparison** — Input/output token pricing from official sources
- 📈 **Interactive Charts** — Visualize scores and prices with Recharts
- 🔄 **Daily Updates** — Kubernetes CronJob refreshes data automatically
- 🐳 **Docker Ready** — Multi-stage builds for minimal production images
- ☸️ **Kubernetes Native** — Full manifests with HA deployment

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Initialize with mock data
npm run update-data

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Docker

```bash
# Build the image
docker build -t ai-coderrank .

# Run locally
docker run -p 3000:3000 ai-coderrank
```

### Kubernetes

```bash
# Apply all manifests
kubectl apply -k k8s/

# Trigger manual data update
kubectl create job --from=cronjob/ai-coderrank-update manual-update -n ai-coderrank

# Check status
kubectl get pods -n ai-coderrank
```

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Next.js Application                    │  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐  │  │
│  │  │   Frontend  │───▶│  API Routes │───▶│ Data Storage │  │  │
│  │  │  (React +   │    │  /api/models│    │  (JSON/PVC)  │  │  │
│  │  │  Recharts)  │    └─────────────┘    └──────────────┘  │  │
│  │  └─────────────┘                              ▲           │  │
│  └───────────────────────────────────────────────┼───────────┘  │
│                                                   │              │
│  ┌──────────────────────────────────────────────┼───────────┐  │
│  │                  CronJob (Daily 3AM UTC)       │           │  │
│  │  ┌─────────────┐    ┌─────────────┐          │           │  │
│  │  │ Leaderboard │───▶│   Pricing   │──────────┘           │  │
│  │  │   Fetcher   │    │   Service   │                      │  │
│  │  └─────────────┘    └─────────────┘                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
ai-coderrank/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── models/        # GET /api/models
│   │   │   └── health/        # GET /api/health
│   │   ├── page.tsx           # Home page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── PriceChart.tsx     # Price comparison chart
│   │   ├── ScoreChart.tsx     # Arena scores chart
│   │   ├── ModelCard.tsx      # Individual model card
│   │   └── Header.tsx         # App header
│   │
│   ├── lib/                   # Core business logic
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── fetcher/           # Leaderboard fetching
│   │   ├── pricing/           # Pricing service
│   │   └── data/              # Storage utilities
│   │
│   └── scripts/
│       └── update-data.ts     # CronJob script
│
├── tests/
│   ├── unit/                  # Unit tests
│   └── integration/           # API tests
│
├── k8s/                       # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── pvc.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── cronjob.yaml
│   └── kustomization.yaml
│
├── data/                      # Runtime data (gitignored)
├── Dockerfile                 # Web app image
├── Dockerfile.cronjob         # CronJob image
└── package.json
```

### Key Components

| Component | Responsibility |
|-----------|---------------|
| **Dashboard** | Main UI orchestrator, state management |
| **PriceChart** | Visualizes input/output pricing |
| **ScoreChart** | Displays arena scores |
| **LeaderboardFetcher** | Scrapes LMArena for model data |
| **PricingService** | Matches models to pricing data |
| **Storage** | JSON file persistence |

## Architectural Decisions

### 1. Single Container vs Microservices

**Decision:** Single Next.js container for web + API

**Trade-offs:**
| Pros | Cons |
|------|------|
| Simpler deployment | Can't scale API independently |
| Lower resource usage | Tighter coupling |
| Easier debugging | |

**Alternative:** Separate frontend/backend services. Rejected for this scale.

### 2. JSON File vs Database

**Decision:** JSON file storage on PersistentVolume

**Trade-offs:**
| Pros | Cons |
|------|------|
| Zero dependencies | No concurrent writes |
| Easy to inspect/debug | Limited query capability |
| Portable | Manual backup needed |

**Alternative:** PostgreSQL or SQLite. Rejected as overkill for 10 records.

### 3. Static Pricing vs API

**Decision:** Static pricing database with fuzzy matching

**Trade-offs:**
| Pros | Cons |
|------|------|
| No API keys needed | Manual updates when prices change |
| Fast, predictable | May be slightly outdated |
| Works offline | |

**Alternative:** LiteLLM pricing API. Could integrate later if needed.

### 4. Web Scraping vs Official API

**Decision:** Scrape LMArena (with fallback to mock data)

**Trade-offs:**
| Pros | Cons |
|------|------|
| No authentication | Fragile to HTML changes |
| Always current data | May break without notice |
| Free | Rate limiting possible |

**Mitigation:** Robust error handling, mock data fallback, daily-only fetching.

### 5. PVC vs ConfigMap for Data

**Decision:** PersistentVolumeClaim

**Trade-offs:**
| Pros | Cons |
|------|------|
| Survives pod restarts | Requires storage provisioner |
| Shared between pods | Single-node access (RWO) |
| No size limit | |

**Alternative:** ConfigMap (1MB limit), S3 (overkill).

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Server port |
| `DATA_PATH` | `./data/models.json` | Data file location |
| `USE_MOCK_DATA` | `false` | Use mock data instead of fetching |

### Kubernetes Configuration

Edit `k8s/configmap.yaml` or use Kustomize overlays:

```yaml
# k8s/overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../
images:
  - name: ai-coderrank
    newName: your-registry.com/ai-coderrank
    newTag: v1.0.0
```

## API Reference

### GET /api/models

Returns the leaderboard data with pricing.

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "rank": 1,
        "name": "o1",
        "displayName": "O1",
        "score": 1398,
        "organization": "OpenAI",
        "pricing": {
          "inputPricePerMillion": 15.00,
          "outputPricePerMillion": 60.00,
          "source": "official"
        }
      }
    ],
    "chartData": [...],
    "fetchedAt": "2024-01-15T03:00:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/health

Health check endpoint for Kubernetes probes.

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "dataAvailable": true,
  "dataAge": "2024-01-15T03:00:00.000Z"
}
```

## Development

### Adding New Models to Pricing

Edit `src/lib/pricing/pricing-data.ts`:

```typescript
export const PRICING_DATABASE: PricingMap = {
  // Add new model
  'new-model-name': {
    inputPricePerMillion: 1.00,
    outputPricePerMillion: 2.00,
    source: 'official', // or 'estimated'
  },
  // ...
};
```

### Running the Update Script

```bash
# Fetch live data
npm run update-data

# Use mock data (for testing)
USE_MOCK_DATA=true npm run update-data
```

## Deployment Checklist

- [ ] Build and push Docker images to registry
- [ ] Update image tags in `k8s/kustomization.yaml`
- [ ] Configure Ingress for external access
- [ ] Set up TLS with cert-manager
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Set up log aggregation

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14, React 18, Recharts |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Testing | Jest, React Testing Library |
| Container | Docker (multi-stage) |
| Orchestration | Kubernetes, Kustomize |

## License

MIT

---

Built with 💻 by developers, for developers.

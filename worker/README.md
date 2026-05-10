# Dynastiest League Worker

Cloudflare Worker that generates AI-powered trade analysis for Sleeper fantasy football trades.

## Features

- **Scheduled Cron Job**: Polls Sleeper API every 5 minutes for new trades
- **AI Analysis**: Generates snarky, in-depth trade analysis using Anthropic Claude
- **D1 Database**: Stores analyses to ensure one generation per trade
- **HTTP API**: Provides endpoints for fetching cached analyses

## Setup

### Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Anthropic API key

### Installation

```bash
cd worker
npm install
```

### Create D1 Database

```bash
# Create the database
npm run d1:create

# Note the database ID from the output and update wrangler.toml
```

Update `wrangler.toml` with your D1 database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "dynastiest-league-db"
database_id = "your-actual-database-id"
```

### Run Migrations

```bash
# For local development
npm run d1:migrations:apply

# For production
npm run d1:migrations:apply:remote
```

### Set Secrets

```bash
# Set Anthropic API key
wrangler secret put ANTHROPIC_API_KEY
# Enter your API key when prompted
```

### Configure League ID

Update `SLEEPER_LEAGUE_ID` in `wrangler.toml` with your Sleeper league ID.

## Deployment

Merging to `main` automatically deploys the worker via GitHub Actions (`.github/workflows/deploy-worker.yml`). No manual step is required after a successful merge.

The workflow:
1. Triggers on any push to `main` that touches `worker/**` (or the workflow file itself)
2. Authenticates with Cloudflare using the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets
3. Runs `wrangler deploy` from the `worker/` directory

**Local `wrangler deploy` is now a fallback for emergencies only.** If you run it locally, it will overwrite whatever the workflow deployed, so only do this when absolutely necessary and coordinate with the team.

### Required Repo Secrets (one-time setup)

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | API token with Workers Scripts, Workers KV, and D1 Edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (found in the dashboard URL or Workers sidebar) |

The workflow can also be triggered manually from the Actions tab (via `workflow_dispatch`) without needing an empty commit.

## Development

```bash
# Run worker locally
npm run dev

# Deploy to Cloudflare (emergency fallback only — prefer merging to main)
npm run deploy

# View logs
npm run tail
```

## API Endpoints

### GET /api/trade-analysis

Get analysis for a single trade.

**Query Parameters:**

- `transaction_id` (required): Sleeper transaction ID

**Response:**

```json
{
  "transaction_id": "123456",
  "timestamp": 1234567890,
  "teams": {
    "Team A": {
      "grade": "A-",
      "received": {
        "players": [...],
        "picks": [...]
      },
      "summary": "..."
    },
    "Team B": { ... }
  },
  "conversation": [
    { "speaker": "Mike", "text": "..." },
    { "speaker": "Jim", "text": "..." }
  ],
  "overall_take": "..."
}
```

### GET /api/trade-analyses

Get analyses for multiple trades (batch endpoint).

**Query Parameters:**

- `ids` (required): Comma-separated list of transaction IDs (max 100)

**Response:**

```json
{
  "123456": { ... },
  "789012": { ... },
  "345678": null
}
```

### GET /health

Health check endpoint.

## Cron Schedule

The worker runs every 5 minutes (`*/5 * * * *`) and:

1. Checks the current week and previous week for new trades
2. Filters for completed trades only
3. Generates analysis for trades that don't have one yet
4. Stores the analysis in D1

## Architecture

```bash
worker/
├── src/
│   ├── index.ts      # Worker entry point
│   ├── api.ts        # HTTP API handlers
│   ├── cron.ts       # Scheduled job handler
│   ├── db.ts         # D1 database operations
│   ├── sleeper.ts    # Sleeper API client
│   ├── anthropic.ts  # Anthropic Claude integration
│   └── types.ts      # TypeScript types
├── migrations/
│   └── 0001_create_trade_analysis.sql
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## Environment Variables

Set in `wrangler.toml`:

- `SLEEPER_LEAGUE_ID`: Your Sleeper league ID
- `ANALYSIS_VERSION`: Version string for analysis schema (e.g., "v1")

Set as secrets:

- `ANTHROPIC_API_KEY`: Your Anthropic API key

## Troubleshooting

### Check logs

```bash
npm run tail
```

### Test locally

```bash
npm run dev
# Visit http://localhost:8787/health
```

### Manual trigger

You can manually trigger the cron job by calling:

```bash
curl -X GET "https://your-worker.workers.dev/api/trade-analyses?ids=transaction_id"
```

## Cost Considerations

- **D1**: First 5GB storage free, first 5 million reads free
- **Workers**: First 100,000 requests/day free
- **Anthropic**: Costs per token (Claude Haiku 4.5 is cost-effective)
- **Cron**: Runs every 5 minutes = ~8,640 invocations/month

Monitor your usage in the Cloudflare dashboard.

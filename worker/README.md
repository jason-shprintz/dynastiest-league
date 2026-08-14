# Dynastiest League Worker

Cloudflare Worker that generates AI-powered trade analysis for Sleeper fantasy football trades.

## Features

- **Scheduled Cron Job**: Polls Sleeper API every minute for new trades
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

**Production migrations are applied automatically by the deploy workflow once CI is configured.**
After initial setup, you do not need to run any migration command manually for production.

```bash
# Local development only — applies migrations against the local D1 database
npm run d1:migrations:apply
```

To run migrations against production outside of a deploy (emergency path), use
the **Apply Migrations (Manual)** GitHub Actions workflow (`migrate-worker.yml`)
via the Actions tab. Direct use of `wrangler d1 execute --file=...` for
production is deprecated.

**Idempotency convention:** every migration file in `worker/migrations/` must be
idempotent. Use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and
(where SQLite supports it) `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so that
re-applying a migration is always a safe no-op.

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
3. Runs `wrangler d1 migrations apply DB --remote` to apply any unapplied migrations
4. Runs `wrangler deploy` from the `worker/` directory — **only if migrations succeed**

**Migrations always run before the deploy.** If a migration fails, the deploy is aborted so old code keeps serving traffic against the old schema.

**Local `wrangler deploy` is now a fallback for emergencies only.** If you run it locally, it will overwrite whatever the workflow deployed, so only do this when absolutely necessary and coordinate with the team.

### Adding a New Migration

1. Create a new `.sql` file under `worker/migrations/` following the naming convention `NNNN_description.sql` (e.g. `0003_add_player_cache.sql`).
2. Write the SQL using idempotent statements (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, etc.).
3. Merge your changes to `main` — the deploy workflow will apply the migration automatically before deploying your code.

Do **not** run `wrangler d1 execute --file=...` directly against production. That command bypasses wrangler's migration-tracking table and makes the deploy workflow think the migration is unapplied.

### Manual Migration Workflow (Emergency Path)

If you need to apply migrations without redeploying code — for example, to recover after a partial CI failure or to apply a hotfix schema change before new code is ready — use the **Apply Migrations (Manual)** workflow (`migrate-worker.yml`) from the Actions tab.

This is an emergency path only. The standard path is automatic migration on deploy.

### Required Repo Secrets (one-time setup)

| Secret                  | Description                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token with Workers Scripts, Workers KV, and D1 Edit permissions        |
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

The worker runs every 1 minute (`*/1 * * * *`) and:

1. Checks the current week and previous week for new trades
2. Filters for completed trades only
3. Compares each trade/pick/grade's stored version against the current `*_ANALYSIS_VERSION`
4. Generates or regenerates analysis for records that are missing or version-stale
5. Stores the analysis in D1 via UPSERT

### Rookie identification source for draft analysis

Rookie ranking data comes from FantasyCalc dynasty values, but rookie identity is
computed from the cached Sleeper player map using
`parseInt(playerInfo.draft_year, 10) === parseInt(nflState.season, 10)`.
`years_exp` is intentionally not used for rookie detection to avoid offseason rollover
issues.

## Iterating on Prompts

When you want to re-run analysis with an updated prompt, **bump the version string** in
`wrangler.toml` and merge to `main`. That's the only step required.

```toml
# wrangler.toml
[vars]
TRADE_ANALYSIS_VERSION = "v2"   # was "v1"
DRAFT_ANALYSIS_VERSION = "v2"   # was "v1"
```

Once deployed, the cron will compare every existing record's stored version against the new
value. Any mismatch triggers a regeneration. Per-tick caps (`MAX_TRADES_PER_TICK = 5`,
`MAX_PICKS_PER_TICK = 3`, `MAX_GRADES_PER_TICK = 2`) are enforced **globally per cron tick**:
the trade cap spans all week scans combined (not per-week), so a single tick never exceeds 5
Anthropic trade calls regardless of offseason/in-season mode. Rollout paces naturally across
successive 1-minute ticks.

**No manual `DELETE FROM ...` needed.** If you leave the version unchanged, existing records
are silently skipped and only brand-new trades/picks receive analysis.

> **Warning:** An empty-string or unset `TRADE_ANALYSIS_VERSION` / `DRAFT_ANALYSIS_VERSION`
> causes the cron to log an error and **skip** that processing path for that tick. Trade
> and draft processing are handled independently — a misconfigured trade version doesn't
> prevent draft analysis from running, and vice versa. Always ensure both vars are set to
> a non-empty string in `wrangler.toml` before deploying.

### Manual DELETE (escape hatch)

You can force regeneration of a single record without bumping the version (e.g. debugging
one weird trade). The next cron tick will see the row as missing and regenerate it fresh.

```sql
-- Force-regen a specific trade
DELETE FROM trade_analysis WHERE transaction_id = 'your-transaction-id';

-- Force-regen a specific draft pick
DELETE FROM draft_pick_analysis WHERE draft_id = 'your-draft-id' AND pick_no = 42;

-- Force-regen a specific team's draft grade
DELETE FROM team_draft_grade WHERE draft_id = 'your-draft-id' AND roster_id = 3;
```

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
- `TRADE_ANALYSIS_VERSION`: Version string for trade analysis (e.g. `"v1"`). Bump to regenerate all existing trade analyses.
- `DRAFT_ANALYSIS_VERSION`: Version string for draft pick/grade analysis (e.g. `"v1"`). Bump to regenerate all existing draft analyses.
- `LEAGUE_DRAFT_ID` _(optional)_: Pin cron to a specific draft ID instead of auto-detecting

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
- **Anthropic**: Costs per token (Claude Opus 4.7 improves output quality at higher cost)
- **Cron**: Runs every minute = ~43,200 invocations/month

Monitor your usage in the Cloudflare dashboard.

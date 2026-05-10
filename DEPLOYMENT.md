# AI Trade Analyzer - Deployment Guide

This guide covers deploying the AI Trade Analyzer to Cloudflare Workers with D1 database and Anthropic Claude integration.

## Prerequisites

1. **Cloudflare Account** - Free tier is sufficient
2. **Node.js 18+** - For running Wrangler CLI
3. **Anthropic API Key** - Get from <https://console.anthropic.com/>
4. **Sleeper League ID** - Your league's ID from Sleeper

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

Login to Cloudflare:

```bash
wrangler login
```

## Step 2: Create D1 Database

Navigate to the worker directory:

```bash
cd worker
npm install
```

Create the D1 database:

```bash
npm run d1:create
```

This will output something like:

```bash
✅ Successfully created DB 'dynastiest-league-db'
Created your database using D1's new storage backend.
The new storage backend is not yet recommended for production
workflows, but backs up your data via snapshots to R2.

[[d1_databases]]
binding = "DB"
database_name = "dynastiest-league-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** from the output.

## Step 3: Update Configuration

Edit `worker/wrangler.toml` and replace the `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "dynastiest-league-db"
database_id = "your-actual-database-id-here"  # Paste the ID from Step 2
```

Also update the `SLEEPER_LEAGUE_ID` if different:

```toml
[vars]
SLEEPER_LEAGUE_ID = "1194516531404427264"  # Your league ID
ANALYSIS_VERSION = "v1"
```

## Step 4: Run Database Migrations

> **On subsequent deploys, migrations are applied automatically by the GitHub Actions workflow** — you only need this manual step during initial setup before CI is configured.

Apply migrations to create the database tables:

```bash
npm run d1:migrations:apply:remote
```

You should see output similar to:

```bash
🌀 Executing on remote database dynastiest-league-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🌀 To execute on your local development database, pass the --local flag to 'wrangler d1 migrations apply'
🌀 Applying migration 0001_create_trade_analysis.sql
🌀 Applying migration 0002_create_draft_tables.sql
✅ Successfully applied 2 migrations.
```

Once the deploy workflow (`.github/workflows/deploy-worker.yml`) is set up with the required repo secrets, it will run `wrangler d1 migrations apply DB --remote` automatically before every deploy. See `worker/README.md` for details on the migration workflow and the idempotency convention all migration files must follow.

## Step 5: Set Anthropic API Key Secret

Store your Anthropic API key as a Cloudflare secret:

```bash
wrangler secret put ANTHROPIC_API_KEY
```

When prompted, paste your Anthropic API key and press Enter.

## Step 6: Deploy Worker

> **Auto-deploy is active on `main`.** Once the repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are configured, every merge to `main` that touches `worker/**` automatically deploys via the `.github/workflows/deploy-worker.yml` GitHub Actions workflow. You can monitor the deploy in the **Actions** tab. Local `wrangler deploy` is now a fallback for emergencies only.

For initial setup or emergency manual deploys, run from the `worker/` directory:

```bash
npm run deploy
```

### Finding your Worker URL

Your Worker URL follows the pattern `https://<worker-name>.<your-subdomain>.workers.dev`. You can find it in two places:

- **GitHub Actions logs**: open the deploy workflow run in the **Actions** tab → expand the `wrangler deploy` step → look for a line like `Deployed dynastiest-league-worker … https://…workers.dev`
- **Cloudflare dashboard**: go to **Workers & Pages** → select `dynastiest-league-worker` → the URL is shown on the overview page

## Step 7: Configure Front-End

Create a `.env.local` file in the root directory (not in `/worker`):

```bash
cd ..  # Go back to root directory
cp .env.example .env.local
```

Edit `.env.local` and set your Worker URL:

```bash
VITE_WORKER_URL=https://dynastiest-league-worker.your-subdomain.workers.dev
```

## Step 8: Test the Deployment

### Test Worker Health Check

```bash
curl https://dynastiest-league-worker.your-subdomain.workers.dev/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "dynastiest-league-worker",
  "version": "v1"
}
```

### Test API Endpoint

Try fetching an analysis (will return 404 if none exist yet):

```bash
curl "https://dynastiest-league-worker.your-subdomain.workers.dev/api/trade-analysis?transaction_id=test123"
```

### Manually Trigger Cron (Optional)

The cron job runs every 5 minutes automatically. You can also:

1. Go to Cloudflare dashboard
2. Navigate to Workers & Pages
3. Select your worker
4. Go to "Triggers" tab
5. Click "Send Test Event" under Cron Triggers

Or trigger it via Wrangler:

```bash
cd worker
wrangler dev --test-scheduled --remote
```

## Step 9: Deploy Front-End

Build and preview the front-end locally first:

```bash
npm run build
npm run preview
```

Open your browser to the URL shown (usually <http://localhost:4173>) and navigate to the Breaking News page. You should see:

- Trades loading from Sleeper
- "Mike & Jim are in the film room..." placeholder for trades without analysis yet
- AI analysis appearing for trades that have been processed

Deploy to your hosting (Cloudflare Pages, Vercel, etc.) with the `.env.local` variables configured.

### For Cloudflare Pages

```bash
# From root directory
npm run build

# Deploy dist/ folder to Cloudflare Pages
# Set environment variable: VITE_WORKER_URL=https://dynastiest-league-worker.your-subdomain.workers.dev
```

## Monitoring & Debugging

### View Worker Logs

```bash
cd worker
npm run tail
```

This streams real-time logs from your worker.

### Check D1 Database

Query the database to see stored analyses:

```bash
wrangler d1 execute dynastiest-league-db --remote --command "SELECT transaction_id, league_id, created_at FROM trade_analysis LIMIT 5"
```

### Force Regenerate Analysis

If you want to regenerate an analysis, delete it from the database:

```bash
wrangler d1 execute dynastiest-league-db --remote --command "DELETE FROM trade_analysis WHERE transaction_id = 'YOUR_TRANSACTION_ID'"
```

The cron job will regenerate it on the next run.

## Cost Estimation

Based on default configuration:

### Cloudflare

- **Workers**: Free tier includes 100,000 requests/day
- **D1**: Free tier includes 5GB storage, 5M reads/day
- **Cron Jobs**: ~8,640 invocations/month (every 5 minutes)

All within free tier for typical usage.

### Anthropic

- **Model**: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- **Cost per analysis**: ~$0.007 (~700 input tokens × $0.0008/1K + ~1500 output tokens × $0.004/1K)
- **Monthly**: Depends on trade volume (typically 5-20 trades/month = $0.05-0.20)

## Troubleshooting

### Worker not processing trades

1. Check logs: `npm run tail`
2. Verify cron schedule in wrangler.toml
3. Check SLEEPER_LEAGUE_ID is correct
4. Ensure D1 migrations were applied

### Anthropic errors

1. Verify API key is set: `wrangler secret list`
2. Check Anthropic account has credits
3. Review logs for specific error messages

### Front-end not showing analysis

1. Verify VITE_WORKER_URL is set correctly
2. Check browser console for CORS errors
3. Verify Worker URL is accessible
4. Check if analyses exist in D1 database

### CORS issues

Update `worker/src/api.ts` CORS_HEADERS to include your domain:

```typescript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com', // Update this
  // ...
};
```

## Customization

### Adjust Cron Frequency

Edit `worker/wrangler.toml`:

```toml
[triggers]
crons = ["*/15 * * * *"]  # Every 15 minutes instead of 5
```

### Change Anthropic Model

Edit `worker/src/anthropic.ts`:

```typescript
const response = await anthropic.messages.create({
  model: 'claude-opus-4-5', // Use Claude Opus for better quality (higher cost)
  // ...
});
```

### Adjust Analysis Style

Edit the prompt in `worker/src/anthropic.ts` to change tone, length, or focus.

## Production Checklist

- [ ] D1 database created and migrations applied
- [ ] Anthropic API key set as secret
- [ ] Worker deployed and health check passes
- [ ] CORS headers configured for your domain
- [ ] Front-end environment variable set
- [ ] Cron job running (check logs after 5-10 minutes)
- [ ] Test analysis generation works
- [ ] Monitor costs in [Anthropic Console](https://console.anthropic.com/)
- [ ] Set up alerts for Worker errors (Cloudflare dashboard)

## Support

For issues with:

- **Cloudflare Workers/D1**: Check [Cloudflare Docs](https://developers.cloudflare.com/)
- **Anthropic API**: Check [Anthropic Docs](https://docs.claude.com/)
- **Sleeper API**: Check [Sleeper API Docs](https://docs.sleeper.com/)

## Next Steps

After deployment, the worker will:

1. Check for new trades every 5 minutes
2. Generate AI analysis for any new trades found
3. Store analyses in D1 database
4. Serve cached analyses via API

Your Breaking News page will automatically display the analyses as they become available!

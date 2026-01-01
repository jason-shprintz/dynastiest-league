# AI Trade Analyzer - Deployment Guide

This guide covers deploying the AI Trade Analyzer to Cloudflare Workers with D1 database and OpenAI integration.

## Prerequisites

1. **Cloudflare Account** - Free tier is sufficient
2. **Node.js 18+** - For running Wrangler CLI
3. **OpenAI API Key** - Get from <https://platform.openai.com/api-keys>
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

Apply migrations to create the `trade_analysis` table:

```bash
npm run d1:migrations:apply:remote
```

You should see:

```bash
🌀 Executing on remote database dynastiest-league-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🌀 To execute on your local development database, pass the --local flag to 'wrangler d1 migrations apply'
🌀 Applying migration 0001_create_trade_analysis.sql
✅ Successfully applied 1 migration.
```

## Step 5: Set OpenAI API Key Secret

Store your OpenAI API key as a Cloudflare secret:

```bash
wrangler secret put OPENAI_API_KEY
```

When prompted, paste your OpenAI API key and press Enter.

## Step 6: Deploy Worker

Deploy the worker to Cloudflare:

```bash
npm run deploy
```

You should see output like:

```bash
Total Upload: xx.xx KiB / gzip: xx.xx KiB
Uploaded dynastiest-league-worker (x.xx sec)
Published dynastiest-league-worker (x.xx sec)
  https://dynastiest-league-worker.your-subdomain.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Copy your Worker URL** from the output.

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

### OpenAI

- **Model**: gpt-4o-mini (~$0.00015 per 1K input tokens, ~$0.0006 per 1K output tokens)
- **Estimated**: ~$0.01-0.05 per trade analysis
- **Monthly**: Depends on trade volume (typically 5-20 trades/month = $0.10-1.00)

## Troubleshooting

### Worker not processing trades

1. Check logs: `npm run tail`
2. Verify cron schedule in wrangler.toml
3. Check SLEEPER_LEAGUE_ID is correct
4. Ensure D1 migrations were applied

### OpenAI errors

1. Verify API key is set: `wrangler secret list`
2. Check OpenAI account has credits
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
  "Access-Control-Allow-Origin": "https://yourdomain.com",  // Update this
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

### Change OpenAI Model

Edit `worker/src/openai.ts`:

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",  // Use GPT-4 for better quality (higher cost)
  // ...
});
```

### Adjust Analysis Style

Edit the prompt in `worker/src/openai.ts` to change tone, length, or focus.

## Production Checklist

- [ ] D1 database created and migrations applied
- [ ] OpenAI API key set as secret
- [ ] Worker deployed and health check passes
- [ ] CORS headers configured for your domain
- [ ] Front-end environment variable set
- [ ] Cron job running (check logs after 5-10 minutes)
- [ ] Test analysis generation works
- [ ] Monitor costs in OpenAI dashboard
- [ ] Set up alerts for Worker errors (Cloudflare dashboard)

## Support

For issues with:

- **Cloudflare Workers/D1**: Check [Cloudflare Docs](https://developers.cloudflare.com/)
- **OpenAI API**: Check [OpenAI Docs](https://platform.openai.com/docs)
- **Sleeper API**: Check [Sleeper API Docs](https://docs.sleeper.com/)

## Next Steps

After deployment, the worker will:

1. Check for new trades every 5 minutes
2. Generate AI analysis for any new trades found
3. Store analyses in D1 database
4. Serve cached analyses via API

Your Breaking News page will automatically display the analyses as they become available!

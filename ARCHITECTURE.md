# AI Trade Analyzer - Architecture Overview

## System Architecture

```bash
┌─────────────────────────────────────────────────────────────────────┐
│                         User's Browser                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Breaking News Page (React Component)                        │   │
│  │                                                              │   │
│  │  - Loads trades from Sleeper API (client-side)               │   │
│  │  - Fetches analyses from Worker API                          │   │
│  │  - Displays TradeCard with AI analysis                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              │ HTTP GET                             │
│                              ▼                                      │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Cloudflare Worker                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  HTTP API Endpoints                                          │   │
│  │  - GET /api/trade-analysis?transaction_id=...                │   │
│  │  - GET /api/trade-analyses?ids=...                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              │ Query                                │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  D1 Database                                                 │   │
│  │  - trade_analysis table                                      │   │
│  │  - Stores cached analyses (one per trade)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Scheduled Cron Job (Every 5 minutes)                        │   │
│  │                                                              │   │
│  │  1. Poll Sleeper API for new trades                          │   │
│  │  2. Check if analysis exists in D1                           │   │
│  │  3. If new: Generate analysis via OpenAI                     │   │
│  │  4. Store result in D1                                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              │ Generate Analysis                    │
│                              ▼                                      │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    OpenAI API (GPT-4o-mini)                         │
│                                                                     │
│  Generates:                                                         │
│  - Team grades (A+, B-, etc.)                                       │
│  - Player/pick summaries                                            │
│  - Conversation between Mike & Jim                                  │
│  - Overall take                                                     │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ Structured JSON
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Sleeper API                                 │
│                                                                     │
│  - League data                                                      │
│  - Transactions (trades)                                            │
│  - Rosters & Users                                                  │
│  - Player database                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Trade Processing (Automated - Cron Job)

```bash
Cron Trigger (Every 5 min)
    ↓
Fetch transactions from Sleeper API
    ↓
Filter to completed trades
    ↓
For each trade:
    ↓
Check if analysis exists in D1
    ↓
If not exists:
    ↓
Generate analysis via OpenAI
    ↓
Store in D1 database
```

### 2. User Viewing Trade (On-Demand)

```bash
User visits Breaking News page
    ↓
Load trades from Sleeper API (client-side)
    ↓
Batch fetch analyses from Worker API
    ↓
Worker queries D1 database
    ↓
Return cached analyses
    ↓
Display in TradeCard components
```

## Key Design Decisions

### 1. Idempotency

- **Transaction ID as Primary Key**: Ensures only one analysis per trade
- **Check before generate**: Worker checks D1 before calling OpenAI
- **Result**: No duplicate analyses, predictable costs

### 2. Consistency

- **Cached analyses**: All users see the same analysis
- **No client-side OpenAI calls**: Avoids inconsistent results
- **Versioned schema**: Analysis version tracked for future updates

### 3. Performance

- **Batch endpoint**: Reduces HTTP requests (one call for all trades)
- **Cron job**: Pre-generates analyses asynchronously
- **D1 indexes**: Fast lookups by transaction_id and league_id

### 4. Security

- **API key in Worker**: OpenAI key never reaches browser
- **CORS headers**: Can be restricted to specific domain
- **Environment variables**: Sensitive data stored as secrets

## Trade Analysis Structure

```typescript
{
  transaction_id: string,
  timestamp: number,
  teams: {
    "Team Name": {
      grade: "A-",           // Letter grade
      received: {
        players: [{name, position, team}],
        picks: [{season, round}]
      },
      summary: "..."         // Brief impact summary
    }
  },
  conversation: [
    {speaker: "Mike", text: "..."},
    {speaker: "Jim", text: "..."}
  ],
  overall_take: "..."        // One-sentence summary
}
```

## Cost Analysis

### Cloudflare (Free Tier)

- Workers: 100,000 requests/day ✅
- D1: 5M reads/day, 5GB storage ✅
- Cron: ~8,640 runs/month ✅

### OpenAI (Paid)

- Model: GPT-4o-mini
- Cost per analysis: ~$0.01-0.05
- Typical monthly cost: $0.10-1.00 (5-20 trades/month)

## Deployment Checklist

- [ ] Create D1 database
- [ ] Run migrations
- [ ] Set OpenAI API key as secret
- [ ] Update wrangler.toml with database_id
- [ ] Deploy worker
- [ ] Set VITE_WORKER_URL in frontend
- [ ] Update CORS headers for production domain
- [ ] Test health endpoint
- [ ] Verify cron job runs
- [ ] Monitor first few analyses

## Monitoring

### Worker Logs

```bash
cd worker
npm run tail
```

### D1 Queries

```bash
# List all analyses
wrangler d1 execute dynastiest-league-db --remote \
  --command "SELECT transaction_id, created_at FROM trade_analysis"

# Count analyses by league
wrangler d1 execute dynastiest-league-db --remote \
  --command "SELECT COUNT(*) FROM trade_analysis"
```

### OpenAI Usage

- Monitor costs in OpenAI dashboard
- Check token usage per request
- Set spending limits if needed

## Future Enhancements

### Potential Additions

- Email notifications when new analysis is ready
- Compare multiple trades side-by-side
- Historical trend analysis ("This team is on fire!")
- League-wide trade power rankings
- Fantasy football news integration
- Alternative analysis styles (serious, comedic, etc.)
- Analysis regeneration with improved prompts
- Support for multiple leagues

### Scaling Considerations

- If traffic grows: Use Cloudflare Cache API
- If costs grow: Implement analysis quotas
- If latency matters: Pre-warm recent analyses
- If needs grow: Migrate to Cloudflare Durable Objects

## Technical Details

### Stack

- **Backend**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **AI**: OpenAI GPT-4o-mini
- **Frontend**: React 19, MobX 6, TypeScript 5
- **API**: Sleeper Fantasy Football API

### File Structure

```bash
/worker/
  src/
    index.ts        # Worker entry point
    api.ts          # HTTP handlers
    cron.ts         # Scheduled job logic
    db.ts           # D1 operations
    sleeper.ts      # Sleeper API client
    openai.ts       # OpenAI integration
    types.ts        # TypeScript definitions
  migrations/
    0001_create_trade_analysis.sql
  wrangler.toml     # Worker configuration
  package.json      # Dependencies

/src/
  stores/
    TradeAnalysisStore.ts   # MobX store for analyses
    RootStore.ts            # Updated with new store
  Components/
    BreakingNews/
      BreakingNews.tsx      # Loads analyses
      TradeCard.tsx         # Displays analysis
```

## Support & Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Sleeper API Docs](https://docs.sleeper.com/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

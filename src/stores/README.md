# Sleeper API Stores

This directory contains MobX stores for managing data from the Sleeper fantasy football API.

## Overview

The stores provide observable state management for all Sleeper API data, including:
- League information
- Rosters
- Matchups
- Users
- Playoff brackets
- Drafts
- Transactions
- Traded picks

## Usage

### Basic Setup

The stores are already set up in `main.tsx` with the `StoreProvider`:

```tsx
import { RootStore, StoreProvider } from './stores';

const rootStore = new RootStore();

<StoreProvider value={rootStore}>
  <App />
</StoreProvider>
```

### Using Stores in Components

Import the hooks and use them in your components:

```tsx
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';

const MyComponent = observer(() => {
  const store = useStore();

  useEffect(() => {
    // Load all league data
    store.loadAllLeagueData('1194516531404427264');
    
    // Load matchups for a specific week
    store.loadMatchupsForWeek('1194516531404427264', 1);
  }, [store]);

  return (
    <div>
      {store.leagueStore.league && (
        <p>League: {store.leagueStore.league.name}</p>
      )}
    </div>
  );
});
```

### Individual Store Hooks

You can also use individual store hooks for convenience:

```tsx
import { observer } from 'mobx-react-lite';
import { useLeagueStore, useRostersStore } from '../../stores';

const MyComponent = observer(() => {
  const leagueStore = useLeagueStore();
  const rostersStore = useRostersStore();

  // Use the stores...
});
```

## Store Structure

### RootStore
The main store that contains all other stores and provides helper methods for loading data.

**Methods:**
- `loadAllLeagueData(leagueId)` - Loads league info, rosters, users, drafts, playoff bracket, and traded picks
- `loadMatchupsForWeek(leagueId, week)` - Loads matchups for a specific week
- `loadTransactionsForWeek(leagueId, week)` - Loads transactions for a specific week
- `resetAll()` - Resets all stores to their initial state

### Individual Stores

Each store has:
- Observable data properties
- `isLoading` - Boolean indicating if data is being fetched
- `error` - Error message if fetch fails
- `load*()` methods - Methods to fetch data
- `reset()` - Method to reset the store

#### LeagueStore
Manages league information.

**Properties:**
- `league: League | null` - The league data

**Methods:**
- `loadLeague(leagueId)` - Fetches league information

#### RostersStore
Manages roster data for all teams in the league.

**Properties:**
- `rosters: Roster[]` - Array of all rosters

**Methods:**
- `loadRosters(leagueId)` - Fetches all rosters

#### MatchupsStore
Manages matchup data by week.

**Properties:**
- `matchupsByWeek: Map<number, Matchup[]>` - Matchups organized by week

**Methods:**
- `loadMatchups(leagueId, week)` - Fetches matchups for a specific week
- `getMatchupsForWeek(week)` - Returns matchups for a specific week

#### UsersStore
Manages user/owner data.

**Properties:**
- `users: User[]` - Array of all users

**Methods:**
- `loadUsers(leagueId)` - Fetches all users
- `getUserById(userId)` - Returns a specific user by ID

#### PlayoffsStore
Manages playoff bracket data.

**Properties:**
- `bracket: PlayoffBracket[]` - The playoff bracket

**Methods:**
- `loadPlayoffBracket(leagueId)` - Fetches the playoff bracket

#### DraftStore
Manages draft data.

**Properties:**
- `drafts: Draft[]` - Array of all drafts
- `mostRecentDraft` - Computed property returning the most recent draft

**Methods:**
- `loadDrafts(leagueId)` - Fetches all drafts for the league

#### TransactionsStore
Manages transaction data by week.

**Properties:**
- `transactionsByWeek: Map<number, Transaction[]>` - Transactions organized by week
- `allTransactions` - Computed property returning all transactions across all weeks

**Methods:**
- `loadTransactions(leagueId, week)` - Fetches transactions for a specific week
- `getTransactionsForWeek(week)` - Returns transactions for a specific week

#### TradedPicksStore
Manages traded pick data.

**Properties:**
- `tradedPicks: TradedPick[]` - Array of all traded picks

**Methods:**
- `loadTradedPicks(leagueId)` - Fetches all traded picks

## Important Notes

- All components that observe store data must be wrapped with the `observer` HOC from `mobx-react-lite`
- The `useStore` hook must be used within a component that is a child of `StoreProvider`
- Data fetching is asynchronous and returns Promises
- Each store tracks loading and error states independently

## API Documentation

For more information about the Sleeper API, see: https://docs.sleeper.com/

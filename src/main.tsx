import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RootStore, StoreProvider } from './stores'
import { DEFAULT_LEAGUE_ID } from './constants'

const rootStore = new RootStore();

// Load league data at app startup
rootStore.loadAllLeagueData(DEFAULT_LEAGUE_ID);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider value={rootStore}>
      <App />
    </StoreProvider>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RootStore, StoreProvider } from './stores'

const rootStore = new RootStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider value={rootStore}>
      <App />
    </StoreProvider>
  </StrictMode>,
)

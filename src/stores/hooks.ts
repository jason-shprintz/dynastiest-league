/**
 * Store Hooks
 * Custom React hooks for accessing MobX stores
 */

import { useContext } from "react";
import { StoreContext } from "./StoreContext";
import { RootStore } from "./RootStore";

/**
 * Hook to access the root store from any component
 * @returns The root store instance
 * @throws Error if used outside of StoreProvider
 */
export function useStore(): RootStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return store;
}

/**
 * Individual store hooks for convenience
 */
export function useLeagueStore() {
  return useStore().leagueStore;
}

export function useRostersStore() {
  return useStore().rostersStore;
}

export function useMatchupsStore() {
  return useStore().matchupsStore;
}

export function useUsersStore() {
  return useStore().usersStore;
}

export function usePlayoffsStore() {
  return useStore().playoffsStore;
}

export function useDraftStore() {
  return useStore().draftStore;
}

export function useTransactionsStore() {
  return useStore().transactionsStore;
}

export function useTradedPicksStore() {
  return useStore().tradedPicksStore;
}

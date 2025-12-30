/**
 * Store Context
 * React context for providing MobX stores to the application
 */

import { createContext } from "react";
import { RootStore } from "./RootStore";

export const StoreContext = createContext<RootStore | null>(null);

export const StoreProvider = StoreContext.Provider;

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_URL?: string;
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * The `version` field from package.json, inlined at build time by the `define`
 * block in vite.config.ts. Displayed in the footer.
 */
declare const __APP_VERSION__: string;

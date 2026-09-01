/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_URL?: string;
  /**
   * Set to '1' to require analytics consent before Zaraz may load GA4.
   * Anything else — including unset — means no banner and no gating.
   */
  readonly VITE_ANALYTICS_REQUIRE_CONSENT?: string;
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

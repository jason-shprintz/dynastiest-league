import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The app version shown in the footer is read from package.json at build time
 * and inlined as a constant, so the manifest itself never has to be imported
 * into the client bundle just to surface one string.
 */
const { version: appVersion } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as { version: string };

/**
 * Vendor chunks are matched by module path rather than by package entry point.
 * The previous object form (`{ 'react-vendor': ['react', 'react-dom'] }`) only
 * matched those exact bare specifiers — but the app imports `react/jsx-runtime`
 * and `react-dom/client`, so nothing resolved into the group. Rollup emitted an
 * empty `react-vendor` chunk and React shipped inside the main entry chunk,
 * where it was re-downloaded on every application deploy.
 */
const VENDOR_CHUNKS: Record<string, string[]> = {
  'react-vendor': ['react', 'react-dom', 'scheduler'],
  'mobx-vendor': ['mobx', 'mobx-react-lite'],
  'styled-vendor': ['styled-components'],
};

/** Maps a module id inside node_modules to its vendor chunk name, if any. */
const resolveVendorChunk = (id: string): string | undefined => {
  const normalized = id.split('\\').join('/');
  if (!normalized.includes('/node_modules/')) return undefined;

  const packagePath = normalized.split('/node_modules/').pop() ?? '';

  for (const [chunk, packages] of Object.entries(VENDOR_CHUNKS)) {
    if (
      packages.some(
        (name) => packagePath === name || packagePath.startsWith(`${name}/`),
      )
    ) {
      return chunk;
    }
  }

  return undefined;
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: resolveVendorChunk,
      },
    },
    // Use esbuild for faster minification (default)
    minify: 'esbuild',
  },
});

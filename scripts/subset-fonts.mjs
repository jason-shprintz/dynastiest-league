/**
 * Generates Latin-subset WOFF2 builds of the site's web fonts.
 *
 * The upstream Google Fonts releases of Inter and Anton ship every writing
 * system they support (Cyrillic, Greek, Vietnamese, ...). This site is
 * English-only, so ~80% of each file is downloaded and never rendered.
 *
 * Subsetting to Latin-1 plus the punctuation we actually use takes the two
 * preloaded fonts from ~396 KiB down to ~109 KiB. Both variable axes on Inter
 * (`opsz` 14-32 and `wght` 100-900) are preserved, so nothing changes visually.
 *
 * Outputs are generated at build time and git-ignored; the upstream files in
 * `public/fonts/` remain the source of truth.
 *
 * Run via `npm run subset:fonts` (also wired into `predev` and `prebuild`).
 */

import { readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import subsetFont from 'subset-font';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = path.join(ROOT, 'public', 'fonts');

/**
 * Characters retained in the subset: the printable Latin-1 range plus the
 * typographic punctuation and symbols used across the site's copy (em dashes,
 * curly quotes, bullets, ellipses, the trademark and euro signs, and the
 * minus/multiplication signs used in stat tables).
 */
const LATIN_1 = [
  Array.from({ length: 0x7f - 0x20 }, (_, i) => String.fromCodePoint(0x20 + i)),
  Array.from({ length: 0x100 - 0xa0 }, (_, i) =>
    String.fromCodePoint(0xa0 + i),
  ),
].join('');

const EXTRA_PUNCTUATION = [
  '\u0131', // dotless i
  '\u0152',
  '\u0153', // OE / oe
  '\u2013',
  '\u2014', // en dash / em dash
  '\u2018',
  '\u2019',
  '\u201a', // single quotes
  '\u201c',
  '\u201d',
  '\u201e', // double quotes
  '\u2022', // bullet
  '\u2026', // ellipsis
  '\u2039',
  '\u203a', // single angle quotes
  '\u2122', // trademark
  '\u20ac', // euro
  '\u2212', // minus
  '\u00d7', // multiplication
].join('');

const CHARACTERS = LATIN_1 + EXTRA_PUNCTUATION;

/** Fonts to subset, keyed by their upstream file and generated output. */
const FONTS = [
  {
    label: 'Inter',
    source: 'Inter-VariableFont_opsz,wght.woff2',
    output: 'Inter-subset.woff2',
  },
  {
    label: 'Anton',
    source: 'Anton-Regular.woff2',
    output: 'Anton-subset.woff2',
  },
];

/** Formats a byte count as a human-readable KiB string. */
const kib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

/**
 * Returns true when the generated subset is newer than its source, letting
 * repeat builds skip work that would produce an identical file.
 */
async function isUpToDate(sourcePath, outputPath) {
  try {
    const [source, output] = await Promise.all([
      stat(sourcePath),
      stat(outputPath),
    ]);
    const script = await stat(fileURLToPath(import.meta.url));
    return output.mtimeMs >= Math.max(source.mtimeMs, script.mtimeMs);
  } catch {
    return false;
  }
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const font of FONTS) {
    const sourcePath = path.join(FONT_DIR, font.source);
    const outputPath = path.join(FONT_DIR, font.output);

    if (await isUpToDate(sourcePath, outputPath)) {
      const { size } = await stat(outputPath);
      console.log(`${font.label}: up to date (${kib(size)})`);
      totalAfter += size;
      totalBefore += (await stat(sourcePath)).size;
      continue;
    }

    const source = await readFile(sourcePath);
    const subset = await subsetFont(source, CHARACTERS, {
      targetFormat: 'woff2',
    });
    await writeFile(outputPath, subset);

    totalBefore += source.length;
    totalAfter += subset.length;

    console.log(
      `${font.label}: ${kib(source.length)} -> ${kib(subset.length)} (${font.output})`,
    );
  }

  const saved = totalBefore - totalAfter;
  console.log(
    `Fonts subset: ${kib(totalBefore)} -> ${kib(totalAfter)}, saving ${kib(saved)}.`,
  );
}

main().catch((error) => {
  console.error('Font subsetting failed:', error);
  process.exitCode = 1;
});

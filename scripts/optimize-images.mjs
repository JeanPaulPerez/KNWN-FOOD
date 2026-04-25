/**
 * optimize-images.mjs
 * Compresses large images using sharp. Originals are backed up to scripts/originals-backup/.
 * Run: node scripts/optimize-images.mjs
 */

import sharp from '../node_modules/sharp/lib/index.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BACKUP = path.join(__dirname, 'originals-backup');

async function backup(filePath) {
  const rel = path.relative(path.join(ROOT, 'public'), filePath);
  const dest = path.join(BACKUP, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(filePath, dest);
}

async function sizeMB(filePath) {
  const stat = await fs.stat(filePath);
  return (stat.size / 1024 / 1024).toFixed(2);
}

/**
 * Full-page background images: resize to max 1920px wide, quality 78
 * No alpha channel
 */
const BACKGROUNDS = [
  'public/assets/about/kitchen-1.webp',
  'public/assets/hero-bg/KNKW-1293.webp',
  'public/assets/hero-bg/ourphilosophy.webp',
  'public/assets/hero-bg/DSC01587.webp',
  'public/assets/we-create.webp',
];

/**
 * Portrait/tall photos: resize to max 1200px tall, quality 80
 */
const PORTRAITS = [
  'public/assets/about/DSC01466.webp',
];

/**
 * Person/food photos: just recompress, quality 80, max 1200px
 */
const PHOTOS = [
  'public/assets/about/Daniel y Choco.webp',
  'public/assets/about/founders.webp',
];

/**
 * Images with alpha (transparencies/cutouts): recompress only at quality 85, no resize
 */
const ALPHA = [
  'public/assets/about/Untitled design.webp',
  'public/assets/about/Meal Prep.webp',
];

/**
 * Menu plate cards: resize to max 900px wide (cards are shown at ~500px max), quality 80
 */
const MENU_PLATES = [
  'public/assets/menu/Menu_Platos/Monday/3.webp',
  'public/assets/menu/Menu_Platos/Monday/4.webp',
  'public/assets/menu/Menu_Platos/Tuesday/1.webp',
  'public/assets/menu/Menu_Platos/Tuesday/2.webp',
  'public/assets/menu/Menu_Platos/Wednesday/5.webp',
  'public/assets/menu/Menu_Platos/Wednesday/7.webp',
  'public/assets/menu/Menu_Platos/Thursday/6.webp',
  'public/assets/menu/Menu_Platos/Thursday/8.webp',
  'public/assets/menu/Menu_Platos/Friday/9.webp',
  'public/assets/menu/Menu_Platos/Friday/10.webp',
];

async function processFile(relPath, options) {
  const filePath = path.join(ROOT, relPath);
  try {
    await fs.access(filePath);
  } catch {
    console.log(`  SKIP (not found): ${relPath}`);
    return;
  }

  const before = await sizeMB(filePath);
  await backup(filePath);

  const tmp = filePath + '.tmp';
  let pipeline = sharp(filePath);
  const meta = await pipeline.metadata();

  if (options.maxWidth && meta.width > options.maxWidth) {
    pipeline = pipeline.resize({ width: options.maxWidth, withoutEnlargement: true });
  }
  if (options.maxHeight && meta.height > options.maxHeight) {
    pipeline = pipeline.resize({ height: options.maxHeight, withoutEnlargement: true });
  }

  await pipeline
    .webp({ quality: options.quality, effort: 4 })
    .toFile(tmp);

  await fs.rename(tmp, filePath);
  const after = await sizeMB(filePath);
  const saved = Math.round((1 - after / before) * 100);
  console.log(`  ✓ ${path.basename(relPath)}: ${before}MB → ${after}MB (${saved}% saved)`);
}

async function run() {
  console.log('Backing up originals to scripts/originals-backup/ ...\n');
  await fs.mkdir(BACKUP, { recursive: true });

  console.log('── Backgrounds (max 1920px, q78) ──');
  for (const f of BACKGROUNDS) await processFile(f, { maxWidth: 1920, quality: 78 });

  console.log('\n── Portraits (max 1200px tall, q80) ──');
  for (const f of PORTRAITS) await processFile(f, { maxHeight: 1200, quality: 80 });

  console.log('\n── Person/food photos (max 1200px, q80) ──');
  for (const f of PHOTOS) await processFile(f, { maxWidth: 1200, quality: 80 });

  console.log('\n── Alpha images (no resize, q85) ──');
  for (const f of ALPHA) await processFile(f, { quality: 85 });

  console.log('\n── Menu plate cards (max 900px, q80) ──');
  for (const f of MENU_PLATES) await processFile(f, { maxWidth: 900, quality: 80 });

  console.log('\nDone! Originals saved in scripts/originals-backup/');
}

run().catch(console.error);

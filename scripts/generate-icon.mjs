#!/usr/bin/env node
/**
 * Generate a multi-size PNG set from the base SVG and bundle into a Windows .ico.
 * Requires: sharp, png-to-ico
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

// script lives in project/scripts; go one directory up to project root
// Convert file URL to path and normalize for Windows (strip leading slash before drive letter)
let scriptDir = new URL('.', import.meta.url).pathname;
if (/^\\?[A-Za-z]:/.test(scriptDir.slice(1))) {
  // running on Windows: remove leading slash that precedes drive letter
  scriptDir = scriptDir.slice(1);
}
scriptDir = path.normalize(scriptDir);
const root = path.resolve(scriptDir, '..');
const publicDir = path.join(root, 'public');
const outPngDir = path.join(publicDir, 'icons');
const svgPath = path.join(publicDir, 'ebike-icon.svg');
const icoPath = path.join(publicDir, 'icon.ico');

const sizes = [16, 24, 32, 48, 64, 128, 256];

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function run() {
  const svg = await readFile(svgPath);
  await ensureDir(outPngDir);
  const pngBuffers = [];
  for (const size of sizes) {
    const pngFile = path.join(outPngDir, `icon-${size}.png`);
    const png = await sharp(svg).resize(size, size, { fit: 'contain' }).png().toBuffer();
    await writeFile(pngFile, png);
    pngBuffers.push(png);
    console.log(`Generated ${pngFile}`);
  }
  const ico = await pngToIco(pngBuffers.filter((_, idx) => sizes[idx] <= 256));
  await writeFile(icoPath, ico);
  console.log(`Wrote ${icoPath}`);
  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

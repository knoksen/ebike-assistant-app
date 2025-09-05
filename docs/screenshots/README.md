# Screenshots

All screenshot assets used in the root project README.

## Naming Convention

`<page>`[-desktop|-mobile].png

Base image (no suffix) is a mid-sized viewport reference used in the top README grids. Desktop/mobile variants are used inline for feature sections where clarity helps.

## Regeneration

1. Run the app (production build recommended):
   npm run build
   npm run preview
2. Capture or use any automation script you prefer. Ensure dark/light mode examples if adding theme shots.
3. Optimize (optional):
   npx imagemin docs/screenshots/*.png --out-dir=docs/screenshots

## Attributions

Internal feature UI only; no third‑party copyrighted content embedded.

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const dir = path.resolve('docs', 'screenshots');
if (!fs.existsSync(dir)) {
  console.log('No screenshots directory; skipping optimization');
  process.exit(0);
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
let saved = 0;
for (const f of files) {
  const full = path.join(dir, f);
  const data = fs.readFileSync(full);
  // Simple recompress using zlib (not as strong as specialized tools but zero-dependency)
  const recompressed = zlib.deflateSync(zlib.inflateSync(zlib.deflateSync(data))); // round-trip to attempt normalization
  if (recompressed.length < data.length) {
    fs.writeFileSync(full, recompressed);
    saved += data.length - recompressed.length;
    console.log(`Optimized ${f}: -${((data.length - recompressed.length)/1024).toFixed(1)} KB`);
  } else {
    console.log(`Skipped ${f}: already optimal`);
  }
}
console.log(`Total saved: ${(saved/1024).toFixed(1)} KB`);

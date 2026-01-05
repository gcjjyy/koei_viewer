/**
 * Generate SMAPBGPL tileset entries with specific palettes
 */

import * as fs from 'fs';
import { PNG } from 'pngjs';
import { LS11Decoder } from './ls11-decoder';
import { KoeiImageDecoder } from './koei-image';

interface RGB { r: number; g: number; b: number; }

function loadPalette(path: string): RGB[] {
  const data = fs.readFileSync(path);
  const palette: RGB[] = [];
  for (let i = 0; i < 16; i++) {
    palette.push({
      r: data[i * 3],
      g: data[i * 3 + 1],
      b: data[i * 3 + 2],
    });
  }
  return palette;
}

function generateEntry(
  entries: Uint8Array[],
  entryIndex: number,
  palette: RGB[],
  outputPath: string
) {
  const entry = entries[entryIndex];
  const width = 16;
  const bpp = 4;
  const pixelCount = (entry.length * 8) / bpp;
  const height = pixelCount / width;
  const chipHeight = 16;
  const chipsCount = Math.floor(height / chipHeight);
  const gridCols = 20;
  const gridRows = Math.ceil(chipsCount / gridCols);

  console.log(`Entry ${entryIndex}: ${width}x${height}, ${chipsCount} chips, ${gridCols}x${gridRows} grid`);

  const decoder = new KoeiImageDecoder();
  const image = decoder.readImage(
    entry,
    width,
    height,
    32, // align_length
    bpp,
    true, // big_endian
    [3, 2, 1, 0], // plane_order
    9 // invert_mask
  );

  const outW = gridCols * width;
  const outH = gridRows * chipHeight;
  const png = new PNG({ width: outW, height: outH, colorType: 6 });

  // Fill with black
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 0;
    png.data[i + 1] = 0;
    png.data[i + 2] = 0;
    png.data[i + 3] = 255;
  }

  // Render each chip
  for (let chipIdx = 0; chipIdx < chipsCount; chipIdx++) {
    const gridX = chipIdx % gridCols;
    const gridY = Math.floor(chipIdx / gridCols);
    const destX = gridX * width;
    const destY = gridY * chipHeight;
    const srcYOffset = chipIdx * chipHeight;

    for (let y = 0; y < chipHeight; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (srcYOffset + y) * width + x;
        const colorIndex = image.buf[srcIdx];
        const rgb = palette[colorIndex] || { r: 0, g: 0, b: 0 };

        const dstIdx = ((destY + y) * outW + (destX + x)) * 4;
        png.data[dstIdx] = rgb.r;
        png.data[dstIdx + 1] = rgb.g;
        png.data[dstIdx + 2] = rgb.b;
        png.data[dstIdx + 3] = 255;
      }
    }
  }

  fs.writeFileSync(outputPath, PNG.sync.write(png));
  console.log(`Saved to ${outputPath}`);
}

// Load LS11 entries
const rawData = fs.readFileSync('hero/SMAPBGPL.R3');
const ls11 = new LS11Decoder();
const entries: Uint8Array[] = [];
ls11.decode(new Uint8Array(rawData), (data: Uint8Array) => {
  entries.push(new Uint8Array(data));
});

console.log(`Loaded ${entries.length} entries from SMAPBGPL.R3\n`);

// Load palettes
const smapPalette = loadPalette('hero/SMAP.PAL');
const palacePalette = loadPalette('hero/PMAP_PALACE.PAL');
const mansionPalette = loadPalette('hero/PMAP_MANSION.PAL');
const barracksPalette = loadPalette('hero/PMAP_BARRACKS.PAL');

// Generate entry0 (outdoor tiles) with SMAP palette
generateEntry(entries, 0, smapPalette, 'output/hero-smapbgpl-entry0.png');

// Generate entry1 (indoor tiles) with each PMAP palette
console.log('\n=== Generating PMAP tilesets ===');
generateEntry(entries, 1, palacePalette, 'output/hero-smapbgpl-entry1-palace.png');
generateEntry(entries, 1, mansionPalette, 'output/hero-smapbgpl-entry1-mansion.png');
generateEntry(entries, 1, barracksPalette, 'output/hero-smapbgpl-entry1-barracks.png');

console.log('\nDone!');

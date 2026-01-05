import * as fs from 'fs';

// SMAP palette - based on clean tile analysis
// Index -> Color mapping from analysis:
//   0 -> [170,186,170] light gray-green (100%)
//   1 -> [0,0,0] black (100%)
//   4 -> [101,101,69] olive (100%)
//   5 -> [117,186,48] light green (54%)
//   6 -> [117,186,48] light green (85%)
//   7 -> [69,170,32] green (82%)

const SMAP_PALETTE: [number, number, number][] = [
  [170, 186, 170],     // 0: light gray-green ← confirmed
  [0, 0, 0],           // 1: black ← confirmed
  [48, 117, 170],      // 2: teal ← FIXED (was green)
  [117, 48, 0],        // 3: brown
  [101, 101, 69],      // 4: olive ← confirmed
  [170, 170, 32],      // 5: yellow-green ← FIXED (was light green)
  [117, 186, 48],      // 6: light green ← confirmed
  [69, 170, 32],       // 7: green ← confirmed
  [32, 69, 170],       // 8: blue (face color)
  [170, 170, 32],      // 9: yellow-green
  [138, 207, 255],     // 10: light blue (face color)
  [239, 101, 0],       // 11: orange ← FIXED (was teal)
  [138, 207, 255],     // 12: light blue ← FIXED (was pink)
  [0, 186, 117],       // 13: green ← FIXED (was bright yellow)
  [255, 255, 255],     // 14: white (face color)
  [255, 207, 85],      // 15: bright yellow ← FIXED (was orange)
];

// Create palette file
const palette = Buffer.alloc(48);
for (let i = 0; i < 16; i++) {
  palette[i * 3] = SMAP_PALETTE[i][0];
  palette[i * 3 + 1] = SMAP_PALETTE[i][1];
  palette[i * 3 + 2] = SMAP_PALETTE[i][2];
}

fs.writeFileSync('hero/SMAP.PAL', palette);
console.log('Updated hero/SMAP.PAL\n');

console.log('Palette:');
for (let i = 0; i < 16; i++) {
  const [r, g, b] = SMAP_PALETTE[i];
  console.log(`  ${i.toString().padStart(2)}: [${r.toString().padStart(3)},${g.toString().padStart(3)},${b.toString().padStart(3)}]`);
}

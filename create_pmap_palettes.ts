import * as fs from 'fs';

// PMAP 0 (Palace/궁전) palette - based on clean tile analysis
// Confirmed indices: 0, 1, 4, 5, 6, 10, 11, 13
const PMAP_PALACE_PALETTE: [number, number, number][] = [
  [ 69,  85,   0],  // 0: olive ← FIXED from [0,0,0]
  [  0,   0,   0],  // 1: black (100%)
  [  0, 186, 117],  // 2: green (face color)
  [117,  32,  16],  // 3: dark red
  [154, 154, 138],  // 4: gray (100%)
  [117,  85,  48],  // 5: brown (100%)
  [223, 207, 186],  // 6: beige (100%)
  [207, 154,  48],  // 7: gold
  [ 32,  69, 170],  // 8: blue (face color)
  [207, 101,  32],  // 9: dark orange
  [207, 117, 170],  // 10: pink ← FIXED from [138,207,255]
  [239, 101,   0],  // 11: orange (52%)
  [207, 117, 170],  // 12: pink (face color)
  [  0, 186, 117],  // 13: green (57%)
  [255, 255, 255],  // 14: white (face color)
  [255, 207,  85],  // 15: bright yellow
];

// PMAP 6 (Mansion/저택) palette - based on clean tile analysis
// Confirmed indices: 0, 1, 2, 3, 4, 5, 6
const PMAP_MANSION_PALETTE: [number, number, number][] = [
  [ 69,  85,  16],  // 0: dark olive (81%)
  [  0,   0,   0],  // 1: black (100%)
  [186, 117,  69],  // 2: light brown (76%)
  [117,  48,  32],  // 3: reddish brown (82%)
  [154, 154, 138],  // 4: gray
  [117,  85,  48],  // 5: brown
  [223, 207, 186],  // 6: beige ← FIXED from [0,0,0] (16225 pixels)
  [207, 154,  48],  // 7: gold (assumed)
  [ 32,  69, 170],  // 8: blue (face color)
  [207, 101,  32],  // 9: dark orange
  [138, 207, 255],  // 10: light blue (face color)
  [239, 101,   0],  // 11: orange
  [207, 117, 170],  // 12: pink (face color)
  [  0, 186, 117],  // 13: green
  [255, 255, 255],  // 14: white (face color)
  [255, 207,  85],  // 15: bright yellow
];

// PMAP 14 (Barracks/막사) palette - based on clean tile analysis
// Confirmed indices: 1, 2, 3, 7
const PMAP_BARRACKS_PALETTE: [number, number, number][] = [
  [  0,   0,   0],  // 0: black (assumed)
  [  0,   0,   0],  // 1: black (100%)
  [170,  85,  48],  // 2: brown (70%)
  [170,  85,  48],  // 3: brown (73%)
  [154, 154, 138],  // 4: gray (assumed)
  [117,  85,  48],  // 5: brown (assumed)
  [223, 207, 186],  // 6: beige (assumed)
  [207, 154,  48],  // 7: gold (100%)
  [ 32,  69, 170],  // 8: blue (face color)
  [  0,   0,   0],  // 9: black (diagonal border)
  [138, 207, 255],  // 10: light blue (face color)
  [239, 101,   0],  // 11: orange
  [207, 117, 170],  // 12: pink (face color)
  [  0, 186, 117],  // 13: green
  [255, 255, 255],  // 14: white (face color)
  [255, 207,  85],  // 15: bright yellow
];

function writePalette(palette: [number, number, number][], filename: string) {
  const buffer = Buffer.alloc(48);
  for (let i = 0; i < 16; i++) {
    buffer[i * 3] = palette[i][0];
    buffer[i * 3 + 1] = palette[i][1];
    buffer[i * 3 + 2] = palette[i][2];
  }
  fs.writeFileSync(filename, buffer);
  console.log(`Created ${filename}`);
}

writePalette(PMAP_PALACE_PALETTE, 'hero/PMAP_PALACE.PAL');
writePalette(PMAP_MANSION_PALETTE, 'hero/PMAP_MANSION.PAL');
writePalette(PMAP_BARRACKS_PALETTE, 'hero/PMAP_BARRACKS.PAL');

console.log('\nPalettes created:');
console.log('  - PMAP_PALACE.PAL: For palace maps (PMAP 0, 1, etc.)');
console.log('  - PMAP_MANSION.PAL: For mansion maps (PMAP 6, etc.)');
console.log('  - PMAP_BARRACKS.PAL: For barracks maps (PMAP 14, etc.)');

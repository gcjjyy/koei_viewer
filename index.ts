/**
 * KOEI Viewer - TypeScript port of C++ KOEI game image viewer
 *
 * This package provides tools for viewing and processing image data
 * from classic KOEI games (Sangokushi, Daikoukaijidai, etc.)
 */

// Core modules
export { BufReader } from './buf-reader';
export { KoeiImageDecoder, RGB, KoeiImage } from './koei-image';
export { LS11Decoder, FatEntry, DecodeCallback } from './ls11-decoder';
export { Unpacker, UnpackEntry, UnpackResult } from './unpack';
export { PALETTES, generatePaletteFile, generateAllPalettes } from './palette-gen';
export { KoeiViewer, ImageConfig, RenderOptions, main } from './koei-viewer';

// Re-export main as default CLI entry point
import { main } from './koei-viewer';

if (require.main === module) {
  main();
}

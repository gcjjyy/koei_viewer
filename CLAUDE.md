# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KOEI Viewer is a TypeScript tool for decoding and viewing image data from classic KOEI games (Romance of the Three Kingdoms series, Uncharted Waters, etc.). It handles various proprietary image formats including bitplane-based images, LS11 compression, and game-specific compression algorithms.

## Runtime

This project uses **Bun** as its JavaScript/TypeScript runtime. Bun natively executes TypeScript without a separate build step, providing faster startup and execution compared to Node.js + ts-node.

- No transpilation needed - Bun runs `.ts` files directly
- Dependencies managed via `bun install` (creates `bun.lockb`)
- Type checking available via `bun run typecheck` (uses tsc with `--noEmit`)

## Build & Run Commands

```sh
# Install dependencies
bun install

# Type check (no build needed - Bun runs TypeScript directly)
bun run typecheck

# Run the general image viewer (for config.json registered formats)
bun run koei-viewer.ts <image-file> <palette-file> [output.png]

# Examples
bun run koei-viewer.ts sam3/KAODATA.DAT sam3/SAM3KAO.PAL output.png
bun run koei-viewer.ts horizon/KAO.LZW horizon/HORIZON.PAL kao.png

# Run specialized decoders
bun run decode-sam4-faces.ts    # Sangokushi 4 faces -> sam4-faces.png
bun run decode-faces.ts          # Sangokushi Eiketsuden faces -> faces.png
```

## Architecture

### Core Modules

- **koei-viewer.ts**: Main application entry point. Reads config.json, handles LS11/non-LS11 image rendering, outputs PNG files
- **koei-image.ts**: Bitplane image decoder. Converts interleaved bitplane data to indexed pixels
- **ls11-decoder.ts**: LS11 compression decoder (LZ77-style with dictionary lookup)
- **buf-reader.ts**: Binary buffer reader with endian-aware integer reading

### Specialized Decoders (Non-config.json formats)

- **sam4-face-decoder.ts**: Sangokushi 4 KAODATA.S4 decoder (0xFE RLE + nibble-based back-reference)
- **face-decoder.ts**: Sangokushi Eiketsuden TF-DCE format decoder (VGA plane-based compression with zigzag scan)

### Configuration

**config.json** defines image format parameters for each supported file:
- `ls11`: Whether file uses LS11 compression
- `default_width/height`: Image dimensions
- `bpp`: Bits per pixel (3 for 8-color, 4 for 16-color)
- `big_endian`: Bitplane byte order
- `tiled`: Whether image uses 16x16 tile layout
- `chip_height`: Split tall images into chips of this height
- `skip_header_length`: Bytes to skip before image data

## Key Concepts

### Bitplane Format
KOEI images use planar format where each color bit is stored in separate planes. For 3bpp (8-color), each pixel's color index is assembled from 3 planes.

### LS11 Compression
Files starting with "LS11" header use KOEI's proprietary compression:
- 16-byte header + 256-byte dictionary
- FAT entries (compSize, uncompSize, offset)
- Variable-length codes with dictionary lookup and back-references

### VGA Zigzag Scan (face-decoder.ts)
The TF-DCE format uses a zigzag column scan pattern:
- Column 0: rows 0→79 (top to bottom)
- Column 1: rows 79→0 (bottom to top)
- Alternating direction for each column

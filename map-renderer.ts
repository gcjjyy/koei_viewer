/**
 * Map Renderer - Renders tile-based maps using pre-rendered tileset images
 */

import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import { LS11Decoder } from './ls11-decoder';

export interface MapConfig {
  tilesetFile: string;      // Pre-rendered tileset PNG (from koei-viewer)
  mapFile: string;          // Map data file (LS11 compressed)
  maps: MapEntry[];         // Map entries configuration
}

export interface MapEntry {
  index: number;            // Entry index in LS11 file
  width: number;            // Map width in tiles
  height: number;           // Map height in tiles (excluding garbage rows)
  name?: string;            // Optional name for output file
}

export type MapType = 'fixed' | 'header' | 'size-based' | 'header-auto-tileset' | 'pmap' | 'smap';

export interface AutoMapConfig {
  tilesetFile: string;
  mapFile: string;
  type: MapType;
  fixedWidth?: number;      // For 'fixed' type
  sizeMap?: { [size: number]: [number, number] };  // For 'size-based' type
  outputPrefix: string;
  altTilesetFile?: string;  // Alternative tileset for 'header-auto-tileset'
  tilesetSelector?: (mapData: Uint8Array) => 'primary' | 'alt';  // Function to select tileset
}

export class MapRenderer {
  private tileSize = 16;

  /**
   * Load tileset from pre-rendered PNG
   */
  private loadTileset(tilesetPath: string): { png: PNG; tilesPerRow: number; numTiles: number } {
    const data = fs.readFileSync(tilesetPath);
    const png = PNG.sync.read(data);
    const tilesPerRow = png.width / this.tileSize;
    const tilesPerCol = png.height / this.tileSize;
    const numTiles = tilesPerRow * tilesPerCol;
    return { png, tilesPerRow, numTiles };
  }

  /**
   * Load map entries from LS11 file
   */
  private loadMapEntries(mapPath: string): Uint8Array[] {
    const buffer = new Uint8Array(fs.readFileSync(mapPath));
    const ls11 = new LS11Decoder();
    const entries: Uint8Array[] = [];
    ls11.decode(buffer, (data: Uint8Array) => {
      entries.push(new Uint8Array(data));
    });
    return entries;
  }

  /**
   * Render a single map
   */
  renderMap(
    tileset: { png: PNG; tilesPerRow: number; numTiles: number },
    mapData: Uint8Array,
    mapWidth: number,
    mapHeight: number
  ): PNG {
    const outW = mapWidth * this.tileSize;
    const outH = mapHeight * this.tileSize;
    const png = new PNG({ width: outW, height: outH, colorType: 6 });

    for (let my = 0; my < mapHeight; my++) {
      for (let mx = 0; mx < mapWidth; mx++) {
        const idx = my * mapWidth + mx;
        if (idx >= mapData.length) continue;

        const tileIdx = mapData[idx];
        if (tileIdx >= tileset.numTiles) continue;

        // Calculate tile position in tileset
        const tileX = (tileIdx % tileset.tilesPerRow) * this.tileSize;
        const tileY = Math.floor(tileIdx / tileset.tilesPerRow) * this.tileSize;

        // Copy tile pixels
        for (let ty = 0; ty < this.tileSize; ty++) {
          for (let tx = 0; tx < this.tileSize; tx++) {
            const srcIdx = ((tileY + ty) * tileset.png.width + (tileX + tx)) * 4;
            const dstX = mx * this.tileSize + tx;
            const dstY = my * this.tileSize + ty;
            const dstIdx = (dstY * outW + dstX) * 4;

            png.data[dstIdx] = tileset.png.data[srcIdx];
            png.data[dstIdx + 1] = tileset.png.data[srcIdx + 1];
            png.data[dstIdx + 2] = tileset.png.data[srcIdx + 2];
            png.data[dstIdx + 3] = 255;
          }
        }
      }
    }

    return png;
  }

  /**
   * Detect tileset for HEXZMAP based on terrain layer
   * If terrain contains value 9 or 11, use alternate tileset
   */
  private detectTileset(rawData: Uint8Array): 'primary' | 'alt' {
    const w = rawData[0], h = rawData[1];
    const mapSize = w * h;
    const terrainStart = 2 + mapSize;
    const terrainSize = (w / 2) * (h / 2);
    const terrain = rawData.slice(terrainStart, terrainStart + terrainSize);

    for (let j = 0; j < terrain.length; j++) {
      if (terrain[j] === 9 || terrain[j] === 11) {
        return 'alt';
      }
    }
    return 'primary';
  }

  /**
   * Render all maps with auto-detected dimensions
   */
  renderAuto(config: AutoMapConfig, outputDir: string): void {
    let tileset = this.loadTileset(config.tilesetFile);
    let altTileset: { png: PNG; tilesPerRow: number; numTiles: number } | null = null;

    if (config.altTilesetFile) {
      altTileset = this.loadTileset(config.altTilesetFile);
    }

    console.log(`Tileset: ${config.tilesetFile} (${tileset.numTiles} tiles)`);
    if (altTileset) {
      console.log(`Alt Tileset: ${config.altTilesetFile} (${altTileset.numTiles} tiles)`);
    }

    const mapEntries = this.loadMapEntries(config.mapFile);
    console.log(`Map file: ${config.mapFile} (${mapEntries.length} entries)`);

    for (let i = 0; i < mapEntries.length; i++) {
      let mapData = mapEntries[i];
      let width: number, height: number;
      let activeTileset = tileset;

      if (config.type === 'header-auto-tileset' && altTileset) {
        // Skip metadata entries (like entry 58 in HEXZMAP which contains map names)
        if (mapData[0] > 128 || mapData[1] > 128) {
          console.log(`  [${i}] Skipped - metadata entry`);
          continue;
        }

        // Auto-detect tileset based on terrain layer
        const which = this.detectTileset(mapData);
        activeTileset = which === 'alt' ? altTileset : tileset;
        width = mapData[0];
        height = mapData[1];
        mapData = mapData.slice(2, 2 + width * height);

        const png = this.renderMap(activeTileset, mapData, width, height);
        const outputPath = path.join(outputDir, `${config.outputPrefix}-${i}.png`);
        fs.writeFileSync(outputPath, PNG.sync.write(png));
        console.log(`  [${i}] ${width}x${height} (${which}) -> ${outputPath}`);
        continue;
      } else if (config.type === 'header') {
        // First 2 bytes are width and height
        width = mapData[0];
        height = mapData[1];
        mapData = mapData.slice(2, 2 + width * height);  // Only take map layer, skip terrain
      } else if (config.type === 'size-based' && config.sizeMap) {
        const dims = config.sizeMap[mapEntries[i].length];
        if (!dims) {
          console.log(`  [${i}] Skipped - unknown size ${mapEntries[i].length}`);
          continue;
        }
        [width, height] = dims;
      } else if (config.type === 'pmap') {
        // PMAP: fixed width 32, height calculated from total size
        // Structure: map(32×h) + movement(31×(h-1)) + events
        // Total = 32h + 31(h-1) + remaining = 63h - 31 + remaining
        width = 32;
        height = 20; // default
        for (let h = 20; h <= 25; h++) {
          const mapSize = 32 * h;
          const movSize = 31 * (h - 1);
          const remaining = mapData.length - mapSize - movSize;
          if (remaining >= 0 && remaining < 100) {
            height = h;
            break;
          }
        }
        // Only use map layer data
        mapData = mapData.slice(0, width * height);
      } else if (config.type === 'smap') {
        // SMAP: fixed 32×20 map + 32×21 overlay + events
        width = 32;
        height = 20;
        const overlayHeight = 21;
        const mapSize = width * height;  // 640
        const overlaySize = width * overlayHeight;  // 672

        const baseMap = mapData.slice(0, mapSize);
        const overlayMap = mapData.slice(mapSize, mapSize + overlaySize);

        // Create PNG
        const outW = width * this.tileSize;
        const outH = height * this.tileSize;
        const png = new PNG({ width: outW, height: outH, colorType: 6 });

        // Fill with black
        for (let j = 0; j < png.data.length; j += 4) {
          png.data[j] = 0;
          png.data[j + 1] = 0;
          png.data[j + 2] = 0;
          png.data[j + 3] = 255;
        }

        // Helper to render a tile
        const renderTile = (mx: number, my: number, tileIdx: number) => {
          if (tileIdx >= activeTileset.numTiles) return;
          const tileX = (tileIdx % activeTileset.tilesPerRow) * this.tileSize;
          const tileY = Math.floor(tileIdx / activeTileset.tilesPerRow) * this.tileSize;
          for (let ty = 0; ty < this.tileSize; ty++) {
            for (let tx = 0; tx < this.tileSize; tx++) {
              const srcIdx = ((tileY + ty) * activeTileset.png.width + (tileX + tx)) * 4;
              const dstX = mx * this.tileSize + tx;
              const dstY = my * this.tileSize + ty;
              const dstIdx = (dstY * outW + dstX) * 4;
              png.data[dstIdx] = activeTileset.png.data[srcIdx];
              png.data[dstIdx + 1] = activeTileset.png.data[srcIdx + 1];
              png.data[dstIdx + 2] = activeTileset.png.data[srcIdx + 2];
              png.data[dstIdx + 3] = 255;
            }
          }
        };

        // 1. Render base map (32×20)
        for (let my = 0; my < height; my++) {
          for (let mx = 0; mx < width; mx++) {
            const tileIdx = baseMap[my * width + mx];
            renderTile(mx, my, tileIdx);
          }
        }

        // Overlay layer disabled - just render base map

        const outputPath = path.join(outputDir, `${config.outputPrefix}-${i}.png`);
        fs.writeFileSync(outputPath, PNG.sync.write(png));
        console.log(`  [${i}] ${width}x${height} -> ${outputPath}`);
        continue;
      } else {
        // Fixed width
        width = config.fixedWidth || 32;
        height = Math.ceil(mapData.length / width);
      }

      const png = this.renderMap(tileset, mapData, width, height);
      const outputPath = path.join(outputDir, `${config.outputPrefix}-${i}.png`);
      fs.writeFileSync(outputPath, PNG.sync.write(png));
      console.log(`  [${i}] ${width}x${height} -> ${outputPath}`);
    }
  }

  /**
   * Render all maps from config
   */
  renderAll(config: MapConfig, outputDir: string): void {
    // Load tileset
    const tileset = this.loadTileset(config.tilesetFile);
    console.log(`Tileset: ${config.tilesetFile} (${tileset.tilesPerRow}x${Math.floor(tileset.png.height / this.tileSize)} = ${tileset.numTiles} tiles)`);

    // Load map entries
    const mapEntries = this.loadMapEntries(config.mapFile);
    console.log(`Map file: ${config.mapFile} (${mapEntries.length} entries)`);

    // Render each map
    for (const mapConfig of config.maps) {
      if (mapConfig.index >= mapEntries.length) {
        console.log(`  [${mapConfig.index}] Skipped - index out of range`);
        continue;
      }

      const mapData = mapEntries[mapConfig.index];
      const png = this.renderMap(tileset, mapData, mapConfig.width, mapConfig.height);

      const outputName = mapConfig.name || `map-${mapConfig.index}`;
      const outputPath = path.join(outputDir, `${outputName}.png`);
      fs.writeFileSync(outputPath, PNG.sync.write(png));

      console.log(`  [${mapConfig.index}] ${mapConfig.width}x${mapConfig.height} -> ${outputPath}`);
    }
  }
}

// Hero (Sangokushi Eiketsuden) world map configuration
export const HERO_WORLDMAP_CONFIG: MapConfig = {
  tilesetFile: 'output/hero-mmapbgpl.png',
  mapFile: 'hero/MMAP.R3',
  maps: [
    { index: 0, width: 96, height: 96, name: 'hero-worldmap-0' },
    { index: 1, width: 72, height: 112, name: 'hero-worldmap-1' },
    { index: 2, width: 120, height: 88, name: 'hero-worldmap-2' },
    { index: 3, width: 112, height: 128, name: 'hero-worldmap-3' },
  ]
};

// Hero HEXZMAP (field/zone maps) - has 2-byte header with width
// Auto-detects tileset based on terrain layer (value 9 or 11 -> alt tileset)
// Primary: Entry 0 (80) + Entry 1 (174) = 254 tiles (general terrain)
// Alt: Entry 0 (80) + Entry 2 (175) = 255 tiles (wasteland terrain)
// Entry 58 is map name metadata, not a map
export const HERO_HEXZMAP_CONFIG: AutoMapConfig = {
  tilesetFile: 'output/hero-hexzchp-combined.png',
  mapFile: 'hero/HEXZMAP.R3',
  type: 'header-auto-tileset',
  altTilesetFile: 'output/hero-hexzchp-entry0+2.png',
  outputPrefix: 'hero-hexzmap'
};

// Map names from entry 58 (Korean)
export const HERO_HEXZMAP_NAMES = [
  '사수관', '호로관', '광천', '신도', '거록', '청하', '계교', '북해',
  '서주', '소패', '태산', '하구', '팽성', '하비', '신도1', '광릉',
  '연주', '고성', '영천', '여남', '강하', '남양', '박망파', '신야1',
  '양양', '장판파1', '장판파1', '강릉', '공안', '계양', '무릉', '영릉',
  '장사', '부', '성도', '와구관1', '와구관2', '가맹관1', '가맹관2', '정군산',
  '천탕산', '한수', '양평관', '서릉', '이릉', '맥', '남사', '신야2',
  '완1', '완2', '허창1', '허창2', '진창', '장안', '낙양', '업1', '업2', '업3'
];

// Hero HEXBMAP (battle maps) - fixed dimensions based on size
export const HERO_HEXBMAP_CONFIG: AutoMapConfig = {
  tilesetFile: 'output/hero-hexbchp.png',
  mapFile: 'hero/HEXBMAP.R3',
  type: 'size-based',
  sizeMap: {
    230: [46, 5],
    528: [66, 8]
  },
  outputPrefix: 'hero-hexbmap'
};

// Hero SMAP (town maps) - map layer + overlay layer
// Structure: map(32×20) + overlay(32×21) + events
// Uses SMAPBGPL Entry 0 (outdoor tiles)
export const HERO_SMAP_CONFIG: AutoMapConfig = {
  tilesetFile: 'output/hero-smapbgpl-entry0.png',
  mapFile: 'hero/SMAP.R3',
  type: 'smap',
  outputPrefix: 'hero-smap'
};

// Hero PMAP (palace/place maps) - map layer only (excludes movement layer)
// Structure: map(32×h) + movement(31×(h-1)) + events
// Uses SMAPBGPL Entry 1 (indoor tiles)
export const HERO_PMAP_CONFIG: AutoMapConfig = {
  tilesetFile: 'output/hero-smapbgpl-entry1.png',
  mapFile: 'hero/PMAP.R3',
  type: 'pmap',
  outputPrefix: 'hero-pmap'
};

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const renderer = new MapRenderer();

  const mapType = args[0] || 'all';

  switch (mapType) {
    case 'world':
    case 'mmap':
      console.log('Rendering Hero world maps (MMAP)...\n');
      renderer.renderAll(HERO_WORLDMAP_CONFIG, 'output');
      break;

    case 'hexz':
    case 'field':
      console.log('Rendering Hero field maps (HEXZMAP)...\n');
      renderer.renderAuto(HERO_HEXZMAP_CONFIG, 'output');
      break;

    case 'hexb':
    case 'battle':
      console.log('Rendering Hero battle maps (HEXBMAP)...\n');
      renderer.renderAuto(HERO_HEXBMAP_CONFIG, 'output');
      break;

    case 'smap':
    case 'town':
      console.log('Rendering Hero town maps (SMAP)...\n');
      renderer.renderAuto(HERO_SMAP_CONFIG, 'output');
      break;

    case 'pmap':
    case 'palace':
      console.log('Rendering Hero palace maps (PMAP)...\n');
      renderer.renderAuto(HERO_PMAP_CONFIG, 'output');
      break;

    case 'all':
      console.log('Rendering all Hero maps...\n');
      console.log('=== World Maps (MMAP) ===');
      renderer.renderAll(HERO_WORLDMAP_CONFIG, 'output');
      console.log('\n=== Field Maps (HEXZMAP) ===');
      renderer.renderAuto(HERO_HEXZMAP_CONFIG, 'output');
      console.log('\n=== Battle Maps (HEXBMAP) ===');
      renderer.renderAuto(HERO_HEXBMAP_CONFIG, 'output');
      console.log('\n=== Town Maps (SMAP) ===');
      renderer.renderAuto(HERO_SMAP_CONFIG, 'output');
      console.log('\n=== Palace Maps (PMAP) ===');
      renderer.renderAuto(HERO_PMAP_CONFIG, 'output');
      break;

    default:
      console.log('Usage:');
      console.log('  npx ts-node map-renderer.ts [type]');
      console.log('');
      console.log('Types:');
      console.log('  all     - Render all maps (default)');
      console.log('  world   - World maps (MMAP)');
      console.log('  field   - Field/zone maps (HEXZMAP)');
      console.log('  battle  - Battle maps (HEXBMAP)');
      console.log('  town    - Town maps (SMAP)');
      console.log('  palace  - Palace maps (PMAP)');
  }
}

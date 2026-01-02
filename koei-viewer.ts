/**
 * KoeiViewer - Main application for viewing KOEI game images
 * Ported from koei_viewer.cpp (SDL2 GUI removed, PNG output only)
 */

import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import { KoeiImageDecoder, KoeiImage, RGB } from './koei-image';
import { LS11Decoder } from './ls11-decoder';

const BITS_PER_BYTE = 8;
const DEFAULT_TARGET_WIDTH = 1280;

export interface ImageConfig {
  ls11: boolean;
  default_width: number;
  default_height: number;
  align_length: number;
  bpp: number;
  tiled: boolean;
  big_endian: boolean;
  size_variations?: { width: number; height: number }[];
  skip_header_length?: number;
  grid_cols?: number;
  chip_height?: number;  // 세로로 긴 이미지를 이 높이로 분할하여 표시
  max_images?: number;   // 최대 이미지 개수 제한
}

export interface RenderOptions {
  imageFile: string;
  paletteFile: string;
  configPath?: string;
  outputFile?: string;
  targetWidth?: number;
}

export class KoeiViewer {
  private decoder: KoeiImageDecoder;
  private ls11Decoder: LS11Decoder;
  private config: Record<string, ImageConfig>;

  constructor(configPath: string = 'config.json') {
    this.decoder = new KoeiImageDecoder();
    this.ls11Decoder = new LS11Decoder();
    this.config = {};

    // Load config
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configContent);
    }
  }

  /**
   * Count images in non-LS11 file
   */
  private countNonLs11Images(rawBuffer: Uint8Array, config: ImageConfig): number {
    const { default_width, default_height, bpp, skip_header_length = 0 } = config;
    const imageDataSize = (default_width * default_height * bpp) / BITS_PER_BYTE;
    const totalBlockSize = skip_header_length + imageDataSize;
    return Math.floor(rawBuffer.length / totalBlockSize);
  }

  /**
   * Count images in LS11 file
   */
  private countLs11Images(rawBuffer: Uint8Array): number {
    let count = 0;
    this.ls11Decoder.decode(rawBuffer, () => { count++; });
    return count;
  }

  /**
   * Put a pixel on the PNG image
   */
  private putPixel(png: PNG, x: number, y: number, rgb: RGB, scale: number = 1): void {
    for (let sy = 0; sy < scale; sy++) {
      for (let sx = 0; sx < scale; sx++) {
        const px = x * scale + sx;
        const py = y * scale + sy;
        if (px >= 0 && px < png.width && py >= 0 && py < png.height) {
          const idx = (png.width * py + px) << 2;
          png.data[idx] = rgb.r;
          png.data[idx + 1] = rgb.g;
          png.data[idx + 2] = rgb.b;
          png.data[idx + 3] = 255; // Alpha
        }
      }
    }
  }

  /**
   * Render a non-LS11 compressed image
   */
  private renderNonLs11(
    png: PNG,
    rawBuffer: Uint8Array,
    config: ImageConfig,
    alignLengthOverride: number,
    gridCols: number
  ): void {
    const { default_width, default_height, bpp, tiled, big_endian, skip_header_length = 0 } = config;
    const imageDataSize = (default_width * default_height * bpp) / BITS_PER_BYTE;
    const totalBlockSize = skip_header_length + imageDataSize;
    const imageCount = Math.floor(rawBuffer.length / totalBlockSize);

    for (let index = 0; index < imageCount; index++) {
      const blockStart = totalBlockSize * index;
      const imageStart = blockStart + skip_header_length;
      const imageData = rawBuffer.slice(imageStart, imageStart + imageDataSize);

      const image = this.decoder.readImage(
        imageData,
        default_width,
        default_height,
        alignLengthOverride,
        bpp,
        big_endian
      );

      const gridX = index % gridCols;
      const gridY = Math.floor(index / gridCols);
      const x = gridX * default_width;
      const y = gridY * default_height;

      if (tiled) {
        this.renderTiled(png, image, x, y, default_width, default_height);
      } else {
        this.renderNormal(png, image, x, y);
      }
    }
  }

  /**
   * Render an LS11 compressed image
   */
  private renderLs11(
    png: PNG,
    rawBuffer: Uint8Array,
    config: ImageConfig,
    alignLengthOverride: number,
    gridCols: number
  ): void {
    const { default_width, default_height, bpp, tiled, big_endian, chip_height, max_images } = config;
    const displayHeight = chip_height || default_height;
    let index = 0;
    let imageIndex = 0;

    this.ls11Decoder.decode(rawBuffer, (buf: Uint8Array, size: number) => {
      // Skip if max_images limit reached
      if (max_images && imageIndex >= max_images) {
        imageIndex++;
        return;
      }
      imageIndex++;

      const image = this.decoder.readImage(
        buf,
        default_width,
        default_height,
        alignLengthOverride,
        bpp,
        big_endian
      );

      // Split into chips if chip_height is set
      const chipsPerImage = chip_height ? Math.floor(default_height / chip_height) : 1;

      for (let chipIdx = 0; chipIdx < chipsPerImage; chipIdx++) {
        const gridX = index % gridCols;
        const gridY = Math.floor(index / gridCols);
        const destX = gridX * default_width;
        const destY = gridY * displayHeight;
        const srcYOffset = chipIdx * displayHeight;

        if (tiled) {
          this.renderTiledChip(png, image, destX, destY, default_width, displayHeight, srcYOffset);
        } else {
          this.renderNormalChip(png, image, destX, destY, displayHeight, srcYOffset);
        }

        index++;
      }
    });
  }

  /**
   * Render a chip (portion) of an image normally
   */
  private renderNormalChip(
    png: PNG,
    image: KoeiImage,
    offsetX: number,
    offsetY: number,
    chipHeight: number,
    srcYOffset: number
  ): void {
    for (let i = 0; i < chipHeight; i++) {
      for (let j = 0; j < image.width; j++) {
        const colorIndex = this.decoder.getIndexImage(image, srcYOffset + i, j);
        const rgb = this.decoder.indexToRgb(colorIndex);
        this.putPixel(png, offsetX + j, offsetY + i, rgb);
      }
    }
  }

  /**
   * Render a chip with 16x16 tile layout
   */
  private renderTiledChip(
    png: PNG,
    image: KoeiImage,
    offsetX: number,
    offsetY: number,
    width: number,
    chipHeight: number,
    srcYOffset: number
  ): void {
    const tilesPerRow = width / 16;
    const tileRows = chipHeight / 16;
    const srcTileRowOffset = srcYOffset / 16;

    for (let tileRow = 0; tileRow < tileRows; tileRow++) {
      for (let tileCol = 0; tileCol < tilesPerRow; tileCol++) {
        const srcTileIdx = ((srcTileRowOffset + tileRow) * tilesPerRow + tileCol) * 256;
        for (let k = 0; k < 16; k++) {
          for (let l = 0; l < 16; l++) {
            const rgb = this.decoder.indexToRgb(image.buf[srcTileIdx + k * 16 + l]);
            this.putPixel(png, offsetX + tileCol * 16 + l, offsetY + tileRow * 16 + k, rgb);
          }
        }
      }
    }
  }

  /**
   * Render image normally (pixel by pixel)
   */
  private renderNormal(png: PNG, image: KoeiImage, offsetX: number, offsetY: number): void {
    for (let i = 0; i < image.height; i++) {
      for (let j = 0; j < image.width; j++) {
        const colorIndex = this.decoder.getIndexImage(image, i, j);
        const rgb = this.decoder.indexToRgb(colorIndex);
        this.putPixel(png, offsetX + j, offsetY + i, rgb);
      }
    }
  }

  /**
   * Render image with 16x16 tile layout
   */
  private renderTiled(
    png: PNG,
    image: KoeiImage,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number
  ): void {
    let srcIndex = 0;
    for (let i = 0; i < height / 16; i++) {
      for (let j = 0; j < width / 16; j++) {
        for (let k = 0; k < 16; k++) {
          for (let l = 0; l < 16; l++) {
            const rgb = this.decoder.indexToRgb(image.buf[srcIndex++]);
            this.putPixel(png, offsetX + j * 16 + l, offsetY + i * 16 + k, rgb);
          }
        }
      }
    }
  }

  /**
   * Render image and return PNG object
   */
  render(options: RenderOptions): PNG {
    const {
      imageFile,
      paletteFile,
      targetWidth = DEFAULT_TARGET_WIDTH,
    } = options;

    // Read palette
    const paletteData = fs.readFileSync(paletteFile);
    this.decoder.readPalette(new Uint8Array(paletteData));

    // Read image file
    const rawBuffer = new Uint8Array(fs.readFileSync(imageFile));

    // Get base filename for config lookup
    const baseFilename = path.basename(imageFile);
    const config = this.config[baseFilename];

    if (!config) {
      throw new Error(`No preset information for: ${baseFilename}`);
    }

    const { default_width, default_height, chip_height } = config;
    const alignLengthOverride = config.align_length;

    // Determine actual display dimensions
    const displayWidth = default_width;
    const displayHeight = chip_height || default_height;

    // Count images (considering chip splitting and max_images limit)
    let imageCount: number;
    if (config.ls11) {
      let baseCount = this.countLs11Images(rawBuffer);
      if (config.max_images && baseCount > config.max_images) {
        baseCount = config.max_images;
      }
      const chipsPerImage = chip_height ? Math.floor(default_height / chip_height) : 1;
      imageCount = baseCount * chipsPerImage;
    } else {
      let baseCount = this.countNonLs11Images(rawBuffer, config);
      if (config.max_images && baseCount > config.max_images) {
        baseCount = config.max_images;
      }
      const chipsPerImage = chip_height ? Math.floor(default_height / chip_height) : 1;
      imageCount = baseCount * chipsPerImage;
    }

    // Calculate grid columns: use config value or fit to target width
    let gridCols = config.grid_cols || Math.floor(targetWidth / displayWidth);

    // If fewer images than columns, reduce columns to fit
    if (imageCount < gridCols) {
      gridCols = imageCount;
    }

    const gridRows = Math.ceil(imageCount / gridCols);

    // Calculate output dimensions
    const outputWidth = gridCols * displayWidth;
    const outputHeight = gridRows * displayHeight;

    console.log(`이미지 ${imageCount}개, ${gridCols}x${gridRows} 그리드, 출력 크기: ${outputWidth}x${outputHeight}`);

    // Create PNG
    const png = new PNG({
      width: outputWidth,
      height: outputHeight,
      colorType: 6, // RGBA
    });

    // Fill with black
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (png.width * y + x) << 2;
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 255;
      }
    }

    // Render
    if (config.ls11) {
      this.renderLs11(png, rawBuffer, config, alignLengthOverride, gridCols);
    } else {
      this.renderNonLs11(png, rawBuffer, config, alignLengthOverride, gridCols);
    }

    return png;
  }

  /**
   * Save PNG to file
   */
  savePng(png: PNG, outputPath: string): void {
    const buffer = PNG.sync.write(png);
    fs.writeFileSync(outputPath, buffer);
  }

  /**
   * Render and save to file
   */
  renderToFile(options: RenderOptions): void {
    const png = this.render(options);
    const outputFile = options.outputFile || 'output.png';
    this.savePng(png, outputFile);
    console.log(`Image saved to: ${outputFile}`);
  }
}

/**
 * CLI entry point
 */
export function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: koei-viewer <image> <palette> [output.png]');
    console.log('   ex) koei-viewer KAODATA.DAT SAM3KAO.PAL output.png');
    process.exit(1);
  }

  const imageFile = args[0];
  const paletteFile = args[1];
  const outputFile = args[2] || 'output.png';

  // Find config.json in the same directory as image file or current directory
  let configPath = 'config.json';
  const imageDir = path.dirname(imageFile);
  const imageDirConfig = path.join(imageDir, 'config.json');
  if (fs.existsSync(imageDirConfig)) {
    configPath = imageDirConfig;
  }

  const viewer = new KoeiViewer(configPath);
  viewer.renderToFile({
    imageFile,
    paletteFile,
    outputFile,
  });
}

// Run if executed directly
if (require.main === module) {
  main();
}

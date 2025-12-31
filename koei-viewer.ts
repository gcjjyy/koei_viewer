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
const DEFAULT_WINDOW_WIDTH = 640;
const DEFAULT_WINDOW_HEIGHT = 400;

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
}

export interface RenderOptions {
  imageFile: string;
  paletteFile: string;
  configPath?: string;
  outputFile?: string;
  windowWidth?: number;
  windowHeight?: number;
}

export class KoeiViewer {
  private decoder: KoeiImageDecoder;
  private ls11Decoder: LS11Decoder;
  private config: Record<string, ImageConfig>;
  private windowWidth: number;
  private windowHeight: number;

  constructor(configPath: string = 'config.json') {
    this.decoder = new KoeiImageDecoder();
    this.ls11Decoder = new LS11Decoder();
    this.config = {};
    this.windowWidth = DEFAULT_WINDOW_WIDTH;
    this.windowHeight = DEFAULT_WINDOW_HEIGHT;

    // Load config
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configContent);
    }
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
    alignLengthOverride: number
  ): void {
    const { default_width, default_height, bpp, tiled, big_endian, skip_header_length = 0 } = config;
    const imageDataSize = (default_width * default_height * bpp) / BITS_PER_BYTE;
    const totalBlockSize = skip_header_length + imageDataSize;
    const imageCount = Math.floor(rawBuffer.length / totalBlockSize);

    let x = 0;
    let y = 0;

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

      if (tiled) {
        this.renderTiled(png, image, x, y, default_width, default_height);
      } else {
        this.renderNormal(png, image, x, y);
      }

      x += default_width;
      if (x > this.windowWidth) {
        x = 0;
        y += default_height;
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
    alignLengthOverride: number
  ): void {
    const { default_width, default_height, bpp, tiled, big_endian } = config;
    let x = 0;
    let y = 0;

    this.ls11Decoder.decode(rawBuffer, (buf: Uint8Array, size: number) => {
      const image = this.decoder.readImage(
        buf,
        default_width,
        default_height,
        alignLengthOverride,
        bpp,
        big_endian
      );

      if (tiled) {
        this.renderTiled(png, image, x, y, default_width, default_height);
      } else {
        this.renderNormal(png, image, x, y);
      }

      x += default_width;
      if (x > this.windowWidth) {
        x = 0;
        y += default_height;
      }
    });
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
      windowWidth = DEFAULT_WINDOW_WIDTH,
      windowHeight = DEFAULT_WINDOW_HEIGHT,
    } = options;

    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;

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

    const alignLengthOverride = config.align_length;

    // Create PNG
    const png = new PNG({
      width: windowWidth,
      height: windowHeight,
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
      this.renderLs11(png, rawBuffer, config, alignLengthOverride);
    } else {
      this.renderNonLs11(png, rawBuffer, config, alignLengthOverride);
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

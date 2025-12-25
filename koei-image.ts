/**
 * KoeiImage - Image decoder for KOEI game formats
 * Ported from koei_image.cpp/.h
 */

import { BufReader } from './buf-reader';

const BITS_PER_BYTE = 8;

/**
 * RGB color structure
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Image structure with indexed pixel data
 */
export interface KoeiImage {
  width: number;
  height: number;
  buf: Uint8Array;
}

/**
 * KoeiImageDecoder - Handles palette and image decoding
 */
export class KoeiImageDecoder {
  private palette: RGB[] = [];

  /**
   * Read palette data from raw bytes
   * @param data - Raw palette data (RGB triplets)
   */
  readPalette(data: Uint8Array): void {
    this.palette = [];
    for (let i = 0; i < data.length; i += 3) {
      if (this.palette.length >= 16) break;
      this.palette.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
      });
    }
  }

  /**
   * Get palette color at index
   * @param index - Palette index (0-15)
   * @returns RGB color
   */
  getPalette(index: number): RGB {
    if (index >= 0 && index < this.palette.length) {
      return this.palette[index];
    }
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Convert palette index to RGB color
   * @param index - Palette index
   * @returns RGB color
   */
  indexToRgb(index: number): RGB {
    if (index >= 0 && index < 16) {
      return this.getPalette(index);
    }
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Extract a single bit from a byte array at given position
   * @param bytes - Byte array
   * @param position - Bit position (0-based)
   * @returns Bit value (0 or 1)
   */
  static bitFromBytes(bytes: Uint8Array, position: number): number {
    const byteIndex = Math.floor(position / BITS_PER_BYTE);
    const bitPosition = position % BITS_PER_BYTE;
    return (bytes[byteIndex] & (0x80 >> bitPosition)) >> (7 - bitPosition);
  }

  /**
   * Read and decode image data using bitplane format
   * @param buf - Raw image data buffer
   * @param width - Image width in pixels
   * @param height - Image height in pixels
   * @param alignLength - Alignment length for bitplane rows
   * @param bpp - Bits per pixel (color depth)
   * @param leftToRight - Bit order (true: MSB first, false: LSB first)
   * @returns Decoded image with indexed pixels
   */
  readImage(
    buf: Uint8Array,
    width: number,
    height: number,
    alignLength: number,
    bpp: number,
    leftToRight: boolean
  ): KoeiImage {
    const image: KoeiImage = {
      width,
      height,
      buf: new Uint8Array(width * height),
    };

    // Initialize buffer to zero
    image.buf.fill(0);

    const reader = new BufReader(buf, true);

    let position = 0;
    const imageRawSize = (width * height * bpp) / BITS_PER_BYTE;
    const iterations = Math.floor(imageRawSize / (alignLength * bpp));

    for (let i = 0; i < iterations; i++) {
      // Read bitplane data for current row segment
      const pixels = reader.readBytes(alignLength * bpp);

      // Process each pixel in the segment
      for (let j = 0; j < alignLength * BITS_PER_BYTE; j++) {
        image.buf[position] = 0;

        // Combine bits from all bitplanes to form pixel index
        for (let k = 0; k < bpp; k++) {
          const bitplaneOffset = alignLength * k;
          const bit = KoeiImageDecoder.bitFromBytes(
            pixels.slice(bitplaneOffset),
            j
          );

          if (leftToRight) {
            // MSB first: higher bitplanes go to higher bits
            image.buf[position] |= bit << (bpp - k - 1);
          } else {
            // LSB first: bitplanes map directly
            image.buf[position] |= bit << k;
          }
        }
        position++;
      }
    }

    return image;
  }

  /**
   * Get pixel index at given coordinates
   * @param image - Image data
   * @param row - Row coordinate
   * @param col - Column coordinate
   * @returns Palette index at the specified position
   */
  getIndexImage(image: KoeiImage, row: number, col: number): number {
    return image.buf[image.width * row + col];
  }
}

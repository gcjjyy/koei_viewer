/**
 * LS11Decoder - LS11 format decoder
 * Ported from ls11_decoder.cpp/.h
 */

import { BufReader } from './buf-reader';

export interface FatEntry {
  compSize: number;
  uncompSize: number;
  offset: number;
}

export type DecodeCallback = (buf: Uint8Array, size: number) => void;

export class LS11Decoder {
  private header: Uint8Array = new Uint8Array(16);
  private dict: Uint8Array = new Uint8Array(256);
  private fatEntries: FatEntry[] = [];
  private compPos: number = 0;
  private bitPos: number = 7;

  private static readonly MR = 3;

  /**
   * Decode LS11 format buffer and call callback for each decoded entry
   */
  decode(buf: Uint8Array, onDecode: DecodeCallback): void {
    if (!buf) {
      return;
    }

    const reader = new BufReader(buf, true); // big endian
    this.fatEntries = [];

    // Read header and dictionary
    this.header = reader.readBytes(16);
    this.dict = reader.readBytes(256);

    // Decode FAT (File Allocation Table)
    while (!reader.isEnd()) {
      const fatEntry: FatEntry = {
        compSize: reader.readUint32(),
        uncompSize: reader.readUint32(),
        offset: reader.readUint32(),
      };

      if (fatEntry.compSize === 0) {
        break;
      }

      this.fatEntries.push(fatEntry);
    }

    // Decode DAT (Data entries)
    for (let i = 0; i < this.fatEntries.length; i++) {
      const entry = this.fatEntries[i];
      const compData = new Uint8Array(entry.compSize);
      const uncompData = new Uint8Array(entry.uncompSize);

      // Read compressed data
      reader.seek(entry.offset);
      const readData = reader.readBytes(entry.compSize);
      compData.set(readData);

      // Decompress or copy
      if (entry.compSize === entry.uncompSize) {
        // No compression
        uncompData.set(compData);
      } else {
        // Decompress
        this.fatDecode(compData, entry.compSize, uncompData, entry.uncompSize);
      }

      // Call callback with decompressed data
      if (onDecode) {
        onDecode(uncompData, entry.uncompSize);
      }
    }
  }

  /**
   * Get variable-length code from compressed bitstream
   * Reads 1-bit count followed by N-bit value
   */
  private getCode(comp: Uint8Array): number {
    let code1 = 0;
    let code2 = 0;
    let count = 0;
    let bit = 0;

    // Read unary code (count of 1s followed by 0)
    do {
      bit = (comp[this.compPos] >> this.bitPos) & 0x01;
      code1 = (code1 << 1) | bit;
      count++;
      this.bitPos--;
      if (this.bitPos < 0) {
        this.bitPos = 7;
        this.compPos++;
      }
    } while (bit === 1);

    // Read binary code of 'count' bits
    for (let i = 0; i < count; i++) {
      bit = (comp[this.compPos] >> this.bitPos) & 0x01;
      code2 = (code2 << 1) | bit;
      this.bitPos--;
      if (this.bitPos < 0) {
        this.bitPos = 7;
        this.compPos++;
      }
    }

    return code1 + code2;
  }

  /**
   * Decode FAT entry using LZ77-style compression
   * code < 256: dictionary lookup
   * code >= 256: back reference (offset + length)
   */
  private fatDecode(
    comp: Uint8Array,
    compSize: number,
    uncomp: Uint8Array,
    uncompSize: number
  ): void {
    this.compPos = 0;
    let uncompPos = 0;
    this.bitPos = 7;

    while (this.compPos < compSize && uncompPos < uncompSize) {
      const code = this.getCode(comp);

      if (code < 256) {
        // Dictionary lookup
        uncomp[uncompPos] = this.dict[code];
        uncompPos++;
      } else {
        // Back reference
        const offset = code - 256;
        const len = this.getCode(comp) + LS11Decoder.MR;

        for (let i = 0; i < len; i++) {
          uncomp[uncompPos] = uncomp[uncompPos - offset];
          uncompPos++;
        }
      }
    }
  }
}

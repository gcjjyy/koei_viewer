/**
 * Unpacker - Extracts packed data files
 * Ported from unpack.cpp
 */

import * as fs from 'fs';
import * as path from 'path';
import { BufReader } from './buf-reader';

export interface UnpackEntry {
  addr: number;
  size: number;
}

export interface UnpackResult {
  entries: UnpackEntry[];
  headerSize: number;
  data: Uint8Array[];
}

export class Unpacker {
  /**
   * Unpack a packed data file
   * @param buf The packed file buffer
   * @returns UnpackResult containing entries, header size, and extracted data
   */
  static unpack(buf: Uint8Array): UnpackResult {
    const reader = new BufReader(buf, false);
    const entries: UnpackEntry[] = [];

    let index = 0;
    let dataSum = 0;
    const filesize = buf.length;

    // Parse FAT (File Allocation Table)
    while (!reader.isEnd()) {
      const address = reader.readUint32();
      const datasize = reader.readUint16();
      const curpos = reader.getSeekPos();

      const entry: UnpackEntry = {
        addr: address,
        size: datasize
      };
      entries.push(entry);

      dataSum += datasize;

      // Check if we've reached the data section
      if (curpos + dataSum >= filesize) {
        console.log('\nAll unpacked!');
        console.log(`Count: ${index + 1}`);
        break;
      }

      index++;
    }

    // Calculate header size (each entry is 4 bytes addr + 2 bytes size)
    const headerSize = entries.length * 6;
    console.log(`Count: ${entries.length}`);
    console.log(`Header size: ${headerSize}`);

    // Extract data for each entry
    const data: Uint8Array[] = [];
    for (let i = 0; i < entries.length; i++) {
      reader.seek(entries[i].addr + headerSize);
      const extractedData = reader.readBytes(entries[i].size);
      data.push(extractedData);
    }

    return {
      entries,
      headerSize,
      data
    };
  }

  /**
   * Unpack a packed file and save entries to a directory
   * @param buf The packed file buffer
   * @param outputDir The output directory path
   */
  static saveToDirectory(buf: Uint8Array, outputDir: string): void {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const reader = new BufReader(buf, false);
    const entries: UnpackEntry[] = [];

    let index = 0;
    let dataSum = 0;
    const filesize = buf.length;

    // Parse FAT (File Allocation Table)
    while (!reader.isEnd()) {
      const address = reader.readUint32();
      const datasize = reader.readUint16();
      const curpos = reader.getSeekPos();

      const entry: UnpackEntry = {
        addr: address,
        size: datasize
      };
      entries.push(entry);

      dataSum += datasize;

      // Check if we've reached the data section
      if (curpos + dataSum >= filesize) {
        console.log('\nAll unpacked!');
        console.log(`Count: ${index + 1}`);
        break;
      }

      index++;
    }

    // Calculate header size
    const headerSize = entries.length * 6;
    console.log(`Count: ${entries.length}`);
    console.log(`Header size: ${headerSize}`);

    // Extract and save each entry
    for (let i = 0; i < entries.length; i++) {
      const filename = `${String(i).padStart(3, '0')}.UNPACKED`;
      const filepath = path.join(outputDir, filename);

      reader.seek(entries[i].addr + headerSize);
      const extractedData = reader.readBytes(entries[i].size);

      fs.writeFileSync(filepath, extractedData);
    }
  }
}

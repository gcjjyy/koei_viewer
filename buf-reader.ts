/**
 * BufReader - Binary buffer reader utility
 * Ported from buf_reader.cpp/.h
 */

export class BufReader {
  private buffer: Uint8Array;
  private dataView: DataView;
  private _size: number;
  private _seekPos: number = 0;
  private _bigEndian: boolean;

  constructor(buf: Uint8Array, bigEndian: boolean = false) {
    this.buffer = buf;
    this._size = buf.length;
    this._bigEndian = bigEndian;
    this.dataView = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  get size(): number {
    return this._size;
  }

  get seekPos(): number {
    return this._seekPos;
  }

  get bigEndian(): boolean {
    return this._bigEndian;
  }

  /**
   * Seek to absolute position
   */
  seek(pos: number): void {
    this._seekPos = pos;
  }

  /**
   * Seek relative to current position
   */
  rseek(amount: number): void {
    this._seekPos += amount;
  }

  /**
   * Check if at end of buffer
   */
  isEnd(): boolean {
    return this._seekPos >= this._size;
  }

  /**
   * Get current seek position
   */
  getSeekPos(): number {
    return this._seekPos;
  }

  /**
   * Read raw bytes from buffer
   */
  readBytes(length: number): Uint8Array {
    const result = this.buffer.slice(this._seekPos, this._seekPos + length);
    this._seekPos += length;
    return result;
  }

  /**
   * Read signed 8-bit integer
   */
  readInt8(): number {
    const value = this.dataView.getInt8(this._seekPos);
    this._seekPos += 1;
    return value;
  }

  /**
   * Read signed 16-bit integer (endian-aware)
   */
  readInt16(): number {
    const value = this.dataView.getInt16(this._seekPos, !this._bigEndian);
    this._seekPos += 2;
    return value;
  }

  /**
   * Read signed 32-bit integer (endian-aware)
   */
  readInt32(): number {
    const value = this.dataView.getInt32(this._seekPos, !this._bigEndian);
    this._seekPos += 4;
    return value;
  }

  /**
   * Read unsigned 8-bit integer
   */
  readUint8(): number {
    const value = this.dataView.getUint8(this._seekPos);
    this._seekPos += 1;
    return value;
  }

  /**
   * Read unsigned 16-bit integer (endian-aware)
   */
  readUint16(): number {
    const value = this.dataView.getUint16(this._seekPos, !this._bigEndian);
    this._seekPos += 2;
    return value;
  }

  /**
   * Read unsigned 32-bit integer (endian-aware)
   */
  readUint32(): number {
    const value = this.dataView.getUint32(this._seekPos, !this._bigEndian);
    this._seekPos += 4;
    return value;
  }
}

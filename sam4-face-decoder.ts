/**
 * 삼국지4 얼굴 데이터 디코더
 * 2단계 압축: 0xFE RLE + 니블 기반 백레퍼런스
 */

// ============================================================================
// Types
// ============================================================================

export interface DecodedFace {
  /** 디코딩된 픽셀 인덱스 (5120 바이트: 64 * 80) */
  raw: Uint8Array;
  /** RGBA 픽셀 데이터 (64 * 80 * 4 바이트) */
  pixels: Uint8Array;
  /** 이미지 너비 */
  width: number;
  /** 이미지 높이 */
  height: number;
}

// ============================================================================
// Constants
// ============================================================================

/** 이미지 크기 */
const IMAGE_WIDTH = 64;
const IMAGE_HEIGHT = 80;

/** 기본 8색 팔레트 (SAM4KAO.PAL) */
const DEFAULT_PALETTE: readonly [number, number, number][] = [
  [47, 31, 0],       // 0: 어두운 갈색
  [31, 63, 127],     // 1: 파랑
  [175, 63, 31],     // 2: 주황/빨강
  [191, 127, 79],    // 3: 밝은 갈색
  [63, 111, 31],     // 4: 녹색
  [63, 127, 143],    // 5: 청록
  [255, 175, 127],   // 6: 살구색
  [207, 207, 175],   // 7: 밝은 회색
];

// ============================================================================
// Decoder Class
// ============================================================================

class Sam4FaceDecoder {
  private compData: Uint8Array;
  private srcPos: number = 0;
  private runCount: number = 0;
  private cachedByte: number = 0;
  private nibbleFlag: number = 0xFFFF;
  private width: number;
  private height: number;

  constructor(imgData: Uint8Array) {
    this.width = imgData[0] | (imgData[1] << 8);
    this.height = imgData[2] | (imgData[3] << 8);
    this.compData = imgData.slice(4);
  }

  /**
   * 바이트 읽기 (0xFE 이스케이프 처리)
   */
  private readByte(): number {
    if (this.runCount > 0) {
      this.runCount--;
      return this.cachedByte;
    }

    if (this.srcPos >= this.compData.length) return 0;
    const b = this.compData[this.srcPos++];

    if (b === 0xFE) {
      if (this.srcPos >= this.compData.length) return 0;
      const next = this.compData[this.srcPos++];

      if (next === 1) {
        this.cachedByte = 0xFE;
        return 0xFE;
      } else if (next === 0) {
        this.runCount = 255;
        return this.cachedByte;
      } else {
        this.runCount = next - 1;
        return this.cachedByte;
      }
    }

    this.cachedByte = b;
    return b;
  }

  /**
   * 니블 읽기
   */
  private readNibble(): number {
    if (this.nibbleFlag === 0xFFFF) {
      const byte = this.readByte();
      this.nibbleFlag = byte & 0x0F;
      return (byte >> 4) & 0x0F;
    } else {
      const n = this.nibbleFlag;
      this.nibbleFlag = 0xFFFF;
      return n;
    }
  }

  /**
   * 디코딩 실행
   */
  decode(): Uint8Array {
    const pixels = new Uint8Array(this.width * this.height);

    for (let y = 0; y < this.height; y++) {
      const rowOffset = this.readNibble();
      let copyCount = 0;
      let x = 0;

      while (x < this.width) {
        if (copyCount > 0) {
          let srcX: number, srcY: number;

          if (rowOffset & 0x08) {
            srcY = y - rowOffset + 7;
            srcX = x;
          } else {
            srcX = x - rowOffset - 1;
            srcY = y;
          }

          let color = 0;
          if (srcX >= 0 && srcX < this.width && srcY >= 0 && srcY < this.height) {
            color = pixels[srcY * this.width + srcX];
          }

          pixels[y * this.width + x] = color;
          copyCount--;
          x++;
          continue;
        }

        const ctrl = this.readNibble();

        if (ctrl & 0x08) {
          if (ctrl & 0x04) {
            const extra = this.readNibble();
            copyCount = ((ctrl & 0x03) << 4) + extra + 6;
          } else {
            copyCount = (ctrl & 0x03) + 2;
          }
        } else {
          pixels[y * this.width + x] = ctrl & 0x07;
          x++;
        }
      }
    }

    return pixels;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * 압축된 얼굴 데이터를 디코딩합니다.
 * @param data 압축된 데이터 버퍼 (헤더 포함)
 * @param palette 선택적 커스텀 팔레트 (기본: SAM4KAO.PAL)
 * @returns 디코딩된 얼굴 데이터
 */
export function decodeFace(
  data: Uint8Array,
  palette: readonly [number, number, number][] = DEFAULT_PALETTE
): DecodedFace {
  const decoder = new Sam4FaceDecoder(data);
  const raw = decoder.decode();
  const width = decoder.getWidth();
  const height = decoder.getHeight();
  const pixels = convertToPixels(raw, width, height, palette);

  return {
    raw,
    pixels,
    width,
    height,
  };
}

/**
 * 픽셀 인덱스를 RGBA로 변환합니다.
 */
function convertToPixels(
  raw: Uint8Array,
  width: number,
  height: number,
  palette: readonly [number, number, number][]
): Uint8Array {
  const pixels = new Uint8Array(width * height * 4);

  for (let i = 0; i < raw.length; i++) {
    const colorIdx = raw[i] & 0x07;
    const [r, g, b] = palette[colorIdx] ?? [0, 0, 0];

    const offset = i * 4;
    pixels[offset] = r;
    pixels[offset + 1] = g;
    pixels[offset + 2] = b;
    pixels[offset + 3] = 255;
  }

  return pixels;
}

/**
 * 여러 얼굴을 일괄 디코딩합니다.
 */
export function decodeFaces(
  dataArray: Uint8Array[],
  palette?: readonly [number, number, number][]
): DecodedFace[] {
  return dataArray.map(data => decodeFace(data, palette));
}

// ============================================================================
// Export Default Palette
// ============================================================================

export { DEFAULT_PALETTE };

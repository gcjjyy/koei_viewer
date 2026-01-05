/**
 * 삼국지 영걸전 얼굴 데이터 디코더
 * TF-DCE (Takayuki Fujinuma graphic Data Compress & Expand) 형식
 */

// ============================================================================
// Types
// ============================================================================

export interface DecodedFace {
  /** 디코딩된 원시 데이터 (1920 바이트: 640 * 3 플레인) */
  raw: Uint8Array;
  /** 플레인 순서 [S0→P?, S1→P?, S2→P?] */
  planeOrder: readonly [number, number, number];
  /** RGBA 픽셀 데이터 (64 * 80 * 4 바이트) */
  pixels: Uint8Array;
  /** 이미지 너비 */
  width: number;
  /** 이미지 높이 */
  height: number;
}

export type PlaneOrder = readonly [number, number, number];

// ============================================================================
// Constants
// ============================================================================

/** 이미지 크기 */
const IMAGE_WIDTH = 64;
const IMAGE_HEIGHT = 80;

/** 플레인당 바이트 수 */
const PLANE_SIZE = 640;

/** 전체 출력 크기 */
const OUTPUT_SIZE = 1920;

/** VGA 버퍼 크기 */
const VGA_SIZE = 80 * 80;

/** byte7 → 플레인 순서 매핑 */
const PLANE_ORDER_MAP: Record<number, PlaneOrder> = {
  0xc6: [0, 1, 2],
  0xc9: [1, 0, 2],
  0xd2: [0, 2, 1],
  0xd8: [2, 0, 1],
  0xe1: [1, 2, 0],
  0xe4: [2, 1, 0],
};

/** 기본 8색 팔레트 (HERO.PAL) - 게임 스크린샷 기준 정확한 값 */
const DEFAULT_PALETTE: readonly [number, number, number][] = [
  [0, 0, 0],       // 0: 검정
  [0, 186, 117],   // 1: 녹색
  [239, 101, 0],   // 2: 주황
  [255, 207, 85],  // 3: 밝은 노랑
  [32, 69, 170],   // 4: 파랑
  [138, 207, 255], // 5: 하늘색
  [207, 117, 170], // 6: 분홍
  [255, 255, 255], // 7: 흰색
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * 선형 인덱스를 (col, row)로 변환 (지그재그 스캔)
 */
function linearToColRow(linearIdx: number): { col: number; row: number } {
  const col = Math.floor(linearIdx / 80);
  const i = linearIdx % 80;
  const row = col % 2 === 0 ? i : 79 - i;
  return { col, row };
}

/**
 * byte7에서 플레인 순서 결정
 */
export function getPlaneOrder(byte7: number): PlaneOrder {
  return PLANE_ORDER_MAP[byte7] ?? [0, 2, 1];
}

// ============================================================================
// Decoder Class
// ============================================================================

class FaceDataDecoder {
  private buf: Uint8Array;
  private pos: number;
  private output: number[] = [];
  private headerTable: Uint8Array;
  private planeOrder: PlaneOrder;
  private planeMap: number[];
  private cache9x: number[] = [0x00, 0xff, 0x55, 0xaa];
  private vgaPlanes: Uint8Array[] = [
    new Uint8Array(VGA_SIZE),
    new Uint8Array(VGA_SIZE),
    new Uint8Array(VGA_SIZE),
    new Uint8Array(VGA_SIZE),
  ];

  constructor(buf: Uint8Array, dataStart: number, planeOrder: PlaneOrder) {
    this.buf = buf;
    this.pos = dataStart;
    this.headerTable = buf.slice(10, dataStart);
    this.planeOrder = planeOrder;
    this.planeMap = [...planeOrder, 3];
  }

  private read(): number {
    return this.pos < this.buf.length ? this.buf[this.pos++] : -1;
  }

  private getDestPlaneNo(outLen: number = this.output.length): number {
    const section = Math.floor(outLen / PLANE_SIZE);
    return this.planeMap[section] ?? section;
  }

  private mapSelToPlaneNo(sel: number): number {
    if (sel >= 0 && sel < 3) return this.planeMap[sel];
    if (sel === 3) return this.getDestPlaneNo();
    return sel;
  }

  private getVgaAddr(outLen: number): number {
    const planeOffset = outLen % PLANE_SIZE;
    const { col, row } = linearToColRow(planeOffset);
    return row * 80 + col;
  }

  private push(v: number): void {
    const outLen = this.output.length;
    const section = Math.floor(outLen / PLANE_SIZE);
    const vga = this.getVgaAddr(outLen);
    const b = v & 0xff;

    this.output.push(b);

    if (section >= 0 && section < this.planeOrder.length) {
      const planeNo = this.planeMap[section];
      if (planeNo >= 0 && planeNo < 4) {
        this.vgaPlanes[planeNo][vga] = b;
      }
    }
  }

  private getHeaderWord(cmdIdx: number): number {
    const offset = cmdIdx * 2;
    if (offset + 1 < this.headerTable.length) {
      return this.headerTable[offset] | (this.headerTable[offset + 1] << 8);
    }
    return 0;
  }

  private bubbleSwap(cacheIdx: number): void {
    if (cacheIdx > 0) {
      const t = this.cache9x[cacheIdx - 1];
      this.cache9x[cacheIdx - 1] = this.cache9x[cacheIdx];
      this.cache9x[cacheIdx] = t;
    }
  }

  decode(): Uint8Array {
    while (this.output.length < OUTPUT_SIZE && this.pos < this.buf.length) {
      const cmd = this.read();
      if (cmd < 0) break;

      const hiNibble = (cmd >> 4) & 0x0f;
      const loNibble = cmd & 0x0f;

      // 0x00-0x1F: 헤더 테이블 참조
      if (cmd < 0x20) {
        this.handleHeaderTable(cmd);
        continue;
      }

      // 0x2X: 백레퍼런스
      if (hiNibble === 0x02) {
        this.handle2x(loNibble);
        continue;
      }

      // 0x3X: VGA 플레인 읽기 + 회전
      if (hiNibble === 0x03) {
        this.handle3x(loNibble);
        continue;
      }

      // 0x4X: VGA 백레퍼런스
      if (hiNibble === 0x04) {
        this.handle4x(loNibble);
        continue;
      }

      // 0x5X: 플레인 읽기 + 마스킹
      if (hiNibble === 0x05) {
        this.handle5x(cmd, loNibble);
        continue;
      }

      // 0x6X: 2바이트 패턴 반복
      if (hiNibble === 0x06) {
        this.handle6x(loNibble);
        continue;
      }

      // 0x7X: 리터럴 복사
      if (hiNibble === 0x07) {
        this.handle7x(loNibble);
        continue;
      }

      // 0x8X: 니블 회전 패턴
      if (hiNibble === 0x08) {
        this.handle8x(loNibble);
        continue;
      }

      // 0x9X: 확장 명령어
      if (hiNibble === 0x09) {
        this.handle9x(cmd, loNibble);
        continue;
      }

      // 0xA0+: RLE
      if (cmd >= 0xa0) {
        this.handleRle(cmd);
        continue;
      }

      this.push(cmd);
    }

    return new Uint8Array(this.output.slice(0, OUTPUT_SIZE));
  }

  // ========== Command Handlers ==========

  private handleHeaderTable(cmd: number): void {
    const word = this.getHeaderWord(cmd);
    const lo = word & 0xff;
    const hi = (word >> 8) & 0xff;
    const subIdx = ((lo >> 3) & 0x1e) >> 1;

    if (subIdx >= 10) {
      // RLE
      const count = lo - 0x9e;
      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        this.push(hi);
      }
    } else if (subIdx === 4) {
      // VGA 백레퍼런스
      const distance = (lo & 0x0f) + 1;
      const count = hi + 2;
      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        const planeNo = this.getDestPlaneNo();
        const di = this.getVgaAddr(this.output.length);
        const si = di - distance;
        const val = (planeNo >= 0 && planeNo < 4 && si >= 0 && si < VGA_SIZE)
          ? this.vgaPlanes[planeNo][si] : 0;
        this.push(val);
      }
    } else if (subIdx === 8) {
      // 니블 회전 패턴
      const count = (lo & 0x0f) + 1;
      const rotated = ((hi << 4) | (hi >> 4)) & 0xff;
      const ax = (hi << 8) | rotated;
      const rolAx = ((ax << 4) | (ax >> 12)) & 0xffff;
      const val1 = (rolAx >> 8) & 0xff;
      const val2 = rolAx & 0xff;
      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        this.push(val1);
        if (this.output.length < OUTPUT_SIZE) this.push(val2);
      }
    } else if (subIdx === 7) {
      // 리터럴
      if ((lo & 0x0f) === 0) {
        this.push(hi);
      } else {
        this.push(((lo & 0x0f) << 4) | (lo & 0x0f));
      }
    } else if (subIdx === 2) {
      // 선형 백레퍼런스
      const count = (lo & 0x0f) + 3;
      const distance = hi > 0 ? hi : 1;
      const srcStart = this.output.length - distance;
      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        const srcIdx = srcStart + (i % distance);
        this.push(srcIdx >= 0 && srcIdx < this.output.length ? this.output[srcIdx] : 0);
      }
    } else if (subIdx === 5) {
      // 플레인 읽기 + 마스킹
      const count = hi + 2;
      const readSel = (lo >> 2) & 3;
      const srcPlaneNo = this.mapSelToPlaneNo(readSel);
      const cacheIdx = lo & 3;
      const pattern = this.cache9x[cacheIdx] & 0xff;
      this.bubbleSwap(cacheIdx);
      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        const vgaAddr = this.getVgaAddr(this.output.length);
        const srcVal = (srcPlaneNo >= 0 && srcPlaneNo < 4) ? this.vgaPlanes[srcPlaneNo][vgaAddr] : 0;
        this.push(srcVal & pattern);
      }
    } else if (subIdx === 3) {
      // VGA 플레인 읽기 + 회전
      const count = hi + 2;
      const readSel = (lo >> 2) & 3;
      const srcPlaneNo = this.mapSelToPlaneNo(readSel);
      const rotIdx = lo & 3;
      const curPos = this.output.length;
      let rotBits = 0, doNot = false;
      if (curPos >= PLANE_SIZE) {
        if (rotIdx === 1) doNot = true;
        else if (rotIdx === 2) rotBits = -1;
        else if (rotIdx === 3) rotBits = 1;
      }
      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        let val: number;
        if (srcPlaneNo >= 0 && curPos >= PLANE_SIZE) {
          const vgaAddr = this.getVgaAddr(this.output.length);
          val = this.vgaPlanes[srcPlaneNo][vgaAddr];
        } else {
          val = this.output.length > 0 ? this.output[this.output.length - 1] : 0;
        }
        if (doNot) val = ~val & 0xff;
        else if (rotBits > 0) val = ((val << rotBits) | (val >> (8 - rotBits))) & 0xff;
        else if (rotBits < 0) val = ((val >> -rotBits) | (val << (8 + rotBits))) & 0xff;
        this.push(val);
      }
    } else if (subIdx === 9) {
      // 플레인 읽기 (마스킹 없음)
      const count = hi + 2;
      const readSel = (lo >> 2) & 3;
      const srcPlaneNo = this.mapSelToPlaneNo(readSel);
      const cacheIdx = lo & 3;
      this.bubbleSwap(cacheIdx);
      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        const vgaAddr = this.getVgaAddr(this.output.length);
        const srcVal = (srcPlaneNo >= 0 && srcPlaneNo < 4) ? this.vgaPlanes[srcPlaneNo][vgaAddr] : 0;
        this.push(srcVal);
      }
    }
  }

  private handle2x(loNibble: number): void {
    const param = this.read();
    const count = loNibble + 3;
    const distance = param;
    const srcStart = this.output.length - distance;
    for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
      const srcIdx = srcStart + i;
      this.push(srcIdx >= 0 && srcIdx < this.output.length ? this.output[srcIdx] : 0);
    }
  }

  private handle3x(loNibble: number): void {
    const p = this.read();
    const count = p + 2;
    const curPos = this.output.length;
    const readSel = (loNibble >> 2) & 3;
    const rotIdx = loNibble & 3;
    const srcPlaneNo = this.mapSelToPlaneNo(readSel);

    let rotBits = 0, doNot = false;
    if (curPos >= PLANE_SIZE) {
      if (rotIdx === 1) doNot = true;
      else if (rotIdx === 2) rotBits = -1;
      else if (rotIdx === 3) rotBits = 1;
    }

    for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
      let val: number;
      if (srcPlaneNo >= 0 && curPos >= PLANE_SIZE) {
        const vgaAddr = this.getVgaAddr(this.output.length);
        val = this.vgaPlanes[srcPlaneNo][vgaAddr];
      } else {
        val = this.output.length > 0 ? this.output[this.output.length - 1] : 0;
      }
      if (doNot) val = ~val & 0xff;
      else if (rotBits > 0) val = ((val << rotBits) | (val >> (8 - rotBits))) & 0xff;
      else if (rotBits < 0) val = ((val >> -rotBits) | (val << (8 + rotBits))) & 0xff;
      this.push(val);
    }
  }

  private handle4x(loNibble: number): void {
    const lengthByte = this.read();
    if (lengthByte < 0) return;

    const count = lengthByte + 2;
    const distance = loNibble + 1;

    for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
      const planeNo = this.getDestPlaneNo();
      const di = this.getVgaAddr(this.output.length);
      const si = di - distance;
      const val = (planeNo >= 0 && planeNo < 4 && si >= 0 && si < VGA_SIZE)
        ? this.vgaPlanes[planeNo][si] : 0;
      this.push(val);
    }
  }

  private handle5x(cmd: number, loNibble: number): void {
    const branchVal = (cmd & 0x0c) >> 1;

    // 0x5C-0x5F: 특수 분기
    if (branchVal === 0x06) {
      const cacheIdx = cmd & 3;
      const p1 = this.read();
      const p2 = this.read();
      const count = p2 + 2;

      const oldCache2 = this.cache9x[2];
      this.cache9x[2] = p1;
      this.cache9x[3] = oldCache2;

      const srcPlaneNo = this.mapSelToPlaneNo(cacheIdx);

      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        const vgaAddr = this.getVgaAddr(this.output.length);
        const srcVal = (srcPlaneNo >= 0 && srcPlaneNo < 4) ? this.vgaPlanes[srcPlaneNo][vgaAddr] : 0;
        this.push(srcVal & p1);
      }
      return;
    }

    const lengthByte = this.read();
    if (lengthByte < 0) return;

    const count = lengthByte + 2;
    const readSel = (cmd >> 2) & 3;
    const srcPlaneNo = this.mapSelToPlaneNo(readSel);
    const cacheIdx = cmd & 3;
    const pattern = this.cache9x[cacheIdx] & 0xff;

    this.bubbleSwap(cacheIdx);

    for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
      const vgaAddr = this.getVgaAddr(this.output.length);
      const srcVal = (srcPlaneNo >= 0 && srcPlaneNo < 4) ? this.vgaPlanes[srcPlaneNo][vgaAddr] : 0;
      this.push(srcVal & pattern);
    }
  }

  private handle6x(loNibble: number): void {
    const count = loNibble + 1;
    const val1 = this.read();
    const val2 = this.read();
    if (val1 < 0 || val2 < 0) return;

    for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
      this.push(val1);
      if (this.output.length < OUTPUT_SIZE) this.push(val2);
    }
  }

  private handle7x(loNibble: number): void {
    const count = loNibble + 1;
    for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
      const b = this.read();
      if (b >= 0) this.push(b);
    }
  }

  private handle8x(loNibble: number): void {
    const count = loNibble + 1;
    const val = this.read();
    if (val < 0) return;

    const rotated = ((val << 4) | (val >> 4)) & 0xff;
    const ax = (val << 8) | rotated;
    const rolAx = ((ax << 4) | (ax >> 12)) & 0xffff;
    const val1 = (rolAx >> 8) & 0xff;
    const val2 = rolAx & 0xff;

    for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
      this.push(val1);
      if (this.output.length < OUTPUT_SIZE) this.push(val2);
    }
  }

  private handle9x(cmd: number, loNibble: number): void {
    const isExt = (cmd & 0x0c) === 0x0c;
    const cacheIdx = cmd & 3;

    if (isExt) {
      // 0x9C-0x9F: 확장 형식
      const readMapSel = cmd & 3;
      const readPlaneNo = this.mapSelToPlaneNo(readMapSel);
      const pattern = this.read();
      const lengthByte = this.read();
      const count = lengthByte + 2;

      const oldCache2 = this.cache9x[2];
      this.cache9x[2] = pattern;
      this.cache9x[3] = oldCache2;

      const rotPerByte = (pattern === 0x55 || pattern === 0xaa) ? 1 : 2;
      let bl = pattern;

      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        const vgaAddr = this.getVgaAddr(this.output.length);
        const srcVal = (readPlaneNo >= 0 && readPlaneNo < 4 && vgaAddr >= 0 && vgaAddr < VGA_SIZE)
          ? this.vgaPlanes[readPlaneNo][vgaAddr] : 0;
        this.push(srcVal & bl);
        for (let r = 0; r < rotPerByte; r++) {
          bl = ((bl << 1) | (bl >> 7)) & 0xff;
        }
      }
    } else {
      // 0x90-0x9B: 짧은 형식
      const readMapSel = (cmd >> 2) & 3;
      const readPlaneNo = this.mapSelToPlaneNo(readMapSel);
      const lengthByte = this.read();
      const count = lengthByte + 2;
      const pattern = this.cache9x[cacheIdx];

      this.bubbleSwap(cacheIdx);

      const rotPerByte = (pattern === 0x55 || pattern === 0xaa) ? 1 : 2;
      let bl = pattern;

      for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
        const vgaAddr = this.getVgaAddr(this.output.length);
        const srcVal = (readPlaneNo >= 0 && readPlaneNo < 4 && vgaAddr >= 0 && vgaAddr < VGA_SIZE)
          ? this.vgaPlanes[readPlaneNo][vgaAddr] : 0;
        this.push(srcVal & bl);
        for (let r = 0; r < rotPerByte; r++) {
          bl = ((bl << 1) | (bl >> 7)) & 0xff;
        }
      }
    }
  }

  private handleRle(cmd: number): void {
    const count = cmd - 0x9e;
    const val = this.read();
    if (val < 0) return;

    for (let i = 0; i < count && this.output.length < OUTPUT_SIZE; i++) {
      this.push(val);
    }
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * 압축된 얼굴 데이터를 디코딩합니다.
 * @param data 압축된 데이터 버퍼
 * @param palette 선택적 커스텀 팔레트 (기본: HERO.PAL)
 * @returns 디코딩된 얼굴 데이터
 */
export function decodeFace(
  data: Uint8Array,
  palette: readonly [number, number, number][] = DEFAULT_PALETTE
): DecodedFace {
  const byte7 = data[7];
  const byte9 = data[9];
  const dataStart = 10 + byte9 * 2;
  const planeOrder = getPlaneOrder(byte7);

  const decoder = new FaceDataDecoder(data, dataStart, planeOrder);
  const raw = decoder.decode();
  const pixels = convertToPixels(raw, planeOrder, palette);

  return {
    raw,
    planeOrder,
    pixels,
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  };
}

/**
 * 원시 플레인 데이터를 RGBA 픽셀로 변환합니다.
 */
function convertToPixels(
  raw: Uint8Array,
  planeOrder: PlaneOrder,
  palette: readonly [number, number, number][]
): Uint8Array {
  const pixels = new Uint8Array(IMAGE_WIDTH * IMAGE_HEIGHT * 4);

  // 섹션 분리
  const sections = [
    raw.slice(0, PLANE_SIZE),
    raw.slice(PLANE_SIZE, PLANE_SIZE * 2),
    raw.slice(PLANE_SIZE * 2, PLANE_SIZE * 3),
  ];

  // 플레인 재배치
  const planes: Uint8Array[] = [
    new Uint8Array(PLANE_SIZE),
    new Uint8Array(PLANE_SIZE),
    new Uint8Array(PLANE_SIZE),
  ];
  for (let i = 0; i < 3; i++) {
    planes[planeOrder[i]] = sections[i];
  }

  // 픽셀 변환
  for (let col = 0; col < 8; col++) {
    for (let i = 0; i < 80; i++) {
      const row = col % 2 === 0 ? i : 79 - i;
      const byteIdx = col * 80 + i;
      const b0 = planes[0][byteIdx];
      const b1 = planes[1][byteIdx];
      const b2 = planes[2][byteIdx];

      for (let bit = 0; bit < 8; bit++) {
        const x = col * 8 + bit;
        const colorIdx =
          (((b2 >> (7 - bit)) & 1) << 2) |
          (((b1 >> (7 - bit)) & 1) << 1) |
          ((b0 >> (7 - bit)) & 1);

        const [r, g, b] = palette[colorIdx] ?? [0, 0, 0];
        const offset = (row * IMAGE_WIDTH + x) * 4;
        pixels[offset] = r;
        pixels[offset + 1] = g;
        pixels[offset + 2] = b;
        pixels[offset + 3] = 255;
      }
    }
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

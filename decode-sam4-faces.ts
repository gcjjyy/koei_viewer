/**
 * 삼국지4 얼굴 데이터 배치 디코더 실행 스크립트
 * sam4/KAODATA.S4 파일을 디코딩하여 sam4-faces.png 생성
 */

import * as fs from 'fs';
import { PNG } from 'pngjs';
import { decodeFace } from './sam4-face-decoder';

// 그리드 설정
const GRID_COLS = 20;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 80;
const INDEX_TABLE_SIZE = 2040;
const TOTAL_IMAGES = 340;
const GRID_ROWS = Math.ceil(TOTAL_IMAGES / GRID_COLS);
const TOTAL_WIDTH = TILE_WIDTH * GRID_COLS;
const TOTAL_HEIGHT = TILE_HEIGHT * GRID_ROWS;

// 파일 경로
const KAODATA_FILE = './sam4/KAODATA.S4';
const PALETTE_FILE = './sam4/SAM4KAO.PAL';
const OUTPUT_FILE = './sam4-faces.png';

function loadPalette(path: string): [number, number, number][] {
  const data = new Uint8Array(fs.readFileSync(path));
  const palette: [number, number, number][] = [];

  for (let i = 0; i < 8; i++) {
    palette.push([
      data[i * 3],
      data[i * 3 + 1],
      data[i * 3 + 2]
    ]);
  }

  return palette;
}

function main(): void {
  // 데이터 로드
  const data = new Uint8Array(fs.readFileSync(KAODATA_FILE));
  const palette = loadPalette(PALETTE_FILE);

  console.log(`KAODATA.S4 로드: ${data.length} 바이트`);
  console.log(`팔레트: ${palette.length}색`);

  // 합친 PNG 생성
  const combinedPng = new PNG({ width: TOTAL_WIDTH, height: TOTAL_HEIGHT });

  // 배경을 검은색으로 초기화
  for (let i = 0; i < combinedPng.data.length; i += 4) {
    combinedPng.data[i] = 0;
    combinedPng.data[i + 1] = 0;
    combinedPng.data[i + 2] = 0;
    combinedPng.data[i + 3] = 255;
  }

  // 각 이미지 디코딩
  let successCount = 0;

  for (let imgIdx = 0; imgIdx < TOTAL_IMAGES; imgIdx++) {
    try {
      // 인덱스 테이블에서 오프셋/크기 읽기
      const entryOffset = imgIdx * 6;
      const offset = data[entryOffset] | (data[entryOffset + 1] << 8) |
                     (data[entryOffset + 2] << 16) | (data[entryOffset + 3] << 24);
      const size = data[entryOffset + 4] | (data[entryOffset + 5] << 8);

      if (size === 0) continue;

      // 이미지 데이터 추출
      const imgData = data.slice(INDEX_TABLE_SIZE + offset, INDEX_TABLE_SIZE + offset + size);

      // 디코딩
      const decoded = decodeFace(imgData, palette);

      // 그리드 위치 계산
      const gridX = imgIdx % GRID_COLS;
      const gridY = Math.floor(imgIdx / GRID_COLS);
      const baseX = gridX * TILE_WIDTH;
      const baseY = gridY * TILE_HEIGHT;

      // 픽셀 데이터를 합친 PNG에 복사
      for (let y = 0; y < TILE_HEIGHT; y++) {
        for (let x = 0; x < TILE_WIDTH; x++) {
          const srcOffset = (y * TILE_WIDTH + x) * 4;
          const dstOffset = ((baseY + y) * TOTAL_WIDTH + (baseX + x)) * 4;
          combinedPng.data[dstOffset] = decoded.pixels[srcOffset];
          combinedPng.data[dstOffset + 1] = decoded.pixels[srcOffset + 1];
          combinedPng.data[dstOffset + 2] = decoded.pixels[srcOffset + 2];
          combinedPng.data[dstOffset + 3] = decoded.pixels[srcOffset + 3];
        }
      }

      successCount++;
    } catch (err) {
      console.error(`이미지 ${imgIdx} 디코딩 실패:`, err);
    }

    if ((imgIdx + 1) % 50 === 0) {
      console.log(`진행: ${imgIdx + 1}/${TOTAL_IMAGES}`);
    }
  }

  // PNG 저장
  const pngBuffer = PNG.sync.write(combinedPng);
  fs.writeFileSync(OUTPUT_FILE, pngBuffer);
  console.log(`\nPNG 저장 완료: ${OUTPUT_FILE} (${TOTAL_WIDTH}x${TOTAL_HEIGHT})`);
  console.log(`성공: ${successCount}/${TOTAL_IMAGES}개 이미지`);
}

main();

/**
 * 얼굴 데이터 배치 디코더 실행 스크립트
 * FACEDAT/*.UNPACKED 파일들을 디코딩하여 faces.png 생성
 */

import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import { decodeFace } from './face-decoder';

// 그리드 설정
const GRID_COLS = 20;
const GRID_ROWS = 12;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 80;
const TOTAL_WIDTH = TILE_WIDTH * GRID_COLS;
const TOTAL_HEIGHT = TILE_HEIGHT * GRID_ROWS;

// 디렉토리 경로
const FACEDAT_DIR = './FACEDAT';
const OUTPUT_FILE = './faces.png';

function main(): void {
  // UNPACKED 파일 목록 가져오기
  const files = fs.readdirSync(FACEDAT_DIR)
    .filter(f => f.endsWith('.UNPACKED'))
    .sort((a, b) => {
      const numA = parseInt(a.split('.')[0], 10);
      const numB = parseInt(b.split('.')[0], 10);
      return numA - numB;
    });

  console.log(`${files.length}개 파일 발견`);

  // 합쳤을 때 전체 PNG 생성
  const combinedPng = new PNG({ width: TOTAL_WIDTH, height: TOTAL_HEIGHT });

  // 배경을 검은색으로 초기화
  for (let i = 0; i < combinedPng.data.length; i += 4) {
    combinedPng.data[i] = 0;
    combinedPng.data[i + 1] = 0;
    combinedPng.data[i + 2] = 0;
    combinedPng.data[i + 3] = 255;
  }

  // 각 파일 디코딩
  for (const file of files) {
    const num = parseInt(file.split('.')[0], 10);
    const filePath = path.join(FACEDAT_DIR, file);

    try {
      const data = new Uint8Array(fs.readFileSync(filePath));
      const decoded = decodeFace(data);

      // 그리드 위치 계산
      const gridX = num % GRID_COLS;
      const gridY = Math.floor(num / GRID_COLS);
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
    } catch (err) {
      console.error(`${file} 디코딩 실패:`, err);
    }
  }

  // PNG 저장
  const pngBuffer = PNG.sync.write(combinedPng);
  fs.writeFileSync(OUTPUT_FILE, pngBuffer);
  console.log(`PNG 저장 완료: ${OUTPUT_FILE} (${TOTAL_WIDTH}x${TOTAL_HEIGHT})`);
}

main();

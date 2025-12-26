# koei_viewer
KOEI의 고전 게임인 삼국지 시리즈나 대항해시대 등의 게임의 이미지 데이터를 읽어 출력하는 프로그램

---

## 지원 게임 현황

### 분석 완료 (config.json 등록)

| 게임 | 폴더 | 파일 | 크기 | BPP | 압축 | 비고 |
|------|------|------|------|-----|------|------|
| **삼국지 3** | sam3 | KAODATA.DAT | 64×80 | 3 | - | 얼굴 데이터 |
| **삼국지 4** | sam4pk | KAODATAP.S4 | 64×80 | 3 | - | 얼굴 데이터 |
| **삼국지 4** | sam4pk | KAODATA2.S4 | 64×80 | 3 | - | 얼굴 데이터 |
| **대항해시대 2** | horizon | KAO.LZW | 64×80 | 3 | LS11 | 얼굴 데이터 |
| **에어매니지먼트 2** | am2 | STAFF1~5.GDT | 64×80 | 4 | - | 스태프 얼굴 |
| **삼국지 영걸전** | hero | FACEDAT.R3 | 64×80 | 3 | - | 얼굴 데이터 |
| **삼국지 영걸전** | hero | HEXBCHP.R3 | 16×3584 | 4 | LS11 | 배틀 칩 |
| **삼국지 영걸전** | hero | HEXZCHP.R3 | 16×1280 | 4 | LS11 | 줌 칩 |
| **삼국지 영걸전** | hero | HEXICHR.R3 | 96×96 | 4 | LS11 | 아이콘 (타일) |
| **삼국지 영걸전** | hero | HEXBCHR.R3 | 64×64 | 4 | LS11 | 배틀 캐릭터 (타일) |
| **삼국지 영걸전** | hero | HEXZCHR.R3 | 32×64 | 4 | LS11 | 줌 캐릭터 (타일) |
| **삼국지 영걸전** | hero | SMAPBGPL.R3 | 16×3392 | 4 | LS11 | 전략맵 배경 |
| **삼국지 영걸전** | hero | MMAPBGPL.R3 | 16×4080 | 4 | LS11 | 미니맵 배경 |
| **삼국지 영걸전** | hero | SSCCHR2.R3 | 32×160 | 4 | LS11 | 시나리오 캐릭터 |
| **삼국지 영걸전** | FACEDAT | *.UNPACKED | 64×80 | 3 | TF-DCE | 언팩된 얼굴 (240개) |

### 미분석 (추가 분석 필요)

| 게임 | 폴더 | 파일 | 비고 |
|------|------|------|------|
| **삼국지 4** | sam4 | KAODATA.S4 | sam4pk와 동일 형식으로 추정 |
| **삼국지 영걸전** | hero | END1GRP.R3, END2GRP.R3 | 엔딩 그래픽 |
| **삼국지 영걸전** | hero | FONT.R3 | 폰트 데이터 |
| **삼국지 영걸전** | hero | HEXBMAP.R3, HEXZMAP.R3 | 헥스맵 데이터 |
| **삼국지 영걸전** | hero | HEXGRP.R3, OPGRP.R3, PACKGRP.R3 | 그래픽 데이터 |
| **삼국지 영걸전** | hero | IPPAN0.R3, IPPAN0M.R3 | 일반 데이터 |
| **삼국지 영걸전** | hero | MARK.R3 | 마크 데이터 |
| **삼국지 영걸전** | hero | MMAP.R3, PMAP.R3, SMAP.R3 | 맵 데이터 |
| **삼국지 영걸전** | hero | SNR*D.R3, SNR*M.R3 | 시나리오 데이터 |
| **삼국지 영걸전** | hero | SSCCHR1.R3 | 시나리오 캐릭터 1 |
| **대항해시대 2** | horizon | CHAR.LZW | 캐릭터 데이터 |
| **대항해시대 2** | horizon | DATA1.LZW | 데이터 |
| **대항해시대 2** | horizon | IAE1.LZW, IAP1~6.LZW | 이벤트/포트 데이터 |
| **대항해시대 2** | horizon | OPGRAPH.LZW | 오프닝 그래픽 |
| **대항해시대 2** | horizon | PORTCHIP.LZW, PORTMAP.LZW | 항구 데이터 |
| **대항해시대 2** | horizon | WORLDMAP.LZW | 월드맵 |
| **에어매니지먼트 2** | am2 | *.GDT (60+ 파일) | 다양한 그래픽 (도시, UI, 이벤트 등) |

---

# 설치
```sh
$ npm install
```

# 빌드
```sh
$ npx tsc
```

# 사용법
```sh
# 이미지 렌더링 (PNG 출력)
$ npx ts-node src/koei-viewer.ts <이미지파일> <팔레트파일> [출력파일.png]
$ npx ts-node src/koei-viewer.ts sam4/KAODATA.S4 sam4/SAM4KAO.PAL output.png

# 팔레트 생성
$ npx ts-node src/palette-gen.ts [출력디렉토리]

# 얼굴 데이터 디코딩 (영걸전)
$ npx ts-node decode-faces.ts
```

# 모듈 구조
```
src/
├── buf-reader.ts      # 바이너리 버퍼 읽기
├── koei-image.ts      # 비트플레인 이미지 디코딩
├── ls11-decoder.ts    # LS11 압축 해제
├── palette-gen.ts     # 팔레트 파일 생성
├── unpack.ts          # 팩 파일 언패킹
├── koei-viewer.ts     # 메인 프로그램
└── index.ts           # CLI 엔트리포인트
```

# 스크린샷
![sam3](https://user-images.githubusercontent.com/39606947/144691504-99f3e17a-2df5-431d-93fb-1fb3db41ea7b.png)
![sam4](https://user-images.githubusercontent.com/39606947/144691506-42bf728f-151e-46e9-97a0-312aa0860b8b.png)
<img width="752" alt="스크린샷 2021-12-05 23 34 19" src="https://user-images.githubusercontent.com/39606947/144751005-3e0a0746-6bdf-40cb-b945-405271d94ce8.png">
<img width="752" alt="스크린샷 2021-12-05 23 30 44" src="https://user-images.githubusercontent.com/39606947/144750859-d2defc8f-bc84-4a99-9988-e2b6db0353c2.png">
<img width="752" alt="스크린샷 2021-12-05 23 30 36" src="https://user-images.githubusercontent.com/39606947/144750863-eb2999ea-9419-45cf-8a5b-85d5e7b1e360.png">
<img width="752" alt="스크린샷 2021-12-05 23 30 27" src="https://user-images.githubusercontent.com/39606947/144750865-e92f943d-8477-48c9-9402-64be1e3fbb44.png">
<img width="752" alt="스크린샷 2021-12-05 23 30 22" src="https://user-images.githubusercontent.com/39606947/144750869-9c5406dc-8882-47fe-b826-53d3f6a5ea7a.png">
<img width="1280" height="960" alt="faces" src="https://github.com/user-attachments/assets/e0c7721f-55d8-49d6-9e66-3b23e9cb754d" />

# 비고

* LS11로 시작하는 파일은 LS11압축이 되어 있는 파일이므로, 먼저 LS11 압축을 해제해야 함.
* 얼굴 데이터의 경우는 대부분 8색상을 쓰기 때문에, 3바이트당 8픽셀을 표현함. (각 바이트에서 1비트씩 가져와 하나의 픽셀값을 만듬)

---

# 삼국지 영걸전 얼굴 데이터 파싱 완벽 가이드

## 개요

삼국지 영걸전(三國志英傑傳, 1995)의 얼굴 이미지 데이터는 **TF-DCE (Takayuki Fujinuma graphic Data Compress & Expand)** 압축 형식을 사용합니다. 이 문서는 TFDED.COM 역공학 분석을 바탕으로 압축 해제 알고리즘을 상세히 설명합니다.

### 기본 사양

| 항목 | 값 |
|------|-----|
| 이미지 크기 | 64 × 80 픽셀 |
| 색상 수 | 8색 (3비트) |
| 비트 플레인 수 | 3개 (Plane 0, 1, 2) |
| 플레인당 크기 | 640 바이트 (64/8 × 80) |
| 총 출력 크기 | 1920 바이트 (640 × 3) |

---

## 파일 구조

### 전체 레이아웃

```
┌─────────────────────────────────────┐
│ 고정 헤더 (10 바이트)                │
├─────────────────────────────────────┤
│ 명령어 룩업 테이블 (가변 크기)        │
├─────────────────────────────────────┤
│ 압축 데이터                          │
└─────────────────────────────────────┘
```

### 헤더 상세 (바이트 0-9)

| 오프셋 | 크기 | 설명 |
|--------|------|------|
| 0-6 | 7 바이트 | 고정 헤더 (용도 미상) |
| 7 | 1 바이트 | **플레인 순서 코드** (중요!) |
| 8 | 1 바이트 | 예약 |
| 9 | 1 바이트 | 룩업 테이블 엔트리 개수 (N) |

### 명령어 룩업 테이블 (바이트 10 ~ 10+N×2)

- 각 엔트리는 **2바이트 리틀 엔디안 워드**
- 명령어 0x00~0x1F가 이 테이블을 참조
- 테이블 크기: N × 2 바이트

### 압축 데이터 시작 위치

```
dataStart = 10 + byte9 × 2
```

---

## 플레인 순서 (Byte 7)

VGA 하드웨어의 플레인 쓰기 순서를 결정하는 핵심 값입니다.

| Byte 7 값 | 플레인 순서 | 의미 |
|-----------|-------------|------|
| 0xC6 | [0, 1, 2] | S0→P0, S1→P1, S2→P2 |
| 0xC9 | [1, 0, 2] | S0→P1, S1→P0, S2→P2 |
| 0xD2 | [0, 2, 1] | S0→P0, S1→P2, S2→P1 |
| 0xD8 | [2, 0, 1] | S0→P2, S1→P0, S2→P1 |
| 0xE1 | [1, 2, 0] | S0→P1, S1→P2, S2→P0 |
| 0xE4 | [2, 1, 0] | S0→P2, S1→P1, S2→P0 |

- **Sx**: 출력 섹션 (S0=0\~639, S1=640\~1279, S2=1280\~1919)
- **Px**: VGA 플레인 번호 (실제 저장되는 비트 플레인)

---

## VGA 에뮬레이션

### 지그재그 스캔 순서

TFDED.COM은 VGA 버퍼에 **세로 방향 지그재그(스네이크) 패턴**으로 출력합니다.

```
열 0: 행 0→79  (위→아래)
열 1: 행 79→0  (아래→위)
열 2: 행 0→79  (위→아래)
...
열 7: 행 79→0  (아래→위)
```

### 좌표 변환 함수

#### 선형 인덱스 → (열, 행)

```javascript
function linearToColRow(linearIdx) {
  const col = Math.floor(linearIdx / 80);
  const i = linearIdx % 80;
  const row = (col % 2 === 0) ? i : (79 - i);
  return { col, row };
}
```

#### (열, 행) → VGA 주소

```javascript
function colRowToVGA(col, row) {
  return row * 80 + col;  // VGA stride = 80
}
```

#### 출력 위치에서 VGA 주소 계산

```javascript
function getVgaAddrForOutLen(outLen) {
  const planeOffset = outLen % 640;  // 현재 섹션 내 오프셋
  const { col, row } = linearToColRow(planeOffset);
  return row * 80 + col;
}
```

### VGA 플레인 구조

```javascript
vgaPlanes = [
  Uint8Array(80 × 80),  // Plane 0
  Uint8Array(80 × 80),  // Plane 1
  Uint8Array(80 × 80),  // Plane 2
  Uint8Array(80 × 80),  // Plane 3 (사용 안 함)
];
```

---

## 캐시 시스템

0x5X, 0x9X 명령어에서 사용하는 마스크 패턴 캐시입니다.

### 초기값

```javascript
cache9x = [0x00, 0xFF, 0x55, 0xAA];
```

### 버블 스왑 동작

`cacheIdx > 0`일 때, 사용된 값이 앞으로 이동합니다:

```javascript
if (cacheIdx > 0) {
  const temp = cache[cacheIdx - 1];
  cache[cacheIdx - 1] = cache[cacheIdx];
  cache[cacheIdx] = temp;
}
```

예시: cacheIdx=2 선택 시
- Before: [0x00, 0xFF, 0x55, 0xAA]
- After:  [0x00, 0x55, 0xFF, 0xAA]

---

## 명령어 체계

### 명령어 분류표

| 범위 | 분류 | 설명 |
|------|------|------|
| 0x00-0x1F | 헤더 테이블 참조 | 룩업 테이블에서 서브명령어 실행 |
| 0x20-0x2F | 백레퍼런스 | 선형 버퍼에서 복사 |
| 0x30-0x3F | VGA 플레인 읽기 | 이전 플레인에서 읽기 + 회전 |
| 0x40-0x4F | VGA 백레퍼런스 | VGA 주소 기반 복사 |
| 0x50-0x5F | 플레인 읽기 + 마스킹 | 캐시 패턴으로 마스킹 |
| 0x60-0x6F | 2바이트 패턴 반복 | 패턴 반복 출력 |
| 0x70-0x7F | 리터럴 복사 | 원본 데이터 그대로 출력 |
| 0x80-0x8F | 니블 회전 패턴 | 특수 패턴 생성 |
| 0x90-0x9F | 확장 명령어 | 다양한 서브명령어 |
| 0xA0-0xFF | RLE | 단일 바이트 반복 |

---

## 명령어 상세

### 0x00-0x1F: 헤더 테이블 참조

룩업 테이블에서 2바이트 워드를 읽어 서브명령어로 해석합니다.

```javascript
word = headerTable[cmd * 2] | (headerTable[cmd * 2 + 1] << 8);
lo = word & 0xFF;
hi = (word >> 8) & 0xFF;
subIdx = ((lo >> 3) & 0x1E) >> 1;
```

| subIdx | 동작 |
|--------|------|
| 2 | 선형 백레퍼런스: count = (lo & 0x0F) + 3, distance = hi |
| 3 | VGA 플레인 읽기 + 회전: count = hi + 2 |
| 4 | VGA 백레퍼런스: distance = (lo & 0x0F) + 1, count = hi + 2 |
| 5 | 플레인 읽기 + 마스킹: count = hi + 2, cacheIdx = lo & 3 |
| 7 | 리터럴: 단일 바이트 출력 |
| 8 | 니블 회전 패턴: count = (lo & 0x0F) + 1 |
| 9 | 플레인 읽기 (마스킹 없음): count = hi + 2 |
| ≥10 | RLE: count = lo - 0x9E, value = hi |

### 0x20-0x2F: 백레퍼런스 (선형 버퍼)

```javascript
cmd: 0x2X
param: 다음 1바이트
count = (cmd & 0x0F) + 3;
distance = param;
for (i = 0; i < count; i++) {
  output.push(output[output.length - distance + i]);
}
```

### 0x30-0x3F: VGA 플레인 읽기 + 회전

```javascript
cmd: 0x3X
param: 다음 1바이트
count = param + 2;
readSel = (cmd >> 2) & 3;  // 읽을 플레인 선택
rotIdx = cmd & 3;           // 회전 방식

// rotIdx 해석 (섹션 1 이상에서만 적용)
// 0: 그대로
// 1: NOT 연산
// 2: 오른쪽 1비트 회전
// 3: 왼쪽 1비트 회전

for (i = 0; i < count; i++) {
  val = vgaPlanes[srcPlane][vgaAddr];
  if (rotIdx == 1) val = ~val;
  else if (rotIdx == 2) val = ROR(val, 1);
  else if (rotIdx == 3) val = ROL(val, 1);
  output.push(val);
}
```

### 0x40-0x4F: VGA 백레퍼런스

```javascript
cmd: 0x4X
param: 다음 1바이트
distance = (cmd & 0x0F) + 1;  // VGA 주소 기준 오프셋
count = param + 2;

for (i = 0; i < count; i++) {
  vgaAddr = getVgaAddr(output.length);
  srcAddr = vgaAddr - distance;
  output.push(vgaPlanes[currentPlane][srcAddr]);
}
```

### 0x50-0x5F: 플레인 읽기 + 마스킹

```javascript
cmd: 0x5X
param: 다음 1바이트

if ((cmd & 0x0C) == 0x0C) {
  // 0x5C-0x5F: 특수 분기 (마스크 패턴 즉시 지정)
  cacheIdx = cmd & 3;
  pattern = read();
  count = read() + 2;
  // 캐시 업데이트: cache[2] = pattern, cache[3] = 기존 cache[2]
} else {
  count = param + 2;
  readSel = (cmd >> 2) & 3;
  cacheIdx = cmd & 3;
  pattern = cache9x[cacheIdx];
  bubbleSwap(cacheIdx);
}

for (i = 0; i < count; i++) {
  val = vgaPlanes[srcPlane][vgaAddr];
  output.push(val & pattern);
}
```

### 0x60-0x6F: 2바이트 패턴 반복

```javascript
cmd: 0x6X
val1 = read();
val2 = read();
count = (cmd & 0x0F) + 1;

for (i = 0; i < count; i++) {
  output.push(val1);
  output.push(val2);
}
```

### 0x70-0x7F: 리터럴 복사

```javascript
cmd: 0x7X
count = (cmd & 0x0F) + 1;

for (i = 0; i < count; i++) {
  output.push(read());
}
```

### 0x80-0x8F: 니블 회전 패턴

```javascript
cmd: 0x8X
val = read();
count = (cmd & 0x0F) + 1;

// 니블 스왑 후 4비트 ROL
rotated = ((val << 4) | (val >> 4)) & 0xFF;
ax = (val << 8) | rotated;
rolAx = ((ax << 4) | (ax >> 12)) & 0xFFFF;
val1 = (rolAx >> 8) & 0xFF;
val2 = rolAx & 0xFF;

for (i = 0; i < count; i++) {
  output.push(val1);
  output.push(val2);
}
```

예시: `val = 0xAB`
- rotated = 0xBA
- ax = 0xABBA
- rolAx = 0xBBAA
- val1 = 0xBB, val2 = 0xAA

### 0x90-0x9F: 확장 명령어 (회전 마스킹)

```javascript
cmd: 0x9X

if ((cmd & 0x0C) == 0x0C) {
  // 0x9C-0x9F: 확장 형식 (마스크 즉시 지정)
  readSel = cmd & 3;
  pattern = read();
  count = read() + 2;
  // 캐시 업데이트
} else {
  // 0x90-0x9B: 짧은 형식 (캐시에서 마스크)
  readSel = (cmd >> 2) & 3;
  cacheIdx = cmd & 3;
  pattern = cache9x[cacheIdx];
  count = read() + 2;
  bubbleSwap(cacheIdx);
}

// 회전량: 0x55/0xAA는 1비트, 그 외는 2비트
rotPerByte = (pattern == 0x55 || pattern == 0xAA) ? 1 : 2;

for (i = 0; i < count; i++) {
  val = vgaPlanes[srcPlane][vgaAddr];
  output.push(val & pattern);
  pattern = ROL(pattern, rotPerByte);  // 마스크 회전
}
```

### 0xA0-0xFF: RLE (Run-Length Encoding)

```javascript
cmd: 0xA0-0xFF
count = cmd - 0x9E;  // 2 ~ 97
val = read();

for (i = 0; i < count; i++) {
  output.push(val);
}
```

예시: `cmd = 0xA5, val = 0x00` → 7개의 0x00 출력

---

## 검증 결과

| 항목 | 결과 |
|------|------|
| 총 파일 수 | 240개 |
| Section 0 정확도 | 100% (240/240) |
| Section 1 정확도 | 100% (240/240) |
| Section 2 정확도 | 100% (240/240) |

모든 240개 얼굴 이미지가 원본 BMP와 100% 일치합니다.

---

*문서 작성일: 2025년 12월 24일*
*역공학 분석: TFDED.COM v1.54 (TF-928, 1993-1995)*

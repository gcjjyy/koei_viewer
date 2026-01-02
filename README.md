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
| **삼국지 영걸전** | hero | HEXBCHP.R3 | 16×3584 | 4 | LS11 | 배틀 칩 |
| **삼국지 영걸전** | hero | HEXZCHP.R3 | 16×1280 | 4 | LS11 | 줌 칩 |
| **삼국지 영걸전** | hero | HEXICHR.R3 | 96×96 | 4 | LS11 | 아이콘 (타일) |
| **삼국지 영걸전** | hero | HEXBCHR.R3 | 64×64 | 4 | LS11 | 배틀 캐릭터 (타일) |
| **삼국지 영걸전** | hero | HEXZCHR.R3 | 32×64 | 4 | LS11 | 줌 캐릭터 (타일) |
| **삼국지 영걸전** | hero | SMAPBGPL.R3 | 16×3392 | 4 | LS11 | 전략맵 배경 |
| **삼국지 영걸전** | hero | MMAPBGPL.R3 | 16×4080 | 4 | LS11 | 미니맵 배경 |
| **삼국지 영걸전** | hero | SSCCHR2.R3 | 32×160 | 4 | LS11 | 시나리오 캐릭터 |

### 전용 디코더 사용

| 게임 | 폴더 | 파일 | 크기 | BPP | 압축 | 디코더 |
|------|------|------|------|-----|------|--------|
| **삼국지 4** | sam4 | KAODATA.S4 | 64×80 | 3 | 0xFE RLE + 니블 백레퍼런스 | `sam4-face-decoder.ts` |
| **삼국지 영걸전** | FACEDAT | *.UNPACKED | 64×80 | 3 | TF-DCE | `face-decoder.ts` |

---

# 설치
```sh
$ npm install
```

# 빌드
```sh
$ npx tsc
```

---

# 1. 비압축 이미지 뷰어 (koei-viewer.ts)

config.json에 등록된 비압축/LS11 압축 이미지 전용입니다.

## 사용법
```sh
$ npx ts-node koei-viewer.ts <이미지파일> <팔레트파일> [출력파일.png]

# 예시
$ npx ts-node koei-viewer.ts sam3/KAODATA.DAT sam3/SAM3KAO.PAL output.png
$ npx ts-node koei-viewer.ts horizon/KAO.LZW horizon/HORIZON.PAL kao.png
```

## 모듈 구조
```
src/
├── koei-image.ts      # 비트플레인 이미지 디코딩
├── ls11-decoder.ts    # LS11 압축 해제
├── buf-reader.ts      # 바이너리 버퍼 읽기
└── koei-viewer.ts     # 메인 프로그램
```

---

# 2. 삼국지 4 얼굴 디코더 (sam4-face-decoder.ts)

## 개요

삼국지4(三國志IV)의 KAODATA.S4는 **2단계 압축**을 사용합니다:
1. **0xFE 이스케이프 RLE**: 바이트 레벨 런렝스
2. **니블 기반 백레퍼런스**: 4비트 제어 코드

### 기본 사양

| 항목 | 값 |
|------|-----|
| 이미지 크기 | 64 × 80 픽셀 |
| 색상 수 | 8색 (3비트) |
| 총 이미지 수 | 340개 |
| 인덱스 테이블 | 2040 바이트 (340 × 6) |
| 출력 크기 | 5120 픽셀 (64 × 80) |

## 사용법

```sh
# 전체 얼굴 렌더링
$ npx ts-node decode-sam4-faces.ts

# 결과: sam4-faces.png (1280×1360, 340개 얼굴)
```

## 모듈

| 파일 | 설명 |
|------|------|
| `sam4-face-decoder.ts` | 디코더 모듈 (decodeFace, decodeFaces export) |
| `decode-sam4-faces.ts` | 배치 실행 스크립트 |

## 압축 알고리즘

### 파일 구조

```
┌─────────────────────────────────────┐
│ 인덱스 테이블 (2040 바이트)           │
│ - 340개 엔트리 × 6바이트              │
│ - offset(4) + size(2)               │
├─────────────────────────────────────┤
│ 이미지 데이터 영역                    │
│ - 각 이미지: 4바이트 헤더 + 압축 데이터 │
└─────────────────────────────────────┘
```

### 1단계: 0xFE 이스케이프 RLE

| 바이트 | 동작 |
|--------|------|
| 일반 (≠0xFE) | 그대로 반환, 캐시에 저장 |
| 0xFE 0x01 | 리터럴 0xFE 반환 |
| 0xFE 0x00 | 캐시된 바이트 256번 반복 |
| 0xFE N (N>1) | 캐시된 바이트 N번 반복 |

### 2단계: 니블 기반 압축

각 줄 시작에 rowOffset 니블을 읽고, 이후 픽셀 루프:

| 제어 니블 | 동작 |
|-----------|------|
| bit3=0 | 리터럴: color = ctrl & 0x07 |
| bit3=1, bit2=0 | 짧은 백레퍼런스: length = (ctrl & 0x03) + 2 |
| bit3=1, bit2=1 | 긴 백레퍼런스: length = ((ctrl & 0x03) << 4) + nextNibble + 6 |

백레퍼런스 오프셋:
- rowOffset & 0x08: 행 방향 (srcY = y - rowOffset + 7)
- 그 외: 열 방향 (srcX = x - rowOffset - 1)

---

# 3. 삼국지 영걸전 얼굴 디코더 (face-decoder.ts)

## 개요

삼국지 영걸전(三國志英傑傳, 1995)의 얼굴 이미지는 **TF-DCE (Takayuki Fujinuma graphic Data Compress & Expand)** 압축 형식을 사용합니다.

### 기본 사양

| 항목 | 값 |
|------|-----|
| 이미지 크기 | 64 × 80 픽셀 |
| 색상 수 | 8색 (3비트) |
| 비트 플레인 수 | 3개 (Plane 0, 1, 2) |
| 플레인당 크기 | 640 바이트 |
| 총 출력 크기 | 1920 바이트 |
| 총 이미지 수 | 240개 |

## 사용법

```sh
# 전체 얼굴 렌더링
$ npx ts-node decode-faces.ts

# 결과: faces.png (1280×960, 240개 얼굴)
```

## 모듈

| 파일 | 설명 |
|------|------|
| `face-decoder.ts` | 디코더 모듈 (decodeFace, decodeFaces export) |
| `decode-faces.ts` | 배치 실행 스크립트 |

## 파일 구조

```
┌─────────────────────────────────────┐
│ 고정 헤더 (10 바이트)                │
│ - byte 7: 플레인 순서 코드           │
│ - byte 9: 룩업 테이블 엔트리 수 (N)   │
├─────────────────────────────────────┤
│ 명령어 룩업 테이블 (N × 2 바이트)     │
├─────────────────────────────────────┤
│ 압축 데이터                          │
└─────────────────────────────────────┘
```

### 플레인 순서 (Byte 7)

| 값 | 플레인 순서 |
|----|-------------|
| 0xC6 | [0, 1, 2] |
| 0xC9 | [1, 0, 2] |
| 0xD2 | [0, 2, 1] |
| 0xD8 | [2, 0, 1] |
| 0xE1 | [1, 2, 0] |
| 0xE4 | [2, 1, 0] |

### 명령어 체계

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

### VGA 지그재그 스캔

```
열 0: 행 0→79  (위→아래)
열 1: 행 79→0  (아래→위)
열 2: 행 0→79  (위→아래)
...
```

---

# 스크린샷

## 삼국지 3
![sam3](output/sam3-kaodata.png)

## 삼국지 4
![sam4](output/sam4-faces.png)

## 삼국지 4 PK
![sam4pk](output/sam4pk-kaodatap.png)

## 삼국지 영걸전
![hero-faces](output/hero-faces.png)

## 대항해시대 2
![horizon](output/horizon-kao.png)

## 에어매니지먼트 2
![am2-staff1](output/STAFF1.GDT.png)
![am2-staff2](output/STAFF2.GDT.png)
![am2-staff3](output/STAFF3.GDT.png)
![am2-staff4](output/STAFF4.GDT.png)
![am2-staff5](output/STAFF5.GDT.png)

## 삼국지 영걸전 (캐릭터)
![hero-hexbchr](output/hero-hexbchr.png)
![hero-hexzchr](output/hero-hexzchr.png)
![hero-hexichr](output/hero-hexichr.png)
![hero-sscchr2](output/hero-sscchr2.png)

## 삼국지 영걸전 (맵 타일)
![hero-hexbchp](output/hero-hexbchp.png)
![hero-hexzchp](output/hero-hexzchp.png)
![hero-smapbgpl](output/hero-smapbgpl.png)
![hero-mmapbgpl](output/hero-mmapbgpl.png)

---

# 4. 삼국지 영걸전 맵 렌더러 (map-renderer.ts)

## 개요

삼국지 영걸전의 타일 기반 맵 데이터를 렌더링합니다. 타일셋 이미지와 맵 데이터를 조합하여 완전한 맵 이미지를 생성합니다.

## 사용법

```sh
# 전체 맵 렌더링
$ npx ts-node map-renderer.ts all

# 개별 맵 타입 렌더링
$ npx ts-node map-renderer.ts world   # 월드맵 (MMAP)
$ npx ts-node map-renderer.ts field   # 필드맵 (HEXZMAP)
$ npx ts-node map-renderer.ts battle  # 전투맵 (HEXBMAP)
$ npx ts-node map-renderer.ts town    # 마을맵 (SMAP)
$ npx ts-node map-renderer.ts palace  # 궁전맵 (PMAP)
```

## 지원 맵 타입

### MMAP (월드맵)

| 항목 | 값 |
|------|-----|
| 파일 | hero/MMAP.R3 |
| 타일셋 | hero/MMAPBGPL.R3 (255 타일) |
| 맵 수 | 4개 |
| 타일 크기 | 16×16 |

| 맵 | 크기 (타일) | 크기 (픽셀) |
|----|-------------|-------------|
| 0 | 96×96 | 1536×1536 |
| 1 | 72×112 | 1152×1792 |
| 2 | 120×88 | 1920×1408 |
| 3 | 112×128 | 1792×2048 |

### HEXZMAP (필드맵)

| 항목 | 값 |
|------|-----|
| 파일 | hero/HEXZMAP.R3 |
| 타일셋 | hero/HEXZCHP.R3 (Entry 0+1 또는 Entry 0+2) |
| 맵 수 | 58개 |
| 타일 크기 | 16×16 |

#### 데이터 구조

```
┌─────────────────────────────────────┐
│ 헤더 (2 바이트)                      │
│ - byte 0: width (타일 단위)          │
│ - byte 1: height (타일 단위)         │
├─────────────────────────────────────┤
│ 맵 레이어 (width × height 바이트)     │
│ - 각 바이트: 타일 인덱스 (0-254)      │
├─────────────────────────────────────┤
│ 지형 레이어 ((w/2) × (h/2) 바이트)    │
│ - 32×32 기준 이동/지형 정보           │
│ - 값 9 또는 11 포함 시: 황무지 타일셋  │
└─────────────────────────────────────┘
```

#### 타일셋 자동 선택

HEXZCHP.R3는 3개의 LS11 엔트리로 구성:
- **Entry 0**: 80 타일 (공통 기본 타일)
- **Entry 1**: 174 타일 (일반 지형)
- **Entry 2**: 175 타일 (황무지 지형)

지형 레이어에 값 9 또는 11이 포함되면 Entry 0+2 (황무지), 그 외에는 Entry 0+1 (일반) 사용.

#### 맵 이름 (Entry 58)

마지막 엔트리(58)는 맵 이름 메타데이터:
```
사수관, 호로관, 광천, 신도, 거록, 청하, 계교, 북해,
서주, 소패, 태산, 하구, 팽성, 하비, 신도1, 광릉, ...
```

---

## 삼국지 영걸전 (월드맵 - MMAP)

| 맵 0 | 맵 1 |
|------|------|
| ![worldmap0](output/hero-worldmap-0.png) | ![worldmap1](output/hero-worldmap-1.png) |

| 맵 2 | 맵 3 |
|------|------|
| ![worldmap2](output/hero-worldmap-2.png) | ![worldmap3](output/hero-worldmap-3.png) |

## 삼국지 영걸전 (필드맵 - HEXZMAP)

| # | 이름 | 이미지 |
|---|------|--------|
| 0 | 사수관 | ![](output/hero-hexzmap-0.png) |
| 1 | 호로관 | ![](output/hero-hexzmap-1.png) |
| 2 | 광천 | ![](output/hero-hexzmap-2.png) |
| 3 | 신도 | ![](output/hero-hexzmap-3.png) |
| 4 | 거록 | ![](output/hero-hexzmap-4.png) |
| 5 | 청하 | ![](output/hero-hexzmap-5.png) |
| 6 | 계교 | ![](output/hero-hexzmap-6.png) |
| 7 | 북해 | ![](output/hero-hexzmap-7.png) |
| 8 | 서주 | ![](output/hero-hexzmap-8.png) |
| 9 | 소패 | ![](output/hero-hexzmap-9.png) |
| 10 | 태산 | ![](output/hero-hexzmap-10.png) |
| 11 | 하구 | ![](output/hero-hexzmap-11.png) |
| 12 | 팽성 | ![](output/hero-hexzmap-12.png) |
| 13 | 하비 | ![](output/hero-hexzmap-13.png) |
| 14 | 신도1 | ![](output/hero-hexzmap-14.png) |
| 15 | 광릉 | ![](output/hero-hexzmap-15.png) |
| 16 | 연주 | ![](output/hero-hexzmap-16.png) |
| 17 | 고성 | ![](output/hero-hexzmap-17.png) |
| 18 | 영천 | ![](output/hero-hexzmap-18.png) |
| 19 | 여남 | ![](output/hero-hexzmap-19.png) |
| 20 | 강하 | ![](output/hero-hexzmap-20.png) |
| 21 | 남양 | ![](output/hero-hexzmap-21.png) |
| 22 | 박망파 | ![](output/hero-hexzmap-22.png) |
| 23 | 신야1 | ![](output/hero-hexzmap-23.png) |
| 24 | 양양 | ![](output/hero-hexzmap-24.png) |
| 25 | 장판파1 | ![](output/hero-hexzmap-25.png) |
| 26 | 장판파2 | ![](output/hero-hexzmap-26.png) |
| 27 | 강릉 | ![](output/hero-hexzmap-27.png) |
| 28 | 공안 | ![](output/hero-hexzmap-28.png) |
| 29 | 계양 | ![](output/hero-hexzmap-29.png) |
| 30 | 무릉 | ![](output/hero-hexzmap-30.png) |
| 31 | 영릉 | ![](output/hero-hexzmap-31.png) |
| 32 | 장사 | ![](output/hero-hexzmap-32.png) |
| 33 | 부 | ![](output/hero-hexzmap-33.png) |
| 34 | 성도 | ![](output/hero-hexzmap-34.png) |
| 35 | 와구관1 | ![](output/hero-hexzmap-35.png) |
| 36 | 와구관2 | ![](output/hero-hexzmap-36.png) |
| 37 | 가맹관1 | ![](output/hero-hexzmap-37.png) |
| 38 | 가맹관2 | ![](output/hero-hexzmap-38.png) |
| 39 | 정군산 | ![](output/hero-hexzmap-39.png) |
| 40 | 천탕산 | ![](output/hero-hexzmap-40.png) |
| 41 | 한수 | ![](output/hero-hexzmap-41.png) |
| 42 | 양평관 | ![](output/hero-hexzmap-42.png) |
| 43 | 서릉 | ![](output/hero-hexzmap-43.png) |
| 44 | 이릉 | ![](output/hero-hexzmap-44.png) |
| 45 | 맥 | ![](output/hero-hexzmap-45.png) |
| 46 | 남사 | ![](output/hero-hexzmap-46.png) |
| 47 | 신야2 | ![](output/hero-hexzmap-47.png) |
| 48 | 완1 | ![](output/hero-hexzmap-48.png) |
| 49 | 완2 | ![](output/hero-hexzmap-49.png) |
| 50 | 허창1 | ![](output/hero-hexzmap-50.png) |
| 51 | 허창2 | ![](output/hero-hexzmap-51.png) |
| 52 | 진창 | ![](output/hero-hexzmap-52.png) |
| 53 | 장안 | ![](output/hero-hexzmap-53.png) |
| 54 | 낙양 | ![](output/hero-hexzmap-54.png) |
| 55 | 업1 | ![](output/hero-hexzmap-55.png) |
| 56 | 업2 | ![](output/hero-hexzmap-56.png) |
| 57 | 업3 | ![](output/hero-hexzmap-57.png) |

---

# 비고

* LS11로 시작하는 파일은 LS11압축이 되어 있는 파일이므로, 먼저 LS11 압축을 해제해야 함.
* 얼굴 데이터의 경우는 대부분 8색상을 쓰기 때문에, 3바이트당 8픽셀을 표현함. (각 바이트에서 1비트씩 가져와 하나의 픽셀값을 만듬)

---

*문서 최종 수정: 2026년 1월*

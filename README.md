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
![sam3](https://user-images.githubusercontent.com/39606947/144691504-99f3e17a-2df5-431d-93fb-1fb3db41ea7b.png)

## 삼국지 4
![sam4](https://user-images.githubusercontent.com/39606947/144691506-42bf728f-151e-46e9-97a0-312aa0860b8b.png)

## 삼국지 영걸전
<img width="1280" height="960" alt="faces" src="https://github.com/user-attachments/assets/e0c7721f-55d8-49d6-9e66-3b23e9cb754d" />

## 기타
<img width="752" alt="스크린샷 2021-12-05 23 34 19" src="https://user-images.githubusercontent.com/39606947/144751005-3e0a0746-6bdf-40cb-b945-405271d94ce8.png">
<img width="752" alt="스크린샷 2021-12-05 23 30 44" src="https://user-images.githubusercontent.com/39606947/144750859-d2defc8f-bc84-4a99-9988-e2b6db0353c2.png">
<img width="752" alt="스크린샷 2021-12-05 23 30 36" src="https://user-images.githubusercontent.com/39606947/144750863-eb2999ea-9419-45cf-8a5b-85d5e7b1e360.png">
<img width="752" alt="스크린샷 2021-12-05 23 30 27" src="https://user-images.githubusercontent.com/39606947/144750865-e92f943d-8477-48c9-9402-64be1e3fbb44.png">
<img width="752" alt="스크린샷 2021-12-05 23 30 22" src="https://user-images.githubusercontent.com/39606947/144750869-9c5406dc-8882-47fe-b826-53d3f6a5ea7a.png">

---

# 비고

* LS11로 시작하는 파일은 LS11압축이 되어 있는 파일이므로, 먼저 LS11 압축을 해제해야 함.
* 얼굴 데이터의 경우는 대부분 8색상을 쓰기 때문에, 3바이트당 8픽셀을 표현함. (각 바이트에서 1비트씩 가져와 하나의 픽셀값을 만듬)

---

*문서 최종 수정: 2025년 1월*

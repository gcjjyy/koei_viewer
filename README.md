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

## 설치 및 빌드

```sh
# 설치
npm install

# 빌드
npx tsc
```

---

## 사용법

### 비압축 이미지 뷰어 (koei-viewer.ts)

config.json에 등록된 비압축/LS11 압축 이미지 전용입니다.

```sh
npx ts-node koei-viewer.ts <이미지파일> <팔레트파일> [출력파일.png]

# 예시
npx ts-node koei-viewer.ts sam3/KAODATA.DAT sam3/SAM3KAO.PAL output.png
npx ts-node koei-viewer.ts horizon/KAO.LZW horizon/HORIZON.PAL kao.png
```

### 전용 디코더

| 디코더 | 명령어 | 출력 |
|--------|--------|------|
| 삼국지 4 얼굴 | `npx ts-node decode-sam4-faces.ts` | sam4-faces.png |
| 영걸전 얼굴 | `npx ts-node decode-faces.ts` | faces.png |
| 영걸전 맵 | `npx ts-node map-renderer.ts all` | output/hero-*.png |

---

## 상세 문서

- [삼국지 4 얼굴 디코더](docs/sam4-face-decoder.md) - 0xFE RLE + 니블 백레퍼런스 압축
- [삼국지 영걸전 얼굴 디코더](docs/face-decoder.md) - TF-DCE 압축 형식
- [삼국지 영걸전 맵 렌더러](docs/map-renderer.md) - MMAP, HEXZMAP, HEXBMAP, PMAP, SMAP

---

## 모듈 구조

```
├── koei-viewer.ts        # 메인 이미지 뷰어
├── koei-image.ts         # 비트플레인 이미지 디코딩
├── ls11-decoder.ts       # LS11 압축 해제
├── buf-reader.ts         # 바이너리 버퍼 읽기
├── sam4-face-decoder.ts  # 삼국지 4 얼굴 디코더
├── face-decoder.ts       # 영걸전 얼굴 디코더
├── map-renderer.ts       # 영걸전 맵 렌더러
└── config.json           # 이미지 포맷 설정
```

---

## 스크린샷

### 삼국지 3
![sam3](output/sam3-kaodata.png)

### 삼국지 4
![sam4](output/sam4-faces.png)

### 삼국지 4 PK
![sam4pk](output/sam4pk-kaodatap.png)

### 삼국지 영걸전
![hero-faces](output/hero-faces.png)

### 대항해시대 2
![horizon](output/horizon-kao.png)

### 에어매니지먼트 2
![am2-staff1](output/STAFF1.GDT.png)

### 삼국지 영걸전 (캐릭터)
![hero-hexbchr](output/hero-hexbchr.png)
![hero-hexzchr](output/hero-hexzchr.png)
![hero-hexichr](output/hero-hexichr.png)
![hero-sscchr2](output/hero-sscchr2.png)

### 삼국지 영걸전 (맵 타일셋)
![hero-hexbchp](output/hero-hexbchp.png)
![hero-hexzchp](output/hero-hexzchp.png)
![hero-smapbgpl](output/hero-smapbgpl.png)
![hero-mmapbgpl](output/hero-mmapbgpl.png)

> 맵 스크린샷은 [맵 렌더러 문서](docs/map-renderer.md#스크린샷)에서 확인하세요.

---

## 비고

* LS11로 시작하는 파일은 LS11압축이 되어 있는 파일이므로, 먼저 LS11 압축을 해제해야 함.
* 얼굴 데이터의 경우는 대부분 8색상을 쓰기 때문에, 3바이트당 8픽셀을 표현함. (각 바이트에서 1비트씩 가져와 하나의 픽셀값을 만듬)

---

*문서 최종 수정: 2026년 1월*

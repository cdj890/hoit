# Tier 1 고도화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 모든 208개 서브 페이지에 공유 기능, 관련 콘텐츠 추천, 게임 사운드 효과, 도구 복사 버튼, 퀴즈 리더보드를 추가하여 사이트 전체 품질을 한 단계 끌어올린다.

**Architecture:** 공통 기능은 독립 JS 모듈(share.js, sfx.js, recommend.js)로 만들어 각 페이지에서 로드. 기존 단일 HTML 파일 구조와 바닐라 JS 철학을 유지하면서, 각 모듈은 페이지에 로드만 하면 자동으로 UI를 생성/주입하는 자체 초기화 방식.

**Tech Stack:** 바닐라 JavaScript, Web Audio API, Kakao SDK 2.7.4, localStorage

---

## 파일 구조

### 새로 생성하는 파일
- `js/share.js` - 공유 버튼 FAB + 공유 패널 (카카오/트위터/링크복사) 자동 주입
- `js/sfx.js` - Web Audio API 기반 경량 사운드 효과 모듈 (6종)
- `js/recommend.js` - 같은 카테고리 관련 콘텐츠 추천 위젯 자동 주입
- `js/catalog.js` - 전체 콘텐츠 카탈로그 데이터 (추천 모듈이 사용)

### 수정하는 파일
- `games/*.html` (60개) - sfx.js, share.js, recommend.js 로드 추가
- `tests/*.html` (20개) - share.js, recommend.js 로드 추가
- `quiz/*.html` (20개) - share.js, recommend.js 로드 + 리더보드 연동
- `destiny/*.html` (21개) - share.js, recommend.js 로드 추가
- `tools/*.html` (40개) - share.js, recommend.js 로드 + 복사 버튼
- `itknow/*.html` (20개) - share.js, recommend.js 로드 추가
- `learn/*.html` (8개) - share.js, recommend.js 로드 추가
- `music/*.html` (5개) - share.js, recommend.js 로드 추가
- `health/*.html` (5개) - share.js, recommend.js 로드 추가
- `creative/*.html` (4개) - share.js, recommend.js 로드 추가
- `reading/*.html` (5개) - share.js, recommend.js 로드 추가

---

## Task 1: 공유 모듈 (share.js) 생성

**Files:**
- Create: `js/share.js`

- [ ] Step 1: js 디렉토리 생성 (`mkdir -p js`)
- [ ] Step 2: share.js 작성 - FAB 버튼 + 공유 패널(카카오/트위터/링크복사) 자동 주입 모듈. DOM API로 안전하게 요소 생성. 카카오 SDK 동적 로드 지원.
- [ ] Step 3: 커밋

## Task 2: 사운드 효과 모듈 (sfx.js) 생성

**Files:**
- Create: `js/sfx.js`

- [ ] Step 1: sfx.js 작성 - Web Audio API로 6종(click, score, combo, levelup, gameover, win) 합성음 모듈. `SFX.play('score')` 형태로 호출.
- [ ] Step 2: 커밋

## Task 3: 콘텐츠 카탈로그 (catalog.js) 생성

**Files:**
- Create: `js/catalog.js`

- [ ] Step 1: index.html의 GAMES/TESTS/QUIZ 등 배열에서 {emoji, title, path} 추출하여 catalog.js 생성
- [ ] Step 2: 커밋

## Task 4: 추천 모듈 (recommend.js) 생성

**Files:**
- Create: `js/recommend.js`
- Depends on: Task 3 (catalog.js)

- [ ] Step 1: recommend.js 작성 - 현재 경로에서 카테고리 자동 감지, catalog.js 데이터에서 같은 카테고리 4개 랜덤 추천, seo-content 영역 내 seo-nav 앞에 위젯 주입
- [ ] Step 2: 커밋

## Task 5: 전체 서브 페이지에 모듈 로드 스크립트 주입

**Files:**
- Modify: 208개 서브 페이지

- [ ] Step 1: Node.js 주입 스크립트 작성 - games/에는 sfx+catalog+recommend+share, 나머지에는 catalog+recommend+share 로드 태그를 </body> 앞에 삽입
- [ ] Step 2: 실행 및 검증 (share.js 로드 페이지 208개, sfx.js 로드 60개 확인)
- [ ] Step 3: 임시 스크립트 삭제 + 커밋

## Task 6: 퀴즈 리더보드 연동

**Files:**
- Modify: `quiz/*.html` (20개)

- [ ] Step 1: quiz 페이지에 Firebase _hub() 함수 + 결과 점수 전송 코드 추가
- [ ] Step 2: 검증 + 커밋

## Task 7: 도구 결과 복사 버튼 추가

**Files:**
- Modify: `tools/*.html` (복사 기능 없는 약 28개)

- [ ] Step 1: 결과 영역 감지 + 복사 버튼 자동 표시 스크립트 주입
- [ ] Step 2: 검증 + 커밋

---

## 실행 순서 및 병렬화

| Task | 내용 | 의존성 | 병렬 그룹 |
|------|------|--------|----------|
| Task 1 | share.js 생성 | 없음 | A (병렬) |
| Task 2 | sfx.js 생성 | 없음 | A (병렬) |
| Task 3 | catalog.js 생성 | 없음 | A (병렬) |
| Task 4 | recommend.js 생성 | Task 3 | B |
| Task 5 | 전체 페이지 모듈 주입 | Task 1,2,3,4 | C |
| Task 6 | 퀴즈 리더보드 | 없음 | C (Task 5와 병렬) |
| Task 7 | 도구 복사 버튼 | 없음 | C (Task 5와 병렬) |

**그룹 A** (Task 1, 2, 3): 독립 모듈 생성 - 완전 병렬
**그룹 B** (Task 4): catalog.js 의존
**그룹 C** (Task 5, 6, 7): 모듈 완성 후 주입 - 5는 순차, 6/7은 병렬

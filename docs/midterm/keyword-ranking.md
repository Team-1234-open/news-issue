# 뉴스 키워드 분석 및 이슈 TOP10 중간보고서

- 담당자: 전지원
- 작성일: 2026-10-28 (한국 시간)
- 공유 목표: 2026-10-29
- 저장소: https://github.com/Team-1234-open/news-issue
- 작업 브랜치: `feature/keyword-ranking`
- 기준 커밋: `69c0247`

## 1. 담당 기능과 구현 목적

기존에 수집한 뉴스 표본에서 자주 등장하는 키워드를 추출하고 가중치를 적용하여 최대 10개 이슈를 보여준다. 별도 API 호출 코드를 추가하지 않고 기존 TanStack Query의 `['naverNews']` 캐시와 `useGetNaverNews()`를 재사용한다. 뉴스 목록·API·App·연관 뉴스 화면은 수정하지 않았다.

작업 시작 시 미커밋 변경사항은 없었고 담당 브랜치가 이미 선택되어 있었다. 로컬 `origin/main`과 HEAD 차이는 0/0이다. `git fetch origin main`은 `.git/FETCH_HEAD` 쓰기 권한 제한으로 실패했고, `git ls-remote`도 네트워크 오류로 실패했다. 따라서 **원격 main 최신 여부는 미검증**이다. 다른 브랜치 변경, commit, push는 수행하지 않았다.

## 2. 뉴스 데이터 입력 구조

기존 API 응답 `data.items` 배열을 입력한다.

```js
{
  items: [{
    title: '<b>반도체</b> AI 투자',
    description: '반도체는 AI 기술 성장',
    originallink: 'https://example.test/1',
    link: 'https://example.test/naver/1',
    pubDate: 'Wed, 28 Oct 2026 09:00:00 +0900'
  }]
}
```

기존 요청 조건은 검색어 `뉴스`, `display: 100`, `start: 1`, `sort: date`이다. 분석은 앞의 최대 100개 항목만 사용한다. `pubDate`는 현재 점수에 사용하지 않는다. 응답의 전체 검색 결과 수 `total`은 분석 표본 수로 사용하지 않는다.

반환 구조는 `{ sampleCount, articleCount, rankings }`이며 `rankings`의 각 항목은 `{ rank, keyword, articleCount, score }`이다. 최상위 `articleCount`는 중복·빈 항목 제외 분석 기사 수, 순위 항목의 `articleCount`는 해당 단어가 등장한 기사 수다. 비배열 입력은 빈 결과로 처리하고 원본 데이터를 변경하지 않는다.

## 3. 키워드 추출 알고리즘

1. 문자열 필드만 읽어 script/style 블록 및 HTML 태그를 제거한다.
2. 주요 이름 엔티티와 10진수·16진수 숫자 엔티티를 해석하고 공백을 정리한다. 지원하지 않는 이름 엔티티와 잘못된 코드 포인트는 공백으로 치환한다.
3. 원문 URL 또는 네이버 URL 중 하나라도 같거나, 정규화한 제목이 같으면 첫 기사만 사용한다. URL은 앞뒤 공백·fragment·끝 슬래시를 제거한다. 제목은 영문 소문자화 후 한글/영문/숫자만 남긴다. 제목이 없으면 요약을 비교 키로 사용한다. 제목·요약 모두 비어 있으면 제외한다.
4. 한글 완성형·영문·숫자의 연속 구간을 추출하고 영문을 소문자로 통일한다.
5. 긴 조사부터 끝의 조사를 한 번 제거하되 두 글자 이상 어근을 보존한다. 예: `반도체는`, `반도체를` → `반도체`, `AI는` → `ai`.
6. 한 글자 토큰, 순수 숫자, `기자`, `뉴스`, `관련`, `사진`, `제공`, `the`, `and` 등의 불용어를 제거한다. `gpt4` 같은 영문·숫자 혼합 단어는 유지한다.
7. 제목·요약 각각 Set을 사용하여 반복 횟수의 과도한 영향을 막는다.

형태소 분석기를 사용하지 않는 규칙 기반 구현이다. 외부 라이브러리 의존성은 추가하지 않았다.

## 4. TOP10 점수 및 순위 계산

- 기사당 제목에 존재하면 2점, 요약에 존재하면 1점이다.
- 같은 기사에서 제목과 요약에 모두 등장하면 총 3점이며 등장 기사 수는 1개다.
- 제목 또는 요약 내부 반복은 추가 점수를 주지 않는다.
- 전체 기사 점수를 합산한 뒤 점수 내림차순 → 등장 기사 수 내림차순 → 키워드 문자 코드 오름차순으로 정렬한다.
- 문자 코드 비교는 실행 환경의 locale 설정에 의존하지 않는다.
- 상위 최대 10개에 1부터 순위를 부여한다. 유효 키워드가 적으면 그 개수만 표시한다.

테스트 전용 고정 표본 3개를 실제 분석한 결과:

| 순위 | 키워드 | 등장 기사 수 | 점수 |
| --- | --- | --- | --- |
| 1 | ai | 2 | 5 |
| 2 | 반도체 | 2 | 4 |
| 3 | 투자 | 2 | 3 |
| 4 | 에너지 | 1 | 3 |

이 표는 API 실데이터 검증 결과가 아니라 fixture 실행 결과다.

## 5. 프론트 화면 구현

`/top-10`에서 기존 Tailwind 스타일로 순위·키워드·기사 수·점수를 표시한다. 수집 표본 수와 중복·빈 기사 제외 분석 수, 점수 기준, 최대 100개 표본 한계를 설명한다. 로딩, API 오류 및 재시도, 빈 뉴스, 유효 키워드 없음 상태를 분기한다. React 텍스트 렌더링을 사용하며 HTML을 직접 삽입하지 않는다.

모바일에서는 줄바꿈과 유동 너비를 적용하고 PC에서는 최대 너비를 제한한다. 키보드 포커스 표시, 상태 안내 role, 순위 목록 레이블을 추가했다. **브라우저의 실제 화면·모바일 표시·상태 전환은 미검증**이다.

### 연관 뉴스 페이지 전달 규약

- 경로: `/related?keyword=<URL 인코딩된 키워드>`
- 예: `/related?keyword=%EB%B0%98%EB%8F%84%EC%B2%B4`, `/related?keyword=ai`
- 생성은 `URLSearchParams`를 사용한다.
- 수신 담당자는 `useSearchParams().get('keyword')`로 읽을 수 있다.
- 영문 키워드는 소문자로 전달한다. 원래 기사의 표기와 다를 수 있다.
- `RelatedPage.jsx`는 현재 빈 화면이다. 링크 구현만 완료했으며 실제 필터링·목록 출력은 방서준 담당자와 규약 합의 및 구현 후 검증해야 한다. 해당 파일은 수정하지 않았다.

## 6. 실제 테스트 결과

실행 환경: Node.js `v24.22.1`.

| 실행/검증 | 결과 | 근거 및 제한 |
| --- | --- | --- |
| `node --test frontend/tests/keywordRanking.test.js` | PASS | 12개 통과, 0개 실패 |
| 정상 데이터·가중치 | PASS | fixture의 기사 수 및 ai/반도체 점수 검증 |
| 0개·null·비정상 입력 | PASS | 최상위 입력과 기사 필드 검증 |
| 중복 기사·HTML·엔티티 | PASS | URL/제목 중복, script/style 제거 검증 |
| 한글·영문·조사·불용어 | PASS | 영문 대소문자 및 AI는 포함 |
| TOP10·동점 처리 | PASS | 상위 10개, 연속 순위, 입력 순서 역전 검증 |
| 영역 내 중복·최대 100개·불변성 | PASS | 반복 토큰, 상한, 원본 유지 검증 |
| `git diff --check` | PASS | 공백 오류 없음 (줄바꿈 변환 경고만 존재) |
| `npm run build --prefix frontend` | 실행 실패 / 미검증 | npm 명령이 없는 환경이며 node_modules도 없음 |
| `npm run lint --prefix frontend` | 실행 실패 / 미검증 | 동일 환경 문제로 ESLint 자체가 실행되지 않음 |
| 의존성 설치 대체 시도 | 실행 실패 | 번들 pnpm의 프로젝트 등록 symlink 생성이 EPERM으로 차단됨 |
| API 실호출·브라우저 화면 | 미검증 | 실행 의존성 및 API 자격증명 설정을 확보하지 못함 |

빌드·린트는 변경 전에도 npm 부재로 실행되지 않았다. 코드 자체의 기존 오류와 신규 오류 여부는 도구가 실행되지 않아 판별할 수 없다. 실행 실패를 소스 코드 검사 통과로 기록하지 않는다. 단위 테스트 원문은 `keyword-ranking-test-results.txt`에 보관했다.

운영 코드는 fixture를 import하지 않으며 API 실패 시 샘플로 대체하지 않는다.

### 팀원 환경 재검증 절차

```powershell
cd frontend
npm ci
npm test
npm run build
npm run lint
npm run dev
```

기존 Vite 프록시가 읽는 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`을 로컬 환경에 설정한 뒤 `/top-10`을 방문한다. 비밀값은 보고서·Git에 넣지 않는다. Vite 개발 프록시를 사용하므로 정적 preview/배포 환경 API는 별도 확인이 필요하다.

- PC와 375px 모바일 너비에서 순위·긴 키워드·점수·포커스를 확인한다.
- 개발자 도구 Network에서 최초 `/api/naver/news` 요청 후 뉴스 목록과 TOP10 사이 이동 시 추가 요청이 발생하지 않는지 확인한다. 기존 StrictMode 등으로 인한 개발 동작도 구분한다.
- 느린 네트워크에서 로딩, 요청 차단 후 새로고침으로 오류, 차단 해제 후 재시도를 확인한다.
- 테스트 환경에서 응답을 `{ items: [] }`로 모킹하여 빈 상태를 확인한다. 운영 데이터나 API 코드를 샘플로 교체하지 않는다.
- 키워드 클릭 시 URL 전달을 확인한다. 연관 뉴스 결과는 담당자 구현 후 확인한다.
- 성공·오류·빈 상태의 PC/모바일 스크린샷을 보고서 검증 자료로 추가한다. 현재 스크린샷은 없음.

## 7. 한계점 및 향후 개선

검색어 `뉴스`에 대한 최신 최대 100개 표본이므로 언론사·검색어·시간대에 편향된다. 전체 뉴스나 네이버 공식 실시간 인기검색어 순위로 해석하면 안 된다. Query 캐시의 기존 설정을 유지하므로 자동 주기 갱신 기능도 없다.

조사 제거는 사전 기반 형태소 분석이 아니므로 명사의 일부를 잘못 자르거나 복합 조사·활용형을 놓칠 수 있다. 기자 이름·기관명 변형·동의어·표기 차이도 완전히 통합하지 않는다. 순수 숫자는 날짜 잡음을 줄이기 위해 제외하지만 숫자 자체가 이슈인 경우도 놓친다. 같은 제목의 다른 기사까지 중복으로 판단할 수 있고, URL과 제목이 모두 다른 유사 기사는 제거하지 못한다. URL query는 보존하므로 추적 파라미터만 다른 URL은 제목이 다르면 중복을 놓칠 수 있다. 빈 제목의 동일 요약은 중복으로 처리한다.

향후 실제 표본에서 오탐을 수집해 불용어·조사 예외 사전을 개선하고, 필요하면 형태소 분석 및 유사 기사 군집화를 검토한다. 담당자와 연관 뉴스 쿼리 규약을 합의하고 실제 API·화면 검증을 보완한다.

## 8. 변경 파일 및 GitHub 협업 기록

저장소 루트: `C:\Users\전지원\Desktop\web_dev\news-issue`

| 상대 경로 | 구분 | 역할 |
| --- | --- | --- |
| `frontend/src/utils/keywordRanking.js` | 신규 | HTML 정리, 중복 제거, 키워드 및 순위 계산 |
| `frontend/src/pages/top_10/TopTenPage.jsx` | 수정 | TOP10 및 상태별 화면, 연관 뉴스 링크 |
| `frontend/tests/keywordRanking.test.js` | 신규 | Node 기본 단위 테스트 12개 |
| `frontend/tests/fixtures/news.js` | 신규 | 테스트 전용 고정 표본 3개 |
| `frontend/package.json` | 수정 | test 스크립트 추가, 의존성 변경 없음 |
| `docs/midterm/keyword-ranking.md` | 신규 | 중간보고서·협업 초안·재검증 절차 |
| `docs/midterm/keyword-ranking-test-results.txt` | 신규 | 자동 테스트 실행 원문 |

### 제안 Issue

제목: `[전지원] 뉴스 키워드 추출 및 이슈 TOP10 구현`

본문 초안:

> 목적: 기존 뉴스 Query 표본을 재사용하여 키워드와 TOP10을 제공한다.
>
> 범위: HTML/엔티티 정리, 중복 기사 제거, 조사·불용어 필터, 기사 수/가중치/동점 규칙, TOP10·로딩·오류·빈 상태, 연관 뉴스 쿼리 링크, fixture 및 단위 테스트, 중간보고서.
>
> 구현 기준: 제목 2점·요약 1점, 영역별 1회·기사 수 1회 집계, 최대 100개 표본, 동점은 기사 수와 문자 순서로 결정. 네이버 공식 인기검색어 순위가 아님을 안내한다.
>
> 완료 조건: 단위 테스트 통과, 팀원 환경 build/lint 및 API/PC/모바일 확인, 방서준 담당자와 keyword 규약 합의.
>
> 진행: 소스 구현 및 단위 테스트 12개 완료. build/lint/API/화면·연관 뉴스 수신은 미검증. 관련 보고서: docs/midterm/keyword-ranking.md.

### 제안 PR

제목: `feat: 뉴스 키워드 분석 및 이슈 TOP10 구현`

본문 초안:

> 기존 `/top-10` 빈 화면을 뉴스 표본의 키워드 순위 화면으로 구현했습니다. 기존 `['naverNews']` 캐시를 재사용하고 API 호출 코드를 추가하지 않았습니다.
>
> 제목·요약 정리, 중복 기사 제거, 조사·불용어 처리 후 기사당 제목 2점·요약 1점을 합산합니다. 점수 → 기사 수 → 키워드 문자 순서로 최대 10개를 결정합니다. 상태별 안내와 `/related?keyword=...` 링크를 추가했습니다. 연관 뉴스 담당 화면은 변경하지 않았습니다.
>
> 검증: Node 기본 단위 테스트 12/12 PASS. build/lint는 npm 및 의존성 부재, 대체 설치의 EPERM으로 실행하지 못했습니다. 실제 API·브라우저·모바일은 미검증이며 팀원 환경 확인이 필요합니다. 원격 main 최신 확인도 제한되어 있습니다.
>
> 리뷰 요청: 가중치·중복 정책, 조사/불용어 오탐, 표본 한계 설명, 기존 캐시 재사용, 연관 뉴스 keyword 규약을 확인해 주세요. 상세 내용과 재검증 절차는 중간보고서를 참조해 주세요.
>
> 관련 Issue: 생성 후 실제 번호를 기재합니다. 아직 Issue/PR을 생성하지 않았습니다.

### 사용자가 직접 수행할 Git/PR 절차

아래 명령은 자동 실행하지 않았다. 새 팀원 변경사항이 있다면 먼저 확인하고 보존한다.

```powershell
git status --short --branch
git fetch origin
git log --oneline HEAD..origin/main
```

main에 새 커밋이 있으면 팀의 병합 정책에 따라 담당 브랜치에 반영하고 테스트를 재실행한다. 충돌을 임의로 덮어쓰지 않는다. 확인 후 이번 변경 파일만 stage한다.

```powershell
git add frontend/package.json frontend/src/utils/keywordRanking.js frontend/src/pages/top_10/TopTenPage.jsx frontend/tests/keywordRanking.test.js frontend/tests/fixtures/news.js docs/midterm/keyword-ranking.md docs/midterm/keyword-ranking-test-results.txt
git diff --cached --stat
git commit -m "feat: 뉴스 키워드 분석 및 이슈 TOP10 구현"
git push origin feature/keyword-ranking
```

Issue를 위 초안으로 생성하고, GitHub의 Compare & pull request에서 base `main`, compare `feature/keyword-ranking`을 선택한다. 위 PR 본문에 실제 Issue 번호와 추가 검증 결과를 반영한다. 기존 API/뉴스 목록 담당자와 방서준 담당자에게 리뷰를 요청한다.

- Issue URL/번호: 미생성
- PR URL/번호: 미생성
- 최종 commit hash: 미커밋
- 리뷰 결과: 미진행

### 팀장 전달용 요약

전지원 담당 뉴스 키워드 추출 및 TOP10 화면 소스 구현을 완료했습니다. 기존 뉴스 캐시를 재사용하며 제목 2점·요약 1점과 중복 집계 방지, 결정적 동점 정렬을 적용했습니다. 고정 표본 기반 단위 테스트는 12개 모두 통과했습니다. 샘플을 운영 화면에 표시하지 않으며 공식 인기검색어가 아닌 최대 100개 뉴스 표본 분석임을 안내합니다. 현재 실행 환경 제한으로 build/lint, 실제 API 및 PC/모바일 화면은 미검증입니다. 연관 뉴스 화면은 수정하지 않았으며 keyword 쿼리 수신 규약 합의가 필요합니다. commit/push 및 Issue/PR 생성은 사용자 진행으로 남겨 두었습니다.

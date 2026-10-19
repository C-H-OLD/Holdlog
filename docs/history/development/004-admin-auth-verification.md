# 004 관리자 인증 실제 HTTPS 연동 검증

2026-10-14, #57·T025·FR-006의 실제 관리자 인증 연동을 수행했다. 기준은 [004 spec](../../../specs/004-identity-profile/spec.md), [T025](../../../specs/004-identity-profile/tasks.md), [C02](../../../packages/contracts/conventions.md#인증기기관리자--c02c03c09), [초기 계정 절차](../../../specs/001-development-foundation/contracts/admin-bootstrap.md)다. #52/PR #63 및 #54/PR #64가 develop에 병합된 코드에서 시작했다. 제품 동작·공통 계약·DB migration은 변경하지 않았다.

## 시험환경과 신뢰 경계

| 항목 | 실제 환경 |
|---|---|
| 기준 코드 | develop merge `de3b81624e3a13e00a7c9361ea3594893ae14991` |
| API·Vite 호스트 | macOS ARM64, Node24.21.0·npm11.19.0 |
| DB | 별도로 생성한 PostgreSQL17.11 `holdlog_test`, localhost 동적 port |
| 브라우저 | Debian12 ARM64 Chromium155.0.8059.39, Playwright-core1.62.1 |
| 브라우저 신뢰 | 해당 실행의 Linux NSS 저장소에 public root CA를 `C,,`로 설치 |
| NSS·글꼴 | libnss3-tools3.87.1-1+deb12u4, fonts-noto-cjk20220127+repack1-1 |
| 브라우저 이미지 | `sha256:7e19fabd00a07853cfe731c29ad0f1412c23a026fb34e503139184245f13d996` |
| 개발 origin | 같은 localhost의 서로 다른 두 HTTPS port. 주 origin만 서버 허용 목록에 등록 |

Browser plugin not available로 regular Playwright를 사용했다. 브라우저 URL은 `https://localhost:<port>`이며 Docker의 localhost mapping은 호스트의 loopback Vite 연결만 제공한다. 서버의 허용 origin은 실제 주 HTTPS origin을 설정 검사로 검증한 값이다. proxy 뒤 실제 Nest API는 허용된 loopback HTTP 예외를 유지한다.

CA 미설치 상태에서 같은 leaf의 `ERR_CERT_AUTHORITY_INVALID`를 확인하고, CA 설치 뒤 TLS chain/issuer 검증과 정상 페이지200을 확인했다. 신뢰 CA를 유지한 다른 호스트명은 `ERR_CERT_COMMON_NAME_INVALID`로 거절됐다. `ignoreHTTPSErrors=false`, 인증서 오류 무시 flag 없음, 오류 화면 우회 없음이다. 호스트 macOS의 시스템/브라우저 신뢰 저장소는 변경하지 않았다. 시험 CA의 개인키는 호스트 임시0700 폴더에만 두고 브라우저에는 public root만 전달했다.

## 실제 수행 결과

| 검사 | 관측 결과 |
|---|---|
| bootstrap | 실제 CLI의 PTY create·중복 ALREADY_EXISTS·expected-version1 교체 통과. 비밀번호 echo0·terminal 복구·종료 코드 확인 |
| 로그인·cookie | 실제 API200. Chromium이 host-only·Secure·HttpOnly·SameSite=Lax·Path=/api/v2/admin cookie를 저장. JSON은 principalId/csrfToken/expiresAt만 포함 |
| 자동 전송·path | 브라우저가 세션·보호 API에 cookie를 자동 전송. `/api/v2/me`에서는 관리자 cookie 미전송. Cookie 헤더를 검사 코드에서 수동 입력하지 않음 |
| HttpOnly·비밀 | cookie path 안의 문서에서도 document.cookie 빈 값. password input 즉시 비움, CSRF 화면 비노출, localStorage/sessionStorage0, URL·console·결과에 시험 비밀 없음 |
| Provider 재구성·수명 | 실제 reload 뒤 authenticated 재구성, 같은 세션 CSRF 유지. DB last_activity 증가, absolute expires_at 불변, effective idle expiry 확인 |
| 합성 보호 쓰기 | 기존 `withAdministrator`가 실제 DB TX에서 쓰기1건 commit. 제품006/019 API가 아닌 검사 전용 probe |
| CSRF | 누락·불일치·다른 세션 token의 브라우저 POST403. 각 거절 후 DB value 변화0 |
| Origin | 다른 실제 HTTPS port의 페이지에서 정상 browser Origin·cookie·정상 CSRF를 전송했으나403. proxy가 원래 Origin을 보존. 별도 Node 신뢰 TLS의 Origin 누락 로그인도403 |
| 회원/관리자 분리 | 실제 회원 Bearer의 내 정보200, 관리자 cookie/secret은 회원 Bearer 대체 불가401. 회원 Bearer·클라이언트 crew_admin/주체 표식으로 관리자 세션 조회401 |
| 교체 | 실제 bootstrap replace 뒤 두 브라우저 세션 모두401·Provider anonymous·보호 쓰기 거절. 옛 비밀번호401, 새 비밀번호200 |
| idle/absolute 만료 | 해당 시험 principal의 세션 시각만 과거로 조정. 실제 서버401·Provider 무효화·금지 쓰기0. absolute 사례는 Chromium cookie가 남아 있는데 서버에서 거절함도 확인 |
| 비활성 | 시험 principal 비활성 뒤 조회/쓰기401, 해당 비밀번호 로그인401. 다시 활성화한 후 새로운 로그인200 |
| 로그아웃 | 실제 Provider가 session CSRF를 재구성해 DELETE200. 동일 cookie 속성+Max-Age0, 브라우저 cookie 제거, DB revoked_at 저장, 이후 세션401 |
| 브라우저 화면 |1100×750·390×844 screenshot에서 한글/controls/상태 확인. 빈 화면·Vite overlay 없음, page runtime 오류0 |

브라우저 검사는21개 검증 묶음을 기록한다. Origin 누락 wire fault와 CLI PTY 검사는 별도 구분이다. 통과한 합성 쓰기1건 이외에는 거절 사례에서 DB 쓰기가 발생하지 않았다. 오류/예상401·403을 앱 runtime 오류와 구분했다. 관리자 가입 UI나 새 제품 로그인 화면은 추가하지 않았다.

## 재실행과 검사 증거

현재 실행 절차는 [재실행 안내](../../../infra/development/admin-auth-verification/README.md), 기존 수동 준비는 [로컬 HTTPS 안내](../../../infra/development/admin-https.md)에 있다. `scripts/verify-admin-https/run.mjs`가 실제 API/Vite·시험 DB·CA를 소유하고 `browser.mjs`가 TLS·browser assertions, `bootstrap-pty.py`가 숨김 CLI 입력을 검사한다.

| 수행 명령 | 결과 |
|---|---|
| `npm run build --workspace @holdlog/server` | 통과 |
| `docker build -t holdlog-57-browser -f infra/development/admin-auth-verification/Dockerfile.browser infra/development/admin-auth-verification` | 격리 브라우저·NSS·CJK 이미지 준비 |
| `node scripts/verify-admin-https/run.mjs` | 실제 HTTPS21묶음·Origin 누락403·bootstrap3종 통과, skip0 |
| `npm run check` | 전체100개·lint/typecheck·계약/lockfile·웹/API build 통과 |
| `npx eslint scripts/verify-admin-https/*.mjs --max-warnings=0` | 통과 |
| 문서·정적 계약·diff | `python3 scripts/check-docs.py`, `python3 scripts/check-contracts.py`, `git diff --check`로 확인 |
| 별도 코드 리뷰 | 시험환경 격리·비밀 입력·TLS 음성 대조군·증거/범위 검사, 차단 결함 없음. CodeRabbit과 구분 |

시험 비밀·hash·token·cookie 원문은 이 기록과 Git/PR에 넣지 않았다. 실행 뒤 소유한 DB/browser container와 API/Vite, 임시 입력·인증서·개인키를 정리했다. 비밀 없는 JSON summary와 screenshot만 저장소 밖의 임시 증거 폴더에 남겼다. 첫 이미지의 CJK 글꼴 누락은 시험 이미지에서 보완하고 화면을 다시 확인했다.

## 완료 범위와 후속

T025의 관리자 인증 실제 HTTPS 연동 증거를 제공한다. 업무 controller를 추가하지 않았으므로006/019 실제 목록·폼·쓰기와 보호자료 cleanup 연결은 해당 기능 연동에서 확인한다. 회원 fixture는 실제 DB/session 구현을 사용하지만 Google/Apple 제공자 인증이나005의 실제 크루 관리자 지정 흐름을 검증한 결과는 아니다. 클라이언트 표식 거절과 그 전체 기능 완료를 구분한다.

#52에서 전달한 운영 접근 확대 전 guessing budget/backoff 또는 관리 ingress, 강한 무작위 provisioning 정책, cold-instance timing 조건은 유지한다. 이번 로컬 검증은 운영 공개·물리 서버 배포·운영 계정 준비의 승인이 아니다. 모바일·사진·제공자/기기·나머지 필수 작업이 남아004 상위 #45는 완료 처리하지 않는다.

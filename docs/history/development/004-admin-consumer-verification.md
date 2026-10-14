# 004 관리자 세션 소비·HTTPS 개발 도구 단독 검증

2026-10-14, #54/T019·T020·T024를 Node24.21.0/npm11.19.0·React19.3.0/Vite8.3.3·macOS ARM64에서 구현·검사했다. 기준은 [004 FR-006](../../../specs/004-identity-profile/spec.md), [관리자 아키텍처](../../architecture/admin.md), [C02](../../../packages/contracts/conventions.md#인증기기관리자--c02c03c09)다. 실행 설정은 [개발 안내](../../development.md#관리자-세션-소비와-https-검사)·[HTTPS 준비](../../../infra/development/admin-https.md)가 원본이다.

## 구현과 단독 결과

- 생성 operation path/method·입력/응답 validator를 사용하는 관리자 로그인/세션/로그아웃 API를 추가했다. 상대 same-origin cookie 전송, 요청키/CSRF, 기한/취소, 계약·HTTP·네트워크 실패를 구분하며 원시 오류/응답·비밀번호·cookie를 결과나 로그에 보관하지 않는다.
- `AdminAuthStore`는 principal/CSRF/expiry를 메모리에 두고 공개 snapshot에서 CSRF를 제외한다. `AuthProvider`/`useAdminAuth`와 실제 앱 bootstrap을 연결했다. 새 제품 로그인 화면은 없다.
- 재조회 single-flight, 현재 세대/만료 검사, 교체/401/403/로그아웃/unmount의 cleanup, 늦은 응답 거절을 검사했다. 형식이 잘못된401/403도 권한을 보존하지 않는다. 유효 세션의 일시 장애는 빈 자료/성공으로 변환하지 않는다.
- Cookie 변경 login/logout을 직렬화하고 재조회가 이 작업들을 기다리게 했다. 업무 응답은 `runProtected`가 세션/expiry를 재조회하고 현재 세대일 때만 동기 apply한다. 실제006/019 업무 API/캐시 구현은 아니다.
- 이미 만료된 로그인 응답과 설치 도중의 만료는 성공으로 안내하지 않는다. 긴 timer 거리는 browser timer 범위로 나눠 초기 overflow로 즉시 로그아웃하지 않는다.
- HTTPS opt-in은 Node에서 localhost/127.0.0.1 SAN·유효 기간·키 일치·개인키 파일 권한을 검사한다. same-origin proxy는 Origin·Cookie·CSRF·Set-Cookie 속성과 path를 그대로 보존한다. 검사 HTML은 Vite의 React/client 변환을 거치며, 미활성 경로/직접 검사 모듈은404다.
- production build는 개발 도구·Node 설정·합성 비밀 표식·인증서/키를 제외하고 preview가 HTTPS 파일을 로드하지 않는다. 관리자 workspace에 계약 runtime 의존성을 직접 선언했고 lockfile 변경과 함께 admin auth 전용 생성 검사 진입점을 추가했다. 전체 validator/index는 보존하고 필요한 operation만 standalone으로 생성해 사용한다. HTTP/runtime 원본·계약 버전·서버 API는 바꾸지 않았다.

## 검사 증거

| 실행 | 결과·한계 |
|---|---|
| 기존 admin 기준 `npm test --workspace @holdlog/admin` | 변경 전9개 통과 |
| 관리자 전체 단독 |33개 통과, auth20개·HTTPS2개·기존9개·admin upstream1개·평문 LAN 차단1개 |
| `npm run check` | 계약/lockfile·전체 lint/typecheck·단독100개·웹/API build 통과 |
| 문서·정적 계약·diff | `python3 scripts/check-docs.py`, `python3 scripts/check-contracts.py`, `git diff --check` 통과 |
| 코드 리뷰 | 만료된 login 응답이 resolve되던 지적을 실패 재현 후 수정. 리뷰 재검토에서 추가 차단 결함 없음 |

브라우저의 검사 흐름은 HTTPS 개발 도구 → 합성 계정 로그인 → 세션 재조회 → 로그아웃이다. Browser plugin not available로 bundled Playwright1.62.1과 설치된 Chrome의 독립 임시 profile을 사용했다. bundled Chromium 실행 파일은 없었고, sandbox Chrome 실행은 SIGABRT/EPERM으로 실패해 승인된 실행으로 검사했다. 시스템 신뢰 저장소는 바꾸지 않았다.

| 브라우저 확인 | 증거 |
|---|---|
| 페이지·빈 화면·overlay | HTTPS `/__development/admin-auth`, 개발 도구 title/controls 표시·Vite overlay 없음 |
| 동작 | login authenticated → session 재조회 → logout anonymous. 비밀번호 input은 전송 전에 비움 |
| 비밀/전송 경계 | cookie/Origin/CSRF 전달, localStorage/sessionStorage0·화면에 CSRF 원문 없음 |
| viewport |1100×750·390×844 screenshot 확인, 입력·버튼·결과 표시 |
| console | 페이지 JS 오류0. 초기 익명 조회의 예상401과 앱 runtime 오류를 구분 |

스크린샷·브라우저 일회성 스크립트와 임시 개인키는 저장소 밖에서 관리했다. Node HTTPS 검사에는 임시 CA를 해당 요청만 신뢰하게 주입해 TLS 검증을 유지했다. 브라우저에는 합성 인증서용 `ignoreHTTPSErrors`를 적용했으므로 시스템/브라우저 trust 확인을 통과했다고 부르지 않는다. Vite HTML 변환 누락으로 도구가 비던 문제는 브라우저 재현·HTTP 회귀 검사 뒤 수정했다.

CodeRabbit의 OpenSSL 절대 경로 지적을 반영해 `PATH`로 실행 파일을 찾도록 수정하고 단독/전체 검사를 재실행했다. 누락 시 사전 조건 오류로 실패하며 필수 HTTPS 검사를 skip하지 않는다. 현재 호스트의 기본 PATH는 Intel OpenSSL을 먼저 가리켜 ARM64 실행에 실패하므로, 검사는 native Node/system 도구가 먼저 오는 PATH로 수행했다. PATH 미설정 환경에서 명확한 사전 조건 실패·skip0도 확인했다.

CodeRabbit 후속 보안 요약의 일반 HTTP 모드 평문 LAN 경로를 확인하고 수정했다. 도구 활성화와 무관하게 `/api/v2` proxy는 loopback HTTP 또는 검증된 사설 HTTPS에만 연결한다. 기존 사설 HTTP health 모드는 유지하며 해당 모드의 API 요청은 Vite middleware에서503·no-store로 종료해 쿠키/CSRF를 upstream으로 보내지 않는다. 회귀 검사는 변경 전 proxy 설정 존재로 실패했고, 수정 후 실제 Vite의 credential-bearing API 요청503을 확인했다.

후속 health proxy 지적도 반영했다. health 경계에서 Cookie·X-CSRF-Token·Authorization을 제거하고, 실제 Vite upstream 수신 헤더 검사로 변경 전 실패·수정 후 제거를 확인했다. 관리자 API의 Origin·Cookie·CSRF 보존 검사는 유지했다.

최종 CodeRabbit 재진입 요약을 확인해 세션 수락·cleanup·login 알림 중 동기 logout/suspend가 이전 권한을 복원하는 실패3개를 재현했다. 전환 세대를 callback 이전에 소유하고 callback 뒤 다시 대조하며, cookie mutation queue도 알림 전에 예약한다. 이전 전환이 새 전환의 snapshot을 덮어쓰거나 보호 callback에 CSRF를 전달하지 못하는 회귀 검사를 추가했다.

추가 보안 요약의 지연 조회 lifetime과 보호 결과 재검증 경로도 수정했다. mutation 뒤로 미룬 check는 요청 당시 세대를 유지하고 suspend 뒤 시작하지 않는다. runProtected는 post-request check의 안전한 실패 범주를 전달하며 transient 실패 때 기존 세션/입력은 유지하되 새 결과를 apply하지 않는다. 두 회귀 검사의 변경 전 실패와 수정 후 통과를 확인했다.

## 남은 검증과 영향

#57의 실제 #52 API·시험 계정·신뢰 HTTPS 브라우저와 교체/만료/권한/회수 연동,006/019 제품 자료·폼과 cleanup 연결은 미수행이다. 현재 증거로 #57이나004 전체를 완료 처리하지 않는다. #52에서 전달한 운영 접근 확대 전 보강 조건도 유지한다.

초기 전체 validator namespace 조회는 JS1.18MB(gzip129KB)의 chunk warning을 만들었다. 생성 도구에 `@holdlog/contracts/admin-auth-checks`를 추가해 세 operation의 transitive 검사만 생성·소비하도록 수정했다. 최종 JS254KB(gzip76KB), chunk warning0을 확인했다. 기존 전체 validator/index와 형식 원본을 유지하고 입력/응답 검사를 제거하지 않았다. 생성 출력16파일과 단독 회귀 검사가 새 진입점/메타데이터/validator 연결을 확인한다.

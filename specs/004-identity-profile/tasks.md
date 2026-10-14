# Tasks: 로그인과 내 정보·프로필

> 승인07.02·신규 가입 증명/완료·사진 실패 복구를 반영했다. 계약3.0.0/API v2 전환은 PR #60으로 병합했다. #49는 T001~T005 공통 기반을 구현·단독 검증하며 #51의 모바일 인증·가입·이름 profile API/단독 검사는 구현했고 UI/실제 연동은 후속 역할 작업이다. 체크는 각 작업의 구현/검사 범위이며 이슈 종료에는 PR 병합이 필요하다.

**Input**: [설계](plan.md) · [스펙](spec.md) · [연구](research.md) · [저장 모델](data-model.md) · [계약](contracts/README.md)

**Status**: 개발 준비. T006 병합 완료. T001~T005 공통 기반의 [실행 증거](../../docs/history/development/004-identity-foundation-verification.md)를 연결했다. #51 모바일 인증·가입·이름 profile의 [서버 단독 증거](../../docs/history/development/004-mobile-identity-api-verification.md)를 추가했다. #52 관리자 API·bootstrap의 [단독 증거](../../docs/history/development/004-admin-api-verification.md)를 추가했다. 관리자 웹·사진·실제 연동은 미완료다. `[BE]`·`[FE]`·`[SHARED]`·`[INTEGRATION]`은 담당 역할이며 `[P]`는 선행 충족 뒤 파일이 다른 작업 사이에서만 병렬 가능하다. 상세 규칙은 계약/제품 원본에 두고 여기서 복제하지 않는다. 검사 작업은004 FR/SC에 필요한 실패·원자성·기기 증거를 만들기 위한 것이다.

## Phase 1: Setup

- [x] T001 [SHARED] `specs/004-identity-profile/research.md`와 `docs/setup-checklist.md`에 Google/Apple client/audience·서명·실기기·Android Apple redirect 준비 조건과 비밀 경계를 고정한다. 이름 필수·사진 선택/07.02는 확정이다. 외부 설정 미준비는 해당 실제 연동만 차단하고 합성 서버/관리자 준비를 막지 않는다.
- [x] T002 [SHARED] `apps/mobile/app.config.ts`, `apps/mobile/package.json`, `apps/server/package.json`, `package-lock.json`에서 보안 저장/JOSE/Argon2의 설치·타입·빌드 호환성을 확인하고 정확한 버전과 config plugin을 고정한다. provider 후보 선택과 실제 nonce/기기 gate는 T029로 분리해 서버/관리자 준비를 외부 계정 대기로 막지 않는다.

## Phase 2: Foundational

공통 SQL/receipt/설정은 BE 구현의 선행이다. FE 전송·상태의 mock 단독 개발은 이 SQL을 기다리지 않는다. T029의 실제 provider 어댑터 확정과 FE 순수 로직 검사는 구분한다.

- [x] T003 [SHARED] `apps/server/db/migrations/002_identity.sql`에서 [004 저장 배치](data-model.md)의 인증/가입증명/관리자/기기/receipt SQL을 추가하고 `apps/server/test/identity.e2e-spec.ts`에서 실제 FK·unique·version·migration 재실행/실패를 검사한다.011 Asset 테이블을 복제하지 않는다. 최초 설치 stub은002 원본의 nullable 경계를 사용하고017 등록 전 push token 미보관·발송 제외를 확인한다.
- [x] T004 [SHARED] `apps/server/src/database/transaction.ts`, `apps/server/src/modules/identity/identity.repository.ts`에 같은 client의 TX·잠금·receipt 공통 경계를 마련한다. completeSignup의 비대기 요청 진입 잠금은 [가입 설계](signup-design.md#가입-완료요청키동시성)를 따르고 이후 업무 잠금은 identity key→challenge/proof→Account/Session/Credential/Device 순서·unique경쟁·원문 미보관을 `apps/server/test/identity.e2e-spec.ts`로 확인한다.
- [x] T005 [SHARED] `apps/server/src/config/environment.ts`, `apps/server/.env.example`, `apps/server/src/config/logging.ts`에 audience/JWKS·Apple 서버키·CSRF 파생키·allowlist 설정의 검증·비밀 제외를 추가하고 `apps/server/test/config.spec.ts`에서 누락/잘못된 설정·출력 경계를 검사한다. 운영값/키 원문을 예시에 넣지 않는다.
- [x] T006 [SHARED] `packages/contracts/openapi.json`, `runtime.schema.json`, `conventions.md`, `examples.json`와 `specs/002-shared-contracts/data-model.md`에 [계약 변경 설계](contracts/README.md)의3.0.0/API v2·LoginResult·SignupProof·CompleteSignupInput/completeSignup·07.02 Route·증명 수명/오류/receipt를 반영한다. `apps/admin/src/api/contracts.ts`, `vite.config.ts`, `apps/admin/test/contracts.test.ts`, `runtime.test.ts`의base/proxy를v2로 맞추고 cookie path 문서·003 전달을 갱신한다. 생성 도구로 재생성한 `packages/contracts/generated/`와 FE/BE 소비 예제를 같은 manifest로 검사한다. `npm run contracts:check`, `npm run check`, 정적 계약/문서 검사와 분기 혼합/unknown JSON 거절을 통과한 전환 PR 병합 전 새 DTO 소비를 착수하지 않는다. 현재 제품 API 배포자가 발견되면 별도 호환 계획 없이 전환하지 않는다.

## Phase 3: US1 로그인과 내 정보·프로필 이용 (P1)

**Goal**: FR-001~006의 정상 흐름과 기존 원본의 권한/경계를 역할별로 제공한다.
**Independent Test**: BE는 합성 provider+실제 시험 DB, FE는 같은 생성 계약의 transport/store adapter로 단독 검증한다. 실제 provider·화면/다른 스펙 연동은 최종 단계에서 확인한다.

- [x] T007 [BE] [US1] `apps/server/test/identity.spec.ts`, `apps/server/test/identity.e2e-spec.ts`에 challenge/login 분기/completeSignup/refresh/logout 정상·재로그인·제공자 분리의 실패하는 검사를 먼저 작성한다.
- [x] T008 [BE] [US1] `apps/server/src/modules/identity/providers.ts`에서 고정 JWKS·issuer/audience·expiry·nonce·subject·Apple code 교환을 검증하고 네트워크 기한/키 교체/안전한 실패를 연결한다.
- [x] T009 [BE] [US1] `apps/server/src/modules/identity/mobile-session.ts`, `identity.service.ts`에 기존 계정 세션 발급과 신규 SignupProof 발급을 분리한다. challenge 단일 소비·현재 계정/삭제 상태 재검사·세션/기기 원자 저장을 구현한다. 신규 인증만으로 Account/Session/Device 연결을 만들지 않고 증명으로 보호 API에 접근할 수 없음을 검사한다.
- [x] T030 [BE] [US1] `apps/server/src/modules/identity/signup.ts`, `identity.repository.ts`, `apps/server/test/signup.e2e-spec.ts`에 completeSignup의 증명 hash/15분/설치·trim 이름·요청키·동시 identity 잠금·계정/identity/session/device/proof 원자 저장을 검사 후 구현한다. 입력 오류 미소비·503 rollback·동일 증명/키의 비대기 진입 잠금 및201/409 경합·후발409·성공 응답 유실 뒤 재인증·token 미보관을 검증하며 T009 뒤 수행한다. `apps/server/src/modules/identity/signup-proof-cleanup.ts`와 기존 worker에 만료/소비 증명의 정리 작업을 연결하고 `signup.e2e-spec.ts`에서 주기 실행·재실행·진행 중 잠금·미소비 유효 증명 보존·식별정보 삭제·최소 receipt 보존을 검사한다. 정리 실패 재시도는 가입 API와 독립 실행한다.
- [x] T010 [BE] [US1] `apps/server/src/modules/identity/identity.controller.ts`, `identity.module.ts`, `apps/server/src/app.module.ts`에 login 분기/completeSignup의 생성 입력 검사·모바일 guard·refresh 회전/재사용 family 회수·현재 기기 로그아웃을 연결한다. `apps/server/package.json`에004 단위/DB 검사 명령을 연결하고 기존 기반 검사를 유지한다.
- [x] T011 [P] [BE] [US1] `apps/server/test/admin-auth.e2e-spec.ts`에 관리자 create-only/교체/로그인/session/logout와 회원·크루관리자 거절 검사를 먼저 작성한다. T003~006 뒤 모바일 세션 작업과 파일 경계를 나눠 수행한다.
- [x] T012 [BE] [US1] `apps/server/src/tools/admin-bootstrap.ts`, `apps/server/src/modules/identity/admin-session.ts`에서001 절차의 숨김 입력·Argon2id·명시적 version 교체/전체세션회수·별도guard·cookie/CSRF 파생/Origin 검사를 구현하고 관리자 HTTP 연결은 T010 controller 담당과 순차 조정한다.
- [x] T013 [BE] [US1] `apps/server/test/profile.e2e-spec.ts`, `apps/server/src/modules/identity/identity.service.ts`, `identity.controller.ts`에 본인 profile 조회·이름 변경·ETag/If-Match·멱등 처리를 검사 후 구현한다. T009/T030/T010과 같은 파일이므로 병렬 변경하지 않는다.
- [ ] T014 [BE] [US1] `apps/server/src/modules/identity/identity.service.ts`, `apps/server/test/profile.e2e-spec.ts`에 createProfileImageDraft·본인 ready Asset 연결/제거·동일TX 회수/정리를011 서비스와 연결한다.011 migration/서비스 준비가 착수 선행이며004에 별도 업로드·자산 저장을 만들지 않는다.
- [ ] T015 [P] [FE] [US1] `apps/mobile/test/identity.test.ts`, `apps/mobile/src/api/holdlog/auth.ts`, `profile.ts`에서 transport 주입·생성 타입/응답 검사·계약 오류·요청키/버전을 검사하고 fetch 전송 함수를 구현한다. 서버 구현 대기 없이 fixtures로 시작한다.
- [ ] T016 [FE] [US1] `apps/mobile/src/lib/secureSession.ts`, `identityProviders.ts`, `apps/mobile/src/providers/AuthProvider.tsx`에서 fake provider로 순수 상태를 먼저 검사하고 T029 병합 전에는 fake provider로 독립 검사하고 실제 연결에는 검증 adapter를 소비해 보안 저장·세대/단일refresh·로그아웃 정리를 구현하고 `apps/mobile/test/identity.test.ts`로 저장 실패·취소를 검사한다.
- [ ] T031 [FE] [US1] `apps/mobile/src/lib/signupFlow.ts`, `apps/mobile/test/signup.test.ts`에서 signupRequired/completingSignup/authenticated 구분·증명 메모리 보관/만료·이름 검증·입력/초대 보존·계정 세대·응답 유실/보안 저장 실패 재인증을 검사 후 구현한다. 일반 API/탭 진입은 세션 보안 저장 전 막고 기존 회원은07.02를 건너뛴다. T015~016의 계약 전송/상태 adapter 위에서 수행한다.
- [ ] T017 [FE] [US1] `apps/mobile/src/app/login.tsx`, `signup.tsx`, `(tabs)/profile/index.tsx`, `profile/edit.tsx`, `apps/mobile/src/hooks/mutations/useEditProfile.ts`에07.01/07.02/05.01/05.02를003 부품·라우트와 연결한다.005 PendingInvite·크루 결과 소비,021 삭제 진입과 기존 시안을 대조하고 `apps/mobile/test/profile.test.ts`에 정상/실패 검사를 추가한다.
- [ ] T018 [FE] [US1] `apps/mobile/src/hooks/mutations/useEditProfile.ts`, `apps/mobile/test/profile.test.ts`에011 image draft/upload/ready의 사진 선택·실패 유지·교체/제거를 연결한다.011 adapter와 T017 조립 뒤 수행한다.
- [ ] T019 [P] [FE] [US1] `apps/admin/test/auth.test.ts`, `apps/admin/src/api/auth.ts`, `apps/admin/src/providers/AuthProvider.tsx`에 cookie credentials·세션/CSRF 조회·Origin 실패·logout·보호자료 정리를 검사 후 구현한다. 새 로그인 페이지 없이 API/Provider의 fixture 소비로 독립 시작한다.
- [ ] T020 [FE] [US1] `apps/admin/src/development/admin-auth-check.ts`, `apps/admin/vite.config.ts`, `infra/development/`에서 신뢰 HTTPS·proxy·개발 브라우저 인증 검사 도구를 연결한다. 인증서/키 Git 제외·cookie/Origin 무변경·운영 번들 제외를 확인하고 Node 전용 설정 변경은 공통 담당과 조정한다.

## Phase 4: US2 실패와 경계에서 자료 유지 (P1)

**Goal**: SC-002·FR 실패 조건의 금지 변경/조회0건과 입력/관계 보존을 확인한다. US1 구현 위에서 실패 주입을 수행하는 의존 단계다.
**Independent Test**: 합성 provider·실제 DB의 동시성/rollback, FE fake clock/지연/저장 실패로 각각 재현한다.

- [ ] T032 [FE] [US2] `apps/mobile/src/lib/signupFlow.ts`, `apps/mobile/src/hooks/mutations/useEditProfile.ts`, `apps/mobile/test/signup.test.ts`에 이름 가입 성공 후011 사진 저장·실패 다이얼로그 재시도/사진 없이 계속하기·GET 결과 복구·늦은 응답/다른 계정 차단을 검사 후 연결한다. T018/T031과011 adapter 선행. 이름 재제출/계정 재생성 없이 기존 session을 사용하며 새 전체 상태 화면을 만들지 않는다.
- [x] T021 [BE] [US2] `apps/server/test/identity.e2e-spec.ts`에 첫 가입 요청을 commit 직전에 유지한 상태에서 같은 증명/키의 두 번째 요청은409, 첫 요청은201이며 account/session 각각1개·token 재반환0건임을 검사한다. commit 이후 재요청401·진행 중 다른 입력409·503 이후 같은 키 재시도도 확인한다. challenge/proof 동시소비·같은/다른 증명의 계정 unique경쟁·refresh 동시재사용/회수 commit·현재설치 타계정 재연결·로그아웃 실패/유실·만료경계·삭제상태·receipt 실패를 주입해 token/가입/기록 보존과 금지 처리0건을 검증한다. `apps/server/test/profile.e2e-spec.ts`에서 이름 profile412/428/unknown·rollback을 확인하고 사진 자산 거절은 T014에서 확인한다.
- [x] T022 [P] [BE] [US2] `apps/server/test/admin-auth.e2e-spec.ts`에서 bootstrap 동시/버전/해시/SQL실패·교체회수·CSRF 재조회·Origin/권한 거절·rollback을 확인한다.
- [ ] T023 [P] [FE] [US2] `apps/mobile/test/identity.test.ts`, `profile.test.ts`과 `signup.test.ts`에 가입 증명 만료·소비/응답 유실·공백·선택사진 취소/권한거절·갱신 지연·로그아웃/계정변경·보안저장실패·통신실패/401 분리·동일재시도키·입력유지·초대취소·다른계정 draft 차단을 추가한다.
- [ ] T024 [P] [FE] [US2] `apps/admin/test/auth.test.ts`에 만료/회수·늦은응답·CSRF/권한 실패·다른principal 전환의 보호자료 정리를 검사하고 비밀이 localStorage·로그·운영번들에 없는지 확인한다.

## Phase 5: 제공자 호환성·실제 연동·최종 대조

- [ ] T029 [SHARED] `apps/mobile/src/lib/identityProviders.ts`, `apps/mobile/app.config.ts`, `apps/mobile/package.json`, `package-lock.json`에서 Google nonce 재설정/캐시 회피·iOS/Android Apple nonce/state·code 전달·Android HTTPS redirect interception·SecureStore 재설치/백업과 native 빌드를 검증하고 정확한 SDK 버전을 고정한다. `docs/history/development/004-provider-compatibility.md`에 증거를 기록하며 nonce 불지원·유료 후보로 자동 대체하지 않는다. 실제 provider adapter 확정 전 선행이며 Phase3 순수 로직은 fake adapter로 검사한다.

- [ ] T025 [INTEGRATION] `docs/history/development/004-admin-auth-verification.md`에 실제 시험DB·bootstrap·HTTPS 브라우저의 cookie/path·CSRF/Origin·회원/관리자 분리·만료/교체/로그아웃 결과와 명령을 기록한다.006/019의 제품 쓰기 연동이 없으면 합성 보호 API 결과와 구분한다.
- [ ] T026 [INTEGRATION] `docs/history/development/004-mobile-auth-verification.md`에 Google/Apple×iOS/Android 실제 제공자·nonce·재로그인·취소·토큰회전/회수·SecureStore와003 화면 시안 대조 결과를 기록한다. 미준비 제공자/OS/실기기를 통과로 합산하지 않는다.
- [ ] T027 [INTEGRATION] `docs/history/development/004-cross-feature-verification.md`에서005 초대/크루0·다중/T67/T75·011사진bytes/권한·017로그아웃기기/푸시·021삭제진입을 실제 연동한다. 후속 구현 미준비면 해당 FR 최종 완료를 차단하고 mock 소비 증거만 별도 기록한다.
- [ ] T028 [INTEGRATION] `specs/004-identity-profile/spec.md`, `quickstart.md`, `docs/setup-checklist.md`와 상위 이슈에 FR-001~006·SC-001~004의 모든 작업/병합/실제검사/보류를 대조하고 전체 완료 여부를 판단한다. 준비 문서나 자식 이슈 수만으로 스펙 완료를 표시하지 않는다.

## 요구사항 연결

| 기준 | 작업 |
|---|---|
| FR-001 | T001~010·T015~017·T021·T023·T026·T029~032 |
| FR-002 | T015~017·T023·T026~027·T031~032 |
| FR-003 | T013~018·T023·T027·T032 |
| FR-004 | T009~010·T016·T021·T023·T026~027 |
| FR-005 | T017·T023·T027 |
| FR-006 | T003~006·T011~012·T019~020·T022·T024~025 |
| SC-001 | T025~028 |
| SC-002 | T007·T011·T013·T015~016·T019·T021~027·T030~032 |
| SC-003 | T025~028 |
| SC-004 | T017~018·T026~028·T031~032 |

## 의존 순서와 병렬 작업

T001→T002는 공통 설정·의존성 준비, T003→T004→T005는 SQL/잠금/설정, T006은 별도 계약 전환이다. T006은001 기반에서 독립 착수하며 SHARED가 원본/생성/공통 소비 변경을 한 PR로 모은다. BE/FE 새 가입 DTO 소비는T006 병합이 필수다. BE 모바일 T007→T008→T009→T030→T010→T013, 관리자 T011→T012이며 같은 controller 수정은T010 담당과 순차 조정한다. FE 모바일 T015→T016→T031→T017→T018→T032, 관리자T019→T020. T014/T018/T032는011 준비가 필요하다. T029는T002와 외부 설정/기기 뒤 실제SDK 연결의 선행이며T016/T031 순수fake 검사는 기다리지 않는다. Phase4는 대응 구현 이후이며 T032는 FE 미디어 묶음이 맡는다. T025는관리자 BE/FE, T026은모바일 BE/FE·003·제공자, T027은후속005/011/017/021 해당 기능, T028은전체 검증이 선행이다.

병렬 예시: T006과T003~005는 파일 경계를 나눠 병행할 수 있다. 계약 전환 이후 US1의모바일BE·관리자BE·모바일FE·관리자FE는각자 파일에서 병행하되 같은 controller/lockfile/config는단일 담당이 모은다. US2의T021/T022/T023/T024는대응하는 업무 구현과 단독 검사 이후 서비스별로 병렬 검증한다.

## 구현 전략과 배정 묶음

| 작업 식별자 | 역할·포함 ID | 착수 선행 / 전달 |
|---|---|---|
| [`004/shared-contract-transition`](https://github.com/C-H-OLD/Holdlog/issues/48) | SHARED T006 |001 기반·승인07.02. 계약3.0.0/v2 원본·생성·base/proxy 전달. 새DTO 소비의 선행 |
| [`004/shared-identity-foundation`](https://github.com/C-H-OLD/Holdlog/issues/49) | SHARED T001~005 | 준비 문서 병합. SDK 외부검사는미준비면 명시. SQL/설정/원본·생성/lockfile의 단일 변경 담당 |
| [`004/provider-compatibility`](https://github.com/C-H-OLD/Holdlog/issues/50) | SHARED T029 | 외부 제공자 설정·기기와T002. 실제 SDK/nonce 양플랫폼 검증, 서버/관리자 준비와독립 |
| [`004/backend-mobile-identity`](https://github.com/C-H-OLD/Holdlog/issues/51) | BE T007~010·T013·T021·T030 | T006과공통 SQL/설정 병합. 서버 인증·이름 profile·기기회수 API/DB 검사 전달 |
| [`004/backend-admin-auth`](https://github.com/C-H-OLD/Holdlog/issues/52) | BE T011~012·T022 | T006과공통 준비 병합. 모바일과 controller 연결 충돌 조정. 관리자 실패/동시성 검사 전달 |
| [`004/frontend-mobile-identity`](https://github.com/C-H-OLD/Holdlog/issues/53) | FE T015~017·T023·T031 | T006 fixtures 병합 후 순수 로직 독립 시작. 실제SDK T029·화면003 선행. 모의와실제 구분 |
| [`004/frontend-admin-auth`](https://github.com/C-H-OLD/Holdlog/issues/54) | FE T019~020·T024 | T006 fixtures 병합 후 독립 시작. 실제 HTTPS/BE는 연동 선행 |
| [`004/backend-profile-media`](https://github.com/C-H-OLD/Holdlog/issues/55) | BE T014 |011+profile BE. 실제 자산 소유·ready·회수와 같은TX 검사 전달 |
| [`004/frontend-profile-media`](https://github.com/C-H-OLD/Holdlog/issues/56) | FE T018·T032 |011 adapter+모바일 profile. 선택/업로드/실패 보존 소비 전달 |
| [`004/integration-admin`](https://github.com/C-H-OLD/Holdlog/issues/57) | INTEGRATION T025 | admin BE/FE·시험환경.006/019 실운영쓰기 검사는 해당기능 연동과구분 |
| [`004/integration-mobile`](https://github.com/C-H-OLD/Holdlog/issues/58) | INTEGRATION T026 | mobile BE/FE·003·제공자/기기 |
| [`004/integration-final`](https://github.com/C-H-OLD/Holdlog/issues/59) | INTEGRATION T027~028 | 위 결과와005/011/017/021. 필수후속 미준비면 완료 차단 |

각 ID는 위 한 묶음에만 속한다. 실제 담당·진행·PR은 GitHub 작업 이슈에서 관리한다. 모바일/웹 mock 소비는 서버 제품 구현을 기다리지 않으며 공유 파일은 한 담당이 모은다. MVP는 관리자 단독 접근과 모바일 인증/이름 프로필을 먼저 검증하되 사진·후속 연동 미완료를004 전체 완료로 부르지 않는다.

후속005/011/017/021의 착수 선행은 [`004/backend-mobile-identity`](https://github.com/C-H-OLD/Holdlog/issues/51)의 검증·병합된 인증 경계이며 상위 #45 종료나 [`004/integration-final`](https://github.com/C-H-OLD/Holdlog/issues/59) 종료가 아니다. 관리자006/019는 [`004/backend-admin-auth`](https://github.com/C-H-OLD/Holdlog/issues/52)를 소비한다.004의 최종 교차 검증은 각 후속의 해당 기능 구현 결과를 소비하며 이들의 상위 스펙 전체 종료를 기다리지 않는다.

# 004 신규 가입 처리 설계

2026-10-12 · 제품 입력과 화면 배치는 [S01](../../docs/functional-spec.md#s01-구글apple-로그인)·[승인07.02](../../docs/screen-design.md#screen-07-02)가 원본이다. 이 문서는 인증·가입·사진 처리와 실패 복구의 설계 원본이며 서버/앱 구현·실행 검증 완료를 뜻하지 않는다. HTTP 필드의 원본·생성·기반 소비 전환은 [계약 변경 작업](contracts/README.md#t006-계약-전환) T006으로 이 브랜치에 반영했으며 병합 전이다.

## 신규·기존 분기

1. 기존5분 LoginChallenge로 Google/Apple 서명·issuer/audience/expiry·nonce·subject를 검증한다. 외부 요청 중 SQL 잠금을 잡지 않는다.
2. 저장 직전 challenge의 기한·미소비와 현재 identity/account를 재검사한다. 기존 활성 계정이면 세션/설치 연결·challenge 소비를 같은 TX로 commit하고 authenticated 분기를 반환한다. 삭제/회수된 계정을 새 가입으로 되살리지 않는다.
3. 미가입이면 challenge 소비와 SignupProof 저장만 commit한다. Account/ExternalIdentity/AuthSession/Device 연결은 아직 생성하지 않는다. signup_required 응답으로07.02를 연다.
4. 이름 제출 성공 후에만 계정·identity·세션·기기를 원자 생성한다. 보안 저장까지 성공하면 정상 회원 상태가 된다. 이후 사진 저장과 초대/일정 진입을 이어간다.

provider+subject가 식별 기준이며 이메일·이름으로 계정을 병합하지 않는다. 가입 취소/인증 만료만으로 크루 가입을 실행하지 않는다.

## 가입 증명

- 구현 기본값: 무작위256bit 불투명 token, 발급부터15분, 일회용. LoginChallenge의5분 수명과 독립이며 nonce/challenge를 연장·재사용하지 않는다.
- 서버에는 tokenHash·provider/subject·검증한 nullable email·deviceId·발급/만료/소비 시각만 저장한다. provider token/code와 signup token 원문은 DB·receipt·로그에 보관하지 않는다. 미가입 식별 정보는 만료/소비 후 주기 정리하고 보안 receipt에는 hash/결과ID/상태만 남긴다.
- 허용 동작은 completeSignup 하나다. MobileBearer·AdminCookie·refresh·프로필·크루·기록·미디어·기기 등록에는 사용할 수 없다. endpoint를 익명으로 열어두는 것과 증명 검증을 생략하는 것은 다르다.
- 증명은 검증한 provider/subject와 설치UUID에 묶는다. 동시에 발급된 다른 challenge의 증명은 독립이나 최종 계정 생성은 unique(provider,subject)로 하나만 허용한다.
- 클라이언트는 메모리에만 저장한다. 뒤로 나가기/계정 변경/재시작 때 제거하며 만료 시 새 SNS 인증을 요구한다. 다른 제공자·계정·인증 시도로 입력 이름/사진을 자동 이전하지 않는다.

## 가입 완료·요청키·동시성

completeSignup은 name을trim해 공백만인 값을400 INVALID_INPUT으로 거절한다. 실명·이름 중복·임의 길이 제한은 추가하지 않는다. 사진은 이 명령의 입력이 아니다.

| 상황 | 저장·응답·복구 |
|---|---|
| 유효한 증명·이름 | 증명 소비, Account(displayName), ExternalIdentity, Session/Credential, 설치 연결과 요청 처리 결과를 같은 TX로 저장하고201 MobileSession 반환 |
| 필수 필드 누락·unknown JSON·이름 입력 오류 |400 INVALID_INPUT과 해당 경로 fieldErrors. 증명을 소비하지 않고 입력/선택 사진 유지. 입력을 고치면 새 요청키 |
| 필드는 있지만 증명 확인 불가/만료/이미 소비/설치 불일치 |401 UNAUTHENTICATED. 계정/세션 생성 없음. 새 SNS 인증으로 회복 |
| 처리 중 같은 키 |409 REQUEST_IN_PROGRESS. 중복 실행 없이 대기/현재 흐름 유지 |
| 유효한 증명에서 같은 키·다른 입력 | 확인 가능한 receipt hash 불일치는409 IDEMPOTENCY_MISMATCH. 미커밋 진행 중 입력은 아래 진입 잠금으로409 REQUEST_IN_PROGRESS. 기존 처리와 혼합하지 않음 |
| 다른 증명의 선행 가입·동일 identity 경합 | identity 잠금 후 기존 가입을 재검사해 신규 계정/세션을 만들지 않고 증명 소비·409 SIGNUP_ALREADY_COMPLETED 최소 receipt를 같은 TX로 확정. 최종 unique 충돌이 발생하면 전체 rollback 후 새 TX에서 잠금·증명 기한·기존 identity를 재검사해 같은 거절을 확정. 새 SNS 인증으로 기존 계정 로그인. 후발 이름으로 기존 profile을 덮어쓰지 않음 |
| SQL 실패·일시 장애 |503 TEMPORARY_FAILURE. 계정·증명 소비·세션·receipt 모두 rollback. 동일 입력/키 재시도 가능 |
| 성공 응답 유실·성공 후 소비된 증명 재요청 |401. 과거 token을 재반환하지 않음. 새 SNS 인증에서 이미 생성된 계정으로 로그인하고 재가입하지 않음 |

익명 receipt 주체는 proof ID/hash이며 operationId·정규화한 입력/deviceId를 묶는다. 완료한 token/body를 receipt에 저장하지 않는다. 이미 소비된 증명은 과거 receipt가 있어도401이며 세션 토큰을 재반환하지 않는다.

동일 증명·동일 키의 진행 중 요청은 아래 순서로 처리한다. 다른 TX의 미커밋 receipt는 조회되지 않으므로 receipt 조회만으로 중복 실행을 판정하지 않는다.

1. JSON/요청키와 증명의 hash·기한·미소비·설치를 잠금 없는 현재 조회로 검증한다. 이미 소비됐으면401이다.
2. 같은 TX에서 `(proof ID, completeSignup, Idempotency-Key)`의 요청 진입 advisory lock을 `pg_try_advisory_xact_lock`으로 대기 없이 획득한다. 실패하면 READ COMMITTED의 새 조회로 증명 상태를 재확인하고, 여전히 유효한 진행 중 요청이면 즉시409 REQUEST_IN_PROGRESS, 이미 소비/만료됐다면401로 응답한다. proof/identity 업무 잠금을 기다리기 전에 반환하며 잠금 실패로 receipt나 계정을 저장하지 않는다. 이 시점에 보이는 동일 키 receipt의 입력 hash가 다르면409 IDEMPOTENCY_MISMATCH다. 진행 중 hash가 미커밋으로 보이지 않으면 같은 키의 다른 입력도 REQUEST_IN_PROGRESS로 처리하고 기존 실행과 합치지 않는다.
3. 진입 잠금을 획득한 요청만 아래 identity→proof→Account 순서의 업무 잠금을 잡고 증명/identity/기한과 receipt를 다시 검증한다. 가입 효과·증명 소비·최소 receipt는 같은 TX로 commit하며 진입 잠금도 commit/rollback과 함께 해제된다.503 rollback 뒤에는 같은 입력/키로 다시 획득할 수 있다.

첫 요청을 commit 직전에 멈춘 동시 시험에서는 두 번째 같은 증명·키 요청이409를 받고 첫 요청만201로 끝나야 한다. account/session은 각각 하나이며 token 재반환은0건이다. commit 후 도착한 재요청은401이다. 별도 영속 in-flight receipt를 먼저 commit해503 rollback과 정리 의미를 바꾸지 않는다.

동일provider/subject 가입 경합은 identity key의 transaction advisory lock 또는 같은 효과의 잠금으로 직렬화한다. challenge/proof 발급·로그인·가입 완료에 동일 순서를 적용하고 account가 생긴 뒤는 Account(UUID 정렬)→Session→Credential→Device 순서를 따른다. proof 만료/미소비·기존 identity를 잠금 안에서 다시 검사하며 unique 제약이 최종 방어다. 실패 TX 재시도에서 원래 증명·기한·계정 상태를 재조회한다. hash 충돌은 불필요한 직렬화만 만들며 권한을 섞지 않는다. 외부 네트워크·파일 업로드는 TX 밖이다.

## 이름 성공 후 선택 사진 저장

사진은07.02에서 로컬 선택/미리보기만 한다. 가입 전에는 media API를 호출하지 않는다. 이름 가입·기기 보안 저장 성공 후 기존 createProfileImageDraft→011 upload/complete→ready 확인→editMyProfile 순으로 저장한다. profile PATCH에는 최신 version/요청키를 사용한다. bytes/자산 소유/접근 회수는011의 책임이다.

- 사진 미선택이면 즉시 기존 진입 규칙으로 이어간다. 사진 선택 취소·권한 거절은 이름을 지우지 않는다.
- 업로드·ready·PATCH 실패는 이미 성공한 이름 가입과 구분한다. 기존 오류 다이얼로그 안의 재시도/사진 없이 계속하기로 처리하고 별도 가입 실패/성공 전체 화면을 추가하지 않는다.
- 재시도는 현재 본인 session·같은 계정/인증 세대의 로컬 선택과 draft를 재사용한다. 서버 성공 응답 유실은 GET profile/mediaInfo로 현재 저장 결과를 확인한 뒤 필요한 단계만 재개한다. 이미 연결된 파일을 다시 생성·연결하지 않는다.
- 사진 없이 계속하기는 계정/이름/세션을 유지하고 업로드되지 않은 선택을 제거한다. 서버의 미연결 draft/asset 정리는011의 기존 만료/정리 정책을 따른다. 저장 성공 여부가 불명확하면 GET으로 결과를 확인하며 이미 저장된 사진을 임의 제거하지 않는다.
- 이름 commit 이후 뒤로 가기는 가입 폼 재진입·계정 재생성을 하지 않는다. 같은 다이얼로그/기존 세션으로 사진 처리 또는 계속하기만 수행한다.
- 앱 재시작·이름 완료 응답 유실·세션 보안 저장 실패에서는 로컬 증명/사진을 복원하지 않고 재인증한다. 기존 계정을 회복한 뒤 미저장 사진은 프로필에서 재선택한다. Keychain 잔존과 설치UUID 불일치도 세션 회복 검사에 포함한다.
- 만료/로그아웃/다른 계정 로그인은 이전 비동기 업로드·profile 응답을 세대로 차단한다. 다른 계정에 선택 사진을 자동 업로드하지 않는다.

## 초대와 화면 상태

인증 상태는 signedOut→authenticating→signupRequired→completingSignup→authenticated(선택 사진 처리)로 구분한다. signupRequired는 보호 query/화면을 열지 않는다. 증명 없이07.02 직접 진입하면07.01로 돌아간다. signedOut/authenticating/signupRequired에서는 하단 탭을 숨긴다.

같은 증명의 입력 오류/네트워크 실패는 이름·사진을 유지한다. 증명 만료 재인증은 PendingInvite를005 정책대로 보존하지만 이전 이름/사진은 자동 이전하지 않는다. 가입/사진 처리 종료 뒤 유지된 초대 확인을 우선하고, 없으면 기존 일정 진입 규칙을 따른다. 자동 크루 가입은 없다.

## 필수 검증과 책임

- T007/T009/T021/T030: 신규/기존 분기, 이름 전 보호 API 거절, 만료/소비/다른 설치, 공백, 동시 증명/가입, rollback·응답 유실·고아 계정0건.
- T015/T016/T017/T023/T031: 가입 상태와 보안 저장, 사진 없이 가입, 취소/이름 보존·증명 만료·초대 유지, 늦은 응답·다른 계정 차단.
- T014/T018/T032/T027: 실제011 bytes/ready/PATCH·GET 복구, 재시도/계속하기, 업로드 실패와 가입 성공 분리.
- T026/T027/T028: 승인07.02와 실제 키보드/접근성·제공자×OS·초대/크루·기기/삭제 경계 대조. 현재 미구현·미검증이며 기본 Figma 제작만 완료다.

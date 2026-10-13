# 004 저장·상태 설계

논리 필드/제약 원본은 [002 계정·인증](../002-shared-contracts/data-model.md#2-계정기기크루--c02c03), 기간/오류/재요청은 [계약 규칙](../../packages/contracts/conventions.md)이다. 아래는 물리 배치·변경 경계이며 원본 필드를 재정의하지 않는다.

현재 `002_identity.sql`이 `holdlog` schema의 아래 인증 저장소를 만든다. migration/제약/TX 검증과 제품 인증 API 구현은 구분한다. 자세한 실행 범위는 [공통 기반 검증](../../docs/history/development/004-identity-foundation-verification.md)을 따른다.

## 물리 저장 배치

| 테이블 | 논리 원본 | migration·검사 책임 |
|---|---|---|
| accounts / external_identities | Account / ExternalIdentity |004 SHARED. provider+subject unique, FK, positive version. 이메일은 unique/병합 키가 아님 |
| login_challenges | LoginChallenge |004 SHARED. nonceHash·expiry·소비 상태, 기존 세션 발급 또는 신규 가입 증명 발급 TX에서 단일 소비 |
| signup_proofs | SignupProof |004 SHARED. tokenHash unique·provider/subject·nullable email·deviceId·createdAt/expiresAt/consumedAt. Account FK 없음.15분/단일 소비, 만료/소비 후 정리. token 원문 없음 |
| auth_sessions / refresh_credentials / access_credentials | AuthSession / RefreshCredential / AccessCredential |004 SHARED. tokenHash unique·FK·family/expiry/회수 인덱스. current refresh FK 순환은 생성 후 nullable 참조 갱신 |
| service_administrators / admin_sessions | ServiceAdministrator / AdminSession |004 SHARED. loginId unique·active·positive version, session/CSRF hash·회수 인덱스 |
| device_installations | DeviceInstallation |004 SHARED가 전체 논리 필드에 호환되는 테이블 준비.017이 등록 API/푸시 암호화·권한을 구현. 최초 로그인은 설치 UUID·현재 accountId·lastSeenAt·version만 저장하고 알 수 없는 platform/pushPermission/appVersion 및 push token은 null.017 등록 전 발송/Device 응답 대상이 아님 |
| request_receipts | C01 IdempotencyReceipt |004 SHARED. 원본의 주체/operation/입력 hash·결과ID/상태·만료. token/body/과거 응답 저장 금지 |
| assets / asset_drafts 및 관계 | Asset / AssetDraft |011 소유.004에서 독립적인 복제 테이블을 만들지 않음.004 초기 accounts에는 profileImageId nullable UUID로 두고011 migration에서 FK·역참조·삭제 경계 완성. photo 쓰기는011 연결 전 제품에 활성화하지 않음 |

migration 파일 번호는 기존 runner 순서 확인 후 지정한다. 이미 적용한 SQL은 수정하지 않고 후속 SQL을 추가한다. 시작/실패/재실행·checksum·rollback 시험과 실제 DB 제약을 확인한다. 합성 DB에 고정 합성 사용자만 만들고 운영자료를 복사하지 않는다.

## 상태 전이와 동시성

- Challenge: 발급→기한 내 미소비→검증 및 기존 로그인/신규 가입 증명 발급 commit과 소비. 외부 검증/DB 실패는 세션 생성 성공이 아니다. 같은 challenge의 동시 성공은 한 번만 허용한다.
- SignupProof: 발급→가입 입력 대기→가입 완료 TX와 소비 또는 만료/폐기. 계정 생성 전 일반 권한 없음. 동시 가입/응답 유실은 [가입 처리 설계](signup-design.md)를 따른다.
- Refresh family: 활성→회전(이전 해시 보존)→idle/absolute 만료 또는 회수. 이전 credential 제출은 현재 family 전체 회수 후401. 현재 세션에서 발급된 access도 즉시 거절한다.
- Admin: create-only 초기 준비→활성 세션 발급→idle/absolute 만료/로그아웃/비밀번호 교체 회수. 교체는 비활성 계정을 활성화하지 않는다.
- Profile: version 잠금 검사→입력 검증→본인 소유 ready image 확인→값·receipt·필요한011 회수/정리 등록 commit. 실패는 기존 이름·사진·버전을 유지한다.
- Device: 설치 UUID는 권한이 아니며 로그인 주체가 현재 계정 관계를 만든다. 다른 계정의 새 연결을 이전 로그아웃이 회수할 수 없다.

[전역 잠금·원자 변경](../002-shared-contracts/data-model.md#9-함께-저장할-범위와-잠금-순서) 순서를 우선한다.completeSignup만 [가입 설계](signup-design.md#가입-완료요청키동시성)의 비대기 요청 진입 잠금으로 먼저 중복 실행을 판정한다. 그 뒤004 인증 업무 잠금은 identity key→challenge/proof→Account 순서를 모든 login/가입 경로에 통일하고 계정 행 이후는 Session→Credential→Device 순서, 관리자에서는 principal→session 순서를 통일한다. 외부 제공자 네트워크와 파일 bytes를 SQL TX 안에서 기다리지 않는다. profile/Asset 관계를 바꾸는 TX는004 service가 시작하고011 service가 같은 DB client를 사용한다.

## 클라이언트 상태

서버 DTO는 생성 계약에서 import한다. 모바일 SecureStore에는 token pair와 최소 세션 메타만 두고 profile/query/draft는 계정 ID·세대에 묶는다. PendingInvite는 [runtime](../../packages/contracts/runtime.schema.json) 정의를 소비하며005로 넘기는 시점까지 유지한다. 관리자 Provider는 principal·CSRF·expiry를 메모리에만 두고 cookie는 읽지 않는다. 인증 회수 시 query/CSRF·보호자료를 비운다. 입력 보존이 다른 계정으로 자료를 옮기게 해서는 안 된다.

새 로그인에서 기존 설치를 다른 계정에 연결할 때 이전 push token-account 연결은 같은 TX에서 회수하고 이전 암호문/해시를 새 계정용으로 승계하지 않는다. 플랫폼/권한을 LoginInput에 임의 추가하지 않는다. 인증된017 등록이 현재 계정과 설치·실제 token을 확인한 뒤 실제 값만 보완한다. 로그인은017 보호 API를 선행 호출하지 않는다.

SignupProof의 논리 모델은002 계정·인증 원본에 추가했다. T003의 SQL migration과 시험 DB 단독 검증은 [공통 기반 증거](../../docs/history/development/004-identity-foundation-verification.md)에 연결했다. #51 모바일 인증 API의 [서버 단독 구현/검사](../../docs/history/development/004-mobile-identity-api-verification.md)를 추가했고 실제 provider/기기 연동은 후속이다. 이름 가입 이후 photo commit은 별도이며 한 TX로 약속하지 않는다.

# 004 공통 인증 기반 검증 — #49

2026-10-13 · 범위는 [#49](https://github.com/C-H-OLD/Holdlog/issues/49)의 T001~T005다. [명세](../../../specs/004-identity-profile/spec.md)·[계획](../../../specs/004-identity-profile/plan.md)·[가입 설계](../../../specs/004-identity-profile/signup-design.md)를 기준으로 SQL/트랜잭션/설정·의존성을 준비했다. T006은 PR #60 / merge fdff16ea86e8ea2061da13b41f7c33b866d007ad로 병합 완료다.

## 변경과 책임

- `002_identity.sql`은 `holdlog` schema의 계정/외부 identity·challenge/proof·session/credential·설치·관리자·최소 receipt를 생성한다. 실제 사용자/관리자/제공자 자료를 seed하지 않는다.011 Asset 테이블/FK·업로드 구현은 가져오지 않았다.
- `withTransaction`은 같은 pg client의 READ COMMITTED·commit/rollback·반환을 보장한다. rollback/BEGIN 실패로 상태가 불명확하면 연결을 버리고 원래 실패를 유지한다.
- repository는 identity→challenge/proof→정렬된 account/session/refresh/device 잠금과 signup의 비대기 요청 진입 잠금을 제공한다. UUID 대소문자를 DB와 같은 의미로 정규화한다. 잠금 함수는 인증/권한 검사를 대신하지 않는다.
- receipt에는 원문/body 없이 주체·operation·키·입력 hash·결과ID/version/status만 저장한다. 미만료 중복은 덮어쓰지 않고,24시간 만료된 같은 키는 같은 TX 안에서 제거·재저장한다. 계정/receipt 실패는 함께 rollback한다. profile/가입/refresh의 실제 업무 처리는 후속이다.
- provider와 관리자 설정 로더를 분리했다. 고정 issuer/JWKS·exact audience·Apple P-256 key·32-byte CSRF key·HTTPS 관리자 Origin을 검사한다. foundation health/worker는 provider 비밀 없이 기존대로 실행하며 관리자 준비도 provider 설정을 기다리지 않는다. key 파일·CSRF 원문·경로·raw error는 공개 설정/로그에 출력하지 않는다.

## 설치·서버 호환성

고정 Node24.21.0·npm11.19.0에서 별도 worktree 설치와 `npm ci` 재현을 수행했다. 직접 의존성은 jose6.2.12·argon20.45.1·Expo SDK57의 bundledNativeModules 지정 SecureStore57.0.4로 고정했다. 버전과 integrity 원본은 workspace manifest·lockfile이다. lockfile 입력이 바뀌어 계약 생성 manifest도 도구로 다시 생성했다. HTTP/runtime 계약 자체의 변경은 없다.

서버 ESM JOSE의 합성 RS256 서명/검증·다른 audience 거절, 로컬 native Argon2id PHC hash/verify·잘못된 password 거절을 확인했다. 합성 JOSE 결과는 Google/Apple 실제 토큰 검증이 아니다. Argon2 호환성 표본은 memory65536KiB·time3·parallelism4이며 운영 부하 측정/SLA를 의미하지 않는다. PHC 파라미터의 출력 순서에 의존하지 않는다.

공식 근거: [JOSE](https://github.com/panva/jose) · [node-argon2](https://github.com/ranisalt/node-argon2) · [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/). 외부 제공자 SDK는 #50/T029의 검증 후보로 유지한다.

## 실행 결과

- 기본 `npm run check`: 계약17·tooling14·runner10·admin9·mobile6·server11, 총67개 테스트, 모든 workspace lint/typecheck·admin/API build. DB/실제 기기는 별도 실행이다.
- 실제 시험 `npm run test:foundation`: 25개·skip0. `test:identity`의8개 포함. migration의001→002 upgrade·재실행·기존자료 보존, 실패한 후속 DDL/history rollback, 이름/version/FK/provider unique·동일 email 별 identity·nullable 설치 stub을 확인했다.
- 현재 refresh의 타 session/family 참조 거절과 계정 삭제 시 credential cascade, 계정/receipt 원자 commit·rollback·미만료 중복 보존·만료 후 같은 키 재사용을 확인했다. TX 시작 뒤 만료된 receipt도 현재 SQL문 시각으로 조회 제외·재저장됨을 실제 DB red/green으로 확인했다.
- 두 client의 동일 identity advisory 대기 상태를 실제 pg_locks에서 관찰한 뒤 unique경쟁/패자 계정 rollback을 확인했다. signup 진입 잠금은 동시 중복 및 대소문자만 다른 UUID에서 false, rollback 뒤 재획득 true였다.401/409 HTTP 판단과 실제 가입 단일 생성은 #51/T021/T030에서 구현/검사한다.
- Apple 키·CSRF·HTTPS Origin의 누락/오류·RSA 키 거절·관리자 설정 독립 로딩과 고정 출력 분류를 검사했다. 기존 기반 설정 검사는 유지했다.
- `python3 scripts/check-docs.py`·`python3 scripts/check-contracts.py`·`git diff --check`와 `.p8`/비밀·생성물 Git 제외를 확인했다.

시험 DB는 이 작업 전용 PostgreSQL17.11 컨테이너·loopback55439·`holdlog_test`를 사용했다. 기존 개발/시험 DB나 볼륨을 변경/삭제하지 않았다. 명령 기록에는 시험 비밀번호·token/hash/개인 입력을 남기지 않는다.

## 모바일 빌드

- Expo prebuild·iOS/Android Hermes 번들 export 성공. SecureStore config plugin은 Android backup exclusion을 설정하고 생체 인증/FaceID 제품 요구를 추가하지 않았다.
- iOS CocoaPods ExpoSecureStore57.0.4 포함, generic iOS Simulator Debug `xcodebuild` 성공, 코드 서명 없음.
- Android arm64-v8a Debug `:app:assembleDebug` 성공. 첫 실행의 필수 공개 API origin 누락은 같은 개발 주소를 env로 전달해 해결했으며 설정 검증을 약화하지 않았다.
- Android backup/data-extraction XML은 SecureStore shared preferences를 cloud backup/device transfer에서 제외한다. 공개 Expo config에 서버 비밀 합성 표식이 없음을 확인했다.
- 네이티브 생성물·Pods·APK·시뮬레이터 app은 Git 제외다. 실제 기기 설치·SecureStore 읽기/쓰기/재설치·Keychain 잔존과 provider×OS 로그인은 #50/T029에서 검증한다.

## 리뷰와 남은 범위

독립 에이전트가 발견한 UUID 원문 hash의 대소문자 경합을 실제 DB red/green으로 수정했다. CodeRabbit이 지적한 문서 상태 불일치와 transaction-start 시각의 receipt 만료 비교를 수정했다. 최종 PR CodeRabbit 결과는 해당 PR에서 관리한다. #49 PR 병합 전에는 BE 공통 기반 의존 작업을 완료/ready로 바꾸지 않는다.

실제 Google/Apple 설정·서명/redirect·nonce/code 인증, 관리자 로그인/HTTPS cookie/CSRF 권한, 모바일 상태·가입 화면,011 bytes·005/017/021 연동은 미수행이다. 공통 기반 검사로 해당 역할 작업이나004 전체 완료를 표시하지 않는다.

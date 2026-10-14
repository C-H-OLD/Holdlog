# 004 모바일 인증 API 단독 검증 — #51

2026-10-13 · 범위는 [#51](https://github.com/C-H-OLD/Holdlog/issues/51)의 T007·T008·T009·T010·T013·T021·T030이다. 기준은 [004 명세](../../../specs/004-identity-profile/spec.md), [가입 설계](../../../specs/004-identity-profile/signup-design.md), [계약3.0.0/API v2](../../../packages/contracts/conventions.md)다. 공통 기반 #49/PR #61을 병합한 develop에서 시작했다. 이 기록은 서버 단독 결과이며004 전체·실제 제공자/기기 연동 완료가 아니다.

## 구현과 전달

- `IdentityModule`은 생성 계약의 입력 검사·header 해석·모바일 guard·안전한 오류 변환을 연결한다. challenge/login/signup/refresh/logout와 본인 profile GET/이름 PATCH를 제공한다. 본문·토큰·SQL 오류를 요청 로그에 남기지 않고 요청 ID·상태만 기록한다. 오류 경로는 JSON Pointer다.
- `ProviderVerifier`는 JOSE의 고정 JWKS·RS256·issuer/audience·필수 expiry/subject·nonce를 확인한다. Google raw nonce는 hash하고 Apple nonce는 저장된 hash와 직접 비교한다. 제공된 Apple code는 고정 endpoint에서5초 제한으로 교환하고 반환 token의 subject/audience/nonce를 재검증한다. 외부 네트워크는 SQL TX 밖이다. 이메일은 검증된 값만 projection에 포함하며 계정 병합 키로 쓰지 않는다.
- 신규 로그인은 challenge 소비·15분 SignupProof만 저장한다. 이름 가입 전 계정·세션·기기를 만들지 않는다. 가입 완료는 비대기 요청 진입 잠금 뒤 identity→proof→account/session/credential→device 순서로 저장하고 최소 receipt를 같은 TX에서 확정한다. 토큰 원문·과거 응답은 저장하지 않는다. 기기 잠금 대기 뒤에도 proof/challenge 만료를 다시 검사한다.
- access15분, refresh 유휴30일/절대90일을 적용한다. refresh 사용 후 원래 해시를 유지해 재사용을 감지하고 family 회수를 commit한 뒤401을 반환한다. 보호 요청은 현재 account/session/credential/device 잠금 뒤 상태를 다시 읽는다. 신규 세션은 credential 저장 뒤 설치를 연결하며017 등록 전 nullable stub을 유지한다.
- 이름 PATCH는 빈 입력·공백·unknown JSON·428/412·요청키 불일치를 거절하고 이름/version/receipt를 원자 저장한다. 사진 변경은 #55/011 연결 전 활성화하지 않으며 `photoFileId` 입력을400으로 거절한다.
- 로그아웃은 해당 family와 현재 설치의 account/push 연결만 회수한다. 다른 계정으로 재연결된 설치를 이전 요청이 해제하지 않는다. 계정/기록/크루 관계를 삭제하지 않는다.
- 별도 worker가 매분 최대500개 만료/소비 proof를 정리한다. 잠긴 행은 건너뛰고 유효 proof·24시간 최소 receipt는 보존한다. pg-boss의 독립 재시도로 가입 API와 정리 실패를 분리한다.

## 실행 환경과 명령

Node24.21.0·npm11.19.0·계약 manifest3.0.0을 사용했다. 별도 worktree에서 설치했고 npm cache는 임시 폴더로 분리했다. 서버가 직접 소비하는 contracts workspace 의존성을 추가해 lockfile과 생성 manifest를 도구로 갱신했다. 계약 형식·migration 변경은 없다.

전용 PostgreSQL17.11 컨테이너의 loopback55439·`holdlog_test`를 사용했다. 기존 개발/시험 DB나 볼륨을 변경하지 않았다. 시험 DB 비밀번호·합성 token/JWT·provider code·subject 원문은 기록하지 않는다.

```sh
npm ci
npm run contracts:generate
npm run check
# 로컬 TEST_DATABASE_URL을 비공개 환경으로 전달
npm run test:identity --workspace @holdlog/server
npm run test:foundation
python3 scripts/check-docs.py
python3 scripts/check-contracts.py
git diff --check
```

## 검사한 경계

- 합성 서명: 잘못된 signature/issuer/audience/exp/subject/nonce, 검증되지 않은 이메일, Google/Apple nonce 차이, Apple code 교환 후 다른 subject/nonce·400/503/timeout. 실제 로컬 HTTP JWKS에서 키 교체·token jku 무시·503/timeout을 확인한다.
- 실제 HTTP: 생성 입력과 분기, 신규 proof로 profile/refresh 거절, 공백/다른 설치/unknown 입력, 가입201·소비 후401·재인증 기존 계정, profile ETag·428/412/409·현재 projection, refresh 재사용 이후 access 거절, 로그아웃과 계정 보존.
- 실제 DB: challenge 단일 소비, 같은 증명/키의 commit 직전201/409와 token 재반환0건, 다른 입력409, 별증명 동일 identity의 계정1개·패자 proof/409 receipt commit, receipt 실패 전체 rollback·같은 키 재시도,23505 이후 새 TX 재검사, provider 분리, expiry·삭제 계정 거절.
- 실제 DB 잠금: identity 잠금 및 설치 잠금 대기 중 challenge/proof 만료, refresh 동시재사용과 회수 commit, 다른 계정의 기기 재연결과 profile 쓰기 직렬화, 이전 push 원문 승계 차단, refresh/logout/profile 실패 rollback·응답 유실 후 재인증/거절.
- 실제 worker: 만료/소비 정리·재실행·잠긴 proof 보존·유효 proof 보존·실제 최소 receipt 보존, 주기 등록과 처리, 실패 후 재시도와 안전한 job 오류.

## 최종 단독 결과

- `npm run check`:72개 테스트(계약17·tooling14·runner10·admin9·mobile6·server16), 모든 workspace lint/typecheck·web/API build 통과.
- `npm run test:identity --workspace @holdlog/server`:28개·실패0·skip0.
- 루트 `npm run test:foundation`:50개·실패0·skip0. 기존 health·migration·pg-boss 재시작 검사 포함.
- 문서/정적 계약 검사와 `git diff --check` 통과. JSON/계약 원본 변경 없이 직접 workspace 의존성과 lockfile hash의 생성 manifest만 갱신했다.
- 별도 정적 리뷰의 기기 재연결 경합·빈 PATCH·오류 경로·404·기기 대기 중 expiry 지적을 수정했다. 기기 경합·증명 만료·cleanup job 오류 유출은 실제 DB의 수정 전 실패/수정 후 통과로 확인했다. 최종 정적 재검토에서 남은 차단 문제는 없었다.
- CodeRabbit의 운영 worker 정리 미등록 지적을 확인해 운영 종료 분기를 제거하고 제품 cleanup은 모든 환경, 합성 queue는 development/test에만 등록하도록 분리했다. 운영 분기를 실제 시험 DB에서 실패 재현 후 검증했다. 후속 리뷰의 동시성 시험 정리 지적도 반영해, barrier를 해제한 뒤 진행 중 가입 promise를 rejection-safe하게 종료까지 기다린 후 fixture를 정리한다. 재시도 시험의 정리에서는 중지한 매분 cleanup 스케줄도 복원하고 worker/DB 연결을 finally로 반환한다. 단독 재시도 시험 뒤 실제 스케줄 복원을 확인했으며 서버 lint/typecheck와004 DB28개를 다시 통과했다. 최신 head의 후속 리뷰는 PR에서 별도로 확인하며 병합 완료와 구분한다.

## 남은 범위

실제 Google/Apple 계정·키·OS별 nonce/redirect·기기 보안 저장은 #50·#58, 관리자 인증은 #52·#57, 사진 bytes/자산 연결은 #55·#56/011,005·017·021 제품 연동은 #59의 후속이다. 계정 삭제 후 외부 identity의 영구 재가입 정책/삭제 상태 저장은021에서 연동하며 현재 검사는 삭제된 account의 기존 credential 거절 범위다. 사진 미연결 구현을 사진 저장 성공으로 표시하지 않는다. PR 병합·이슈 종료와 단독 검사 통과는 별도로 판단한다.

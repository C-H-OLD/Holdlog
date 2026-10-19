# 004 검증과 전달 안내

공통 기반과 #51 모바일 인증 API의 서버 단독 검사를 제공한다. `test:identity`는 기반과 모바일 HTTP·가입·이름 profile·회수/정리를 포함하며 [#51 증거](../../docs/history/development/004-mobile-identity-api-verification.md)를 따른다. `test:admin-auth`와 bootstrap의 [#52 단독 증거](../../docs/history/development/004-admin-api-verification.md)를 추가했다. #54 관리자 소비·도구의 [단독 증거](../../docs/history/development/004-admin-consumer-verification.md)를 추가했다. #57의 [실제 관리자 HTTPS 연동 증거](../../docs/history/development/004-admin-auth-verification.md)와 [재실행 안내](../../infra/development/admin-auth-verification/README.md)를 추가했다. 실제 provider/기기·사진 연동은 후속이다.

## 현재 수행할 검사

```sh
python3 scripts/check-docs.py
python3 scripts/check-contracts.py
git diff --check
# 공통 계약 원본/생성 도구를 변경한 구현 단계
npm ci
npm run contracts:check
npm run check
```

이 검사는 실제 provider 인증·제품 API·DB·cookie·기기 검사가 아니다. 기반 실행은 [개발 안내](../../docs/development.md)를 따른다.

## 구현 후 검사 매트릭스

| 검사 | 준비와 실행 | 기대 결과·증거 |
|---|---|---|
| 서버 단독 인증 | 시험 DB·합성 키/JWKS/provider exchange,004의 HTTP/DB test 명령 연결 | 신규 proof 발급·이름 가입·기존 로그인 분기·동일 email 별계정·잘못된 signature/issuer/audience/nonce/expiry·challenge 만료/동시소비. 이름 전 Account/Session0건·일반 API 거절, 이름 제출의 Account/Identity/Session/proof 소비 단일 commit·실패 rollback |
| 가입 실패/복구 | 유효/만료/소비 증명·공백/다른 설치·별증명 동시 가입·SQL/응답 유실 | 동일 증명/키 첫 요청 commit 직전 경합201/409·account/session 각각1개·token 재반환0건·완료 후401, 중복 계정0건, 입력오류 증명 미소비,503 rollback, 유실 뒤 재인증은 기존 계정. proof로 profile/crew/media/admin/refresh 거절 |
| 회전/회수 | 같은 refresh 동시 실행·이전 토큰 재사용·시계 제어·DB 실패/응답 유실 | family 회수 commit·기존 access 즉시 거절·원문/과거 응답 미보관·계약 idle/absolute 경계. 합성 시간으로 기간을 줄이지 않고 검사 |
| 관리자 bootstrap |001 절차의 숨김 입력, 시험 principal, 합성 비밀 표식 | create-only·동시생성·version 교체·비활성 유지·교체 시 기존 세션 회수·실패 rollback·원문/해시 미출력 |
| 관리자 브라우저 | 신뢰한 로컬 HTTPS·same-origin proxy·시험 계정·개발 전용 검사 도구 | Set-Cookie 속성/path·JSON 비노출·session CSRF 재조회·Origin/CSRF 누락/불일치·mobile/admin 교차거절·idle/absolute/로그아웃/교체 회수. 브라우저 실제 cookie 동작과 HTTP 합성 시험 구분 |
| 모바일 단독 | 주입한 transport/provider/store·계약 fixtures | 동시 refresh1회·저장실패·로그아웃 후 늦은 성공·다른 계정 캐시/입력 차단·취소/통신실패 보존. 단독 mock 결과이며 실제 provider 완료 아님 |
| 실제 로그인 | Google/Apple 개발자 설정·audience·서명·redirect·iOS/Android 개발 빌드·필요 실기기 | 제공자/OS별 nonce·2회 로그인·취소·동일 계정 재사용·다른 제공자 분리. Android Apple 미준비를 iOS 결과로 덮지 않음 |
| 이동/프로필/로그아웃 |003 화면·005 크루/초대·011사진·017기기·021 진입 대상 준비 | T01/T67/T75·FR-003~006 검증표.005/011/017/021 모의 응답 검사는 소비 증거로만 기록하고 실제 연동과 분리 |
| 사진 | 이름 가입·보안저장 성공 뒤 본인 image draft→011 upload/complete/ready→Profile PATCH | 본인/타인·미완료/다른용도 파일 거절·412/428·이름/사진 실패 보존·교체/제거 접근회수·정리 등록. 가입 성공 뒤 실패 재시도/사진 없이 계속하기·GET 결과 복구·다른 계정 차단, 실제 bytes/권한까지 검사 |
| 실패·원자성 | nonce 검증/SQL/receipt·저장·네트워크 실패 주입 | 성공 오인·중복 생성·금지 조회/변경0건, 이름/사진/version/기존 가입/기록 보존. 입력·token·password·DB URL이 로그/번들/검증기록에 없음 |

## 기록과 종료

검증자는 동일 커밋/manifest·환경·명령·합성 자료 범주·정상/거절/동시성 결과·미수행 원인을 [개발 기록](../../docs/history/development/)에 남기고 관련 역할 이슈와 최종 검증 이슈에서 연결한다. token/password/hash·실제 계정/초대/파일을 기록하지 않는다. 역할 단독 통과는004 전체 완료가 아니다. 최종 검증은 [spec 검증표](spec.md#요구사항별-검증-연결)의 FR-001~006·SC-001~004와 시안을 대조한다.

## 계약 전환 선행 확인

병합한 T006 계약 전환의 manifest3.0.0·OpenAPI v2·admin proxy/cookie path·07.02 Route와 분기/완료 생성 validator를 확인하고 같은 소스를 사용하는 FE/BE 소비 검사를 한다. completeSignup을 포함한 모바일 API는 개발 안내의 명시적 설정으로 활성화하며 실제 provider 설정/연동과 합성 단독 검사를 구분한다.

현재 준비 단계의 수행 범위와 미수행 검사는 [가입 설계·계약 전환 검증](../../docs/history/development/004-signup-preparation.md)을 따른다.

## 공통 기반 검사 — #49

```sh
npm run check
# TEST_DATABASE_URL은 개발 안내의 로컬 holdlog_test DB에만 지정. 비밀번호를 공유 명령/로그에 복사하지 않는다.
npm run test:identity --workspace @holdlog/server
npm run test:foundation
```

`test:identity`는 기반 검사에 #51 모바일 HTTP/DB 검사를 포함한다. 실제 provider·cookie/기기·사진 동작 완료는 아니다. 새 migration은 기존 파일을 수정하지 않고 추가한다. [구현/호환성 증거](../../docs/history/development/004-identity-foundation-verification.md)를 확인한다.

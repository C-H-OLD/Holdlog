# 004 모바일 인증·가입 소비 단독 검증

2026-10-19 · 작업 [#53](https://github.com/C-H-OLD/Holdlog/issues/53) · 원본 [계획](../../../specs/004-identity-profile/plan.md) · [가입 설계](../../../specs/004-identity-profile/signup-design.md).

## 구현 범위

- T015: API v2의 challenge/login/signup/refresh/logout/getMyProfile/editMyProfile 전송. 생성 DTO·입력/응답/오류 검사, 요청키·If-Match·ETag, 취소·본문 읽기까지의 기한, 비밀을 보관하지 않는 오류를 검사한다. 자동 쓰기 재시도는 없다.

- T016 순수 부분: provider·저장소·시계·요청키·계정 캐시 정리를 주입하는 인증 저장소와 React Context. 단일 refresh, 인증 세대, 저장 성공 전 보호 접근 거절, 로그아웃·늦은 응답·계정 교체를 검사한다. SecureStore 어댑터는 제공하지만 실제 활성화·기기 동작은 T029 미완료다.
- T031 순수 부분: 증명·이름·선택 사진은 메모리에만 보관하고 공개 snapshot에 증명/토큰/사진 URI를 넣지 않는다. 공백 입력·증명 만료·같은 입력 재시도키·503/409 진행 중과 응답 유실/401/저장 실패를 구분한다. 이름과 세션 저장 뒤에만 인증 상태를 열고 선택 사진은 같은 계정·세대로 한 번만 넘긴다.
- T017 일부: 이름 편집 명령과 React 훅만 준비했다. 충돌 시 입력/요청키 유지, 명시적 새 version 채택, 늦은 결과 거절과 profile version 역행 방지를 검사한다. 화면은 구현하지 않았다.
- T023 일부: 합성 전송·provider·저장소의 정상·거절·실패/동시성 검사다. 실제005/011/네이티브 시나리오 완료를 뜻하지 않는다.

## 저장과 순서 경계

전송 origin은 HTTPS를 사용한다. HTTP는 기존 개발 호스트 검사와 같은 literal loopback/사설 IPv4 범위에만 허용하며 공개 HTTP 호스트·임의 우회 옵션은 거절한다. 복원 중 access가 만료돼 refresh가 필요해도 확정503에서는 기존 pair/저장 기록을 유지하고 장애를 호출자에게 전달한다. network·malformed/불확실 결과는 이 예외에 포함하지 않는다.

보안 저장은 하나의 versioned JSON record이며 현재 설치 식별자와 token pair·세대를 검증한다. 입력 스냅샷을 쓰고 쓰기/삭제를 직렬화해 늦은 쓰기가 로그아웃 삭제 뒤에 살아나지 못하게 한다. iOS는 `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, Android는 기존 SecureStore 백업 제외 설정을 소비한다. 설치 식별자는 T029에서 검증한 **백업되지 않는 설치 marker**로 제공해야 한다. Keychain 자체에 marker를 같이 넣어 재설치를 판정하지 않는다.

refresh 전 같은 commit 순서로 `refreshPending`을 저장한다. 응답 유실·불명확한 응답에서는 기존 refresh token을 재전송하지 않고 새 SNS 인증으로 회복한다. 프로필 저장도 이 표식을 유지하며 재시작은 미확정 회전 기록을 복원하지 않는다. 확정503은 기존 pair를 재사용할 수 있지만, malformed503은 확정 rollback으로 취급하지 않는다. 유효한 access token은 일시 장애 중 계속 사용할 수 있다.

login/signup/늦은 성공 폐기/logout의 서버 효과를 순서화한다. 이전 작업의 revocation이 같은 설치의 새 로그인 뒤에 도착하는 정상 완료 경합을 막는다. 서버가 응답 기한 뒤에도 처리 중인 경우와 실제 제공자·서버 연결은 이 합성 검사에서 증명하지 않는다. 로컬 정리가 실패해도 원격 로그아웃을 시도하며, 서버 실패를 성공으로 숨기지 않는다.

성공한 refresh도 같은 서버 효과 큐에서 저장 또는 폐기까지 소유한다. 회전 응답을 받은 뒤 저장이 실패하거나 다른 인증 세대가 시작되면 반환된 credential로 원격 폐기를 시도한 뒤 후속 로그인을 진행한다. 명시적 logout이 진행 중 회전 결과의 정리를 맡았으면 refresh가 중복 폐기하지 않는다. 이는 재시도 불가능한 응답 유실과 구분하며, 서버가 폐기 요청에도 응답하지 않는 경우의 회수 성공을 보장하지 않는다.

Context는 전달/구독만 담당한다. 설치 단위 composition root가 저장소를 한 번 생성하고 `restore()` 및 종료 시 `dispose()`를 호출해야 한다. React render/StrictMode remount가 로그인이나 기기 저장 삭제를 자동 실행하지 않는다. 현재 App에는 연결하지 않았다.

## 수행 검사

- Node24.21.0/npm11.19.0: `npm run check` 통과. 계약 생성 일치·예제·전체 workspace lint/typecheck/unit·관리자/서버 build를 포함한다.
- 모바일 `node --test test/*.test.ts`: 기존 기반6개와 새 인증/가입/프로필/저장/전송 검사를 수행했다. 검토에서 발견한 refresh/profile 저장 순서·응답 유실·버전 역행·로그아웃 정리 실패·늦은 signup의 회귀 검사를 포함한다.
- CodeRabbit 첫 리뷰2건을 재현 후 반영했다. 공개 HTTP origin 거절과 cold restore의 확정503 보존·network/malformed503 무효화 검사를 추가했다. 모바일40개 검사다.
- 병합 전 CodeRabbit 보안 요약의 성공 회전/저장 실패 정리 우려도 재현 후 보완했다. 회전 credential 폐기, 다음 설치 로그인보다 먼저 폐기되는 순서, 진행 중 폐기의 logout 공유·실패 전달을 검사해 모바일44개를 검사한다. 실제 SDK/기기와 화면의 남은 조건은 그대로 유지한다.
- 전송 API를 실제 Expo Metro로 iOS/Android 번들링하고 Node 전용 모듈·동적 코드 생성 없이 합성 fetch 응답을 소비했다. Metro 번들 검사는 실제 Hermes·기기 실행과 구분한다.
- 공통 계약의 원본·의미 버전3.0.0/API v2는 변경하지 않았다. 인증7 operation용 좁은 생성 validator/metadata 진입점과 모바일 직접 의존만 추가했다. 관리자용 생성물은 변경하지 않았다.

## 남은 선행과 미수행

- #50/T029: 실제 Google·Apple SDK, OS별 nonce 전달·취소, 서명/외부 설정, 백업/재설치·잠금·보안 저장 기기 검사. 실제 SDK adapter와 설치 marker 생성은 이번 범위에 없다.
- 003/T017: Router·공용 화면 부품, 승인07.01/07.02/05.01/05.02 화면, 키보드/접근성·탭 진입 제한의 실제 화면 검사. 이름 편집 훅은 준비했지만 라우트는 없다.
- 005/021: PendingInvite 유지·취소·로그인 후 확인/크루 결과와 계정 삭제 진입의 실제 소비. 인증 저장소는 초대를 소유하거나 자동 가입시키지 않는다. 합성 값 보존을005 연동 증거로 쓰지 않는다.
- 011/T018/T032/#56: 실제 사진 선택 기기 기능·업로드/ready/PATCH·실패 다이얼로그 재시도/사진 없이 계속하기. 이번 로컬 사진 handoff는 bytes 처리나 서버 업로드가 아니다.
- #58: 모바일 실제 서버·제공자·OS 연동 검증. 실제 서버/DB·네이티브·Figma 대조는 이번 소비 단독 검사에서 미수행이다. #53과 상위 #45는 전체 완료로 닫지 않는다.

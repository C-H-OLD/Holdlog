# 004 계약 소비와 전달

새 HTTP/runtime 원본을 만들지 않는다. [OpenAPI](../../../packages/contracts/openapi.json), [runtime](../../../packages/contracts/runtime.schema.json), [처리 의미](../../../packages/contracts/conventions.md), [공개 진입점](../../../packages/contracts/README.md#생성과-사용)이 원본이다. 이 브랜치의 계약은3.0.0이며 정확한 생성 입력·도구·출력은 [manifest](../../../packages/contracts/generated/manifest.json)를 따른다.

| 책임 | operationId / 자료 | 구현·전달 |
|---|---|---|
|004 모바일 인증 | createLoginChallenge · login · completeSignup · refreshSession · logout | server identity + mobile auth. LoginInput/분기 LoginResult/CompleteSignupInput/MobileSession의 생성 타입·검사 사용. 아래 T006 병합 후 소비 |
|004 프로필 | getMyProfile · editMyProfile · createProfileImageDraft | 본인 profile/version·초안 입력. 사진 bytes는011 미디어 계약 소비 |
|004 관리자 | adminLogin · adminSession · adminLogout | 별도 cookie/CSRF·Origin. Web API/Provider + 개발 브라우저 검사. 신규 로그인 화면 추가 없음 |
|005 로그인 후 이동 | myCrews · getSelectedCrew · resolveInvite · Route/PendingInvite |004는 소비·전달만,005가 실제 가입/조회 구현. 초대 우선·크루0개·다중 상태 검증 |
|011 프로필 파일 | startMedia · uploadHead/Patch · completeMedia · mediaInfo · readThumbnail/readContent 등 C08 |004의 draft/profile과 연결해 실제 bytes/권한/실패 확인.011의 전체 미디어 구현을004에서 복제하지 않음 |
|017 설치·푸시 | registerDevice · unregisterDevice |004는 로그인/로그아웃의 설치 관계 변경·회수 경계.017이 등록·발송 구현 |
|021 삭제 | previewAccountDeletion · deleteAccount 및 Route |004 화면 진입/대상 연결,021 실제 삭제·이관 검사. 미구현 API를 성공 mock으로 출시하지 않음 |

C01의 입력·오류·ETag/If-Match·Idempotency-Key를 operation별로 대조한다. 로그인/refresh는 일반 업무 receipt 재반환으로 token을 복원하지 않는다. API의 default Error 응답은 HTTP 상태 전부가200이라는 의미가 아니며 conventions의 상태/코드로 검사한다.

공통 예제는 기존 fixtures를 소비하고 부족한 정상/거절/회전/nonce/관리자 사례를 SHARED가 `packages/contracts/examples.json`에 모아 생성/세 앱 타입·값 검사를 함께 수행한다. 합성 토큰만 사용하고 서명 토큰·쿠키 원문을 Git에 저장하지 않는다. 서버 입력의 unknown 필드 거절, 응답 validator·현재 권한 검사는 각각 필요하다.

공통 계약 형식/의미 변경이 필요하면 영향 FR·소비자·버전을 먼저 확인한다. nonce 불지원 SDK를 쓰기 위해 필드를 삭제하거나 제공자 email로 계정을 합치는 변경은 이 설계에 포함하지 않는다.

## T006 계약 전환

이 절은 SHARED 변경 범위와 수락 기준이다. 실제 형식 원본은 위 OpenAPI/runtime이다. PR #60으로 원본·생성·기반 소비를 병합했고 T006/#48을 완료했다. 후속은 같은 manifest를 소비한다.

| 변경 | 반영할 형태·책임 |
|---|---|
| 버전·경로 | OpenAPI info.version3.0.0·servers `/api/v2`. runtime과 함께 생성된 manifest의 contractVersion도3.0.0으로 일치. HTTP breaking은 API major와 같이 바꾸는 기존 규칙 유지. PushPayload.schemaVersion=1은 별도 형식이므로 유지 |
| LoginInput | provider/idToken/challengeId/deviceId/nullable authorizationCode 유지. 초기 이름·사진을 로그인 입력에 추가하지 않음 |
| LoginResult | 닫힌 oneOf: `{kind:authenticated, session:MobileSession}` 또는 `{kind:signup_required, signup:SignupProof}`. 두 가지 내용 혼합·알 수 없는 필드 거절. 각 kind는const를 사용하고 생성기가 지원하지 않는 discriminator keyword는 추가하지 않음 |
| SignupProof | signupToken(고엔트로피 불투명 문자열), expiresAt(UTC). 세션/계정ID/refresh 권한 없음 |
| completeSignup | `POST /auth/signups`, 익명 endpoint이나 가입 증명 검증 필수, C02·S01, UUID Idempotency-Key 필수. CompleteSignupInput은 signupToken/name/deviceId 세 필드만. deviceId는 증명의 설치UUID와 일치. 사진 참조는 받지 않음. 성공201 MobileSession, 실패 Error |
| 오류 |400 INVALID_INPUT(필드 누락/unknown/이름 오류, 해당 경로 fieldErrors),401 UNAUTHENTICATED(제출 증명 확인 불가/만료/소비/설치 불일치),409 SIGNUP_ALREADY_COMPLETED(다른 증명의 선행 가입),409 REQUEST_IN_PROGRESS/IDEMPOTENCY_MISMATCH,503 TEMPORARY_FAILURE. 업무 실패 receipt·proof 소비 순서는 [가입 설계](../signup-design.md) 기준 |
| 사진 | 기존 createProfileImageDraft→011 upload/ready→editMyProfile 유지. 이름 가입 성공 이후 MobileBearer로만 사용. 신규 proof-owned media 또는 signup photoFileId는 도입하지 않음 |
| Route | 승인07.02 추가. 가입 증명·token·로컬 파일 경로를 Route/URL/로그에 넣지 않음. 인증 gate가 메모리 상태로07.02 접근을 허용하고 proof 없이 직접 진입하면07.01로 복귀 |
| 기반 소비 | apps/admin/src/api/contracts.ts API_BASE_PATH, vite.config.ts proxy 및 runtime/contracts tests를v2로 함께 수정. admin cookie path=/api/v2/admin. internal health path는 유지. apps/mobile/server의 실제 연결부는 grep으로 확인해 남은v1 제품 경로를 제거 |
| 생성·예제 | openapi/runtime/conventions/examples와002 논리 모델,003 탐색 전달을 갱신. 생성물은 generate 명령으로 재생성하고 manifest/타입/validator/FE·BE fixture 소비를 검사 |

정상 예제는 기존 사용자 분기·신규 가입 증명·이름 가입 완료·사진 미선택을 포함한다. 거절 형식은 분기 혼합·이름/키 누락·unknown JSON을 포함한다. 공백 이름·만료·재사용·타인 증명·동시 가입·503 rollback은 형식 검사만으로 증명할 수 없으므로 T007/T021/T030/T031의 서버·클라이언트 실행 검사에 배정한다.

공통 변경은 `004/shared-contract-transition` 한 묶음이 소유한다. 전환 PR #60 병합으로 FE fixture 소비는 착수 가능하며 BE SQL/설정과 외부 provider 키 준비의 선행은 구분한다. 이전 계약의 실제 배포 소비자가 발견되면 단순 삭제를 하지 않고 별도 호환 계획을 확정한다.

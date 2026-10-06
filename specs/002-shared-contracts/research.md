# 공통 계약 설계 판단

작성일: 2026-10-06 · 상태: 로컬 원본 대조·공식 규약 조사·설계 선택. 실제 서비스 검증 전.

제품 규칙의 원본은 [계약 범위의 원본 표](contract-scope.md#원본과-책임)다. 아래는 그 규칙을 프론트·백엔드가 같은 방식으로 구현하기 위한 선택이다. 필드·기간·코드의 실제 원본은 [공통 계약](../../packages/contracts/conventions.md)에 두며 여기에는 선택 이유만 남긴다.

| 결정 | 이유 | 검토한 다른 방법 |
|---|---|---|
| HTTP는 OpenAPI3.1 JSON, 기기·작업·저장소는 JSON Schema2020-12 | 형식을 기계로 읽고 DTO·mock·검사에 같은 원본을 쓸 수 있음 | 기능별 수기 TypeScript/문서 필드 사본은 어긋나기 쉬움 |
| `/api/v1`, UUID, UTC 시점+IANA 시간대, 날짜 전용 형식 분리 | 시간대 조회·공동 날짜 일치·세팅 날짜 정밀도를 따로 표현 | 로컬 날짜 문자열을 전체 시간 원본으로 쓰면 경계가 섞임 |
| version/ETag와 If-Match, 업무 충돌은 별도409 | 동시 편집에서 새 내용을 조용히 덮어쓰지 않음 | 무조건 마지막 요청 승리는 원본의 충돌 안내를 만족하지 않음. [HTTP 조건부 요청](https://www.rfc-editor.org/rfc/rfc9110.html) |
| 서버 저장 불투명 모바일 토큰, 회전 refresh family, 별도 admin 쿠키 | 계정 삭제·로그아웃 권한을 즉시 회수하며 mobile/admin 책임을 분리 | JWT 만료만 기다리는 회수는 요구사항에 부족. [토큰 회전 근거](https://www.rfc-editor.org/rfc/rfc9700.html) |
| 관리자 초기 loginId/password principal, 공개 가입 없음 | 기존 서비스 관리자 범위를 준비하며 크루 역할과 독립시킴 | 회원 이메일/크루관리자 역할만으로 운영권한 부여 금지. [Argon2id](https://www.rfc-editor.org/rfc/rfc9106.html) |
| Google/Apple subject 기반 계정·nonce challenge | 원본의 제공자별 계정 분리를 유지하고 서버에서 토큰 검사 | 같은 이메일 자동 병합은 제품 범위 밖. [Google](https://developers.google.com/identity/openid-connect/openid-connect) · [Apple](https://developer.apple.com/documentation/signinwithapple/authenticating-users-with-sign-in-with-apple) |
| 멱등 receipt에는 hash/resultId만, 운동 종료는 영구 clientWorkoutId receipt | 재요청 중복 방지와 개인 과거 값 미보관을 동시에 만족 | 요청/응답 JSON 장기 저장은 개인 과거 내용을 남김 |
| 본인/회원 projection 분리, 대상 crewId 명시 | 타 크루 공동 정보·비공개 후기/파일 유출을 막음 | 본인 DTO를 클라이언트에서 가리는 방식은 서버 공개 규칙을 만족하지 않음 |
| 목록 cursor/revision, 달력은 월 전체 응답 | 목록 응답 크기는 조절하되 날짜시트는 이미 받은 자료 사용 | 월 자료를 조용히 자르면 날짜 총건수·도장·시트가 불일치 |
| tus offset 기반 재개, 서비스 JSON creation과 명시 complete | 네트워크 응답 유실 후 재개 시 같은 bytes를 중복 추가하지 않음 | 독자 Content-Range 업로드를 다운로드 Range와 혼용하지 않음. [tus 규약](https://tus.io/protocols/resumable-upload) |
| 요청별 보호된 파일 전달, 별도 활성 공지 이미지 익명 GET | 개인 미디어 즉시회수와 로그인 전 앱 공지 요구를 함께 만족 | 개인 파일을 만료 URL만으로 공개하면 즉시회수 불가 |
| 같은 TX 공동 변경·이력·outbox, commit 후 pg-boss 전달 | 작업 유실·외부 부작용 재시도를 분리하고 개인본문 없이 ID로 처리 | API 트랜잭션 중 FFmpeg/외부 푸시 실행은 느리고 실패 경계가 불명확. [pg-boss](https://github.com/timgit/pg-boss/blob/master/docs/api/jobs.md) |
| 진행 운동은 기기 draft, 종료만 서버 개인 기록 생성 | 사용자 강제종료 취소 정책을 유지하고 시작 UI를 독립시킴 | 서버 시간 경과 자동저장/크루 자동연결은 새 제품 동작 |

운동 시작 A/B는 명시적으로 이번 설계에서 선택하지 않는다. 표시줄은 기록 탭만·겹침 허용이라는 사용자 확정 조건을 사용한다. 공지 개선 시안은 승인으로 반영했다. OS 강제 종료 구분·실제 지도/로그인/푸시·FFmpeg 품질은 조사만으로 완료할 수 없으므로 [검증 안내](quickstart.md)에 실행 전제와 실패 경계를 남긴다.

라이브러리 설치 버전·OS 최소 지원 버전·서버 자원·도메인 값은001 개발환경에서 준비할 항목이며 계약 필드의 미정값이 아니다. 이번 작업에서 설치·서버 배포를 진행하지 않는다. 데이터·API 계약에 필요한 표현 선택은 완료했고, 기능별 실제 실행 증거는 후속 개발에서 확인한다.

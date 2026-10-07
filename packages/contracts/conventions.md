# 공통 계약 사용 규칙

버전: 1.0.0 · 작성일: 2026-10-06 · 상태: 설계 작성·정적 검토, 서비스 구현·실행 전.

HTTP 입력·응답·열거값의 원본은 [openapi.json](openapi.json), 기기·사건·저장소 인터페이스의 원본은 [runtime.schema.json](runtime.schema.json)이다. 이 문서는 두 형식의 처리 의미를 정한다. 제품 권한표·계산식·화면 동작은 [기능 명세](../../docs/functional-spec.md), [기록 관계](../../docs/record-relationships.md), [운동](../../docs/workout-recording-spec.md), [관리자](../../docs/admin-spec.md)의 원본을 따른다. 논리 저장 모델은 [data-model.md](../../specs/002-shared-contracts/data-model.md)다.

## 요청·값·버전 — C01

- 기준 경로는 `/api/v1`. JSON은 UTF-8, 필드명 camelCase. ID는 UUID, 시점은 UTC RFC3339 `Z`, 시간대는 IANA 식별자, 날짜는 `YYYY-MM-DD`. 시점은 서버가 파싱하고 유효한 IANA 시간대인지 검증한다. `format` 표기만으로 검증이 완료되지 않는다.
- 응답의 선택값 없음은 null, 빈 모음은 []다. PATCH의 누락은 유지, null은 선택값 제거. 빈 PATCH는400이다. PUT은 전체 입력이며 소유자/역할/서버 시각/version은 입력으로 받지 않는다. 배열을 주면 해당 집합을 교체한다. 알 수 없는 JSON 필드는400이다.
- climbs=null은 운동 수치 전체 미입력, []는 입력 난이도 없음, `{brandId,gradeKey,count:0}`은 명시 입력0. 각 gradeKey 미입력은 행 없음이다. count는 0 이상 정수; (brandId,gradeKey) 중복은400. 브랜드가 다른 기존 수치를 암장 변경만으로 재매핑하거나 제거하지 않는다. 변경하지 않은 기존 난이도는 retired여도 보존하며 신규 입력은 현재 브랜드 정의로 검증한다. 표시·집계는 원본 D05를 따른다.
- 성공한 단일 변경 가능 자료는 version과 `ETag: "<version>"`를 준다. detail wrapper는 그 안의 주 대상 version을 ETag로 쓴다. 수정/삭제/연결/이관은 OpenAPI에 지정한 `If-Match`를 반드시 보낸다. 없는 경우428, 다른 경우412. 여러 자원을 함께 바꾸는 link-existing의 recordVersion도 저장 직전 검사한다. 부가 자원 버전이 다르면409 LINK_CONFLICT. 업무 제약은409이며 버전 오류와 구분한다.
- 같은 요청 식별자는 UUID `Idempotency-Key`. 인증 주체+operationId+정규화한 입력(path/query/body/If-Match)의 SHA-256을 사용한다. 성공/업무 거절 receipt를24시간 보존한다. 실패 재시도 때 같은 입력이면 같은 키, 입력/버전이 바뀌면 새 키를 쓴다. 완료 전 같은 키는409 REQUEST_IN_PROGRESS, 다른 입력의 같은 키는409 IDEMPOTENCY_MISMATCH. transient500/503은 성공 receipt로 확정하지 않는다.
- receipt에는 개인 입력·후기·수치·파일·과거 응답을 보관하지 않고 해시·결과ID·상태만 둔다. 재요청도 현재 인증·권한 검사 후 현재 자료를 다시 구성한다. 따라서 과거 응답과 byte 단위 동일함을 보장하지 않는다. 결과가 삭제됐다면404이며 재생성하지 않는다. 인증이 해제됐으면401이다. 로그인/refresh는 익명 challenge 또는 검증된 refresh family를 주체로 처리하며 토큰 원문을 receipt에 보관하지 않는다. 이미 소비한 challenge/refresh 재요청은401; 새 로그인/갱신 절차로 회복한다.
- 같은 일정 방문 동시 생성은 후발 요청에 저장된 현재 방문을200으로 반환하며 입력을 합치거나 덮어쓰지 않는다(신규 저장은201). clientWorkoutId 종료는 영구 업무 receipt로 중복 방지하며 일반 키가 만료돼도 같은 개인 기록을 반환한다. 그 기록을 삭제한 경우410 WORKOUT_RESULT_DELETED이며 재생성하지 않는다.
- DELETE는 JSON DeleteResult 또는 EmptyResult(200). 파일 바이트 정리는 비동기여도 접근 회수와 작업 등록은 성공 시 이미 commit돼야 한다. 개인 삭제를 undone 상태로 노출하지 않는다.
- 공통 응답 `X-Request-Id`는 로그 연결용 UUID. 개인 body/응답·로그인토큰·초대코드·upload bytes를 로그에 남기지 않는다.

## 오류·입력 보존

Error 필드 정의는 OpenAPI 원본이다. code는 프론트의 기존 다이얼로그 분류에 매핑하며 서버의 임의 메시지를 화면 문구로 사용하지 않는다. fieldErrors.path는 JSON Pointer, query 오류는 `/query/<name>`이다. 오류가 빈 결과를 뜻하지 않는다. 인증·권한 확인 전 대상 존재·currentVersion을 노출하지 않는다.

| HTTP | 코드 |
|---|---|
| 400 | INVALID_INPUT·TIME_REQUIRED·UNSUPPORTED_MEDIA |
| 401 | UNAUTHENTICATED·ACCOUNT_DELETED |
| 403 | FORBIDDEN·JOIN_BLOCKED |
| 404 | NOT_FOUND·INVITE_INVALID(유효하지 않은 초대) |
| 409 | IDEMPOTENCY_MISMATCH·REQUEST_IN_PROGRESS·ALREADY_MEMBER·LINK_CONFLICT·LINKED_VISIT_LOCKED·DATE_GYM_MISMATCH·NOT_ATTENDEE·ACTIVE_RECORD_ELSEWHERE·ADMIN_TRANSFER_INVALID·ADMIN_TRANSFER_REQUIRED·ACTUAL_VISIT_IN_FUTURE·UPLOAD_OFFSET_CONFLICT·MEDIA_NOT_READY |
| 410 | REUPLOAD_REQUIRED·WORKOUT_RESULT_DELETED |
| 412 / 428 | VERSION_CONFLICT / PRECONDITION_REQUIRED |
| 416 / 460 | RANGE_NOT_SATISFIABLE / CHECKSUM_MISMATCH(tus 구간검사) |
| 500 / 503 | TEMPORARY_FAILURE |

충돌 시 현재 허용 version/resourceId만 제공하고 최신 자료는 해당 GET으로 다시 받는다. 프론트는 내 입력을 유지해 비교한다. lifecycle의 blockingCrewIds는 관리자 이관이 필요한 본인 가입 크루만 제공한다. 숨길 대상에404를 쓸 수 있으나 상세 오류로 비공개 존재를 유추하게 하지 않는다.

## 인증·기기·관리자 — C02·C03·C09

- 모바일은 불투명 Bearer access token(15분), 회전하는 refresh token(30일 유휴,90일 절대 만료)을 기기 보안 저장소에 보관한다. 서버에는 해시만 저장하고 매 요청에서 세션·계정 상태를 검사한다. refresh 재사용은 해당 family를 회수한다. 이 기간은 계약 구현 기본값이며 변경 시 계약 버전을 갱신한다.
- 로그인 challenge(5분·1회용)로 nonce를 발급하고 Google/Apple 토큰 서명·issuer·audience·expiry·nonce 및 제공자 subject를 확인한다. Apple authorizationCode는 제공될 때 서버 교환·검증에 사용한다. 제공자 계정을 이메일로 합치지 않는다. Google/Apple SDK 실제 연동은001/004에서 검증한다.
- 관리자는 별도 loginId/password의 초기 준비 principal이다. 공개 가입/암장 편집을 통한 권한 추가 API 없음. 비밀번호는 Argon2id 해시, 초기 비밀 전달·변경은001 운영 준비 절차다. admin 세션은 idle30분/absolute8시간, HttpOnly·Secure·SameSite=Lax cookie(path=/api/v1/admin), 매 쓰기 X-CSRF-Token와 허용 Origin 검사. 세션 조회로 CSRF 값을 받는다. 모바일 세션과 혼용하지 않는다. cookie 기반 토큰을 JSON에 반환하지 않는다.
- 모든 권한은 현재 대상 크루/소유 관계로 서버가 판단한다. myRole/canEdit/canDelete는 UI 표시 자료다. 마지막 선택 크루는 설정이며 API의 crewId를 대체하지 않는다. 초대 resolve는 로그인 후 최소 확인 자료만 반환; 미가입이면 crewId=null. join에는 inviteId만 전달하고 최종 차단/가입 상태를 재검사한다.
- my-membership 삭제의 If-Match는 GET crew에서 받은 Crew.version이다. 활성 회원/역할 변화와 이관 때 Crew.version도 증가시킨다. 계정 삭제는 Profile.version을 받고 전체 현재 가입 상태를 잠근 뒤 검사한다. preview는 안내용이며 저장 권한의 근거가 아니다. 이관할 다른 활성 회원이 없는 관리자도 ADMIN_TRANSFER_REQUIRED로 탈퇴·계정 삭제를 거절한다. 빈 크루 삭제 기능을 추가하지 않는다.
- 로그아웃은 현재 세션과 그 기기의 token-account 연결을 회수한다. 계정 삭제는 전체 인증/토큰을 회수한다. deviceId는 설치별 UUID이며 FCM token 변경 때 같은 PUT으로 갱신한다. path와 body deviceId가 다르면400. 서버에 저장한 토큰만으로 다른 계정에 알림을 보내지 않는다.

## 조회·공개·계산 — C04~C07·C10

- 공동 직접파일의 isOwnedByViewer/canUnshare/source는 서버가 현재 조회자 기준으로 제공한다. canUnshare는 업로더 본인의 crew_direct 공유에만 true다. 이 값으로 썸네일 옆 이름이나 새 버튼을 추가하지 않고 기존 수정 동작의 권한을 판단한다. 개인 첨부 visibility 편집은 본인 기록 수정에서, 파일보기 삭제 진입은 소유자 보관함 경로에서만 사용한다.

- 일반 목록은 cursor 기반이다. pageSize 기본50 최대200은 한 번의 응답 크기이며 총 기록·파일 개수 제한이 아니다. cursor는 정렬 마지막 key+필터+revision을 서명한 불투명 값이다. 기본 기록/이력/파일 정렬은 시점 DESC,id DESC, 운영 목록은 이름 ASC,id ASC, 공지는 order ASC,id ASC. 일정 sort=upcoming은 예정 시각 ASC 후 종료/취소 과거 DESC, recent는 시각 DESC. 변경된 필터/자료 revision에 이전 cursor를 쓰면409 QUERY_SNAPSHOT_CHANGED, 처음부터 다시 조회한다. snapshot은 개인 원본 사본을 저장하지 않는 revision marker다.
- 월 달력은 pagination 없이 월 전체 items와 complete=true를 반환한다. 이미 받은 items로 날짜시트를 열며 날짜 클릭으로 다시 조회하지 않는다. 목록과 달력은 같은 필터·중복 제외·대표 시각을 사용한다. 매우 큰 월 응답의 실제 성능은 구현 시 확인하며 조용히 항목을 잘라내지 않는다.
- browse view=all은 crewId가 없으면 본인 기록만, 있으면 해당 활성 가입 크루와 합친다. view=crew는 활성 crewId를 요구하며 가입 크루가 없을 때는 기기에서 크루 방문 선택을 비활성화하고 기본 전체/내 방문 조회를 유지한다. view=personal은 계정 전체이며 crewId를 필터로 사용하지 않는다. attendeeAccountIds는 view=crew에서만 허용하며 선택한 활성 회원 중 한 명이라도 실제 참석한 방문을 포함(OR)한다. 다른 크루 회원ID는 거절한다. 월 달력의 startDate/endDate 추가 조건은 둘 다 제공하고 표시 월과 교집합으로 조회한다. [S08](../../docs/functional-spec.md#s08-기록-목록--전체--내-방문--크루-방문)의 중복 제외→대표 시각→기간 필터 순서를 적용한다. startDate/endDate는 양끝 포함, timeZone 필수. 대표 시각/localDate는 조회 timeZone 기준이다.
- 통계 period=last_n_days는 days(기본90),month는 month,year는 year,custom은 startDate/endDate,all은 별도 날짜값 없이 요청한다. 서로 충돌하는 인자는400. period와 결과 period로 요청기간/평균 유효기간을 구분한다. 계산식·반올림·그래프 주간은 [5.3절](../../docs/functional-spec.md#53-통계-계산)의 원본을 따른다. record 목록 gym 필터를 통계에 자동 적용하지 않는다.
- OwnerRecord와 PublicRecord는 별도 projection이다. PublicRecord는 대상 크루에서 현재 허용하는 수치만 기본 제공하고 후기/media는 그 크루와 현재 활성 연결의 공개 조건으로 구성한다. 조회자가 소유자 본인이면 본인 비공개 후기·파일도 해당 응답에 포함하고, 타인에게 허용하지 않은 후기=null, media=[]이며 비공개 존재/visibility/다른 크루의 visitId·crewId·작성자·참석·링크를 반환하지 않는다. ownerOnly 기록은 회원 목록/상세/통계에서 제외한다. OwnerRecord의 activeLink는 본인에게만 반환한다.
- Media 메타자료 GET은 소유자 또는 용도 담당 admin만 사용한다. 회원은 PublicMedia로 표시하고 보호된 content/thumbnail만 읽는다. PublicMedia의 uploading/failed 파일은 목록에 개인 상태로 노출하지 않는다. Profile image/brand logo 읽기는 해당 profile/catalog 조회권한과 현재 참조를 확인하며 공지 image만 별도 익명 경로를 쓴다.
- 일정에는 최초 생성 사실과 현재 연결을 별개 필드로 반환한다. 응답/참석수/기록수는 혼용하지 않는다. Visit attendee에는 탈퇴/삭제한 회원의 공동 사실이 남을 수 있어 actor projection을 사용한다. 최초 개인 작성/연결은 본인 참석행 operation으로만 호출한다. VisitInput.attendeeAccountIds는 생성 시 활성회원 최소1·고유다. VisitUpdate.attendance는 전체 참석 선택이며 retainAttendanceIds는 현재 방문의 기존 참석(탈퇴/익명 포함) 유지, addAccountIds는 새로 추가할 현재 활성회원이다. 유지/추가 집합 결과는 최소1명이어야 하며 다른 방문 attendanceId·중복회원은 거절한다. 계정삭제 참석을 다시 개인계정으로 만들지 않으며 참석 추가만으로 개인 자동 최초 생성을 하지 않는다.
- link/new-record는 visit If-Match를 사용하고 서버가 본인·실제 참석·공동 시간대 날짜·암장·활성 연결을 저장 직전에 함께 검사한다. unlink 결과 recordId는 유지하고 개인본체/참석을 지우지 않는다. create-linked의 입력은 방문 날짜/암장 고정 조건을 검사한다. 방문 버전도 링크/참석/파일공유 변경 때 증가한다.
- 난이도 수정은 기존 GradeInput.id로 안정 키를 유지하고 null은 신규 키 발급이다. 누락된 기존 항목은 retired이며 과거값은 유지한다. retired 난이도 이름·색상은 마지막 운영 정의와 retired=true로 반환하고 원본 화면의 기존 표시 방식으로 보여준다. GymInput 수정은 벽 집합을 받지 않는다. 새지점 좌표가 없으면 lat/lng 둘 다 null로 허용하고 지도 핀 없이 검색은 유지한다.
- 추천은 newWallRatio(0~1 또는 null), 계산 인원, 벽수만 카드 자료로 제공한다. 개인별 마지막 방문/점수/비공개 기록ID 없음. nextCursor/snapshotVersion은 일정version+응답/운영/방문 revision에 연결한다. 과거 일정은400 INVALID_INPUT으로 추천을 제공하지 않는다. 추천 정책은 [5.4절](../../docs/functional-spec.md#54-암장-추천-계산) 원본이다.

## 파일·업로드·이력·작업 — C08·C11

- 개인/공동 파일은 기록 저장 후 POST media로 준비한다. targetId는 기존 기록/방문이며 다른 파일ID가 아니다. visibility는 personal_attachment에만 사용(기본public); crew_direct/profile/brand_logo/announcement에 보내면400이다. 운영 이미지는 먼저 image-drafts에서 대상 준비→업로드 완료→폼 저장 시 이미지 참조를 묶는다. profile draft는 본인, logo/announcement draft는 admin만 만들며 용도 교차와 다른 소유 이미지 재사용은 거절한다. 최종 참조되지 않은 draft는 임시 자료로 정리한다.
- POST media는 UploadTicket과 Location 업로드 경로를 반환한다. tus1.0을 채택하되 creation은 서비스 JSON API다. tus server OPTIONS로1.0.0·termination·checksum 지원을 광고한다. HEAD는 서버 확정 offset, PATCH는 `application/offset+octet-stream`·Upload-Offset·Tus-Resumable. offset 충돌409 후 HEAD로 재개한다. 수신/offset 반영은 원자적이며 응답 유실 때 bytes를 다시 덧붙이지 않는다. optional Upload-Checksum은 `sha256 <base64>`이다. byteLength/sha256은 완료 시 전체 검사하며 checksum 실패460, 완료 후 codec/형식 불일치는400이다. HEAD/PATCH/DELETE도 인증·삭제 상태를 검사한다. HEAD 오류에는 body 없이 HTTP 상태·X-Error-Code·X-Retryable을 반환한다. 성공/오류에 Tus-Resumable, HEAD에는 Cache-Control:no-store를 준다. tus 자체 bytes 재시도는 일반 멱등키 대신 offset을 사용한다.
- 전체 bytes 확인 후 POST complete가 변환 작업을 등록하고 processing 반환, 폴링 GET metadata로 ready/failed 확인한다. retry는 기존 임시 bytes 유효시 같은 fileId로 처리재시도/offset재개, 임시 정리됐으면410 REUPLOAD_REQUIRED로 같은 fileId의 새 upload session을 만들 준비를 안내한다. 재업로드용 POST media/reupload가 별도로 ticket을 만들고 다른 기록으로 대상변경하지 않는다. 정상 진행 중 정리 금지와 실패 임시7일 정리는 [기술 원본](../../docs/technical-spec.md#5-저장소-운영--채택한-기준)을 따른다.
- 개인 PATCH attachments는 해당 기록 기존 fileId의 유지/삭제/visibility만 처리한다. 다른 기록의 파일을 넣으면400. 누락한 attachment는 저장 성공 시 삭제 대상으로 처리하며 실패/취소는 유지한다. 파일바이트 삭제 작업과 접근 회수는 같은 기록 변경 TX에 등록한다. 신규 선택 bytes는 저장 후 media생성으로 처리하며 생성 전 visibility는 기기 draft에 보관한다.
- 공동 직접파일 share DELETE는 업로더의 공유만 해제하고 파일 보관은 유지한다. 파일 DELETE는 소유 파일과 전체 파생물·공유를 삭제한다. 다른 파일을 받아 붙이는 share POST/PUT은 제공하지 않는다. 개인 첨부의 공개는 활성연결로 파생하며 share DELETE 대상이 아니다.
- content/thumbnail은 매 요청·Range 요청마다 현재 접근 검사 후 bytes/206 반환한다. 416은 `Content-Range: bytes */<length>`와 오류를 준다. private,no-store. 외부 저장 URL·storageKey·디스크경로를 응답하지 않는다. 익명 announcement-images는 현재 공지의 해당 purpose 자산만 읽고 삭제/교체 직후 제외한다. 별도 공개파일 API를 만들지 않는다.
- 공동 이력 changes는 OpenAPI의 공동 field/value만 허용하고 field별 값 타입을 검사한다. 참석 변경 과거값은 attendeeActorIds로 남기며 accountId/name의 사본을 보관하지 않는다. record_relinked는 재참석에 의한 직전 연결 재사용을 식별한다. private record 과거본문/response/첨부를 이력·queuepayload에 복제하지 않는다. 공동 쓰기+이력+outbox는 같은 PostgreSQL TX. queue는 pg-boss, outbox dispatcher로 commit 이후 같은 jobKey를 전달하며 재전달에도 효과 중복을 막는다. 영상변환 동시1, 삭제/알림 별도 처리기. 작업 실행/결과등록 직전에 현재 삭제·세대·권한을 검사한다. Runtime의 작업·저장소 정의는 내부 worker/adapter에만 사용하고 클라이언트에 노출하지 않는다. complete/retry 변환 등록은 media_transform_requested 사건→OutboxEntry→MediaJob 순서이며 삭제는 file_access_revoked, 이동은 storage_move_requested를 사용한다. Runtime의 기기/화면 정의는 프론트가 소비한다.

## 화면·기기·계약 변경 — C12

화면·초대·푸시·운동·공지 숨김·오픈소스의 필드는 runtime.schema.json 원본을 쓴다. 운동 시작 A/B는 선택하지 않았다. workout finish는 시작 UI와 독립이며 profile/crew 변경으로 다른 계정에 draft를 넘기지 않는다. OS 강제종료와 프로세스 정리의 구분은 기기 구현검증이 필요하며 서버가 자동저장하지 않는다. 운동표시줄은 records 탭 context에서만 보이고 다른 UI 겹침은 허용한다. 하단메뉴 유무로 별도 위치를 만들지 않는다. 공지는 익명 GET으로 앱시작에 읽고, 기기 오늘숨김은 서버에 동기화하지 않는다. notices는 배포파일로 오프라인 제공하며 API가 필요 없다.

HTTP breaking 변경은 API major 경로와 계약 major를 함께 갱신하고, Runtime breaking 변경은 계약 major를 갱신하되 기존 HTTP 경로를 유지한다. additive 선택필드/응답은 minor, 의미 보정은 patch. 이미 배포된 소비자가 알 수 없는 응답필드를 무시할 수 있도록 생성 소비자에서 대응하고 서버 입력에는 unknown 거절을 유지한다. 열거값 추가는 exhaustive 소비자 영향 때문에 breaking으로 처리한다. [역할 분리 원본](../../specs/development-roles.md)에 따라 백엔드 초안·프론트 소비 검토·예제 확인을 모은다. 현재 서브에이전트 설계 검토는 실제 담당 개발자의 연동 승인/실행 검사를 대신하지 않는다.


### 002 화면 경로 변경 — 계약2.0.0

C12의 승인된05.07 알림 목록 화면을 Route.screenId에 추가했다. enum 추가는 exhaustive 소비자에 영향을 주므로 계약 major를 올린다. 기존 HTTP 입력·응답과 `/api/v1` 경로는 유지한다. 소비자는 같은 manifest의 생성물을 함께 갱신하고 화면 분기에서05.07을 처리한다. 이 변경은 수신 조회·읽음 API 확정이나 알림 화면 구현 완료를 뜻하지 않는다.

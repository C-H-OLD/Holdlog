# 공통 논리 데이터 모델

작성일: 2026-10-06 · 상태: 설계 작성. DB 생성·SQL migration·API 구현·기기 검증은 하지 않음.

이 문서는 앱·관리자 웹·서버가 같은 자료를 가리키도록 정하는 논리 모델의 원본이다. 제품 규칙은 [기능 명세](../../docs/functional-spec.md), [기록 관계](../../docs/record-relationships.md), [관리자 명세](../../docs/admin-spec.md), [운동 명세](../../docs/workout-recording-spec.md)에 둔다. 아래 제약은 그 규칙을 저장 구조로 표현한 설계이며 권한표·계산식을 복제하지 않는다. C번호별 범위는 [계약 설계 범위](contract-scope.md)를 따른다.

## 1. 공통 표현

| 항목 | 설계 |
|---|---|
| 식별자 | 각 엔터티 `id`는 UUID. 참조도 UUID이며 사람 이름·색상·주소·파일 URL을 식별자로 사용하지 않음 |
| 시점 | 서버 내부 PostgreSQL `timestamptz`, 계약 UTC RFC3339 문자열(`Z`). 실제 방문·일정은 저장 모델 `occurredAt`(API에서는 `visitedAt`)/`scheduledAt`와 별도 `timeZone` IANA 식별자 저장 |
| 날짜 전용 | `YYYY-MM-DD`. 세팅 날짜·기기 당일 숨김에는 임의 시각을 만들지 않음 |
| 버전 | 변경 가능한 집합에 `version` 양의 정수, 처음 1. 성공한 변경마다 1 증가. 관련 집합을 잠근 뒤 기대 버전 확인 |
| 생성·수정 | 서버가 `createdAt`, `updatedAt` 기록. 소유자·작업자·역할은 인증과 DB 관계에서 결정 |
| 누락과 null | 전체 조회는 선택값 없음을 `null`로 반환. 수정 요청에서 누락은 유지, `null`은 해당 선택값 제거. 필수 값에 null 거절 |
| 정수와 소수 | 완등 개수는 0 이상 정수, 컨디션은 null 또는 1~5 정수. 통계 평균·추천 score는 JSON number, DB 계산은 decimal. 표시 반올림과 원본 계산값 구분 |
| 공개 구분 | `reviewVisibility`/개인 파일 `visibility`: `public` 또는 `private`. 기록의 `ownerOnly`와 별개. 실제 읽기 허용은 서버가 현재 관계로 판단 |
| 삭제 | 개인 원본은 실제 제거. 파일 정리·중복 요청·삭제 재생 방지에 필요한 최소 tombstone에는 개인 내용·파일 URL·이름을 넣지 않음 |

화면 예시 인원·브랜드·11색은 테이블 개수나 데이터 제한으로 삼지 않는다. 사용자 입력의 상세 검증은 [D01~D08](../../docs/functional-spec.md#7-개발-정책과-결정-상태)에 연결한다.

## 2. 계정·기기·크루 — C02·C03

### 계정과 인증

| 엔터티 | 필드·관계 | 제약·조회 인덱스 |
|---|---|---|
| `Account` | id, displayName, profileImageId nullable→Asset, version, createdAt, updatedAt | 프로필 자산 소유자는 본인. 계정 삭제 시 개인 원본·프로필 제거 |
| `ExternalIdentity` | id, accountId→Account, provider(`google`/`apple`), providerSubject, email nullable | unique(provider, providerSubject). email로 병합 금지. accountId 인덱스. 제공자 토큰 원문 보관하지 않음 |
| `AuthSession` | id, accountId→Account, deviceId nullable→DeviceInstallation, currentRefreshCredentialId nullable→RefreshCredential, tokenFamilyId UUID, expiresAt, idleExpiresAt, absoluteExpiresAt, rotatedAt nullable, revokedAt nullable | 현재 refresh는 Credential 참조, accountId·revokedAt 인덱스. 갱신 회전·재사용 감지 시 family 회수. 인증 수명 값은 API 계약 원본에서 정의 |
| `LoginChallenge` | id, nonceHash, createdAt, expiresAt, consumedAt nullable | 5분·1회용. 로그인 저장과 소비 상태 함께 처리. nonce 원문 로그 금지 |
| `RefreshCredential` | id, sessionId→AuthSession, tokenFamilyId UUID, tokenHash, expiresAt, usedAt nullable, revokedAt nullable | tokenHash unique. 회전된 해시는 family 절대만료까지 재사용 감지용 보존. 원문 토큰 없음 |
| `AccessCredential` | id, sessionId→AuthSession, tokenHash, expiresAt | tokenHash unique. 불투명 accessToken 원문 미보관. 회수한 session에서 발급된 access도 즉시 거절 |
| `ServiceAdministrator` | id, loginId, credentialHash, active, version | loginId unique. 공개 가입 없음. 초기 준비 절차는 001. 크루 역할과 독립 |
| `AdminSession` | id, administratorId→ServiceAdministrator, sessionSecretHash, csrfTokenHash, createdAt, lastActivityAt, expiresAt, revokedAt nullable | 비밀 원문 저장 금지. administratorId·revokedAt 인덱스. 브라우저 계약의 쿠키 조건을 따른다 |
| `DeviceInstallation` | id, platform(`ios`/`android`), accountId nullable→Account, pushTokenCiphertext nullable, pushTokenHash nullable, pushPermission, appVersion, lastSeenAt, version | 유효 pushTokenHash unique. 로그인·로그아웃 시 소유 계정 갱신. 기기 ID는 계정 접근 권한이 아님 |
| `NotificationSettingsAggregate` | id, accountId→Account, version, updatedAt | accountId unique. 세 종류 설정 PATCH의 공통 ETag/If-Match와 잠금 대상이며 각 설정 변경과 함께 증가 |
| `NotificationPreference` | id, accountId→Account, kind, enabled, version | unique(accountId, kind). 알림 종류는 [푸시 원본](../../docs/functional-spec.md#55-푸시-알림)과 계약 열거값을 따른다 |

일반 로그인과 서비스 관리자 로그인은 같은 세션·권한으로 혼합하지 않는다. 프로필·브랜드·공지의 이미지도 Asset으로 추적하되 개인 운동 보관함에 섞지 않는다.

### 크루와 구성원

| 엔터티 | 필드·관계 | 제약·조회 인덱스 |
|---|---|---|
| `Crew` | id, name, version, createdAt, updatedAt | 이름 unique 제한 없음. 회원 수는 활성 Membership 집계값 |
| `Membership` | id, crewId→Crew, accountId→Account, role(`member`/`admin`), state(`active`/`left`/`blocked`), joinedAt, leftAt nullable, version | unique(crewId, accountId). (crewId,state,role), (accountId,state) 인덱스. 재가입은 같은 관계를 갱신하며 새로운 중복 가입 행을 만들지 않음 |
| `CrewInvite` | id, crewId→Crew, code, active, version, createdAt | crewId unique, code unique. expiresAt 없음. 재발급 API는 현재 없음. 가입 확인 응답에는 최소 크루 이름과 가입 판단만 노출 |
| `AccountPreference` | id, accountId→Account, lastSelectedCrewId nullable→Crew, version | accountId unique. 선택 크루는 접근 권한 근거가 아님. 탈퇴 시 무효 선택을 null로 정리 |
| `CrewActor` | id, crewId→Crew, accountId nullable→Account, state(`active`/`left`/`anonymous`) | accountId가 있을 때 unique(crewId,accountId). 참석·이력의 공동 사실용 식별자. 이름 사본 저장 없음. 탈퇴는 left, 재가입은 현재 활성 관계 확인, 계정 삭제는 accountId 제거·anonymous |

`CrewActor`는 남아야 하는 공동 사실과 지워야 하는 계정 정보를 분리한다. 기존 참석·일정 작성자·이력이 동일 actor를 참조하므로 계정 삭제 시 이름·프로필·계정 ID 사본을 찾아 남기는 구조가 없다. 탈퇴/계정 삭제 표시 원본은 [B05](../../docs/functional-spec.md#b05-탈퇴제외재가입계정-삭제)다. S18의 차단 해제·회원 제외 UI/API를 새로 만들지 않지만 blocked 상태를 조회하여 기존 차단을 우회하지 않도록 한다.

## 3. 브랜드·암장·벽·세팅 — C04

| 엔터티 | 필드·관계 | 제약·조회 인덱스 |
|---|---|---|
| `Brand` | id, name, logoAssetId nullable→Asset, version, createdAt, updatedAt | 브랜드 저장 집합에 GradeDefinition 포함. 암장 폼과 독립 저장 |
| `GradeDefinition` | id, brandId→Brand, gradeKey integer, displayName, colorHex, displayOrder integer, retiredAt nullable | unique(brandId,gradeKey), (brandId,retiredAt,displayOrder) 인덱스. gradeKey는 발급 후 불변·재사용 없음. 순서 변경은 displayOrder만 변경 |
| `Gym` | id, brandId→Brand, branchName, address, regionText, latitude nullable, longitude nullable, displayColorHex, timeZone, version | brandId 필수. 위·경도는 함께 있음/함께 null, 범위 검증. (brandId,branchName,id), 검색용 이름·주소·지역, 좌표 인덱스 |
| `Wall` | id, gymId→Gym, name, displayOrder | (gymId,displayOrder,id) 인덱스. 최초 암장 생성에만 입력. 기존 암장 벽 편집 API 없음 |
| `WallSetting` | id, wallId→Wall, localDate, cancelledAt nullable, version, createdAt, updatedAt | (wallId,localDate) 인덱스. 날짜를 시점으로 꾸미지 않음. 같은 벽 반복 세팅은 별개 id. 추천은 취소 제외 |
| `CatalogRevision` | id, revision integer, updatedAt | 단일 운영 데이터 revision. 브랜드·암장·세팅 쓰기에 함께 증가하여 캐시·추천 입력 변화 식별 |

난이도 삭제는 `retiredAt`으로 현재 입력 목록에서 제외하고 안정적인 gradeKey·과거 참조를 남기는 설계다. 과거 기록의 current mapping 표시와 삭제 난이도 표시 방식은 API 계약을 따른다. FK cascade로 과거 완등을 삭제하지 않는다. 기존 색상으로 새 난이도를 찾지 않는다. 상세 원본은 [브랜드 난이도](../../docs/admin-spec.md#브랜드-난이도)와 [최소 저장 계약](../../docs/functional-spec.md#6-서버-데이터와-최소-저장-계약)이다.

## 4. 일정·공동 방문·실제 참석 — C05·C07

| 엔터티 | 필드·관계 | 제약·조회 인덱스 |
|---|---|---|
| `Schedule` | id, crewId→Crew, creatorActorId→CrewActor, scheduledAt, timeZone, gymId nullable→Gym, description nullable, state(`planned`/`ended`/`cancelled`), firstVisitCreatedAt nullable, version | (crewId,scheduledAt,id), (state,scheduledAt) 인덱스. firstVisitCreatedAt은 최초 값 유지·방문 삭제로 null 재설정 금지 |
| `ScheduleResponse` | id, scheduleId→Schedule, actorId→CrewActor, response(`participating`/`declined`), version, updatedAt | unique(scheduleId,actorId). 행 없음은 미응답. 응답 행에서 개인 기록·실제 참석 생성 없음 |
| `CrewVisit` | id, crewId→Crew, scheduleId nullable→Schedule, occurredAt, timeZone, gymId→Gym, memo nullable, version, createdAt, updatedAt | scheduleId가 null 아닌 살아 있는 방문 unique. (crewId,occurredAt,id), (gymId,occurredAt) 인덱스. 날짜+암장 unique 없음 |
| `Attendance` | id, crewVisitId→CrewVisit, actorId→CrewActor, present boolean, version, updatedAt | unique(crewVisitId,actorId). 활성 인원은 present=true 집계. 비활성 행은 재참석의 직전 연결 판정에 사용 |
| `PersonalRecordLink` | id, attendanceId→Attendance, personalRecordId→PersonalRecord, active boolean, endedReason nullable, autoRelinkEligible boolean, connectedAt, endedAt nullable, version | active=true에 personalRecordId unique 및 attendanceId unique. attendanceId·endedAt 정렬 인덱스. 비활성 참조는 개인 내용 사본이 아님 |

연결은 별도 관계로 유지하고 Attendance에 개인 수치를 복사하지 않는다. endedReason은 `self_unlinked`/`attendance_removed`/`membership_left`/`membership_blocked`/`visit_deleted`/`record_deleted`/`account_deleted`. 직전 관계만 재참석 후보이며 `attendance_removed`만 자동 재연결 가능 상태가 된다. 직접 해제·탈퇴·삭제 후에는 이전 id만으로 공개를 복원하지 않는다. 후보 사용 직전에 원본의 모든 조건을 다시 검사한다.

개인 기록 삭제 시 해당 Link 행은 제거하고 공동 이력에는 최소 해제 사건만 남긴다. 공동 방문 삭제 시 방문·참석·Link를 제거한다. 살아 있는 일정은 firstVisitCreatedAt으로 최초 생성 사실만 기억한다. 삭제된 방문의 본문·참석 목록을 복구용 tombstone에 넣지 않는다. 상세 연결·보존 규칙은 [기록 관계 4절](../../docs/record-relationships.md#4-날짜암장의-일치와-수정-제한--b01)·[6절](../../docs/record-relationships.md#6-수정삭제-영향표)에서 관리한다.

## 5. 개인 기록과 완등 — C06

| 엔터티 | 필드·관계 | 제약·조회 인덱스 |
|---|---|---|
| `PersonalRecord` | id, ownerAccountId→Account, occurredAt, timeZone, gymId→Gym, climbsEntered boolean, condition nullable integer, review nullable string, reviewVisibility, ownerOnly boolean, clientWorkoutId nullable UUID, version, createdAt, updatedAt | (ownerAccountId,occurredAt,id), (gymId,occurredAt) 인덱스. ownerAccountId+clientWorkoutId는 값 있을 때 unique. 소유자+날짜+암장 unique 금지 |
| `RecordGradeCount` | id, personalRecordId→PersonalRecord, brandId→Brand, gradeKey integer→GradeDefinition, count integer | unique(personalRecordId,brandId,gradeKey). brandId+gradeKey FK. count 0 이상. 개별 난이도 행 없음은 미입력, count=0은 입력된 0. PersonalRecord.climbsEntered=false는 API climbs=null, true+0행은 [], true+행은 해당 배열 |
| `WorkoutCompletionReceipt` | id, ownerAccountId→Account, clientWorkoutId UUID, personalRecordId nullable→PersonalRecord, completedAt, recordDeleted boolean | unique(ownerAccountId,clientWorkoutId). 종료 요청의 영구 업무 중복 방지. 기록 삭제 후 id를 null로 바꾸고 recordDeleted=true로 남겨 같은 운동 재생성 금지. 운동 개수·후기·응답 사본 없음. 계정 삭제 시 제거 |

ownerOnly는 기록 전체의 본인 전용 보호 상태다. 연결 생성 성공 시 허용되는 공개 상태로 전환하고, 원본의 분리 사건에서 true가 된다. reviewVisibility와 각 파일 visibility를 바꾸거나 초기화하지 않는다. 다른 브랜드로 암장을 고친 경우 기존 brandId·gradeKey·count를 보존하며 새 색으로 자동 매핑하지 않는다. 과거 난이도 데이터를 새 브랜드로 옮기는 별도 자동 변환 엔터티는 없다.

회원 조회용 자료는 이 모델 원본에서 현재 권한으로 만드는 허용 필드 projection이다. 개인 통계·회원 통계·추천 결과는 파생 자료이며 별도 개인 내용 이력/영구 복사 원본을 만들지 않는다. 계산식은 [통계](../../docs/functional-spec.md#53-통계-계산)·[추천](../../docs/functional-spec.md#54-암장-추천-계산), 공개는 [2.3절](../../docs/functional-spec.md#23-공개-범위)을 따른다.

## 6. 미디어와 저장소 — C08

### 자산·첨부·공유

| 엔터티 | 필드·관계 | 제약·조회 인덱스 |
|---|---|---|
| `AssetDraft` | id, purpose(profile/brand_logo/announcement), ownerAccountId nullable, ownerAdminId nullable, assetId nullable→Asset, createdAt, expiresAt, consumedAt nullable | 정확히 하나의 소유주. image-drafts.id와 media targetId 대응. 소유/용도 검사 후 한 자산만 연결, 실제 폼 저장 성공에 소비. 만료 기본7일이며 정상 업로드/변환 진행중은 정리 제외 |
| `Asset` | id, purpose(`personal_attachment`/`crew_direct`/`profile`/`brand_logo`/`announcement`), uploaderAccountId nullable→Account, uploaderAdminId nullable→ServiceAdministrator, mediaKind, state, generation integer, version, createdAt, updatedAt | 업로더 종류 정확히 하나. purpose로 보관함·관리자 이미지를 분리. 개인/공동 media는 계정 소유. (uploaderAccountId,purpose,createdAt,id) 인덱스 |
| `PersonalAttachment` | id, personalRecordId→PersonalRecord, assetId→Asset, visibility, displayOrder | assetId unique. 업로더와 기록 소유자 일치. (personalRecordId,displayOrder,id) 인덱스 |
| `CrewFileShare` | id, crewVisitId→CrewVisit, assetId→Asset, active boolean, displayOrder, version | unique(crewVisitId,assetId). 공동에 직접 올린 파일만 저장. 개인 첨부 공개는 활성 Link에서 파생하고 이 테이블에 복사하지 않음 |
| `StorageBackend` | id, kind(`local` 또는 후속 어댑터 식별), configurationRef, newUploadDefault boolean, active | 외부 비밀값·절대 경로는 서버 설정 원본, configurationRef만 보관. 기존 backend는 신규 업로드 기본값과 독립 읽기·삭제 가능 |
| `AssetObject` | id, assetId→Asset, variant(`temporary_original`/`image`/`video`/`thumbnail`), generation, storageBackendId→StorageBackend, storageKey, bytes, checksumSha256, mimeType, width nullable, height nullable, durationMs nullable, state | (storageBackendId,storageKey) unique. (assetId,variant,generation), 정리 상태 인덱스. 서비스 응답에 내부 위치 노출 없음 |
| `AssetVariantPointer` | id, assetId→Asset, variant, assetObjectId→AssetObject, version | unique(assetId,variant). 검증된 object만 가리킴. 이동 중 이전·복사 object를 함께 추적 가능 |

Asset.state는 `reserved`→`uploading`→`processing`→`ready`, 실패는 `failed`; 삭제는 `deleting` 이후 개인 Asset 행 제거. 업로드/처리 재시도는 generation으로 오래된 완료 결과와 구분한다. 파일 상태는 사용자 시안의 별도 표시를 새로 요구하지 않는다.

공동 방문 삭제는 CrewFileShare만 제거하고 Asset·업로드·변환을 유지한다. 개인 기록·계정·파일 삭제는 접근을 먼저 차단하고 모든 object의 삭제를 등록한다. 임시 원본은 결과 검증 후 정리하며 실패한 임시 파일의 유휴 정리는 [기술 명세](../../docs/technical-spec.md#5-저장소-운영--채택한-기준)를 따른다. 직접 파일·썸네일·Range 요청도 현재 Asset/Attachment/Link/Membership 권한을 검사한다.

### 업로드·이동·삭제

| 엔터티 | 필드·관계 | 제약·조회 인덱스 |
|---|---|---|
| `UploadSession` | id, assetId→Asset, generation, expectedBytes, expectedChecksumSha256 nullable, acceptedOffset, state, lastActivityAt, version | (assetId,generation) unique. acceptedOffset는 서버의 연속 수신 확정 위치. 구간 offset/length/checksum 검사 후 증가. lastActivityAt·state 정리 인덱스 |
| `StorageMove` | id, assetObjectId→AssetObject, targetBackendId, targetKey, targetObjectId nullable, phase, version, updatedAt | (assetObjectId,targetBackendId,targetKey) unique. phase=`copying`/`verified`/`pointer_switched`/`read_verified`/`cleanup`/`completed`/`failed`. 이전 object는 read_verified 전 제거 금지 |
| `FileDeletionTask` | id, deletedAssetId UUID, storageBackendId, storageKey, generation, state, attempts, nextAttemptAt, lastErrorCode nullable | 같은 저장 위치·generation 중복 작업 방지. 개인 Asset FK 없음. 사진·영상·썸네일·임시본·이동 사본 모두 각각 작업. 완료 후 필요 없는 위치정보 제거 |

업로드 세션은 성공한 기록 저장 이후에만 만들며 이미 존재하는 assetId를 다른 기록에 옮기거나 재첨부하는 명령은 없다. 자산 교체·첨부 제거는 기존 레코드 저장과 함께 접근 회수·삭제 작업을 반영한다. 실제 파일 쓰기/FFmpeg/저장소 호출은 DB 트랜잭션 밖에서 실행하고 세대·삭제 여부를 마지막 등록 직전에 재검사한다.

## 7. 공동 이력·사건·알림·중복 요청 — C01·C09·C11

| 엔터티 | 필드·관계 | 제약·조회 인덱스 |
|---|---|---|
| `SharedHistoryEvent` | id, crewId→Crew, targetType, targetId UUID, eventType, actorId nullable→CrewActor, occurredAt, beforeVersion nullable, afterVersion nullable, changedFields, beforeSharedValues nullable, afterSharedValues nullable, reversible boolean, revertedEventId nullable | (crewId,occurredAt,id), (targetType,targetId,occurredAt) 인덱스. 값의 허용 schema는 공동 필드만. 개인 후기·완등·컨디션·개인 파일 과거 값 없음 |
| `DomainEvent` | id, kind, aggregateType, aggregateId UUID, aggregateVersion, occurredAt, crewId nullable, payload | (aggregateType,aggregateId,aggregateVersion,kind) 논리 중복 방지. 개인 원본을 payload에 복제하지 않음. 공동 연결/삭제는 id와 최소 이유만 |
| `OutboxEntry` | id, eventId→DomainEvent, queueKind(`media`/`deletion`/`notification`), jobKey, state, availableAt, attempts, claimedAt nullable, lastErrorCode nullable | jobKey unique. (state,availableAt) 인덱스. DB commit된 사건만 전달하며 pg-boss 전달 후 재전달되어도 동일 jobKey 사용 |
| `JobExecution` | id, jobKey, resourceId UUID nullable, expectedGeneration nullable, state, attempts, startedAt nullable, finishedAt nullable | jobKey unique. 외부 작업 중복 완료 방지. 원문 파일·개인 내용 없음. 삭제 완료 후 원본을 복원하는 FK 없음 |
| `NotificationEvent` | id, scheduleId→Schedule, scheduleVersion, kind, crewId→Crew, basisLocalDate nullable, scheduleTimeZone, occurredAt | 같은 일정 변경 버전의 묶음 사건은 unique(scheduleId,scheduleVersion,kind). 기록 요청은 일정·종류·기준일로 중복 방지 |
| `NotificationRecipient` | id, notificationEventId→NotificationEvent, accountId→Account, state, lastCheckedAt nullable | unique(notificationEventId,accountId). 대상 조건과 활성 소속을 검사해 설정/OS 권한과 무관하게 수신 행 생성. 설정은 발송 직전 검사 |
| `NotificationDelivery` | id, recipientId→NotificationRecipient, installationId→DeviceInstallation, state, attempts, providerMessageId nullable, sentAt nullable | unique(recipientId,installationId). 외부 푸시 정확히 한 번 도착 보장 없음 |
| `ScheduleReminder` | id, scheduleId→Schedule, expectedScheduleVersion, basisLocalDate, runAt UTC, state, version | 활성 예약 scheduleId unique. 변경/취소 시 이전 예약 무효화. due 인덱스(state,runAt) |
| `IdempotencyReceipt` | id, principalScope, principalId UUID, operation, key UUID, requestHash, state, resultResourceId nullable UUID, resultVersion nullable, resultStatus, errorCode nullable, createdAt, expiresAt | unique(principalScope,principalId,operation,key). 개인 응답 본문·미디어·후기·입력 사본 보관 금지. 성공 재요청은 현재 권한 아래 resourceId로 결과 재구성 |
| `DeletionMarker` | id, resourceType, resourceId UUID, generation nullable, deletedAt | unique(resourceType,resourceId). 개인 내용 없이 늦은 완료·삭제한 요청의 재생 차단. 저장소 정리와 중복 요청 종료 전 제거하지 않음 |

공동 방문 삭제 사건은 대상 id·행위자·시각·최소 종료 사실만 남기고 삭제된 본문의 beforeSharedValues를 제거한다. 방문 삭제를 되돌리기로 복구하지 않는다. 살아 있는 공동 수정의 되돌리기는 현재 버전·권한·연결 제약을 다시 검사하고 새로운 SharedHistoryEvent로 남긴다. 원본은 [S14](../../docs/functional-spec.md#s14-변경-이력수정-되돌리기)·[변경·이력 저장](../../docs/prd.md#10-변경-이력과-데이터-보호)다.

IdempotencyReceipt 보존 시간·재시도 응답 형식은 공통 API 계약이 원본이다. 만료된 키를 영구 중복 방지 장치로 사용하지 않는다. clientWorkoutId·가입 unique·최초 방문 사실·활성 연결 unique 등 업무 관계 제약도 함께 적용한다. 계정 삭제는 해당 계정 Receipt·알림 수신/기기/인증 데이터를 제거한다. 계정 삭제 응답 유실 후 재요청은 회수된 세션을 살리지 않고401로 처리한다. 새 회수 토큰 API를 추가하지 않는다.

## 8. 공지·기기 로컬 상태·배포 고지 — C12

| 위치·모델 | 필드 | 제약·책임 |
|---|---|---|
| 서버 `Announcement` | id, imageAssetId→Asset, targetUrl, displayOrder integer, version, createdAt, updatedAt | (displayOrder,id) 정렬. 목록/이미지는 로그인 전 조회 가능하도록 계약에서 분리. 관리 쓰기는 서비스 관리자 전용. 삭제 후 목록 제외·전용 이미지 정리 |
| 기기 `AnnouncementSuppression` | localDate, timeZoneAtSelection | 기기 전체 로컬 저장. 계정 변경·공지 변경으로 초기화하지 않음. 서버 AccountPreference에 동기화하지 않음 |
| 기기 `PendingInvite` | inviteCode, receivedAt | 로그인 이어가기 입력. 서버에서 항상 재검증. 크루 이름·역할을 신뢰하는 데이터 없음. 미설치 후 자동 복원 DB 없음 |
| 기기 `ActiveWorkout` | clientWorkoutId UUID, ownerAccountId, gymId, startedAt UTC, timeZone, gradeCounts(brandId·gradeKey·count), state, ownerInstallationId | 기기 한 활성 운동만. 다른 계정으로 넘기지 않음. 화면 이동·백그라운드는 유지. OS 구분 전제는 아래 검증 경계에 기록 |
| 배포 `OpenSourceManifest` | buildId, generatedAt, entries(name,version,license,notices) | 모바일 배포에 포함하는 오프라인 자료. 서버 테이블로 개인 계정과 연결하지 않음. 앱 실제 의존성에서 생성·검증 |

ActiveWorkout.state는 `active`/`finishing`/`saved`/`cancelled`. 진행 개수는 서버 개인 기록으로 저장하지 않고 종료 요청만 PersonalRecord를 만든다. 종료 성공은 WorkoutCompletionReceipt의 clientWorkoutId로 같은 기록을 찾아 중복 생성하지 않는다. 기록이 이미 삭제됐다면 삭제 상태를 반환하고 재생성하지 않는다. 종료 저장 실패는 현재 개수 유지. 사용자 강제 종료와 OS 프로세스 정리 판정은 기기 검증 전까지 구현 완료로 볼 수 없다. 진행 복원 자료는 기기에 보호 저장하되 강제 종료로 확인된 세션은 폐기하며 백그라운드/OS 정리만으로 저장하지 않는다. 서버가 시간 경과만으로 운동을 자동 종료·자동 저장하지 않는다.

운동 시작 버튼·A/B 경로는 미정이며 데이터 모델에서 선택하지 않는다. 표시줄은 기록 탭 영역만 표시하고 UI 겹침은 허용한다. 공지 시안은 사용자 승인 상태이며 추가 승인 대기로 되돌리지 않는다. 이 결정의 화면 관리 원본은 [운동 명세](../../docs/workout-recording-spec.md)·[화면 작업 목록](../../docs/screen-worklist.md)이다.

## 9. 함께 저장할 범위와 잠금 순서

단일 PostgreSQL DB에서 관련 원본 변경·버전 증가·SharedHistoryEvent(해당 작업)·DomainEvent/OutboxEntry·성공 Receipt를 하나의 트랜잭션으로 commit한다. 이력 또는 작업 등록 실패도 원본 변경 실패로 처리한다. 외부 파일/푸시 처리는 commit 이후다.

잠금 순서는 관련 Account → Crew/Membership → Schedule → CrewVisit → Attendance → PersonalRecord → Link → Asset 순서, 같은 종류의 여러 행은 UUID 순서다. 운동 종료는 PersonalRecord·GradeCount·WorkoutCompletionReceipt를 함께 저장한다. 처음 잠금을 못 거는 새 행의 unique 충돌은 해당 업무 충돌 응답으로 변환한다. 모든 관계 변경이 같은 순서를 사용한다. 단순 조회에서 이 잠금을 요구하지 않는다.

| 명령 | 원자 범위·충돌 방지 |
|---|---|
| 크루 생성·초대 가입 | Crew·Invite·Membership·CrewActor·선택 상태 함께 처리. 초대/차단/현재 가입 검사와 가입 unique가 같은 트랜잭션 |
| 관리자 이관 | Crew와 두 Membership 잠금, 기대 버전/활성 상태 검사 후 역할을 함께 교환. 탈퇴/계정 삭제는 동일 Membership 잠금으로 관리자 잔류 검사 |
| 일정 저장·응답 | 해당 Schedule/Response 변경과 사건·알림 대상·예약 갱신. 일정 응답이 실제 참석을 쓰지 않음 |
| 공동 방문 생성 | Schedule 잠금·현재 방문 unique 검사·firstVisitCreatedAt 첫 값 기록·종료·Visit·Attendance·공동 이력 함께 저장. 다른 요청은 현재 권한으로 기존 방문을200 반환하고 후발 입력은 합치지 않음 |
| 공동 시각/암장 수정·연결 | Visit와 현재 Link/PersonalRecord 검사 잠금. 연결 유무 확인 후 수정 또는 날짜·암장 조건 검사 후 Link 저장. 서로 다른 조건의 링크/방문 조합 commit 금지 |
| 크루에서 개인 새 작성 | Account/Membership·Visit·Attendance 잠금 후 PersonalRecord·GradeCount·Link·ownerOnly 변경을 함께 저장. 파일 바이트 처리 제외 |
| 연결·직접 해제·참석 제외/재추가 | Visit·Attendance·PersonalRecord·Link 버전/소유/날짜/암장/현재 가입/직전 원인 검사. ownerOnly·접근 관계·최소 공동 사건 동시 변경 |
| 공동 방문 삭제 | 대상 Visit·Attendance·Link·CrewFileShare 제거, 연결된 PersonalRecord ownerOnly=true, 최초 일정 사실 유지, 공동 본문 과거값 제거·최소 삭제 사건. 개인 Asset 삭제 작업 없음 |
| 개인 기록 저장·첨부 제거 | 기록·GradeCount·Visibility·기존 첨부 제거/파일 접근 차단·삭제 outbox 함께 처리. 새 업로드는 성공한 기록 대상만 이후 시작 |
| 개인 기록/파일 삭제 | 원본·활성 Link/Attachment/Share 제거·최소 공동 사건·DeletionMarker·모든 저장 object 정리 작업 등록. Attendance 유지. 개인 내용을 Receipt/이력에 복사하지 않음 |
| 탈퇴·계정 삭제 | 해당 Membership 회수·선택 상태 정리·Link/Share 공개 회수·ownerOnly 전환. 계정 삭제는 전체 소속·세션·개인 기록/파일·인증 제거와 actor 익명화·삭제 outbox 포함 |
| 브랜드·암장·세팅·공지 변경 | 해당 저장 집합·버전·CatalogRevision(운영 데이터)·교체 이미지 정리 작업 원자 반영. 브랜드와 암장 폼은 서로 독립 commit |
| 변환/이동 결과 등록 | Asset 세대·삭제 marker·대상 개인 기록 존재를 다시 검사. 검증한 object 등록/포인터 변경과 임시본/이전 사본 정리 작업 함께 저장. 무효 결과는 정리만 수행 |

탈퇴는 해당 크루의 공동 직접 파일 공유도 회수하며 개인 기록과 무관한 보관 파일은 남긴다. 계정 삭제에서 남겨야 하는 공동 원본은 actor를 익명화하고 개인 계정 참조를 제거하므로 FK cascade로 공동 방문이 지워지지 않게 한다.

## 10. 조회·파생값과 검증 경계

- 일정/기록 월 목록은 UTC 범위와 요청 IANA 시간대로 읽으며 식별자·정렬 key를 반환한다. 입력 시간대 날짜 비교와 조회 시간대 날짜 표시를 같은 저장 문자열로 혼합하지 않는다.
- 전체 기록 목록은 PersonalRecord/현재 CrewVisit의 projection이며 연결 중복 제외 순서·대표 시각은 [S08](../../docs/functional-spec.md#s08-기록-목록--전체--내-방문--크루-방문) 원본을 따른다. 별도의 복제 VisitCount 원본 없음.
- 통계는 현재 PersonalRecord/GradeCount에 의해 계산한다. 계산 캐시를 도입하면 record revision과 요청 범위를 key로 하고 수정·삭제/권한 변경 시 무효화한다. 캐시가 개인 데이터 보존 이력으로 남지 않게 한다.
- 추천 응답은 newWallRatio(number 또는 null), calculatedParticipantCount, totalWallCount와 입력 revision을 반환한다. revision은 일정 version·응답 revision·catalog revision·조회한 방문 자료 갱신 지표로 구성하며 비공개 개인 방문 세부값을 응답에 넣지 않는다.
- 실시간 권한 회수는 Membership·Link·Attachment/Share의 현재값을 읽는 API/파일 전달 경로에 적용한다. 클라이언트 캐시·발급 당시 signed URL만 권한 검사로 사용하지 않는다.

설계 확인 시 T02/T06/T08/T09/T12/T23/T25/T38~T47/T52/T55/T57/T60/T65/T72/T74의 중복·충돌·보존 사례와 [FR 검증 연결](spec.md)을 대조한다. 실제 실행 증거는 후속 검증 기록에 남긴다. 이 문서 작성만으로 트랜잭션·성능·FFmpeg·pg-boss·기기 운동 복원 동작이 검증됐다고 표시하지 않는다.

도메인·HTTPS·백업·복구·외부 저장소 업체는 [기술 명세의 후속 운영 범위](../../docs/technical-spec.md#6-기능-개발-이후에-다룰-운영-준비)로 남긴다. 운동 시작 UI 미정은 현재 데이터/API 설계를 막지 않지만 사용자 강제 종료 판정은 실제 기기 확인이 필요하다.

## 수신 목록·읽음 저장 — C09

NotificationRecipient.state는 발송 대상 처리 상태다. 사용자 읽음은 별도 readAt(nullable UTC)으로 저장하고, receivedAt·계정별 수신 sequence를 추가한다. unique(accountId,sequence), 조회 인덱스(accountId,receivedAt DESC,id DESC), 안 읽은 행 인덱스(accountId,sequence) WHERE readAt IS NULL을 사용한다. 같은 사건/계정 unique는 푸시와 목록 모두에 중복 수신 행을 막는다. 표시 크루명/내용은 현재 권한의 projection이며 개인 과거본문·파일 자료를 복제하지 않는다.

계정별 NotificationInboxAggregate는 수신 sequence 발급·목록 revision을 관리한다. 수신 발급과 읽음 경계 포착은 같은 계정 잠금으로 직렬화한다. 읽음/신규 수신·접근 변경은 조회 revision에 반영한다. 회원 상태도 저장 직전에 재확인한다. 전역 크루 선택은 이 집합의 필터가 아니다.

NotificationReadReceipt는 accountId·operation/path·Idempotency-Key·요청 hash·최초 readThrough(sequence)·readAt·처리 상태만 보관한다. 수신 행의 내용·응답 사본은 저장하지 않는다. 최초 경계 receipt를 먼저 확보한 뒤, 그 경계 이하의 현재 허용된 행 변경과 처리 성공 등록을 같은 TX에 묶는다. 실패하면 행 변경은 롤백하고 재시도는 같은 경계를 사용한다. 재요청 성공 응답의 unreadCount는 현재 허용된 미읽음 수로 다시 계산하며 새 수신을 읽음 처리하지 않는다. 단건 최초 readAt은 수신 행에 유지한다.

전체 읽음은 페이지 단위 TX로 쪼개지 않는다. 새 sequence는 경계보다 커서 이번 실행에 포함되지 않는다. 발송 실행은 독립적으로 현재 가입·종류 설정·연결 기기·OS 전달 가능 조건을 검사한다. 발송 억제/실패로 수신 행을 없애거나 읽음 처리하지 않는다. 탈퇴/제외한 크루는 조회 projection과 읽음 대상에서 즉시 제외하고, 계정 삭제 시 해당 수신/receipt를 제거한다. 정책·프로토콜 의미는 [C09 원본](../../packages/contracts/conventions.md#수신-목록과-읽음--c09)을 따른다. 실제 테이블·잠금·TX 검증은017 후속이며 이 설계가 DB 실행 증거는 아니다.

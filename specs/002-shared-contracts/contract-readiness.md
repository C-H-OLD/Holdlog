# 계약별 착수 준비 대조

2026-10-07 · [상위 #29](https://github.com/trycatch98/Holdlog/issues/29) · 에이전트 원본 대조. 담당 개발자 간 합의·제품 연동 완료를 뜻하지 않는다.

형식 원본은 [OpenAPI](../../packages/contracts/openapi.json)·[Runtime](../../packages/contracts/runtime.schema.json), 의미 원본은 [conventions](../../packages/contracts/conventions.md)·[논리 모델](data-model.md)이다. 아래는 찾기 위한 연결이며 필드·권한표·계산식을 복사하지 않는다. 계약별 소비 기능·정책 절·기존 T번호는 [C01~C12 책임표](contract-scope.md#정해야-할-계약)가 원본이다.

[이번 준비 검사 결과](../../docs/history/development/002-readiness-verification.md)에서 실제 수행 범위와 남은 검사를 확인한다.

## 현재 원본과 소비 증거

82 HTTP 경로·112 operationId·112 HTTP 자료형·22 Runtime 정의를 대조했다. 공통 C01은 모든 작업에 적용하며 x-global-contracts로 표시된다. 각 operation의 x-contracts·tags·x-policy-sources는 계약·소비 기능·정책 파일 연결이다. 파일 존재만으로 정책 의미가 증명되지는 않는다.

[001 소비 증거](quickstart.md#001-기반에서-확인한-범위)는 같은 생성물을 이용한 타입·Node/Chrome 예제와 대표 Hermes 입력 검사다. FE는 `apps/mobile/src/development/contract-check.ts`·`apps/admin/src/api/contracts.ts`, 공통 FE/BE typed 소비는 `packages/contracts/test/frontend-consumer.ts`·`backend-consumer.ts`에 있다. 제품 서버 controller·업무 DB·최종 UI 소비는 후속 기능이 구현한다. 현재 앱 checks의 environment 파일을 업무 계약 소비로 계산하지 않는다.

## C번호·자료·예제·FR 연결

예제 ID는 [examples.json](../../packages/contracts/examples.json)의 합성 형식 검사이며 정상 저장·권한·동시 변경을 실행한 결과가 아니다. Runtime 열은 직접 관련된 정의의 찾기 안내다. 공통 식별·실패 형식은 모든 계약에서 함께 사용한다.

| 계약 | HTTP 작업 수 | 관련 Runtime | 현재 예제 ID | 002 요구사항 |
|---|---:|---|---|---|
| [C01 공통 요청·실패·동시 변경](contract-scope.md#정해야-할-계약) | 전체 공통 | —（HTTP 공통 형식） | version-conflict | FR-001·003·005 |
| [C02 계정·인증·권한](contract-scope.md#정해야-할-계약) | 13 | PendingInvite | own-profile | FR-001·002·003·005 |
| [C03 크루·가입·초대·선택](contract-scope.md#정해야-할-계약) | 17 | PendingInvite, Route | invite-preview | FR-001·002·003·005 |
| [C04 암장·난이도·벽·세팅](contract-scope.md#정해야-할-계약) | 15 | —（HTTP 운영 자료） | zero-grade | FR-001·002·004·005 |
| [C05 일정·응답·방문 생성 사실](contract-scope.md#정해야-할-계약) | 11 | DomainEvent | schedule-input | FR-001·002·003·004·005 |
| [C06 개인 기록·값·공개 대상](contract-scope.md#정해야-할-계약) | 14 | ClimbCount, WorkoutDraft, WorkoutLifecycle | zero-grade, missing-climbs, workout-finish | FR-001·002·003·004·005 |
| [C07 실제 참석·연결·분리·삭제](contract-scope.md#정해야-할-계약) | 19 | DomainEvent | existing-link | FR-001·002·003·004·005 |
| [C08 미디어·저장소·이미지](contract-scope.md#정해야-할-계약) | 41 | MediaJob, StorageObjectRef, StorageStart/Append/Complete/Cancel/Read/Stat/Delete/Result | file-upload, announcement | FR-001·002·003·005 |
| [C09 알림·기기·예약](contract-scope.md#정해야-할-계약) | 12 | NotificationJob, PushPayload | settings, notification-inbox-all-crews, notification-reentry-read, notification-single-read-input, notification-single-read-result, notification-all-read-input, notification-all-read-result, notification-new-after-read-all, notification-read-failure, push-destination | FR-001·002·003·005·006 |
| [C10 조회·시간대·집계·추천](contract-scope.md#정해야-할-계약) | 10 | —（HTTP 조회·계산） | calendar-personal-no-crew | FR-001·004·005 |
| [C11 공동 이력·작업 사건](contract-scope.md#정해야-할-계약) | 21 | DomainEvent, MediaJob, NotificationJob | shared-history | FR-001·002·003·005 |
| [C12 화면 진입·기기별 상태](contract-scope.md#정해야-할-계약) | 14 | Route, WorkoutDraft/Lifecycle/Display, AnnouncementSuppression, PendingInvite, PushPayload, NoticeEntry, OpenSourceManifest | invite-preview, announcement, workout-finish, notification-inbox-all-crews, notification-reentry-read, notification-single-read-input, notification-single-read-result, notification-all-read-input, notification-all-read-result, notification-new-after-read-all, notification-read-failure, workout-display-records, workout-display-other-tab, notice-offline, push-destination, selected-date-route, notification-inbox-route | FR-001·005·006 |

거절 예제는 기존3개와 수신 계정 주입·잘못된 수신 시각·음수 안 읽음 수의 형식 거절이다. 실제 현재 가입 검사·주체별 projection·원자성은 후속 서버 통합 검사로 증명한다.

## 작업별 남은 의미·실행 검사

| 범위 | 현재 확인 | 후속 확인과 차단 범위 |
|---|---|---|
| C01~C08·C10~C11 | 식별·소유 관계·공개 projection·UTC/IANA·null/0·version·멱등·TX/outbox 경계를 conventions/모델과 연결 | 각 기능의 FR/T번호로 실제 권한·변경 실패·재요청·동시 변경을 확인. 합성 DTO 통과로 계산/트랜잭션 완료 처리 금지 |
| C09 | 설정·푸시·수신 조회·단건/전체 읽음 계약2.1.0 | [#31](https://github.com/trycatch98/Holdlog/issues/31): 누르면 읽음·설정과 무관한 목록 저장을 확정하고 조회/실패/재요청/동시 수신 경계를 정의.017에서 실제 권한·저장·UI·푸시 검증 |
| C12 | [#32](https://github.com/trycatch98/Holdlog/issues/32): 승인05.07 및 화면45개 집합 대조 준비 | 실제 화면 진입/복귀·네이티브 동작은003/017. 운동 시작 A/B는 계속 미정. 경로 추가가 UI 구현은 아님 |
| FE/BE 추가 소비 | 기존001 예제/생성 소비 재사용 | [#33](https://github.com/trycatch98/Holdlog/issues/33)·[#34](https://github.com/trycatch98/Holdlog/issues/34)·[#35](https://github.com/trycatch98/Holdlog/issues/35): 새 공통 예제·생성물을 모바일/관리자/서버 checks에서 소비 |
| 최종 전달 | FR별 작업 연결 및 원본 대조 | [#36](https://github.com/trycatch98/Holdlog/issues/36): 계약 구현 PR #37/#38 병합 기준과 기능별 착수 조건 전달. 최종 이슈 완료 상태는 #36/#29 |

미정 제품 동작은 [open-questions](../../docs/open-questions.md) 한곳에서 관리한다. 알림의 보존·탈퇴 공개 경계는 기존 즉시 권한 회수 정책을 따르며 새로운 보존 정책을 계약 형식으로 몰래 확정하지 않는다. 다른 계약의 기능별 계획은 해당 C번호의 대조 범위를 확인해 진행할 수 있다. 공통 파일은 SHARED 담당이 모으고 기능별 UI·서비스 구현은 [배정 기준](../development-roles.md#여러-개발자의-작업-배정)에 따라 분리한다.

## FR·SC와 작업 대조

| 기준 | 연결 작업 | 현재 증거/완료 판단 |
|---|---|---|
| FR-001 | T001·T002·T004·T005·T009 | 원본/책임/형식 연결. 새 C09 형식·의미·예제 연결, 제품 실행 검사 후속 |
| FR-002 | T002·T004·T008·T009 | 논리 모델 소유/관계 연결. 새 읽음 모델·BE 생성 소비 확인, 실제 TX 후속 |
| FR-003 | T002·T004·T006·T009 | TX/멱등/권한 회수 원본 연결. 의미별 후속 실행 검사 구분 |
| FR-004 | T002·T006·T009 | UTC/IANA·기간·null/0·중복 제외 원본 연결. 서비스 계산 검사 후속 |
| FR-005 | T002·T006·T007·T008·T009 |001 공통 소비 재사용. 새 예제·세 앱 typed/값 소비 확인 |
| FR-006 | T001·T002·T003·T010 | 알림 제품 결정 반영, 운동 시작/외부 검사는 미정·후속으로 구분 |
| SC-001~003 | T009·T010 | 002 계약 형식/예제/소비 검사 확인 및 미수행 제품 검사를 구분해 전달. 제품 실행 통과 선언 아님 |
| SC-004 | T002·T005·T010 | 계약 책임표·현재45화면 집합 및 병합 기준을 전달 |

모든 FR·SC에 작업이 있다. 미연결 작업은 없다. C09 제품 결정 대기는 해소했다. T003~T009의 계약/소비 검사와 T010의 병합 기준 전달을 수행했다. 요구사항 품질 체크16개 통과는 구현 완료와 별개다.

## HTTP operationId 대조 색인

아래는 현재 원본의 x-contracts별 operationId 색인이다. 여러 C번호를 사용하는 작업은 반복 표시되므로 수를 더해 전체 개수로 사용하지 않는다. 원본 변경 시 이 대조도 함께 갱신한다. 공통 C01은 모든112개 작업이다.

### C02

`createLoginChallenge`, `login`, `refreshSession`, `logout`, `adminLogin`, `adminSession`, `adminLogout`, `getMyProfile`, `editMyProfile`, `deleteAccount`, `previewAccountDeletion`, `registerDevice`, `unregisterDevice`.

### C03

`deleteAccount`, `getSelectedCrew`, `selectCrew`, `myCrews`, `createCrew`, `getCrew`, `crewMembers`, `resolveInvite`, `joinCrew`, `getCrewInvite`, `transferAdministrator`, `previewAccountDeletion`, `previewLeaveCrew`, `leaveCrew`, `memberRecords`, `memberRecord`, `memberStatistics`.

### C04

`listBrands`, `searchGyms`, `gymDetail`, `adminListBrand`, `adminCreateBrand`, `adminGetBrand`, `adminEditBrand`, `adminListGym`, `adminCreateGym`, `adminGetGym`, `adminEditGym`, `adminListSettings`, `adminCreateSetting`, `adminEditSetting`, `adminCancelSetting`.

### C05

`listSchedules`, `createSchedule`, `scheduleCalendar`, `getSchedule`, `editSchedule`, `cancelSchedule`, `respondToSchedule`, `recommendGyms`, `createCrewVisit`, `revertSchedules`, `revertVisits`.

### C06

`myRecords`, `createPersonalRecord`, `myRecord`, `editPersonalRecord`, `deletePersonalRecord`, `recordCandidates`, `createLinkedRecord`, `linkExistingRecord`, `unlinkRecord`, `myStatistics`, `memberRecords`, `memberRecord`, `memberStatistics`, `finishWorkout`.

### C07

`deleteAccount`, `previewAccountDeletion`, `previewLeaveCrew`, `leaveCrew`, `editPersonalRecord`, `deletePersonalRecord`, `createCrewVisit`, `crewVisit`, `editCrewVisit`, `deleteCrewVisit`, `recordCandidates`, `createLinkedRecord`, `linkExistingRecord`, `unlinkRecord`, `browseRecords`, `recordCalendar`, `revertSchedules`, `revertVisits`, `unshareDirectCrewMedia`.

### C08

`editMyProfile`, `deleteAccount`, `leaveCrew`, `myRecord`, `editPersonalRecord`, `deletePersonalRecord`, `crewVisit`, `deleteCrewVisit`, `memberRecord`, `adminCreateAnnouncement`, `adminEditAnnouncement`, `adminDeleteAnnouncement`, `createProfileImageDraft`, `createAdminImageDraft`, `myMediaLibrary`, `startMedia`, `mediaInfo`, `deleteMedia`, `retryMedia`, `completeMedia`, `uploadHead`, `uploadPatch`, `uploadDelete`, `readThumbnail`, `readContent`, `startMediaAdmin`, `mediaInfoAdmin`, `deleteMediaAdmin`, `retryMediaAdmin`, `completeMediaAdmin`, `uploadHeadAdmin`, `uploadPatchAdmin`, `uploadDeleteAdmin`, `readThumbnailAdmin`, `readContentAdmin`, `readAnnouncementImage`, `unshareDirectCrewMedia`, `reuploadMedia`, `uploadOptions`, `reuploadMediaAdmin`, `uploadOptionsAdmin`.

### C09

`logout`, `createSchedule`, `editSchedule`, `cancelSchedule`, `respondToSchedule`, `notificationSettings`, `editNotificationSettings`, `registerDevice`, `unregisterDevice`, `myNotifications`, `markNotificationRead`, `readAllNotifications`.

### C10

`searchGyms`, `listSchedules`, `scheduleCalendar`, `recommendGyms`, `myRecords`, `browseRecords`, `recordCalendar`, `myStatistics`, `memberRecords`, `memberStatistics`.

### C11

`createSchedule`, `editSchedule`, `cancelSchedule`, `deletePersonalRecord`, `createCrewVisit`, `editCrewVisit`, `deleteCrewVisit`, `createLinkedRecord`, `linkExistingRecord`, `unlinkRecord`, `historySchedules`, `revertSchedules`, `historyVisits`, `revertVisits`, `deleteMedia`, `retryMedia`, `completeMedia`, `deleteMediaAdmin`, `retryMediaAdmin`, `completeMediaAdmin`, `unshareDirectCrewMedia`.

### C12

`resolveInvite`, `joinCrew`, `getCrewInvite`, `finishWorkout`, `appAnnouncements`, `adminAnnouncements`, `adminCreateAnnouncement`, `adminAnnouncement`, `adminEditAnnouncement`, `adminDeleteAnnouncement`, `readAnnouncementImage`, `myNotifications`, `markNotificationRead`, `readAllNotifications`.


## 병합 기준과 다음 작업 전달

[PR #37](https://github.com/trycatch98/Holdlog/pull/37)의 기반 대조/Route와 [PR #38](https://github.com/trycatch98/Holdlog/pull/38)의 수신/읽음·생성 소비가 develop에 병합됐다. 계약2.1.0은 [manifest](../../packages/contracts/generated/manifest.json)의 한 원본으로 맞춘다. 코드·문서 최종 전달 후 #36/#29에서 필수 작업/PR·미수행 범위를 확인해002 완료를 판단한다. 사용자 제품 결정·독립 에이전트·CodeRabbit 검토를 반영했으며 사람 담당 배정/실제 연동 승인과 구분한다.

| 다음 작업 | 독립적으로 준비할 범위 | 실제 완료 확인의 선행 |
|---|---|---|
|003 공통 화면/탐색 | C01/C02/C03/C12의 공통 부품·Route 소비, 화면 주 담당의 조립 기준 |001 기반.004/005 연결과 실제 화면 적용은 후속 |
|004 계정/프로필 |FE 입력/세션 소비와 BE 인증·보안 구현을 같은 계약 예제로 분할 |003·외부 제공자 설정,005/017/021 연동 |
|006 운영 데이터 |BE 운영 자료/초기 데이터와 admin FE 폼을 C02/C04/C08 계약으로 분할 |004 관리자 인증,007/009/016 실제 데이터 연동 |
|나머지003~021 |자기 C번호의 원본으로 상세plan/tasks·모의 소비·독립 영역 구현 준비 |[정확한 선행표](../README.md#선행-관계)와 기능별 FR/T의 실제 연동 검사 |

공통 원본·DB migration·루트 설정 변경은 한 SHARED 담당이 모은다. 앱/서버/관리자 및 서로 다른 화면·기능 파일로 작업을 나누고, 공유 화면은 주 담당이 조립한다. 사람은 아직 지정하지 않았다. 역할·작업 범위·GitHub 선행 관계를 먼저 정하고 각 작업의 별도 브랜치/폴더와 SPECIFY_FEATURE_DIRECTORY·SPECIFY_FEATURE_NO_PERSIST=1을 사용한다. 공용 선택 파일과 새 스펙 번호는 동시에 수정하지 않는다. [배정 기준](../development-roles.md#여러-개발자의-작업-배정)을 따른다.

017의 새 수신/읽음은 실제 설정 꺼짐·클릭/실패 복원·재진입·동시 새 수신/동일 키 재시도·현재 가입 회수·계정 주체·원자 저장·목표 진입·푸시 분리를 검사한다. 모든 기능의 계약 형식 통과가 제품 동작 완료는 아니다. 운동 시작A/B만 계속 미정이며 확정 운동 본체와 분리한다. 배포/물리 서버/실제 휴대폰·업무 API/DB 기능은 후속 범위다.

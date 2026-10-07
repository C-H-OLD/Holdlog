# Feature Specification: 개발 기반 구성

**기능 선택**: `001-development-foundation` (Git 브랜치와 별개. 구현 브랜치는 별도 선택)

**Created**: 2026-10-06

**Status**: 로컬 실행·연결·재현 검증과 T032 요구사항 대조 완료 · 후속 전달·전체 병합과 완료 상태는 상위 #1에서 관리

**Input**: 승인한 Spec Kit·Living Spec 운영 방식으로 개발을 시작하기 위한 첫 범위를 정리한다.

구조·도구·계약 소비·검증 설계는 [plan.md](plan.md), 역할별 작업·검사·전달은 [tasks.md](tasks.md)에 있다. 공통 설치·설정은 [공통 기반 검증](../../docs/history/development/001-shared-foundation-verification.md), 서버·DB·worker는 [서버 기반 검증](../../docs/history/development/001-backend-foundation-verification.md), 관리자 웹은 [웹 기반 검증](../../docs/history/development/001-admin-foundation-verification.md)을 확인했다. iOS/Android 전용 앱 실행, 실제 브라우저·가상 기기의 로컬 API 연결, 독립 작업 폴더의 설치·검사 재현과 비밀 경계는 [로컬 검증 기록](../../docs/history/development/001-foundation-verification.md)에 있다. T032의 최종 대조는 아래에 기록하며, T033 전달과 모든 필수 작업의 병합·완료 증거는 [상위 #1](https://github.com/trycatch98/Holdlog/issues/1)에서 모아 전체 완료를 판단한다.

001의 완료 범위는 개발 컴퓨터의 서버·DB·worker·관리자 웹과 iOS 시뮬레이터·Android 에뮬레이터의 실행·연결·검사다. 실제 휴대폰 검사와 물리 서버 배포·접속은 완료 조건에 포함하지 않으며, 필요한 후속 기능·운영 범위에서 계획한다.

이 스펙은 개발 환경의 요구사항 원본이다. 제품 동작을 새로 정하지 않는다. 기술 선택 원본은 [기술·운영 명세](../../docs/technical-spec.md), 실제 준비 항목은 [준비 체크리스트](../../docs/setup-checklist.md)다.

## User Scenarios & Testing

### User Story 1 - 개발 작업 시작 (Priority: P1)

개발자는 프로젝트 안내에 따라 모바일·관리자 웹·서버의 개발 환경을 준비하고 각각 실행할 수 있다.

**Why this priority**: 이후 제품 기능을 구현하고 실제 결과를 확인할 출발점이다.

**Independent Test**: 문서에 적힌 준비·실행 절차로 각 개발 대상을 시작하고 실행 상태를 확인한다.

**Acceptance Scenarios**:

1. **Given** 필요한 개발 도구와 설정이 준비됨, **When** 안내된 설치·실행 절차를 수행함, **Then** 각 개발 대상의 실행 상태를 확인할 수 있다.
2. **Given** 필수 설정이 없음, **When** 개발 대상을 실행함, **Then** 필요한 설정을 식별할 수 있고 준비 완료로 오인하지 않는다.

### User Story 2 - 앱과 서버의 연결 확인 (Priority: P1)

개발자는 모바일·관리자 웹과 개발용 서버의 연결을 확인하고 계약을 바탕으로 후속 기능 작업을 시작할 수 있다.

**Why this priority**: 화면만 실행되는 상태와 실제 서버에 연결된 상태를 구분해야 한다.

**Independent Test**: 각 소비자에서 개발용 서버에 요청하고 정한 응답을 받는지 확인한다.

**Acceptance Scenarios**:

1. **Given** 개발용 서버가 실행됨, **When** 모바일 또는 관리자 웹에서 연결을 확인함, **Then** 동일한 계약 기준으로 결과를 확인할 수 있다.
2. **Given** 서버를 연결할 수 없음, **When** 연결을 확인함, **Then** 실패를 식별하며 제품 화면·상태를 임의로 추가하지 않는다.

### User Story 3 - 변경 결과 검사 (Priority: P2)

개발자와 에이전트는 안내된 명령으로 코드·문서 변경 결과를 검사할 수 있다.

**Why this priority**: 이후 기능 구현마다 검사를 재사용한다.

**Independent Test**: 관련 검사 명령을 실행하고 성공·실패 상태와 원인을 확인한다.

**Acceptance Scenarios**:

1. **Given** 준비된 개발 기반, **When** 안내된 자동 검사를 실행함, **Then** 검사 결과와 실패 원인을 확인할 수 있다.
2. **Given** 실기기·계정 등 외부 준비가 미완료임, **When** 완료 상태를 정리함, **Then** 로컬 검사와 아직 수행하지 않은 외부 검사를 구분하며, 범위 밖 외부 준비는 001 완료를 막지 않는다.

### Edge Cases

- 필요한 도구나 설정이 없으면 준비되지 않은 항목을 알려주고 정상 실행으로 표시하지 않는다.
- 개발 기기에서 서버에 접근할 수 없으면 연결 환경을 확인하며 제품 요구사항을 바꾸지 않는다.
- 기존 문서·사진·스펙을 개발 환경 생성 과정에서 덮어쓰거나 잃지 않는다.
- 실제 계정·비밀 설정·개발 도구 설치 파일을 공유 저장소에 포함하지 않는다.

## Requirements

### Functional Requirements

- **FR-001**: 개발자는 모바일·관리자 웹·서버·공통 계약의 작업 위치와 역할을 구분할 수 있어야 한다.
- **FR-002**: 로컬 서버·관리자 웹·모바일 가상 기기의 실제 준비·실행 명령과 필요한 설정이 안내되어야 한다.
- **FR-003**: 개발용 데이터 저장 환경을 구성하고 실행 상태를 확인할 수 있어야 한다. 운영 데이터는 사용하지 않는다.
- **FR-004**: iOS 시뮬레이터·Android 에뮬레이터·관리자 웹에서 로컬 개발용 서버와의 연결을 확인할 수 있어야 한다.
- **FR-005**: 대상 사이의 계약 원본을 지정하고 각 소비자가 같은 입력·응답 기준을 사용해야 한다.
- **FR-006**: 개발자와 에이전트가 코드·문서 검사 명령을 실행하고 성공·실패를 구분할 수 있어야 한다.
- **FR-007**: 개발 설정은 예시와 실제 비밀값을 구분하고 공유 자료에 비밀값을 포함하지 않아야 한다.
- **FR-008**: 작성·설계·구현·로컬 검증·실기기 검증 상태를 구분해야 한다.
- **FR-009**: 기존 승인 문서·시안·스펙의 파일과 연결을 보존해야 한다.

### Key Entities

- **개발 대상**: 모바일·관리자 웹·서버. 각각 실행과 연결 확인이 필요하다.
- **개발 설정**: 실행에 필요한 공개 예시와 로컬 비밀값. 공유 여부를 구분한다.
- **공통 계약**: 개발 대상이 합의한 입력·응답·거절 조건의 원본.
- **검증 결과**: 수행한 검사·결과·미수행 항목. 준비 완료와 제품 기능 완료를 구분한다.

## Success Criteria

### Measurable Outcomes

- **SC-001**: iOS 시뮬레이터·Android 에뮬레이터·관리자 웹·로컬 서버 각각에 대해 실제 실행 명령과 성공 결과를 확인한다.
- **SC-002**: iOS 시뮬레이터·Android 에뮬레이터·관리자 웹의 로컬 서버 연결 성공과 연결 불가 상황을 각각 확인한다.
- **SC-003**: 개발용 저장 환경을 실행·중지·재시작하고 준비 절차를 재현할 수 있다.
- **SC-004**: 코드·문서 검사 명령이 성공·실패 상태를 반환하고 재실행할 수 있다.
- **SC-005**: 검사 기록에서 수행한 로컬 검사와 범위 밖 외부 검사를 구분한다. 외부 계정·실제 휴대폰·물리 서버 확인은 후속 범위로 남기며 001 완료 조건에 포함하지 않는다. 수행하지 않은 검사를 통과로 표시하지 않는다.
- **SC-006**: 기존 문서·시안의 연결 검사와 현재 화면 번호 검사가 통과한다.

## 최종 요구사항·증거 대조 — T032 / #14

대조일: 2026-10-07 · 기준 main `3dae04f523e3d632b89429baa475608fe1cdd5ef`.[#10](https://github.com/trycatch98/Holdlog/issues/10)의 T017·T022–T024는 [PR #22](https://github.com/trycatch98/Holdlog/pull/22), [#11](https://github.com/trycatch98/Holdlog/issues/11)의 T027–T030은 [PR #23](https://github.com/trycatch98/Holdlog/pull/23)에서 병합됐다. 선행 작업의 체크와 실제 수행 기록을 대조했다. #10 실행 이후 이 기준까지 실행 코드 변경은 #11의 모바일 export 설정 로드 보완이며, 같은 작업의 양쪽 production export 재검증이 기록돼 있다. 기존 네이티브 빌드와 실제 Hermes 연결 증거를 유지하며 이번 대조에서 네이티브 빌드·DB 중단을 반복하지 않았다.

아래의 “확인”은 링크된 실제 수행 범위에 대한 판단이다. 전체 기능 완료·제품 동작 완료 또는 기록하지 않은 검사의 통과를 뜻하지 않는다.

| 요구사항 | 실제 증거·대조 결과 | 판단·남은 경계 |
|---|---|---|
| FR-001 작업 위치·역할 | [plan의 작업 구조](plan.md#project-structure), [역할 구분](../development-roles.md), workspace의 mobile/admin/server/contracts와 별도 worker 진입점 대조 | 확인. T033의 후속 개발자 전달 완료는 별도 |
| FR-002 실제 명령·설정 | [개발 안내](../../docs/development.md#실행과-완료-확인), [#10 시작·설정 실패](../../docs/history/development/001-foundation-verification.md#실행-환경과-시작설정-실패), [#11 실패·복구](../../docs/history/development/001-foundation-verification.md#t028-설치생성검사실패-후-복구) | 확인. 공개 origin·서버/시험 DB 필수 설정의 누락 실패와 복구를 구분 |
| FR-003 개발 저장 | [서버 기반](../../docs/history/development/001-backend-foundation-verification.md), [#11 DB·worker 재현](../../docs/history/development/001-foundation-verification.md#t028-실제-dbworker-재현), Compose의 개발/시험 DB 분리·고정 이미지·영구 볼륨 | 확인. 합성 행 보존·queue 효과 검사이며 운영 자료·제품 DB 관계·백업 검사는 아님 |
| FR-004 가상 기기·웹 연결 | [#10 실제 연결 표](../../docs/history/development/001-foundation-verification.md#실제-연결-결과), 서버 health와 FE 연결 함수의 정확한 상태/body 검사 | 확인. Chrome·iOS Hermes·Android Hermes 각각 정상200·DB503·API 중단 연결 불가·복구200 |
| FR-005 같은 계약 | [생성 manifest](../../packages/contracts/generated/manifest.json), [#10 계약 소비 대조](../../docs/history/development/001-foundation-verification.md#공통-계약예제-소비-대조), [#11 동일 재생성](../../docs/history/development/001-foundation-verification.md#t028-설치생성검사실패-후-복구) | 확인. 계약1.0.0·원본 해시 일치. Node/Chrome은 공통 예제18개·거절3개, 양쪽 Hermes는 HTTP/runtime 대표 입력2개. T033 전달은 별도 |
| FR-006 코드·문서 검사 | [공통 명령 검증](../../docs/history/development/001-check-commands-verification.md), [#11 설치·실패·복구](../../docs/history/development/001-foundation-verification.md#t028-설치생성검사실패-후-복구), runner의 실패 종료 전파 | 확인. check 회귀56개·lint/typecheck·웹/API build 및 별도 실제 시험 DB10개·skip0. 기본 check는 DB·기기 검사를 대신하지 않음 |
| FR-007 비밀 분리 | Git 제외·공개 예시와 [#11 합성 표식 검사](../../docs/history/development/001-foundation-verification.md#t027-합성-표식과-출력-경계)의 추적 파일·웹/API 출력·모바일 공개 config/양쪽 export·API 응답/로그 대조 | 기록된 경계 확인. APK/IPA·네이티브 빌드 로그 등 미검사 출력은 아래 누락 범위로 유지 |
| FR-008 수행 상태 구분 | [준비 체크리스트](../../docs/setup-checklist.md), [#11 준비 상태 대조](../../docs/history/development/001-foundation-verification.md#t029-준비-상태-대조t030-안내), 단독/mock과 실제 로컬 실행 구분 | 확인. 계정·초기 자료·실기기·물리 서버를 로컬 통과로 바꾸지 않음 |
| FR-009 기존 자료·연결 보존 | [공통 자료 보존](../../docs/history/development/001-shared-foundation-verification.md#기존-자료-보존), [#11 자료 보존](../../docs/history/development/001-foundation-verification.md#t029-준비-상태-대조t030-안내), 이번 문서·계약 정적 검사 | 확인. 승인 명세·시안·계약 원본/생성물·lockfile을 수정하지 않으며 DB 볼륨 삭제 없음 |
| SC-001 대상별 실행 | [#7 양쪽 전용 앱 빌드·설치·시작](../../docs/history/development/001-foundation-verification.md#모바일-기반--7--t014t015t021), [#10 시작 결과](../../docs/history/development/001-foundation-verification.md#실행-환경과-시작설정-실패) | 확인. iOS CLI 창 활성화 실패와 권한에 의존하지 않는 종료0 재빌드·simctl 실행을 구분 |
| SC-002 연결 성공·불가 | [#10 실제 연결 표](../../docs/history/development/001-foundation-verification.md#실제-연결-결과) | 확인. 세 소비자 모두 성공/불가 확인. API 중단 시나리오이며 별도 인터넷 차단·실기기 네트워크는 미수행 |
| SC-003 저장 시작·중지·재시작 | [#10 합성 행 보존](../../docs/history/development/001-foundation-verification.md#실제-연결-결과), [#11 독립 폴더 DB·worker 재현](../../docs/history/development/001-foundation-verification.md#t028-실제-dbworker-재현) | 확인. stop/up 후 같은 행1개·worker 정상 재시작. 볼륨 삭제·재해 복구 아님 |
| SC-004 검사 성공·실패·재실행 | [#11 실패 후 복구 표](../../docs/history/development/001-foundation-verification.md#t028-설치생성검사실패-후-복구), [runner 검사](../../docs/history/development/001-check-commands-verification.md#수행한-검사) | 확인. stale 생성물·타입 오류·설정 누락은 비정상 종료, 원복 후 정상 검사 |
| SC-005 로컬·외부 구분 | [#10 후속 범위](../../docs/history/development/001-foundation-verification.md#검사와-후속-범위), [#11 준비 상태 대조](../../docs/history/development/001-foundation-verification.md#t029-준비-상태-대조t030-안내) | 확인. 실제 휴대폰·물리 서버 배포·외부 계정은 001 완료 범위 밖이며 미정/미확인/미수행 유지 |
| SC-006 기존 링크·화면 번호 | T028·T030의 정적 검사와 이번 `/usr/bin/python3 scripts/check-docs.py`·`scripts/check-contracts.py`·`git diff --check` | 확인. 문서 링크·JSON·모바일41개/88상태·웹3개/5상태 일치. 제품 기능 검사를 뜻하지 않음 |

### 누락 범위와 상위 #1 전달

- FR·SC의 필수 로컬 실행·연결·DB/worker 재시작·설치 재현·실패 복구 증거는 위 원본에서 확인했다. 이번 감사가 기존 수행 결과를 새 실행으로 표시하지 않는다.
- 로컬 출력 중 APK/IPA와 네이티브 빌드 로그의 합성 비밀 표식 검사는 미수행이다. #7의 네이티브 실행 성공만으로 해당 미검사 범위를 통과로 바꾸지 않는다. FR-007의 확인은 #11이 실제 검사한 공개 config·양쪽 Hermes export·웹/API 출력·로그 범위다. 해당 네이티브 출력의 비밀 경계를 요구하는 후속 기능·서명 작업에서는 별도 검사와 증거가 필요하다. 외부 서버 로그·제품 로그인/파일/푸시 출력도 미검사다.
- 계약의 형식·HTTP 구조·대표 입력 이식성과 개발 health 연결은 제품 인증/권한·제품 DB 관계/트랜잭션·업로드/Range bytes의 검증이 아니다. 실제 관리자 계정과 HTTPS/Secure/CSRF는004, 초기 암장/세팅 자료는006, 지도는007, 미디어/바이트는011, 기기 푸시는017 등 해당 후속 범위로 전달한다. 모바일 공통 예제18개 전체 실행도 미수행으로 유지한다.
- 물리 서버 사양·실제 휴대폰은 미정, 외부 계정·서명 자격증명·초기 자료는 미확인 또는 후속 구현 전 미수행이다. 범위 밖 준비가 로컬 검증 완료로 바뀌지 않는다.
- T032는 요구사항과 증거 대조 결과를 제출하는 작업이다. T033/#13은 [PR #24](https://github.com/trycatch98/Holdlog/pull/24)로 전달·병합됐다. 이 감사 PR을 포함한 모든 필수 자식 작업의 병합·완료 증거를 모은 뒤 상위 #1에서 001 전체 완료를 판단한다. 이 감사만으로 상위 이슈나 002 계약 전체 합의를 완료 처리하지 않는다.

## Assumptions

- 공통 설치·설정과 서버 이름·앱별 lint/타입 검사 하네스를 준비했다. 모바일·관리자 웹·서버의 단독 실행 및 실제 로컬 연결, 독립 폴더 재현 검사를 확인했다. 제품 화면과 기능의 구현은 이 스펙 범위에서 제외한다.
- 서비스 관리자 초기 계정 준비 절차는 이 범위의 백엔드 준비 작업이다. 관리자 인증 동작과 웹 소비 연동은 [004 계정·인증](../004-identity-profile/spec.md)이 담당하고 방법은 C02 설계에서 정한다. 준비 절차에 공개 관리자 가입이나 새 화면을 추가하지 않는다.
- 개발 도구·기기·서버 사양은 [준비 체크리스트](../../docs/setup-checklist.md)에서 확인한다. 실제 기술 버전과 실행 방법은 구현 계획에서 정한다.
- 로그인·지도·푸시·미디어·제품 화면·제품 데이터 관계의 구현은 후속 기능 범위다. 기반 준비 완료가 해당 기능 완료를 뜻하지 않는다.
- 전체 기능 분리는 [개발 단위 목록](../README.md), 공통 제품 계약의 설계 범위는 [002 공통 계약](../002-shared-contracts/contract-scope.md)에서 관리한다. 이 범위는 계약을 사용하는 실행 기반을 준비하며 계약 상세를 별도로 작성하지 않는다. 제품 화면의 공통 부품은 [003 앱 탐색](../003-app-shell/spec.md)의 범위다.
- 운동 시작 A·B와 기타 보류 사항은 [미결정 사항](../../docs/open-questions.md)을 따른다.

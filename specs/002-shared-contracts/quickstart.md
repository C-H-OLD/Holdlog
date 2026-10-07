# 계약 확인·개발자 전달

작성일: 2026-10-06 · 갱신일: 2026-10-07 · 상태: 계약 설계·정적 검사와001 기반 도구/소비자 검증 전달.002 전체 계약 합의·제품 API/DB/기기 기능 검증은 미완료.

## 지금 실행할 수 있는 검사

아래 Python 정적 검사는 앱·서버·DB 설치 없이 저장소 루트에서 실행한다. 로컬 Python 실행 문제가 있으면 [개발 안내](../../docs/development.md#실행과-완료-확인)의 확인된 대체 명령을 따른다.

```sh
python3 scripts/check-contracts.py
python3 scripts/check-docs.py
git diff --check
```

계약 검사는 로컬 참조·operationId·경로인자·인증 scheme·C01~C12 연결·44개 화면 route·합성 예제 형식·거절 예제를 확인한다. 예제 검사는 현재 예제에서 사용하는 JSON Schema 부분집합만 검사한다. **전체 OpenAPI/JSON Schema 규약 검증기는 아니다.** 001에서 생성 도구/표준 검증기 버전을 고정하고 OpenAPI 규약·생성 타입·FE/BE 소비자 검사를 추가했다. 아래 npm 검사는 Python 부분집합 검사와 별도로 실행한다. 문서 검사는 링크·화면 번호 등의 일치만 확인한다.

Node24.21.0·npm11.19.0을 준비한 뒤 저장소 루트에서 실행한다. 생성물은 수기로 수정하지 않는다.

```sh
npm ci
npm run contracts:check
# 계약 원본 또는 생성 도구 변경 후
npm run contracts:generate
npm run check
```

실제 로컬 앱·웹·API/worker·DB의 설치/실행·공개 설정 이름·실패 복구는 [개발 안내](../../docs/development.md)를 따른다. 루트 check는 실제 DB·브라우저/API 연동·네이티브 빌드·기기 실행을 포함하지 않는다. 시험 DB 검사는 로컬 TEST_DATABASE_URL을 준비해 `npm run test:foundation`으로 별도 실행한다.

## 001 기반에서 확인한 범위

같은 생성 계약1.0.0·Node24.21.0·npm11.19.0을 사용했다. 원본 SHA-256·생성 도구 정확한 버전·입력/출력 목록은 [manifest](../../packages/contracts/generated/manifest.json), 실행별 대조는 [T024 공통 계약·예제 소비 기록](../../docs/history/development/001-foundation-verification.md#공통-계약예제-소비-대조)을 따른다.

- Node/BE 공통 검사: 공통 예제18개 수락·mustReject3개 거절·HTTP 구조 연결13개, 서버 타입 검사/빌드 확인.
- 실제 Chrome: 같은 generated fixtures의 HTTP13개·runtime5개 수락·mustReject3개 거절.
- 실제 iOS/Android Hermes: 타입 지정 HTTP AdminSession·runtime ClimbCount의 대표 합성 입력2개 검사 true. 모바일 전체18개 예제 실행은 미수행.
- [실제 로컬 연결](../../docs/history/development/001-foundation-verification.md#실제-연결-결과): 웹·두 가상 기기에서 health200·DB503·API 중단 실패·복구200 확인. 제품 API 응답 검사는 미수행.

[T030 별도 폴더 재현 기록](../../docs/history/development/001-foundation-verification.md#별도-폴더-재현과-비밀-경계--11--t027t030)은 npm ci·차이 없는 계약 재생성·루트 check 회귀56개·실제 시험 DB 검사10개와 설정 실패/복구·합성 비밀 표식의 출력 검사를 확인했다. 모바일 export의 설정 로드 순서를 보완해 양쪽 번들 생성도 확인했다. 네이티브 바이너리 재빌드·실제 휴대폰 검사는 이 재현 작업에서 수행하지 않았다.

이 증거는001 기반과 해당 계약 소비 범위의 전달이다.002 전체 합의나 제품 권한·업무 DB 트랜잭션·날짜 의미·파일 bytes·네이티브 기능의 완료를 뜻하지 않는다. 외부 계정·서명·물리 서버·실제 기기의 준비 상태는 [준비 체크리스트](../../docs/setup-checklist.md)를 유지한다.001 전체 완료는 [최종 대조·전달 작업](../001-development-foundation/tasks.md#phase-6-공통-마무리)의 증거를 모아 상위 이슈에서 따로 판단한다.

## 같은 원본으로 단독 개발

| 담당 | 입력 자료 | 확인할 결과 |
|---|---|---|
| 프론트 | [API](../../packages/contracts/openapi.json)의 operationId·응답·오류와 [기기 계약](../../packages/contracts/runtime.schema.json) | DTO/mock을 같은 원본에서 생성, 기존 UI 입력 보존·정상빈결과·거절 구분. 새로운 화면/문구를 만들지 않음 |
| 백엔드 | 같은 API와 [모델](data-model.md)·[처리 의미](../../packages/contracts/conventions.md) | 서버 입력 검증·현재 권한·관계 검사·TX/outbox·query projection·파일 요청마다 권한 검사 |
| 합친 뒤 | [예제](../../packages/contracts/examples.json)·각 기능 FR/T 원본 | 예제 형식과 실제 API 결과 일치, 같은 자료의 정상/실패/동시 작업 후 DB·파일·화면 결과 확인 |

Mock이 통과해도 실제 연동을 완료로 표시하지 않는다. 생성된 자료형·mock·검증기를 수기로 별도 수정하지 않는다. 계약 변경은 [담당 절차](../development-roles.md)를 따른다.

## 002 요구사항별 증거

| 요구사항 | 현재 설계/기반 근거 | 남은 제품 실행 확인 |
|---|---|---|
| FR-001 | OpenAPI·runtime·처리 의미의 원본 분리, C01~C12·operationId 참조 검사, 위001의 FE/BE 생성 소비자 타입·예제 검사 | 실제 제품 API의 오류·재요청 검사 |
| FR-002 | 논리 모델의 식별·소유·변경 집합, API owner/public 분리 | 실제 DB 제약·사용자/크루/admin 권한 검사 |
| FR-003 | TX/잠금/receipt/outbox·연결/삭제 명령, Error·거절 예제 | [기존 T06/T42/T47/T57](../../docs/functional-spec.md#9-기능-완료-확인-시나리오) 동시 실행·장애 주입 |
| FR-004 | 시간대·기간·null/0·정렬/cursor·calendar complete, 0/미입력 예제 | [T12/T56/T65/T66/T72](../../docs/functional-spec.md#9-기능-완료-확인-시나리오) 실제 query·집계 비교 |
| FR-005 | 양쪽이 쓰는 합성 HTTP/runtime·거절 예제와 위001의 소비 환경별 결과 | 제품 mock·실제 서버/기기 연동을 같은 예제로 검사하고 범위를 각각 기록 |
| FR-006 | 시작 UI미정·공지승인·기록탭만 표시/겹침허용·외부 준비 분리 | 확정 본체 실기기 검사, 시작UI는 결정 후 별도 확인 |

모든 제품 기능의 FR/T 기대 결과 연결은 [스펙 목록](../README.md#기존-요구사항과-검증-연결)과 각 기능 스펙의 검증 표를 따른다. 기대 규칙을 예제 안내에 다시 쓰지 않는다.

## 실제 연동에서 확인할 경계

- 로그인/refresh/로그아웃/계정삭제: nonce 소비·회전토큰 재사용·전체 인증회수·admin role 분리.
- 크루/일정/방문: 다중크루 권한·초대 확인·관리자이관·동시방문생성·최초생성 사실·현재연결 분리.
- 개인 기록/연결: 새작성+연결 TX, 버전충돌·일치제약, null/[]/0, 참석과개인횟수 분리, 본인/타인 projection.
- 파일: 연결끊김 HEAD/offset재개·전체checksum·코덱·변환, 썸네일/full/Range 즉시회수, 삭제도중늦은완료·저장소 혼재/이동 실패 재개.
- 이력/작업/푸시: 공동변경 또는 이력/outbox 실패→전체rollback, 재시도효과중복방지, 개인과거값 미보관, 예약갱신·발송직전검사.
- 화면/기기: 날짜/파일ID 진입, 초대 로그인이어가기·미설치안내, 공지익명읽기·오늘숨김·삭제, 오프라인고지, 운동진행/강제종료/OS정리·종료저장dedupe.

이는 검사 범위이며 실행 결과가 아니다. 최신 시안과 실제 앱 배치를 비교하고 각 기능의 완료 기록에 실제 명령·자료·결과를 남긴다. 운동 표시줄 겹침은 확정된 허용 조건이므로 수정 결함으로 취급하지 않는다.

## 설계 검토 기록

- 데이터 모델·API 범위·인증/업로드의 서브에이전트 검토 지적을 반영했다.
- 미입력 집합 상태, 익명 참석 유지, 이미지 초안, 설정 집합 버전, owner identity, 달력필터, no-crew 개인접근, 파일권한 표시, route 인자, 재연결 사건, 토큰저장·HEAD오류·작업사건의 연결을 보완했다.
- 정적 검사·001 기반 실행·제품 기능 실행은 구분한다. 생성소비자·개발 health·합성 DB/worker의 실제 결과는 위001 기록을 따르며 제품 API/DB/기기 기능 검증은 후속 범위다.

## 후속003/004/006 전달

세 기능 모두 범위 명세·품질 확인 상태이며 상세 설계·구현·실행 검증 전이다. 아래 원본에서 필요한 계획·작업을 작성하고 사용 계약의 합의 범위와 [선행 관계](../README.md#선행-관계)를 확인한다. 로컬 기반 통과가 제품 기능 착수에 필요한 계약 합의를 자동 확정하지 않는다.

| 전달 대상 | 사용할 기반·원본 | 후속에서 확인할 결과 |
|---|---|---|
| [003 앱 탐색·공통 화면](../003-app-shell/spec.md) | [모바일 실행 안내](../../docs/development.md#모바일-단독-실행)·생성 HTTP/runtime 진입점·[현재 시안](../../docs/screens.md) | 기존 탐색·공통 UI·입력 유지·실패 표시와 시안 적용. 실제 화면·기기 기능 검증 |
| [004 계정·인증](../004-identity-profile/spec.md) | [초기 관리자 준비 절차](../001-development-foundation/contracts/admin-bootstrap.md)·[관리자 웹 실행 안내](../../docs/development.md#관리자-웹-단독-실행)·[개발 연결의 인증 전달 조건](../001-development-foundation/contracts/README.md#개발-연결) | 실제 관리자 계정 생성·principal/session 저장·로그인/만료/회수·권한 거절. 로컬 HTTPS·Secure cookie·Origin/CSRF와 네이티브 로그인 연동 검증 |
| [006 운영 자료](../006-gym-catalog-admin/spec.md) | [관리자 명세](../../docs/admin-spec.md)·[DB 실행 안내](../../docs/development.md#서버dbworker-로컬-실행)·[초기 자료 준비 상태](../../docs/setup-checklist.md) |004 인증과 연결한 운영 자료 권한·저장·실제 초기 암장/벽/세팅 데이터 등록·날짜 의미·모바일 반영. 합성 기반 자료로 초기 데이터 완료를 표시하지 않음 |

권한·트랜잭션·날짜·파일 bytes·네이티브 기능의 기대 결과는 각 기능 스펙과 [실제 연동 경계](#실제-연동에서-확인할-경계)를 따른다. 실행하지 않은 외부 서비스·서명·실제 기기·물리 서버 확인은 필요한 후속 기능·운영 범위에 남긴다.

## 수신 목록·읽음 후속 검사

[추가 계약 범위](contracts/README.md#수신-알림-목록-추가에-따른-남은-계약)를 작성한 뒤 T82~T85에 맞춰 전체 크루/본인만 조회, 날짜/시간 표시, 전체 목록 모두 읽음과 재진입 유지, 실패 시 안 읽음 유지, 새 수신 시 재활성화를 검사한다. 기존 알림 설정·발송 예제는 이 결과를 대신하지 않는다.

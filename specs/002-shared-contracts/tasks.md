# Tasks: 공통 계약 합의와 소비 준비

스펙: [spec.md](spec.md) · 설계: [plan.md](plan.md) · 상위: [#29](https://github.com/trycatch98/Holdlog/issues/29)

002는 계약과 소비 준비의 완료를 판단한다. 제품 API·DB·앱 기능 구현은003~021의 후속 범위다.001의 생성 도구·기반 타입 소비·health/worker/설치 검증은 재구현하지 않고 [기존 증거](quickstart.md#001-기반에서-확인한-범위)를 재사용한다. 체크는 실제 작업과 검사 후에만 변경하며 PR 병합·이슈 종료와 구분한다.

## Phase 1: 기존 기반과 범위 확인

- [x] T001 [SHARED] 기존002/001 증거·열린/닫힌 이슈·공통 파일 담당을 확인하고 `specs/002-shared-contracts/plan.md`에 현재 기준·완료 범위·후속 서비스 구현 제외를 맞춘다. FR-001·FR-006.

## Phase 2: US1 — 같은 원본으로 독립 개발할 계약 준비 (P1)

목표: C01~C12의 필드·정책·소비 기능·미정 범위를 대조하고 현재 화면과 새 알림 계약을 생성 가능한 원본으로 전달한다.
독립 검사: 현재 OpenAPI/Runtime와 원본 정책·45개 화면 등록의 대응, 생성 타입의 입력/응답 소비를 검사한다. 실제 제품 동작 검사는 후속이다.

- [x] T002 [P] [US1] [SHARED] `specs/002-shared-contracts/contract-readiness.md`에 C01~C12의 OpenAPI operationId/Runtime·정책·FR 연결·소비 기능·예제·미확정 범위를 대조한다. `packages/contracts` 원본을 복사하지 않고001 기반 증거와002의 추가 의미 검사를 구분한다. FR-001~006·SC-004.
- [ ] T003 [US1] [SHARED] 사용자 답변으로 개별 알림 진입의 읽음 전환과 OS/종류별 설정의 목록 생성 관계를 `docs/functional-spec.md#notification-inbox`·`docs/open-questions.md`에 확정한다. 권한 회수는 기존B05 원본을 따르고 UI를 추가하지 않는다. 답변 전 관련C09 제품 동작을 임의 확정하지 않는다. FR-006.
- [ ] T004 [US1] [SHARED] T003 이후 `packages/contracts/openapi.json`·`packages/contracts/conventions.md`·`specs/002-shared-contracts/data-model.md`에 본인 전체 수신 조회·단건/전체 읽음의 필요한 계약을 정의한다. 계정ID/크루 필터로 수신 범위를 바꾸지 않으며 발송 상태와 읽음을 분리한다. 전체 목록 읽음·실패/재요청·새 수신 경계·현재 가입 권한 회수를 맞춘다. API/Runtime 원본 버전과 계약 변경 안내를 함께 갱신한다.017 FR-005~006·T82~T85,002 FR-001~003.
- [x] T005 [P] [US1] [SHARED] `packages/contracts/runtime.schema.json`에 승인된05.07 Route를 연결하고 `scripts/check-contracts.py`의44개 하드코딩을 현재 `docs/figma/state.json`에서 도출한45개 화면 집합 대조로 바꾼다. 등록된 화면 누락·추가·중복을 거절하며 기존 화면별 인자 제약을 유지한다. C12·FR-001·SC-004.

## Phase 3: US2 — 실패·경계와 같은 예제로 소비 (P1)

목표: 새 계약의 정상·거절·실패·읽음 상태와 기존 계약의 경계를 FE/BE가 같은 원본으로 소비한다.
독립 검사: 합성 예제의 값/HTTP 구조 검사, 생성물 재현성, 양쪽 타입/값 소비. 서버 저장·권한·원자성 구현 결과로 오인하지 않는다.

- [ ] T006 [US2] [SHARED] T004·T005 이후 `packages/contracts/examples.json`과 `packages/contracts/test/`에 전체 크루/본인 수신·읽음/안 읽음·재진입·전체 읽음·새 수신·잘못된 계정 입력/시각/Route 거절의 계약 예제를 연결한다. 재요청/동시 수신/탈퇴 의미는 원본 검증 항목과 연결하고 schema 검사가 실제 권한/DB 상태 전이를 증명하지 않음을 적는다. 생성물을 `npm run contracts:generate`로만 갱신한다. FR-003~005·T82~T85.
- [ ] T007 [P] [US2] [FE] T006 이후 `apps/mobile/checks/`·`apps/admin/checks/`에서 새 생성 타입/operationId/Route와 기존 소비자의 호환성을 확인한다. 합성 응답·읽음 결과를 typed 소비하고 플랫폼 실제 화면/네이티브 실행은017/003 후속으로 구분한다. FR-005.
- [ ] T008 [P] [US2] [BE] T006 이후 `apps/server/checks/`에서 같은 HTTP 입력/응답·오류·읽음 결과 타입/검증기를 소비해 FE와 동일한 예제를 대조한다. 계정 주체·권한/원자성은017 구현 경계로 남기며 합성 검사로 실제 저장 성공을 표시하지 않는다. FR-002·FR-005.

## Phase 4: 통합 대조와 후속 전달

- [ ] T009 [INTEGRATION] T007·T008 이후 `specs/002-shared-contracts/quickstart.md`와 `docs/history/development/002-contract-verification.md`에 `contracts:check`·문서/계약 정적 검사·전체check·차이 없는 재생성 결과와 FR/SC별 증거·미수행 제품 검사를 기록한다. 기존001 실기기/서비스 미수행 범위도 유지한다. FR-001~006·SC-001~004.
- [ ] T010 [SHARED] T009와 모든 필수 PR 병합 후 `specs/002-shared-contracts/contract-readiness.md`·`specs/README.md`·상위#29에 계약별 검토/소비 범위·독립 착수 조건·기능별 후속 검증을 전달한다. 담당자 미지정과 에이전트 단독 대조를 사람 간 합의로 표시하지 않는다. 미정 운동 시작은 제외하고 미해결 계약은 영향받는 기능만 분리한다. SC-001~004.

## 의존·배정과 병렬 작업

| 작업 | 착수 선행 | 다른 담당에게 전달 | 작업 이슈 |
|---|---|---|---|
| T001 |001 완료 증거·현재develop |002 준비 기준 | [#30](https://github.com/trycatch98/Holdlog/issues/30) |
| T002 | T001 |계약별 대조/누락·소비 범위 | [#30](https://github.com/trycatch98/Holdlog/issues/30) |
| T003·T004 | T001·사용자 제품 결정 |알림 제품 원본·C09/모델/버전 | [#31](https://github.com/trycatch98/Holdlog/issues/31) |
| T005 | T001 |승인 화면 Route와 누락 실패 검사 | [#32](https://github.com/trycatch98/Holdlog/issues/32) |
| T006 | T004·T005 |동일 원본 예제·생성물 | [#33](https://github.com/trycatch98/Holdlog/issues/33) |
| T007 | T006 |FE typed 소비 증거 | [#34](https://github.com/trycatch98/Holdlog/issues/34) |
| T008 | T006 |BE typed 소비 증거 | [#35](https://github.com/trycatch98/Holdlog/issues/35) |
| T009·T010 | T002·T007·T008, T010은 PR병합 |최종 FR/SC 대조·독립 착수 조건 | [#36](https://github.com/trycatch98/Holdlog/issues/36) |

T001→(T002와T005 병렬, T003 답변 뒤T004)→T006→(T007/T008 병렬)→T009→T010. T002의 문서와T005의Runtime/검사 파일은 겹치지 않는다. T004와T005는 순서가 필요하면 같은 공통 변경 담당이 통합한다. T007/T008은 서로 다른앱의checks를 담당하고 루트/공통 계약은 다시 편집하지 않는다. 숫자 순서는 착수 순서를 강제하지 않으며 위 선행 조건을 따른다.

## 구현 전략과 완료 경계

먼저 영향 없는C01~C08·C10~C11 대조와 승인 Route를 준비하고 C09 제품 결정을 기다린다. 계약 변경과 소비자는 한 원본 버전으로 맞춘다.002 완료는 현재 계약·검토·생성 소비·FR/SC 전달의 증거를 상위에서 모아 판단한다. 모든 제품 API/DB/화면/실기기 기능을002에서 구현하거나 완료 처리하지 않는다. 기능별 상세plan/tasks와 작업 배정은 사용하는 계약의 확인 범위가 준비되면 병렬로 진행할 수 있다.

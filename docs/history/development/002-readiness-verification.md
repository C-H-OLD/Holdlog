# 002 준비·화면 경로 검사

2026-10-07 · 대상:002 T001·T002·T005. [작업 목록](../../../specs/002-shared-contracts/tasks.md) · [계약 대조](../../../specs/002-shared-contracts/contract-readiness.md).

## 변경과 실행 결과

기존001 기반을 재사용하고002 상위#29와 작업#30~#36을 실제 하위 이슈로 연결했다. 요구사항 품질 체크16개는 읽기 전용으로 확인했으며 모두 체크됨. FR-001~006·SC-001~004를 작업과 대조했고 미연결 항목은 없다. 에이전트 단독 대조이며 담당 개발자 간 합의 완료를 뜻하지 않는다.

승인05.07 Route를 추가했다. enum 추가는 기존 계약 규칙상 breaking이므로 계약2.0.0으로 올렸다. HTTP 형식/경로는 유지하며 생성13개 파일은 기존 generator로 재생성했다. 화면 개수44 하드코딩을 현재 Figma registry의 화면 집합 대조로 바꿨다.

| 실행 | 확인 결과 |
|---|---|
| Python Route 회귀4개 (수정 전) | 4개 실패:45개 정상 경로를 거절하고 누락·같은 개수의 대체·중복을 허용하는 기존 문제 재현 |
| `python3 -m unittest discover -s scripts/test -p 'test_contract_routes.py'` (수정 후) | 4개 통과 |
| `python3 scripts/check-contracts.py` |79경로·109작업·107자료형·22Runtime 정의·현재45화면 집합 일치, 예제18수락·3거절 |
| `npm run contracts:check` |13회귀 통과·18예제 수락/3거절·13HTTP 연결·생성13개 파일 일치·타입 검사 통과 |
| `npm run check` | 종료0. lockfile·규약/생성·전체lint/typecheck/unit·admin/API build 통과 |
| `python3 scripts/check-docs.py` | 링크·JSON·모바일42화면89상태/웹3화면5상태 일치 |

Node24.21.0·npm11.19.0·Python3의 로컬 검사다. 기존 OpenAPI 미사용 component 경고3개와 Node experimental VM 경고는 유지된다. 계약 해시/도구 버전은 [manifest](../../../packages/contracts/generated/manifest.json)를 원본으로 사용한다.

## 남은 범위

C09의 개별 진입 읽음과 설정/목록 생성 관계는 사용자 답변 대기다. T003~T004·T006~T010은 아직 완료가 아니다. 수신/읽음 HTTP·저장 모델·새 합성 예제·FE/BE 추가 소비는 이 검사에서 수행하지 않았다. 기존001 증거를 현재 새 알림 계약의 완료 증거로 사용하지 않는다.

제품 인증/권한·업무 DB 원자성·계산·파일 bytes·실제 화면/네이티브 기능·물리 서버/휴대폰은 해당 기능의 후속 검사다. 이번 변경은002 전체 완료나003~021 기능 구현 결과가 아니다.

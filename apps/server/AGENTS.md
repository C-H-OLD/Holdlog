# 서버 작업 안내

이 파일은 `apps/server` 작업의 기준 문서를 찾는 목차다. 저장소 루트의 [공통 안내](../../AGENTS.md)와 [작업 규칙](../../docs/work-rules.md)을 함께 따른다.

| 작업 | 먼저 읽을 문서 |
|---|---|
| 모든 서버 작업·코드 배치·의존 방향 | [공통 아키텍처](../../docs/architecture.md) · [서버 아키텍처](../../docs/architecture/server.md) |
| 설정·실행·DB migration·검사 | [개발 안내](../../docs/development.md) · [DB 접근 경계](../../docs/architecture/server.md#db-접근-경계) |
| 기능 설계·구현·완료 확인 | [개발 흐름](../../docs/development-workflow.md) · [기능 스펙 목록](../../specs/README.md)의 해당 스펙 |
| API 입력·출력·오류·version·멱등성 | [계약 안내](../../packages/contracts/README.md) · [계약 규칙](../../packages/contracts/conventions.md) |
| 인증·세션·서비스 관리자 권한 | [004 스펙](../../specs/004-identity-profile/spec.md) · [초기 관리자 절차](../../specs/001-development-foundation/contracts/admin-bootstrap.md) |
| 논리 모델·잠금·원자 변경 | [002 데이터 모델](../../specs/002-shared-contracts/data-model.md) · [기능 명세](../../docs/functional-spec.md) |
| 기록 연결·공개·삭제·권한 회수 | [기록 관계 설계](../../docs/record-relationships.md) · [021 스펙](../../specs/021-account-lifecycle/spec.md) |
| worker·파일·푸시·저장소 | [기술·운영 명세](../../docs/technical-spec.md) · [worker 경계](../../docs/architecture/server.md#api와-worker의-코드-공유) · 해당 011/017 스펙 |
| 공용 계약·migration·루트 설정 변경 | [개발 역할과 변경 담당 기준](../../specs/development-roles.md) |

현재 기반과 후속 목표는 [적용 범위와 현재 상태](../../docs/architecture/server.md#적용-범위와-현재-상태)에서 구분한다. 상세 규칙은 연결한 원본에서 수정하며 이 파일에 복제하지 않는다.

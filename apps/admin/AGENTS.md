# 관리자 웹 작업 안내

이 파일은 `apps/admin` 작업의 기준 문서를 찾는 목차다. 저장소 루트의 [공통 안내](../../AGENTS.md)와 [작업 규칙](../../docs/work-rules.md)을 함께 따른다.

| 작업 | 먼저 읽을 문서 |
|---|---|
| 모든 어드민 작업·코드 배치·의존 방향 | [공통 아키텍처](../../docs/architecture.md) · [관리자 웹 아키텍처](../../docs/architecture/admin.md) |
| 설치·실행·proxy·브라우저/Node 검사 | [개발 안내](../../docs/development.md) |
| 기능 설계·구현·완료 확인 | [개발 흐름](../../docs/development-workflow.md) · [기능 스펙 목록](../../specs/README.md)의 해당 스펙 |
| 화면·공용 UI·확인창·접근성 | [관리자 명세](../../docs/admin-spec.md) · [화면 설계](../../docs/screen-design.md#admin-web) · [현재 시안](../../docs/screens.md) |
| API·오류·version·멱등성 | [계약 안내](../../packages/contracts/README.md) · [계약 규칙](../../packages/contracts/conventions.md) |
| 인증·cookie·CSRF·Origin | [004 스펙](../../specs/004-identity-profile/spec.md) · [관리자 인증](../../docs/architecture/admin.md#관리자-인증) |
| A02/A03·독립 폼·난이도·벽·세팅 | [006 스펙](../../specs/006-gym-catalog-admin/spec.md) · [상태 관리](../../docs/architecture/admin.md#상태-관리) |
| A04·공지 이미지·저장·삭제 | [019 스펙](../../specs/019-announcements/spec.md) · [관리자 공지 명세](../../docs/admin-spec.md#공지-관리) |
| 공통 계약·루트 설정·lockfile 변경 | [개발 역할과 변경 담당 기준](../../specs/development-roles.md) |

현재 기반과 후속 목표는 [적용 범위와 현재 상태](../../docs/architecture/admin.md#적용-범위와-현재-상태)에서 구분한다. 상세 규칙은 연결한 원본에서 수정하며 이 파일에 복제하지 않는다.

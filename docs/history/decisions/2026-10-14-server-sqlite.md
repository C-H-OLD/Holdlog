# 서버 DB를 SQLite로 전환 · 2026-10-14

서버 담당은 서버 DB를 PostgreSQL에서 SQLite 파일 하나로 바꾸기로 했다. 서버는 물리 서버 한 대에서 API와 worker 프로세스로 실행하며([기술·운영 명세](../../technical-spec.md)) 별도 DB 서비스를 두지 않는다. HTTP 계약·오류 코드·응답 모양·시각 형식·토큰과 세션 수명은 바꾸지 않았다. 구현 방법만 바뀌므로 새 기능 스펙 없이 계획과 코드를 고쳤다([프로젝트 원칙](../../../.specify/memory/constitution.md)).

## 정한 것

- 드라이버는 better-sqlite3 13.0.3(SQLite 3.53.4)이다. 정식판이고 동기 API라 트랜잭션 안에서 await할 수 없다. 프로세스마다 연결 하나, WAL, `busy_timeout` 5초, `synchronous=FULL`, `foreign_keys=ON`을 쓴다.
- 모든 쓰기 트랜잭션은 `BEGIN IMMEDIATE`로 연다. 일반 `BEGIN`은 여러 프로세스가 읽은 뒤 쓸 때 SQLITE_BUSY로 실패할 수 있다. 쓰기 잠금이 하나라서 PostgreSQL의 행 잠금·advisory lock과 잠금 순서가 따로 필요 없다. 가입 완료의 비대기 진입 잠금(409 REQUEST_IN_PROGRESS)과 관리자 Argon2 검증 동시 2건 제한은 API 프로세스 메모리로 지킨다. API 프로세스는 하나다.
- SQL은 지금처럼 직접 쓰고 자체 migration runner를 SQLite로 옮겼다. 표는 모두 STRICT이며 UUID는 소문자 TEXT, 시각은 밀리초와 `Z`가 붙은 TEXT, boolean은 0/1이다. CHECK가 형식을 지키고, 클라이언트 UUID는 서비스 입구에서 소문자로 정규화한다.
- 작업 대기열은 pg-boss 대신 `jobs` 표다. 호출자 트랜잭션 안에서 jobKey당 한 번 등록하고, 처리기는 임대·claimId 펜싱·지수 backoff·10초 종료 대기로 동작한다. 같은 작업이 두 번 실행될 수 있어 효과 쪽이 멱등이어야 한다. 가입 증명 정리는 worker 안 60초 타이머다.
- `001_foundation.sql`·`002_identity.sql`은 같은 이름의 SQLite판으로 다시 썼다. 적용된 migration을 고치지 않는다는 [규칙](../../architecture/server.md#db-접근-경계)의 한 번뿐인 예외다. 두 파일을 적용한 SQLite DB와 운영 DB가 아직 없고, PostgreSQL 문법 파일은 SQLite에서 실행되지 않는다. 다음 migration부터는 규칙을 따른다. 기존 PostgreSQL 개발 볼륨은 쓰지 않는다.
- 개발 compose에서 `db`·`test-db`를 지웠다. DB 시험은 시험마다 임시 폴더에 새 파일을 만든다.

## 검토한 대안

- `node:sqlite`(Node 내장): 의존성이 없지만 Node 24에서 Release candidate 단계다.
- Kysely·Drizzle: 트랜잭션을 `BEGIN IMMEDIATE`로 열려면 드라이버를 고쳐야 하고, migrator가 checksum 비교나 프로세스 사이 잠금을 하지 않는다. Drizzle은 스키마를 TS로 적어 [001 연구](../../../specs/001-development-foundation/research.md)의 SQL 원본 원칙과 맞지 않는다.
- @boringnode/queue·liteque 등 SQLite 대기열: 여러 프로세스가 한 파일을 쓰는 사용이 문서에 없거나, 업무 트랜잭션 안에서 등록할 수 없거나, backoff·heartbeat가 없다.
- NestJS 11 유지·Fastify 단독: 프레임워크는 이 전환과 따로 다룬다.

## 영향받는 현재 명세

- [서버 아키텍처](../../architecture/server.md), [공통 아키텍처](../../architecture.md), [개발 안내](../../development.md)
- [001 계획](../../../specs/001-development-foundation/plan.md)·[연구](../../../specs/001-development-foundation/research.md)·[자료 모델](../../../specs/001-development-foundation/data-model.md)
- [004 계획](../../../specs/004-identity-profile/plan.md)·[작업](../../../specs/004-identity-profile/tasks.md)·[가입 설계](../../../specs/004-identity-profile/signup-design.md)
- 기술·계약 확정 문구(`technical-spec.md`, `packages/contracts/conventions.md`, 002 `data-model.md`·`plan.md`·`research.md`)와 이를 따르는 [공통 아키텍처](../../architecture.md)의 목표 구성(시스템 구성 그림, 저장소 행, 목표 운영 문장)의 PostgreSQL·pg-boss 줄은 별도 스펙 변경 이슈로 고친다.

# 004 서버 SQLite 전환 단독 검증

2026-10-15, T033을 로컬 Linux x64 / Node24.21.0 / npm11.19.0 / better-sqlite3 13.0.3(SQLite 3.53.4)에서 수행했다. 기준은 [전환 기록](../decisions/2026-10-14-server-sqlite.md), [004 작업](../../../specs/004-identity-profile/tasks.md), [서버 아키텍처](../../architecture/server.md)다. 설정과 명령은 [개발 안내](../../development.md)가 현재 원본이다.

## 구현과 확인 결과

- 연결: 프로세스마다 연결 하나, WAL·`busy_timeout`5000·`synchronous=FULL`·`foreign_keys=ON`. 새 DB 파일과 `-wal`·`-shm`은 소유자만 읽고 쓴다(0600). 다른 프로세스가 쓰기 잠금을 쥐면 `BEGIN IMMEDIATE`가 기다렸다가 진행하고, 5초를 넘기면 `/api/v2` 요청이503 TEMPORARY_FAILURE(retryable)다.
- 트랜잭션: 서비스 트랜잭션은 모두 `BEGIN IMMEDIATE`다. 콜백이 Promise를 돌려주면 타입 오류이고 실행 때도 TypeError와 rollback이다. 지연 FK가 COMMIT에서 실패하면 rollback되고 연결을 다시 쓸 수 있다.
- migration: 001·002를 SQLite판으로 교체했다. runner는 FK를 BEGIN 전에 끄고 `foreign_key_check`가 깨끗할 때만 commit하며 끝나면 다시 켠다. 표를 다시 만들어도 CASCADE 자식 행이 남는다. checksum 변경·적용 파일 삭제는 거절한다. ready는 migration 적용 뒤에만200이다.
- 스키마: STRICT 형 거절, UUID 소문자·시각 형식(해석할 수 없는 문자열 포함)·hex·Argon2 GLOB·boolean CHECK, 이름 CHECK가 JavaScript `trim()`의 공백25자를 모두 거절한다.
- identity: advisory lock·`FOR UPDATE`를 지우고 재확인 조회는 남겼다. 가입 진입 잠금과 관리자 Argon2 동시2건 제한은 API 프로세스 메모리로 옮겼다. 대문자·`urn:uuid:` UUID가 같은 행을 찾는다. 시각은 SQLite `'now'`로 계산하고 응답 형식은 그대로다.
- 작업 처리기: `jobs` 표의 jobKey1회 등록, 가져가는 순서, claimId 펜싱, 1·2·4초 backoff와 failed, LEASE_EXPIRED, 종료 때 기다린 뒤 abort하고 기록하지 않음, 중단·SIGKILL 뒤 다른 처리기가 효과1번으로 완료. 가입 증명 정리는 시작 때와60초마다 돌고 실패는 범주만 기록한 뒤 다음 틱에 정리한다. production 설정에는 합성 큐가 없다.

## 실행 증거

비밀값·token·cookie는 이 기록에 남기지 않았다. 시험마다 임시 폴더에 새 DB 파일을 만들고 지웠다.

| 검사 | 결과 |
|---|---|
| `npm run check` | lockfile·contracts·전체 lint/typecheck·단독102개·웹/API 빌드 통과 |
| `npm run test:foundation` | DB·HTTP·worker 포함87개 통과, skip0 |
| `test:identity` / `test:admin-auth` | 29개 / 11개 통과 |
| 이전 시험과의 대응 | PostgreSQL판64개 중62개를 SQLite 방식으로 옮겼다. advisory 잠금·pool rollback 시험2개는 진입 잠금 단위 시험과 transaction 통합 시험으로 바꿨다 |
| 개발 compose storage | busybox1.36.1 digest 이미지에서 `sleep infinity` 실행 확인 |
| 문서·정적 계약·diff | `python3 scripts/check-docs.py`, `python3 scripts/check-contracts.py`, `git diff --check` 통과 |

## 남은 범위

운영 배포는 이 작업 밖이다. 기술·계약 확정 문구 변경은 별도 스펙 변경 이슈로 낸다. OutboxEntry·dispatcher·제품 작업 처리기·heartbeat·완료 행 정리는 해당 기능에서 만든다. 실제 제공자/기기·관리자 브라우저 연동은 #57·#58 범위다.

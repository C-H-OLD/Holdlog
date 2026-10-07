# 서버·DB·worker 기반 검증

2026-10-07 · [이슈 #5](https://github.com/trycatch98/Holdlog/issues/5) · 001/T009–T012·T018–T019. 서버 단독 구현·로컬 검사 기록이며, PR 병합·브라우저/모바일 실제 연동·001 전체 완료와 구분한다.

## 실행 환경과 구성

macOS arm64, Node24.21.0·npm11.19.0, Docker daemon29.1.5·Compose5.0.1을 사용했다. 전역 Node는 바꾸지 않았다. NestJS11.2.7은 유지하고 `pg`8.23.1·`pg-boss`12.37.0·`@types/pg`8.23.1을 exact 버전과 lockfile로 고정했다. npm 공식 메타데이터의 엔진을 확인했으며 pg-boss는 Node22.12 이상을 요구한다.

PostgreSQL17.11의 OCI index digest는 `sha256:ae69c452f483507a6b99fb654cf93aad7fe156ffd2c56247707eef4e36d3c12b`다. `docker buildx imagetools inspect postgres:17`의 공식 이미지 메타자료와 다운로드 digest를 대조했다. Compose는 이 digest를 개발/시험 DB와 비공개 파일 볼륨 준비에 사용한다. DB는 loopback의55432/55433·별도 영구 볼륨·holdlog_dev/holdlog_test로 분리했다. 실제 비밀은 로컬600 권한의 Git 제외 환경 파일로만 전달했다. 자료는 합성 UUID 표식뿐이며 운영 자료는 사용하지 않았다.

## 요구사항별 확인

| 작업·요구사항 | 실행과 결과 |
|---|---|
| T009·T010 / FR-002·007 | 설정·DB·queue 검사부터 작성했다. 구현 파일 부재로 빌드 실패 후 구현을 연결했다. 설정3개 검사 통과. API와 worker를 별도 Node 프로세스로 시작해 고정 시작 event를 확인했다. DATABASE_URL 누락 시 각각 exit1·설정 이름만 출력했다. |
| T011 / FR-003·007·SC-003 | 실제 DB migration 재실행·연결 종료/재연결·SHA-256/시각 이력·적용 SQL 변조 및 삭제 거절을 확인했다. SQL과 이력은 advisory lock 아래 한 트랜잭션으로 저장한다. 실제 개발 DB 컨테이너 stop/up 후 합성 UUID 표식이 남았다. 볼륨 삭제는 사용하지 않았다. |
| T012 / FR-002·003·SC-003 | 실제 pg-boss 작업에서 효과 커밋 후 worker stop 및 별도 프로세스 SIGKILL을 각각 검사했다. 새 worker의 재시도 완료·retryCount 증가와 같은 jobId의 표식1개를 확인했다. 실제 worker 진입점 시작·합성 queue 처리·SIGTERM 종료도 확인했다. 내부 queue schema는 pg-boss가 관리한다. |
| T018·T019 / FR-004·007·SC-002 | HTTP로 live200/ok·ready200/ready를 확인했다. 실제 DB stop 시 ready503/unavailable·live200, DB 복구 후 ready200을 확인했다. 연결 불가 시험은 응답에 상세 DB 오류·주소·비밀이 없는 정확한 body를 검사한다. 운영 모드의 두 개발 경로404, Authorization/Cookie/query의 합성 표식이 로그에 없는 것도 검사했다. |

## 검증 명령과 범위

- `npm run build --workspace=@holdlog/server`, 서버 `lint`·`typecheck`, 설정 단독 `npm test --workspace=@holdlog/server`를 수행했다.
- `TEST_DATABASE_URL`을 별도 로컬 시험 DB로 전달하고 `npm run test:foundation --workspace=@holdlog/server`의 설정3·migration1·health3·worker2, 총9개 검사를 수행했다. 시험 DB가 없으면 실패하며 미수행을 성공으로 건너뛰지 않는다.
- API/worker 진입점을 실행하고 `curl`과 같은 HTTP GET, Compose의 `stop db`·`up -d --wait db`, 실제 SQL 재조회로 컨테이너 중단과 영구 볼륨 자료 보존을 별도로 확인했다. 보조 검증 코드는 고유 로컬 임시 파일을 사용했으며 실제 명령 안내는 [개발 안내](../../development.md#서버dbworker-로컬-실행)에 있다.
- 공통 `npm run check`, Python 계약·문서 검사와 `git diff --check` 결과는 PR 검증에도 연결한다. 서버 실행 검사가 루트 check에 자동 연결되는 작업은 #9 범위다.

파일 볼륨은 구성·생성을 확인했으며 실제 업로드·조회·삭제 구현의 증거가 아니다. 제품 DB 테이블·로그인·미디어·푸시·실제 브라우저/가상 기기 연동은 미수행이다. 실제 휴대폰·물리 서버 검사는001 범위 밖이다. worker 효과 중복 방지는 기반 표식에 한정하며 후속 업무 효과는 같은 트랜잭션 또는 해당 계약의 재요청 처리로 구현해야 한다. 강제 종료 시험은 빠른 검증을 위해 짧은 queue 만료와 명시적 supervise를 사용하고, 일반 worker queue 만료는30초다.

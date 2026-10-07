# 공통 실행·검사 명령 검증

2026-10-07 · [#9](https://github.com/trycatch98/Holdlog/issues/9) · 001/T025·T026 · FR-002·FR-006·SC-004. 원본은 [계획](../../../specs/001-development-foundation/plan.md)·[명령 계약](../../../specs/001-development-foundation/contracts/README.md#명령-계약)이다.

## 범위와 환경

main의 모바일 PR #19까지 반영한 별도 Git 작업 폴더에서 Node24.21.0·npm11.19.0과 기존 lockfile로 설치했다. 초기 npm cache 접근 오류를 작업 전용 임시 cache로 해결했으며 기존 사용자 cache나 전역 설정은 변경하지 않았다. 고정 버전의 arm64 Node를 임시 위치에 사용했다.

루트의 lint/typecheck/test·웹/API build·개발 실행·test:foundation을 공통 실행기에 연결했다. 각 앱의 기존 명령을 그대로 호출한다. scripts/check-tooling.mjs와 해당 회귀 검사도 유지한다. root package.json은 생성 provenance 입력이어서 contracts:generate를 명시적으로 실행했고 생성 manifest의 root 입력 SHA-256만 달라졌다. 계약 필드·타입·validator·lockfile과 의존성은 변경하지 않았다.

## 수행한 검사

- 변경 전 npm run check 통과: 기존 계약 검사13개·도구 검사14개와 모든 workspace lint/typecheck.
- T025 실패 확인: 실행기 추가 전 새 CLI 검사9개가 실행기 부재로 실패했다. 실행기 구현 후9개 통과, 개발 설정 실패 전파 검사를 추가한 최종10개 모두 통과.
- Node24.21.0·npm11.19.0의 npm ci --cache <작업 전용 임시 cache> 통과: 713개 설치. 기존 uuid 사용 중단·esbuild/fsevents 설치 스크립트 승인 안내는 남지만 실제 웹 빌드와 계약 생성은 통과했다.
- npm run check 통과: lockfile5개 manifest·계약13개·도구14개·실행기10개·웹9개·모바일6개·서버4개 검사, 모든 workspace lint/typecheck·웹/API 빌드. OpenAPI의 기존 미사용 component3개 경고는 유지.
- 실행기 CLI 검사: 필수 workspace script 누락·manifest 이름 불일치·npm 부재·알 수 없는 task·설정 누락·하위 exit17/9를 정상 성공으로 바꾸지 않는다. preflight 실패는 대상 실행 전에 중단하고 작업 후 실패는 후속 대상을 실행하지 않는다. 합성 비밀값을 실행기 오류에 포함하지 않는다.
- root test:foundation의 TEST_DATABASE_URL 누락은 exit1, 설정 이름만 표시하고 하위 검사를 시작하지 않는다.
- 명시적 로컬 시험 DB 설정을 전달했을 때 기존 서버 기반 검사 명령을 실제 호출했다. 시험 DB55433 접속 불가로 실패했으며 root는 @holdlog/server:test:foundation 실패와 exit1을 전달했다. 성공한 실제 DB/queue 검사로 집계하지 않는다.
- 합성 fixture로 build:admin/build:api·dev:admin/dev:mobile/dev:api/dev:worker가 정해진 단일 workspace 명령을 호출하는지 확인했다. 실제 장기 실행 프로세스·브라우저/가상 기기 연동은 이 검사를 대신하지 않는다.
- /usr/bin/python3 scripts/check-docs.py·scripts/check-contracts.py와 git diff --check: 통과.

## 완료 범위와 후속 확인

T025·T026의 명령 연결·단독 검사·실패 전달을 확인했다. test:foundation 성공 경로의 로컬 DB/queue 검증은 실행 환경을 준비한 뒤 별도로 확인해야 한다. 기본 check/test는 DB·브라우저/API 연동·네이티브 빌드·기기 검사를 미수행으로 표시한다. 실제 로컬 연결은 #10, 별도 작업 폴더 전체 재현·설정 경계·실행 안내 정리는 #11, 전체 증거 대조는 #14다. 상위 #1 완료나 실제 기기·물리 서버 검증을 의미하지 않는다.

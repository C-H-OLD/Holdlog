# Implementation Plan: 개발 기반 구성

**기능 선택**: `001-development-foundation` · **Git 브랜치**: `main`(설계 작성, 구현 브랜치는 별도) · **Date**: 2026-10-06 · **Spec**: [spec.md](spec.md)

## Summary

모바일·관리자 웹·API·개발 DB·작업 처리기의 실행 기반을 하나의 저장소에 준비한다. 각 소비자는 [002 계약](../002-shared-contracts/contracts/README.md)의 원본에서 생성한 자료형·검사 함수를 사용한다. 개발 연결 확인은 테스트 진입점으로 수행하고 새 제품 화면을 추가하지 않는다.

현재는 설계·작업 목록 작성 및 일관성 분석을 마쳤다. 앱 코드·DB 변경 파일·설치·실행은 아직 없다. 선택 근거는 [research.md](research.md), 개발 자료는 [data-model.md](data-model.md), 개발 인터페이스는 [contracts/README.md](contracts/README.md), 검사 절차는 [quickstart.md](quickstart.md), 역할별 상세 순서와 선행 조건은 [tasks.md](tasks.md)를 따른다.

## Technical Context

- **Language/Version**: TypeScript, Node24 LTS(최소24.15), npm11 workspaces. Expo SDK57 계열과 SDK 지정 React Native/React 조합, NestJS11 계열. 설치 시 정확한 의존성·도구 버전과 lockfile을 고정한다. 현재 lockfile은 없다.
- **Primary Dependencies**: Expo 전용 개발 빌드, React/Vite 관리자 웹, NestJS, PostgreSQL17, pg-boss, `pg`와 SQL 변경 파일. 생성 도구는 openapi-typescript7·Ajv8/2020-12·ajv-formats·json-schema-to-typescript·Redocly CLI.
- **Storage**: 개발 전용 PostgreSQL 영구 볼륨·비공개 파일 볼륨. 업무 데이터 원본은 [002 모델](../002-shared-contracts/data-model.md). 기반은 DB 접속·변경 적용 이력·합성 queue 검사까지 준비한다.
- **Testing**: TypeScript·ESLint·계약 규약/예제·API 기본 테스트·실제 개발 DB 검사·웹 빌드·Expo 호환/전용 개발 빌드·로컬 가상 기기 연결과 후속 실기기 확인. 지금은 기존 Python 정적 검사만 실행 가능하다.
- **Target Platform**: iOS/Android·관리자 브라우저·보유 물리 서버 Docker Compose. 개발 컴퓨터는 macOS arm64. 물리 서버 사양과 테스트 휴대폰은 사용자가 미정으로 확인했다.
- **Project Type**: npm workspace 하나, 모바일·웹·API·worker 실행 분리. worker는 같은 API 코드의 별도 진입점이며 업무 마이크로서비스를 추가하지 않는다.
- **Performance Goals**: 근거 없는 응답시간·처리량 수치를 추가하지 않는다. 영상 초기 동시1·알림/삭제 처리기 분리는 [기술 원본](../../docs/technical-spec.md). 자원 제한·영상 성능은 사양 확인 및 후속011 검증에서 정한다.
- **Constraints**: 운영 자료 미사용·비밀값/파일/DB 덤프 Git 제외·기존 자료 보존·생성 결과 수기 수정 금지. 백업·외부 도메인·운영 HTTPS·배포 자동화는 후속 운영 범위다.
- **Scale/Scope**: 001 FR-001–009·SC-001–006. 002 생성 소비자를 준비하되 제품 로그인·지도·푸시·미디어·화면 기능은 해당 후속 스펙에서 구현한다.

## Constitution Check

| 원칙 | 설계 전 | 설계 후 |
|---|---|---|
| Living Spec | 001·002·기술 기준 확인 | 001 산출물·상태 연결 |
| 원본 한곳 | 제품 계약 복사 금지 | 기반 인터페이스만 작성, 제품은 원본 링크 |
| 확정 범위 | 새 화면·미정 운동 시작 제외 | 테스트 진입점만 설계 |
| 계약 협업 | 역할·소비 범위 확인 | 동일 생성물·예제·FE/BE 검사 연결 |
| 실제 증거 | 도구 존재와 실행 구분 | 작성/설치/로컬/실기기·미수행 분리 |

설계 전후 원칙 위반 없음. 서버·기기 미정은 실행 작업의 선행 조건이며 제품 동작의 미정 사항과 구분한다. 실제 배포·기기 확인 완료를 선언하지 않는다.

## Project Structure

아래 실행 구조는 **구현 예정 위치**다. 이번에는 설계 산출물만 작성한다.

```text
specs/001-development-foundation/
  spec.md
  plan.md
  research.md
  data-model.md
  contracts/README.md
  quickstart.md
apps/mobile/                 # Expo 전용 개발 빌드
apps/admin/                  # React/Vite와 개발 API proxy
apps/api/
  src/                       # config/health/database/jobs
  src/worker.ts              # 같은 코드의 worker 진입점
  db/migrations/             # SQL 변경 파일·적용 이력
  test/                      # 실제 DB 기반 검사
packages/contracts/
  openapi.json               # 기존 원본
  runtime.schema.json        # 기존 원본
  examples.json              # 기존 합성 자료
  generated/                 # 타입·standalone validator·fixture index
  test/                      # FE/BE 소비 형태 검사
infra/development/           # 개발 Compose·공개 설정 예시
scripts/                     # 기존 검사·후속 생성/검사
package.json                 # workspace·공통 명령
package-lock.json            # 같은 도구/의존성 설치 기준
```

계약 패키지는 모바일·브라우저에 서버 비밀값·NestJS·DB 모듈을 보내지 않는 진입점을 제공한다. 각 앱의 React 의존성을 따로 관리한다. UI 공통 부품은003 후속 범위다. SQL 변경 파일의 주 변경 담당은 해당 백엔드 작업자이며 공통 설정/계약은 작업별 한 명이 변경을 모은다.

## 계약 생성과 소비

1. Redocly로 OpenAPI3.1 규약, Ajv2020으로 schema/예제를 검사한다. Python 검사는 프로젝트 연결을 확인하는 별도 검사로 유지한다.
2. openapi-typescript로 HTTP 타입, json-schema-to-typescript로 runtime 타입, Ajv standalone으로 검사 함수를 생성한다. runtime의 모든 `$defs`와 OpenAPI 외부 참조를 로컬 원본에서 해결한다. OpenAPI 전체 문서를 JSON Schema로 취급하지 않는다.
3. operation별 path/query/header/body/response를 추출하고 검사 함수에 연결한다. 자동 형변환·기본값 주입·알 수 없는 필드 제거를 끈다. format·비JSON 바이트 경계는 [기반 계약](contracts/README.md)을 따른다.
4. mock은 기존 합성 예제를 읽는 fixture adapter다. 새 업무 기대값을 자동 발명하지 않는다. 예제의 schema와 operation 입출력 연결도 검사한다. 예제가 없는 경로는 해당 기능에서 보완한다.
5. 원본 해시·계약/도구 버전·생성 목록을 기록하고 재생성 차이를 검사한다. FE의 HTTP/runtime, BE의 HTTP/job/storage 타입 소비를 각각 검사한다. 형식 통과는 권한·트랜잭션·기기 기능 완료가 아니다.

## 역할·선행·전달

| 역할 | 변경 범위·전달 결과 | 선행 조건·검사 |
|---|---|---|
| SHARED | 루트 workspace/lockfile·계약 생성·공통 명령/설정 | 원본 확인·공통 담당 지정; 규약·예제·재생성·FE/BE 타입 검사 |
| BE | API·DB·worker·Compose·초기 관리자 준비 절차 | 공통 도구/계약; DB 재시작·readiness·합성 queue 재개·설정 누락 실패 |
| FE 모바일 | Expo 실행/빌드·API 소비 검사 | 공통 타입·로컬 빌드 도구; 가상 기기 실행/연결, 후속 실기기 성공/불가 |
| FE 관리자 | React/Vite 실행·빌드·proxy·소비 검사 | 공통 타입; 웹 연결 성공/불가·번들에 서버 비밀 미포함 |
| INTEGRATION | 동일 버전 합친 결과·실행 증거·개발 안내 | 각 소비자/API 준비; FR/SC 대조·미수행 외부 검사 분리 |

사람을 임의 배정하지 않았다. 작업 ID·세부 의존성·GitHub 작업 이슈와 배정 묶음는 [tasks.md](tasks.md)에 작성했다. 로컬에서 코드·DB·웹·가상 기기 개발/연결을 진행하며 실제 서버·휴대폰 준비는 로컬 개발을 막지 않는다. 실기기 확인은 별도 후속 작업이다. GitHub 등록·배정·착수는 [개발 흐름](../../docs/development-workflow.md#github-이슈와-pr)을 따른다.

초기 관리자 비밀 입력·해시·교체 절차는001 준비 범위다. principal/session 저장·인증 API·웹 인증 소비는004가 담당한다. 실제 계정 준비는004 저장 구조가 생긴 뒤 실행한다. 공개 가입 API나 별도 화면을 추가하지 않는다.

## Complexity Tracking

정당화할 원칙 위반 없음. 기존 단일 서버·PostgreSQL·로컬 저장 기준을 유지한다.

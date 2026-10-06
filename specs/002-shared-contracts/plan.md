# Implementation Plan: 공통 API·데이터 계약 설계

**기능 선택**: `002-shared-contracts`(Git 브랜치와 별개) · **Date**: 2026-10-06 · **Spec**: [spec.md](spec.md)

## Summary

앱·관리자 웹·백엔드가 서로 다른 개발자여도 같은 입력·결과·충돌·권한 경계를 사용하도록 C01~C12를 구체화한다. HTTP 형식은 [OpenAPI 원본](../../packages/contracts/openapi.json), 비HTTP 형식은 [runtime 원본](../../packages/contracts/runtime.schema.json), 처리 의미는 [conventions](../../packages/contracts/conventions.md), 논리 데이터 관계는 [data-model.md](data-model.md) 한곳에서 관리한다. 정책·권한표·계산식을 복제하지 않는다.

이번 산출물은 설계·형식 예제·정적 검사이며 서비스 구현이 아니다. 운동 시작 방식은 [미정 원본](../../docs/open-questions.md)에 유지한다. 공지 개선 승인과 기록 탭 표시줄·겹침 허용은 기존 화면 원본에 반영한다.

## Technical Context

- **Language/Version**: 실제 소비자는 TypeScript. 이번 계약은 OpenAPI3.1/JSON Schema2020-12/Markdown. SDK·Node·React Native·NestJS 설치 버전은001 기반 설정에서 고정한다.
- **Primary Dependencies**: [기술 원본](../../docs/technical-spec.md)의 React Native+Expo 전용개발빌드·React admin·NestJS·pg-boss·FFmpeg·FCM. 조사 결과는 [research.md](research.md).
- **Storage**: PostgreSQL 단일 DB의 TX/outbox, 물리 서버 저장소 adapter, 기기 보안/로컬 draft. 실제 테이블·migration은 미생성.
- **Testing**: 현재 Python 표준 라이브러리 정적 참조/예제 검사·문서 검사. 후속은 동일 계약에서 생성한 프론트 mock/백엔드 입력검사와 실제 DB·기기 통합검사. 명령은 [quickstart](quickstart.md).
- **Target Platform**: iOS/Android·관리자 브라우저·보유 물리서버 Docker Compose.
- **Project Type**: 하나의 저장소의 모바일·관리자·API·공통 계약. 독립 서비스로 분할하지 않음.
- **Performance Goals**: 원본에 없는 응답시간/처리량 수치를 임의 확정하지 않음. 월 전체 달력과 물리서버 변환·읽기의 성능 측정은 후속 실행 조건. 영상 초기 동시1·알림/삭제 별도 worker는 기술 원본을 따름.
- **Constraints**: 즉시권한회수, 개인과거값 없음, 변환/삭제/알림은 commit후, 필드사본 없음, 미정 UI 강제선택 없음. 사용자의 실제 데이터·토큰으로 예제 만들지 않음.
- **Scale/Scope**: 21개 개발 단위, 모바일41+관리자3 화면, C01~C12. 운영 자동화·외부 저장소 업체·운동시작 UI는 범위 밖.

## Constitution Check

| 원칙 | 설계 전 확인 | 설계 후 확인 |
|---|---|---|
| Living Spec | 002 범위 및 기존 원본을 읽음 | spec·계약범위·상태 목차 갱신 |
| 원본 한곳 | 정책 복사 금지 | HTTP/runtime/처리의미/논리모델 역할 분리, 연결 안내는 링크 |
| 확정 범위 | 운동 시작 제외, 최신 승인 우선 | 시작 UI 미정, 공지 승인·표시줄 조건 반영 |
| 계약 협업 | C번호·FE/BE 역할 식별 | operationId·C번호·기능ID·공통 예제·전달/변경 절차 연결 |
| 실제 증거 | 실행되지 않은 검사를 완료 표시하지 않음 | 정적 형식 검토와 API/DB/기기 미검증 구분 |

원칙 위반 없음. 후속 라이브러리 설치/기기 구현 선택은 계약의 의미를 바꾸면 영향받는 원본도 갱신한다.

## Project Structure

```text
specs/002-shared-contracts/
  spec.md
  contract-scope.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/README.md
packages/contracts/
  README.md
  openapi.json
  runtime.schema.json
  conventions.md
  examples.json
scripts/check-contracts.py
```

`apps/mobile`, `apps/admin`, `apps/server`와 generated DTO·runtime validator·DB migration은001 및 해당 기능 구현에서 만든다. contracts 폴더에는 계약 필드 사본을 두지 않는다. 생성 DTO/검증기/mock은 원본 JSON으로 생성해 소비하며 수기로 별도 수정하지 않는다. 생성 도구·명령과 lockfile은001에서 고정하고 양쪽 소비자 타입검사를 실행한다.

## 설계 전달·후속 개발

1. 프론트는 operationId별 request/response/error와 runtime 화면·기기 상태를 소비한다. 백엔드는 동일 OpenAPI에서 DTO 검증을 생성하되 권한·관계·기간 계산은 서버에서 검사한다.
2. 공통 파일 변경은 [역할 구분](../development-roles.md) 절차로 모으고 영향 C번호·기능·예제·계약 버전을 함께 바꾼다. 기능별 DTO 사본 생성 금지.
3. 이번 에이전트 검토/정적 검사 결과는 설계 검토다. 실제 개발자별 생성 소비자 확인·동일 예제 실행·실제 연동은 아직 수행하지 않았다.
4. 다음은001 기반 설계·기능별 plan/tasks·같은 계약 소비 준비다. 사용자가 구현을 요청하기 전 서비스 코드·DB 변경을 실행하지 않는다.

## Complexity Tracking

정당화할 원칙 위반 없음. 다중 서비스·공개 크루 검색·일반 회원관리·파일 재첨부·운동 시작 UI 선택을 추가하지 않았다.

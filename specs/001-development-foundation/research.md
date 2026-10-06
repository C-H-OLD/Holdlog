# 개발 기반 선택 근거

작성일: 2026-10-06 · 상태: 공식 자료 조사·설계 선택. 설치·lockfile 고정·동작 검증 전.

## 실행 도구와 구조

| 결정 | 이유 | 검토한 대안 |
|---|---|---|
| npm11 workspaces·루트 lockfile 하나 | 앱별 의존성과 공통 패키지를 같은 저장소에서 설치 | pnpm·추가 runner·별도 저장소는 초기 기반에서 필요 없음 |
| Node24 LTS, 최소24.15 | 현재 Nest 생성 도구 요구까지 맞추는 공통 기준 | 로컬24.4.0은 이 계획의 최소 버전 미충족. 이번에 전역 도구를 변경하지 않음 |
| Expo SDK57 계열·SDK 지정 RN/React | 공식 SDK 지원 조합으로 전용 개발 빌드 준비 | Expo Go로 네이티브 검증 완료를 판단하지 않음 |
| NestJS11·관리자 React/Vite | 기존 기술 선택 유지·실행 대상별 빌드 분리 | 새 웹 프레임워크·서버 다중 분리 불필요 |
| PostgreSQL17·`pg`·SQL 변경 파일 | 지원 중인 주요 버전이며 pg-boss 요구 충족. 계약의 잠금/TX를 직접 다룸 | 별도 ORM 모델을 계약의 새 원본으로 두지 않음 |
| 같은 서버 코드의 별도 worker | API 응답과 느린 작업 분리·같은 계약 사용 | Redis·새 queue 서비스·외부 저장소 업체 추가 없음 |

근거: [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces/), [Node 출시 일정](https://github.com/nodejs/Release), [Nest 요구사항](https://docs.nestjs.com/first-steps), [Expo SDK](https://docs.expo.dev/versions/latest/), [Vite 요구사항](https://vite.dev/guide/), [PostgreSQL 지원](https://www.postgresql.org/support/versioning/), [pg-boss 요구사항](https://github.com/timgit/pg-boss#requirements).

조사 시 Expo 공식 최신 메타데이터는57.0.26이다. 설치할 때 SDK57 지원 조합을 다시 확인한다. [공식 메타데이터](https://registry.npmjs.org/expo/latest). 다른 도구의 정확한 최신 patch는 조회되지 않아 추측하지 않았다. 첫 설치 작업에서 Node/npm 정확한 버전, 직접 의존성 exact 버전, lockfile, Docker 이미지 tag/digest를 함께 고정한다. PostgreSQL은 지원 중인17 계열 수정판을 사용하고 개발·운영의 주요 버전을 맞춘다. 이번 조사는 버전 설치/고정 완료가 아니다.

## 계약 도구

- 결정: HTTP 타입은 openapi-typescript7, runtime 타입은 json-schema-to-typescript, 전체 OpenAPI 규약은 Redocly CLI, 실행 값은 Ajv8의2020-12 구현과 ajv-formats로 검사한다.
- 이유: HTTP는 OpenAPI3.1, 기기/worker는 JSON Schema2020-12다. 기존 Python 부분집합 검사를 보완할 수 있다.
- 대안: 수기 DTO·Nest decorator에서 별도 원본 생성은 계약 중복을 만들므로 채택하지 않는다. 모바일에서 실행 중 동적 컴파일 대신 빌드 때 standalone 코드를 생성한다.
- 조건: 로컬 외부 참조와 모든 `$defs`를 처리한다. format과 IANA 시간대 검사, JSON/바이트 경계, 엄격한 입력 규칙을 유지한다. 도구가 지원하지 않는 검증 키워드는 무시하지 않고 실패한다.

근거: [openapi-typescript 지원](https://openapi-ts.dev/introduction), [runtime 타입 생성](https://github.com/bcherny/json-schema-to-typescript), [Redocly CLI](https://redocly.com/docs/cli), [Ajv 스키마 버전](https://ajv.js.org/json-schema.html), [standalone 생성](https://ajv.js.org/standalone.html), [format 검사](https://ajv.js.org/guide/formats.html).

## 연결과 준비 상태

- 결정: API 생존/DB 준비를 개발 전용 경로로 확인하고 앱/웹 테스트 진입점에서 소비한다. 제품 상태 화면을 추가하지 않는다.
- 이유: 미구현 공지·프로필 API를 임시 구현하지 않고 실제 네트워크 연결 성공·실패를 구분한다.
- 결정: Compose의 개발 DB·비공개 파일 볼륨을 분리하고 DB 준비 후 API/worker를 시작한다. 재시작 검사에서 합성 자료 보존을 확인한다. [Compose 설정](https://docs.docker.com/reference/compose-file/services/).

개발 컴퓨터에서 확인한 값은 macOS arm64, Node24.4.0, npm11.4.2, Docker CLI29.2.0, Compose5.0.2다. Xcode 선택 경로는 CommandLineTools로 전체 Xcode·iOS SDK 준비가 확인되지 않았다. Docker daemon·DB 실행·Android 도구·실기기는 검사하지 않았다.

사용자는 물리 서버 사양과 테스트 휴대폰을 **미정**으로 확인했다. 계정·초기 데이터·서명 준비도 미확인으로 [준비 체크리스트](../../docs/setup-checklist.md)에 남긴다. 자원 제한은 서버 사양 이후 정한다. 현재 공개 저장소와 비공개 운영 기준의 차이도 준비 항목이며 저장소 공개 설정은 변경하지 않았다.

설계 선택은 정리했다. 미확인 외부 사실은 실행 작업의 선행 조건이며 실제 서버/기기 검증 완료로 취급하지 않는다.

# 개발 기반 인터페이스

작성일: 2026-10-06 · 상태: 설계. 아래는 기반 인터페이스다. npm 설치·lint/typecheck·계약 생성/검사와 서버 workspace의 API·worker 실행/빌드·개발 health를 구현했다. 서버 [실행 안내](../../../docs/development.md#서버dbworker-로컬-실행)와 [단독 검증](../../../docs/history/development/001-backend-foundation-verification.md)을 따른다. 관리자 웹 workspace의 실행·빌드·개발 proxy와 연결 검사 도구도 구현했다. [웹 실행 안내](../../../docs/development.md#관리자-웹-단독-실행)를 따른다. 모바일 실행·연결 도구도 구현했다. [모바일 실행 안내](../../../docs/development.md#모바일-단독-실행)와 [검증 기록](../../../docs/history/development/001-foundation-verification.md)을 따른다. iOS/Android 전용 앱 실행을 확인했다. 루트 실행·검사 명령은 #9에서 연결했다. 실제 브라우저/API 연동과 전체 재현 검사는 후속 작업이다. 제품 필드는 [공통 계약 원본](../../../packages/contracts/README.md)을 따른다.

## 명령 계약

루트 npm 명령을 `scripts/check-workspaces.mjs`로 연결했다. `npm run check`는 lockfile·계약·모든 workspace lint/typecheck·도구/실행기/앱 단독 검사·웹/API 빌드를 순서대로 실행한다. 각 명령의 필수 manifest와 script를 실행 전에 확인하고 첫 실패의 종료 코드를 전달한다. 기존 workspace 명령은 유지한다. 실제 실행 증거는 [공통 명령 검증](../../../docs/history/development/001-check-commands-verification.md)에 남기고 개발 안내의 전체 재현·정리는 #11에서 수행한다.

| 명령 | 결과 |
|---|---|
| `npm ci` | lockfile과 같은 설치. lock/버전 불일치 시 실패 |
| `npm run contracts:generate` | 타입·검사 함수·예제 index 생성 |
| `npm run contracts:check` | 규약·정상/거절 예제·생성 차이·FE/BE 타입 소비 검사 |
| `npm run dev:api` / `dev:worker` | 설정 검사 후 개발 API/worker 시작 |
| `npm run dev:admin` / `dev:mobile` | 웹 개발 서버 / 전용 개발 빌드용 Metro 시작. 휴대폰 설치는 별도 |
| `npm run typecheck` / `lint` / `test` | 각 workspace 검사. 필요한 검사가 없으면 성공으로 건너뛰지 않음 |
| `npm run build:admin` / `build:api` | 웹/API 빌드. 모바일은 플랫폼별 전용 개발 빌드 |
| `npm run test:foundation` | 실제 시험 DB·API·합성 queue 검사와 미수행 외부 검사 구분 |

`test:foundation`은 명시적 `TEST_DATABASE_URL`을 요구하며 기존 서버의 시험 DB·queue 검사를 호출한다. 기본 `check`·`test`는 이 DB 검사와 실제 브라우저/API 연동·모바일 네이티브 빌드/기기 검사를 수행하지 않았다고 출력한다. Python 문서/계약 정적 검사는 `python3 scripts/check-docs.py`·`python3 scripts/check-contracts.py`로 별도 실행한다.

검사 실패는 비정상 종료하고 대상·원인을 알려준다. 누락된 설정의 값과 비밀은 출력하지 않는다.

## 개발 연결

| 경로 | 입력·결과 | 확인 범위 |
|---|---|---|
| `GET /internal/health/live` | body 없음.200 `{"status":"ok"}` | API 프로세스 응답 |
| `GET /internal/health/ready` | body 없음. DB 쿼리 성공200 `{"status":"ready"}`, 실패503 `{"status":"unavailable"}` | API와 DB 연결. 상세 DB 주소·오류·비밀 미반환 |

001 개발 전용이며 `/api/v1` 제품 계약에 추가하지 않는다. 개발 네트워크에서만 접근하며 운영에 외부 노출하지 않는다. 모바일/웹 테스트 진입점에서 성공·실패를 소비하고 새 화면은 추가하지 않는다. worker 상태·합성 작업 재개는 별도 검사다.

관리자는 Vite 개발 proxy로 상대 경로를 전달한다. C02 관리자 cookie/Origin 검사를 실행할004 단계에서는 로컬 HTTPS·신뢰한 개발 인증서로 같은 Origin을 준비하며 키를 Git에 넣지 않는다. Secure/CSRF 조건을 완화하지 않는다. 공개 도메인·운영 HTTPS를 구성한다는 뜻은 아니다. 001 모바일 검사는 iOS 시뮬레이터·Android 에뮬레이터에서 도달 가능한 로컬 개발 호스트를 사용한다. 실제 휴대폰 연결은 후속 기능 범위이며 휴대폰의 `localhost`를 PC로 취급하지 않는다.

## 생성 인터페이스

- 입력은 OpenAPI/runtime/예제 원본과 계약 버전이다. 출력은 HTTP 타입·runtime 각 `$defs` 타입·필요한 standalone 검사 함수·원본 예제 index다. 소비자는 같은 생성 버전을 사용한다.
- `$ref`는 로컬 문서 ID/JSON Pointer로 해결한다. HTTP component와 operation 입출력을 추출하며 참조를 보존한다. OpenAPI 문서 전체를 JSON Schema로 검사하지 않고 확장 필드와 검증 키워드를 구분한다.
- Ajv2020에서 `coerceTypes`, `useDefaults`, `removeAdditional`을 끈다. 미해결 참조·지원하지 않는 검증 키워드는 실패한다. UUID/date/date-time/email/URI 및 IANA 시간대를 검사한다. standalone format 코드도 생성 시 제공하고 모바일 실행 환경에서 확인한다.
- HTTP adapter는 query/path/header 문자열을 엄격하게 boolean/integer 등으로 해석하고 실패를 반환한다. JSON body를 자동 보정하지 않는다.
- `binary`는 JSON 문자열 검사로 완료 처리하지 않는다. 업로드/Range의 형식 메타자료·바이트 검사를 나눠011에 연결한다.
- 예제는 지정 schema와 operation 입출력 연결을 검사한다. 모든 `mustReject`가 거절되는지 확인한다. mock은 예제에서 기대값을 읽으며 없는 업무 동작을 발명하지 않는다.
- 인증·권한·중복 효과·관계·날짜 의미·파일 bytes·트랜잭션은 실제 기능 검사에서 확인한다. 타입/형식 검사로 대신하지 않는다.

## 초기 관리자 준비

[초기 관리자 준비 절차](admin-bootstrap.md)에 비밀 입력·전달·Argon2id·최초 생성·명시적 교체·재실행·실패 처리를 작성했다. 실제 실행은004 저장 구조와 준비 도구 구현 후 검증한다. 서버 담당은 최초 관리자 식별자/비밀 입력을 앱 빌드·로그와 분리한다. C02의 Argon2id 해시를 사용하고 재실행이 기존 계정/비밀번호를 조용히 덮어쓰지 않게 한다. 비밀 전달·명시적 교체·실패 기록 절차를 문서화한다. 실제 principal 저장·로그인·웹 인증 소비는004에서 같은 계약으로 검사한다. 공개 가입 API·새 화면을 추가하지 않는다.

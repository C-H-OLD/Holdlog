# Holdlog 공통 계약

앱·관리자 웹·서버가 주고받는 형식의 원본이다. 001에서 계약 버전1.0.0의 생성 도구·소비자 타입 검사와001의 실제 로컬 개발 연결을 확인했다. 제품 API·DB 업무 처리·배포는 후속 기능 범위이며, 이 확인으로002 전체 계약 합의를 완료 처리하지 않는다.

| 찾을 내용 | 원본 |
|---|---|
| HTTP 경로·입력·성공/실패·자료형·C번호·담당 기능 | [openapi.json](openapi.json) |
| 기기 화면/운동/공지 숨김/초대/오픈소스, 내부 작업·저장소 명령 | [runtime.schema.json](runtime.schema.json) |
| 인증·버전·멱등성·조회·권한·파일·변경 처리 의미 | [conventions.md](conventions.md) |
| 합성 형식 예제·거절돼야 할 자료 | [examples.json](examples.json) |
| 논리 저장 관계·잠금·원자 저장 범위 | [데이터 모델](../../specs/002-shared-contracts/data-model.md) |
| 담당·원본·설계 이유·검증 방법 | [002 안내](../../specs/002-shared-contracts/contracts/README.md) |

001/T004–T008에서 HTTP/runtime 타입·standalone 검사 함수·원본 예제 adapter를 생성하고 소비 타입 검사를 연결했다. 제품 controller·업무 DB migration·네이티브 기능 연동은 후속 작업이다. 제품 규칙은 [기능 원본](../../docs/functional-spec.md)을 따른다.

정적 확인은 저장소 루트에서 `python3 scripts/check-contracts.py`와 `python3 scripts/check-docs.py`로 실행한다. 정적 검사는 실제 인증·권한·DB 트랜잭션·파일 bytes·기기 동작을 증명하지 않는다.

## 생성과 사용

루트에서 고정한 Node24.21.0·npm11.19.0을 사용한다. 생성물은 `generated/`에 커밋하며 직접 수정하지 않는다.

```sh
npm ci
npm run contracts:check
# 계약 원본 또는 생성 도구 변경 후
npm run contracts:generate
npm run check
```

| 공개 진입점 | 용도 |
|---|---|
| `@holdlog/contracts/http` | OpenAPI `paths`·`operations`·`components` 타입 |
| `@holdlog/contracts/runtime` | 기기 자료·이동·운동·고지 타입 |
| `@holdlog/contracts/backend` | 전체 runtime의 job/storage를 포함한 타입 |
| `@holdlog/contracts/validators` | 생성된 값 검사 함수; 함수명 연결은 operations index 사용 |
| `@holdlog/contracts/operations` | `index.http`·`index.runtime`·`index.operations`의 검사 함수명과 입출력 연결 |
| `@holdlog/contracts/http-input` | `parseParameter(parameter, wireValue)`; 이후 연결된 검사 함수로 값 검증 |
| `@holdlog/contracts/fixtures` | `getFixtures()`로 기존 예제의 독립 사본 제공 |

HTTP 전송값은 query/path/header 문자열을 먼저 해석하고 schema validator로 검증한다. JSON body는 자동 형변환·기본값 주입·필드 제거 없이 그대로 검사한다. 누락된 선택 parameter에 schema default를 주입하지 않는다. 직렬화가 지원 범위를 벗어나면 실패한다.

`contracts:check`는 OpenAPI 규약·로컬 참조·원본 예제·거절 예제·FE/BE 타입 소비·생성 차이를 검사한다. 생성 누락·원본만 변경·출력 변조·추가 파일·도구 불일치는 실패하며, 검사 명령은 생성물을 복구하거나 덮어쓰지 않는다. IANA 시간대 검사는 실행 환경의 `Intl.DateTimeFormat` 지원을 요구한다. 클라이언트 출력에는 format/문자열 검사 helper가 번들되어 있고 Node/NestJS/DB 의존성이나 Ajv 동적 컴파일은 포함하지 않는다. 배포 시 생성물에 포함된 helper의 오픈소스 고지는020에서 함께 확인한다.

생성 도구 단독 검사는 [001 검증 안내](../../specs/001-development-foundation/quickstart.md#계약-생성과-소비-검사-결과), 실제 소비 범위는 아래 원본 기록을 따른다. HTTP 예제 연결은 해당 operation의 parameter/body/response 또는 그 안에 참조된 자료형의 형식 확인이다. 실제 status·권한·DB 처리 완료의 증거가 아니다. operation index의 `binary: true`는 후속 바이트 검사 경계이며 문자열 형식 통과로 업로드 검증을 끝내지 않는다.

## 기반 검증과 후속 전달

001/T024의 [공통 계약·예제 소비 대조](../../docs/history/development/001-foundation-verification.md#공통-계약예제-소비-대조)에서 같은 생성 manifest를 사용하는 Node/BE·실제 Chrome·iOS/Android Hermes의 결과를 확인한다. 계약1.0.0·Node24.21.0·npm11.19.0의 원본 SHA-256·생성 도구 버전·출력 목록은 [manifest](generated/manifest.json)가 원본이다. 해시와 도구 목록을 별도로 복사하지 않는다.

Node와 실제 Chrome은 공통 예제18개 수락·거절 예제3개 거절을 확인했고, Node 검사는 HTTP 구조 연결13개를 확인했다. iOS/Android 실제 Hermes는 타입을 지정한 HTTP AdminSession·runtime ClimbCount의 대표 합성 입력2개가 true임을 확인했다. 모바일에서 전체18개 예제를 검사한 결과는 아니다. [실제 연결 결과](../../docs/history/development/001-foundation-verification.md#실제-연결-결과)는 웹·두 가상 기기의 health200·DB503·API 중단 실패·복구200 범위다.

001/T030의 [별도 폴더 재현·비밀 경계 기록](../../docs/history/development/001-foundation-verification.md#별도-폴더-재현과-비밀-경계--11--t027t030)은 npm ci·동일 계약 재생성·루트 check56개·실제 시험 DB10개와 합성 표식의 출력 검사를 확인한다. 실제 설치·실행·설정·실패 복구는 [개발 안내](../../docs/development.md#실행과-완료-확인)를 따른다. 형식·개발 health·합성 DB/worker 통과가 제품 권한·업무 트랜잭션·날짜 의미·파일 bytes·네이티브 기능·외부 기기 검증을 대신하지 않는다.

[002 후속 전달](../../specs/002-shared-contracts/quickstart.md#후속003004006-전달)에서003 앱 탐색·공통 UI,004 계정·관리자 세션·보안,006 운영 자료·초기 데이터의 원본과 남은 검사를 확인한다.001 전체 완료는 [001 작업 목록](../../specs/001-development-foundation/tasks.md#phase-6-공통-마무리)과 상위 이슈에서 최종 대조·전달을 포함한 필수 작업의 완료 증거를 모아 판단한다.

현재002의 C12 변경은 [계약2.0.0 변경 안내](conventions.md#002-화면-경로-변경--계약200)를 따른다. 수신 목록·읽음 API/예제와 생성 소비는 [계약2.1.0 C09](conventions.md#수신-목록과-읽음--c09) 및 [002 검사 기록](../../docs/history/development/002-contract-verification.md)을 따른다. 실제 제품 API/DB/UI 구현은017 후속이다.

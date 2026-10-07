# Holdlog 공통 계약

앱·관리자 웹·서버가 주고받는 형식의 원본이다. 설계 버전1.0.0이며 서비스 구현·배포·실제 연동은 아직 없다.

| 찾을 내용 | 원본 |
|---|---|
| HTTP 경로·입력·성공/실패·자료형·C번호·담당 기능 | [openapi.json](openapi.json) |
| 기기 화면/운동/공지 숨김/초대/오픈소스, 내부 작업·저장소 명령 | [runtime.schema.json](runtime.schema.json) |
| 인증·버전·멱등성·조회·권한·파일·변경 처리 의미 | [conventions.md](conventions.md) |
| 합성 형식 예제·거절돼야 할 자료 | [examples.json](examples.json) |
| 논리 저장 관계·잠금·원자 저장 범위 | [데이터 모델](../../specs/002-shared-contracts/data-model.md) |
| 담당·원본·설계 이유·검증 방법 | [002 안내](../../specs/002-shared-contracts/contracts/README.md) |

001/T004–T008에서 HTTP/runtime 타입·standalone 검사 함수·원본 예제 adapter를 생성하고 소비 타입 검사를 연결했다. 서비스 controller·DB migration·실제 앱 연동은 후속 작업이다. 제품 규칙은 [기능 원본](../../docs/functional-spec.md)을 따른다.

정적 확인은 저장소 루트에서 `python3 scripts/check-contracts.py`와 `python3 scripts/check-docs.py`로 실행한다. 정적 검사는 실제 인증·권한·DB 트랜잭션·파일 bytes·기기 동작을 증명하지 않는다.

## 생성과 사용

Node/npm은 루트의 고정 버전을 사용한다. 생성물은 `generated/`에 커밋하며 직접 수정하지 않는다.

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

검증 결과와 남은 조건은 [001 검증 안내](../../specs/001-development-foundation/quickstart.md#계약-생성과-소비-검사-결과)를 따른다. HTTP 예제 연결은 해당 operation의 parameter/body/response 또는 그 안에 참조된 자료형의 형식 확인이다. 실제 status·권한·DB 처리 완료의 증거가 아니다. operation index의 `binary: true`는 후속 바이트 검사 경계이며 문자열 형식 통과로 업로드 검증을 끝내지 않는다.

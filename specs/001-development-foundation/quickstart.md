# 개발 기반 검증 안내

작성일: 2026-10-06 · 상태: 서버·DB·worker 단독 실행 검사 완료. 앱/웹 실행·연동은 후속 범위.

## 지금 실행 가능한 검사

현재 가능한 설치·공통 설정·기존 정적 검사 명령은 [개발 안내](../../docs/development.md#실행과-완료-확인)를 따른다. 아래 기존 검사도 유지한다.

```sh
python3 scripts/check-contracts.py
python3 scripts/check-docs.py
git diff --check
```

공통 준비 검사에서 Git 작성자 설정과 `git diff --check`는 정상이며 과거의 빈 `gpg.format` 오류는 재현되지 않았다. 기본 Python 실행 파일 중단으로 기존 검사는 `/usr/bin/python3`로 통과했다. [검증 기록](../../docs/history/development/001-shared-foundation-verification.md)을 참고한다.

## 구현 후 확인 순서

아래는 **후속 검증 절차**다. 명령은 [기반 인터페이스](contracts/README.md)에 있다. 계약 생성·검사는 구현했고 서버 workspace 실행 명령은 [개발 안내](../../docs/development.md#서버dbworker-로컬-실행)에 있고 웹 workspace 명령은 [관리자 웹 실행 안내](../../docs/development.md#관리자-웹-단독-실행)에 있다. 모바일 및 루트 서비스 명령과 실제 브라우저/API 연동은 후속 작업이다.

1. 도구 정확한 버전·직접 의존성·lockfile·이미지 digest를 고정한다. 개발/시험 설정의 비밀은 로컬에만 둔다. T001–T003에서 Node24.21.0·npm11.19.0·직접 의존성·lockfile을 고정하고 설치·설정 검사를 수행했다. 이미지 digest는 T011에서 고정한다.
2. 깨끗한 checkout에서 설치 후 커밋된 생성물의 계약 검사를 먼저 실행한다. 원본 변경 시 명시적으로 생성하고 검사한다. 재생성 동일·정상 예제 허용·거절 예제 거절·FE/BE 타입 소비 통과를 확인한다. 원본만 바꾸고 생성하지 않으면 검사 실패해야 한다.
3. 개발 DB 접속·시험 변경 적용 뒤 API/worker를 시작한다. live/ready·합성 queue 처리를 확인한다. DB 중지 시 ready503, 필수 설정 누락 시 대상 시작 실패를 확인한다.
4. worker 작업 중 중지/재시작 후 합성 작업 재개·중복 효과 방지, DB 정상 중지/재시작 후 합성 자료 보존을 확인한다. 볼륨 삭제 명령은 쓰지 않는다.
5. 웹 실행·빌드·테스트 진입점에서 API200/DB503/네트워크 불가를 구분한다. 제품 화면을 추가하지 않는다.
6. 로컬 Xcode/Android 도구를 준비하고 시뮬레이터/에뮬레이터에 Expo 전용 개발 빌드를 설치한다. 로컬 API로 성공/DB 중지/연결 불가를 검사한다. 이 두 가상 기기의 실행·연결 검사가 001 모바일 완료 기준이다. 실제 휴대폰 확인은 필요한 후속 기능 범위에서 계획한다. Metro/Expo Go/가상 기기 결과를 실기기 통과로 표시하지 않는다.
7. 관리자 초기 준비 절차를 확인한다. 실제 로그인·cookie/CSRF·웹 인증은004 증거에 남긴다. Firebase/지도/로그인 SDK는 후속 기능의 실제 연동과 구분한다.
8. 명령·도구·자료·기기·실제 결과를 기록하고 [개발 안내](../../docs/development.md)에 실행 확인한 명령만 추가한다. [준비 체크리스트](../../docs/setup-checklist.md)는 실제 완료 범위만 표시한다.

## FR·SC별 증거

| 요구사항 | 설계 근거 | 후속 실행 증거 |
|---|---|---|
| FR-001 | [구조](plan.md#project-structure) | workspace 경로·진입점·공통 담당 |
| FR-002·SC-001 | [명령](contracts/README.md#명령-계약) | 실제 설치/실행·모바일 빌드·웹/API 실행 |
| FR-003·SC-003 | [DB/작업](data-model.md#기반-db와-작업) | DB 접속·변경·재시작·자료 보존 |
| FR-004·SC-002 | [연결](contracts/README.md#개발-연결) | iOS 시뮬레이터·Android 에뮬레이터·웹의 로컬 API 성공·503·연결 불가 |
| FR-005 | [생성/소비](plan.md#계약-생성과-소비) | 해시/버전·재생성·FE/BE 타입·예제 검사 |
| FR-006·SC-004 | [명령](contracts/README.md#명령-계약) | 타입/lint/test/build 통과와 잘못된 입력/설정 실패 후 재실행 |
| FR-007 | [설정](data-model.md#공개-설정과-비밀-설정) | 공개 예시·Git 제외·번들/로그에 서버 비밀 미포함 |
| FR-008·SC-005 | [상태](data-model.md#상태-변화) | 로컬 통과/실패/미수행과 범위 밖 실기기/물리 서버 확인 분리 |
| FR-009·SC-006 | 기존 자료/연결 유지 | 문서 검사·차이 검토·기존 파일 보존 |

## 남은 준비

사용자가 서버 사양·테스트 휴대폰은 미정이라고 확인했다. 계정·서명·초기 암장/세팅 자료는 미확인이다. Docker daemon·개발/시험 DB·worker의 [서버 단독 실행 검사](../../docs/history/development/001-backend-foundation-verification.md)를 수행했다. Xcode·iOS SDK·Android CLI/AVD 목록은 명령 실행을 확인했으며 앱 빌드·가상 기기 연결은 미수행이다. 준비 상태 원본은 [체크리스트](../../docs/setup-checklist.md)다.

설계/정적 검사 통과로001·002 또는 제품 기능 완료를 표시하지 않는다. 서비스 구현·실제 소비자 확인과 연동 검증이 남았다.

## 계약 생성과 소비 검사 결과

2026-10-07 · [#4](https://github.com/trycatch98/Holdlog/issues/4) · T004–T008 구현·로컬 검사. 이슈 병합·상위 스펙 완료는 별도다.

- Node24.21.0·npm11.19.0으로 `npm ci` 후 `npm run check` 통과. 계약13개·도구14개 회귀 검사, 모든 workspace lint/typecheck 통과.
- HTTP109개 operation·107개 schema와 runtime22개 `$defs`를 처리한다. Redocly OpenAPI3.1 규약 검사 통과; 기존 미사용 component3개(VersionInput·AssetDraftInput·CatalogDetail)의 경고가 남는다. 업무 원본을 삭제하거나 경고를 숨기지 않았다.
- 정상 예제18개·거절 예제3개, HTTP 예제13개의 operation/schema 연결을 검사했다. FE의 HTTP/기기 자료·BE의 HTTP/job/storage 타입은 package exports로 소비한다. 잘못된 필수 필드·타입·열거값은 기대 타입 오류로 확인한다.
- 동일 입력 재생성 일치, 원본/도구 변경 후 미생성·생성 파일 누락/추가/변조의 실패를 고유 시험 사본에서 확인한다. manifest에는 입력 SHA-256·계약/도구 버전·출력 목록을 기록하고 시각·절대 경로를 넣지 않는다.
- 공개 함수 주석 보완: TypeScript AST로 수기 소스의 공개 함수17개 모두 JSDoc이 있음을 확인했다(17/17, 100%). 생성 validator 선언154개 모두 설명을 포함하며 fixture/HTTP 입력 함수의 주석도 생성 템플릿에서 관리한다. 내부 참조·직렬화·생성 helper에도 역할과 실패 조건을 설명했다.
- Node 전역·외부 import·문자열 동적 컴파일이 없는 제한된 VM에서 실제 클라이언트 생성물 import와 값 검사·HTTP parameter 해석·fixture 호출을 확인했다. Node VM 모듈의 실험 기능 경고는 테스트 환경에만 해당한다. 실제 브라우저 빌드·Metro·Hermes·기기 실행은 T013/T014와 후속 연동에서 확인한다.
- Python 정적 검사와 문서 검사는 `/usr/bin/python3`로 수행한다. 실제 권한·status·DB 트랜잭션·비JSON bytes·서비스/실기기 연동은 미수행이다.

설치 경고: 기존 uuid7 사용 중단 경고와 fsevents/esbuild 설치 스크립트 승인 대기 경고가 있다. 재설치 후 esbuild 생성 명령은 동작했으며 네이티브 watcher 검사는 미수행이다. npm audit은23개(중간7·높음16)를 보고하며 직접 원인은 기존 Expo/RN 계열이다. 이번에 추가한 직접 생성 도구에는 audit 경고가 없다. SDK를 임의로 낮추는 자동 수정은 적용하지 않았다.

공개 진입점·정확한 실행 순서는 [계약 사용 안내](../../packages/contracts/README.md#생성과-사용)를 따른다. `npm run contracts:check`와 `npm run check`는 커밋된 생성물의 차이를 먼저 검사하므로 검사 전 자동 재생성으로 오래된 출력을 숨기지 않는다.

# 서버 아키텍처

`apps/server`의 코드 배치·의존 방향·API와 worker의 책임을 관리한다. 제품 동작과 권한은 기능 명세, 통신 형식과 처리 의미는 공통 계약이 원본이다. 이 문서는 후속 구현의 공통 기준이며 기능별 테이블·API·작업 설계를 대신하지 않는다.

## 적용 범위와 현재 상태

현재 NestJS API·개발 health 경로·pg 연결·SQL migration runner와 pg-boss 합성 worker가 있다. 004 인증 저장 migration·같은 client의 TX/잠금·최소 receipt·별도 설정 검증 기반을 추가했다. 004/#51은 모바일 인증·가입 완료·이름 profile·회수와 proof 정리의 서버 단독 구현을 추가했다. [검증 기록](../history/development/004-mobile-identity-api-verification.md)을 따른다. 004/#52는 별도 관리자 cookie 인증·초기 계정 도구와 [서버 단독 검사](../history/development/004-admin-api-verification.md)를 추가했다. 004/#57의 [관리자 실제 HTTPS 연동](../history/development/004-admin-auth-verification.md)을 확인했다. 실제 제공자/기기·나머지 업무 API·파일 처리·푸시와 실제 운영 배포는 후속이다. proof 정리 worker는 운영 분기에도 등록하고 합성 작업은 development/test에만 등록한다. 아래 `modules/identity/`는 현재 구현이고 다른 업무 모듈·`storage/`는 필요한 구현이 생길 때 만든다. 기존 기반 코드를 폴더 이름 통일만을 위해 옮기지 않는다.

현재 의존성과 실행 명령은 [개발 안내](../development.md)와 manifest를 따른다. DB 접근은 기존 `pg`를 기준으로 하며 ORM이나 별도 서버 프레임워크 도입은 이 문서 작성에 포함하지 않는다. 계약 패키지를 실제 import하는 workspace에는 직접 의존을 선언하고 루트 lockfile을 함께 갱신한다.

## 모듈 책임과 코드 배치

하나의 API 안에서 업무별 NestJS 모듈을 나눈다. API와 worker는 별도 프로세스이며 같은 서버 코드베이스를 사용한다. 스펙 번호와 모듈을 일대일로 맞추거나 업무마다 독립 서버를 만들지 않는다.

```text
apps/server/
├── AGENTS.md
├── db/migrations/              # 순서·checksum으로 관리하는 SQL 원본
├── checks/                     # 합성 계약·환경 타입 소비 검사
├── test/                       # 단위·실제 DB·HTTP 검사
└── src/
    ├── main.ts                 # API 시작·종료
    ├── app.module.ts           # API 모듈 조립
    ├── worker.ts               # 별도 worker 시작·종료
    ├── config/                 # 설정 검증·안전한 로그
    ├── database/               # pool·migration·트랜잭션 도구
    ├── health/                 # 기존 개발 상태 확인
    ├── jobs/                   # 대기열 연결·handler 등록·종료
    ├── modules/                # identity 구현, crews·catalog·records 등은 후속
    │   └── <업무>/             # module·controller·service·repository
    └── storage/                # 후속: 비공개 파일 저장 어댑터
```

controller는 HTTP, service는 업무 처리, repository는 SQL 접근을 맡는다. 독립 처리가 필요할 때 파일을 나누며 모든 모듈에 빈 repository·interface·추상 기반 클래스를 만들지 않는다. 인증·조회 projection·이벤트 등도 해당 업무 모듈에 두고 실제 재사용 경계가 확인될 때만 공통으로 분리한다.

| 변경할 내용 | 배치와 책임 |
|---|---|
| 일정 HTTP 입력·출력 | `modules/schedules/schedules.controller.ts` |
| 일정 변경·권한·관련 사건 저장 조정 | `modules/schedules/schedules.service.ts` |
| 일정 SQL·잠금·조회 projection | `modules/schedules/schedules.repository.ts` |
| 영상 처리 handler 등록 | `jobs/`에서 등록하고 미디어 업무 서비스 호출 |
| 파일 bytes·저장소 이동 | `storage/`의 어댑터. 업무 권한 판단은 해당 서비스 |

여러 업무를 함께 바꾸는 흐름은 주 업무의 service가 조정한다. 다른 모듈의 controller를 호출하거나 repository 내부 SQL을 가져다 쓰지 않는다. 기능별 계획에서 참여 모듈·트랜잭션 소유자·공통 변경 담당을 정한다.

## API와 업무 로직 경계

```text
HTTP → controller·입력 검사·인증 경계 → 업무 service → repository → PostgreSQL
                                              ↘ 저장 어댑터·작업 등록
worker handler → 같은 업무 service·저장 어댑터
```

- HTTP path/query/header는 계약의 전송 형식대로 해석하고 JSON body와 함께 검증한다. 타입 선언만으로 입력 검사가 끝나지 않는다. HTTP 타입·검사 함수·operation 연결은 [계약 공개 진입점](../../packages/contracts/README.md#생성과-사용)을 소비하고 DTO를 수기로 복제하지 않는다.
- 인증 경계는 현재 주체·세션을 확인하고 service는 대상 크루·소유·업무 제약을 검사한다. 입력의 accountId·역할·선택 크루나 클라이언트의 canEdit를 권한 근거로 쓰지 않는다. 재요청과 worker 실행에서도 현재 권한·삭제 상태를 필요한 시점에 재검사한다.
- service의 업무 오류를 HTTP adapter에서 계약의 status·code·허용된 상세값으로 바꾼다. SQL 오류·stack·내부 경로·비밀값을 응답하지 않는다. 인증·권한 검사 전 비공개 대상의 존재나 version을 노출하지 않는다.
- controller에서 화면용 정책·계산식을 새로 만들지 않는다. 본인 응답과 회원 공개 응답은 별도 projection으로 구성하고, 금지된 값을 전송한 뒤 화면에서 숨기는 방식은 사용하지 않는다.
- 관리자 인증은 004의 책임이며 모바일 Bearer 세션과 별개다. cookie·CSRF·Origin·초기 관리자 준비는 [C02 원본](../../packages/contracts/conventions.md#인증기기관리자--c02c03c09)과 [초기 관리자 절차](../../specs/001-development-foundation/contracts/admin-bootstrap.md)를 따른다. 006/019의 HTTP는 `AdminSessionGuard`, 업무는 `AdminSessionService.withAdministrator` callback의 같은 client로 현재 권한·CSRF와 저장을 묶는다. 개발 health 경로를 인증 우회로 사용하지 않는다.
- UTC 시점·현지 날짜·IANA 시간대, PATCH 누락/null, 미입력/명시적 0을 변환 과정에서 보존한다. 응답·헤더·멱등키·오류의 상세 규칙은 [공통 계약 규칙](../../packages/contracts/conventions.md)이 원본이다.

## DB 접근 경계

- SQL은 parameter binding으로 실행한다. 동적 정렬·컬럼 등 바인딩할 수 없는 식별자는 허용 목록으로 제한한다. repository가 request·response·React 타입에 의존하지 않게 한다.
- 여러 repository의 변경은 service가 연 트랜잭션의 같은 `pg` client를 전달해 실행한다. 트랜잭션 안에서 pool로 별도 쿼리를 보내거나 repository마다 commit해 원자성을 깨지 않는다. 실패 시 rollback하고 client는 반드시 반환한다.
- version·현재 가입·소유·연결 제약은 저장 직전 잠금·조건부 변경·DB 제약으로 보호한다. 먼저 조회하고 나중에 저장하는 검사만으로 동시 요청을 막았다고 보지 않는다. 모든 관계 변경은 [공통 잠금 순서](../../specs/002-shared-contracts/data-model.md#9-함께-저장할-범위와-잠금-순서)를 따른다. 기능별 계획에서는 이 순서에 맞는 잠금 대상·실행 절차·고유 제약과 계약의 충돌 결과를 구체화한다.
- 제품의 업무 변경·사건·OutboxEntry·성공 receipt는 [공통 원자 저장 범위](../../specs/002-shared-contracts/data-model.md#9-함께-저장할-범위와-잠금-순서)에 따라 같은 DB 트랜잭션으로 commit한다. 작업은 commit 이후 outbox dispatcher가 pg-boss에 전달하며, 사건·전달 순서와 재전달 처리는 [작업 계약](../../packages/contracts/conventions.md#파일업로드이력작업--c08c11)을 따른다. 직접 enqueue로 이 경로를 대체하지 않는다. 외부 파일 처리·푸시 호출을 긴 DB 트랜잭션 안에서 기다리지 않는다.
- 멱등 receipt와 업무 중복 제약을 함께 설계한다. 같은 키의 입력·버전 결합, 현재 권한 재검사, 삭제 결과 재생성 금지는 계약 원본을 따른다. 합성 job 표식 검사는 제품 멱등성의 완료 증거가 아니다.
- SQL 변경은 `db/migrations/`의 runner 규칙에 맞춰 추가한다. 적용된 파일을 수정·제거하지 않고 새 migration으로 고친다. 번호 충돌과 공용 변경 담당을 먼저 확인하며 실제 빈 DB·업그레이드 DB의 실행 결과를 구분한다. 초기 운영 자료와 시험 fixture를 migration에 임의로 섞지 않는다.

물리 테이블·인덱스·삭제 제약은 [논리 데이터 모델](../../specs/002-shared-contracts/data-model.md)과 각 기능의 설계에서 구체화한다. 개인 자료·공동 참석·파일의 삭제 영향은 [기록 관계 설계](../record-relationships.md)를 따른다.

## API와 worker의 코드 공유

worker는 HTTP controller를 거치지 않고 필요한 업무 서비스를 조립한다. 업무 모듈을 가져오는 것만으로 HTTP listen·worker 시작·migration이 실행되지 않게 하며 시작 부작용은 각 진입점에서 관리한다. 설정·DB·대기열·저장 어댑터의 수명과 종료 순서를 명시한다.

작업 payload는 공통 runtime의 job·사건·저장소 계약을 사용한다. 개인 본문·파일 bytes·토큰을 payload나 로그에 복사하지 않는다. 다시 전달된 작업은 현재 상태와 업무 식별자로 중복 효과를 막고 실패를 성공으로 삼키지 않는다. 영상·삭제·알림의 실행 경계와 재시도는 [기술·운영 명세](../technical-spec.md#2-서버db푸시--확정)를 따른다.

파일 접근 회수와 물리 삭제를 구분한다. 파일 전달은 매 요청·Range 요청에서 현재 접근을 검사하며 저장 경로나 storageKey를 클라이언트에 노출하지 않는다. 저장소 교체·재개·변환 완료와 삭제의 경합은 011·021에서 설계·검증한다. 현재 개발 전용 합성 worker를 운영 처리기로 간주하지 않는다.

## 의존 방향과 공개 진입점

| 경계 | 규칙 |
|---|---|
| 앱 밖 | contracts의 공개 export만 소비. 모바일·어드민 소스와 계약 내부 generated 경로를 직접 import하지 않음 |
| HTTP와 업무 | controller가 service를 호출. service·repository·worker 업무 코드가 controller나 HTTP request/response를 역참조하지 않음 |
| 업무 간 | 다른 업무는 필요한 service의 명시적 입력·결과를 사용. 순환 모듈 의존을 자동으로 forwardRef로 숨기지 않고 책임을 재검토 |
| 기반 도구 | DB·설정·로그·저장 어댑터는 업무 controller를 참조하지 않음. 공용이라는 이유로 업무 모델을 contracts에 옮기지 않음 |
| 생성물·비밀 | dist와 계약 생성물을 수기로 수정하지 않음. 환경값·개인 요청/응답·인증자료는 공유 로그와 fixture에서 제외 |

현재 lint가 모든 모듈 경계를 강제하는 것은 아니다. 실제 모듈 도입 시 코드 리뷰와 필요한 자동 검사를 함께 정한다.

## 명명 규칙

기존 TypeScript ESM 설정과 `.js` 상대 import를 유지한다. NestJS 파일은 `schedules.module.ts`·`schedules.controller.ts`·`schedules.service.ts`처럼 책임을 나타내고 클래스는 PascalCase, 함수·변수는 camelCase로 쓴다. SQL 파일명은 현재 runner의 숫자 접두사·소문자 규칙을 따른다. DB 명명과 계약 필드의 변환은 repository/응답 구성 경계에 둔다. 함수 설명은 [프로젝트 주석 규칙](../work-rules.md#코드-주석)을 따른다.

## 검증 방법

명령과 시험 DB 분리는 [개발 안내](../development.md#실행과-완료-확인)를 따른다. 서버 변경은 해당 workspace lint·typecheck·test·build, 공통 계약 변경은 생성·소비 검사, 문서 변경은 문서 검사를 수행한다.

| 검사 | 확인할 결과 |
|---|---|
| 단위·합성 계약 | 입력 변환·업무 경계·오류 매핑. mock 통과와 실제 DB 효과를 구분 |
| 실제 시험 DB | migration·제약·rollback·동시 변경·멱등·업무 변경과 작업 등록의 원자성 |
| HTTP·인증 | 정상/거절·헤더·projection·세션 회수·관리자 cookie/CSRF/Origin. 존재 정보 유출도 검사 |
| worker·파일 | 재전달·중단/재시작·삭제 경합·접근 회수·실제 bytes·외부 발송의 수행 여부 |
| 앱·웹 연동 | 같은 계약의 실제 성공·실패·충돌·재요청을 기능 FR·SC와 대조 |

루트 기본 check와 서버 단위 test가 실제 DB·운영 worker·외부 제공자·기기 검사를 대신하지 않는다. 미수행 범위는 명시하고 기능 완료는 해당 스펙에서 판단한다.

## 기준 문서

- [공통 아키텍처](../architecture.md)
- [공통 계약](../../packages/contracts/README.md)
- [실행과 검사](../development.md)
- [개발 역할과 공통 파일 변경 기준](../../specs/development-roles.md)
- [서비스별 문서 목차](README.md)

# 004 관리자 API·초기 계정 도구 단독 검증

2026-10-14, #52의 T011·T012·T022를 로컬 macOS ARM64 / Node24.21.0 / npm11.19.0 / PostgreSQL17.11 시험 DB에서 수행했다. 기준은 [004 FR-006](../../../specs/004-identity-profile/spec.md), [계약](../../../specs/004-identity-profile/contracts/README.md), [초기 관리자 절차](../../../specs/001-development-foundation/contracts/admin-bootstrap.md)다. 설정과 명령은 [개발 안내](../../development.md#관리자-인증-api와-초기-계정-도구)가 현재 원본이다.

## 구현과 확인 결과

- 별도 ServiceAdministrator의 Argon2id 비밀번호로 로그인하며 일반 회원 Bearer·cookie 및 클라이언트의 크루 관리자 역할/주체 표식은 관리자 인증으로 사용하지 않는다. 모바일과 관리자 모듈을 동시에 켠 HTTP 검사에서 상호 거절을 확인했다.
- 생성 계약 검사로 adminLogin/adminLogout의 입력을 검증한다. 응답은 AdminSession의 principalId·csrfToken·expiresAt이며 cookie secret은 JSON에 없다. Set-Cookie의 host-only·HttpOnly·Secure·SameSite=Lax·Path=/api/v2/admin과 로그아웃의 같은 속성 제거를 확인했다.
- session/guard가 저장소의 현재 active·revoked·idle30분·absolute8시간을 잠금 뒤 다시 검사한다. idle만 갱신하고 absolute는 유지한다. CSRF는 독립 서버 키와 cookie/session으로 재구성하고 DB에는 hash만 저장한다. 재조회 안정성·세션 간 교차 거절·키 변경 무효화를 확인했다.
- 쓰기 Origin은 정확한 HTTPS 허용 목록과 비교하고 CSRF를 함께 검사한다. 관리자 CORS는 관리자 목록만 사용한다. foundation HTTP Origin은 관리자 응답 읽기를 허용하지 않는다.
- `withAdministrator`는 principal→session 잠금과 업무 callback을 같은 client/TX로 실행한다. 업무 실패의 activity/업무 rollback 및 교체 후 callback 실행0건을 검사했다. 006/019 실제 업무 API의 구현 결과는 아니다.
- bootstrap 최초 생성은 create-only/active=true다. 동일 식별자 재실행·동시 생성, 명시적 expected-version 교체·동시 교체·없는 계정·비활성 유지·전체 세션 회수를 확인했다. 해시/SQL 실패는 기존 credential/version/session을 보존한다. 교체 전 검증을 마친 오래된 로그인도 세션을 발급하지 못한다.
- 로그인 SQL 실패 HTTP503에는 cookie와 원시 SQL/합성 비밀 표식이 없고 새 세션도 없다. 로그아웃 SQL 실패는 기존 세션을 유지한다.

CodeRabbit의 응답 시간/검증 동시성 지적을 반영했다. 없는 계정은 캐시한 dummy Argon2id hash, 비활성 계정은 저장 hash로 검증한 뒤401을 반환한다. 프로세스 선제 제한과 PostgreSQL 공유 advisory slot2개로 여러 API의 비밀번호 작업을 제한하고 포화 시 해시 실행0건/503을 확인했다. 검증 실패 뒤 slot 해제와 복구도 검사했다.

## 실행 증거

비밀번호·해시·token·cookie·DB 접속 비밀은 이 기록에 남기지 않았다. fixtures는 검사 안에서 생성/정리했다. 시험 DB URL은 비공개 로컬 환경으로 주입했다.

| 검사 | 결과 |
|---|---|
| `npm run check` | lockfile·contracts·전체 lint/typecheck·단독75개·웹/API 빌드 통과 |
| `npm run test:foundation --workspace @holdlog/server` | 실제 시험 DB/worker 포함64개 통과, skip0 |
| 관리자 DB/HTTP | 위64개 중 `admin-auth.e2e-spec`11개 통과 |
| bootstrap 입력 단위 | 위 검사 중3개: 인수 제한·숨김/취소·분할 UTF-8/non-TTY 거절 |
| 실제 PTY의 CLI 실행 | 합성 create·중복·replace·stale version·Ctrl-C·확인 불일치6건. 원문 echo0, terminal 상태 복구, 종료 코드 확인 |
| Argon2 비용 표본 | 0.45.1 / memory65536 KiB / time3 / parallelism4, 합성 1회 hash36ms·verify32ms. 부하/운영 용량 측정은 아님 |
| 문서·정적 계약·diff | `python3 scripts/check-docs.py`, `python3 scripts/check-contracts.py`, `git diff --check` 통과 |

실제 PTY 검사에서 입력 listener를 제거해도 처음 읽기 전의 stdin 흐름 상태 때문에 CLI 종료가 지연되는 문제를 발견했다. 입력 전 흐르지 않던 stdin을 다시 pause하고 raw 상태를 복구하도록 수정한 뒤6건을 재실행했다. split UTF-8 입력도 decoder로 보존한다.

## 남은 범위

#54 관리자 웹 Provider/전송·개발 HTTPS 도구, #57 신뢰 HTTPS 브라우저의 Secure cookie 저장·자동 전송과 CSRF/Origin 실제 연동은 미수행이다. Node HTTP 검사의 수동 Cookie 헤더를 브라우저 통과로 합산하지 않는다. 006/019 실제 관리자 업무·운영 배포·운영 계정 생성도 수행하지 않았다. #45 전체 완료는 나머지 작업과 실제 연동 증거가 필요하다.

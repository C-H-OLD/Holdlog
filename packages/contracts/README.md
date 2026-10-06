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

여기에는 TypeScript 런타임 코드·서비스 controller·DB migration을 만들지 않았다. 후속001에서 생성 도구 버전을 고정하고 이 원본으로 소비자 DTO·검사·mock을 생성한다. 제품 규칙은 [기능 원본](../../docs/functional-spec.md)을 따른다.

정적 확인은 저장소 루트에서 `python3 scripts/check-contracts.py`와 `python3 scripts/check-docs.py`로 실행한다. 정적 검사는 실제 인증·권한·DB 트랜잭션·파일 bytes·기기 동작을 증명하지 않는다.

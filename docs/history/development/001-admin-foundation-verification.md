# 001 관리자 웹 기반 단독 검증

검증일: 2026-10-07 · 범위: [#6](https://github.com/trycatch98/Holdlog/issues/6), [001/T013·T020](../../../specs/001-development-foundation/tasks.md). Node24.21.0·npm11.19.0과 기존 lockfile의 React19.3.0·Vite8.3.3을 사용했다. 의존성·공통 계약을 변경하지 않았다.

## 수행 결과

- `npm ci --ignore-scripts`: 고정 workspace 설치 성공.
- `npm test --workspace=@holdlog/admin`: 9개 검사 통과. health200·ready503·fetch 거절·proxy502·잘못된 status/body·JSON·추가 필드와 5초 제한을 확인했다.
- 실제 Vite 개발 서버와 합성 Node HTTP 서버를 실행해 HTML·React 모듈 제공, 상대 제품/health 경로 proxy, Origin·쿠키 보존, 비대상 경로 차단을 확인했다. 합성 upstream 종료는 연결 실패로 반환됐다. proxy 오류에 요청 쿼리·원시 스택이 출력되지 않았다.
- 누락·공개 호스트·잘못된 개발 origin은 설정 이름만으로 실패했다. 빌드·미리보기에는 해당 설정을 요구하지 않았다.
- 운영 빌드를 만들고 전체 JS 번들에서 합성 서버/DB/Vite 비밀 표식과 개발 health 도구의 미포함을 확인했다.
- 생성 HTTP 타입과 standalone validator로 합성 AdminSession의 정상/거절 입력을 소비했다.

- `npm run check`: 계약 회귀13개·도구 회귀14개와 모든 workspace lint/타입 검사 통과.
- `npm run build --workspace=@holdlog/admin`: HTML·운영 React 번들 생성 성공. 설정 없이 `npm run dev --workspace=@holdlog/admin`은 종료 코드1과 설정 이름을 반환했다.
- `/usr/bin/python3 scripts/check-docs.py`, `scripts/check-contracts.py`, `git diff --check`: 오류 없음.

## 경계와 후속 범위

현재 화면은 React mount만 존재한다. 새 제품 화면·인증·업무 API를 추가하지 않았다. 실제 브라우저와 Nest API/DB의 정상·DB 중지·네트워크 실패 검사는 [#10](https://github.com/trycatch98/Holdlog/issues/10)의 T022에서 수행한다. 모바일 실행은 #7, 루트 실행·검사 명령은 #9 범위다. C02 관리자 인증의 HTTPS/Secure/CSRF 조건을 완화하지 않았다. 스펙 상위 #1은 남은 구현·연동을 계속 추적한다.

실행 방법은 [개발 시작 안내](../../development.md#관리자-웹-단독-실행), 기준은 [001 인터페이스](../../../specs/001-development-foundation/contracts/README.md)를 따른다.

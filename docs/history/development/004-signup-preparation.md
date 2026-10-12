# 004 가입 설계·계약 전환 검증

2026-10-12 · 07.02 화면 문서 PR #47 병합 뒤 004 개발 준비를 검사했다. 제품 인증 API·SQL migration·모바일 가입 UI 구현과 외부 제공자/실기기 연동은 미수행이다.

## 원본과 범위

[004 계획](../../../specs/004-identity-profile/plan.md)·[가입 처리](../../../specs/004-identity-profile/signup-design.md)·[작업 목록](../../../specs/004-identity-profile/tasks.md)을 기준으로 한다. HTTP/runtime 형식과 해시는 [생성 manifest](../../../packages/contracts/generated/manifest.json)가 원본이다. 기존 MobileSession 단일 로그인 응답에서 신규/기존 분기와 가입 완료 명령을 분리하는 breaking 변경으로 계약3.0.0·API v2를 준비했다.

## 수행한 검사

- 고정 Node24.21.0·npm11.19.0으로 별도 worktree에 의존성을 설치했다. 기본 npm cache 쓰기 제한 때문에 임시 cache를 사용했으며 dependency/lockfile 변경은 없다.
- `npm run contracts:generate`: 13개 생성물 생성. 수기 수정하지 않았다.
- `npm run check`: 계약17·tooling14·runner10·admin9·mobile6·server4, 총60개 테스트 통과. workspace lint/typecheck·admin/API build 통과. OpenAPI 미사용 schema 경고3개는 기존 항목이다.
- 계약 예제: HTTP26개·runtime7개 수락, 거절11개. 기존/신규 분기·가입 입력/결과·07.02 Route·혼합 응답·빈/누락 이름·증명 누락·unknown JSON과 SIGNUP_ALREADY_COMPLETED 오류를 포함한다. 형식 검사는 실제 권한·proof 만료/소비·DB 원자성을 증명하지 않는다.
- `python3 scripts/check-docs.py`, `python3 scripts/check-contracts.py`, `git diff --check` 통과. 현재 모바일43화면/90상태·웹3화면/5상태와 Route를 대조했다.
- Spec Kit prerequisites의 대상이004임을 확인했다. FR6·SC4 전부 작업에 연결됐고, T001~T032의 중복/누락과 미해결 placeholder는 없다. 스펙·설계·작업의 선행/역할·후속 기능 연결을 읽기 전용으로 분석했다. 남은 충돌·누락은 발견하지 않았다.
- 독립 에이전트 리뷰에서 개발 안내의 v1 경로와 가입 증명 개인정보 정리 작업 누락을 확인했다. 안내를v2로 맞추고 T030에 정리 실행·worker 연결·재시도·유효 증명/잠금/receipt 보존 검사를 배정했다. 재리뷰에서 해결을 확인했다.

## 남은 검증

실제 DB·Google/Apple 제공자·HTTPS cookie·iOS/Android 개발 빌드·SecureStore·011 사진 bytes·005/017/021 교차 연동은 미수행이다. 각 역할/연동 작업에서 증거를 만들며 이 기록으로004 전체 완료나 T006 PR 병합을 표시하지 않는다.

## PR #60 리뷰 보완 — 2026-10-13

CodeRabbit 지적의 가입 충돌 오류가 생성 validator에서 거절됨을 합성 예제로 재현한 뒤 Error.code enum과 생성물을 수정했다. 동일 증명/키 경합은 미커밋 receipt 조회로 판정할 수 없어 비대기 transaction advisory 진입 잠금과 상태 재조회 순서를 명시하고 T021/T030에201/409·단일 계정/세션·token 재반환0건·완료 후401 검사를 배정했다. 실제 동시성 구현/DB 검사는 후속 작업이며 이 문서 수정으로 수행했다고 표시하지 않는다.

# 계약 설계 읽기·전달 안내

실제 계약 원본은 [packages/contracts](../../../packages/contracts/README.md)다. 여기에 HTTP 필드·runtime 열거값을 복사하지 않는다.

- [설계 범위](../contract-scope.md): C01~C12 책임·소비 기능과 원본 정책
- [설계 계획](../plan.md) · [선택 이유](../research.md)
- [논리 데이터 모델](../data-model.md)
- [검증과 전달](../quickstart.md)
- [프론트·백엔드 역할](../../development-roles.md)

프론트는 OpenAPI operationId와 Runtime의 Route/기기 자료를 사용한다. 백엔드는 동일 입력·응답과 데이터 모델을 구현하며 Runtime의 worker/storage 자료를 사용한다. 테스트 기대 동작은 기존 T번호·각 기능의 FR 검증 연결을 따른다. 생성 DTO·검증기·mock은 같은 JSON 원본에서 만들며 소비자 확인 결과를 각 작업에 기록한다.

현재 설계 파일·합성 형식 예제·에이전트의 생성 소비 검사는 작성/수행했다. 담당 개발자의 실제 제품 서버/기기 연동 승인을 뜻하지 않는다. 운동 시작 A/B는 미정, 표시줄은 기록 탭만·UI 겹침 허용, 공지 개선은 승인 상태다.

## 수신 알림 목록 추가에 따른 남은 계약

[수신 목록·읽음 제품 원본](../../../docs/functional-spec.md#notification-inbox)과 승인05.07 Route를 계약2.1.0에 연결했다. 조회·단건 읽음·전체 읽음의 원본은 [OpenAPI](../../../packages/contracts/openapi.json)·[C09 처리 의미](../../../packages/contracts/conventions.md#수신-목록과-읽음--c09), 저장 관계는 [논리 모델](../data-model.md#수신-목록읽음-저장--c09)이다. 누르면 읽음, 설정과 무관한 목록 생성은 사용자 확정이며 추가 선택 대기가 아니다.

같은 원본의 합성 형식/실패 예제·생성 소비는002에서 확인한다. 실제017 FR-005~006·T82~T85의 서버 권한·원자 저장·재요청/새 수신·알림 화면/대상 진입·실제 푸시는 후속 구현 검사다. 생성 DTO 통과를 제품 동작 완료로 표시하지 않는다.

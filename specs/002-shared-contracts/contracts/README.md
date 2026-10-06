# 계약 설계 읽기·전달 안내

실제 계약 원본은 [packages/contracts](../../../packages/contracts/README.md)다. 여기에 HTTP 필드·runtime 열거값을 복사하지 않는다.

- [설계 범위](../contract-scope.md): C01~C12 책임·소비 기능과 원본 정책
- [설계 계획](../plan.md) · [선택 이유](../research.md)
- [논리 데이터 모델](../data-model.md)
- [검증과 전달](../quickstart.md)
- [프론트·백엔드 역할](../../development-roles.md)

프론트는 OpenAPI operationId와 Runtime의 Route/기기 자료를 사용한다. 백엔드는 동일 입력·응답과 데이터 모델을 구현하며 Runtime의 worker/storage 자료를 사용한다. 테스트 기대 동작은 기존 T번호·각 기능의 FR 검증 연결을 따른다. 생성 DTO·검증기·mock은 같은 JSON 원본에서 만들며 소비자 확인 결과를 각 작업에 기록한다.

현재 설계 파일과 합성 형식 예제는 작성했으며 담당 개발자의 실제 생성 소비자 확인·서버/기기 실행 검사는 아직 없다. 운동 시작 A/B는 미정, 표시줄은 기록 탭만·UI 겹침 허용, 공지 개선은 승인 상태다.

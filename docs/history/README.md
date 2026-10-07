# 결정·작업 기록

현재 기능을 개발하는 데 필요한 규칙은 상위 명세에서 관리한다. 이 폴더는 결정 이유·검토한 대안·당시 계획·제작·검증 결과를 보관하며, 평소 개발의 필수 읽기 대상이 아니다.

| 위치 | 내용 |
|---|---|
| decisions/ | 결정과 문서 구조 변경의 이유·근거 |
| figma/ | 과거 Figma 작업 계획·노드 변경·검증 보고서 |
| development/ | 개발 작업의 실제 설치·검사 결과와 미수행 범위 |
| tools/ | 실행을 중지한 과거 일회성 문서 갱신 코드 |
| design-generation/ | 초기 시안 생성 과정·프롬프트·검사 기록 |

현재 기준은 [문서 안내](../README.md), 현재 사진과 노드는 [Figma 자료 안내](../figma/README.md)를 따른다. 각 기록은 작성 당시의 상태이며 이후 수정된 규칙이나 화면보다 우선하지 않는다.

새 기록은 해당 폴더에 날짜·주제·결정 이유·영향받는 현재 명세 링크를 적는다. 현재 명세 본문에 논의 과정이나 이전 규칙을 반복하지 않는다.

- [2026-10-06 공통 개발 준비 검증](development/001-shared-foundation-verification.md)
- [2026-10-06 Spec Kit 도입](decisions/2026-10-06-spec-kit-adoption.md)
- [2026-10-06 문서 역할 분리](decisions/2026-10-06-document-structure.md)

- [운동 시작 방식 비교](decisions/workout-start-options.md)
- [기술 선택·지도 정책 조사](decisions/technical-selection.md)
- [화면 설명에서 분리한 과정 기록](decisions/2026-10-06-remaining-design-notes.md)

이동 전 상태 스냅샷의 `_archiveMetadata.originalBase`는 원래 상대경로 기준 폴더다. 제거한 사진은 해당 보고서의 `artifactStatus=removed`·`removedPath`로 남기며 현재 파일 링크로 검사하지 않는다.

# Figma 현재 작업

갱신일: 2026-10-06 · [Holdlog Figma](https://www.figma.com/design/vla4pXPo8FaCWFXfpIbYzx/Holdlog)

## 현재 상태

- 모바일41개 화면·88개 상태·41개 옆 명세. 너비390.
- 관리자 웹3개 화면·5개 상태·3개 옆 명세. 너비1440.
- 오픈소스 안내는 사용자 확인을 마쳤다. 공지 팝업을 다듬고 관리자 삭제 버튼·확인창을 추가했으며 수정안은 사용자 승인을 마쳤다.
- 상세 메뉴·날짜·시간 선택창은 확정됐으며 해당 일정 작성·상세와 기록 상세 섹션에 배치했다. [현재 위치·검증](../history/figma/shared-overlays-placement-2026-10-06.json).
- 운동 표시줄은 기록에만 표시한다. 달력·목록에 적용했으며 다른 UI와의 겹침을 허용한다. 표시줄 때문에 화면 높이를 늘리지 않는다.
- 운동 시작 A·B 선택은 나중에 정한다. 나머지 적용 작업은 [작업 목록](../screen-worklist.md)을 따른다.

시안 검수와 실제 앱 구현·동작 검증은 구분한다.

## 기준 문서

[화면 번호표](../screen-numbering.md) · [화면 설계](../screen-design.md) · [디자인 시스템 규칙](../figma-design-system.md) · [운동 명세](../workout-recording-spec.md) · [관리자 명세](../admin-spec.md) · [상태 자료](./state.json)

## 사진과 검증 자료

| 자료 | 사진 | 노드·검증 |
|---|---|---|
| 기록 작성 선택 버튼 | [기록 종류](./assets/choice-button-colors-2026-10-06/02.03.04.png) · [작성 방법](./assets/choice-button-colors-2026-10-06/02.08.04.png) | [색상 구분 검증](../history/figma/choice-button-colors-2026-10-06.json) |
| 공지·오픈소스 추가 화면 | [사진](./assets/announcements-licenses-2026-10-06/review.html) | [공지 수정 검증](../history/figma/announcements-refinement-2026-10-06.json) · [닫기 가운데 정렬](../history/figma/announcement-button-alignment-2026-10-06.json) |
| 앞선 전체 기본 화면 | [41개 화면](./assets/screen-completeness-audit-2026-10-05/review.html) | [확인 결과](../history/figma/screen-completeness-audit-2026-10-05.json) |
| 운동 기록·표시줄·알림·시작 비교안 | [사진](./assets/workout-recording-2026-10-05/review.html) | [운동](../history/figma/workout-recording-2026-10-05.json) · [달력 표시줄](../history/figma/workout-calendar-bar-2026-10-05.json) · [A·B](../history/figma/workout-start-ab-2026-10-05.json) |
| 상세 메뉴·날짜·시간 선택 | [구성 사진](./assets/shared-menus-pickers-2026-10-05/review.html)(배치 정리 전) | [구성 검증](../history/figma/shared-menus-pickers-2026-10-05.json) · [현재 배치 검증](../history/figma/shared-overlays-placement-2026-10-06.json) |
| 브랜드·암장 폼·나가기 확인 | [사진](./assets/brand-gym-correction-2026-10-02/review.html) | [검증](../history/figma/brand-gym-correction-2026-10-02.json) |
| 기간 선택·관리자 웹 | [사진](./assets/period-admin-web-2026-10-02/review.html) | [자료 안내](../screens.md#사진과-검증-자료) |
| 앞선 검수의 수정 부분 | [사진](./assets/final-parity-audit-2026-10-02/review.html) | [검증](../history/figma/final-parity-audit-2026-10-02.json) |

사진과 날짜가 있는 검증 자료는 해당 시점의 결과다. 현재 모습은 번호표의 Figma 링크와 최신 수정 사진을 우선한다. 옛 제안을 새 요구사항으로 사용하지 않는다. 실제 앱 동작·권한·기기 검증은 구현 후 진행한다.

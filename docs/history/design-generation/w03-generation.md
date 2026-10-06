# W03 일반 회원 크루 정보 생성 기록

- 생성일: 2026-09-29
- 방식: 내장 이미지 생성 도구
- 결과: [W03 검토 시안](../../assets/screens/41-crew-info-member-w03.png)
- 범위: 일반 회원 크루 정보 한 화면. 탈퇴 확인창은 별도 화면이다.
- 확인: 크루 정보·월요클럽·크루원 수·일반 회원 역할·메뉴 네 개 표시. 기록 보존 안내와 하단 메뉴 없음. 메뉴 행 간격을 맞춘 검토 시안이며 실제 구현 시 동일 행 높이를 적용한다.

## 최초 프롬프트

```text
Use case: precise-object-edit.
Asset type: W03 Holdlog Korean mobile app crew information screen, ordinary member state.
Edit target: the supplied existing crew information screenshot. Create one polished portrait mobile screen matching its exact proportions and visual style.
Keep white background, black bold title '크루 정보', small blue-gray back arrow upper left, pale lavender round crew avatar, crew name '월요클럽', subtitle '크루원 4명', purple pill '내 역할 · 크루원'. Preserve generous space and existing alignment. No phone frame or bottom navigation.
Below the header, render exactly FOUR menu rows bounded by FIVE thin pale lavender horizontal dividers. CRITICAL: all four rows must have EXACTLY IDENTICAL height (for example 152 image pixels), equal vertical center alignment, identical label font size AND weight (regular, including red leave label), identical outline icon dimensions and stroke weights, same left margins, and chevrons at the same right edge.
Rows in order:
1. group outline icon, '크루원', trailing '4명' and chevron.
2. QR outline icon, '초대 코드 · QR · 링크', chevron.
3. calendar outline icon, '이 크루 일정 보기', chevron.
4. red exit outline icon, red REGULAR WEIGHT label '크루 탈퇴', blue-gray chevron. This row is the same height as every other row, no extra padding.
Keep the entire lower area below the fourth row blank white. Do not include '개인 기록과 사진은 그대로 남아요' or any helper text, dialog, administrator tools, account deletion, footer or extra menu. Sharp correct Korean lettering. Output only the single screen.
```

## 간격 조정 프롬프트

```text
Use case: precise-object-edit. Edit this Korean mobile screen only in its four-row navigation list. Keep header/crew summary/back arrow/white background exactly unchanged. CRITICAL regenerate the list using an exact equal-height grid: at the source 935x1683 proportions horizontal separators at y=534,686,838,990,1142 (scale proportionally if different resolution); four rows each exactly 152 pixels high. Row centers y=610,762,914,1066. Icons, label text and chevrons vertically center within each row. Labels all use exactly same regular Korean sans-serif size 38px and weight 400: '크루원', '초대 코드 · QR · 링크', '이 크루 일정 보기', '크루 탈퇴'. Last label must NOT be bold; only its color red distinguishes it. Left icons all same optical size and line thickness; last exit icon red. Trailing '4명' only first row; all rows same blue-gray right chevron. Keep left icon column x=80, label left x=167, chevrons x=876. Single portrait screen, preserve blank white bottom, no other content added. No helper text, no dialog, no bottom nav.
```


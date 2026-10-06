# 프로필 수정 화면 생성 기록

- 생성일: 2026-09-29
- 담당: Astra 서브에이전트
- 생성 방식: built-in `image_gen__imagegen`
- 분류: ui-mockup
- 상태: 사용자 검토용 시안
- 결과: `39-profile-edit-v2.png`
- 참고 이미지: `25-my-account-v2.png`, `39-profile-edit.png`
- 기준: `docs/screen-worklist.md` W01, `docs/functional-spec.md` S16

## 눈으로 확인한 내용

생성된 화면을 직접 열어 뒤로가기, ‘프로필 수정’ 제목, ‘민’ 아바타, ‘사진 변경’, ‘이름’ 입력칸의 ‘민수’, ‘Google 계정’과 이메일, 빨간 ‘계정 삭제’ 메뉴행, 보라색 ‘저장’ 버튼을 확인했다. 표시 문구의 오탈자는 보이지 않는다. 이메일은 입력칸이 아닌 일반 글자로 표시했다. 크루 관련 내용, 하단 탭, 계정 삭제 확인창은 없다. 흰 배경, 검정 제목, 청보라색 글자·아이콘과 연보라색 구분선은 참고 화면 스타일을 따른다.

이미지 시안이므로 버튼 동작과 실제 저장·삭제 기능은 구현한 것이 아니다. 사용자 최종 승인은 받지 않았다.

## 최종 프롬프트

```text
Use case: ui-mockup.
Create exactly ONE polished mobile app screen image for Holdlog in Korean, a refined new version of the profile edit screen. Portrait image, same tall ~853:1844 aspect ratio as the references. Full-bleed flat white canvas, no device frame, no presentation board.
Reference image 1 (25-my-account-v2.png): visual style only. Match large bold black Korean title, clean Korean sans-serif, blue-violet secondary text and outline icons, very light lavender horizontal separators, generous white space.
Reference image 2 (39-profile-edit.png): layout and content reference for the profile edit screen. Preserve its overall composition and visual family with tidy consistent alignments. Produce a fresh crisp rendering of this screen.
Layout from top to bottom: a blue-violet back arrow near upper-left; large heavy black title “프로필 수정” beneath. Center a pale lavender circular default avatar containing a large blue-violet Korean “민”, with purple text action “사진 변경” below it. Left-aligned label “이름” and a wide rounded very pale lavender input field containing “민수”. Next, a “로그인 계정” section, a small Google G logo on left, and read-only blue-violet text “Google 계정” with “minsu@example.com” on next line. This is account information, NOT editable: no input border, pencil, or dropdown. Below, a full-width menu row between fine lavender divider lines with a red outline trash icon, red text “계정 삭제”, and a small blue-violet right chevron. The delete row is inside this profile edit screen and only opens a confirmation later; DO NOT show any dialog now. Retain spacious white area before an anchored wide solid vivid purple rounded “저장” button near the bottom; white bold button text. Match reference element proportions and comfortable side padding.
Exact visible Korean/Latin text only: “프로필 수정”, “민”, “사진 변경”, “이름”, “민수”, “로그인 계정”, “Google 계정”, “minsu@example.com”, “계정 삭제”, “저장”.
All text must be sharply legible, correctly spelled, professional real app typography, no duplicated labels. Keep interface restrained and consistent.
Exclude bottom navigation tabs, crew information, crew leave actions, preservation messages, logout, unrelated menus, explanatory notes, status bar, mockup phones, extra panels, multiple screens, overlays, watermarks.
```


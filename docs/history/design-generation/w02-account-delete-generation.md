# W02 계정 삭제 확인창 생성 기록

- 생성일: 2026-09-29
- 방식: 내장 Image Gen
- 이미지: [계정 삭제 확인창](../../assets/screens/40-account-delete-dialog.png)
- 상태: 검토용 시안. 프로필 수정에서 계정 삭제를 누른 상태다.
- 확인: 개인 기록·사진·영상·로그인 정보 삭제, 공동 기록 유지·작성자 익명화 안내, 같은 크기의 취소·계정 삭제 버튼을 확인했다.
- 이 시안은 관리자 역할이 남아 있지 않아 삭제할 수 있는 상태다. 관리자 역할이 남은 경우에는 기능 명세 B05에 따라 삭제를 막고 관리자 넘기기로 안내한다. 해당 별도 상태는 이번 이미지에 포함하지 않았다.

## 생성 프롬프트

```text
Use case: precise-object-edit.
Create exactly one high fidelity Korean mobile UI screen: W02 account deletion confirmation dialog for Holdlog.
Input image 1 is the edit target: preserve its profile-edit screen, portrait aspect ratio, Korean text, layout and colors exactly as a background. Input image 2 is only the modal style reference: white rounded dialog, subdued indigo body text, dark bold heading, thin light lavender horizontal and vertical separators, equal-width bottom action cells, neutral cancel and red destructive action. Do not copy its crew text or crew background.
Overlay the first image with a uniform dark translucent scrim, leaving the profile edit heading, avatar and bottom save button recognizable. Center a clean white rounded dialog with generous inner spacing. Size it wide enough for legible Korean copy, approximately 86% of screen width. No device frame, no extra panels, no bottom tab navigation.
Dialog text must be exactly:
Title: "계정을 삭제할까요?"
Body, with these paragraph breaks:
"개인 기록, 사진·영상, 로그인 정보가
모두 삭제되며 복구할 수 없어요."

"크루의 공동 기록은 남지만,
작성자 이름은 표시되지 않아요."
Actions: left "취소" in muted indigo; right "계정 삭제" in red. Identical button height and width. Heading black and bold, body smaller with generous line-height. No checkbox, no input, no additional warning banners.
This is the deletable-account state. Do not show the administrator-transfer blocked state in this image. This is account deletion, never say personal records/photos remain. Only the crew's shared records remain and the author is anonymized. Keep the first reference background intact under the scrim. Crisp readable native Korean typography matching the supplied screens.
```

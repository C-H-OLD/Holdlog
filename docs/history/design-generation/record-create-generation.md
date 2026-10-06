# W06 개인 기록 작성 시안 생성 기록

- 날짜: 2026-09-29
- 담당: Astra 서브에이전트
- 생성 방식: 내장 `image_gen__imagegen` 이미지 편집. CLI/API 대체 방식 사용 없음.
- 결과: [19-record-create-v3.png](../../assets/screens/19-record-create-v3.png)
- 상태: **사용자 검토 대기**. 실제 앱 구현이나 승인 완료가 아님.
- 수정 대상: `19-record-create-v2.png`
- 스타일 참고: `19-record-create.png`
- 원본 생성 위치: `/Users/trycatch/.codex/generated_images/01a0ec36-8485-7342-b2c8-f5af8376d495/exec-eaacfd29-afb3-4fb7-9efc-7bba8f0c33e5.png`

## 화면 예시와 검사

실제 생성 이미지를 `view_image`로 열어 확인했다.

- 기록 작성 화면 한 장이며, 뒤로 버튼과 기록 저장 버튼이 모두 보인다. 하단 탭이나 확인창은 없다.
- 날짜 2026년 9월 28일, 시간 19:00, 암장 피크 성수에 필수 표시가 있다.
- 월요클럽의 크루 방문에 연결된 예시다. 같은 기준 날짜 안에서 시간 변경이 가능함과 다른 날짜·암장 변경에는 연결 해제가 필요함을 표시했다.
- 난이도 1~6단계를 숫자로 구분한다. 색상은 참고 시안에서 이어받은 보조 예시이며, 피크의 실제 공식 색상 규칙을 검증하거나 확정한 자료가 아니다.
- 입력값 4 + 3 + 3 + 2 = 12가 합계와 일치한다. 5단계와 6단계는 빈칸으로 남겼다. 최초 기본값이 아닌 작성 중 예시다.
- 컨디션 5단계와 좋음 선택이 보이며 별도 컨디션 메모는 없다.
- 사진 1개는 공개, 영상 1개는 나만 보기로 각 파일 아래 선택기를 따로 배치했다. 각 파일의 제거 버튼과 업로드 완료 표시도 보인다.
- 후기는 파일과 별도 선택기로 나만 보기를 표시했다.
- 공개한 사진·영상과 후기는 연결된 월요클럽만 볼 수 있다는 안내가 있다. 본문에 크루 이름과 화살표로 만든 이동 행은 없다.
- 한글 제목·라벨·안내·후기와 요소 잘림 여부를 육안으로 검사했고 명확한 오탈자나 누락을 발견하지 못했다.
- 선택기는 닫힌 상태를 보여 주는 정지 이미지다. 실제 선택 동작·저장·업로드 동작은 구현하거나 시험하지 않았다.

## 최종 생성 프롬프트

```text
Use case: ui-mockup edit.
Edit target: first reference image 19-record-create-v2.png. Second reference 19-record-create.png is supporting visual-style reference only. Produce ONE polished Korean mobile app record creation screen, no collage, no separate screens, no phone frame. Preserve the white background, bold large black Korean heading, indigo/purple accents, fine pale-lavender lines, clean rounded pale-gray input fields, typography and thin icons of the reference. Tall portrait image about 1000 x 2400, complete all content without clipping. This is an example already filled in by a user, not initial defaults.

Top: back chevron, big heading "기록 작성", small people-link icon badge by title and small ellipsis menu.
Form ordered vertically:
1. Label "날짜" and "필수" lavender pill. Calendar field "2026년 9월 28일 월요일" with right chevron (not locked).
2. Label "시간" and "필수". Clock field "19:00" with right chevron. Small help beneath: "같은 날짜 안에서 시간을 바꿀 수 있어요." then smaller "기준 날짜 2026.09.28 · 서울 시간".
3. Label "암장" and "필수". Preserve simple purple circular PEAK mountain logo, field "피크 성수", lock icon instead of navigation chevron. Below show small help "다른 날짜·암장으로 바꾸려면 연결을 해제해 주세요."
Use thin pale lavender separators between large sections.

4. Heading "완등 개수", purple right aligned "합계 12개". Six difficulty inputs in 3 columns and 2 rows, brand order with color small circles only secondary: yellow dot "1단계", orange dot "2단계", green dot "3단계", blue dot "4단계", red dot "5단계", purple dot "6단계". Values respectively 4,3,3,2,EMPTY,EMPTY. Each field has "개" right suffix. Never put 0 in the two blank fields. Help exact "난이도 숫자별로 개수를 입력해 주세요." Do not claim an official real-brand color standard; retain reference illustrative dots. Numerals and total must be correct: 4+3+3+2=12.

5. Heading "컨디션". Preserve exactly five selectable face icons with labels "매우 나쁨", "나쁨", "보통", "좋음", "매우 좋음". Select "좋음" purple border/face/text. NO extra condition note or memo.

6. Heading "사진 · 영상". Display a neat horizontal row of THREE equal cards: plus icon with "추가"; attached climbing-wall photo with x removal at top right; attached climbing video thumbnail with play triangle and "0:12", x removal. Directly under the PHOTO card show its own clearly tappable selector "공개" with down chevron. Directly under VIDEO card show its own selector with lock icon "나만 보기" and down chevron. Each file must clearly own its independent selector. No section-wide privacy switch. Small checkmark and "업로드 완료" under each file if room. One compact help sentence below attachments: "공개한 사진·영상과 후기는 연결된 월요클럽만 볼 수 있어요." It may wrap onto 2 lines. This is explanatory text, not a crew navigation row. No crew name plus right arrow row anywhere.

7. Heading "후기", independently show lock icon and dropdown "나만 보기" on same heading row at right. Text area with exact example "마지막 동작이 풀려서 뿌듯했어요." Small help below "후기 공개는 파일과 따로 선택해요."
8. Full-width indigo purple rounded button "기록 저장". Bottom white safe padding. No bottom tabs, no confirm dialog, no second screen, no watermark, no implementation terminology.

All Korean copy legible and spelled exactly; preserve airy spacing yet use portrait length needed to fit every field. White flat surface, no grain, no external border.
```


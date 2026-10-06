# 개발 시작 안내

## 현재 준비 상황

| 구분 | 상태 | 확인할 곳 |
|---|---|---|
| 개발 방식·로컬 Git | Spec Kit 1.1.0·Codex·Living Spec 설정 완료. GitHub 원격 저장소 미연결 | [개발 흐름](development-workflow.md) |
| 제품 범위·기능·권한 | 문서 작성 | [PRD](prd.md) · [기능 명세](functional-spec.md) |
| 기술 구성 | 선택 완료, 실제 구성·검증 전 | [기술·운영 명세](technical-spec.md) |
| 화면 | 시안 제작, 사용자 검토와 실제 구현은 별도 | [현재 시안](screens.md) |
| 개발 환경·앱·서버·관리자 웹 | 아직 구성·구현하지 않음 | [준비 체크리스트](setup-checklist.md) |
| 미결정 | 운동 시작 방식 A·B | [미결정 사항](open-questions.md) |

## 다음 작업

1. 서버 사양·개발 기기·개발자 계정·초기 운영 데이터를 확인한다.
2. [개발 기반 스펙](../specs/001-development-foundation/spec.md)에 따라 모바일·관리자 웹·API·공통 계약의 기본 구조를 설계하고 준비한다.
3. Expo 전용 개발 빌드를 만들고 로그인·지도·알림의 실제 기기 연동을 확인한다.
4. 데이터 관계와 API를 설계한 뒤 기능별로 구현한다.

진행 여부와 세부 준비 항목은 [준비 체크리스트](setup-checklist.md) 한곳에서 관리한다. 구현 순서는 기능의 선행 작업에 맞춰 조정하며 확정된 개발 순서로 취급하지 않는다.

개발 단계와 스킬 선택은 [Spec Kit 개발 흐름](development-workflow.md)을 따른다. 현재 첫 범위는 명세 작성까지 완료했으며 설계·구현은 아직 진행하지 않았다.

## 구현할 때 찾는 기준

| 구현 대상 | 동작·데이터 기준 | 화면 기준 |
|---|---|---|
| 일정 | [S03~S05](functional-spec.md#s03-일정-목록달력) · [상태](functional-spec.md#51-일정-상태와-방문-기록) | [일정](screen-design.md#screen-01-01) |
| 개인 기록·크루 방문 | [S08~S14](functional-spec.md#s08-기록-목록--전체--내-방문--크루-방문) · [기록 관계](record-relationships.md) | [기록](screen-design.md#screen-02-01) |
| 운동 중 기록 | [운동 명세](workout-recording-spec.md) | [02.13](screen-design.md#screen-02-13) |
| 암장·추천 | [선택](functional-spec.md#s06-암장-검색추천선택) · [지도](functional-spec.md#s23-암장-지도--확정) · [계산](functional-spec.md#54-암장-추천-계산) | [암장](screen-design.md#screen-03-01) |
| 통계 | [S15](functional-spec.md#s15-개인-통계) · [계산](functional-spec.md#53-통계-계산) | [통계](screen-design.md#screen-04-01) |
| 프로필·파일·알림 설정 | [S16](functional-spec.md#s16-내-정보알림-설정) · [S21](functional-spec.md#s21-내-사진영상-보관함) | [내 정보](screen-design.md#screen-05-01) |
| 크루·초대·관리자 이관 | [초대 가입](functional-spec.md#s02-초대-코드-입력qr-스캔초대-링크-가입) · [크루](functional-spec.md#s19-크루-목록선택생성가입) · [만들기·이관](functional-spec.md#s24-크루-만들기--첫-버전) | [크루](screen-design.md#screen-06-01) |
| 로그인 | [S01](functional-spec.md#s01-구글apple-로그인) | [로그인](screen-design.md#screen-07-01) |
| 앱 시작 공지·오픈소스 안내 | [S26 공지](functional-spec.md#s26-앱-시작-공지-팝업) · [S27 안내](functional-spec.md#s27-오픈소스-안내) | [남은 시안 작업](screen-worklist.md) |
| 서비스 관리자 웹 | [관리자 명세](admin-spec.md) | [관리자 웹](screen-design.md#admin-web) |


## 실행과 완료 확인

현재는 실행할 앱 코드가 없다. 기본 구조가 만들어지면 이 문서에 실제 설치·실행·검증 명령과 필요한 설정을 추가한다. 예정 명령을 실행 가능한 것처럼 적지 않는다.

기능 검증은 [기능 명세9절](functional-spec.md#9-기능-완료-확인-시나리오)의 T01~T80, [운동 검증 기준](workout-recording-spec.md#완료-확인-기준), 해당 [기능 스펙](../specs/README.md)의 완료 기준을 함께 확인하고, 제작된 화면은 현재 Figma와 대조한다. 시안 제작·문서 작성·앱 구현·기기 검증을 각각 구분해 기록한다.

문서 링크와 화면 번호는 프로젝트 루트에서 `python3 scripts/check-docs.py`로 확인한다.

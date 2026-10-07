# 개발 시작 안내

## 현재 준비 상황

| 구분 | 상태 | 확인할 곳 |
|---|---|---|
| 개발 방식·로컬 Git | Spec Kit 1.1.0·Codex·Living Spec 설정 완료. GitHub 원격 연결, 공개 저장소 상태 | [개발 흐름](development-workflow.md) |
| 제품 범위·기능·권한 | 문서 작성 | [PRD](prd.md) · [기능 명세](functional-spec.md) |
| 개발 단위·선행 관계·공통 계약 범위 | 21개 개발 단위·API/데이터 계약 설계 작성. 실제 소비자 연동 전 | [기능 스펙 목록](../specs/README.md) |
| 기술 구성 | 선택·[001 기반 설계](../specs/001-development-foundation/plan.md) 작성, 실제 구성·검증 전 | [기술·운영 명세](technical-spec.md) |
| 화면 | 시안 제작, 사용자 검토와 실제 구현은 별도 | [현재 시안](screens.md) |
| 개발 환경·앱·서버·관리자 웹 | 공통 workspace·도구·설정·lockfile 준비 및 설치 검사 완료. 서버·DB·worker 단독 실행 검사 완료. 웹·모바일 실행 전 | [준비 체크리스트](setup-checklist.md) |
| 미결정 | 운동 시작 방식 A·B | [미결정 사항](open-questions.md) |

## 다음 작업

1. [001 도구·설정 준비 #2](https://github.com/trycatch98/Holdlog/issues/2)의 T001–T003 구현·로컬 검사를 수행했다. [검증 기록](history/development/001-shared-foundation-verification.md)을 참고하고, 담당·PR·병합 상태는 이슈에서 확인한다. 준비 문서 PR #3은 병합됐다. #2는 PR #15로 병합됐고 [계약 생성·검사 #4](https://github.com/trycatch98/Holdlog/issues/4)의 구현·검사를 수행했다. #4는 PR #16으로 병합됐으며 #5 서버·DB·worker 단독 구현·검사를 수행했다. 웹·모바일의 로컬 작업과 실제 연동으로 이어간다. 확정된 33개 작업은 [11개 세부 이슈](../specs/001-development-foundation/tasks.md#구현-전략과-배정-묶음)로 모두 등록했다. 현재 진행 상태는 GitHub 이슈에서 확인한다.
2. [공통 계약](../specs/002-shared-contracts/contracts/README.md)의 생성 도구·버전을 고정하고 프론트·백엔드 소비 타입 검사를 수행했다. 실제 앱·API 소비는 후속 작업이다. 물리 서버와 테스트 휴대폰은 미정이며 계정·초기 데이터는 별도 확인한다.
3. 이후 기반 구성을 진행하고 서버·웹·모바일의 로컬 작업을 시작한다. 001은 로컬 실행·연결 검사로 완료를 판단하고 실제 기기·물리 서버 확인은 필요한 후속 범위에서 계획한다.
4. [기능별 선행 관계](../specs/README.md#선행-관계)에 따라 상세 계획·작업·검증 예제를 작성하고 공통 계약을 확정한 범위부터 [프론트·백엔드 담당](../specs/development-roles.md)을 나눈 뒤 기능을 구현한다.

진행 여부와 세부 준비 항목은 [준비 체크리스트](setup-checklist.md) 한곳에서 관리한다. 구현 순서는 기능의 선행 작업에 맞춰 조정하며 확정된 개발 순서로 취급하지 않는다.

개발 단계와 스킬 선택은 [Spec Kit 개발 흐름](development-workflow.md)을 따른다. 현재는 전체 기능의 범위 명세·002 공통 API·데이터 설계·001 기반 설계를 작성했다. [001의 33개 작업 목록](../specs/001-development-foundation/tasks.md)도 작성했다. 일관성 분석과 문구 보완을 마쳤다. 공통 workspace 설치·설정·계약 생성 검사와 서버·DB·worker 단독 실행 검사를 수행했다. 앱/웹과 실제 연동은 후속 작업이다. 물리 서버·휴대폰 미정으로 로컬 개발을 기다리지 않으며 실제 휴대폰·물리 서버 확인은 001 완료 조건에서 제외한다.

## 서버·DB·worker 로컬 실행

[#5 서버 기반 검증](history/development/001-backend-foundation-verification.md)의 서버 단독 실행을 확인했다. Node/npm 버전은 아래 공통 안내를 따른다. 공개 예시를 로컬 설정으로 복사하고 DB 비밀번호를 서로 다른 로컬 값으로 바꾼다. `apps/server/.env`의 DB 비밀번호를 개발 DB 값에 맞추고 `PRIVATE_STORAGE_PATH`를 로컬 전용 절대 경로로 설정한다. 환경 파일은 Git에서 제외된다.

```sh
cp infra/development/.env.example infra/development/.env
cp apps/server/.env.example apps/server/.env
# 위 두 파일의 로컬 값을 준비한 뒤 실행
docker compose --env-file infra/development/.env -f infra/development/compose.yaml up -d --wait db test-db
# 비공개 파일용 영구 볼륨 준비. HTTP로 공개하지 않는다.
docker compose --env-file infra/development/.env -f infra/development/compose.yaml --profile storage up -d storage
npm run db:migrate --workspace=@holdlog/server
npm run dev:api --workspace=@holdlog/server
# 별도 터미널
npm run dev:worker --workspace=@holdlog/server
npm run build --workspace=@holdlog/server
npm test --workspace=@holdlog/server
# TEST_DATABASE_URL에 Compose 시험 DB 주소(/holdlog_test, port55433)를 로컬로 전달한 뒤
npm run test:foundation --workspace=@holdlog/server
```

API 기본 주소는 `http://127.0.0.1:3100`이다. 개발 연결 경로·응답은 [001 기반 인터페이스](../specs/001-development-foundation/contracts/README.md#개발-연결)를 따른다. 운영 모드에서는 두 개발 경로를 등록하지 않는다. wildcard/public API bind와 개발/시험 DB 이름 혼용은 거절하며, 후속 연동에서 필요한 개발 LAN의 사설 IP를 명시할 수 있다. 비공개 파일 볼륨은 후속 파일 구현용 영역이며 현재 worker는 합성 jobId 표식만 저장한다. 루트 실행·서비스 전체 검사 명령 연결은 #9, 웹·모바일 실제 연동은 #10 범위다.

## 구현할 때 찾는 기준

| 구현 대상 | 동작·데이터 기준 | 화면 기준 |
|---|---|---|
| 일정 | [S03–S05](functional-spec.md#s03-일정-목록달력) · [상태](functional-spec.md#51-일정-상태와-방문-기록) | [일정](screen-design.md#screen-01-01) |
| 개인 기록·크루 방문 | [S08–S14](functional-spec.md#s08-기록-목록--전체--내-방문--크루-방문) · [기록 관계](record-relationships.md) | [기록](screen-design.md#screen-02-01) |
| 운동 중 기록 | [운동 명세](workout-recording-spec.md) | [02.13](screen-design.md#screen-02-13) |
| 암장·추천 | [선택](functional-spec.md#s06-암장-검색추천선택) · [지도](functional-spec.md#s23-암장-지도--확정) · [계산](functional-spec.md#54-암장-추천-계산) | [암장](screen-design.md#screen-03-01) |
| 통계 | [S15](functional-spec.md#s15-개인-통계) · [계산](functional-spec.md#53-통계-계산) | [통계](screen-design.md#screen-04-01) |
| 프로필·파일·알림 설정 | [S16](functional-spec.md#s16-내-정보알림-설정) · [S21](functional-spec.md#s21-내-사진영상-보관함) | [내 정보](screen-design.md#screen-05-01) |
| 크루·초대·관리자 이관 | [초대 가입](functional-spec.md#s02-초대-코드-입력qr-스캔초대-링크-가입) · [크루](functional-spec.md#s19-크루-목록선택생성가입) · [만들기·이관](functional-spec.md#s24-크루-만들기--첫-버전) | [크루](screen-design.md#screen-06-01) |
| 로그인 | [S01](functional-spec.md#s01-구글apple-로그인) | [로그인](screen-design.md#screen-07-01) |
| 앱 시작 공지·오픈소스 안내 | [S26 공지](functional-spec.md#s26-앱-시작-공지-팝업) · [S27 안내](functional-spec.md#s27-오픈소스-안내) | [남은 시안 작업](screen-worklist.md) |
| 서비스 관리자 웹 | [관리자 명세](admin-spec.md) | [관리자 웹](screen-design.md#admin-web) |


## 실행과 완료 확인

workspace manifest·공통 설정·앱별 검사 환경과 서버·DB·worker 실행 코드를 준비했다. 제품 앱 화면·API 구현은 후속 범위다. Node24.21.0·npm11.19.0을 사용한다. `.nvmrc`와 `package.json`의 도구 버전에 맞춰 PATH를 준비한 뒤 루트에서 설치한다.

```sh
node --version # v24.21.0
npm --version  # 11.19.0
npm ci
npm run contracts:check
npm run check
# 계약 원본 변경 후: npm run contracts:generate
# 개별 검사: npm run check:lockfile / npm run lint / npm run typecheck / npm run test:tooling
# 특정 대상: npm run lint --workspace=@holdlog/server
python3 scripts/check-contracts.py
python3 scripts/check-docs.py
git diff --check
```

위 설치·설정·계약 생성/소비·기존 정적 검사를 수행했다. 계약 검사 결과는 [001 검증 안내](../specs/001-development-foundation/quickstart.md#계약-생성과-소비-검사-결과)를 따른다. 현재 로컬의 기본 `python3` 실행 파일은 종료 코드137로 중단되어 `/usr/bin/python3`로 기존 검사를 통과했다. 이 로컬 환경에서 위 계약·문서 검사와 아래 링크 검사 명령은 `/usr/bin/python3`로 실행한다. 다른 환경에서는 정상 동작하는 Python3를 사용한다. 합성 입력으로 타입/lint 설정을 확인한 결과와 프로젝트 전용 Node 설치 방법은 [검증 기록](history/development/001-shared-foundation-verification.md)을 따른다. 루트 `npm run check`는 manifest/lockfile 일치·계약 검사와 현재 소스·환경 확인용 코드의 lint·타입·도구 회귀 검사를 수행한다. 서비스 실행·빌드·DB·기기 검사는 포함하지 않는다. 계약 생성/검사는 #4에서 구현했으며 서비스 전체 검사 명령은 #9에서, 서버 workspace 실행 명령은 #5에서 구현했고 앱·웹은 #6–#7에서 구현한다.

기능 검증은 [기능 명세9절](functional-spec.md#9-기능-완료-확인-시나리오)의 T01–T80, [운동 검증 기준](workout-recording-spec.md#완료-확인-기준), 해당 [기능 스펙](../specs/README.md)의 완료 기준을 함께 확인하고, 제작된 화면은 현재 Figma와 대조한다. 시안 제작·문서 작성·앱 구현·기기 검증을 각각 구분해 기록한다.

문서 링크와 화면 번호는 프로젝트 루트에서 `python3 scripts/check-docs.py`로 확인한다.

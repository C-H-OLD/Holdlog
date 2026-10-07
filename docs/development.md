# 개발 시작 안내

## 현재 준비 상황

| 구분 | 상태 | 확인할 곳 |
|---|---|---|
| 개발 방식·로컬 Git | Spec Kit 1.1.0·Codex·Living Spec 설정 완료. GitHub 원격 연결, 공개 저장소 상태 | [개발 흐름](development-workflow.md) |
| 제품 범위·기능·권한 | 문서 작성 | [PRD](prd.md) · [기능 명세](functional-spec.md) |
| 개발 단위·선행 관계·공통 계약 범위 | 21개 개발 단위·API/데이터 계약 설계 작성. 001 기반 소비자 검증 확인. 제품 계약 합의·업무 검증은 후속 범위 | [기능 스펙 목록](../specs/README.md) |
| 기술 구성 | 선택·[001 기반 설계](../specs/001-development-foundation/plan.md)와 로컬 실행·연동 검증. 제품 기능·운영은 후속 범위 | [기술·운영 명세](technical-spec.md) |
| 화면 | 시안 제작, 사용자 검토와 실제 구현은 별도 | [현재 시안](screens.md) |
| 개발 환경·앱·서버·관리자 웹 | 현재 준비 상태와 검사 근거는 체크리스트 참조 | [준비 체크리스트](setup-checklist.md) |
| 미결정 | 운동 시작 방식 A·B | [미결정 사항](open-questions.md) |

## 다음 작업

1. 001의 공통 도구·계약·서버·웹·모바일 기반과 루트 명령, 실제 로컬 연동은 #2·#4–#10의 병합 결과를 사용한다. [실행·연동 기록](history/development/001-foundation-verification.md)에서 실제 브라우저·iOS·Android의 정상·DB 중단·연결 불가·복구 결과를 확인한다.
2. #11에서 별도 작업 폴더의 설치·재생성·실패/복구·비밀 경계와 실행 안내를 확인했다. [#14 최종 대조](../specs/001-development-foundation/spec.md#최종-요구사항증거-대조--t032--14)와 [#13 후속 전달](../specs/002-shared-contracts/quickstart.md)을 포함한 필수 작업의 전체 완료·병합 상태는 상위 #1에서 확인한다. 담당·PR·병합 상태는 [001 작업 목록](../specs/001-development-foundation/tasks.md#구현-전략과-배정-묶음)의 GitHub 이슈에서 확인한다.
3. 물리 서버·테스트 휴대폰은 미정이고 계정·서명·초기 데이터는 미확인이다. 로컬 검증 통과가 외부 준비 상태를 바꾸지 않으며 필요한 후속 기능·운영 범위에서 확인한다.
4. [기능별 선행 관계](../specs/README.md#선행-관계)에 따라 계획·작업·검증 예제를 작성하고 공통 계약을 확정한 범위부터 [프론트·백엔드 담당](../specs/development-roles.md)을 나눈 뒤 제품 기능을 구현한다.

진행 여부와 세부 준비 항목은 [준비 체크리스트](setup-checklist.md) 한곳에서 관리한다. 구현 순서는 기능의 선행 작업에 맞춰 조정하며 확정된 개발 순서로 취급하지 않는다.

개발 단계와 스킬 선택은 [Spec Kit 개발 흐름](development-workflow.md)을 따른다. 개발 환경의 현재 준비 상태와 단독 검증 근거는 [준비 체크리스트](setup-checklist.md), 구현 범위와 남은 작업은 [001 작업 목록](../specs/001-development-foundation/tasks.md)에서 확인한다. 물리 서버·휴대폰 미정으로 로컬 개발을 기다리지 않으며 실제 휴대폰·물리 서버 확인은 001 완료 조건에서 제외한다.

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
npm run dev:api
# 별도 터미널
npm run dev:worker
npm run build --workspace=@holdlog/server
npm test --workspace=@holdlog/server
# TEST_DATABASE_URL에 Compose 시험 DB 주소(/holdlog_test, port55433)를 로컬로 전달한 뒤
npm run test:foundation
```

API 기본 주소는 `http://127.0.0.1:3100`이다. 개발 연결 경로·응답은 [001 기반 인터페이스](../specs/001-development-foundation/contracts/README.md#개발-연결)를 따른다. 운영 모드에서는 두 개발 경로를 등록하지 않는다. wildcard/public API bind와 개발/시험 DB 이름 혼용은 거절하며, 후속 연동에서 필요한 개발 LAN의 사설 IP를 명시할 수 있다. 비공개 파일 볼륨은 후속 파일 구현용 영역이며 현재 worker는 합성 jobId 표식만 저장한다. 루트 실행·전체 검사 명령은 #9에서 연결했고 웹·모바일의 실제 로컬 연동은 #10에서 검증했다. 시험 DB 사용자는 `holdlog`, 이름은 `holdlog_test`, 포트는55433이다. `TEST_DATABASE_URL`은 실제 시험 비밀번호를 사용해 로컬 환경으로 전달하며 공유 명령·로그에 값을 저장하지 않는다. 비밀번호의 URL 특수 문자는 인코딩한다.

## 관리자 웹 단독 실행

React/Vite 실행 기반과 개발 연결 검사 도구를 준비했다. [#6 단독 검증](history/development/001-admin-foundation-verification.md)을 수행했고, 실제 브라우저·개발 API 연동은 [#10 기록](history/development/001-foundation-verification.md#실제-로컬-연동--10--t017t022t023t024)에서 확인했다. 제품 화면을 아직 구현하지 않아 React 실행 영역은 비어 있다.

```sh
cp apps/admin/.env.example apps/admin/.env
npm run dev:admin
# 별도 터미널
npm test --workspace=@holdlog/admin
npm run build --workspace=@holdlog/admin
npm run preview --workspace=@holdlog/admin
```

개발 서버는 `http://127.0.0.1:5173`, 빌드 미리보기는 `http://127.0.0.1:4173`이다. `ADMIN_DEV_API_ORIGIN`은 Node 전용 개발 proxy 설정이며 기본 예시는 `http://127.0.0.1:3100`이다. 누락·잘못된 주소는 설정 이름만 출력하고 개발 실행을 거절한다. loopback 또는 사설 개발 호스트의 HTTP(S) origin만 받으며 경로·쿼리·인증정보는 받지 않는다. `/api/v1`과001의 두 health 경로를 상대 경로로 전달한다. proxy는 Origin과 쿠키를 바꾸지 않는다. 빌드·미리보기에는 proxy 설정이 필요하지 않고 개발 연결 도구와 사용자 환경값이 운영 번들에 포함되지 않는다.

개발 서버의 브라우저 콘솔에서 화면 추가 없이 연결 검사를 호출할 수 있다. 기본 요청은 ready이며 live도 선택할 수 있다.

```js
const { checkDevelopmentConnection } = await import('/src/development/connection-check.ts');
await checkDevelopmentConnection('ready');
```

반환값은 `connected`, `database-unavailable`(ready503), `connection-failed`(5초 제한·네트워크/proxy 실패), `invalid-response`로 구분한다. 원시 오류·응답 본문은 결과에 포함하지 않는다. 현재 자동 검사는 합성 HTTP 서버를 사용한다. C02 관리자 인증의 로컬 HTTPS·Secure cookie·CSRF 검사는004의 전달 조건을 유지한다.

## 모바일 단독 실행

[#7 검증 기록](history/development/001-foundation-verification.md#모바일-기반--7--t014t015t021)의 Expo 전용 개발 앱 기반을 사용한다. 제품 화면은 아직 없어 native root만 실행한다. Expo Go와 Metro 시작만으로 가상 기기 전용 빌드 완료를 판단하지 않는다.

공통 Node/npm 설치 후 Xcode26.4 이상·iOS Simulator와 JDK17·Android SDK36/Build Tools36.0.0·NDK27.1.12297006·arm64 에뮬레이터를 준비한다. Xcode 첫 실행에서 약관과 구성 요소 준비를 마친다. Xcode27/iOS27은 SDK57 scene 설정을 적용한다. 로컬 서명·스토어 계정·실제 휴대폰은 이 단계의 조건이 아니다.

```sh
cp apps/mobile/.env.example apps/mobile/.env
npm test --workspace=@holdlog/mobile
npm run prebuild --workspace=@holdlog/mobile
# 로컬 도구 PATH와 JAVA_HOME/ANDROID_HOME을 준비한 뒤 가상 기기를 명시
# 터미널1: IPv4 loopback으로 Metro 실행
npm run dev:mobile
# 터미널2: 전용 앱 빌드·가상 기기 설치/시작
npm run android --workspace=@holdlog/mobile -- --device emulator-5554 --no-bundler
npm run ios --workspace=@holdlog/mobile -- --device generic --output /tmp/holdlog-ios-build --no-bundler
xcrun simctl bootstatus <시뮬레이터-UUID> -b
xcrun simctl install <시뮬레이터-UUID> /tmp/holdlog-ios-build/HoldlogDevelopment.app
# iOS: 창 자동화와 자동 실행 주소에 의존하지 않고 loopback Metro를 명시
xcrun simctl launch --terminate-running-process <시뮬레이터-UUID> com.holdlog.development --initialUrl http://127.0.0.1:8081
npm run export:bundle --workspace=@holdlog/mobile
```

iOS 설치 대상은 `xcrun simctl list devices available`에서 선택해 먼저 부팅한다. 시뮬레이터에 앱을 바로 설치하는 `expo run:ios --device UUID`는 이 환경에서 빌드·설치 후 System Events 창 활성화 단계가 실패했으므로 위 build-only와 simctl 명령을 사용한다.

공개 설정은 iOS의 `EXPO_PUBLIC_DEV_API_ORIGIN_IOS`와 Android의 `EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID`만 소비한다. 기본값 예시는 각각 `http://127.0.0.1:3100`, `http://10.0.2.2:3100`이다. Android의 loopback은 가상 기기 자체이므로 거절한다. 명시한 사설 개발 호스트도 사용할 수 있다. 두 설정 누락·잘못된 origin은 이름만 알려주고 실행을 거절한다. DB·서버·관리자 비밀을 공개 변수에 넣지 않는다.

전용 개발 앱의 React Native DevTools 콘솔에서 `holdlogDevelopment.checkConnection('ready')`(또는 `'live'`)와 `holdlogDevelopment.checkContracts()`를 호출한다. 앱 시작만으로 요청하지 않는다. 연결 반환값은 정상·DB503·연결 불가·잘못된 응답을 구분하며 5초 제한을 적용한다. 계약 검사는 합성 입력의 형식 검사이고 제품 권한·업무 동작 검사가 아니다. 실제 가상 기기/API 연결 결과는 [#10 기록](history/development/001-foundation-verification.md#실제-로컬-연동--10--t017t022t023t024)에 있다.

`export:bundle`은 Node의 `--env-file=.env`로 모바일 공개 설정을 먼저 읽는다. Expo가 export 옵션을 평가할 때 앱 설정이 dotenv 로드보다 먼저 실행되므로 이 순서가 필요하다. `.env` 파일은 먼저 예시에서 복사하며 실제 DB·서버 비밀을 넣지 않는다. export 성공은 iOS/Android Metro 번들 생성 증거이며 네이티브 빌드·기기 실행 성공은 위 별도 절차로 확인한다.

생성한 `ios/`·`android/`는 수정 원본이 아니며 Git에서 제외된다. 네이티브 설정은 `app.config.ts`와 config plugin에서 관리한다. 이 앱 식별자는 `com.holdlog.development`이며 배포 식별자를 확정한 것은 아니다.

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

위 명령을 별도 작업 폴더에서 재현했다. [#11 재현 기록](history/development/001-foundation-verification.md#별도-폴더-재현과-비밀-경계--11--t027t030)에서 실패/원복·번들/로그 경계와 실제 DB 검사의 범위를 확인한다. 현재 로컬 기본 `python3` 실행 파일이 중단되어 기존 정적 검사는 `/usr/bin/python3`로 수행했다. 다른 환경에서는 정상 동작하는 Python3를 사용한다.

루트 `npm run check`는 lockfile·계약·모든 workspace lint/typecheck·도구/runner/앱 단독 회귀56개와 웹/API 빌드를 실행한다. 실제 DB·브라우저/API 연동·네이티브 빌드·기기 실행은 포함하지 않으며 미수행으로 출력한다. 실제 DB·queue 검사는 `TEST_DATABASE_URL`을 로컬 시험 DB로 전달한 뒤 `npm run test:foundation`으로 별도 실행한다. `npm run test`, `build:admin`, `build:api`, `dev:api`, `dev:worker`, `dev:admin`, `dev:mobile`도 루트 진입점으로 제공한다. 모바일 Metro 시작과 네이티브 빌드를 구분한다.

필수 설정은 다음과 같다. 값은 로컬 환경 파일에서 관리하고 파일을 Git에 넣지 않는다.

| 대상 | 설정 이름 |
|---|---|
| Compose | DEVELOPMENT_DB_PASSWORD·TEST_DB_PASSWORD |
| API/worker | NODE_ENV·API_HOST·API_PORT·DATABASE_URL·PRIVATE_STORAGE_PATH·ALLOWED_ORIGINS·WORKER_QUEUE |
| 실제 시험 DB 검사 | TEST_DATABASE_URL |
| 웹 개발 proxy | ADMIN_DEV_API_ORIGIN |
| 모바일 공개 설정 | EXPO_PUBLIC_DEV_API_ORIGIN_IOS·EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID |

실패하면 첫 실패 대상·종료 코드와 설정 이름을 확인한다. 계약 원본 변경은 `npm run contracts:generate` 후 `contracts:check`로 확인하며 생성물을 수기로 고치지 않는다. 실제 타입/설정 오류는 원본을 고친 뒤 같은 명령을 재실행한다. DB503이면 Compose의 DB healthy와 접속 이름·포트를 확인하고 `up -d --wait db`로 복구한다. 연결 불가이면 API 실행과 플랫폼별 origin·Vite proxy를 확인한다. 재시작 검증에 `down -v`나 기존 볼륨 삭제를 쓰지 않는다. 모바일 export의 공개 설정 누락은 `.env` 준비와 위 env-file 진입점으로 해결하며 필수 검증을 우회하지 않는다.

기능 검증은 [기능 명세9절](functional-spec.md#9-기능-완료-확인-시나리오)의 T01–T80, [운동 검증 기준](workout-recording-spec.md#완료-확인-기준), 해당 [기능 스펙](../specs/README.md)의 완료 기준을 함께 확인하고, 제작된 화면은 현재 Figma와 대조한다. 시안 제작·문서 작성·앱 구현·기기 검증을 각각 구분해 기록한다.

문서 링크와 화면 번호는 프로젝트 루트에서 `python3 scripts/check-docs.py`로 확인한다.

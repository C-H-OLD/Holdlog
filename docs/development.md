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

[#5 서버 기반 검증](history/development/001-backend-foundation-verification.md)의 서버 단독 실행을 확인했다. Node/npm 버전은 아래 공통 안내를 따른다. 공개 예시를 로컬 설정으로 복사한다. `apps/server/.env`의 `DATABASE_PATH`를 저장소 `infra/development/data/holdlog_dev.sqlite`의 절대 경로로, `PRIVATE_STORAGE_PATH`를 로컬 전용 절대 경로로 설정한다. 환경 파일과 `infra/development/data/`는 Git에서 제외된다.

```sh
cp apps/server/.env.example apps/server/.env
# DATABASE_PATH의 폴더를 먼저 만든다. SQLite는 없는 폴더에 파일을 만들지 않는다.
mkdir -p infra/development/data
# 비공개 파일용 영구 볼륨 준비. HTTP로 공개하지 않는다.
docker compose -f infra/development/compose.yaml --profile storage up -d storage
npm run db:migrate --workspace=@holdlog/server
npm run dev:api
# 별도 터미널
npm run dev:worker
npm run build --workspace=@holdlog/server
npm test --workspace=@holdlog/server
# 시험마다 임시 폴더에 새 SQLite 파일을 만든다. 따로 준비할 시험 DB가 없다.
npm run test:foundation
```

API 기본 주소는 `http://127.0.0.1:3100`이다. 개발 연결 경로·응답은 [001 기반 인터페이스](../specs/001-development-foundation/contracts/README.md#개발-연결)를 따른다. 운영 모드에서는 두 개발 경로를 등록하지 않는다. wildcard/public API bind와 개발/시험 DB 파일 이름 혼용은 거절하며, 후속 연동에서 필요한 개발 LAN의 사설 IP를 명시할 수 있다. 비공개 파일 볼륨은 후속 파일 구현용 영역이며 현재 worker는 합성 jobId 표식만 저장한다. 루트 실행·전체 검사 명령은 #9에서 연결했고 웹·모바일의 실제 로컬 연동은 #10에서 검증했다. DB는 SQLite 파일이다. `DATABASE_PATH`는 절대 경로이고 상위 폴더가 이미 있어야 하며, 파일 이름은 test에서 `holdlog_test.sqlite`, 그 밖에서 `holdlog_dev.sqlite`다. DB 시험은 시험마다 임시 폴더에 새 파일을 만들어 시험 DB 설정이 없다. 이전 PostgreSQL Compose의 `db`·`test-db` 컨테이너와 볼륨은 더 쓰지 않는다. 남아 있으면 각자 `docker compose -f infra/development/compose.yaml --profile storage up -d --remove-orphans storage`와 `docker volume rm holdlog-foundation_development-db holdlog-foundation_test-db`로 지운다. PostgreSQL판에서 서버를 빌드한 적이 있으면 `apps/server/dist`를 지우고 다시 빌드한다. 지운 시험의 빌드 결과가 `test:foundation`에 섞이기 때문이다.

## 모바일 인증 API 실행

004/#51의 서버 단독 구현은 [검증 기록](history/development/004-mobile-identity-api-verification.md)을 따른다. `apps/server/.env`의 `MOBILE_IDENTITY_ENABLED=true`와 실제 Google/Apple 설정을 준비하면 `/api/v2/auth/challenges`, `/auth/sessions`, `/auth/signups`, `/auth/sessions/refresh`, `/auth/sessions/current`, `/me`를 활성화한다(뒤 경로도 모두 `/api/v2` 기준). 설정 누락/오류는 시작 시 거절한다. 기본 예시는 false이며 기존 health/worker는 provider 비밀 없이 실행한다.

```sh
npm run test --workspace @holdlog/server
npm run test:identity --workspace @holdlog/server
npm run test:foundation
```

`test`는 provider/생성 입력의 합성 검사, `test:identity`는 실제 DB의 기반·모바일 HTTP·가입·이름 profile·회수/정리 검사다. worker가 매분 만료/소비 가입 증명을 정리한다. 운영 모드에도 정리를 등록하고 개발용 합성 queue는 development/test에만 등록한다. 실제 제공자/기기·관리자·사진 저장 연동은 후속이며 사진 profile 쓰기는011 연결 전 거절한다.

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

개발 서버는 `http://127.0.0.1:5173`, 빌드 미리보기는 `http://127.0.0.1:4173`이다. `ADMIN_DEV_API_ORIGIN`은 Node 전용 개발 proxy 설정이며 기본 예시는 `http://127.0.0.1:3100`이다. 누락·잘못된 주소는 설정 이름만 출력하고 개발 실행을 거절한다. loopback 또는 사설 개발 호스트의 HTTP(S) origin만 받으며 경로·쿼리·인증정보는 받지 않는다. `/api/v2`과001의 두 health 경로를 상대 경로로 전달한다. proxy는 Origin과 쿠키를 바꾸지 않는다. 빌드·미리보기에는 proxy 설정이 필요하지 않고 개발 연결 도구와 사용자 환경값이 운영 번들에 포함되지 않는다.

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
| 프로필·파일·알림 설정·수신 목록 | [S16](functional-spec.md#s16-내-정보알림-설정) · [S21](functional-spec.md#s21-내-사진영상-보관함) | [내 정보](screen-design.md#screen-05-01) · [알림 목록](screen-design.md#screen-05-07) |
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

루트 `npm run check`는 lockfile·계약·모든 workspace lint/typecheck·도구/runner/앱 단독 회귀102개와 웹/API 빌드를 실행한다. 실제 DB·브라우저/API 연동·네이티브 빌드·기기 실행은 포함하지 않으며 미수행으로 출력한다. 실제 DB·queue 검사는 `npm run test:foundation`으로 별도 실행한다. 시험마다 임시 SQLite 파일을 만들어 외부 DB나 시험 DB 설정이 필요 없다. `npm run test`, `build:admin`, `build:api`, `dev:api`, `dev:worker`, `dev:admin`, `dev:mobile`도 루트 진입점으로 제공한다. 모바일 Metro 시작과 네이티브 빌드를 구분한다.

필수 설정은 다음과 같다. 값은 로컬 환경 파일에서 관리하고 파일을 Git에 넣지 않는다.

| 대상 | 설정 이름 |
|---|---|
| API/worker | NODE_ENV·API_HOST·API_PORT·DATABASE_PATH·PRIVATE_STORAGE_PATH·ALLOWED_ORIGINS·WORKER_QUEUE |
| 웹 개발 proxy | ADMIN_DEV_API_ORIGIN |
| 모바일 공개 설정 | EXPO_PUBLIC_DEV_API_ORIGIN_IOS·EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID |

실패하면 첫 실패 대상·종료 코드와 설정 이름을 확인한다. 계약 원본 변경은 `npm run contracts:generate` 후 `contracts:check`로 확인하며 생성물을 수기로 고치지 않는다. 실제 타입/설정 오류는 원본을 고친 뒤 같은 명령을 재실행한다. ready503이면 `DATABASE_PATH`의 폴더·파일 권한을 확인하고 `npm run db:migrate --workspace=@holdlog/server`로 migration을 적용한다. 연결 불가이면 API 실행과 플랫폼별 origin·Vite proxy를 확인한다. 재시작 검증에 `down -v`나 기존 볼륨 삭제를 쓰지 않는다. 모바일 export의 공개 설정 누락은 `.env` 준비와 위 env-file 진입점으로 해결하며 필수 검증을 우회하지 않는다.

기능 검증은 [기능 명세9절](functional-spec.md#9-기능-완료-확인-시나리오)의 T01–T80, [운동 검증 기준](workout-recording-spec.md#완료-확인-기준), 해당 [기능 스펙](../specs/README.md)의 완료 기준을 함께 확인하고, 제작된 화면은 현재 Figma와 대조한다. 시안 제작·문서 작성·앱 구현·기기 검증을 각각 구분해 기록한다.

문서 링크와 화면 번호는 프로젝트 루트에서 `python3 scripts/check-docs.py`로 확인한다.

## 004 공통 인증 기반

인증 저장 SQL·TX/잠금·최소 receipt와 mobile/admin 별도 설정 검증을 추가했다. `npm run test:identity --workspace @holdlog/server`는 시험마다 만든 임시 SQLite 파일에서 기반 저장/제약 검사를 수행한다. 전체 기반 DB 검사는 기존 `npm run test:foundation`을 사용한다. 설정 이름·의존성·네이티브 빌드 및 미수행 범위는 [004 공통 기반 검증](history/development/004-identity-foundation-verification.md)을 따른다. #51 모바일 로그인·가입·이름 profile API의 서버 단독 결과는 [실행 안내](#모바일-인증-api-실행)와 [증거](history/development/004-mobile-identity-api-verification.md)를 따른다. 관리자 서버 단독 구현은 [실행 안내](#관리자-인증-api와-초기-계정-도구)를 따른다. 실제 제공자/기기·관리자 브라우저 연동은 후속이며 공개 health/worker 실행에 provider 비밀을 요구하지 않는다.


## 관리자 인증 API와 초기 계정 도구

004/#52의 서버 단독 구현과 검사 결과는 [검증 기록](history/development/004-admin-api-verification.md)을 따른다. 관리자 웹 Provider·개발 HTTPS 검사 도구는 #54의 [실행 안내](#관리자-세션-소비와-https-검사)를 따른다. 실제 신뢰 HTTPS 브라우저 연동은 #57 범위다. 공개 관리자 가입 API는 없다.

`apps/server/.env`의 기반 API/DB 설정을 먼저 준비한다. 시험은 `holdlog_test.sqlite`, 개발은 `holdlog_dev.sqlite` 파일을 사용한다. 아래 도구는 설정을 먼저 검사하고 실제 터미널에서 비밀번호를 두 번 숨김 입력한다. 인수·환경 변수·pipe로 비밀번호를 전달하지 않는다. 기존 계정의 version은 대상 DB를 읽을 권한이 있는 운영자가 확인한다.

```sh
npm run admin:bootstrap --workspace @holdlog/server -- create <loginId>
npm run admin:bootstrap --workspace @holdlog/server -- replace <loginId> --expected-version <version>
```

최초 생성은 중복을 거절한다. 명시적 교체는 active를 유지하고 version 증가·모든 관리자 세션 회수를 같은 트랜잭션에서 처리한다. 실패는 분류 코드와 종료 코드1, 성공은 작업 종류·완료·version만 출력한다. 비밀 전달·응답 유실의 운영 절차는 [초기 관리자 준비 절차](../specs/001-development-foundation/contracts/admin-bootstrap.md)를 따른다.

API에는 `ADMIN_IDENTITY_ENABLED=true`, 독립적인 `ADMIN_CSRF_KEY`(32바이트 canonical base64), 정확한 HTTPS Origin 목록 `ADMIN_ALLOWED_ORIGINS`를 설정하고 기존 `npm run dev:api`로 실행한다. 모바일 provider 설정은 필요 없다. 관리자 CORS와 쓰기 Origin 검사는 관리자 목록만 사용한다. Argon2 검증은 API 프로세스 안에서 동시에2건으로 제한하고 포화 시 재시도 가능한503을 반환한다. API는 프로세스 하나로 실행한다. 브라우저는 신뢰 HTTPS와 `/api/v2/admin` cookie path를 보존하는 proxy가 필요하며, 일반 HTTP Node 검사는 브라우저의 Secure cookie 저장을 입증하지 않는다.

```sh
npm run test:admin-auth --workspace @holdlog/server
npm run test:foundation --workspace @holdlog/server
```

006/019 controller는 `AdminSessionGuard`를 사용한다. 업무 service의 읽기/쓰기는 `AdminSessionService.withAdministrator(cookie, writeContext, callback)`의 같은 IMMEDIATE 트랜잭션에서 수행하고, 쓰기 context에 Origin/CSRF를 전달한다. callback은 동기 함수이며 await하거나 commit하지 않는다. 외부 호출은 callback 밖에서 한다. guard 결과만으로 나중의 저장을 허용하지 않는다.


## 관리자 세션 소비와 HTTPS 검사

004/#54는 `apps/admin/src/api/auth.ts`의 생성 계약 전송·응답 검사와 `AdminAuthStore`/`AuthProvider`/`useAdminAuth`를 제공한다. 전송은 `@holdlog/contracts/admin-auth-checks`의 세 operation 전용 생성 입력·응답 검사와 메타데이터를 소비해 전체 validator를 브라우저 번들에 싣지 않는다. 기존 `operations`/`validators` 진입점은 그대로 유지한다. 로그인/세션/로그아웃은 상대 `/api/v2/admin` 경로와 same-origin credentials를 사용한다. Origin과 HttpOnly cookie는 브라우저가 관리한다. 로그인/로그아웃의 요청키는 호출자가 만들고 같은 입력 재시도에 유지한다. 자동 쓰기 재시도는 없다.

owner는 CSRF/expiry를 메모리에만 두고 localStorage/sessionStorage·URL·로그를 사용하지 않는다. 초기/재조회 요청을 공유하며 네트워크/timeout·계약 실패와 확정401/403을 구분한다. 로그아웃·계정 전환·만료·unmount는 보호자료 cleanup과 세대 변경을 먼저 수행하고 늦은 응답을 거절한다. 임시 실패는 유효한 세션과 해당 폼 입력을 보존한다. cleanup 실패도 권한 성공으로 공개하지 않는다.

006/019는 안정된 owner를 Provider에 주입하고 보호 캐시/자료 cleanup을 생성 시 연결한다. 업무 요청과 결과 적용은 `runProtected(request, apply)` 안에서 수행한다. request는 메모리 CSRF와 취소 signal을 받아 계약의 쓰기 헤더에 전달하며, owner가 세션을 재조회한 뒤 현재 principal·세대·expiry를 확인할 때만 동기 apply를 실행한다. 서버의 guard/업무 TX 권한 검사를 대신하지 않는다. Query/폼 라이브러리를 설치했다고 가정하지 않는다.

```sh
npm test --workspace @holdlog/admin
npm run typecheck --workspace @holdlog/admin
npm run build --workspace @holdlog/admin
```

개발 검사 도구는 [HTTPS 준비](../infra/development/admin-https.md)의 인증서/Node 설정으로 `npm run dev:admin`을 실행한 뒤 `https://127.0.0.1:5173/__development/admin-auth`에서 연다. 기본 HTTP 모드에서는 도구가404이며 production build/preview에는 도구가 없다. 신규 제품 로그인 시안을 추가하지 않았다.

[단독 증거](history/development/004-admin-consumer-verification.md)는 합성 API와 임시 TLS를 사용한다. 브라우저 시스템 신뢰와 실제 #52 API의 계정 교체·권한·만료·로그아웃 연동은 #57에서 별도로 확인한다.

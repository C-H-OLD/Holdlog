# 001 공통 준비 검증 기록

2026-10-06 · 이슈 [#2](https://github.com/trycatch98/Holdlog/issues/2) · 브랜치 `codex/issue-2-foundation` · 범위 T001–T003. [스펙](../../../specs/001-development-foundation/spec.md)·[계획](../../../specs/001-development-foundation/plan.md)·[작업](../../../specs/001-development-foundation/tasks.md)을 기준으로 했다. 구현·검사 완료와 PR 병합·이슈 완료는 구분한다.

## 도구와 설치

macOS arm64에서 전역 Node24.2.0·npm11.3.0을 확인했다. 프로젝트 최소 버전을 충족하지 않아 전역 설정을 바꾸지 않고 `.tools/`에 Node24.21.0·동봉 npm11.19.0을 설치했다. [Node 공식 배포본](https://nodejs.org/dist/v24.21.0/)의 darwin-arm64 tar.gz SHA-256은 `bed7eea5325e1108f32ce5228ddd6a5f0f08a499ee42aa7442aea583702f6057`이며 다운로드 파일과 일치했다.

```sh
mkdir -p .tools
curl -fsSL https://nodejs.org/dist/v24.21.0/node-v24.21.0-darwin-arm64.tar.gz -o .tools/node.tar.gz
shasum -a 256 .tools/node.tar.gz
# 위 공식 SHA-256과 일치하는지 확인한 뒤 압축을 푼다.
tar -xzf .tools/node.tar.gz -C .tools
export PATH="$PWD/.tools/node-v24.21.0-darwin-arm64/bin:$PATH"
node --version
npm --version
npm ci --cache /tmp/holdlog-npm-cache --no-audit --no-fund
npm ls --depth=0 --workspaces --cache /tmp/holdlog-npm-cache
```

`npm install`로 루트 lockfile을 생성했고 위 `npm ci`로 650개 패키지 재설치에 성공했다. Node24.21.0·npm11.19.0과 네 workspace의 직접 의존성 exact 버전을 고정했다. 엔진/버전 불일치는 `.npmrc`의 `engine-strict`로 거절한다. [공식 npm 메타데이터](https://registry.npmjs.org/)의 엔진·peer 요구를 조회했으며, [Expo57.0.26 배포본](https://registry.npmjs.org/expo/-/expo-57.0.26.tgz)의 `bundledNativeModules.json`으로 React19.2.3·RN0.86.3·expo-dev-client57.0.19 조합을 대조했다. 관리자 웹 React19.3.0은 별도 manifest에서 관리하며 실제 모듈 해석도 두 앱에서 각각 원하는 React 버전을 반환했다.

직접 의존성은 각 `package.json`, 전체 해석 결과는 루트 `package-lock.json`이 원본이다. 계약 생성 도구·DB 드라이버·작업 처리 라이브러리는 해당 후속 작업에서 추가한다. npm의 전이 의존성 uuid7 지원 종료 경고와 fsevents2.3.3 install-script 승인 대기 경고가 있었다. 설치는 성공했으나 네이티브 watcher·앱 빌드 성공을 뜻하지 않는다. #7에서 실제 Expo 실행·빌드 시 확인한다.

## 로컬 도구 상태

| 검사 | 실제 결과 | 남은 확인 |
|---|---|---|
| `docker --version` / `docker compose version` | CLI29.1.5 / Compose5.0.1 정상 | DB·worker 실행은 #5 |
| `docker info --format '{{.ServerVersion}}'` | daemon socket 연결 불가 | daemon 실행 및 DB 검사는 #5 |
| `xcode-select -p` / `xcodebuild -version` | 전체 Xcode 경로 / Xcode26.2 정상 | 전용 개발 빌드는 #7 |
| `xcrun --sdk iphonesimulator --show-sdk-version` | SDK26.2 정상 | 시뮬레이터 앱 실행은 #7 |
| `adb version` |35.0.2 정상 | 에뮬레이터 연결은 #7 |
| `emulator -version` / `emulator -list-avds` |36.4.9 정상 / AVD3개 확인 | 가상 기기 실행·앱 설치는 #7 |
| `git var GIT_AUTHOR_IDENT` / `git diff --check` | 작성자 설정 정상 / 공백 오류 없음 | 전역 Git 설정 변경 없음 |

`gpg.format` 값은 없고 `commit.gpgsign=false`이며 과거 기록의 빈 gpg.format 오류는 이번 검사에서 재현되지 않았다. 물리 서버 사양·테스트 휴대폰은 사용자 확인대로 미정이다. 실제 계정·운영 자료·서명·기기·물리 서버 검사는 수행하지 않았다.

## 설정 검사

임시 합성 TypeScript 파일과 `tsconfig.base.json`을 상속한 임시 설정을 만들고 실제 `tsc`·ESLint CLI로 검사했다. 검사가 끝난 뒤 합성 파일을 제거했다. 앱별 module/JSX/DOM/Node 설정은 후속 역할 작업에서 정하며 루트에서 React 조합을 강제하지 않는다.

| 상황 | 결과 |
|---|---|
| `export const count: number = 1` 타입 검사 | 종료0 |
| number 변수에 문자열 할당 | TS2322·종료2 |
| 정상 입력으로 복구 | 종료0 |
| 정상 TS와 `eslint.config.mjs` lint | 종료0 |
| 미사용 변수 lint | no-unused-vars·종료1 |
| 정상 입력으로 복구 | 종료0 |
| manifest/lockfile 대조 | exact 버전·lockfileVersion3·private workspace·도구 버전 일치 |
| 각 앱에서 React module 해석 | mobile19.2.3 / admin19.3.0 |

`git check-ignore --no-index`로 합성 경로를 검사했다. `.env`·로컬 환경 파일·인증서·서명·네이티브 서비스 설정·DB dump·개발 data/storage·node_modules·네이티브 생성 폴더·빌드 결과는 제외됐다. `.env.example`·SQL migration·계약 JSON·lockfile·Figma 자료는 추적 가능했다. 실제 비밀 파일이나 운영 자료는 읽거나 출력하지 않았다.

## 기존 자료 보존

`/usr/bin/python3 scripts/check-contracts.py`는 API79개 경로·109개 작업·107개 자료형과 runtime22개 정의, HTTP13/runtime5/거절3개 예제의 기존 정적 검사를 통과했다. `/usr/bin/python3 scripts/check-docs.py`는 문서 링크·JSON·모바일41개/88개 상태·웹3개/5개 상태 일치 검사를 통과했다. 기본 `/usr/local/bin/python3`은 종료137로 중단돼 시스템 Python을 사용했다. 원인은 이 작업에서 확인하지 않았으며 Python 설치/전역 설정은 변경하지 않았다.

공통 계약 원본·시안 자료·제품 명세를 덮어쓰지 않았다. 서비스 실행·DB/worker·생성 계약 소비·전체 workspace runner·웹 빌드·Expo 전용 빌드·가상 기기 연결은 후속 #4–#11 범위이며 이번에 통과로 표시하지 않는다. 001 전체 완료 및 002 계약 합의 완료를 뜻하지 않는다.

## 사용자 요청 보완: 서버 명칭·검사 하네스

서버를 `apps/server`·`@holdlog/server`로 변경했다. 위 초기 검사 기록의 `apps/api`는 당시 경로다. 현재 계획·작업·명령은 새 이름을 따른다. 서버/웹/모바일/계약 각각 `tsconfig.json`과 `lint`·`typecheck`를 제공하며 환경 확인용 `checks/environment.ts`를 검사한다. 원래 합성 검사만 수행한 상태와 달리 루트 `npm run check`로 실제 명령을 순서대로 호출한다. 회귀 테스트 8개와 네 workspace의 lint·typecheck를 통과했다.

React Hooks·브라우저/Node/React Native 전역·타입 기반 TypeScript lint를 적용했다. `npm ci`·`npm run check`로 재설치 및 전체 도구 검사 결과를 확인한다. 회귀 검사에서는 Node 전역·JSX 검사 포함·모바일 타이머·조건부 Hooks 거절·브라우저 Node 전역 거절·필수 명령 누락/종료17 전파를 확인한다. 웹 타입 검사에 잘못된 서버 전역을 넣으면 실패하고 합성 파일은 제거한다. 서비스 API/DB/worker·제품 화면·가상 기기/네이티브 빌드는 여전히 미수행이다.

`.env.*.example`은 공개 예시로 추적 가능하게 하고 `backups/`와 개발 backups 폴더는 제외한다. SQL migration은 추적한다. Expo CNG 선택 근거와 네이티브 원본 관리 방식은 현재 기술 명세를 따른다. CodeRabbit 지적에 따라 스펙 가정과 목록 표의 낡은 구현 전 문구도 보완했다.

## 리뷰 수정 검증

서브에이전트와 CodeRabbit 리뷰를 종합해 테스트 probe의 기존 파일 삭제 가능성, 관리자 Node 설정 타입 분리, 모바일 루트 JSX 환경, 계약 Node 테스트 환경, 로컬 Python 대체 명령 안내를 수정했다. probe는 고유하게 생성한 폴더만 정리하며 성공/예외 양쪽에서 기존 파일 보존을 검사했다. 관리자 Node 설정용 `tsconfig.node.json`을 추가하고 브라우저 소스의 Node 전역 거절을 유지했다. 정상 코드 거절 사례를 먼저 재현하고 회귀 테스트를 추가했다.

CodeRabbit의 lockfile 검토 제외를 보완해 `check:lockfile`을 루트 하네스 첫 검사로 연결했다. 루트와 네 workspace manifest의 이름·버전·엔진·직접 의존성 및 workspace 목록을 lockfile과 대조하며, 합성 manifest 버전 불일치는 실패했다. `npm ci` 재설치와 `npm run check`의 네 workspace lint·typecheck, 회귀 테스트13개가 통과했다. 기존 문서·계약 정적 검사와 `git diff --check`도 통과했다. 이는 코드/설정 검사 결과이며 앱/서비스 빌드·기기 검사는 포함하지 않는다.

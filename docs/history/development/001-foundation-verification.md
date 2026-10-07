# 001 로컬 실행·연결 검증

검증일: 2026-10-07 · 대상별 단독 실행과 #10의 실제 로컬 연동 결과를 구분한다. #10의 작업 검증을 마쳤으며, 상위 #1의 전체 완료는 남은 작업과 병합 증거를 모아 별도로 판단한다.

## 모바일 기반 — #7 / T014·T015·T021

Node24.21.0·npm11.19.0, Expo57.0.27·React19.2.3·React Native0.86.3·expo-dev-client57.0.19을 사용한다. Xcode27용 scene 설정을 위해 SDK57 지원 expo-build-properties57.0.22를 추가했다. 생성된 ios/android 프로젝트는 Git에서 제외하며 app.config.ts와 config plugin을 원본으로 유지한다.

- 설정/연결 검사6개: 양쪽 공개 host 필수·Android loopback 거절·health200·DB503·네트워크 실패·잘못된 body·실제 HTTP body 5초 제한·생성 HTTP/runtime validator 소비 통과.
- SDK 지원 조합 검사, 모바일 lint/typecheck, 루트 계약 회귀13개·도구 회귀14개 포함 check 통과.
- Expo prebuild로 두 네이티브 프로젝트를 생성했다. iOS scene manifest와 EXExpoAppSceneDelegate 연결을 확인했다.
- Metro로 iOS/Android Hermes 번들을 생성했고 합성 DB/server/미사용 공개 변수의 비밀 표식이 전체 출력에 포함되지 않았다.
- Android 도구: JDK17.0.9, SDK36·Build Tools36.0.0·NDK27.1.12297006, Gradle9.3.1, arm64 Pixel_8_API_33 에뮬레이터. SDK/Build Tools를 준비했고 가상 기기 부팅을 확인했다.
- Android 전용 개발 앱: Gradle assembleDebug(arm64-v8a) 성공, adb 설치 성공, MainActivity 시작과 프로세스 유지 확인. DevTools로 실제 Hermes 런타임에서 생성 계약 검사 true·연결 함수 등록을 확인했다. 실제 API 요청은 아직 하지 않았다.
- Metro localhost가 IPv6에만 바인딩되는 환경을 재현했다. 개발 명령에 Node의 ipv4first DNS 옵션을 적용해127.0.0.1:8081로 제한했고 Android의10.0.2.2에서 앱 JS 번들 로드를 확인했다.
- 최초 직접 Gradle 실행은 공개 host 설정이 없어 이름만으로 실패했다. 설정을 명시한 재실행은 성공했다.
- 현재 개발용 공개 .env 파일만 로컬에 준비했다. 서명/서버 비밀은 추가하지 않았다.
- iOS 도구: 사용자가 Xcode26.2에서27.0(27A266a)으로 업데이트했다. 첫 실행·약관·구성 요소 준비 후 iPhone 17 Pro/iOS26.2(23C54) 시뮬레이터에서 expo run:ios --device UUID --no-bundler로 빌드·설치·시작을 확인했다. 빌드 오류0·Expo 생성 스크립트 의존성 경고1이었다. Expo CLI는 설치·앱 시작 후 시뮬레이터 창 활성화의 System Events 확인 단계에서 실패해 최종 종료 코드1이었다. 이 자동화 권한에 의존하지 않는 expo run:ios --device generic --output /private/tmp/holdlog-issue7-ios-build --no-bundler 재빌드는 종료0이었다. 생성한 앱을 simctl install로 설치하고 simctl launch로 시작·런타임 검증을 다시 수행했다.
- Expo 자동 실행의 LAN 주소는 loopback Metro와 맞지 않았고 URL 전달만으로 JS 연결이 잡히지 않았다. Expo가 지원하는 simctl launch --terminate-running-process UUID com.holdlog.development --initialUrl http://127.0.0.1:8081로 로컬 주소를 명시해713개 모듈 로드와 실제 iOS Hermes에서 계약 검사 true·연결 함수 등록을 확인했다. 실제 API 요청은 아직 하지 않았다.

## 실제 로컬 연동 — #10 / T017·T022·T023·T024

기준 코드: main `2a52c4898d35b7913c15e9ffd5260cd5d3aaa28b`. #5·#6·#7·#8·#9가 병합된 같은 코드와 lockfile에서 `npm ci` 후 실행했다. 이 작업은 실행 증거와 작업 체크만 변경한다. 제품 화면·인증·지도·푸시는 추가하지 않았다. 기존 [서버 기반](001-backend-foundation-verification.md)·[웹 기반](001-admin-foundation-verification.md) 단독 증거와 위 #7 네이티브 빌드 증거를 함께 사용한다.

### 실행 환경과 시작·설정 실패

Node24.21.0·npm11.19.0, Nest11.2.7·pg8.23.1·pg-boss12.37.0, Vite8.3.3와 위 모바일 버전을 사용했다. Docker29.1.5에서 [Compose 원본](../../../infra/development/compose.yaml)의 고정 PostgreSQL17.11 이미지와 기존 볼륨을 사용했다. 개발 DB는 localhost55432/holdlog_dev, 시험 DB는55433/holdlog_test로 분리했다. 비밀번호·접속 문자열은 로컬 .env에서만 읽고 기록에 넣지 않았다.

| 대상 | 실제 시작 | 설정 누락 실패·복구 |
|---|---|---|
| 개발 DB | `docker compose --env-file infra/development/.env -f infra/development/compose.yaml up -d --wait db test-db` 종료0, 두 DB healthy | Compose 필수 변수 검사는 기존 서버 기반 증거. 이번에는 준비된 로컬 설정 사용 |
| API | 루트 `npm run dev:api`, `api.started`, 127.0.0.1:3100 | 같은 빌드의 main.js를 DATABASE_URL 없이 실행: 종료1, 변수 이름만 진단. 설정 복원 후 시작 성공 |
| worker | 루트 `npm run dev:worker`, 별도 프로세스의 `worker.started` | 같은 빌드의 worker.js를 DATABASE_URL 없이 실행: 종료1. 실행 중 DB 중단 시 `worker.failed`로 기록되며 성공으로 취급하지 않음. 검증 마지막 SIGTERM 후 `worker.stopped`, 종료0 |
| 관리자 웹 | 루트 `npm run dev:admin`, 127.0.0.1:5173, 실제 Chrome 페이지 제목·root·Vite 오류 overlay 없음 확인 | ADMIN_DEV_API_ORIGIN 없이 시작: 종료1·변수 이름 진단. 공개 .env.example을 로컬 설정으로 복사한 뒤 시작 성공 |
| 모바일 | 루트 `npm run dev:mobile`, loopback Metro8081, iOS/Android 최신 JS 번들 연결 | EXPO_NO_DOTENV=1로 `expo config --type public` 실행, iOS 공개 origin 누락과 iOS만 제공한 Android origin 누락 각각 종료1·해당 변수 이름 진단 |

iOS는 iPhone17Pro/iOS26.2 시뮬레이터, Android는 Pixel_8_API_33/Android13 arm64 에뮬레이터다. #7에서 빌드한 전용 개발 앱 com.holdlog.development를 재사용하고 이 기준 코드의 Metro 번들을 로드했다. 이번에 네이티브 바이너리를 다시 빌드한 것은 아니다. 앱 프로세스와 실제 Hermes 런타임을 확인했으며 Expo 최초 개발 메뉴가 화면에 표시됐다. 제품 화면의 사용성 검증은 수행하지 않았다.

### 실제 연결 결과

브라우저는 Browser plugin이 제공되지 않아 frontend-testing-debugging 지침의 일반 Playwright fallback으로 설치된 Chrome을 실행했다. Origin은 http://127.0.0.1:5173, Vite proxy 대상은 http://127.0.0.1:3100이며 changeOrigin=false다. iOS API origin은 http://127.0.0.1:3100, Android는 호스트 PC를 가리키는 http://10.0.2.2:3100이다. 가상 기기의 localhost를 PC로 취급하지 않았다.

`/internal/health/ready`와 `/internal/health/live`에 실제 요청했다. 브라우저에서는 checkDevelopmentConnection을 페이지 안에서 실행했고, 두 모바일에서는 Metro DevTools 연결로 실제 Hermes의 holdlogDevelopment.checkConnection을 실행했다. DevTools WebSocket에는 로컬 Metro Origin을 전달했다. fetch mock이나 Node에서 모바일 함수를 대신 실행한 결과가 아니다.

| 상태 | 실제 Chrome | iOS Hermes | Android Hermes |
|---|---|---|---|
| DB·API 정상 | ready200 `{status:"ready"}` → connected, live200 → connected | ready/live connected | ready/live connected |
| Compose 개발 DB만 stop | ready503 `{status:"unavailable"}` → database-unavailable, live200 → connected | ready database-unavailable, live connected | ready database-unavailable, live connected |
| API 프로세스 SIGTERM, DB 복구 상태 | Vite proxy502 → connection-failed, ready/live 모두 실패 | 실제 네트워크 요청 실패 → ready/live connection-failed | 실제 네트워크 요청 실패 → ready/live connection-failed |
| DB·API 재시작 | ready200·live200 → connected | ready/live connected | ready/live connected |

모바일 connected와 database-unavailable는 구현이 정확한 HTTP200/503과 body를 함께 검사한 결과다. API 중단은 실제 연결 불가를 검증한 시나리오이며, 별도 인터넷 차단이나 실기기 네트워크 장애는 수행하지 않았다. 브라우저 pageerror와 Vite 오류 overlay는 없었다. 정상 상태의 콘솔404는 favicon.ico 누락이며 health 실패와 구분했다. 장애 단계의503/502 콘솔 오류는 위 실제 응답과 일치했다.

개발 DB 재시작 전 holdlog_foundation.job_effects에 이번 검증의 UUID 합성 행1개를 넣고 개발 DB를 stop → up -d --wait db로 재시작했다. 동일 UUID의 행이1개 남아 있음을 조회했다. 볼륨을 삭제하지 않았고 확인 후 이번 합성 행만 삭제했다. 따라서 자료 보존 검증은 로컬 정상 재시작 범위이며 백업·재해 복구 검사가 아니다.

### 공통 계약·예제 소비 대조

모든 소비자는 같은 생성 디렉터리의 계약1.0.0과 [manifest 원본](../../../packages/contracts/generated/manifest.json)을 사용했다. 생성 도구는 openapi-typescript7.13.0·Ajv8.20.0·ajv-formats3.0.1·json-schema-to-typescript16.0.0·Redocly2.59.0·esbuild0.28.2·TypeScript5.9.3이다. 원본 SHA-256은 다음과 같다. 전체 입력·도구 목록은 manifest 한곳에서 관리한다.

| 원본 | SHA-256 |
|---|---|
| openapi.json | c79f369ecad8c6fbcc21670f48fe9848f8ab77f00d53fd53822dfce2394893e4 |
| runtime.schema.json | 834b06ccb97fd3747c2c434608f8bb493bfd091bda099c0a17cc72a0fd0fd925 |
| examples.json | 0138fc4cdf178a285dc462f30e18487c27f5df0006bc4a4d3adcbcd57bdd3730 |
| package-lock.json | 87f9e57027c11afeb503cff77288069011381a38545ed3710d2e6e992125be64 |

| 소비 환경 | 실제 결과·범위 |
|---|---|
| Node/BE 공통 검사 | `node scripts/contracts/check-examples.mjs`: 원본 공통 예제18개 수락·mustReject3개 거절·HTTP 구조 연결13개. server 타입 검사·빌드와 실제 Nest health 실행 통과 |
| FE 실제 Chrome | generated fixtures의 HTTP13개·runtime5개를 standalone validator로 모두 수락. mustReject3개를 모두 거절. 같은 페이지에서 위 실제 health 시나리오 실행 |
| FE iOS Hermes | holdlogDevelopment.checkContracts() = true. 생성 HTTP AdminSession·runtime ClimbCount의 타입 지정 합성 입력2개 검증. 실제 health 네 단계에서도 true |
| FE Android Hermes | 같은 생성 validator·합성 입력2개 검증 true. 실제 health 네 단계에서도 true |

공통 예제 전체18개를 모바일에서 실행한 것은 아니다. 모바일은 기존 개발 진단에 포함된 HTTP/runtime 대표 입력의 이식성을 확인했다. 원본 공통 예제 전체 소비는 Node와 실제 브라우저에서 별도로 확인했다. 형식·HTTP 구조 연결·개발 health 성공을 제품 권한·DB 관계·실제 기능 완료로 취급하지 않는다. 002에는 이 계약 버전과 소비 범위의 증거만 전달하며 전체 계약 합의 완료로 표시하지 않는다.

### 검사와 후속 범위

- 루트 `npm run check` 종료0: 계약13·도구14·runner10·웹9·모바일6·서버4개 회귀, 모든 workspace lint/typecheck, 웹/API build 통과. DB·브라우저·네이티브 실행은 이 명령과 별도로 위에서 확인했다.
- 로컬 TEST_DATABASE_URL을 명시한 루트 `npm run test:foundation` 종료0: 실제 시험 DB 검사10개 통과·skip0. migration 재연결·변조 거절, health200/503, 운영 모드 개발 route 제외·로그 비밀 제외, worker 중단과 SIGKILL 후 중복 효과 없는 재처리 포함. 최초 검증용 연결 설정에서 DB 사용자명을 잘못 지정한 실행은 인증 실패했으며 Compose의 holdlog로 바로잡은 재실행 결과다.
- #8의 최초 관리자 절차 문서를 확인했다. 실제 관리자 계정 생성·세션·권한 구현은004 범위로 미수행이다.
- 실제 휴대폰·서명·외부 물리 서버·배포는001 로컬 범위 밖으로 미수행이다. 해당 환경의 네이티브 기능과 운영 검사는 후속 기능·배포 범위에서 별도로 수행한다.
- 이 #10 실행만으로 #11 재현 작업이나 #14 최종 대조·#13 전달을 자동 완료 처리하지 않는다. #11의 별도 수행 결과는 아래에 기록한다.

## 별도 폴더 재현과 비밀 경계 — #11 / T027–T030

2026-10-07 · 기준 main c88b10f31adedb9e299ec9930b75647ca63809e1에서 독립 Git worktree를 만들고 기존 node_modules나 생성 빌드 없이 시작했다. Node24.21.0·npm11.19.0과 커밋된 lockfile, 위 고정 Compose 이미지·기존 볼륨을 사용했다. 실제 비밀번호는 Git 제외·권한600의 로컬 설정으로만 전달했다. T027–T030의 실행 증거이며 #14의 전체 요구사항 대조와 #13의 전달 완료를 대신하지 않는다.

### T028 설치·생성·검사·실패 후 복구

| 절차 | 실제 결과 |
|---|---|
| `npm ci` | 종료0, 713 packages 설치. 기존 lockfile 변경 없음. 설치된 의존성은 같은 lock 기준이며 전역 도구는 변경하지 않음 |
| `npm run contracts:check` → `contracts:generate` | 각각 종료0. 생성 디렉터리의 `git diff --exit-code` 종료0으로 동일 재생성 확인 |
| 원본 변경 후 미생성 | conventions.md에 임시 문장을 넣고 루트 check 실행: manifest 입력 차이로 종료1. finally에서 원본 bytes 복구 |
| 잘못된 타입 | 관리자 소스의 고유 임시 probe에서 number에 문자열 지정: 루트 typecheck 종료2·TS2322. 해당 probe만 제거 |
| 시험 DB 설정 누락 | TEST_DATABASE_URL 없이 루트 test:foundation 종료1·필수 설정 이름 진단. 로컬 시험 설정 전달 후 동일 루트 명령의 실제 DB 검사10개 종료0·skip0 |
| 웹 설정 누락·복구 | 관리자 .env를 임시 이름으로 옮긴 상태에서 dev:admin 종료1·ADMIN_DEV_API_ORIGIN 진단. 파일 원복 후 같은 루트 명령 시작·HTTP200 및 Holdlog 관리자 문서 확인 |
| 모바일 설정 누락·복구 | 앱 .env를 빈 내용으로 잠시 바꾼 export:bundle 종료1·공개 iOS origin 이름 진단. 원본 bytes 복구 후 공개 config와 iOS/Android export 성공 |
| 정상 재검사 | 루트 check 종료0: 회귀56개·모든 workspace lint/typecheck·웹/API build. 처음 의도적으로 실패시킨 입력·타입·설정이 현재 소스에 남지 않음 |

모바일 export의 별도 문제도 재현했다. 기존 `expo export --platform all`은 .env가 있어도 앱 설정의 origin 검사에서 종료1이었다. 설치된 CLI의 resolveOptionsAsync가 getConfig를 호출한 뒤 exportAppAsync가 dotenv를 읽는 순서를 확인했다. 공개 origin을 환경으로 먼저 전달하면 동일 명령이 종료0이었다. `export:bundle`을 `node --env-file=.env ../../node_modules/expo/bin/cli export --platform all`로 보완한 뒤, 공개 origin을 따로 주입하지 않고 앱 .env만으로 양쪽 export 종료0을 확인했다. 이 변경은 export의 설정 로드 순서만 바꾸며 앱의 필수 origin 검증과 제품 동작은 유지한다. iOS586개·Android466개 모듈의 production Hermes 번들과 metadata를 생성했다. 이번에 네이티브 바이너리를 새로 빌드하거나 실기기를 실행한 것은 아니다.

### T028 실제 DB·worker 재현

새 작업 폴더에서 루트 dev:api와 dev:worker를 별도 프로세스로 실행해 api.started·worker.started를 확인했다. 개발 DB의 이번 UUID 합성 행1개를 만든 뒤 Compose stop db → up -d --wait db를 수행했다. 중단 중 ready503/unavailable, 복구 후 ready200/ready와 같은 UUID 행1개를 확인했다. 검증 후 그 행만 삭제했다. 볼륨 삭제·운영 자료 사용은 없었다.

worker는 이 실제 DB 중단을 worker.failed로 기록했고 SIGTERM 후 worker.stopped·종료0이었다. 같은 루트 dev:worker 명령으로 재시작해 worker.started를 확인한 뒤 정상 종료했다. 시험 DB의 test:foundation은 작업 처리 중 중단과 별도 프로세스 SIGKILL 후 새 worker의 재시도 완료·효과 행1개를 각각 검증했다. DB/queue 정상 경로를 환경 오류로 미수행했던 #9 기록과 구분하며, 여기서는 독립 폴더에서 실제로 수행했다.

### T027 합성 표식과 출력 경계

고유 합성 표식을 서버 전용 키·관리자 준비 입력·DB 접속 비밀번호·비공개 경로 및 사용하지 않는 공개 probe 변수에 넣어 검사했다. 실제 비밀·개인 자료를 표식으로 사용하거나 결과에 저장하지 않았다. 공개 변수에 실제 비밀을 넣어도 안전하다는 뜻은 아니다. 소비되는 EXPO_PUBLIC 설정에는 공개 origin만 제공한다.

| 검사 대상 | 결과·확인 범위 |
|---|---|
| 공개 예시·Git 추적 | 서버·Compose 예시는 교체용 비밀번호이고 웹/모바일 예시는 공개 origin이다. 추적 파일1,133개에서 이번 고유 합성 표식 없음. Git 추적 중 .env·키·인증서·서명/네이티브 서비스 비밀 파일 없음 |
| Git 제외 | 실제 앱별/Compose 환경 파일, DB dump·storage, signing/네이티브 설정, ios/android 생성 프로젝트, 모든 dist와 로그 probe 경로가 check-ignore에 포함됨 |
| 관리자 웹 production 출력 | build:admin 종료0, HTML/JS 출력2개와 빌드 로그에서 합성 표식 없음 |
| API 빌드 출력 | build:api 종료0, JS/map 등36개 출력과 빌드 로그에서 합성 표식 없음 |
| 모바일 공개 config·export | config --type public 종료0과 양쪽 production hbc·metadata3개 및 export 로그에서 서버/관리자/DB/미사용 probe 표식 없음 |
| 시작 실패 로그 | 필수 DATABASE_URL 누락의 API/worker 종료1은 설정 이름만 진단. 합성 DB 비밀번호의 인증 실패는 worker.failed로 종료1·상세 접속값 미출력 |
| 실제 API 응답·로그 | 별도 로컬 port3111에서 합성 DB 비밀번호를 제공한 API를 시작. 합성 query·Authorization·Cookie를 보낸 ready 응답은 정확한503/unavailable이고 marker 없음. 종료 후 수집한 API 로그에도 marker 없음 |
| 정상 실행 로그 | 새 폴더에서 시작한 API·worker와 재시작 worker의 고정 event 로그에서 합성 표식 없음 |

이 결과는 위 입력·빌드·공개 config·로그의 검사 범위다. 서명 산출물·APK/IPA·네이티브 빌드 로그·외부 서버 로그·제품 로그인·파일/푸시 출력은 이번 표식 검사에서 미수행이다. #7의 네이티브 실행과 #10의 Hermes 실제 연결 증거는 별도로 유지한다. 사용하지 않는 합성 공개 변수의 미포함 결과를 실제 비밀을 공개 설정에 넣어도 된다는 허용으로 해석하지 않는다.

### T029 준비 상태 대조·T030 안내

[준비 체크리스트](../../setup-checklist.md)는 로컬 기반 실행·가상 기기/API 연결·개발/시험 설정 경계·계약 도구 소비의 실제 완료만 표시했다. 물리 서버 사양·테스트 휴대폰은 사용자 확인대로 미정이다. Google/Apple 계정·서명·지도/Firebase/APNs 자격증명과 초기 암장/벽 세팅 자료·실제 관리자 계정은 미확인 또는 후속 구현 전 미수행으로 유지한다. 외부 계정·실기기·물리 서버 준비가 로컬 통과로 바뀌지 않는다.

계정/관리자 저장·인증은004, 지도는007, 초기 암장/세팅 등록은006, 미디어/파일은011, 기기 푸시는017의 구현·연동 기준을 따른다. 아직 없는 제품 기능을 기반 합성 자료로 완료 처리하지 않았다. GitHub 저장소의 실제 visibility는 PUBLIC임을 조회했고 공개 범위/비공개 운영 기준 항목은 미완료로 유지했다. 설정 변경은 수행하지 않았다.

실행 명령·성공 조건·필수 설정 이름·문제 해결은 [개발 안내](../../development.md#실행과-완료-확인)에 반영했고 [quickstart](../../../specs/001-development-foundation/quickstart.md)는 그 원본으로 연결한다. 루트 check가 실제 DB/기기 실행을 포함하지 않는다는 점과 별도 test:foundation의 로컬 시험 DB 이름·사용자·포트를 명시했다. 반복 재생성으로 stale 실패를 숨기거나 재시작 때 기존 볼륨을 삭제하지 않도록 안내한다.

기존 문서·시안·계약 원본·lockfile·개발 DB 볼륨을 보존했다. 문서·계약 Python 정적 검사와 git diff --check를 통과했고 이번 변경은 export 명령·안내·T027–T030 체크에 한정한다. #14/T032 최종 대조·#13/T033 전달과 상위 #1의 전체 완료 판단은 남아 있다.

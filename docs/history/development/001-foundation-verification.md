# 001 로컬 실행·연결 검증

검증일: 2026-10-07 · 이 기록은 대상별 단독 실행과 실제 연동 결과를 구분한다. 상위 #1과 #10의 전체 연동 완료 기록이 아니다.

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
- iOS 도구: 사용자가 Xcode26.2에서27.0(27A266a)으로 업데이트했다. 첫 실행·약관·구성 요소 준비 후 iPhone 17 Pro/iOS26.2(23C54) 시뮬레이터에서 expo run:ios --device UUID --no-bundler로 빌드·설치·시작을 확인했다. 빌드 오류0·Expo 생성 스크립트 의존성 경고1이었다.
- Expo 자동 실행의 LAN 주소는 loopback Metro와 맞지 않았고 URL 전달만으로 JS 연결이 잡히지 않았다. Expo가 지원하는 simctl launch --terminate-running-process UUID com.holdlog.development --initialUrl http://127.0.0.1:8081로 로컬 주소를 명시해713개 모듈 로드와 실제 iOS Hermes에서 계약 검사 true·연결 함수 등록을 확인했다. 실제 API 요청은 아직 하지 않았다.

## 남은 실제 연동

이 단계는 새 제품 화면·인증·지도·푸시를 구현하지 않았다. API 주소는 iOS 시뮬레이터127.0.0.1, Android 기본 에뮬레이터10.0.2.2를 명시하며 가상 기기의 localhost를 PC로 취급하지 않는다.

브라우저/Nest API의 실제200·DB 중지503·연결 불가는 T022, iOS/Android와 실제 API 연결은 T023, 최종 계약/예제 대조는 T024, 서버·DB·worker·앱·웹 통합 기록은 T017에서 추가한다. 실제 휴대폰과 물리 서버 검증은001 범위 밖이다. 기존 [서버 기반](001-backend-foundation-verification.md)·[웹 기반](001-admin-foundation-verification.md) 단독 증거를 유지한다.

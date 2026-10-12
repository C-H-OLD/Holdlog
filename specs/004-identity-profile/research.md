# 004 구현 선택과 근거

2026-10-12 · 공식 문서 조사·저장소 계약 대조. 설치·제공자 인증·실기기 실행 결과가 아니다. 서버·보안 저장 의존성 patch/lockfile은 T002, 실제 provider SDK와 native 호환성은 T029에서 고정한다.

## 서버 검증

- **선택**: ESM `jose`를 우선 후보로 Google/Apple의 고정 JWKS와 허용 issuer/audience를 검증한다. nonce/subject는 별도 필수 검사하고 토큰의 외부 jku를 따라가지 않는다. Google official SDK도 대안이나 양 제공자 공통 서명/키 교체를 하나의 adapter로 검사하기 위해 JOSE를 우선한다.
- **근거**: [Google backend auth](https://developers.google.com/identity/sign-in/ios/backend-auth), [jose remote JWKS](https://github.com/panva/jose/blob/main/docs/jwks/remote/functions/createRemoteJWKSet.md). decode는 검증을 대신하지 않는다. 키 교체/기한/외부 실패를 주입해 닫힌 실패를 확인한다.
- **Apple code**: 제공되면 서버 비밀로 교환하고 ID token subject/nonce를 원래 검증 결과와 대조한다. 외부 교환은 SQL 잠금 전에 수행한다. [Apple 검증](https://developer.apple.com/documentation/signinwithapple/verifying-a-user), [token 교환](https://developer.apple.com/documentation/SigninwithAppleRESTAPI/Generate-and-validate-tokens).

## Google 모바일

- **선택**: 무료 `react-native-nitro-google-signin`을 우선 실험한다. RN0.86과 Nitro2.0.x/peer Nitro Modules0.36~0.37 호환표를 확인했다. 서버의 무작위256bit nonce를 hex로 발급해 명시적으로 전달하고 token nonce 일치를 검증한다. 자동 생성 nonce에 의존하지 않는다.
- **위험과 gate**: singleton configure·iOS 캐시 반환을 피하고 새 challenge마다 세션 정리/nonce 설정/명시 로그인으로 새 nonce가 token에 반영되는지 양 OS 실제 빌드에서 확인한다. SDK 캐시 토큰을 새 challenge에 제출하지 않는다. 캐시/두 번째 로그인/취소/재시도 검증 전 제품 adapter를 확정하지 않는다.
- **대안**: 무료 Original Google Signin은 Android nonce 미지원이라 현 계약에 부적합. 유료 Universal은 비용 결정 없이 채택하지 않는다. expo-auth-session generic PKCE는 가능하나 Google Android custom URI 금지·mobile loopback 폐기로 양 OS 공통 기본안으로 확정하지 않는다.
- **근거**: [Expo Google](https://docs.expo.dev/guides/google-authentication/), [Nitro 호환표](https://react-native-nitro-google-sign-in.github.io/docs/getting-started/compatibility/), [Nitro API](https://react-native-nitro-google-sign-in.github.io/docs/guide/api-reference/), [Original API](https://react-native-google-signin.github.io/docs/api), [Google native OAuth](https://developers.google.com/identity/protocols/oauth2/native-app).

## Apple·보안 저장

- **선택**: iOS는 `expo-apple-authentication`, token 저장은 `expo-secure-store`를 Expo57 호환 후보로 사용한다. 양 token을 한 레코드로 저장하고 저장 실패/회전 응답 유실은 같은 refresh 무한 재시도로 복구하지 않는다. 생체 인증 제품 요구가 없어 requireAuthentication을 추가하지 않는다.
- **검사**: nonce/state·authorizationCode·취소, SecureStore Android 백업 제외·iOS 재설치 Keychain 잔존·설치 UUID 갱신·늦은 응답 차단. iOS 전용 Apple 모듈을 Android 구현으로 오인하지 않는다. Android Apple의 Services ID/HTTPS redirect·nonce/state 경로는 T002에서 별도 확인하고 실제 제공자 설정 없으면 해당 플랫폼 연결은 차단으로 남긴다.
- **근거**: [Expo Apple SDK57](https://docs.expo.dev/versions/v57.0.0/sdk/apple-authentication/), [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).

## 관리자 해시·세션

- **선택**: `node-argon2`의 PHC hash/verify를 서버 전용 adapter로 사용한다. 임의 SHA password hash나 수제 PHC를 만들지 않는다. async 비용은 구현 환경에서 측정하고 기본 파라미터·정확한 버전을 고정한다. 고엔트로피 session token 해시는 password 비용과 구분한다.
- **근거**: [node-argon2](https://github.com/ranisalt/node-argon2), [Node24 crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html#cryptoargon2algorithm-parameters-callback).
- **CSRF 선택**: cookie secret + 서버 비밀키 + session ID로 도출해 재조회 가능한 CSRF를 만들고 DB hash와 대조한다. 원문 cookie를 JSON으로 반환하지 않는다. token 교체 방식도 가능하나 여러 탭의 불필요한 무효화를 피한다.
- **비밀번호 교체**: 모든 기존 관리자 세션을 같은 TX에서 회수하는 내부 처리로 확정한다. active 값/권한/식별자는 교체로 변경하지 않는다.001 초기 준비 원본을 따라 구현·검사한다.

## 제품 결정과 외부 준비

2026-10-12 사용자 확인으로 이름 필수·프로필 사진 선택을07.02에서 입력한다. 초기 이름 fallback은 사용하지 않는다. 신규 인증과 가입을 분리하는 제한 증명 방식과, 일반 계정을 먼저 만들어 `pending` 권한으로 차단하는 방식을 비교했다. 제한 증명 방식을 선택해 계정/세션 생성 전 권한 경계를 명확히 하고 기존 API guard에 미완료 계정 예외를 퍼뜨리지 않는다.

사진은 가입 전 제한 업로드와 이름 가입 후 기존011 업로드를 비교했다. 후자를 선택해 새 미완료 자산 소유자·업로드 권한을 만들지 않는다. 이름 가입 성공과 사진 저장 실패를 구분하고 기존 다이얼로그 패턴에서 재시도/사진 없이 계속하기를 제공한다. 증명은15분의 구현 기본값으로 정하며 기존5분 login challenge를 연장하거나 재사용하지 않는다.

현행2.1.0 `login`은 MobileSession 단일 응답이다. `LoginResult` 분기는 HTTP breaking,07.02 Route enum 추가도 exhaustive 소비에 영향이 있다. 기존 conventions의 버전 규칙을 따라3.0.0·API v2로 전환한다. 아직 제품 로그인 controller/앱 auth 소비는 없고 admin 기반 API_BASE_PATH·proxy는v1 문자열을 사용하므로 T006에서 함께 이관한다. 기존버전 유지 예외를 임의로 추가하지 않는다. 원본/생성/기반 소비 전환은 이 브랜치에 반영했으며 병합 전이다.

Google/Apple 계정·키·서명·실기기·Android Apple HTTPS redirect는 설정/검증 선행이며 준비 전 통과로 기록하지 않는다.

## Android Apple 후보

`@invertase/react-native-apple-authentication`의 Android WebView interception을 우선 검증한다. 등록된 HTTPS Return URL의 응답을 SDK가 가로채 기존 LoginInput의 idToken/authorizationCode로 보낸다. 별도 callback API를 추가하지 않는 후보이며 Service ID/Primary App ID·정확한 HTTPS domain/Return URL 준비는 필요하다. [공식 Android 설정](https://github.com/invertase/react-native-apple-authentication/blob/main/docs/ANDROID_EXTRA.md).

SDK가 nonce를 자동 SHA256하므로 Apple adapter는 두 OS의 JWT nonce가 같은 `SHA256(challenge.nonce)`가 되도록 정하고 서버는 Apple claim 자체를 저장된 nonceHash(원문 challenge의 SHA256)와 상수 시간 비교한다. Google의 raw nonce claim은 SHA256한 뒤 저장된 nonceHash와 비교한다. Apple claim을 다시 hash해 이중 변환하지 않는다. [nonce 설명](https://github.com/invertase/react-native-apple-authentication#serverside-verification). 현재 SDK redirect 검사가 부분 문자열 기반인 점은 T029의 보안 gate로 둔다. exact origin/path·허용 navigation·JS bridge 출처·랜덤 state 일치·응답 유출을 검사하며 필요하면 native adapter를 수정한다. [SDK WebView 원본](https://github.com/invertase/react-native-apple-authentication/blob/main/android/src/main/java/com/RNAppleAuthentication/webview/SignInWebViewClient.kt).

이 후보 실패 시 외부 브라우저와 서버 form_post·일회용 handoff의 추가 계약을 따로 검토한다. token/code를 deep-link query에 실어 앱으로 넘기지 않는다. Apple 공식 외부 플랫폼 흐름과 SDK interception의 검증 책임은 구분한다. [Apple 다른 플랫폼](https://developer.apple.com/documentation/signinwithapple/incorporating-sign-in-with-apple-into-other-platforms).

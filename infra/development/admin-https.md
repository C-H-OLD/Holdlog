# 관리자 로컬 HTTPS 준비

004/#54의 개발 인증 검사 도구를 켜는 절차다. 실제 서버·시험 계정·신뢰 브라우저 연동 증거는 #57에서 기록한다. 관리자 새 제품 로그인 화면이나 운영 배포 절차가 아니다.

단독 HTTPS 테스트는 `PATH`에서 `openssl` 실행 파일을 찾는다. 설치/준비가 없으면 명확한 사전 조건 오류로 실패하며 필요한 검사를 skip해 통과로 합산하지 않는다. 현재 개인키 권한 검사는 POSIX 파일 권한 기준이다.

## 인증서와 Node 설정

담당 개발자가 [mkcert 공식 안내](https://github.com/FiloSottile/mkcert)에 따라 로컬 CA를 신뢰할 환경을 준비한다. `mkcert -install`은 시스템/브라우저 신뢰 저장소를 바꾸는 담당자의 명시적인 설정 작업이며 API/Vite 실행이나 자동 검사에서 수행하지 않는다. 인증서·개인키·CA 키는 Git에 넣지 않고 CA 키를 공유하지 않는다.

프로젝트 루트에서 로컬 파일을 생성하는 예시는 다음과 같다. CA 설치가 필요한 경우 공식 안내를 먼저 따른다.

```sh
mkdir -p certificates
mkcert -cert-file certificates/admin-local.pem -key-file certificates/admin-local-key.pem localhost 127.0.0.1
chmod 600 certificates/admin-local-key.pem
cp apps/admin/.env.https.example apps/admin/.env
```

`apps/admin/.env`의 `ADMIN_DEV_TLS_CERT`·`ADMIN_DEV_TLS_KEY`를 생성한 파일의 **절대 경로**로 바꾼다. Node 로더는 localhost/127.0.0.1 SAN, 유효 기간, 키 일치와 개인키 권한을 검사한다. 인증서가 실제 브라우저에서 신뢰되는지는 별도로 확인한다. 누락·부분 설정·HTTP에서의 검사 도구 활성화를 허용하지 않는다. 이름이 `VITE_*`인 공개 환경 변수로 옮기지 않는다.

## 서버와 개발 검사 실행

[#52 서버 실행 안내](../../docs/development.md#관리자-인증-api와-초기-계정-도구)로 API와 시험 계정을 준비한다. 서버의 `ADMIN_ALLOWED_ORIGINS`에는 사용할 정확한 `https://127.0.0.1:5173`을 설정한다. 개발 proxy는 원래 Origin·Cookie·X-CSRF-Token·Set-Cookie와 `/api/v2/admin` path를 보존하고 서버 설정을 대신하지 않는다. 관리자 API의 HTTP upstream은 검사 도구 활성화 여부와 관계없이 loopback만 허용한다. 일반 HTTP health 모드에서 사설 LAN upstream을 지정하면 health 연결은 유지하되 `/api/v2` 요청은 proxy 전에503으로 차단한다. HTTPS 인증 검사 모드는 이 설정 자체를 거절한다. 사설 HTTPS upstream을 사용하면 Node가 해당 인증서도 신뢰해야 하며 TLS 검증을 끄지 않는다.

```sh
npm run dev:admin
```

브라우저에서 `https://127.0.0.1:5173/__development/admin-auth`를 연다. 경고 우회 없이 신뢰 인증서를 확인한 뒤 loginId와 준비한 비밀을 입력한다. 비밀번호는 요청 시작 전에 입력창에서 지우며 URL·로그·결과·저장소에 기록하지 않는다. 로그인 검사 → 세션 재조회 → 로그아웃 검사에서 상태와 안전한 실패 코드만 확인한다. cookie는 HttpOnly로 브라우저가 관리하고 CSRF는 메모리에만 둔다.

`ADMIN_DEV_AUTH_CHECK=false` 또는 미설정이면 검사 경로와 직접 검사 모듈 요청은404다. 기본 health 연결 검사는 기존 HTTP 모드를 유지하며, health proxy는 Cookie·X-CSRF-Token·Authorization을 제거한다. production build/preview에는 검사 도구 진입점·인증서·개인키·Node 설정이 없다. 시스템 신뢰 설치 없이 임시 인증서/TLS 우회로 수행한 합성 브라우저 시험을 #57의 신뢰 HTTPS 통과로 합산하지 않는다.

TLS 옵션의 원본은 [Vite server.https](https://vite.dev/config/server-options#server-https), cookie/CSRF/Origin 원본은 [C02](../../packages/contracts/conventions.md#인증기기관리자--c02c03c09)다.

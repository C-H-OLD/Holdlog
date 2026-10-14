# 관리자 실제 HTTPS 연동 검사

004/T025·[#57](https://github.com/C-H-OLD/Holdlog/issues/57)의 재실행 도구다. 기존 서버·관리자 코드와 실제 PostgreSQL을 실행하며, 호스트 신뢰 저장소를 변경하지 않는 별도 Linux Chromium의 NSS 저장소에 시험 CA를 설치한다. 결과의 원본은 [검증 기록](../../../docs/history/development/004-admin-auth-verification.md)이다.

## 실행

검증한 호스트는 macOS ARM64다. Node24.21.0·npm11.19.0, Python3의 POSIX PTY, PATH의 OpenSSL, Docker Desktop 및 [기본 설치](../../../docs/development.md)가 필요하다. 준비가 없거나 검사가 실패하면 nonzero로 종료하며 skip하지 않는다. Chromium의 NSS CA 설치 방법은 [공식 안내](https://chromium.googlesource.com/chromium/src/+/master/docs/linux/cert_management.md)를 따른다.

프로젝트 루트에서 실행한다.

```sh
npm run build --workspace @holdlog/server
docker build -t holdlog-57-browser -f infra/development/admin-auth-verification/Dockerfile.browser infra/development/admin-auth-verification
node scripts/verify-admin-https/run.mjs
```

Docker 실행 파일이 PATH에 없으면 `ADMIN_HTTPS_DOCKER`에 실행 파일의 절대 경로를 지정한다. 이미지의 Node·Playwright 버전은 Dockerfile에 고정하며 Debian Chromium/NSS/CJK 패키지는 빌드 시 설치한다. 실제 Chromium 버전은 매 실행 결과에 기록한다. 사용자 로컬 `.env`를 덮어쓰지 않고 프로세스에 Node 전용 설정을 주입한다.

실행기는 소유한 임시 `holdlog_test` DB container, 무작위 시험 관리자·회원, 인증서·개인키, 비공개 입력 파일과 두 HTTPS Vite origin을 생성한다. 실제 bootstrap CLI에는 PTY의 숨김 입력으로만 비밀번호를 전달한다. CA 개인키는 브라우저 container에 전달하지 않으며 public root만 NSS에 설치한다. `ignoreHTTPSErrors`, 인증서 오류 무시 flag, 오류 화면 우회를 사용하지 않는다.

브라우저 container는 별도 filesystem/NSS와 읽기 전용 검사·fixture mount를 사용한다. `DAC_OVERRIDE`는 호스트의0600 fixture를 읽고 별도 증거 폴더에 화면을 저장하는 시험 container 권한이다. Chromium sandbox 대신 격리 container를 사용하며 운영 실행 구성으로 사용하지 않는다. localhost DNS mapping은 Docker Desktop의 호스트 연결에만 사용하며 URL·인증서 호스트명·Origin은 localhost로 검사한다.

정상 종료와 검사 실패 시 DB container, 브라우저 container, API/Vite와 비공개 입력·CA 키를 정리한다. 강제 프로세스 종료·Docker daemon 중단 시에는 자동 정리가 보장되지 않으므로 해당 실행에서 만든 시험 container와 임시 파일을 확인한다. 기존 개발/시험 DB나 신뢰 저장소를 복구 수단으로 제거하지 않는다. 비밀 없는 `result.json`·두 screenshot은 결과의 `evidenceDirectory`에 남고 Git에 넣지 않는다.

## 범위

- 실제 bootstrap create·중복 거절·version 교체와 terminal 복구.
- CA 미신뢰/호스트명 불일치 거절과 신뢰 CA의 TLS 검증 통과.
- 실제 Provider의 로그인·reload·cookie 저장/자동 전송·CSRF/Origin 거절·회원/관리자 분리.
- 시험 DB의 해당 세션 시각을 조정한 idle/absolute 만료, 비활성·교체·로그아웃 회수.
- 실제 `withAdministrator` TX의 합성 보호 쓰기1건과 거절된 쓰기의 변경0건.

006/019 제품 쓰기 controller와 화면은 이 도구에 추가하지 않는다. 일반 회원 fixture는 실제 DB/session 구현을 사용하지만 Google/Apple 제공자 인증과005의 크루 관리자 지정 흐름을 검증하지 않는다. 클라이언트의 크루 관리자/주체 표식으로 서비스 관리자 권한이 생기지 않는 거절 검사를 구분해 기록한다. 브라우저가 정상 POST에 Origin을 넣으므로 Origin 누락은 CA를 신뢰하는 Node HTTPS 요청의 별도 wire fault case로 검사한다.

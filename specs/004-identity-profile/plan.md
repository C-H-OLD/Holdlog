# Implementation Plan: 로그인과 내 정보·프로필

**Branch**: `codex/004-signup-plan` | **Date**: 2026-10-12 | **Spec**: [spec.md](spec.md)

> 가입 화면07.02와 이름 필수·사진 선택을 반영한 설계. 계약3.0.0·API v2 원본/생성/기반 소비는 PR #60으로 병합했다. #49 범위의 T001~T005 공통 기반을 구현·단독 검증했다. 나머지 역할 작업은 해당 선행을 따르며 제품 인증 API·실제 연동은 미구현·미검증이다.

**Input**: `specs/004-identity-profile/spec.md` · [상위 #45](https://github.com/C-H-OLD/Holdlog/issues/45)

## Summary

FR-001~006을 서버 인증·프로필, 모바일 세션/화면, 관리자 웹 세션 소비와 실제 연동으로 나눈다. 001 기반 위 계약3.0.0·API v2 전환은 T006/PR #60으로 병합했다. 설계·32개 작업 분리를 마쳤고 T001~T005의 SQL/TX/설정·의존성 기반을 구현·단독 검증했다. [수행 증거](../../docs/history/development/004-identity-foundation-verification.md)와 구분해 제품 인증 API·앱 가입 흐름·제공자/기기 실제 연동은 후속으로 유지한다.

모바일 Google/Apple 검증, 불투명 세션, 서비스 관리자 별도 인증을 하나의 서버 identity 업무 모듈로 조립한다. 제공자 SDK가 nonce를 양플랫폼에서 전달하는지 먼저 검증한다. 모바일 공통 탐색은003, 크루/초대는005, 사진 bytes는011, FCM 등록은017, 계정 삭제 실행은021에서 소비한다. 해당 기능을004 구현으로 가져오지 않는다.

## Technical Context

- **Language/Version**: TypeScript, Node24.21.0·npm11.19.0. 앱 프레임워크 버전은 각 package.json의 고정값을 유지한다.
- **Primary Dependencies**: NestJS11·pg8, React19/Vite, Expo57/RN0.86. 서버 JOSE·Argon2id와 모바일 SecureStore는 T002에서 manifest/lockfile로 고정했다. [호환성 증거](../../docs/history/development/004-identity-foundation-verification.md)를 따르며 실제 제공자 어댑터는 T029의 별도 후보/gate다.
- **Storage**: PostgreSQL 인증/프로필/기기 연결, 기기 보안 저장소. 사진 bytes는011 비공개 저장 어댑터. 관리자 cookie 원문은 브라우저, 서버에는 해시만 둔다.
- **Testing**: 기존 Node test·타입/lint/build·계약 생성 검사, 실제 PostgreSQL HTTP/동시성 시험, 로컬 신뢰 HTTPS 브라우저, iOS/Android 전용 개발 빌드. 형식 fixture와 실제 제공자 검증을 분리한다.
- **Target Platform / Project Type**: iOS·Android 모바일 + 관리자 웹 + 단일 NestJS API. worker는 인증 HTTP 시작과 분리한다.
- **Performance Goals**: 임의 SLA 추가 없음. Argon2 비용·JWKS 캐시/키 교체·기한·갱신 동시 요청을 로컬 측정하고 결과를 남긴다. 계약의 세션 기간을 바꾸지 않는다.
- **Constraints**: 이메일 병합 금지, 매 요청 현재 세션/계정 검사, nonce 재사용 금지, 입력/로그/번들에 비밀 노출 금지. 관리자 신규 로그인 화면은 현재 시안에 없으므로 API 소비와 브라우저 검증 도구까지만 준비한다.
- **Scale/Scope**: 07.01·07.02·05.01·05.02와 관리자 인증 계약 소비. 제품 운영 배포·다른 기능의 전체 구현 제외.

## Constitution Check

| 원칙 | 설계 전·후 확인 |
|---|---|
| Living Spec | 기존004 FR-001~006·SC-001~004와 승인07.02 연결. FR-001에 가입 수락 기준 반영 |
| 원본 한곳 | HTTP/runtime/수명/업무 규칙은002·계약·제품 원본 참조. 이 계획은 구현 배치·TX·검사 책임을 정함 |
| 확정 범위 | 관리자 새 화면·계정 병합·회원 권한 상승·삭제 실행 추가 없음 |
| 계약 협업 | 공통 변경을 한 묶음에서 모으고 FE/BE 예제와 작업 분리를 지정 |
| 증거 | 합성·DB·브라우저·제공자·실기기·미수행을 분리. 현재 단계는 실행 완료 아님 |

제품 입력은 이름 필수·사진 선택으로 확정됐다. 이름 가입 후 사진 저장 실패는 기존 오류 다이얼로그의 재시도/사진 없이 계속하기로 처리한다. 계약3.0.0 전환을 병합했으므로 FE는 같은 fixtures로 독립 착수할 수 있고 BE는 공통 SQL/설정 병합을 선행으로 둔다. 실제 제공자 설정은 합성 로직 개발과 구분한다.

원칙 위반 없음. 외부 설정/SDK 검증의 미완료는 아래 작업의 차단 조건이며 계약을 약화하는 예외로 취급하지 않는다.

## Project Structure

### Documentation

`plan.md` · [research.md](research.md) · [data-model.md](data-model.md) · [contracts/README.md](contracts/README.md) · [quickstart.md](quickstart.md) · [tasks.md](tasks.md).

### Source Code (현재 기반과 후속 경로)

```text
apps/server/src/modules/identity/     identity.module/controller/service/repository.ts
                                    providers.ts · mobile-session.ts · signup.ts · signup-proof-cleanup.ts
                                    admin-session.ts
apps/server/src/database/            transaction.ts (실제 공통 필요 범위)
apps/server/src/config/              environment.ts · logging.ts (기존 파일 보완)
apps/server/src/tools/               admin-bootstrap.ts
apps/server/db/migrations/           002_identity.sql (기존 순서 확인 후 확정)
apps/server/test/                    identity.spec.ts · identity.e2e-spec.ts
                                    admin-auth.e2e-spec.ts · profile.e2e-spec.ts · signup.e2e-spec.ts
apps/mobile/src/api/holdlog/         auth.ts · profile.ts
apps/mobile/src/providers/           AuthProvider.tsx
apps/mobile/src/lib/                 secureSession.ts · identityProviders.ts · signupFlow.ts
apps/mobile/src/hooks/mutations/     useEditProfile.ts
apps/mobile/src/app/                 login.tsx · signup.tsx · (tabs)/profile/index.tsx · profile/edit.tsx
apps/mobile/test/                    identity.test.ts · profile.test.ts · signup.test.ts
apps/admin/src/api/                  auth.ts
apps/admin/src/providers/            AuthProvider.tsx
apps/admin/src/development/          admin-auth-check.ts (제품 번들 제외)
apps/admin/test/                     auth.test.ts
infra/development/                   HTTPS용 개발 구성·비밀 없는 예시
```

모바일 라우트 파일명·공용 UI/Query 구성은003과 맞춘 뒤 화면 주 담당이 연결한다. 단독 인증 로직/전송/상태 검사는003 구현을 기다리지 않으며 실제 화면 조립은003 결과가 필요하다. 빈 폴더·별도 프레임워크를 먼저 만들지 않는다. 각 서비스의 [아키텍처 목차](../../docs/architecture/README.md)를 따른다.

## 처리 설계와 작업 경계

1. **제공자 검증**: challenge 생성의 nonce 원문은 응답 한 번에만 전달한다. SDK에 전달한 nonce 표현(raw/hash)을 제공자별 adapter에서 고정하고 서버가 같은 표현을 검증한다. 서명·iss/aud/exp·subject·nonce와 Apple code 교환을 모두 확인한 후 DB TX를 시작한다. 외부 JWKS/code 요청 중 DB 잠금을 보유하지 않는다. 검증 결과만으로 challenge 소비를 확정하지 않고 저장 직전 만료/미소비를 다시 잠가 확인한다.
2. **인증과 가입 원자성**: 기존 identity면 challenge 소비·세션/기기 연결을 한 TX로 저장하고 `kind=authenticated`를 반환한다. 신규 identity면 Account/Session/Device를 만들지 않고 challenge 소비와 제한된 SignupProof 생성만 commit해 `kind=signup_required`를 반환한다. 가입 증명은15분·일회용·설치UUID/검증한 provider·subject에 결합하고 원문을 저장하지 않는다. `completeSignup`은 증명 잠금·입력/요청키 검증 후 Account/ExternalIdentity/세션/설치 연결과 증명 소비를 같은 TX로 저장한다. 이름은 trim 후 공백만인 값을 거절하고 임의 길이/실명/중복 이름 제약은 추가하지 않는다. 서로 다른 증명으로 동일 provider/subject가 경합하면 unique로 계정 하나만 만들고 후발은409 SIGNUP_ALREADY_COMPLETED로 새 SNS 인증을 요구한다. 가입 이름으로 기존 계정을 덮어쓰지 않는다. 잠금·receipt·응답 유실 세부 원본은 [가입 처리 설계](signup-design.md)를 따른다.
3. **갱신**: Account→AuthSession→RefreshCredential 순서로 현재 family를 직렬화한다. 사용된 credential 재제출은 family 회수 TX를 commit한 뒤401로 응답한다(예외로 rollback하지 않음). 과거 해시는 절대 만료까지 보존한다. access 요청은 해시 조회 후 현재 Account/Session/expiry/revocation을 검사한다. token 원문은 receipt/로그에 저장하지 않아 유실 응답 재요청으로 회복할 수 없으며 새 인증 절차로 회복한다.
4. **로그아웃·기기**: 인증 세션에 연결된 설치의 현재 account 관계를 재확인해 연결과 push token-account 관계를 원자 회수한다. 이미 다른 계정이 설치를 사용하면 그 연결을 지우지 않는다. 기록·가입은 변경하지 않는다.017이 기기 등록 API/암호화 token 저장·발송을 맡고004는 연결/해제 저장 경계를 제공한다.
5. **프로필**: 본인 projection만 반환하고 기대 Profile.version·현재 자산 소유/용도/ready 상태를 잠금 아래 확인한다. 프로필 값 변경과 receipt를 같은 TX로 저장하고 이미지 교체/제거의 회수·정리는011 서비스에 같은 client로 전달한다. 사진 초안 생성은004 입력점, 업로드·변환·읽기/정리는011 구현이다. 기존 사진은 새 업로드 실패만으로 변경하지 않는다.
6. **관리자**: 회원과 별도 principal/session 테이블·guard를 둔다. 불투명 cookie는 서버에 hash, CSRF는 요청 cookie secret과 서버 비밀 키에서 도출해 session 조회 때 재구성하고 저장된 csrfTokenHash와 대조한다. JSON에는 cookie secret을 반환하지 않는다. 매 보호 요청에서 active/회수/idle/absolute를 검사하고 쓰기는 Origin·CSRF를 검증한다. 로그인은 기존 세션이 없으므로 허용 Origin 검사 후 credential 검증으로 최초 CSRF를 발급한다. 로그인 CSRF 예방과 인증 이후 쓰기 헤더 요구를 혼동하지 않는다. 비밀번호 교체는 principal version 검사·hash 변경·전체 admin session 회수를 같은 TX로 commit한다.
7. **브라우저**: 로컬 신뢰 인증서의 HTTPS same-origin 관리자 proxy로 cookie/Origin을 그대로 전달한다. Secure/SameSite를 개발용으로 낮추지 않는다. 인증서·개인키는 Git 제외, 공개 예시는 경로 이름만 둔다. Node 전용 설정을 VITE_*에 넣지 않는다. 인증 UI는 확정된 화면이 없어 추가하지 않고 개발 검사 도구와 API/Provider로 FR-006을 확인한다.006/019의 화면은 해당 계획에서 조립한다.
8. **모바일**: 기본 fetch와 주입 가능한 전송/저장/provider adapter로 단독 검사가 가능하게 한다. 보안 저장 한 레코드에 token pair·세션 세대·기기 UUID를 관리하고 저장 실패는 인증 성공으로 노출하지 않는다. 동시 갱신은 같은 세션의 한 promise를 공유한다. 로그아웃/계정 변경은 세대를 먼저 올리고 늦은 요청의 저장·캐시 반영을 거절한다. 일시 장애는 확정401과 구분하고004 UI는 기존 오류/입력 보존 기준을 따른다. 가입 증명은 메모리에만 보관하며 인증세션과 구분한다. 이름 가입 성공 후 보안 저장을 완료해야 본인 API를 호출한다. 선택 사진은 그 뒤011 업로드/ready→profile PATCH로 저장한다. 가입 성공 뒤 사진 실패는 계정 생성을 반복하지 않고 재시도/사진 없이 계속하기를 제공한다. 앱 종료·완료 응답 유실·보안 저장 실패 후에는 재인증으로 계정을 회복하고 로컬 사진은 재선택한다. PendingInvite는 증명 만료/재인증 동안005 보존 규칙을 따르며 계정이 확정되기 전 자동 가입하지 않는다.

## 계약 전환과 준비 기준

T006은 [계약 변경 설계](contracts/README.md)를 실제 원본에 반영하는 SHARED 선행이다. HTTP breaking과 Route enum 추가의 기존 버전 규칙을 유지해3.0.0·/api/v2로 전환한다. Admin API_BASE_PATH·Vite proxy matcher·cookie path·관련 합성 테스트를 함께 수정하고 생성 DTO·validator·fixture를 재생성한다. health는 `/internal/health/` 기반으로 유지한다. 기존2.1.0/v1은 배포된 제품 API가 아니므로 병행 지원을 약속하지 않는다. 실제 배포 소비자가 발견되면 전환 작업을 중단하고 별도 호환 계획을 세운다. 원본·생성물·관리자 기반 소비의 전환은 PR #60으로 병합했다. 제품 인증 구현·실제 연동은 별도다.

## 외부 선행과 준비 기준

- SHARED T029 작업은 각 provider/플랫폼의 nonce 지원, signing/client audience, redirect/code 교환과 보안 저장 호환성을 실제 개발 빌드에서 증명하고 라이브러리/설정 이름을 고정한다. 실패 시 기술 후보를 재검토하며 유료 구독·C02 nonce 완화는 임의 결정하지 않는다.
- 서버는 합성 서명/JWKS/code 응답으로 단독 개발할 수 있다. Google/Apple 외부 계정·키·허용 audience가 없어도 DB/guard/관리자 준비를 막지 않는다.
- 관리자 API/웹 소비는 모바일 SDK 선택을 기다리지 않는다. 공통 잠금·설정·migration/lockfile 변경은 SHARED가 모으며 관리자 도구는 BE가 작성한다.
- 후속005/011/017/021는004 모바일 인증 서브 작업의 검증·병합 결과로 착수하며 상위 #45 종료를 기다리지 않는다.006/019도 관리자 인증 서브 작업을 소비한다. 최종004 전체 완료는003의 화면 기반과005의 실제 로그인 후 초대/크루 결과,011 사진 bytes,017 로그아웃/푸시 연결,021 삭제 진입 대상 연결이 준비된 뒤 FR별 실제 검증을 해야 한다. 구현되지 않은 후속 결과는 mock 전달 증거로만 남긴다.

## Complexity Tracking

원칙 위반 없음. 인증 검증/보안 저장/미디어 경계의 adapter는 합성 시험과 실제 provider·기기·011을 교체하기 위한 것이며 앱 사이 구현 공유를 만들지 않는다.

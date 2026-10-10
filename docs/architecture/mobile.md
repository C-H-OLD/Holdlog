# 모바일 아키텍처

`apps/mobile`의 코드 배치·의존 방향·상태 소유 경계를 관리한다. Refit의 역할별 폴더 배치를 기본으로 사용하고, Holdlog의 공통 계약·계정·크루·기록 관계를 그 구조 안에 적용한다. 제품 동작은 기존 명세, API와 기기 자료 형식은 공통 계약이 원본이다. 비교 근거는 [Refit 분석 기록](../history/decisions/2026-10-10-mobile-refit-reference.md)에 둔다.

## 적용 범위와 현재 상태

현재 앱은 Expo 전용 개발 빌드, 빈 루트 화면, 개발 API 연결 진단과 합성 계약 소비까지 갖추고 있다. 아래 목표 구조와 도구 선택 방향은 후속 구현의 기준이며, 디렉터리·제품 화면·인증·상태 관리가 이미 구현됐다는 뜻은 아니다.

| 구분 | 현재 | 후속 적용 |
|---|---|---|
| 실행·검사 | npm workspace, 루트 lockfile·ESLint·엄격 TypeScript, Expo 기본 Metro, Node 테스트 | 기존 기반 유지. 정확한 버전·명령은 [개발 안내](../development.md)와 manifest에서 관리 |
| 진입점 | `index.js` → `App.tsx`, 개발 진단 등록 | 003에서 Expo Router 진입점으로 전환하면서 개발 진단 유지 |
| 탐색·서버 상태 | 관련 라이브러리 미설치 | Expo Router·TanStack Query를 채택하는 방향으로 003 상세 설계와 호환성 확인 |
| 공유 입력·기기 저장 | 제품용 구현 없음 | 여러 화면이 공유하는 클라이언트 상태에는 Zustand, 세션 전달에는 Context, 화면 내부 상태에는 React 기본 상태 사용. 영속 저장은 수명별 별도 설계 |
| 계약 | 생성 타입과 실제 JavaScript 검사 함수를 합성 자료로 소비 | 같은 공개 진입점을 제품 API 계층에서 사용. 계약 패키지는 자동 HTTP 클라이언트가 아님 |

현재 계약 import는 루트 workspace 연결로 해석되며 mobile manifest에는 `@holdlog/contracts` 직접 의존 선언이 빠져 있다. 초기 설정 보완 시 계약 패키지의 실제 package version으로 직접 의존을 선언하고 고정 Node/npm으로 루트 lockfile을 함께 갱신한다. package version과 OpenAPI/runtime의 계약 버전은 구분한다.

이 문서는 모바일 공통 설계다. [003 앱 탐색과 공통 화면 부품](../../specs/003-app-shell/spec.md)의 라우트·부품별 상세 계획, 작업 목록과 실행 검증은 별도로 준비한다. 운동·업로드·인증 등 각 기능 구현을 003에 합치지 않는다.

## 화면과 기능 코드 배치

Refit처럼 화면·통신·부품·훅·상태를 역할별로 찾을 수 있게 배치한다. 모노레포의 공통 경계는 `apps/mobile`과 `packages/contracts` 사이에 두며, 앱 내부에 별도 `application`·`shared` 계층을 추가하지 않는다. 아래는 후속 구현의 배치 기준이며 필요한 파일이 생길 때 해당 폴더를 만든다.

```text
apps/mobile/
├── AGENTS.md                 # 모바일 작업별 필수 문서 목차
├── index.js                  # 앱 등록·개발 진단 초기화
├── App.tsx                   # 현재 빈 루트; Router 전환 시 역할 정리
├── app.config.ts             # Expo·네이티브 설정 원본
├── configuration/            # 기존 Node/빌드용 설정
├── checks/                   # 기존 계약·환경 타입 소비 검사
├── test/                     # 현재 Node 테스트와 후속 검사
└── src/
    ├── app/                  # 후속: Expo Router 화면·_layout
    ├── api/                  # 후속: 서버 통신과 Query 설정
    │   ├── queryClient.ts    # QueryClient·공통 캐시 설정
    │   ├── ApiError.ts       # API 오류 표현
    │   └── holdlog/          # client·auth·crews·records 등 API 함수
    ├── components/           # 후속: 재사용 UI·화면별 부품
    │   ├── ui/              # 버튼·입력·다이얼로그·시트
    │   └── icons/           # Holdlog 아이콘
    ├── hooks/
    │   ├── queries/         # 후속: 서버 조회 훅
    │   └── mutations/       # 후속: 서버 변경·캐시 갱신 훅
    ├── providers/           # 후속: 인증·Query 등 Context 연결
    ├── store/               # 후속: 크루 선택·공유 입력·운동 상태
    ├── features/            # 후속: 복잡한 기능의 전용 로직·컨테이너
    ├── lib/                 # 후속: 시간 변환·토큰 저장·기기 처리
    ├── constants/           # 후속: 디자인 토큰·query key·정책 상수
    ├── types/               # 후속: 앱 내부 표시·입력 모델
    └── development/         # 기존: 개발 연결·계약 진단
```

`app/`의 파일에서 화면을 직접 구현하고 훅을 호출할 수 있다. 화면마다 별도의 feature screen과 이를 다시 내보내는 라우트 파일을 만들지 않는다. API 전송은 `api/`, 재사용하는 서버 조회·변경은 `hooks/`로 분리한다. 화면이 복잡해지면 UI 묶음은 `components/<화면>/`, 여러 단계에 걸친 전용 로직·컨테이너는 `features/<기능>/`로 꺼낸다.

`features/`는 복잡한 기능에 필요한 만큼 사용한다. 모든 스펙마다 폴더를 만들거나 각 기능에 `api/model/ui/index.ts`를 의무적으로 두지 않는다. 공통 API·조회 훅·store를 feature 안에도 중복해서 만들지 않는다.

| 작성할 코드 | 배치 기준 |
|---|---|
| 개인 기록을 서버에 저장하는 함수 | `api/holdlog/records.ts` |
| 기록을 읽고 저장 결과에 따라 캐시를 갱신하는 훅 | `hooks/queries/usePersonalRecord.ts`, `hooks/mutations/useSavePersonalRecord.ts` |
| 공통 다이얼로그·기록 화면 입력 부품 | `components/ui/AlertDialog.tsx`, `components/records/` |
| 여러 화면이 공유하는 운동 상태 | `store/workoutStore.ts`. 상세 동작·기기 검증은 018 담당 |
| 복잡한 운동 종료 흐름·업로드 작업 조정 | 필요할 때 `features/workout/`, `features/media/` |
| 날짜 변환·보안 저장·기기 이벤트 처리 | `lib/`. React 생명주기와 연결하는 부분은 `hooks/` |
| 색상·타이포·query key | `constants/`. 역할별 파일로 구분 |
| 화면 전용 표시·입력 타입 | 사용하는 파일 가까이 두고 여러 곳에서 쓰면 `types/`. 통신 DTO는 contracts에서 import |

이 경로들은 배치 예시이며 아직 생성하지 않았다. 순수 유틸을 `lib/`와 `utils/`에 중복 분류하지 않는다. 기능 담당은 [기능 스펙 목록](../../specs/README.md)을 따르며, 같은 화면에 여러 기능이 필요하면 기존 [화면별 주 담당](../../specs/README.md#전체-화면-담당-연결)이 연결한다.

## 공용 UI와 API 호출 경계

### 공용 UI

003에서 달력·도장·입력·날짜/시간 선택·다이얼로그·기간 선택을 준비한다. `components/ui`의 공용 부품은 계정·선택 크루·Query 캐시를 직접 읽지 않고 표시값과 콜백을 받는다. 같은 달력 부품에 일정과 기록의 표시 모델을 각각 전달하며, 서버 자료를 표시 모델로 바꾸는 책임은 사용하는 화면·훅에 둔다.

디자인 토큰·아이콘·문구는 [화면 설계](../screen-design.md)와 [현재 시안](../screens.md)을 따른다. 글자 확대를 앱 전체에서 끄는 패치를 적용하지 않는다. 조회 실패를 빈 결과로 바꾸거나 승인되지 않은 로딩·오류 화면을 추가하지 않는다. 모바일 공용 UI는 우선 앱 내부에 두며 관리자 웹과 실제 공통 요구가 생기기 전에 `packages/ui`로 추출하지 않는다.

### API 소비

```text
app 또는 features의 화면
  → hooks/queries 또는 hooks/mutations
  → api/holdlog의 API 함수 → 공통 HTTP client → 서버
               ↘ @holdlog/contracts의 타입·검사 함수
```

- `api/holdlog`의 공통 client는 전송·요청 취소·기한·공통 오류를 다룬다. Refit의 `api/refit/axios.ts`와 같은 책임이다. Axios/fetch의 최종 선택은 API 구현 단계에서 정하며 이번 폴더 설계로 라이브러리를 바꾸거나 설치하지 않는다. client가 React Provider나 화면을 import하지 않도록 토큰 접근·세션 종료 연결을 분리한다.
- endpoint별 함수는 `api/holdlog`에서 auth·crews·schedules·records 등으로 나눈다. Query 설정은 `api/queryClient.ts`, 조회·변경 훅은 `hooks/queries`·`hooks/mutations`, 키는 `constants/queryKeys.ts`에서 관리한다. 저장 이후 관련 캐시를 갱신하는 책임은 mutation 훅에 둔다. 파일이 커지면 해당 역할 폴더 안에서 도메인별로 나눈다.
- HTTP 타입은 `@holdlog/contracts/http`, 기기·탐색 자료는 `/runtime`에서 type import한다. 값 검사는 `/validators`와 `/operations`의 연결을 사용한다. 원본·생성·공개 진입점의 상세 기준은 [계약 안내](../../packages/contracts/README.md#생성과-사용)를 따른다.
- DTO를 모바일에서 수기로 복제하거나 서버 구현을 import하지 않는다. 화면 전용 표시 모델은 사용 화면·훅에서 DTO를 변환하며, `null`·누락·0과 ID의 의미를 보존한다. API 응답을 검증하지 않은 타입 단언만으로 신뢰하지 않는다.
- 네트워크 실패·timeout·취소·계약 위반·업무 오류를 구분한다. 서버의 임의 `message`를 화면 문구로 사용하지 않고 계약 `code`를 기존 안내에 연결한다. 쓰기 요청의 `If-Match`·`Idempotency-Key`, 충돌·재시도 의미는 [공통 요청 규칙](../../packages/contracts/conventions.md)을 따른다.
- 저장 시 계정·대상 크루·입력·버전을 고정한다. 동일 작업 재시도에는 같은 키를 쓰고 입력이나 버전을 바꾸면 새 작업으로 처리한다. 응답 유실과 확정 실패를 구분하며 모든 mutation을 일괄 재시도하지 않는다.
- 토큰 갱신은 같은 세션의 동시 요청이 하나의 진행 중 갱신을 공유하도록 설계한다. 갱신 요청에도 기한을 두고 일시 통신 장애를 토큰 무효와 구분한다. 로그아웃·계정 변경 후 늦게 완료된 갱신이 이전 토큰을 다시 저장하지 못하도록 세션 세대를 검사한다.
- 파일 바이트 전송·재개는 011의 별도 처리다. 전송 코드는 API/기기 유틸에, 여러 파일 작업 조정은 필요에 따라 `features/media`에 둔다. 일반 JSON 요청 재시도 정책을 tus 업로드에 그대로 적용하지 않는다. 개발 health 검사용 코드를 제품 API 클라이언트로 재사용하지 않는다.

## 의존 방향과 공개 진입점

화면은 필요한 부품·훅·상태를 사용하고, 훅은 API 함수와 store를 연결한다. API 함수와 일반 유틸이 화면이나 Provider를 역으로 참조하지 않게 한다. 모든 파일에 같은 계층을 거치게 하거나 별도의 공개 barrel을 의무화하지 않는다.

| 경계 | 규칙 |
|---|---|
| 앱 밖 | `@holdlog/contracts`의 공개 진입점으로 소비. `apps/admin`, `apps/server`, 계약의 내부 `generated/` 경로를 직접 참조하지 않음 |
| 앱 내부 | 파일의 역할에 맞춰 필요한 함수를 import하고 순환 참조를 피함. `components/ui`와 일반 유틸에 특정 화면·크루 업무를 넣지 않음 |
| 여러 기능 변경 | 계정 종료 정리는 인증 Provider의 세션 종료 경계에서, 크루 전환은 전환 훅에서, 저장 후 조회 갱신은 mutation 훅에서 조정. 별도 `application/flows` 계층을 만들지 않음 |
| 공통 패키지 | 통신·runtime 계약은 contracts, 모바일 표시·네이티브 코드는 mobile. 공용이라는 이유로 앱 내부 타입·UI·업무 상태를 contracts에 넣지 않음 |
| 테스트·개발 | fixtures는 합성 검사에 사용. 제품 번들에서 개발용 자료에 의존하지 않으며 서버용 `/backend` 타입·코드를 소비하지 않음 |

현재 lint가 위 폴더 의존 방향을 모두 강제하는 것은 아니다. 코드 리뷰에서 확인하고 실제 폴더를 도입할 때 검사 자동화 범위를 함께 정한다.

## 명명 규칙

화면 파일은 Expo Router 규칙을 따른다. React 컴포넌트는 `RecordForm.tsx`처럼 PascalCase, 훅은 `usePersonalRecord.ts`, store는 `workoutStore.ts`, 일반 함수 파일은 `recordInput.ts`처럼 역할을 이름에 드러낸다. 기존 파일을 이름 통일만을 위해 일괄 변경하지 않는다. `index.ts`는 실제 재사용 편의가 있을 때 두며 폴더마다 만들지 않는다.

현재 상대경로 import를 유지한다. 파일 수가 늘어 `@/* → src/*`를 도입할 때는 모바일 tsconfig에만 설정한다. 루트 alias로 앱 경계를 우회하지 않는다. [Expo의 alias 지원](https://docs.expo.dev/guides/typescript/#path-aliases-optional)과 Node 테스트의 모듈 해석은 별개이므로 둘을 함께 확인한다. 현재 Node가 직접 실행하는 순수 모듈은 실행 가능한 상대경로를 사용할 수 있다.

## 상태 관리와 입력 유지

### 상태의 소유자와 수명

도구별 책임을 먼저 나눈다. TanStack Query·Zustand·보안 저장소의 구체적인 버전과 설치는 해당 기능에서 검증하며 아래 표를 설치 완료 목록으로 사용하지 않는다.

| 상태 | 소유·도구 방향 | 유지·정리 경계 |
|---|---|---|
| 서버에서 읽은 자료 | `hooks/queries`·`hooks/mutations`의 TanStack Query | 계정·대상 크루·조회 종류를 키에 반영. 서버 응답을 별도 Zustand store에 복제하지 않음 |
| 인증 세션 | `providers/AuthProvider.tsx` + `lib`의 보안 저장 | 토큰은 기기 보안 저장소, Context는 세션 준비·로그인 상태 전달. 일반 설정 저장소나 Query 캐시에 토큰을 넣지 않음 |
| 한 화면의 펼침·선택·입력 | React 상태·reducer | 화면 안에서 해결. 여러 화면 이동이 필요한 입력만 기능 draft로 승격 |
| 여러 화면이 공유하는 입력·선택 | `store/`에서 목적별 Zustand store | 계정·대상·작성 흐름을 식별. 크루 선택과 조회 중인 크루를 구분하고 영속 저장을 기본 적용하지 않음 |
| 진행 중 운동 | `store/workoutStore.ts` + 기기 생명주기 훅 | 화면 이동·백그라운드에서 유지. 사용자 강제 종료는 취소. 재실행 시 무조건 복원하는 persist store를 사용하지 않음 |
| 파일 업로드 작업 | 011의 작업 조정 + `lib`의 영속 저장·기기 처리 | 기록 저장과 별개로 파일별 재시도·재시작 복구. 계정·대상·파일·서버 확정 진행 상태를 연결하며 단순 메모리 mutation에만 보관하지 않음 |
| 초대·공지 숨김·고지 | 각 기능 + 기기 저장 어댑터 | 보존 범위는 C12 runtime과 해당 기능 명세를 따름. 공지 오늘 숨김을 서버 계정 설정으로 바꾸지 않음 |

운동 강제 종료와 OS 프로세스 정리를 구분하는 방법은 [018](../../specs/018-workout-recording/spec.md)의 기기 검증 사항이다. 시작 방식 A/B도 미정이다. [운동 명세](../workout-recording-spec.md)와 [파일 저장·재개 기준](../technical-spec.md#4-미디어-처리--확정)은 서로 다른 수명을 요구하므로 같은 전역 영속 store로 해결하지 않는다. 오프라인 업무 쓰기 자동 동기화를 새 기본 기능으로 추가하지 않는다.

### 계정과 크루의 경계

조회 키는 응답을 구분하는 모든 입력을 포함한다. 아래는 키 설계 예시이며 아직 구현된 함수가 아니다.

```text
본인 기록: [accountId, 'owner-record', recordId]
회원 기록: [accountId, 'public-record', crewId, memberId, recordId]
크루 달력: [accountId, 'crew-calendar', crewId, month, timeZone, filters]
```

실제 query key factory는 `constants/queryKeys.ts`에서 자료 종류별로 구분하며, 규모가 커지면 같은 폴더 안에서 분리한다. `OwnerRecord`와 `PublicRecord`를 같은 캐시에 넣거나 소유자 응답을 다른 회원 화면에서 재사용하지 않는다. 월·기간·필터·페이지·IANA 시간대 등 해당 operation의 입력을 반영하고, 순서 의미가 없는 필터 값만 정규화한다.

내 기록·개인 통계·보관함·수신 알림 목록은 계정 전체 범위다. 선택 크루를 바꿨다는 이유로 크루별 자료로 축소하지 않는다. 선택 크루와 상세 화면에서 조회하는 크루 ID를 구분한다. 크루 정보·회원 목록 열기만으로 현재 선택을 바꾸지 않는다.

크루 전환은 [S19](../functional-spec.md#s19-크루-목록선택생성가입)를 적용하는 하나의 흐름으로 구현한다. 유지하는 탭·보기·월·날짜·암장 필터와 초기화하는 참석자 필터를 분리한다. 이전 조회는 취소하거나 결과를 이전 키에만 귀속시켜 새 크루 화면에 섞이지 않게 한다. 이미 보낸 저장은 캡처한 원래 크루를 대상으로 완료되며 전역 선택 변경으로 대상을 바꾸지 않는다.

로그아웃·계정 변경·권한 회수 시에는 관련 요청·캐시·화면·기기 작업을 함께 정리한다. 요청 취소만으로 서버 처리가 취소됐다고 가정하지 않는다. 늦은 결과는 계정/세션 세대를 확인해 적용하고, 이전 계정의 draft·파일·업로드 작업이 새 계정에서 표시되거나 자동 전송되지 않게 한다. 권한을 잃은 크루 자료는 즉시 화면에서 회수하되 본인 개인 자료의 보존은 [기록 관계 설계](../record-relationships.md)를 따른다.

### 편집·복귀·여러 자료의 갱신

폼은 최신 조회 원본과 사용자 draft를 별도로 관리한다. 자동 재조회가 draft를 덮어쓰지 않게 하고 실패·충돌에서는 입력을 유지한다. 뒤로 가기·탭 이동·크루 전환에는 같은 변경 확인 동작을 연결한다. `null → undefined` 일괄 변환처럼 PATCH의 제거·유지 의미를 바꾸는 처리를 넣지 않는다. 상세 동작은 [공통 상태와 입력](../functional-spec.md#21-상태와-입력)이 원본이다.

연결·공개·삭제 뒤에는 관련 본인 기록·공동 방문·목록·통계·미디어 조회를 필요한 범위에서 갱신한다. 성공했다고 클라이언트가 별도 개인 기록을 복제하거나 공동 방문 삭제를 개인 기록 삭제로 전파하지 않는다. 기능 계획에는 쓰기 operation별 영향받는 query key와 권한 회수 시점의 검사를 연결한다.

포그라운드 복귀와 네트워크 회복을 Query에 연결하고, 변경한 권한과 자료를 재확인한다. React Native의 focus/online 신호는 [공식 연동 안내](https://tanstack.com/query/latest/docs/framework/react/react-native)에 따라 연결해야 하며 브라우저와 같은 자동 동작을 가정하지 않는다. 재조회·재시도·보관 시간은 기능별로 정하고 앱 전체 임의 상수를 복사하지 않는다.

시간·숫자 변환은 순수 함수로 분리한다. UTC 시점과 IANA 시간대, 방문 연결 날짜의 기준, 완등 미입력과 명시적 0을 보존한다. 화면 표시 문자열이나 색상을 원본 값·난이도 식별자로 저장하지 않는다. 상세 의미는 [계약 규칙](../../packages/contracts/conventions.md)과 기능 명세 D01·D02가 원본이다.

## 탐색과 외부 진입

Expo Router의 `app/_layout.tsx`에서 Provider·Stack·Tabs를 연결한다. C12 `Route`를 실제 경로로 바꾸는 순수 변환은 `lib/navigation.ts`, 로그인·크루 권한을 확인하며 이동하는 동작은 해당 진입 훅에 둔다. 계약의 화면 번호를 폴더 이름으로부터 새로 정의하지 않는다. 다섯 하단 메뉴·로그인 전후 노출·가입 크루 없음 상태는 [확정 탐색](../functional-spec.md#12-하단-메뉴--확정)을 따른다.

초대는 로그인 이후 기존 가입 확인으로 이어가며 자동 가입시키지 않는다. 푸시·알림에서 다른 크루로 진입할 때는 대상 ID와 현재 권한을 다시 확인한다. 외부 payload의 역할·경로·문구를 그대로 신뢰하거나 현재 선택 크루의 권한으로 대신 검사하지 않는다. 세부 진입 우선순위·보존은 004·005·017 계획에서 연결한다.

Router 전환 시 [custom entry 방식](https://docs.expo.dev/router/installation/#setup-entry-point)을 사용해 기존 개발 진단 초기화를 보존한다. Router와 `registerRootComponent(App)`를 동시에 등록하지 않는다. 003에서 기존 진입점의 역할 정리·개발 진단·초기 경로를 함께 검증한다.

## 네이티브 설정

설치·실행·버전·네이티브 생성물 정책의 원본은 [개발 안내](../development.md)다. Refit의 package.json·lockfile·ESLint·앱 식별자·서명·외부 서비스 설정·버전별 patch를 복사하지 않는다.

- 런타임 의존성은 mobile workspace에 명시하고 설치는 저장소 루트의 단일 lockfile에 반영한다. 공통 검사 도구는 기존 루트 구성을 사용한다. workspace에서 우연히 해석된다는 이유로 직접 의존 선언을 생략하지 않는다.
- 기본 `expo/metro-config`를 유지한다. [Expo 모노레포 지원](https://docs.expo.dev/guides/monorepos/)을 사용하며 근거 없이 `watchFolders`·resolver 경로를 덮어쓰지 않는다. 네이티브 의존 추가 시 현재 SDK와 React/React Native 버전·중복 설치·autolinking을 확인한다.
- `app.config.ts`·config plugin과 추적하는 커스텀 네이티브 소스가 원본이다. 생성된 `ios/`·`android/`를 직접 수정해 기능 원본으로 삼지 않는다. 네이티브 변경은 새 전용 개발 빌드에서 확인한다.
- 현재 공개 개발 API origin 설정은 로컬 진단용이다. 제품 API 환경을 만들 때 별도로 명확히 정의하며 누락된 값을 임의 운영 주소로 대체하지 않는다. 번들에 들어가는 공개 설정과 서버 비밀을 구분한다.
- FCM·미디어·잠금 화면 운동 표시 등은 해당 기능의 SDK 호환성과 iOS/Android 실제 동작을 검증하며 추가한다. Refit의 결제·채팅·매칭 라이브러리를 기본 구성에 포함하지 않는다.

## 검증 방법

검사 명령과 수행 범위는 [실행과 완료 확인](../development.md#실행과-완료-확인)을 따른다. 문서 변경은 `python3 scripts/check-docs.py`, 모바일 코드 변경은 해당 workspace의 lint·typecheck·test를 수행한다. 루트 설정·의존성·계약 변경은 영향받는 공통 검사도 수행한다.

| 검사 수준 | 확인할 내용 |
|---|---|
| 정적 검사·단위 검사 | 계약 타입 소비, query key의 계정/크루 분리, 입력 변환의 null/0·시간대 의미, 상태 전이·충돌 후 입력 유지 |
| 합성 계약 기반 화면 검사 | 003의 탐색·공용 부품·크루 전환, 본인/회원 projection 분리, 늦은 응답·로그아웃·권한 회수. 실패·빈 결과를 구분 |
| 번들·네이티브 빌드 | 계약 공개 export·Metro·alias·모듈 해석, custom entry, autolinking. 번들 export만으로 네이티브 실행 통과로 표시하지 않음 |
| 실제 API 연동 | 멱등성·버전 충돌·권한 회수·연결/삭제 영향·파일 부분 실패를 각 기능 FR·SC와 대조 |
| 기기 확인 | iOS/Android 초대·푸시 진입, 글자 확대, 운동 백그라운드/종료, 업로드 재시작. 가상 기기 결과와 실기기 결과를 구분 |

현재 Node 테스트를 유지하고 UI 테스트 도구는 003 상세 설계에서 추가한다. 라이브러리 설치나 문서 작성만으로 위 검사를 완료 처리하지 않는다.

## 구현으로 옮기는 순서

1. 003 계획에서 확정 화면과 C12 Route의 매핑, 공용 부품 입력, 세션·크루 전환 연결 경계를 정한다. Expo Router·TanStack Query 등의 버전·현재 SDK 호환성과 검사 방법을 확인한다.
2. 공용 진입점·providers·공용 UI를 필요한 범위부터 구현하고 기존 개발 진단과 검사를 유지한다. 004·005의 인증·크루 기능은 합의된 경계로 조립한다.
3. 기능별로 API 함수·query key·draft·표시 모델을 구현한다. 009/010의 기록 관계, 011 업로드와 018 운동 수명은 각 담당 스펙에서 검증한다.

기능의 상세 계획·작업 분리·이슈 연결·구현은 [Spec Kit 개발 흐름](../development-workflow.md)을 따른다. 이 문서 작성으로 003이나 후속 기능의 완료 상태를 바꾸지 않는다.

## 기준 문서

- [공통 아키텍처](../architecture.md)
- [공통 계약](../../packages/contracts/README.md)
- [실행·검사·네이티브 생성물 관리](../development.md)
- [개발 역할과 공통 파일 변경 기준](../../specs/development-roles.md)
- [서비스별 문서 목차](README.md)

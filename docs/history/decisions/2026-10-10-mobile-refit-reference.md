# 2026-10-10 Refit 참고 모바일 설계 결정

## 검토 범위와 기준

- 검토일: 2026-10-10
- 참고 저장소: `refit-core/refit-mobile`
- Refit 분석 기준 커밋: `65037e39ea42b78d61f5db7be137bfa2d03c55ef`
- Holdlog 기준 커밋: `e2792141990a7343cc6f1b4f3872ce22648e002e`
- 검토 방법: 로컬에 있는 Refit 문서·초기 설정·주요 소스의 정적 비교. 실행·빌드·호환성 검증은 수행하지 않았다.
- Refit 파일과 Git 상태는 변경하지 않았으며 `.env`·인증자료·비밀값은 검토 대상에서 제외했다.

Refit의 운영 경험과 책임 분리 원칙을 참고하되, 파일과 설정을 일괄 복사하지 않는다.
Holdlog은 모바일·관리자 웹·서버·공통 계약을 한 저장소에서 관리하므로 계약 원본과 의존 경계가 다르다.
이 문서는 당시 비교와 선택 이유를 보관한다. 현재 개발 규칙의 원본은 [모바일 아키텍처](../../architecture/mobile.md)다.

## 채택 및 조정 결정

| 검토 항목 | 결정 | 근거와 Holdlog 반영 방향 |
|---|---|---|
| 짧은 작업 안내와 상세 원본 연결 | 채택 | Refit [AGENTS][r-agents]처럼 작업 종류에 따라 원본을 안내한다. Holdlog 모바일 AGENTS는 루트 작업 규칙·모바일 설계·기능 명세를 연결한다. |
| 상태의 책임 분리 | 변경해서 채택 | Refit [상태 기준][r-state]의 서버 캐시·공유 입력·세션·화면 로컬 상태 구분을 사용한다. 도구 선정과 영속 여부는 상태 수명 및 해당 기능 설계에서 결정한다. |
| 역할별 코드 배치 | 채택 | Refit [배치 문서][r-folders]와 실제 코드를 따라 `app/`·`api/`·`components/`·`hooks/`·`providers/`·`store/`·`lib/`·`constants/`·`types/`를 기본으로 삼는다. |
| 화면 구현과 복잡한 기능 분리 | 채택 | Refit [프로필 편집 라우트][r-profile-edit]처럼 라우트에서 화면을 직접 구현할 수 있다. 복잡한 기능만 `features/`로, 화면 전용 UI는 `components/`의 화면별 폴더로 분리한다. |
| API 함수와 서버 상태 훅 분리 | 채택 | Refit [API 함수][r-api-function]와 [조회 훅][r-query]처럼 호출은 `api/`, 서버 조회·변경 훅은 `hooks/queries/`·`hooks/mutations/`에 둔다. |
| 순수 유틸 배치 | 변경해서 채택 | Refit은 `lib/`와 `utils/`를 함께 사용한다. Holdlog의 순수 유틸은 `lib/`에 두는 단일 기준을 사용한다. |
| API 요청·응답 타입 | 변경해서 채택 | Refit은 앱의 [응답 타입][r-api-types]을 관리한다. Holdlog은 `packages/contracts`의 공개 진입점에서 계약을 소비하고 앱 내부 표시 모델만 모바일에 둔다. |
| Query 키와 변경 후 무효화 | 변경해서 채택 | Refit [키 계층][r-query-keys]을 참고한다. 개인 기록·공동 방문·크루 권한이 영향을 주는 캐시 범위를 기능 단위로 설계한다. |
| 계정 전환 정리 | 채택 | Refit [로그아웃 정리][r-auth]의 캐시·입력 상태 초기화를 참고한다. Holdlog은 업로드 복구 정보와 파일까지 계정 소유 범위를 함께 다룬다. |
| 동시 인증 갱신 | 변경해서 채택 | Refit [진행 중 요청 공유][r-refresh] 패턴을 참고한다. 인증 계약·재시도·세션 전환 경합은 Holdlog 기능 설계에서 검증한다. |
| 앱 생명주기와 서버 캐시 연결 | 변경해서 채택 | Refit [포그라운드 복귀 처리][r-query-client]를 참고하되 재조회·재시도·유효시간을 일괄 복사하지 않는다. |
| 공용 UI·토큰·아이콘 재사용 | 채택 | Refit [UI 규칙][r-ui]의 기존 자산 확인 원칙을 사용한다. 실제 값과 자산은 Holdlog의 최신 화면·디자인 시스템을 따른다. |
| 네이티브 설정 원본 | 채택 | Refit [CNG 원칙][r-native-rule]을 참고한다. Holdlog에 이미 정해진 `app.config.ts`·plugin·생성물 제외 규칙을 유지한다. |
| 설치·실행·버전 설정 | 변경해서 채택 | 단독 앱 명령을 복사하지 않고 Holdlog 루트 workspace 명령과 단일 lockfile을 사용한다. 현재 기반 버전을 유지한다. |

상태 관리 라이브러리를 도입했다는 의미로 위 결정을 해석하지 않는다.
현재 코드에 없는 Query·Zustand·라우터 등은 적용 시점의 설계와 검증을 거쳐 설치한다.
Refit의 구조를 참고해도 서버 계약·권한 판정·도메인 정책의 원본이 모바일로 이동하지 않는다.
현재 결정은 역할별 배치다. 별도 `application/`·`shared/` 계층이나 모든 기능의 `api/`·`model/`·`ui/` 분할은 필수가 아니다.
초기 검토에서 추가한 기능 중심 조직화는 Refit의 실제 기본 구조와 달랐으며, 모노레포에 필요한 변경으로 볼 근거가 없어 채택하지 않았다.

### 현재 Holdlog에 역할별 배치가 적합한 이유

현재 모바일은 실행·개발 진단 기반까지 있으며 제품 화면과 기능 간 재사용 경계는 아직 구현으로 확인하지 않았다. 이 단계에서는 Refit의 기존 개발 경험을 활용하고 코드의 역할로 위치를 찾는 방식이 별도 계층·공개 진입점을 먼저 설계하는 것보다 변경 비용이 작다고 판단한다. 모노레포는 앱·공통 계약의 경계를 정할 이유이지 모바일 내부에 계층을 더 둘 이유는 아니다.

역할별 배치에서는 기능 하나를 수정할 때 화면·API·훅·store 등 여러 위치를 살펴야 한다. 기능별 응집 구조는 이 변경을 한곳에 모으기 좋지만, 기능 간 재사용·상태 조정의 경계와 공개 인터페이스를 먼저 관리해야 한다. 현재 선택은 역할별 배치로 시작하고 복잡한 기능만 `features/`로 분리하는 것이다.

같은 기능을 수정할 때 함께 바뀌는 전용 로직이 여러 화면·훅에 반복되거나 순환 참조가 생기면 해당 범위의 응집을 재검토한다. 단순히 파일 수가 늘었다는 이유로 앱 전체 구조를 전환하지 않는다. 이 판단은 Refit의 모든 구현 방식이나 라이브러리 선택이 Holdlog보다 우수하다는 평가가 아니다.

## Refit 문서와 실제 코드의 차이

| 확인 항목 | 문서 | 실제 코드·설정 | 참고 시 주의점 |
|---|---|---|---|
| 역할별 배치와 문서 트리 | [폴더 구조][r-folders]는 `app/`·`api/`·`hooks/` 등 역할별 폴더와 복잡한 화면용 `features/`를 설명한다. | 실제 [화면][r-profile-edit]은 라우트에서 구현하고 `features/`는 일부 복잡한 로직에 사용한다. 실제 [store][r-onboarding]와 [utils][r-utils]는 문서 트리에 빠져 있다. | 누락된 실제 폴더를 함께 확인한다. 이 차이는 구조의 우열이나 다른 계층 도입의 근거가 아니다. |
| 스토어 위치와 수명 | [상태 상세][r-state-example]는 `features/onboarding/store.ts` 예정 예시와 persist 가능성을 설명한다. | 실제 [onboardingStore][r-onboarding]는 `src/store/`에 있으며 종료 시 영속 저장하지 않고 서버에서 복원한다. | 예시·가능한 선택·현재 구현을 구분한다. |
| 기술 스택 | [기술 스택 표][r-tech-stack]는 카카오·Firebase·Sentry 등을 미설치 예정으로 적고 채팅·IAP 후보를 제시한다. | [package.json][r-package]에는 해당 모듈이 있으며 채팅은 STOMP, IAP는 RevenueCat 의존성이 있다. | 예정 라이브러리 표를 현재 설치 목록으로 복사하지 않는다. |
| 네이티브 생성물 | [빌드 문서][r-native-doc]는 `ios/`·`android/`를 Git 추적한다고 설명한다. | [README][r-native-readme]와 [.gitignore][r-gitignore]는 제외한다. 로컬 `git ls-files ios android` 결과도 0개였다. | Holdlog의 기존 생성물 관리 규칙을 기준으로 삼는다. |

Refit은 역할별 배치를 기본으로 사용하며 화면을 라우트에서 직접 구현하는 구성이 실제 코드에 나타난다.
문서의 누락이나 파일 길이를 기능 중심 구조를 강제하는 근거로 사용하지 않는다.
위 비교는 현재 구현과 예정 예시를 구분하고 Holdlog에 필요한 차이만 반영하기 위한 확인 결과다.

## Holdlog 제품 특성에 따른 조정

### 운동과 업로드는 수명이 다르다

| 상태 | Holdlog 기준 | 설계 영향 |
|---|---|---|
| 진행 중 운동 | 화면 이동·백그라운드 전환은 유지한다. 종료하지 않고 앱을 강제로 끝내면 운동을 취소하고 기록을 저장하지 않는다. | 화면 컴포넌트보다 긴 상태 수명이 필요하다. 사용자 강제 종료 후 자동 복원하지 않으며, OS 프로세스 정리 시 유지·복구는 018에서 기기 검증한다. |
| 기록 저장 후 미디어 업로드 | 기록을 먼저 저장하고 파일을 별도로 올린다. 큰 파일 이어 올리기와 재시작 후 복구를 지원한다. | 복구 가능한 작업 정보·파일 참조·서버 업로드 상태를 분리해 설계한다. 화면 상태나 메모리 캐시만으로 복구를 구현했다고 보지 않는다. |
| 작성 중 입력 | 화면별 입력 유지와 취소·종료 규칙을 따른다. | 모든 폼이나 공유 입력에 영속 저장을 일괄 적용하지 않는다. |
| 계정 관련 데이터 | 계정 소유·공개 범위·삭제 규칙을 따른다. | 로그아웃·계정 변경 때 캐시·임시 입력·파일·업로드 작업의 접근 범위를 함께 정리한다. |

근거는 [운동 기록 명세](../../workout-recording-spec.md), [기술·운영 명세](../../technical-spec.md), [기록 관계 설계](../../record-relationships.md)다.
Refit의 [메모리 온보딩 입력][r-onboarding]과 [채팅 outbox][r-outbox]는 상태 구분의 참고 사례이며 업로드 복구 구현으로 재사용하지 않는다.

### 모노레포 경계를 따른다

- 모바일은 공통 계약 패키지의 공개 진입점을 사용한다. 관리자 웹·서버 내부 소스를 직접 참조하지 않는다.
- 요청·응답·공유 런타임 데이터 형식은 [공통 계약 안내](../../../packages/contracts/README.md)의 원본과 생성 절차를 따른다.
- 공용 UI는 모바일 내부에서 시작한다. React Native UI와 관리자 웹 UI를 공통 패키지로 묶는 결정은 이번 범위가 아니다.
- 설치·실행·검사는 [개발 시작 안내](../../development.md)의 루트 workspace 절차를 사용한다.
- 공통 파일의 변경은 [개발 역할과 배정 기준](../../../specs/development-roles.md)을 따른다.

모노레포에 맞춰 바꾸는 부분은 계약 소비·앱 간 의존 경계·루트 도구 사용이다. 모바일 내부 폴더를 별도 계층 구조로 바꿔야 한다는 뜻은 아니다.

## 제외한 내용

| 항목 | 제외 이유 |
|---|---|
| Refit 제품 흐름과 식별자 | 매칭·핏·결제·본인인증·22단계 온보딩·채팅 구성·서버 주소·앱 식별자·Figma 자산은 Holdlog 정책과 다르다. |
| 전체 `package.json`·lockfile·초기 설정 복사 | Refit은 Expo 55 / RN 0.83.6 기반이고 검토 시 Holdlog은 Expo 57 / RN 0.86.3 기반이다. 같은 설정의 호환성을 확인하지 않았다. |
| 정적 테마와 글꼴 확대 우회 | Refit [테마 문서][r-theme]는 실행 시 색상을 한 번 결정하고 [JSX 런타임 패치][r-text-scaling]로 글꼴 확대 기본값을 바꾼다. 해당 제품의 타협을 Holdlog 기본 규칙으로 채택하지 않는다. |
| Refit API 타입과 서버 우선순위 복사 | 별도 백엔드 저장소를 참고하는 규칙은 공통 계약 원본을 함께 관리하는 Holdlog 구조와 다르다. |
| 개인 응답 언어·도구별 승인 절차 | Holdlog [프로젝트 작업 규칙](../../work-rules.md)에 따라 개인 취향은 로컬 설정에서 관리하고 프로젝트 규칙에는 복사하지 않는다. |

## 이번 작업과 후속 범위

이번 작업은 모바일 `AGENTS.md`와 아키텍처 설계를 작성해 파일 배치·의존 방향·상태 수명·검증 책임을 구체화한다.
초기 런타임 설정과 이미 마련된 기반 코드는 유지한다. Refit의 실제 소스와 설정을 복제하는 작업은 포함하지 않는다.

후속 작업은 [003 앱 탐색과 공통 화면 부품](../../../specs/003-app-shell/spec.md)에 연결한다.
003의 상세 `plan.md`·`tasks.md`와 라우터·공용 UI를 준비하고, 인증·운동·업로드 기능과 관련 라이브러리는 각 담당 스펙에서 구현·검증한다.
이 분석은 라이브러리 호환성·기기 실행·제품 기능 완료의 근거가 아니다.

추가로 현재 모바일의 개발 진단이 계약 검사 함수를 실제 import하지만 mobile manifest에 `@holdlog/contracts` 직접 의존 선언이 없음을 확인했다. 루트 workspace 연결로 해석되는 구성과 명시적인 의존 선언은 구분해야 한다. 다음 초기 설정 보완에서 계약 패키지의 package version을 사용해 선언하고 루트 lockfile을 동기화한다. 조사 환경에는 지정 Node 24.21.0 / npm 11.19.0과 `node_modules`가 없었으며 PATH의 Node 24.7.0 / npm 11.5.1로 lockfile을 재작성하거나 실행 검증을 대신하지 않았다.

현재 기준은 [모바일 아키텍처](../../architecture/mobile.md), [공통 아키텍처](../../architecture.md), [프로젝트 원칙](../../../.specify/memory/constitution.md)을 따른다.

## Refit 근거

아래 링크는 모두 분석 기준 커밋에 고정했다. 참고 저장소에 대한 접근 권한이 필요하다.

[r-agents]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/AGENTS.md#L3-L7
[r-state]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/CLAUDE.md#L30-L62
[r-folders]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/docs/folder-structure.md#L3-L31
[r-api-function]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/api/refit/profile.ts#L5-L13
[r-query]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/hooks/queries/useProfile.ts#L14-L22
[r-api-types]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/api/refit/types/profile.ts#L1-L16
[r-query-keys]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/constants/queryKeys.ts#L8-L23
[r-auth]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/providers/AuthProvider.tsx#L49-L73
[r-refresh]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/api/refit/axios.ts#L54-L83
[r-query-client]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/api/queryClient.ts#L4-L22
[r-ui]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/CLAUDE.md#L95-L114
[r-native-rule]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/CLAUDE.md#L82-L91
[r-profile-edit]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/app/%28main%29/profile-edit.tsx#L71-L128
[r-state-example]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/docs/state-management.md#L48-L63
[r-onboarding]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/store/onboardingStore.ts#L1-L3
[r-utils]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/utils/tags.ts#L1-L13
[r-tech-stack]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/docs/tech-stack.md#L24-L35
[r-package]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/package.json#L14-L70
[r-native-doc]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/docs/native-build.md#L3-L5
[r-native-readme]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/README.md#L127-L139
[r-gitignore]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/.gitignore#L42-L44
[r-outbox]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/store/chatOutboxStore.ts#L1-L5
[r-theme]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/.claude/rules/theming.md#L25-L30
[r-text-scaling]: https://github.com/refit-core/refit-mobile/blob/65037e39ea42b78d61f5db7be137bfa2d03c55ef/src/lib/textScaling.ts#L27-L55

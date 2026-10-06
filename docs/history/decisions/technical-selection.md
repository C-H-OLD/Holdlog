# 기술 선택과 지도 정책 조사 기록

2026-09-29 조사 내용을 현재 명세에서 분리했다. 이 작업에서 외부 정책을 새로 확인한 것은 아니다. 현재 구현 조건은 [기술 명세](../../technical-spec.md)를 따른다.

**NestJS + TypeScript API 서버, PostgreSQL DB**를 사용한다. RN과 서버가 같은 언어를 사용하며, 개인 기록·크루 방문·참석·파일 소유권을 나누고 연결하는 현재 요구사항에 관계형 DB가 잘 맞는다는 판단이다. [NestJS 공식 문서](https://docs.nestjs.com/first-steps)

작업 대기열은 시간이 걸리는 작업의 할 일 목록이다. pg-boss를 사용한다. 기존 PostgreSQL에 작업 상태를 저장하므로 대기열을 위해 별도 Redis 서버를 추가할 필요가 없다. 지연 실행·실패 재시도를 지원한다. [pg-boss 공식 문서](https://github.com/timgit/pg-boss)

RN 공식 문서는 새 앱에 Expo 같은 프레임워크 사용을 권장한다. Holdlog는 React Native + Expo + 전용 개발 빌드를 사용한다. 이는 Expo Go만으로 개발한다는 뜻이 아니며, Firebase 등 필요한 네이티브 모듈을 포함한다. 자체 서버·로컬 파일 저장을 그대로 사용할 수 있다. Expo의 클라우드 빌드 서비스는 필수가 아니고 로컬 빌드도 가능하다. iOS 로컬 빌드는 macOS와 Xcode가 필요하다. [RN 공식 시작 안내](https://reactnative.dev/docs/environment-setup), [Expo의 Firebase 연동](https://docs.expo.dev/guides/using-firebase/), [로컬 빌드](https://docs.expo.dev/guides/local-app-development/)

### 확인 근거

- [Google 공식 요금표](https://developers.google.com/maps/billing-and-pricing/pricing): Maps SDK 항목의 Free Usage Cap은 Unlimited다.
- [Google 공식 적용 조건](https://developers.google.com/maps/billing-and-pricing/sku-details): Map ID 없이 생성한 모바일 지도는 Maps SDK 항목에 해당한다. 지도 이동·확대·축소는 추가 지도 로드를 발생시키지 않는다.
- [Google Android 설정 조건](https://developers.google.com/maps/documentation/android-sdk/usage-and-billing): 결제 계정 활성화와 API 키가 필요하다.
- [Apple 공식 기술지원 답변](https://developer.apple.com/forums/thread/127493): Apple 직원의 네이티브 MapKit 답변에서 지도 사용에 대한 추가 비용이 없음을 명시한다. 해당 답변은 2020년 게시됐으며 이번 확인일에도 공식 안내로 제공된다.
- [react-native-maps 공식 설치 문서](https://github.com/react-native-maps/react-native-maps/blob/master/docs/installation.md): Android는 Google Maps, iOS는 기본 Apple Maps로 구성할 수 있다.



세팅 출처·마지막 확인일을 남기는 방식은 운영 제안이며 첫 버전의 확정 입력 항목이 아니다.

# 서비스별 아키텍처 문서 안내

[공통 아키텍처 안내](../architecture.md)는 전체 구성과 영역 간 책임·의존 방향을 관리한다. 각 서비스의 내부 구조와 개발 규칙은 아래 상세 문서에서 관리한다. [이슈 #41](https://github.com/C-H-OLD/Holdlog/issues/41)에 연결한 모바일·관리자 웹·서버의 공통 기준과 작업 안내를 작성했다. 문서 작성과 기능 구현·병합·이슈 완료는 구분한다.

## 문서와 지침 위치

```text
Holdlog/
├── AGENTS.md                         # 기존 공통 작업 안내
├── docs/
│   ├── architecture.md               # 전체 구성·공통 책임·의존 방향
│   ├── development.md                # 실행·검사·네이티브 생성물 관리
│   └── architecture/
│       ├── README.md                 # 서비스별 문서 목차
│       ├── mobile.md                 # 모바일 내부 구조·상태·개발 기준
│       ├── admin.md                  # 관리자 웹 코드 배치·폼·인증 기준
│       └── server.md                 # 서버 모듈·DB·worker 경계 기준
├── apps/
│   ├── mobile/AGENTS.md              # 모바일 작업별 필수 문서 목차
│   ├── admin/AGENTS.md               # 관리자 웹 작업별 필수 문서 목차
│   └── server/AGENTS.md              # 서버 작업별 필수 문서 목차
├── packages/
│   └── contracts/
│       ├── README.md                 # 기존 계약 안내
│       └── AGENTS.md                 # 빈 파일: 별도 지침 필요성 검토 후 작성
└── specs/
    └── development-roles.md           # 역할·공통 파일 변경·협업 기준
```

| 영역 | 상세 문서 | 지침 파일 | 준비 상태 |
|---|---|---|---|
| 모바일 | [모바일 아키텍처](mobile.md) | [apps/mobile/AGENTS.md](../../apps/mobile/AGENTS.md) | 공통 설계·지침 작성. 기능별 상세 계획·제품 구현·검증은 후속 |
| 관리자 웹 | [관리자 웹 아키텍처](admin.md) | [apps/admin/AGENTS.md](../../apps/admin/AGENTS.md) | 공통 기준·지침 작성. 004/006/019 상세 계획·제품 구현·검증은 후속 |
| 서버 | [서버 아키텍처](server.md) | [apps/server/AGENTS.md](../../apps/server/AGENTS.md) | 공통 기준·지침 작성. 기능별 DB/API/worker 상세 계획·구현·검증은 후속 |
| 공통 계약 | [기존 계약 안내](../../packages/contracts/README.md) | [packages/contracts/AGENTS.md](../../packages/contracts/AGENTS.md) | 기존 안내 유지·빈 지침 파일 |

## 기존 규칙 원본

- 계약 원본·생성·소비는 [계약 패키지 안내](../../packages/contracts/README.md)를 따른다.
- 공통 파일 변경·협업은 [개발 역할과 배정 기준](../../specs/development-roles.md)을 따른다.
- 실행·검사·네이티브 생성물 관리는 [개발 시작 안내](../development.md)를 따른다.
- 문서 위치와 원본 관리는 [문서 관리 규칙](../work-rules.md#문서-관리)을 따른다.

기능별 상세 계획·작업 목록은 각 스펙에서 준비한다. 모바일은 [003](../../specs/003-app-shell/spec.md), 관리자 인증은 [004](../../specs/004-identity-profile/spec.md), 운영 자료는 [006](../../specs/006-gym-catalog-admin/spec.md), 공지는 [019](../../specs/019-announcements/spec.md)에 연결한다. 공통 계약의 별도 지침 필요성은 기존 패키지 안내와 겹치는지 검토한 뒤 판단한다. 문서 작성이 기능 구현·기기 검증이나 이슈 전체 완료를 의미하지 않는다.

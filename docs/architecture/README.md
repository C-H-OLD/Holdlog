# 서비스별 아키텍처 문서 안내

[공통 아키텍처 안내](../architecture.md)는 전체 구성과 영역 간 책임·의존 방향을 관리한다. 각 서비스의 내부 구조와 개발 규칙은 아래 상세 문서에서 관리한다. [이슈 #41](https://github.com/C-H-OLD/Holdlog/issues/41)에 따라 문서와 지침 파일을 배치했으며, 서비스별 상세 문서는 뼈대만 준비하고 새 `AGENTS.md` 파일의 본문은 비워두었다.

## 문서와 지침 위치

```text
Holdlog/
├── AGENTS.md                         # 기존 공통 작업 안내
├── docs/
│   ├── architecture.md               # 전체 구성·공통 책임·의존 방향
│   ├── development.md                # 실행·검사·네이티브 생성물 관리
│   └── architecture/
│       ├── README.md                 # 서비스별 문서 목차
│       ├── mobile.md                 # 모바일 상세 문서 뼈대
│       ├── admin.md                  # 관리자 웹 상세 문서 뼈대
│       └── server.md                 # 서버 상세 문서 뼈대
├── apps/
│   ├── mobile/AGENTS.md              # 빈 파일: 지침은 후속 작성
│   ├── admin/AGENTS.md               # 빈 파일: 지침은 후속 작성
│   └── server/AGENTS.md              # 빈 파일: 지침은 후속 작성
├── packages/
│   └── contracts/
│       ├── README.md                 # 기존 계약 안내
│       └── AGENTS.md                 # 빈 파일: 별도 지침 필요성 검토 후 작성
└── specs/
    └── development-roles.md           # 역할·공통 파일 변경·협업 기준
```

| 영역 | 상세 문서 | 지침 파일 | 준비 상태 |
|---|---|---|---|
| 모바일 | [모바일 아키텍처](mobile.md) | [apps/mobile/AGENTS.md](../../apps/mobile/AGENTS.md) | 문서 뼈대·빈 지침 파일 |
| 관리자 웹 | [관리자 웹 아키텍처](admin.md) | [apps/admin/AGENTS.md](../../apps/admin/AGENTS.md) | 문서 뼈대·빈 지침 파일 |
| 서버 | [서버 아키텍처](server.md) | [apps/server/AGENTS.md](../../apps/server/AGENTS.md) | 문서 뼈대·빈 지침 파일 |
| 공통 계약 | [기존 계약 안내](../../packages/contracts/README.md) | [packages/contracts/AGENTS.md](../../packages/contracts/AGENTS.md) | 기존 안내 유지·빈 지침 파일 |

## 기존 규칙 원본

- 계약 원본·생성·소비는 [계약 패키지 안내](../../packages/contracts/README.md)를 따른다.
- 공통 파일 변경·협업은 [개발 역할과 배정 기준](../../specs/development-roles.md)을 따른다.
- 실행·검사·네이티브 생성물 관리는 [개발 시작 안내](../development.md)를 따른다.
- 문서 위치와 원본 관리는 [문서 관리 규칙](../work-rules.md#문서-관리)을 따른다.

상세 설계와 지침은 각 영역에서 후속 작성한다. 모바일 설계는 [003 앱 탐색과 공통 화면 부품](../../specs/003-app-shell/spec.md)과 연결한다. 문서·지침 파일의 배치가 서비스 내부 설계, 지침 작성 또는 이슈 전체 완료를 의미하지 않는다.

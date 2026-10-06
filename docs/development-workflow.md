# Spec Kit 개발 흐름

## 현재 설정

GitHub Spec Kit 1.1.0과 Codex 스킬을 설치했다. 기능 명세를 계속 갱신하는 Living Spec 방식을 사용한다. 프로젝트 원칙은 [constitution](../.specify/memory/constitution.md), 작업 범위와 상태는 [스펙 목록](../specs/README.md)에서 찾는다. 앱·서버·관리자 웹은 아직 구현하지 않았다.

사용자는 “개인 기록 작성·저장·조회 개발 진행”처럼 결과를 요청하면 된다. 에이전트가 아래 단계의 관련 스킬을 읽고 적용한다. 사용자가 스킬 이름을 매번 입력할 필요는 없다. “스펙만 작성”, “검사만 진행”처럼 범위를 제한한 요청은 그 범위까지만 수행한다.

## 기능 개발

| 단계 | 설치된 스킬 | 수행할 일 |
|---|---|---|
| 명세 | `$speckit-specify` | 새로운 범위의 동작·제약·상황별 기대 결과 작성 |
| 명확화 | `$speckit-clarify` | 기존 자료로 해결되지 않는 요구사항 정리 |
| 설계 | `$speckit-plan` | 기술 명세에 따라 구조·데이터·API 계약·검증 방법 작성 |
| 품질 확인 | `$speckit-checklist` | 기능의 크기와 위험에 맞춰 명세 품질 확인 |
| 작업 분리 | `$speckit-tasks` | 요구사항과 연결한 작업·의존성·검사 작성 |
| 일관성 검사 | `$speckit-analyze` | 스펙·설계·작업의 충돌·누락 수정 |
| 구현 | `$speckit-implement` | 정해진 작업 구현과 관련 검사 실행 |
| 누락 확인 | `$speckit-converge` | 실제 구현과 명세 대조. 누락이 있으면 보완 작업 후 재확인 |

이미 수행한 단계는 결과를 확인해 이어간다. 원칙은 `$speckit-constitution`으로 갱신하며 매 기능마다 다시 만들지 않는다. 작은 오류 수정은 기존 스펙의 기대 결과를 확인하고 재현·수정·관련 검증을 수행하며 새 기능 스펙을 불필요하게 만들지 않는다.

동작 변경은 기존 `spec.md`를 먼저 수정하고 관련 계획·작업·코드·검사를 갱신한다. 구현 방법만 바뀌면 계획과 작업을 고친다. 완료된 기능의 후속 변경에는 같은 스펙을 사용하고 중요 결정 이유만 [기록 폴더](history/README.md)에 보관한다. 파생 문서를 새로 만들기 전에 유지할 결정과 아직 하지 않은 작업을 확인한다.

## 기존 문서와 연결

- 공통 기능·권한·시간대·기록 관계·기술·UI 규칙은 기존 기준 문서를 참조한다.
- 기능 스펙으로 원본을 옮긴 범위는 기존 문서를 요약·링크로 대체한다. 같은 상세 규칙을 두곳에서 고치지 않는다.
- 기존 S·D·B·T 번호와 화면 연결을 보존한다. 기능별 FR·SC 번호는 해당 스펙 안에서 사용하고 기존 번호와 연결한다.
- 요구사항별로 구현 작업·검증 방법·결과를 연결한다. 현재 대상 범위와 실제 구현 완료 범위는 구분한다.
- 계약을 정한 뒤 독립 구현을 나누고 합친 뒤 실제 연동을 검사한다. 독립 에이전트 검사와 실행 테스트의 결과도 구분한다.

## 현재 기능 선택

기능 선택은 Git 브랜치와 별개다. `.specify/feature.json`의 `feature_directory`를 해당 `specs/` 폴더로 맞추고 전제 검사 결과의 경로를 확인한다. 병렬 작업은 각 작업의 `SPECIFY_FEATURE_DIRECTORY`를 명시해 다른 기능의 선택 상태를 덮어쓰지 않는다.

현재 선택된 첫 범위는 [개발 기반 구성](../specs/001-development-foundation/spec.md)이다. 현재는 명세와 품질 확인까지만 작성했다. 다음 단계는 `$speckit-plan`으로 구현 설계를 정하는 것이다.

## 설치와 확인

도구는 프로젝트의 `.tools/`에 설치하며 이 폴더는 Git에서 제외한다. 설치 파일은 공식 GitHub 릴리스 `v1.1.0`, 소스 커밋 `f1d3a4f8337ebbd3ae22760a9c12e3352b93a175`다. 새 환경에서는 Python 3.11 이상과 uv를 준비한 뒤 루트에서 설치한다.

```sh
UV_TOOL_DIR="$PWD/.tools/uv-tools" UV_TOOL_BIN_DIR="$PWD/.tools/bin" uv tool install specify-cli --from 'git+https://github.com/github/spec-kit.git@v1.1.0'
```

프로젝트 루트의 다음 명령은 설치한 도구와 설정을 확인한다. 외부 폴더에서 실행해도 `scripts/specify`는 이 프로젝트를 대상으로 동작한다.

```sh
./scripts/specify version
./scripts/specify integration status --json
.specify/scripts/bash/check-prerequisites.sh --json --paths-only
python3 scripts/check-docs.py
```

`.agents/skills`의 설치된 스킬을 에이전트가 인식해야 한다. 현재 세션 목록에 없으면 프로젝트를 다시 열고 설치 폴더를 확인한다. 스킬 선택은 명령 등록과 프로젝트 규칙으로 운영하며 자동 실행 서비스는 아니다.

앱 코드가 생기면 [개발 시작 안내](development.md)에 실제 설치·실행·타입 검사·빌드·테스트 명령을 추가한다. 문서 검사는 기능 검사나 Spec Kit의 의미 검사를 대신하지 않는다.

## 설정 변경

버전 업그레이드는 설치 버전과 변경 내용을 확인한 뒤 진행한다. `init --force`로 갱신하기 전에 프로젝트 원칙과 수정한 설정을 보관하고 변경 파일을 확인한다. 설치된 스킬·템플릿을 직접 고치는 대신 프로젝트 원칙과 운영 문서로 규칙을 연결한다.

[Spec Kit 설치](https://github.github.com/spec-kit/installation.html) · [Codex 통합](https://github.github.com/spec-kit/reference/integrations.html) · [Living Spec 유지](https://github.github.com/spec-kit/guides/evolving-specs.html)

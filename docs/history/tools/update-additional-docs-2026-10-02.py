"""과거 시안 문서 갱신 코드. 현재 문서의 실행 도구가 아닙니다."""
raise SystemExit("보관용 도구입니다. 현재 명세를 갱신하지 않습니다.")

"""Update the current screen registry from live Figma evidence."""
import json
import re
import shutil
from pathlib import Path

root = Path(__file__).resolve().parents[2]
payload = json.loads(Path('/tmp/holdlog-additional-final.json').read_text())
report_path = root / 'docs/history/figma/additional-screens-2026-10-02.json'
report = json.loads(report_path.read_text())
if report.get('recordFilterCorrection20261002'):
    raise SystemExit('최신 수정이 반영된 문서입니다. 이전 임시 데이터로 덮어쓰지 않습니다.')
layout = payload['layout']
report['layout'] = layout
report['status'] = '제작·390 시각 검증 완료 / 사용자 검토 대기'
report['pending'] = ['사용자 시각 검토', '01.06 보류']
report['counts'] = {'newIndependentScreens': 9, 'newBasicCompositions': 11,
                    'confirmationCompositions': 7, 'totalIndependentScreens': 39,
                    'producedIndependentScreens': 38, 'totalCompositions': 82,
                    'specifications': 38}
report['notes'] = ['01.06·서비스 관리자 화면은 제작하지 않음',
                   '기존64개 시안 내용은 유지하고 확인 다이얼로그7개 추가',
                   '회원 상세는 기존11색 완등 부품·169 정사각형 미디어 재사용',
                   '파일 보기의 예시 콘텐츠는 기존 첨부 사진 영역을 재사용. 실제 앱에서는 파일 원래 비율 유지',
                   'Google 기존 아이콘 재사용, Apple 편집 가능한 SVG. 생성 로고를 공식 브랜드 원본으로 표시하지 않음',
                   '선택·미선택·다른 방문 연결로 선택 불가는 같은02.10.01에서 확인',
                   '알림 켜기·끄기는 같은05.05.01에서 확인. 추가 권한은 행만 표시',
                   '이력의 공동 항목·연결 해제·관리자 이관 안내는 부품만 옆에 표시',
                   '클릭 연결·앱 구현은 이번 작업에 포함하지 않음']
report['referenceImages'] = [f'../assets/screens/{n}' for n in [
    '43-record-filter.png', '44-member-records-reference.png',
    '45-member-record-detail-reference.png', '46-change-history-reference.png',
    '47-media-library-reference.png', '48-photo-viewer-reference.png',
    '49-video-player-reference.png', '50-notification-settings-reference.png',
    '51-login-reference.png']]
report['specifications'] = payload['specifications']
url = lambda node: 'https://www.figma.com/design/vla4pXPo8FaCWFXfpIbYzx/Holdlog?node-id=' + node.replace(':', '-')
positions = {n['id']: (g, n) for g in layout['groups'] for n in g['screens']}
for n in report['screens']:
    g, live = positions[n['id']]
    n.update(url=url(n['id']), canvasPosition=[live['x'], live['y']],
             specificationCardId=g['specificationId'],
             preview='./assets/additional-screens-2026-10-02/' + n['number'] + '.png')
report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')

state_path = root / 'docs/figma/state.json'
state = json.loads(state_path.read_text())
current = {n['id']: n for n in state['screens']}
for n in report['screens']:
    current[n['id']] = {'id': n['id'], 'number': n['number'], 'name': n['name'],
                        'pageId': '6:3', 'url': url(n['id']),
                        'size': [n['width'], n['height']], 'status': '사용자 검토 대기',
                        'specificationCardId': n['specificationCardId'],
                        'canvasPosition': n['canvasPosition']}
for nid, (g, n) in positions.items():
    current[nid]['canvasPosition'] = [n['x'], n['y']]
    current[nid]['specificationCardId'] = g['specificationId']
state['screens'] = sorted(current.values(), key=lambda n: n['number'])
state['additionalScreens20261002'] = report
state['activeWork'] = {'scope': [n[0] for n in payload['scope']],
                       'phase': report['status'], 'width': 390,
                       'tool': 'figma-console MCP', 'report': './additional-screens-2026-10-02.json'}
state['phase'] = report['status']
state['groupSpecReview20261002']['supersededBy'] = './additional-screens-2026-10-02.json'
for c in state['componentAdditions']:
    if c.get('id') == '493:44481':
        c['use'] = '38개 화면 묶음 옆 텍스트 기능 명세. 문서 폭420, 앱 너비390.'
for c in report['components']:
    if not any(n.get('id') == c['id'] for n in state['componentAdditions']):
        state['componentAdditions'].append({**c, 'sectionId': report['componentSectionId'],
                                           'use': './additional-screens-2026-10-02.json'})
state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n')

spec_content = {}
for c in payload['specifications']:
    spec_content[c['number']] = [[block.split('\n')[0], '\n'.join(
        line.removeprefix('• ') for line in block.split('\n')[1:])]
        for block in c['details'].split('\n\n')]
(root / 'docs/history/figma/group-spec-content-2026-10-02.json').write_text(
    json.dumps(spec_content, ensure_ascii=False, indent=2) + '\n')

p = root / 'docs/screen-numbering.md'
t = p.read_text()
# Remove provisional rows placed under the state table; rebuild both current tables.
t = re.sub(r'^\| (?:02|05|07) \| \d{2}\.\d{2} \|.*\n', '', t, flags=re.M)
a = t.index('## 화면 번호')
b = t.index('## 현재 Figma에 있는 상태')
existing = re.findall(r'^\| (\d{2} [^|]+) \| (\d{2}\.\d{2}) \| ([^\n]+) \|$', t[a:b], re.M)
rows = {num: (section, link) for section, num, link in existing}
for num, name, src, policy in payload['scope']:
    section = '02 기록' if num.startswith('02') else '05 내 정보' if num.startswith('05') else '07 계정'
    rows[num] = (section, f'[{name}](./screen-design.md#screen-{num.replace(".", "-")})')
table = '## 화면 번호\n\n| 섹션 | 화면 번호 | 화면 설계 |\n|---|---|---|\n'
table += '\n'.join(f'| {section} | {num} | {link} |' for num, (section, link) in sorted(rows.items()))
table += '\n\n2026-10-02 추가9개 제작 승인. 독립 화면39개 중38개 제작,01.06 보류.\n\n'
t = t[:a] + table + t[b:]
a = t.index('| 상태 번호 |')
b = t.index('## 연결 규칙')
table = '| 상태 번호 | Figma 이름 | 노드 |\n|---|---|---|\n'
table += '\n'.join(f'| {n["number"]} | {n["name"]} | [Figma]({url(n["id"])}) |'
                   for n in state['screens'])
t = t[:a] + table + '\n\n' + t[b:]
t += '\n2026-10-02 추가 제작 후 현재 전체 시안82개·명세38개다. 기존 기본 화면은 유지하고 확인 다이얼로그를 겹친 시안을 추가했다. [최신 제작·검증](./figma/additional-screens-2026-10-02.json).\n'
p.write_text(t)

p = root / 'docs/screen-worklist.md'
t = p.read_text().replace('## 추가 제작 후보 정리', '## 추가 화면 제작')
start = t.index('현재 번호표의30개 독립 화면 중29개를 제작했다.')
end = t.index('\n\n', start)
t = t[:start] + '2026-10-02 사용자가 추가 화면 제작을 승인했다.02.09~02.13,05.03~05.05,07.01의9개 독립 화면을 제작하고390 PNG를 검수했다. 기본 시안11개와 기존 화면 위 확인 다이얼로그7개를 추가했다.01.06은 계속 보류한다. [제작·검증 결과](./figma/additional-screens-2026-10-02.json). 사용자 검토 대기.' + t[end:]
t = t.replace('## 현재 Figma 제작 범위 · 2026-09-30', '## 이전 Figma 제작 범위 · 2026-09-30')
t = t.replace('W02·W04·W08·W09와 W18~W26의 별도 화면 제작은 현재 범위에서 제외한다.',
              '당시 W02·W04·W08·W09와 W18~W26은 제외했다.2026-10-02 승인으로 W02·W04·W08·W09·W18~W22의 모바일 화면과 확인창을 제작했다. W23~W25는 이번 범위 밖이다.')
t = t.replace('## 4. 첫 버전에 필요하지만 아직 시안 목록에 없는 화면·상태',
              '## 4. 추가 화면의 기능 범위')
t += '\n### 추가 제작 결과 · 2026-10-02\n\n'
t += '| 번호 | 화면 | Figma |\n|---|---|---|\n'
for num, name, _, _ in payload['scope']:
    n = next(n for n in state['screens'] if n['number'].startswith(num + '.'))
    t += f'| {num} | {name} | [기본 시안]({url(n["id"])}) |\n'
t += '\n계정 삭제·탈퇴·일정 취소·개인 기록 삭제·크루 방문 삭제·파일 삭제·되돌리기 확인은 기존 화면 위에 표시했다. 추가 메시지는 다이얼로그 부품만 옆에 두었다. 별도 로딩·조회 실패·저장 중·권한 없음 전체 화면은 만들지 않았다.\n'
p.write_text(t)

p = root / 'docs/screen-design.md'
t = p.read_text().replace('현재 Figma 제작 범위(2026-09-30', '이전 Figma 제작 범위(2026-09-30', 1)
t = t.replace('**현재 Figma와 문서 대조(2026-10-02):**', '**추가 제작 전 Figma와 문서 대조(2026-10-02):**', 1)
t = t.replace('제작 대상은 이 문서의 현재 화면으로 한정하고,', '제작 대상은 이 문서의 승인된39개 화면으로 한정하고,', 1)
for num, name, src, policy in payload['scope']:
    n = next(n for n in state['screens'] if n['number'].startswith(num + '.'))
    title = '## ' + num + ' ' + name + '\n'
    link = f'\n[Figma 기본 시안]({url(n["id"])}) · [제작·검증](./figma/additional-screens-2026-10-02.json). 너비390, 사용자 검토 대기.\n'
    t = t.replace(title, title + link, 1)
    # Add the new approved screens to the table of contents.
    toc = f'  - [{num} {name}](#screen-{num.replace(".", "-")})\n'
    insertion = '- **03 암장**' if num.startswith('02') else '- **06 크루**' if num.startswith('05') else '## 번호와 추가 규칙'
    if insertion in t:
        t = t.replace(insertion, toc + insertion, 1)
t += '\n2026-10-02 확인 다이얼로그 추가:01.05.04,02.05.03,02.08.05,02.13.02,05.02.02,05.04.03,06.01.03. 같은 기본 화면의 다른 메시지는 옆 다이얼로그 부품으로 비교한다. 현재38개 화면 묶음·82개 시안과 문서 번호를 동기화했다.\n'
p.write_text(t)

p = root / 'docs/figma-design-system.md'
t = p.read_text().replace('- **현재 제작 범위(2026-09-30):', '- **이전 제작 범위(2026-09-30):', 1)
t += '\n### 추가 모바일 화면·확인창 제작 · 2026-10-02\n\n'
t += '02.09~02.13,05.03~05.05,07.01의9개 독립 화면을 공통 원본부터 제작했다. 기본 시안11개와 기존 기본 화면 위 확인창7개를 추가했다. 총38개 화면 묶음·82개 시안·명세38개이며01.06은 보류한다. 새 원본은 [12 / Additional screens](' + url(report['componentSectionId']) + ')에 모았다.390 너비·Noto Sans KR·기존 도장·11색 난이도·169 정사각형 썸네일을 재사용했다.\n\n'
t += '| 공통 원본 | Figma | 사용 화면 |\n|---|---|---|\n'
uses = {'Filter': '02.09', 'Connection': '02.10', 'Member': '02.11·02.12',
        'History': '02.13', 'Notification': '05.05', 'Toggle': '05.05',
        'Library': '05.03', 'Viewer': '05.04', 'Video': '05.04',
        'Apple': '07.01', 'Auth': '07.01', 'Wordmark': '07.01', 'Login': '07.01',
        'Confirmation': '01.05·02.05·02.08·02.13·05.02·05.04·06.01'}
for c in report['components']:
    use = next((value for key, value in uses.items() if key in c['name']), '추가 화면')
    t += f'| {c["name"]} | [원본]({url(c["id"])}) | {use} |\n'
t += '\n공통 Space·Radius·Color와 글자 스타일을 연결했다. 어두운 미디어 배경·Apple 버튼 배경·브랜드 글자 스타일만 용도에 맞게 추가했다. 기존 뒤로 아이콘에 OnAction 변형을 추가했고 기존 Primary·Secondary는 유지한다. 회원 상세는 개인 상세의 하위 공통 부품을 재사용하며 편집·공개 설정·비공개 내용을 표시하지 않는다. 선택·미선택·연결 불가, 알림 켜기·끄기는 각각 같은 기본 시안에서 확인한다.\n\n[원본·사용 화면·검증](./figma/additional-screens-2026-10-02.json) · [390 시안 모음](./figma/assets/additional-screens-2026-10-02/review.html). 사용자 검토 대기.\n'
p.write_text(t)

p = root / 'docs/figma/README.md'
t = p.read_text()
a = t.index('01.06을 제외한 현재64개')
b = t.index('\n\n', a)
t = t[:a] + '추가 모바일 화면9종과 기존 화면 위 확인창7개를 제작했다. 현재38개 화면 묶음·82개 시안·텍스트 명세38개이며 모두390 너비다. 각 새 시안을 이미지로 검수하고 원본 연결·글자 경계·배치 겹침을 확인했다. [기록 필터](' + url('497:45699') + ') · [추가 화면 검증](./additional-screens-2026-10-02.json) · [390 시안 모음](./assets/additional-screens-2026-10-02/review.html). 사용자 검토 대기.' + t[b:]
p.write_text(t)

asset_dir = root / 'docs/figma/assets/additional-screens-2026-10-02'
for n in report['screens']:
    canonical = asset_dir / (n['number'] + '.png')
    by_id = asset_dir / (n['id'].replace(':', '-') + '.png')
    if not canonical.exists() and by_id.exists():
        shutil.copyfile(by_id, canonical)
gallery = '<!doctype html><meta charset="utf-8"><title>Holdlog 추가 화면</title><style>body{font-family:sans-serif;background:#f3f4f7;padding:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(390px,1fr));gap:28px}article{background:white;padding:20px}img{width:390px;max-width:100%}h2{font-size:16px}</style><h1>추가 화면 · 2026-10-02</h1><p>390 너비 · 기본 시안11개 · 확인 다이얼로그7개</p><main>'
for n in report['screens']:
    gallery += f'<article><h2><a href="{url(n["id"])}">{n["name"]}</a></h2><img src="{n["number"]}.png" alt="{n["name"]}"></article>'
gallery += '</main>'
(asset_dir / 'review.html').write_text(gallery)
print('Current registry, numbering, specifications and documentation updated.')

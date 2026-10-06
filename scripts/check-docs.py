# -*- coding: utf-8 -*-
"""Check local documentation links, JSON syntax, and the current screen registry."""
from pathlib import Path
from collections import Counter
from urllib.parse import unquote
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []
link_count = 0
anchor_cache = {}


def anchors(path):
    if path in anchor_cache:
        return anchor_cache[path]
    source = path.read_text()
    values = set(re.findall(r'id=["\']([^"\']+)', source))
    seen = Counter()
    for heading in re.findall(r'^#{1,6}\s+(.+)$', source, re.M):
        text = re.sub(r'<[^>]+>', '', heading).strip().lower().replace(' ', '-')
        name = ''.join(c for c in text if c.isalnum() or c in '-_')
        suffix = '-' + str(seen[name]) if seen[name] else ''
        seen[name] += 1
        values.add(name + suffix)
    anchor_cache[path] = values
    return values


markdown = [ROOT / 'README.md', ROOT / 'AGENTS.md', *sorted((ROOT / 'docs').rglob('*.md'))]
for path in markdown:
    for raw in re.findall(r'!?\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)', path.read_text()):
        if re.match(r'^[a-z]+:', raw):
            continue
        link_count += 1
        target_path, sep, anchor = raw.partition('#')
        target = (path.parent / unquote(target_path)).resolve() if target_path else path
        if not target.exists():
            errors.append(f'{path.relative_to(ROOT)}: 파일 없음: {raw}')
        elif sep and target.suffix == '.md' and unquote(anchor) not in anchors(target):
            errors.append(f'{path.relative_to(ROOT)}: 문서 주소 없음: {raw}')

html_count = 0
for path in (ROOT / 'docs').rglob('*.html'):
    for raw in re.findall(r'(?:href|src)=["\']([^"\']+)', path.read_text()):
        if raw.startswith('#') or re.match(r'^[a-z]+:', raw):
            continue
        html_count += 1
        value = unquote(raw.split('#', 1)[0].split('?', 1)[0])
        if not (path.parent / value).exists():
            errors.append(f'{path.relative_to(ROOT)}: HTML 파일 없음: {raw}')

json_count = 0
json_path_count = 0
removed_count = 0
file_pattern = re.compile(r'\.(?:md|json|png|jpg|jpeg|svg|html|py|js)$', re.I)


def check_json_paths(value, path, original_base=None, key=''):
    global json_path_count, removed_count
    if isinstance(value, dict):
        if value.get('artifactStatus') == 'removed':
            removed_count += 1
        for name, item in value.items():
            # A removed path is historical evidence, not an active file link.
            if name == 'removedPath' and value.get('artifactStatus') == 'removed':
                continue
            check_json_paths(item, path, original_base, name)
    elif isinstance(value, list):
        for item in value:
            check_json_paths(item, path, original_base, key)
    elif isinstance(value, str) and file_pattern.search(value):
        if len(value) > 500 or '\n' in value or re.match(r'^[a-z]+:', value):
            return
        # Imported resources outside the project are not repository links.
        if value.startswith('/') and not value.startswith(str(ROOT) + '/'):
            return
        if not ('/' in value or key.lower() in {'path', 'file', 'report', 'source', 'manifest'}):
            return
        json_path_count += 1
        candidates = [path.parent / value, ROOT / value]
        if original_base:
            candidates += [ROOT / original_base / value]
        if not any(candidate.exists() for candidate in candidates):
            errors.append(f'{path.relative_to(ROOT)}: JSON 파일 없음: {value}')


for path in (ROOT / 'docs').rglob('*.json'):
    try:
        data = json.loads(path.read_text())
        json_count += 1
        base = data.get('_archiveMetadata', {}).get('originalBase') if isinstance(data, dict) else None
        check_json_paths(data, path, base)
    except (ValueError, UnicodeError) as error:
        errors.append(f'{path.relative_to(ROOT)}: JSON 오류: {error}')

try:
    design = (ROOT / 'docs/screen-design.md').read_text()
    states = (ROOT / 'docs/screen-numbering.md').read_text()
    listing = (ROOT / 'docs/screens.md').read_text()
    registry = json.loads((ROOT / 'docs/figma/state.json').read_text())
    screen_ids = re.findall(r'id="screen-(\d{2})-(\d{2})"', design)
    screen_numbers = [f'{section}.{screen}' for section, screen in screen_ids]
    listed = re.findall(r'^\| (\d{2}\.\d{2}) \|', listing, re.M)
    if len(screen_numbers) != len(set(screen_numbers)) or set(screen_numbers) != set(listed):
        errors.append('모바일 화면 설계와 시안 목록의 번호가 다르거나 중복됨')
    rows = re.findall(r'^\| (\d{2}\.\d{2}\.\d{2}|A\d{2}\.\d{2}) \|[^\n]+node-id=([\d-]+)', states, re.M)
    node_map = {number: node for number, node in rows}
    if len(rows) != len(node_map):
        errors.append('상태 번호표에 중복 번호가 있음')
    registry_rows = registry.get('screens', [])
    registry_map = {row['number']: row['id'].replace(':', '-') for row in registry_rows}
    if len(registry_map) != len(registry_rows) or node_map != registry_map:
        errors.append('상태 번호표와 현재 Figma 상태 자료의 번호·노드가 다르거나 중복됨')
    for number in node_map:
        if not number.startswith('A') and number.rsplit('.', 1)[0] not in screen_numbers:
            errors.append(f'독립 화면 없는 상태 번호: {number}')
except (KeyError, ValueError) as error:
    errors.append(f'화면 자료 확인 실패: {error}')

print(f'문서 링크 {link_count}개 · HTML 참조 {html_count}개 · JSON {json_count}개 / 파일 경로 {json_path_count}개 확인')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
mobile_states = sum(not n.startswith('A') for n in node_map)
web_states = len(node_map) - mobile_states
web_screens = len({n.split('.')[0] for n in node_map if n.startswith('A')})
print(f'모바일 {len(screen_numbers)}개 화면·{mobile_states}개 상태 · 웹 {web_screens}개 화면·{web_states}개 상태 일치, 오류 없음')
print(f'제거된 과거 사진 {removed_count}개는 기록으로 구분')

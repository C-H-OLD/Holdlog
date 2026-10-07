#!/usr/bin/env python3
"""Check this repository's contract refs and examples; not a full OpenAPI validator."""
import json
import re
from datetime import date, datetime
from pathlib import Path
from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

ROOT = Path(__file__).resolve().parents[1]
API = json.loads((ROOT / 'packages/contracts/openapi.json').read_text())
RUNTIME = json.loads((ROOT / 'packages/contracts/runtime.schema.json').read_text())
EXAMPLES = json.loads((ROOT / 'packages/contracts/examples.json').read_text())


def resolve(doc, pointer):
    if not pointer.startswith('#/'):
        filename, fragment = pointer.split('#', 1)
        documents = {'openapi.json': API, 'runtime.schema.json': RUNTIME}
        assert filename in documents, f'등록하지 않은 참조: {pointer}'
        return resolve(documents[filename], '#' + fragment)
    value = doc
    for part in pointer[2:].split('/'):
        value = value[part.replace('~1', '/').replace('~0', '~')]
    return value


def walk(value, doc):
    if isinstance(value, dict):
        if '$ref' in value:
            resolve(doc, value['$ref'])
        if 'properties' in value:
            assert set(value.get('required', [])) <= set(value['properties']), '없는 필수 필드'
            assert len(value.get('required', [])) == len(set(value.get('required', []))), '중복 필수 필드'
        for child in value.values():
            walk(child, doc)
    elif isinstance(value, list):
        for child in value:
            walk(child, doc)


def valid(value, schema, doc):
    """Validate the schema keywords used by current synthetic fixtures only."""
    if '$ref' in schema:
        pointer = schema['$ref']
        referenced_doc = API if pointer.startswith('openapi.json#') else RUNTIME if pointer.startswith('runtime.schema.json#') else doc
        return valid(value, resolve(doc, pointer), referenced_doc)
    if 'oneOf' in schema:
        if sum(valid(value, part, doc) for part in schema['oneOf']) != 1:
            return False
    if 'anyOf' in schema:
        if not any(valid(value, part, doc) for part in schema['anyOf']):
            return False
    if 'const' in schema and value != schema['const']:
        return False
    if 'enum' in schema and value not in schema['enum']:
        return False
    types = schema.get('type', [])
    types = [types] if isinstance(types, str) else types
    matches = {'null': value is None, 'object': isinstance(value, dict),
               'array': isinstance(value, list), 'string': isinstance(value, str),
               'integer': isinstance(value, int) and not isinstance(value, bool),
               'number': isinstance(value, (int, float)) and not isinstance(value, bool),
               'boolean': isinstance(value, bool)}
    if types and not any(matches[t] for t in types):
        return False
    if isinstance(value, dict):
        props = schema.get('properties', {})
        if not set(schema.get('required', [])) <= set(value):
            return False
        if schema.get('additionalProperties') is False and not set(value) <= set(props):
            return False
        if not all(valid(v, props[k], doc) for k, v in value.items() if k in props):
            return False
    if isinstance(value, list):
        if len(value) < schema.get('minItems', 0):
            return False
        if schema.get('uniqueItems') and len({json.dumps(v, sort_keys=True) for v in value}) != len(value):
            return False
        if 'items' in schema and not all(valid(v, schema['items'], doc) for v in value):
            return False
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if value < schema.get('minimum', float('-inf')) or value > schema.get('maximum', float('inf')):
            return False
    if isinstance(value, str):
        if 'pattern' in schema and not re.search(schema['pattern'], value):
            return False
        try:
            fmt = schema.get('format')
            if fmt == 'uuid':
                UUID(value)
            elif fmt == 'date':
                date.fromisoformat(value)
            elif fmt == 'date-time':
                assert datetime.fromisoformat(value.replace('Z', '+00:00')).tzinfo is not None
            elif fmt == 'iana-time-zone':
                ZoneInfo(value)
            elif fmt == 'email':
                assert '@' in value
            elif fmt == 'uri':
                assert re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', value)
        except (ValueError, AssertionError, ZoneInfoNotFoundError):
            return False
    return True


def check_routes(routes, state):
    """Reject missing/extra/duplicate routes against the selected Figma registry."""
    assert len(routes) == len(set(routes)), '중복 화면 Route'
    registry = state[state['currentScreenRegistry']]
    expected = set()
    for screen in registry:
        number = screen['number']
        assert re.fullmatch(r'(?:\d{2}\.\d{2}\.\d{2}|A\d{2}\.\d{2})', number), f'잘못된 화면 상태 번호: {number}'
        expected.add(number.rsplit('.', 1)[0])
    actual = set(routes)
    assert actual == expected, f'화면 Route 불일치: 누락 {sorted(expected - actual)}, 추가 {sorted(actual - expected)}'
    return len(expected)


def main():
    """Check contract sources, registered screens and synthetic fixtures; raise on inconsistency."""
    assert API['openapi'] == '3.1.0'
    walk(API, API)
    walk(RUNTIME, RUNTIME)
    screen_count = check_routes(RUNTIME['$defs']['Route']['properties']['screenId']['enum'], json.loads((ROOT / 'docs/figma/state.json').read_text()))
    operations = {}
    used_contracts = set(API['x-global-contracts'])
    for path, item in API['paths'].items():
        for method, operation in item.items():
            oid = operation['operationId']
            assert oid not in operations, f'중복 operationId: {oid}'
            operations[oid] = operation
            actual = {p['name'] for p in operation.get('parameters', []) if p['in'] == 'path' and p['required']}
            assert actual == set(re.findall(r'{([^}]+)}', path)), f'path 인자 불일치: {oid}'
            for scheme in operation['security']:
                assert set(scheme) <= set(API['components']['securitySchemes'])
            assert all((ROOT / 'packages/contracts' / source).resolve().exists() for source in operation['x-policy-sources'])
            assert all(any((ROOT / 'specs').glob(tag + '-*')) for tag in operation['tags'])
            used_contracts.update(operation['x-contracts'])
            if method == 'head':
                assert all('content' not in response for response in operation['responses'].values()), f'HEAD body: {oid}'
    for example in EXAMPLES['http']:
        assert example['operationId'] in operations
        schema = API['components']['schemas'][example['schema']]
        assert valid(example['value'], schema, API), f'HTTP 예제 오류: {example["id"]}'
    for example in EXAMPLES['runtime']:
        assert valid(example['value'], RUNTIME['$defs'][example['schema']], RUNTIME), f'runtime 예제 오류: {example["id"]}'
    for example in EXAMPLES['mustReject']:
        value = example.get('value', {**example.get('baseValue', {}), **example.get('inject', {})})
        assert not valid(value, API['components']['schemas'][example['schema']], API), f'거절 예제 허용: {example["id"]}'
    assert used_contracts == {f'C{i:02d}' for i in range(1, 13)}
    print(f'API {len(API["paths"])}개 경로·{len(operations)}개 작업·{len(API["components"]["schemas"])}개 자료형, runtime {len(RUNTIME["$defs"])}개 정의')
    print(f'HTTP 예제 {len(EXAMPLES["http"])}개·runtime 예제 {len(EXAMPLES["runtime"])}개·거절 예제 {len(EXAMPLES["mustReject"])}개, C01~C12·화면{screen_count}개 참조 확인')
    print('정적 참조·예제 형식 검사 통과. 전체 OpenAPI 규약 검사·실제 API/DB/기기 실행 검증은 별도.')


if __name__ == '__main__':
    main()

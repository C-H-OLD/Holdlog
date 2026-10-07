// Only transport parameters are decoded. JSON bodies go directly to validators.
export function parseParameter(parameter, value) {
  if (value === undefined) {
    if (parameter.required || parameter.in === 'path') throw new Error(`Missing ${parameter.in} parameter ${parameter.name ?? ''}`);
    return undefined;
  }
  const schema = parameter.schema;
  const style = parameter.style ?? (parameter.in === 'query' || parameter.in === 'cookie' ? 'form' : 'simple');
  const explode = parameter.explode ?? style === 'form';
  if (!['query', 'header', 'path', 'cookie'].includes(parameter.in) || !['form', 'simple'].includes(style)) throw new Error(`Unsupported parameter serialization: ${style}`);
  function scalar(type, text) {
    if (typeof text !== 'string') throw new Error('Expected transport string');
    if (type === 'integer' || type === 'number') {
      const pattern = type === 'integer' ? /^-?(0|[1-9]\d*)$/ : /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;
      const number = Number(text);
      if (!pattern.test(text) || !Number.isFinite(number) || (type === 'integer' && !Number.isSafeInteger(number))) throw new Error('Invalid numeric parameter');
      return number;
    }
    if (type === 'boolean') {
      if (text !== 'true' && text !== 'false') throw new Error('Invalid boolean parameter');
      return text === 'true';
    }
    if (type && type !== 'string') throw new Error(`Unsupported parameter type: ${type}`);
    return text;
  }
  if (schema.type === 'array') {
    if (style === 'simple' && explode) throw new Error('Unsupported exploded simple array');
    const values = style === 'form' && explode ? (Array.isArray(value) ? value : [value]) : (typeof value === 'string' ? value.split(',') : null);
    if (!values) throw new Error('Invalid array serialization');
    return values.map(item => scalar(schema.items.type, item));
  }
  if (Array.isArray(value)) throw new Error('Repeated scalar parameter');
  return scalar(schema.type, value);
}

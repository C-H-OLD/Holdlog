/** Identify a literal private IPv4 or loopback host without Node-only modules. @param {string} host */
function isLocalHost(host) {
  if (host === 'localhost' || host === '[::1]') return true;
  const parts = host.split('.').map(Number);
  return parts.length === 4 && parts.every(value => Number.isInteger(value) && value >= 0 && value <= 255) &&
    (parts[0] === 127 || parts[0] === 10 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31));
}
/** Validate an origin without disclosing its value; Android loopback addresses the emulator itself.
 * @param {string | undefined} value @param {string} name @param {boolean} android @returns {string}
 */
function readOrigin(value, name, android) {
  try {
    const url = new URL(value || '');
    const loopback = url.hostname === 'localhost' || url.hostname === '[::1]' || url.hostname.startsWith('127.');
    if (!['http:', 'https:'].includes(url.protocol) || !isLocalHost(url.hostname) || (android && loopback) || url.username || url.password || url.search || url.hash || url.origin !== value) throw new Error('Invalid origin');
    return url.origin;
  } catch { throw new Error('Missing or invalid setting: ' + name); }
}
/** Read public development-only host settings; throws a setting name on missing/unsafe input, without logging.
 * @param {Record<string, string | undefined>} env @returns {{ios: string, android: string}}
 */
function readDevelopmentOrigins(env) {
  return {
    ios: readOrigin(env.EXPO_PUBLIC_DEV_API_ORIGIN_IOS, 'EXPO_PUBLIC_DEV_API_ORIGIN_IOS', false),
    android: readOrigin(env.EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID, 'EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID', true),
  };
}
exports.readDevelopmentOrigins = readDevelopmentOrigins;

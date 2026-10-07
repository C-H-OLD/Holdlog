const { getDefaultConfig } = require('expo/metro-config');
// Expo's SDK57 defaults resolve workspace packages; do not replace resolver paths or package exports.
module.exports = getDefaultConfig(__dirname);

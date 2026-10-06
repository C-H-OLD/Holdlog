import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';

const sources = ['**/*.{js,jsx,mjs,cjs,ts,tsx}'];
const typed = ['apps/*/**/*.{ts,tsx}', 'packages/*/**/*.{ts,tsx}'];
export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/.expo/**', '**/.tools/**', '**/generated/**', 'apps/mobile/ios/**', 'apps/mobile/android/**', 'docs/history/**', '**/*.min.js'] },
  { ...js.configs.recommended, files: sources, languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  ...tseslint.configs.recommended.map(config => ({ ...config, files: ['**/*.{ts,tsx}'] })),
  ...tseslint.configs.recommendedTypeChecked.map(config => ({ ...config, files: typed })),
  { files: typed, languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } } },
  { files: ['scripts/**/*.{js,mjs,cjs}', '*.mjs', 'apps/server/**/*.{js,mjs,cjs,ts}', 'apps/*/*.{js,mjs,cjs}'], languageOptions: { globals: globals.node } },
  { files: ['apps/admin/src/**/*.{js,jsx,ts,tsx}', 'apps/admin/checks/**/*.{js,ts}'], languageOptions: { globals: globals.browser } },
  { files: ['apps/mobile/src/**/*.{js,jsx,ts,tsx}', 'apps/mobile/checks/**/*.{js,ts}'], languageOptions: { globals: { ...globals.es2021, console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', fetch: 'readonly', __DEV__: 'readonly' } } },
  { files: ['apps/{admin,mobile}/**/*.{js,jsx,ts,tsx}'], plugins: { 'react-hooks': hooks }, rules: hooks.configs.recommended.rules },
  { files: ['apps/admin/src/**/*.{jsx,tsx}'], plugins: { 'react-refresh': refresh }, rules: { 'react-refresh/only-export-components': ['error', { allowConstantExport: true }] } },
  { files: sources, rules: { 'no-var': 'error', 'prefer-const': 'error' } },
);

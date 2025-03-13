module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['warn'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'arrow-parens': ['error', 'always'],
    'arrow-spacing': ['error', { before: true, after: true }],
    'comma-dangle': ['error', 'always-multiline'],
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
    'object-curly-spacing': ['error', 'always'],
  },
}; 
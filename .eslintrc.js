module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      ecmaVersion: 7,
      modules: true,
      sourceType: 'module',
    },
  },
  plugins: ['import', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts'],
      },
    },
  },

  rules: {
    'no-undef': 2,
    'no-unreachable': 'warn',
    'import/no-unresolved': 0,
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    '@typescript-eslint/ban-ts-comment': 0,
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
        groups: [
          'builtin',
          'external',
          'internal',
          'object',
          'parent',
          'sibling',
          'index',
        ],
      },
    ],
  },
  env: {
    es6: true,
    node: true,
  },
}

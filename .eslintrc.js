module.exports = {
  extends: '@josselinbuils/eslint-config-react',
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc', caseInsensitive: false },
        'newlines-between': 'never',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'object',
        ],
      },
    ],
    'react/function-component-definition': 'off',
  },
};

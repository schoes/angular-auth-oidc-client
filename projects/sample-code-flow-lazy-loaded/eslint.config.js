const base = require('../../eslint.config.js');

module.exports = [
  ...base,
  {
    files: ['**/*.ts'],
    rules: {
      // The samples deliberately keep the NgModule/zone based setup so that they
      // stay readable for consumers that have not migrated yet.
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
    },
  },
];

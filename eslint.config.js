const { defineConfig, globalIgnores } = require('eslint/config');
const angular = require('angular-eslint');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

/**
 * Shared base configuration. Every project extends this from its own
 * `projects/<project>/eslint.config.js`, which is wired up through the
 * `eslintConfig` option of its `lint` target in angular.json.
 */
module.exports = defineConfig([
  globalIgnores(['dist/**', 'coverage/**', 'docs/**', '**/node_modules/**']),
  {
    files: ['**/*.ts'],
    extends: [
      tsPlugin.configs['flat/recommended'],
      angular.configs.tsRecommended,
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
      ],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            memberTypes: [
              // Static members
              'public-static-field',
              'protected-static-field',
              'private-static-field',
              '#private-static-field',

              // Readonly fields (grouped)
              'private-instance-readonly-field',

              // Constructors
              'public-constructor',
              'protected-constructor',
              'private-constructor',

              // Methods
              'public-instance-method',
              'protected-instance-method',
              'private-instance-method',
            ],
          },
        },
      ],
      'max-len': 'off',
      'lines-between-class-members': [
        'error',
        {
          enforce: [
            {
              blankLine: 'always',
              prev: 'method',
              next: 'method',
            },
            {
              blankLine: 'always',
              prev: 'field',
              next: 'method',
            },
          ],
        },
      ],
      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var'],
          next: '*',
        },
        {
          blankLine: 'never',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      'one-var': ['error', 'never'],
      '@typescript-eslint/no-useless-constructor': ['error'],
      '@typescript-eslint/prefer-readonly': ['error'],
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/no-inferrable-types': ['error'],
      'object-shorthand': ['error', 'always'],
      'no-case-declarations': ['error'],
      'no-empty': ['error'],
      '@typescript-eslint/no-empty-function': ['error'],
      '@typescript-eslint/no-empty-object-type': ['error'],
      '@typescript-eslint/no-unsafe-function-type': ['error'],
      '@typescript-eslint/no-wrapper-object-types': ['error'],
      'no-useless-escape': ['error'],
      'no-prototype-builtins': ['error'],
      'prefer-spread': ['error'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/typedef': ['error'],
      '@typescript-eslint/explicit-function-return-type': ['error'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended],
  },
]);

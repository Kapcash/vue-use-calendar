const config = {
  "env": {
    "browser": true,
    "amd": true,
    "node": true,
  },

  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  plugins: [
    '@typescript-eslint',
  ],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    '@typescript-eslint/ban-ts-comment': 1,
    'no-trailing-spaces': 0,
    'no-console': 0,
    'no-use-before-define': 0,
    'vue/no-v-html': 0,
    'no-inner-declarations': 0,
    semi: 0,
    '@typescript-eslint/semi': ['error', 'always'],
    "@typescript-eslint/member-delimiter-style": 2,
    'comma-dangle': ['error', 'always-multiline'],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    '@typescript-eslint/no-unused-vars': [1, { ignoreRestSiblings: true }],
  },
};

module.exports = config;
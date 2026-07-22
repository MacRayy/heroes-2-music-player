module.exports = {
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'all',
  singleQuote: true,
  semi: false,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^node:',
    '^react$',
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^[./](?!.*\\.(?:css|scss)$)',
    '^.+\\.(?:css|scss)$',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs'],
      options: {
        importOrderParserPlugins: ['explicitResourceManagement', 'typescript', 'jsx'],
        importOrderSeparation: true,
        importOrderSortSpecifiers: true,
        importOrderCaseInsensitive: true,
      },
    },
  ],
  proseWrap: 'always',
  endOfLine: 'lf',
}

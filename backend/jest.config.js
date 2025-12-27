module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // テストファイルの場所
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.js',
  ],

  // TypeScript設定
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // モジュール解決
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // テスト実行設定
  testTimeout: 30000, // 30秒タイムアウト（データベース操作を考慮）

  // 並列実行を避ける（データベーステストの競合防止）
  maxWorkers: 1,

  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],

  // テスト実行時の表示設定
  verbose: true,

  // ESLint の console.log 警告を回避（テストではconsole.log許可）
  globals: {
    console: 'readonly',
  },
};
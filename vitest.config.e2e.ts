import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/http/**/*.spec.ts'],
    environment: 'node',
    env: {
      NODE_ENV: 'test',
    },
    globals: true,
    setupFiles: ['./src/http/e2e-setup.ts'],
    fileParallelism: false,
    maxWorkers: 1,
  },
})

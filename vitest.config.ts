import { defineConfig } from 'vitest/config'
import sharedConfig from './shared.config'

export default defineConfig({
  resolve: {
    alias: sharedConfig.alias,
  },
  test: {
    coverage: {
      exclude: ['*config.[tj]s', 'playground'],
    },
  },
  ...sharedConfig,
})

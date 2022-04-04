// vite.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
	 environment: 'jsdom',  // 'happy-dom', or 'node'
	 setupFiles: 'src/setupTests.js',
	 coverage: {
      reporter: ['text', 'json', 'html'],
    },

  },
})

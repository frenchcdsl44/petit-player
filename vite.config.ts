// vite.config.ts
import { defineConfig } from 'vitest/config'
const path = require('path')

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',  // 'happy-dom', or 'node'
	},
	coverage: {
		reporter: ['text', 'json', 'html'],
	},
	build:{
		minify: true,
		emptyOutDir:false,
		lib:{
			entry: path.resolve(__dirname, 'src/PetitPlayer.js'),
			name: 'PetitPlayer',
			fileName: (format) => `PetitPlayer.${format}.min.js`
		}
	}
})

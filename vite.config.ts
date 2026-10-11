import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 450,
    rollupOptions: {
      output: {
        // Charts are the heaviest dependency: keep them out of the first-paint bundle.
        manualChunks: {react: ['react', 'react-dom'], charts: ['recharts']},
      },
    },
  },
  test: {environment: 'node', include: ['src/**/*.test.ts']},
})

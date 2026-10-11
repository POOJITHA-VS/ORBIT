import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react()],
 build:{rollupOptions:{output:{manualChunks:{react:['react','react-dom'],motion:['framer-motion'],charts:['recharts']}}}},
 test:{environment:'jsdom'}})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // ✅ Allows access from external IP (not just localhost)
      port: 8001,      // ✅ Runs on port 8001
      proxy: {
        '/api': {
          target: env.VITE_API_GATEWAY_URL || env.VITE_API_URL || 'http://localhost:5000', // ✅ Microservices Gateway
          changeOrigin: true,
        },
      },
    },
  }
})

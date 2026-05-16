import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/uos-exam-archive/',
  server: {
    proxy: {
      // 시립대 OpenAPI 프록시 (CORS 우회 + User-Agent 자동 설정)
      '/uos-api': {
        target: 'https://wise.uos.ac.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uos-api/, '/COM'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
})

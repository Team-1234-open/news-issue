import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { cwd } from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), 'NAVER_')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // CORS 에러를 피하기 위한 프록시 서버 설정
    server: {
      proxy: {
        '/api/naver/news': {
          target: 'https://naverapihub.apigw.ntruss.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/naver\/news/, '/search/v1/news'),
          headers: {
            'X-NCP-APIGW-API-KEY-ID': env.NAVER_CLIENT_ID ?? '',
            'X-NCP-APIGW-API-KEY': env.NAVER_CLIENT_SECRET ?? '',
          },
        },
      },
    },
  }
})

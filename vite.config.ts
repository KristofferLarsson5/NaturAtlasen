import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/finbif': {
        target: 'https://ogcapi.laji.fi',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/finbif/, ''),
      },
    },
  },
})

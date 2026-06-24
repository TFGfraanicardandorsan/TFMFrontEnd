import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

const dlgaProxyTarget = process.env.VITE_DLGA_PROXY_TARGET || process.env.DLGA_PROXY_TARGET || 'http://127.0.0.1:8001'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3033,
    host: true,
    allowedHosts: ['permutas.eii.us.es'],
    proxy: {
      '/dlga-api': {
        target: dlgaProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dlga-api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  }
})

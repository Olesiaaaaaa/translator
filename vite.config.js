import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  //  Критично: имя репозитория на GitHub
  base: '/translator/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    //  Гарантируем, что пути в сборке будут относительными
    assetsInlineLimit: 0
  }
})

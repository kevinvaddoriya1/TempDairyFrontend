import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://tempdairybackend.onrender.com/api',
        changeOrigin: true,
      },
    },
  },
})
//https://milk-delivery-system-2n18.onrender.com/api

//https://dairybackend-zeet.onrender.com/api

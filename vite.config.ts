import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { apiApp } from './server/apiApp'

function nextgenBackendPlugin(): Plugin {
  return {
    name: 'nextgen-backend-api',
    configureServer(server) {
      server.middlewares.use(apiApp)
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiApp)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nextgenBackendPlugin(),
  ],
})

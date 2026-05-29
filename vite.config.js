import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleUsersApi } from './server/userStore.js'

function mindUpStorageApi() {
  return {
    name: 'mindup-storage-api',
    configureServer(server) {
      server.middlewares.use('/api/users', (request, response) => {
        handleUsersApi(request, response)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mindUpStorageApi()],
})

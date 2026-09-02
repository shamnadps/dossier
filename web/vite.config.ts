import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Project is served from https://<user>.github.io/dossier/ in production,
// and from / during local dev.
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/dossier/' : '/',
  plugins: [react()],
}))

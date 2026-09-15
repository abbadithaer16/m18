import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served as a project site at https://<user>.github.io/m18/ — every
  // built asset URL needs this prefix, or they 404 under that subpath.
  base: '/m18/',
  plugins: [react()],
})

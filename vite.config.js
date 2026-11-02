import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served as a project site at https://<user>.github.io/m18/ — every
  // built asset URL needs this prefix, or they 404 under that subpath.
  base: '/m18/',
  plugins: [react()],
  build: {
    // Two independent pages: the AUREX site at /m18/ and the NOEMA concept
    // site at /m18/noema/. They share dependencies but no application code.
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        noema: resolve(import.meta.dirname, 'noema/index.html'),
      },
    },
  },
})

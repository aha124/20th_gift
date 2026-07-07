import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so a static export can be opened straight from the file system
// as an offline keepsake, per the spec.
export default defineConfig({
  plugins: [react()],
  base: './',
})

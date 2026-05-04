import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** GitHub project pages are served at /<repo>/; override with VITE_BASE_PATH if needed. */
function productionBase(): string {
  const explicit = process.env.VITE_BASE_PATH?.trim()
  if (explicit) return explicit.endsWith('/') ? explicit : `${explicit}/`
  const repo = process.env.GITHUB_REPOSITORY?.split('/').pop()
  if (repo) return `/${repo}/`
  return '/chai-empire/'
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : productionBase(),
  plugins: [react(), tailwindcss()],
}))

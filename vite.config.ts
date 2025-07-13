import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(() => {
  const manifest = JSON.parse(
    readFileSync(new URL('./public/manifest.webmanifest', import.meta.url), 'utf-8'),
  )
  const plugins: PluginOption[] = [
    react(),
    VitePWA({
      srcDir: 'public',
      manifest,
      manifestFilename: 'manifest.webmanifest',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ]

  if (process.env.ANALYZE) {
    plugins.push(
      visualizer({
        filename: 'dist/bundle-report.html',
        open: false,
      }) as PluginOption,
    )
  }

  // Use environment variable for base URL, defaulting to GitHub Pages path
  const baseUrl = process.env.VITE_BASE_URL || '/ebike-assistant-app/'

  return {
    base: baseUrl,
    plugins,
  }
})

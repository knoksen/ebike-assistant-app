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

  // Use relative paths for all environments when running locally
  return {
    base: './',
    plugins,
    server: {
      port: 3000,
      strictPort: false,
    },
    publicDir: 'public',
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  }
})

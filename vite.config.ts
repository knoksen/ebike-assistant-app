import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(() => {
  const require = createRequire(import.meta.url)
  const plugins: PluginOption[] = [
    react(),
    VitePWA({
      srcDir: 'public',
      manifest: require('./public/manifest.webmanifest'),
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

  return {
    base: '/ebike-assistant-app/',
    plugins,
  }
})

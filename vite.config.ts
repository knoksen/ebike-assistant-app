import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import { createRequire } from 'module'

// https://vite.dev/config/
export default defineConfig(() => {
  const require = createRequire(import.meta.url)
  const plugins: PluginOption[] = [
    react(),
    VitePWA({
      srcDir: 'public',
      filename: 'manifest.webmanifest',
      manifest: require('./public/manifest.json'),
    }),
  ]
  if (process.env.ANALYZE) {
    plugins.push(
      visualizer({
        filename: 'dist/bundle-report.html',
        open: false,
      }),
    )
  }
  return {
    base: '/ebike-assistant-app/',
    plugins,
  }
})

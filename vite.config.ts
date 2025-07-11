import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
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
      }),
    )
  }
  return {
    base: '/ebike-assistant-app/',
    plugins,
  }
export default defineConfig({
  plugins: [react()],
})

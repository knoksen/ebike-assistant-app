import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(() => {
  const plugins: PluginOption[] = [react()]
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

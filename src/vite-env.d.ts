/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL?: string
	readonly VITE_WEATHER_API_KEY?: string
	readonly VITE_MAPS_API_KEY?: string
	readonly VITE_ELEVATION_API_KEY?: string
	readonly VITE_TRAFFIC_API_KEY?: string
	readonly VITE_COMMUNITY_API_KEY?: string
	readonly VITE_WS_URL?: string
	readonly BASE_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

// Minimal Web Bluetooth type shims (only parts we use)
// Web Bluetooth types provided via web-bluetooth.d.ts and navigator-extensions.d.ts

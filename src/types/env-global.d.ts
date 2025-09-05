/// <reference types="vite/client" />

// Explicit global augmentation for ImportMeta (some TS configs with bundler resolution miss plain interface merging)
declare global {
  interface ImportMetaEnv {
    readonly BASE_URL: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
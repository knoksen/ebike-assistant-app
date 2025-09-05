/// <reference types="vite/client" />
// Ensure ImportMeta env typing globally available (augment if necessary)
interface ImportMetaEnv {
  readonly BASE_URL: string
  // existing VITE_* variables declared in vite-env.d.ts
}
interface ImportMeta { readonly env: ImportMetaEnv }
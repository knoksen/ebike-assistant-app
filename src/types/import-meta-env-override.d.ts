// Fallback global augmentation ensuring import.meta.env is always defined
interface ImportMeta { readonly env: Record<string, any> }
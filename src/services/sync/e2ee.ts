export type SyncPayload = {
  type: 'trip' | 'settings' | 'maintenance'
  data: Record<string, unknown>
}

export type EncryptedSyncPayload = {
  version: number
  algorithm: 'XChaCha20-Poly1305' | 'AES-GCM'
  keyId: string
  nonce: string
  ciphertext: string
}

export type E2EEKeyMaterial = {
  id: string
  wrappedKey: string
  createdAt: number
}

export type SyncStatus = {
  mode: 'local' | 'encrypted'
  lastSync?: number
}

export interface SyncTransport {
  send(payload: EncryptedSyncPayload): Promise<void>
  fetch(): Promise<EncryptedSyncPayload[]>
}

export interface SyncCrypto {
  generateKey(): Promise<E2EEKeyMaterial>
  encrypt(payload: SyncPayload, key: E2EEKeyMaterial): Promise<EncryptedSyncPayload>
  decrypt(payload: EncryptedSyncPayload, key: E2EEKeyMaterial): Promise<SyncPayload>
}

export interface SyncKeyStore {
  getActiveKey(): Promise<E2EEKeyMaterial | null>
  storeKey(key: E2EEKeyMaterial): Promise<void>
}

/**
 * E2EE flow sketch
 * 1) Key generation & storage
 *    - Call `SyncCrypto.generateKey()` on first sync.
 *    - Persist `E2EEKeyMaterial` via `SyncKeyStore` (IndexedDB / OS keystore).
 *    - Rotate keys by generating a new key and storing the new `keyId`.
 * 2) Encryption boundary (client-side only)
 *    - Client modules pass plaintext `SyncPayload` to `SyncCrypto.encrypt()`.
 *    - Only `EncryptedSyncPayload` leaves the client via `SyncTransport.send()`.
 * 3) Transport API (server never sees plaintext)
 *    - `SyncTransport` only accepts `EncryptedSyncPayload` and returns encrypted batches.
 *    - The client decrypts after `SyncTransport.fetch()` via `SyncCrypto.decrypt()`.
 */

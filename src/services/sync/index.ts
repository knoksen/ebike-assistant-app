import { ENV } from '@/env'
import type {
  E2EEKeyMaterial,
  EncryptedSyncPayload,
  SyncCrypto,
  SyncKeyStore,
  SyncPayload,
  SyncStatus,
  SyncTransport,
} from './e2ee'

export interface SyncModule {
  start(): Promise<void>
  stop(): Promise<void>
  push(payload: SyncPayload): Promise<void>
  pull(): Promise<SyncPayload[]>
  status(): SyncStatus
}

export type SyncModuleOptions = {
  transport?: SyncTransport
  crypto?: SyncCrypto
  keyStore?: SyncKeyStore
  featureFlag?: boolean
}

class LocalOnlySyncModule implements SyncModule {
  private state: SyncStatus = { mode: 'local' }

  async start(): Promise<void> {
    this.state = { ...this.state, lastSync: Date.now() }
  }

  async stop(): Promise<void> {
    return
  }

  async push(_payload: SyncPayload): Promise<void> {
    return
  }

  async pull(): Promise<SyncPayload[]> {
    return []
  }

  status(): SyncStatus {
    return this.state
  }
}

class EncryptedSyncModule implements SyncModule {
  private state: SyncStatus = { mode: 'encrypted' }
  private cachedKey: E2EEKeyMaterial | null = null

  constructor(
    private transport: SyncTransport,
    private crypto: SyncCrypto,
    private keyStore: SyncKeyStore,
  ) {}

  async start(): Promise<void> {
    await this.ensureKey()
    this.state = { ...this.state, lastSync: Date.now() }
  }

  async stop(): Promise<void> {
    return
  }

  async push(payload: SyncPayload): Promise<void> {
    const key = await this.ensureKey()
    const encrypted = await this.crypto.encrypt(payload, key)
    await this.transport.send(encrypted)
    this.state = { ...this.state, lastSync: Date.now() }
  }

  async pull(): Promise<SyncPayload[]> {
    const key = await this.ensureKey()
    const encryptedPayloads = await this.transport.fetch()
    const decrypted = await Promise.all(
      encryptedPayloads.map((payload) => this.crypto.decrypt(payload, key)),
    )
    this.state = { ...this.state, lastSync: Date.now() }
    return decrypted
  }

  status(): SyncStatus {
    return this.state
  }

  private async ensureKey(): Promise<E2EEKeyMaterial> {
    if (this.cachedKey) return this.cachedKey
    const existing = await this.keyStore.getActiveKey()
    if (existing) {
      this.cachedKey = existing
      return existing
    }
    const generated = await this.crypto.generateKey()
    await this.keyStore.storeKey(generated)
    this.cachedKey = generated
    return generated
  }
}

export function createSyncModule(options: SyncModuleOptions = {}): SyncModule {
  const enabled = options.featureFlag ?? ENV.SYNC_ENABLED
  if (!enabled || !options.transport || !options.crypto || !options.keyStore) {
    return new LocalOnlySyncModule()
  }
  return new EncryptedSyncModule(options.transport, options.crypto, options.keyStore)
}

export type { EncryptedSyncPayload, SyncPayload }

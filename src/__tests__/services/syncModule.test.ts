import { describe, expect, it, vi } from 'vitest'
import { createSyncModule } from '@/services/sync'
import type {
  E2EEKeyMaterial,
  EncryptedSyncPayload,
  SyncCrypto,
  SyncKeyStore,
  SyncPayload,
  SyncTransport,
} from '@/services/sync/e2ee'

const keyMaterial: E2EEKeyMaterial = {
  id: 'key-1',
  wrappedKey: 'wrapped',
  createdAt: 123,
}

const encryptedPayload: EncryptedSyncPayload = {
  version: 1,
  algorithm: 'XChaCha20-Poly1305',
  keyId: 'key-1',
  nonce: 'nonce',
  ciphertext: 'ciphertext',
}

const plaintextPayload: SyncPayload = {
  type: 'trip',
  data: { id: 'trip-1', note: 'plaintext' },
}

function createMocks() {
  const transport: SyncTransport = {
    send: vi.fn(async () => {}),
    fetch: vi.fn(async () => []),
  }

  const crypto: SyncCrypto = {
    generateKey: vi.fn(async () => keyMaterial),
    encrypt: vi.fn(async () => encryptedPayload),
    decrypt: vi.fn(async () => plaintextPayload),
  }

  const keyStore: SyncKeyStore = {
    getActiveKey: vi.fn(async () => keyMaterial),
    storeKey: vi.fn(async () => {}),
  }

  return { transport, crypto, keyStore }
}

describe('SyncModule encryption boundaries', () => {
  it('encrypts payloads before transport send', async () => {
    const { transport, crypto, keyStore } = createMocks()
    const module = createSyncModule({
      featureFlag: true,
      transport,
      crypto,
      keyStore,
    })

    await module.push(plaintextPayload)

    expect(crypto.encrypt).toHaveBeenCalledWith(plaintextPayload, keyMaterial)
    expect(transport.send).toHaveBeenCalledWith(encryptedPayload)
    const sentPayload = (transport.send as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(sentPayload).not.toHaveProperty('data')
    expect(sentPayload).not.toEqual(plaintextPayload)
  })

  it('decrypts transport payloads after fetch', async () => {
    const { transport, crypto, keyStore } = createMocks()
    transport.fetch = vi.fn(async () => [encryptedPayload])
    const module = createSyncModule({
      featureFlag: true,
      transport,
      crypto,
      keyStore,
    })

    const result = await module.pull()

    expect(crypto.decrypt).toHaveBeenCalledWith(encryptedPayload, keyMaterial)
    expect(result).toEqual([plaintextPayload])
  })

  it('defaults to local-only sync when feature flag is disabled', async () => {
    const { transport, crypto, keyStore } = createMocks()
    const module = createSyncModule({
      featureFlag: false,
      transport,
      crypto,
      keyStore,
    })

    await module.push(plaintextPayload)

    expect(transport.send).not.toHaveBeenCalled()
  })
})

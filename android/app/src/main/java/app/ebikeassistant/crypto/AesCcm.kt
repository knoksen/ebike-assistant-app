package app.ebikeassistant.crypto

import java.security.Security
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * AES-CCM (Counter with CBC-MAC) authenticated encryption
 * Supports both BouncyCastle and platform providers
 */
class AesCcm(private val key: ByteArray) {
    private val spec get() = SecretKeySpec(key, "AES")

    /**
     * Encrypts and authenticates data using AES-CCM
     * 
     * @param nonce Unique nonce/IV (7-13 bytes recommended)
     * @param aad Additional authenticated data (optional)
     * @param plaintext Data to encrypt
     * @param tagLenBits Authentication tag length in bits (default 128)
     * @return Ciphertext with authentication tag appended
     */
    fun seal(nonce: ByteArray, aad: ByteArray, plaintext: ByteArray, tagLenBits: Int = 128): ByteArray {
        val c = try { 
            Cipher.getInstance("AES/CCM/NoPadding", "BC") 
        } catch (_: Throwable) { 
            Cipher.getInstance("AES/CCM/NoPadding") 
        }
        val iv = IvParameterSpec(nonce)
        c.init(Cipher.ENCRYPT_MODE, spec, iv)
        if (aad.isNotEmpty()) c.updateAAD(aad)
        return c.doFinal(plaintext)
    }

    /**
     * Decrypts and verifies authenticated data using AES-CCM
     * 
     * @param nonce Nonce/IV used for encryption
     * @param aad Additional authenticated data (must match encryption)
     * @param ciphertext Encrypted data with authentication tag
     * @param tagLenBits Authentication tag length in bits (default 128)
     * @return Decrypted plaintext if authentication succeeds
     * @throws javax.crypto.AEADBadTagException if authentication fails
     */
    fun open(nonce: ByteArray, aad: ByteArray, ciphertext: ByteArray, tagLenBits: Int = 128): ByteArray {
        val c = try { 
            Cipher.getInstance("AES/CCM/NoPadding", "BC") 
        } catch (_: Throwable) { 
            Cipher.getInstance("AES/CCM/NoPadding") 
        }
        val iv = IvParameterSpec(nonce)
        c.init(Cipher.DECRYPT_MODE, spec, iv)
        if (aad.isNotEmpty()) c.updateAAD(aad)
        return c.doFinal(ciphertext)
    }
}

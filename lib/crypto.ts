import "server-only"
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto"
import { serverEnv } from "@/lib/env"

/**
 * AES-256-GCM encryption for users' BYOK provider API keys at rest.
 * The master key lives only in APP_ENCRYPTION_KEY (base64, 32 bytes).
 */

const ALGO = "aes-256-gcm"

function masterKey(): Buffer {
  const key = Buffer.from(serverEnv.appEncryptionKey, "base64")
  if (key.length !== 32) {
    throw new Error(
      "APP_ENCRYPTION_KEY must decode to 32 bytes (base64-encoded 256-bit key)",
    )
  }
  return key
}

export type EncryptedSecret = {
  ciphertext: string
  iv: string
  authTag: string
}

export function encryptSecret(plaintext: string): EncryptedSecret {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, masterKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  }
}

export function decryptSecret(secret: EncryptedSecret): string {
  const decipher = createDecipheriv(
    ALGO,
    masterKey(),
    Buffer.from(secret.iv, "base64"),
  )
  decipher.setAuthTag(Buffer.from(secret.authTag, "base64"))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(secret.ciphertext, "base64")),
    decipher.final(),
  ])
  return decrypted.toString("utf8")
}

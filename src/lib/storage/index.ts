/**
 * Storage provider abstraction.
 *
 * Kora puts files, images, exports, and shares through this interface so the
 * default Supabase Storage implementation can be swapped for S3 / R2 / GCS
 * without any page code changing.
 *
 * The contract:
 *   - `put` returns opaque storage objects identified by `key`.
 *   - Keys are stable, URL-safe, and globally unique within a workspace.
 *   - `signedUrl` returns short-lived URLs for browser rendering (`expiresIn`
 *     defaults to 5 minutes).
 *   - `delete` is idempotent — calling on a missing key is not an error.
 */

export type StorageKey = string;

export interface StorageObject {
  key: StorageKey;
  size: number;
  contentType: string;
  ownerId: string;
  workspaceId: string;
  createdAt: string;
  meta?: Record<string, string>;
}

export interface StorageProvider {
  put(input: {
    workspaceId: string;
    ownerId: string;
    contentType: string;
    bytes: ArrayBuffer | Uint8Array;
    filename?: string;
  }): Promise<StorageObject>;

  signedUrl(input: {
    key: StorageKey;
    expiresIn?: number;
  }): Promise<string>;

  delete(input: { key: StorageKey }): Promise<void>;
}

/* ---------------------------------------------------------------------- */
/* Default implementation: Supabase Storage.                              */
/* Singleton wrapper — `getStorage()` returns the shared instance.        */
/* ---------------------------------------------------------------------- */

import { createClient } from "@supabase/supabase-js";

let cached: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (cached) return cached;
  cached = createSupabaseStorage();
  return cached;
}

function createSupabaseStorage(): StorageProvider {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // Service role lives in the server env. If it's missing we degrade to
    // an inert storage that produces loud errors on every call — better
    // than silent breakage in production.
    return new InertStorage("Supabase env is missing in server runtime.");
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  return {
    async put({ workspaceId, ownerId, contentType, bytes, filename }) {
      const safeFilename =
        filename?.replace(/[^\w.\-]+/g, "_") ?? "upload.bin";
      const key = `${workspaceId}/${cryptoRandom()}-${safeFilename}`;
      const buffer = toBuffer(bytes);
      const { error } = await admin.storage
        .from("kora")
        .upload(key, buffer, { contentType, upsert: false });
      if (error) throw new Error(`storage.put: ${error.message}`);
      const { data: signed } = await admin.storage
        .from("kora")
        .createSignedUrl(key, 60 * 60);
      return {
        key,
        size: buffer.byteLength,
        contentType,
        ownerId,
        workspaceId,
        createdAt: new Date().toISOString(),
        meta: { signedUrl: signed?.signedUrl ?? "" },
      };
    },
    async signedUrl({ key, expiresIn = 5 * 60 }) {
      const { data, error } = await admin.storage
        .from("kora")
        .createSignedUrl(key, expiresIn);
      if (error || !data) throw new Error(`storage.signedUrl: ${error?.message}`);
      return data.signedUrl;
    },
    async delete({ key }) {
      await admin.storage.from("kora").remove([key]);
    },
  };
}

function cryptoRandom(): string {
  // 12 bytes of entropy, hex-encoded — enough to avoid collisions at
  // workspace scale without paying for UUID overhead on hot paths.
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toBuffer(bytes: ArrayBuffer | Uint8Array): Buffer {
  if (bytes instanceof ArrayBuffer) return Buffer.from(bytes);
  return Buffer.from(bytes);
}

/* ---------------------------------------------------------------------- */
/* Fallback in-memory provider.                                           */
/* Used when SUPABASE_SERVICE_ROLE_KEY is not configured — keeps the      */
/* build green in dev environments where the host hasn't wired it yet.    */
/* ---------------------------------------------------------------------- */

class InertStorage implements StorageProvider {
  constructor(private readonly reason: string) {}
  async put(): Promise<StorageObject> {
    throw new Error(`Storage disabled: ${this.reason}`);
  }
  async signedUrl(): Promise<string> {
    throw new Error(`Storage disabled: ${this.reason}`);
  }
  async delete(): Promise<void> {
    /* no-op */
  }
}

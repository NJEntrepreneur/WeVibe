import type { SessionEntry } from "./types.js";

/**
 * Abstracts the persistence backend for session entries.
 *
 * The file-based JSON implementation reads and writes a single flat
 * `Record<string, SessionEntry>` keyed by normalized session keys.
 * This interface surfaces only the operations that implementation
 * actually performs so that alternative backends (SQLite, Redis, etc.)
 * can be swapped in without touching callsites.
 */
export interface SessionStore {
  /**
   * Return the entry for the given session key, or `undefined` when not found.
   * Implementations must normalize the key before lookup.
   */
  read(sessionKey: string): SessionEntry | undefined;

  /**
   * Persist `entry` under `sessionKey`, replacing any previous value.
   * Implementations must normalize the key before writing.
   */
  write(sessionKey: string, entry: SessionEntry): Promise<void>;

  /**
   * Return every session key currently held in the store.
   * The returned keys are in no guaranteed order.
   */
  listKeys(): string[];

  /**
   * Remove the entry for `sessionKey` from the store.
   * A no-op when the key does not exist.
   */
  delete(sessionKey: string): Promise<void>;
}

/**
 * Factory signature for constructing a `SessionStore` bound to a specific
 * on-disk path (or equivalent connection string for non-file backends).
 */
export type SessionStoreFactory = (storePath: string) => SessionStore;

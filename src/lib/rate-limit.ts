/**
 * In-memory rate limiter (MVP).
 * In produzione sostituire con @upstash/ratelimit + Redis serverless.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  /** Max richieste consentite nella finestra temporale */
  limit: number;
  /** Durata della finestra in millisecondi */
  windowMs: number;
}

/**
 * Controlla se la chiave (es. IP) ha superato il rate limit.
 * Ritorna `true` se il limite è stato superato.
 */
export function isRateLimited(key: string, opts: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > opts.windowMs) {
    // Nuova finestra
    store.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  if (entry.count > opts.limit) {
    return true;
  }

  return false;
}

// Pulizia periodica per evitare memory leak in processi long-running
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > 60 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

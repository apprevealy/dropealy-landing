import { couponFromSearch, fetchPublishedPromo, normalizeCoupon, PromoCreatorError, validatePublishedPromo } from './promoCreator.mjs';

// This is a single document's public startup request, never a persistent offer cache.
const BOOTSTRAP_KEY = '__DROPEALY_PROMO_BOOTSTRAP__';
const MAX_STARTUP_AGE_MS = 15_000;

function startupRecord(slug, pathname, coupon, {
  windowObject = globalThis.window,
  now = Date.now(),
} = {}) {
  const record = windowObject?.[BOOTSTRAP_KEY];
  if (!record || record.version !== 1 || record.consumed === true ||
      record.slug !== slug || record.pathname !== pathname || !normalizeCoupon(coupon) ||
      record.coupon !== normalizeCoupon(coupon) ||
      !Number.isFinite(record.startedAt) || now < record.startedAt || now - record.startedAt > MAX_STARTUP_AGE_MS ||
      !['pending', 'settled'].includes(record.status) || typeof record.promise?.then !== 'function') return null;
  // A request from before a route/coupon change cannot initialize the new page.
  if (windowObject?.location?.pathname !== pathname || couponFromSearch(windowObject?.location?.search) !== record.coupon) return null;
  return record;
}

function validatedOutcome(record, outcome, slug) {
  if (!outcome || outcome.ok !== true) {
    throw new PromoCreatorError(outcome?.code === 'not_found' ? 'not_found' : 'unavailable', 'Planos temporariamente indisponíveis.');
  }
  return { data: validatePublishedPromo(outcome.data, slug), bootstrap: record };
}

/** When the head request completed before React, use its validated result on the first paint. */
export function initialPromoSnapshot(slug, pathname, coupon, options) {
  const record = startupRecord(slug, pathname, coupon, options);
  if (record?.status !== 'settled') return null;
  try { return validatedOutcome(record, record.outcome, slug); } catch { return null; }
}

export function consumeInitialPromo(record) {
  if (record) record.consumed = true;
}

/** Leaving the original route/coupon intent permanently discards its startup response. */
export function discardPreviousInitialPromo(windowObject = globalThis.window) {
  const record = windowObject?.[BOOTSTRAP_KEY];
  if (record && (windowObject?.location?.pathname !== record.pathname ||
      couponFromSearch(windowObject?.location?.search) !== record.coupon)) consumeInitialPromo(record);
}

async function waitForStartup(record, signal) {
  if (signal?.aborted) throw new DOMException('Consulta cancelada.', 'AbortError');
  if (!signal) return record.promise;
  let cancel;
  const aborted = new Promise((_, reject) => {
    cancel = () => reject(new DOMException('Consulta cancelada.', 'AbortError'));
    signal.addEventListener('abort', cancel, { once: true });
  });
  // A StrictMode effect cleanup cancels only its own subscriber, not the shared head request.
  try { return await Promise.race([record.promise, aborted]); }
  finally { signal.removeEventListener('abort', cancel); }
}

/** Only initial mount can reuse this request. Checkout and periodic revalidation stay fresh. */
export async function fetchInitialPromo(slug, { pathname, coupon, signal, ...options } = {}) {
  const record = startupRecord(slug, pathname, coupon, options);
  if (!record) return { data: await fetchPublishedPromo(slug, { signal, ...options }), bootstrap: null };
  try {
    const outcome = await waitForStartup(record, signal);
    if (signal?.aborted) throw new DOMException('Consulta cancelada.', 'AbortError');
    return validatedOutcome(record, outcome, slug);
  } catch (error) {
    // A failed/invalid response is terminal for this startup attempt; a new mount can retry.
    if (!signal?.aborted) consumeInitialPromo(record);
    throw error;
  }
}

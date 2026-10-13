import { COMMERCIAL_PLANS } from './commercialPlans.mjs';

// Consulta somente a configuração pública aprovada; nunca usa checkout alternativo.
export const PROMO_API = 'https://app.dropealy.com/api/public/promo-creator';
export const NORMAL_PRICES = Object.freeze({ trial: COMMERCIAL_PLANS.trial.priceCents, master: COMMERCIAL_PLANS.master.priceCents });
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHECKOUT = /^https:\/\/(?:checkout\.perfectpay\.com\.br|checkout\.centerpag\.com)\/pay\/[A-Za-z0-9_-]+\/?(?:\?[\x21-\x22\x24-\x5b\x5d-\x7e]*)?$/;

export class PromoCreatorError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PromoCreatorError';
    this.code = code;
  }
}

export function isValidSlug(slug) {
  return typeof slug === 'string' && slug.length >= 3 && slug.length <= 60 && SLUG.test(slug);
}

export function isAllowedCheckout(value) {
  return typeof value === 'string' && value.length <= 2048 && CHECKOUT.test(value);
}

export function normalizeCoupon(value) {
  if (typeof value !== 'string') return '';
  const normalized = value.trim().toUpperCase();
  return normalized.length <= 128 ? normalized : '';
}

function isDiscountPrice(value, normal) {
  return Number.isSafeInteger(value) && value > 0 && value < normal;
}

function completeDiscount(offer, coupon) {
  const discount = offer?.discount;
  return Boolean(normalizeCoupon(coupon) && discount?.ready === true &&
    isDiscountPrice(discount.trial_cents, NORMAL_PRICES.trial) &&
    isDiscountPrice(discount.master_cents, NORMAL_PRICES.master) &&
    isAllowedCheckout(discount.checkout?.trial) && isAllowedCheckout(discount.checkout?.master));
}

function validateOffer(offer, coupon) {
  const discount = offer?.discount;
  if (!['standard', 'coupon'].includes(offer?.mode) || typeof offer.coupon_enabled !== 'boolean' ||
      offer.normal?.trial_cents !== NORMAL_PRICES.trial || offer.normal?.master_cents !== NORMAL_PRICES.master ||
      typeof discount?.ready !== 'boolean' ||
      !(discount.trial_cents === null || isDiscountPrice(discount.trial_cents, NORMAL_PRICES.trial)) ||
      !(discount.master_cents === null || isDiscountPrice(discount.master_cents, NORMAL_PRICES.master)) ||
      !(discount.checkout?.trial === null || isAllowedCheckout(discount.checkout?.trial)) ||
      !(discount.checkout?.master === null || isAllowedCheckout(discount.checkout?.master)) ||
      (discount.ready && !completeDiscount(offer, coupon))) {
    throw new PromoCreatorError('invalid_response', 'Configuração publicada inválida.');
  }
  return {
    mode: offer.mode, coupon_enabled: offer.coupon_enabled,
    normal: { trial_cents: NORMAL_PRICES.trial, master_cents: NORMAL_PRICES.master },
    discount: {
      ready: discount.ready, trial_cents: discount.trial_cents, master_cents: discount.master_cents,
      checkout: { trial: discount.checkout.trial, master: discount.checkout.master },
    },
  };
}

/** An old coupon identifier alone never enables a promotional offer. */
export function couponIsAvailable(data) {
  return data?.offer?.mode === 'coupon' && data.offer.coupon_enabled === true && completeDiscount(data.offer, data.coupon);
}

export function couponMatches(data, input) {
  return couponIsAvailable(data) && Boolean(normalizeCoupon(input)) && normalizeCoupon(input) === normalizeCoupon(data.coupon);
}

/** All approved configuration participates, including permission changes without a version bump. */
export function promoRevision(data) {
  return JSON.stringify({ slug: data?.slug, version: data?.version, checkout: data?.checkout,
    coupon: data?.coupon, offer: data?.offer ?? null });
}

export function validatePublishedPromo(data, slug) {
  const links = data?.checkout;
  if (!isValidSlug(slug) || data?.slug !== slug || data.status !== 'published' ||
      !Number.isSafeInteger(data.version) || data.version < 1 ||
      !isAllowedCheckout(links?.starter) || !isAllowedCheckout(links?.master) ||
      !(links?.trial === null || isAllowedCheckout(links?.trial)) ||
      !(data.coupon === null || typeof data.coupon === 'string')) {
    throw new PromoCreatorError('invalid_response', 'Configuração publicada inválida.');
  }
  // Não normalizar URLs nem acrescentar cupom: preserve a atribuição do parceiro.
  const result = {
    slug: data.slug,
    version: data.version,
    status: 'published',
    checkout: { starter: links.starter, trial: links.trial, master: links.master },
    coupon: data.coupon,
  };
  // Legacy responses retain their shape and always use the standard offer.
  if (Object.hasOwn(data, 'offer')) result.offer = validateOffer(data.offer, data.coupon);
  return result;
}

/** Consulta pública sem credenciais. signal permite cancelar ao mudar de página. */
export async function fetchPublishedPromo(slug, {
  signal,
  timeoutMs = 8000,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!isValidSlug(slug)) {
    throw new PromoCreatorError('not_found', 'Página indisponível.');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || typeof fetchImpl !== 'function') {
    throw new TypeError('Configuração de consulta inválida.');
  }
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  else signal?.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(cancel, timeoutMs);
  try {
    if (controller.signal.aborted) throw new DOMException('Consulta cancelada.', 'AbortError');
    const response = await fetchImpl(`${PROMO_API}/${encodeURIComponent(slug)}`, {
      method: 'GET', headers: { Accept: 'application/json' },
      credentials: 'omit', cache: 'no-store', redirect: 'error', signal: controller.signal,
    });
    if (response.status === 404) throw new PromoCreatorError('not_found', 'Página indisponível.');
    if (!response.ok || response.status !== 200) {
      throw new PromoCreatorError('unavailable', 'Planos temporariamente indisponíveis.');
    }
    const data = await response.json();
    if (controller.signal.aborted) throw new DOMException('Consulta cancelada.', 'AbortError');
    return validatePublishedPromo(data, slug);
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Consulta cancelada.', 'AbortError');
    if (error instanceof PromoCreatorError) throw error;
    throw new PromoCreatorError('unavailable', 'Planos temporariamente indisponíveis.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

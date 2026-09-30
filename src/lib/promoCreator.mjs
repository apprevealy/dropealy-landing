// Consulta somente a configuração pública aprovada; nunca usa checkout alternativo.
export const PROMO_API = 'https://app.dropealy.com/api/public/promo-creator';
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
  return {
    slug: data.slug,
    version: data.version,
    status: 'published',
    checkout: { starter: links.starter, trial: links.trial, master: links.master },
    coupon: data.coupon,
  };
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

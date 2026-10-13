import { couponIsAvailable, isValidSlug, NORMAL_PRICES, promoRevision } from './promoCreator.mjs';

export const RESERVED_ROUTES = new Set([
  'api', 'assets', 'monitor', 'admin', 'login', 'logout', 'suporte',
  'termos', 'privacidade', 'index', 'favicon',
]);

export function checkoutRoute(pathname) {
  if (pathname === '/') return { kind: 'home', slug: null };
  const match = typeof pathname === 'string' && pathname.match(/^\/([^/]+)\/?$/);
  const slug = match && match[1];
  if (!isValidSlug(slug) || RESERVED_ROUTES.has(slug)) {
    return { kind: 'unavailable', slug: null };
  }
  return { kind: 'partner', slug };
}

export function checkoutMessage(state) {
  if (state.status === 'loading') return 'Carregando os planos desta página...';
  if (state.status === 'not_found') return 'Página indisponível ou ainda não aprovada.';
  if (state.status === 'error') return 'Planos temporariamente indisponíveis. Atualize a página para tentar novamente.';
  if (state.checking) return 'Conferindo os planos desta página...';
  return state.notice || '';
}

export function hasAppliedCoupon(state) {
  return state.route.kind === 'partner' && state.status === 'ready' && state.data?.slug === state.route.slug &&
    couponIsAvailable(state.data) && state.couponAppliedRevision === promoRevision(state.data);
}

export function publicPrices(state) {
  return hasAppliedCoupon(state)
    ? { trial: state.data.offer.discount.trial_cents, master: state.data.offer.discount.master_cents }
    : NORMAL_PRICES;
}

// O destino original só existe na página inicial; nunca é fallback de um parceiro.
export function checkoutProps(state, plan, originalHref) {
  if (!['starter', 'trial', 'master'].includes(plan)) throw new TypeError('Plano desconhecido.');
  const home = state.route.kind === 'home';
  const ready = state.route.kind === 'partner' && state.status === 'ready' && !state.checking &&
    state.data?.slug === state.route.slug;
  const links = hasAppliedCoupon(state) ? state.data.offer.discount.checkout : state.data?.checkout;
  const href = home ? originalHref : ready ? links?.[plan] ?? undefined : undefined;
  const disabled = !href;
  return {
    href,
    'data-checkout-plan': plan,
    'aria-disabled': disabled ? true : undefined,
    tabIndex: disabled ? -1 : undefined,
    title: disabled ? checkoutMessage(state) || 'Este plano está indisponível nesta página.' : undefined,
    onClick: disabled ? event => event.preventDefault() : undefined,
    onAuxClick: disabled ? event => event.preventDefault() : undefined,
  };
}

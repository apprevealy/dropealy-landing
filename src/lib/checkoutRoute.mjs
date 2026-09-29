import { isValidSlug } from './promoCreator.mjs';

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
  return '';
}

// O destino original só existe na página inicial; nunca é fallback de um parceiro.
export function checkoutProps(state, plan, originalHref) {
  if (!['starter', 'trial', 'master'].includes(plan)) throw new TypeError('Plano desconhecido.');
  const home = state.route.kind === 'home';
  const ready = state.route.kind === 'partner' && state.status === 'ready' &&
    state.data?.slug === state.route.slug;
  const href = home ? originalHref : ready ? state.data.checkout[plan] ?? undefined : undefined;
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

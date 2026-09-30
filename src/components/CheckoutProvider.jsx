import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react'
import { fetchPublishedPromo } from '../lib/promoCreator.mjs'
import { checkoutMessage, checkoutProps, checkoutRoute } from '../lib/checkoutRoute.mjs'

export const CheckoutContext = createContext(null)
const LOCATION_EVENT = 'dropealy:location-change'

// A navegação atual usa links normais. Também cobre voltar/avançar e History API.
function subscribeLocation(notify) {
  const originalPush = window.history.pushState
  const originalReplace = window.history.replaceState
  const wrap = original => function (...args) {
    const result = original.apply(this, args)
    window.dispatchEvent(new Event(LOCATION_EVENT))
    return result
  }
  const push = wrap(originalPush)
  const replace = wrap(originalReplace)
  window.history.pushState = push
  window.history.replaceState = replace
  window.addEventListener('popstate', notify)
  window.addEventListener(LOCATION_EVENT, notify)
  return () => {
    window.removeEventListener('popstate', notify)
    window.removeEventListener(LOCATION_EVENT, notify)
    if (window.history.pushState === push) window.history.pushState = originalPush
    if (window.history.replaceState === replace) window.history.replaceState = originalReplace
  }
}
const getPathname = () => window.location.pathname
const getServerPathname = () => '/'

export function CheckoutProvider({ children }) {
  const pathname = useSyncExternalStore(subscribeLocation, getPathname, getServerPathname)
  return <CheckoutSession key={pathname} pathname={pathname}>{children}</CheckoutSession>
}

function CheckoutSession({ pathname, children }) {
  const route = checkoutRoute(pathname)
  const [result, setResult] = useState(null)
  useEffect(() => {
    if (route.kind !== 'partner') return undefined
    const controller = new AbortController()
    let current = true
    setResult({ slug: route.slug, status: 'loading', data: null })
    fetchPublishedPromo(route.slug, { signal: controller.signal }).then(
      data => { if (current) setResult({ slug: route.slug, status: 'ready', data }) },
      error => {
        if (current) setResult({ slug: route.slug, status: error.code === 'not_found' ? 'not_found' : 'error', data: null })
      },
    )
    return () => { current = false; controller.abort() }
  }, [route.kind, route.slug])
  // A resposta de A nunca fica utilizável em B, nem antes da limpeza do efeito.
  const state = route.kind === 'home'
    ? { route, status: 'home', data: null }
    : route.kind !== 'partner'
      ? { route, status: 'not_found', data: null }
      : result?.slug === route.slug
        ? { route, status: result.status, data: result.data }
        : { route, status: 'loading', data: null }
  return <CheckoutContext.Provider value={state}>{children}</CheckoutContext.Provider>
}

export function useCheckout() {
  const state = useContext(CheckoutContext)
  if (!state) throw new Error('CheckoutProvider não configurado.')
  return (plan, originalHref) => checkoutProps(state, plan, originalHref)
}

export function CheckoutStatus() {
  const state = useContext(CheckoutContext)
  if (!state) throw new Error('CheckoutProvider não configurado.')
  const message = checkoutMessage(state)
  if (!message) return null
  // Não muda o layout aprovado quando os planos estão disponíveis.
  return <p role="status" aria-live="polite" className="text-center text-white/70">{message}</p>
}

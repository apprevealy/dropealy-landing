import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { couponEntryIsVisible, couponFromSearch, couponIsAvailable, couponMatches, fetchPublishedPromo, normalizeCoupon, NORMAL_PRICES, promoRevision } from '../lib/promoCreator.mjs'
import { checkoutMessage, checkoutProps, checkoutRoute, hasAppliedCoupon, publicMasterPayment, publicPrices } from '../lib/checkoutRoute.mjs'
import { consumeInitialPromo, discardPreviousInitialPromo, fetchInitialPromo, initialPromoSnapshot } from '../lib/initialPromo.mjs'

export const CheckoutContext = createContext(null)
const LOCATION_EVENT = 'dropealy:location-change'
const REFRESH_MS = 30_000

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
const getLocation = () => `${window.location.pathname}${window.location.search}`
const getServerLocation = () => '/'

export function CheckoutProvider({ children }) {
  const location = useSyncExternalStore(subscribeLocation, getLocation, getServerLocation)
  const separator = location.indexOf('?')
  const pathname = separator < 0 ? location : location.slice(0, separator)
  const urlCoupon = couponFromSearch(separator < 0 ? '' : location.slice(separator))
  // Tracking-only changes must not reapply a coupon the shopper removed.
  return <CheckoutSession key={`${pathname}:${urlCoupon}`} pathname={pathname} urlCoupon={urlCoupon}>{children}</CheckoutSession>
}

function CheckoutSession({ pathname, urlCoupon, children }) {
  const route = checkoutRoute(pathname)
  const [initial] = useState(() => {
    const snapshot = route.kind === 'partner' ? initialPromoSnapshot(route.slug, pathname, urlCoupon) : null
    const applied = snapshot && couponMatches(snapshot.data, urlCoupon)
    return { snapshot, applied }
  })
  const [result, setResult] = useState(() => initial.snapshot
    ? { slug: route.slug, status: 'ready', data: initial.snapshot.data, checking: false } : null)
  const [couponInput, setCouponInput] = useState(initial.applied ? normalizeCoupon(urlCoupon) : urlCoupon)
  const [couponAppliedRevision, setCouponAppliedRevision] = useState(initial.applied ? promoRevision(initial.snapshot.data) : null)
  const [couponMessage, setCouponMessage] = useState(initial.applied ? 'Cupom aplicado.' : '')
  const [notice, setNotice] = useState(() => initial.snapshot && urlCoupon && !initial.applied && couponEntryIsVisible(initial.snapshot.data)
    ? couponIsAvailable(initial.snapshot.data)
      ? 'O cupom informado não é válido para esta página. Os valores normais foram mantidos.'
      : 'O cupom não está disponível nesta página. Os valores normais foram mantidos.' : '')
  const active = useRef(false)
  const resultRef = useRef(result)
  const appliedRef = useRef(couponAppliedRevision)
  const startupComplete = useRef(Boolean(initial.snapshot))
  const editRevision = useRef(0)
  const request = useRef(null)
  const sequence = useRef(0)
  const actionPending = useRef(false)
  const urlCouponHandled = useRef(Boolean(initial.snapshot))

  const resetApplied = useCallback(() => {
    appliedRef.current = null
    setCouponAppliedRevision(null)
  }, [])

  const refresh = useCallback(async () => {
    if (route.kind !== 'partner' || !active.current) return null
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    const id = ++sequence.current
    const previous = resultRef.current
    const pending = { slug: route.slug, status: previous?.status === 'ready' ? 'ready' : 'loading',
      data: previous?.status === 'ready' ? previous.data : null, checking: true }
    resultRef.current = pending
    setResult(pending)
    try {
      const loaded = startupComplete.current
        ? { data: await fetchPublishedPromo(route.slug, { signal: controller.signal }), bootstrap: null }
        : await fetchInitialPromo(route.slug, { pathname, coupon: urlCoupon, signal: controller.signal })
      const data = loaded.data
      if (!active.current || id !== sequence.current || controller.signal.aborted) return null
      startupComplete.current = true
      consumeInitialPromo(loaded.bootstrap)
      if (previous?.data && promoRevision(previous.data) !== promoRevision(data)) {
        const wasApplied = appliedRef.current !== null
        resetApplied()
        // Revoke an old applied offer, but do not erase a code the shopper is still typing.
        if (wasApplied) {
          editRevision.current++
          setCouponInput('')
        }
        setCouponMessage('')
        setNotice('Os planos foram atualizados. Confira os valores antes de continuar.')
      }
      const next = { slug: route.slug, status: 'ready', data, checking: false }
      // A URL can select only this page's approved offer, once per explicit intent.
      if (!urlCouponHandled.current) {
        urlCouponHandled.current = true
        if (couponMatches(data, urlCoupon)) {
          const revision = promoRevision(data)
          appliedRef.current = revision
          setCouponAppliedRevision(revision)
          setCouponInput(normalizeCoupon(urlCoupon))
          setCouponMessage('Cupom aplicado.')
          setNotice('')
        } else if (urlCoupon && couponEntryIsVisible(data)) {
          setNotice(couponIsAvailable(data)
            ? 'O cupom informado não é válido para esta página. Os valores normais foram mantidos.'
            : 'O cupom não está disponível nesta página. Os valores normais foram mantidos.')
        }
      }
      resultRef.current = next
      setResult(next)
      return data
    } catch (error) {
      if (!active.current || id !== sequence.current || controller.signal.aborted) return null
      startupComplete.current = true
      resetApplied()
      setCouponMessage('')
      const failed = { slug: route.slug, status: error.code === 'not_found' ? 'not_found' : 'error', data: null, checking: false }
      resultRef.current = failed
      setResult(failed)
      return null
    } finally {
      if (request.current === controller) request.current = null
    }
  }, [route.kind, route.slug, pathname, resetApplied, urlCoupon])

  useEffect(() => {
    active.current = true
    if (route.kind !== 'partner') return () => { active.current = false }
    const revalidate = () => {
      if (!document.hidden && !actionPending.current && !request.current) void refresh()
    }
    if (initial.snapshot) consumeInitialPromo(initial.snapshot.bootstrap)
    else void refresh()
    window.addEventListener('focus', revalidate)
    document.addEventListener('visibilitychange', revalidate)
    const interval = window.setInterval(revalidate, REFRESH_MS)
    return () => {
      active.current = false
      sequence.current++
      request.current?.abort()
      discardPreviousInitialPromo()
      window.clearInterval(interval)
      window.removeEventListener('focus', revalidate)
      document.removeEventListener('visibilitychange', revalidate)
    }
  }, [route.kind, refresh, initial])

  const editCoupon = value => {
    urlCouponHandled.current = true
    editRevision.current++
    resetApplied()
    setCouponInput(value)
    setCouponMessage('')
    setNotice('')
  }

  const applyCoupon = async event => {
    event.preventDefault()
    if (actionPending.current) return
    actionPending.current = true
    const edited = editRevision.current
    const input = couponInput
    setCouponMessage('')
    try {
      const data = await refresh()
      if (!data || !active.current || edited !== editRevision.current) return
      if (couponMatches(data, input)) {
        const revision = promoRevision(data)
        appliedRef.current = revision
        setCouponAppliedRevision(revision)
        setCouponInput(normalizeCoupon(input))
        setCouponMessage('Cupom aplicado.')
        setNotice('')
      } else {
        resetApplied()
        setCouponMessage(couponIsAvailable(data) ? 'Este cupom não é válido para esta página.' : 'O cupom não está disponível nesta página.')
      }
    } finally { actionPending.current = false }
  }

  const navigate = async (event, plan, originalHref) => {
    if (event.type === 'auxclick' && event.button !== 1) return
    event.preventDefault()
    if (actionPending.current || resultRef.current?.checking) return
    actionPending.current = true
    const applied = appliedRef.current
    // Open synchronously so mobile browsers can retain the requested new tab.
    let tab = null
    try {
      tab = window.open('about:blank', '_blank')
      if (tab) {
        tab.opener = null
        tab.document.title = 'Dropealy — Conferindo plano'
        tab.document.body.textContent = 'Conferindo o plano escolhido…'
        const referrer = tab.document.createElement('meta')
        referrer.name = 'referrer'
        referrer.content = 'no-referrer'
        tab.document.head.appendChild(referrer)
      }
      const data = await refresh()
      if (!data || !active.current) { tab?.close(); return }
      const current = { route, status: 'ready', data, couponAppliedRevision: appliedRef.current }
      // Never silently send a shopper expecting a discount to a full-price offer.
      if (applied && !hasAppliedCoupon(current)) {
        tab?.close()
        setNotice('Os planos foram atualizados. Confira os valores antes de continuar.')
        return
      }
      const href = checkoutProps(current, plan, originalHref).href
      if (!href) { tab?.close(); return }
      if (tab) tab.location.replace(href)
      else window.location.assign(href)
    } catch {
      tab?.close()
      if (active.current) setNotice('Não foi possível abrir o plano. Tente novamente.')
    } finally { actionPending.current = false }
  }

  // A resposta de A nunca fica utilizável em B, nem antes da limpeza do efeito.
  const state = route.kind === 'home'
    ? { route, status: 'home', data: null }
    : route.kind !== 'partner'
      ? { route, status: 'not_found', data: null }
      : result?.slug === route.slug
        ? { route, status: result.status, data: result.data, checking: result.checking }
        : { route, status: 'loading', data: null }
  const initialCouponPending = state.route.kind === 'partner' && Boolean(urlCoupon) && state.status === 'loading'
  const value = { ...state, couponInput, couponAppliedRevision, couponMessage, notice, editCoupon, applyCoupon, navigate, initialCouponPending }
  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

export function useCheckout() {
  const state = useContext(CheckoutContext)
  if (!state) throw new Error('CheckoutProvider não configurado.')
  return (plan, originalHref) => {
    const props = checkoutProps(state, plan, originalHref)
    if (props.href && state.route.kind === 'partner' && state.navigate) {
      props.onClick = event => void state.navigate(event, plan, originalHref)
      props.onAuxClick = event => void state.navigate(event, plan, originalHref)
    }
    return props
  }
}

export function usePricing() {
  const state = useContext(CheckoutContext)
  if (!state) throw new Error('CheckoutProvider não configurado.')
  return { prices: publicPrices(state), normalPrices: NORMAL_PRICES, couponApplied: hasAppliedCoupon(state), masterPayment: publicMasterPayment(state), initialCouponPending: Boolean(state.initialCouponPending) }
}

export function CouponControl() {
  const state = useContext(CheckoutContext)
  if (!state) throw new Error('CheckoutProvider não configurado.')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const applied = hasAppliedCoupon(state)
  const showInput = open || applied || Boolean(state.couponInput)
  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true })
  }, [open])
  if (state.route.kind !== 'partner' || state.status !== 'ready' || !couponEntryIsVisible(state.data)) return null
  const available = couponIsAvailable(state.data)
  const message = !available
    ? 'O cupom desta página ainda não está ativo. Os valores sem desconto continuam disponíveis.'
    : applied ? '' : state.couponMessage
  return (
    <div className="coupon-entry">
      {!showInput ? <button type="button" className="coupon-entry__toggle" aria-expanded={false} aria-controls="dropealy-coupon-panel" onClick={() => setOpen(true)}>
        TEM UM CUPOM OU INDICAÇÃO?
      </button> : null}
      <form id="dropealy-coupon-panel" className="coupon-control" hidden={!showInput} onSubmit={state.applyCoupon}>
        <label className="sr-only" htmlFor="dropealy-coupon">Cupom de indicação</label>
        <div className="coupon-control__fields">
          <input ref={inputRef} id="dropealy-coupon" name="coupon" type="text" value={state.couponInput || ''} maxLength={30}
            placeholder="Digite seu cupom" autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-describedby={applied ? 'dropealy-coupon-gift' : 'dropealy-coupon-message'}
            onChange={event => state.editCoupon(event.target.value)} />
          <button type="submit" disabled={state.checking || !state.couponInput?.trim()}>APLICAR</button>
        </div>
        <p id="dropealy-coupon-message" role="status" aria-live="polite" className={message ? 'coupon-control__message' : 'sr-only'}>{message}</p>
        {applied ? <div id="dropealy-coupon-gift" className="coupon-entry__gift coupon-gift-card" role="status" aria-live="polite">
          <div className="coupon-gift-icon" aria-hidden="true">
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none"><path d="M20 12v9H4v-9M2 7h20v5H2V7ZM12 7v14M12 7H7.5A2.5 2.5 0 1 1 10 4.5L12 7Zm0 0h4.5A2.5 2.5 0 1 0 14 4.5L12 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <span>Cupom presente aplicado</span>
            <strong>{normalizeCoupon(state.data.coupon)}</strong>
            <p>Seu Cupom Presente Dropealy liberou <b>valores com desconto</b> nos planos abaixo. Escolha seu plano para continuar.</p>
          </div>
        </div> : null}
      </form>
      {applied ? <a className="coupon-applied-bar" href="#planos" aria-label={`Cupom ${normalizeCoupon(state.data.coupon)} aplicado. Ver planos.`}>
        <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="coupon-applied-bar__label">Seu cupom</span>
        <strong className="coupon-applied-bar__code">{normalizeCoupon(state.data.coupon)}</strong>
        <span className="coupon-applied-bar__status">APLICADO</span>
      </a> : null}
    </div>
  )
}

export function CheckoutStatus() {
  const state = useContext(CheckoutContext)
  if (!state) throw new Error('CheckoutProvider não configurado.')
  const message = checkoutMessage(state)
  if (!message) return null
  return <p role="status" aria-live="polite" className="text-center text-white/70">{message}</p>
}


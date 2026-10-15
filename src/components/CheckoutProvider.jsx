import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { couponIsAvailable, couponMatches, fetchPublishedPromo, normalizeCoupon, NORMAL_PRICES, promoRevision } from '../lib/promoCreator.mjs'
import { checkoutMessage, checkoutProps, checkoutRoute, hasAppliedCoupon, publicPrices } from '../lib/checkoutRoute.mjs'

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
const getPathname = () => window.location.pathname
const getServerPathname = () => '/'

export function CheckoutProvider({ children }) {
  const pathname = useSyncExternalStore(subscribeLocation, getPathname, getServerPathname)
  return <CheckoutSession key={pathname} pathname={pathname}>{children}</CheckoutSession>
}

function CheckoutSession({ pathname, children }) {
  const route = checkoutRoute(pathname)
  const [result, setResult] = useState(null)
  const [couponInput, setCouponInput] = useState(() => {
    if (typeof window === 'undefined') return ''
    const query = new URLSearchParams(window.location.search)
    return (query.get('cupom') || query.get('coupon') || query.get('coupon_code') || '').slice(0, 128)
  })
  const [couponAppliedRevision, setCouponAppliedRevision] = useState(null)
  const [couponMessage, setCouponMessage] = useState('')
  const [notice, setNotice] = useState('')
  const active = useRef(false)
  const resultRef = useRef(null)
  const appliedRef = useRef(null)
  const editRevision = useRef(0)
  const request = useRef(null)
  const sequence = useRef(0)
  const actionPending = useRef(false)

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
      const data = await fetchPublishedPromo(route.slug, { signal: controller.signal })
      if (!active.current || id !== sequence.current || controller.signal.aborted) return null
      if (previous?.data && promoRevision(previous.data) !== promoRevision(data)) {
        resetApplied()
        editRevision.current++
        setCouponInput('')
        setCouponMessage('')
        setNotice('Os planos foram atualizados. Confira os valores antes de continuar.')
      }
      const next = { slug: route.slug, status: 'ready', data, checking: false }
      resultRef.current = next
      setResult(next)
      return data
    } catch (error) {
      if (!active.current || id !== sequence.current || controller.signal.aborted) return null
      resetApplied()
      const failed = { slug: route.slug, status: error.code === 'not_found' ? 'not_found' : 'error', data: null, checking: false }
      resultRef.current = failed
      setResult(failed)
      return null
    } finally {
      if (request.current === controller) request.current = null
    }
  }, [route.kind, route.slug, resetApplied])

  useEffect(() => {
    active.current = true
    if (route.kind !== 'partner') return () => { active.current = false }
    const revalidate = () => {
      if (!document.hidden && !actionPending.current && !request.current) void refresh()
    }
    void refresh()
    window.addEventListener('focus', revalidate)
    document.addEventListener('visibilitychange', revalidate)
    const interval = window.setInterval(revalidate, REFRESH_MS)
    return () => {
      active.current = false
      sequence.current++
      request.current?.abort()
      window.clearInterval(interval)
      window.removeEventListener('focus', revalidate)
      document.removeEventListener('visibilitychange', revalidate)
    }
  }, [route.kind, refresh])

  const editCoupon = value => {
    editRevision.current++
    resetApplied()
    setCouponInput(value)
    setCouponMessage('')
    setNotice('')
  }

  const applyCoupon = async event => {
    event.preventDefault()
    if (actionPending.current || !couponIsAvailable(resultRef.current?.data)) return
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
  const value = { ...state, couponInput, couponAppliedRevision, couponMessage, notice, editCoupon, applyCoupon, navigate }
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
  return { prices: publicPrices(state), normalPrices: NORMAL_PRICES, couponApplied: hasAppliedCoupon(state) }
}

function PublishedCouponCode({ code, checking }) {
  const [copyStatus, setCopyStatus] = useState('idle')
  const copyCode = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard indisponível')
      await navigator.clipboard.writeText(code)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('error')
    }
  }
  return (
    <div className="coupon-control__promotion">
      <div className="coupon-control__promotion-heading">
        <div>
          <span className="coupon-control__eyebrow">Cupom promocional</span>
          <code className="coupon-control__code">{code}</code>
        </div>
        <button type="button" className="coupon-control__copy" onClick={() => void copyCode()} disabled={checking}>
          {copyStatus === 'copied' ? 'Copiado!' : 'Copiar cupom'}
        </button>
      </div>
      <p className="coupon-control__copy-message" role="status" aria-live="polite">
        {copyStatus === 'copied' ? 'Cupom copiado. Cole no campo abaixo e clique em Aplicar cupom.'
          : copyStatus === 'error' ? 'Não foi possível copiar. Selecione o código acima e copie manualmente.'
            : 'Copie o código e aplique abaixo para ver os valores promocionais.'}
      </p>
    </div>
  )
}

export function CouponControl() {
  const state = useContext(CheckoutContext)
  if (!state) throw new Error('CheckoutProvider não configurado.')
  if (state.route.kind !== 'partner' || state.status !== 'ready' || !couponIsAvailable(state.data)) return null
  return (
    <form className="coupon-control" onSubmit={state.applyCoupon}>
      <PublishedCouponCode key={promoRevision(state.data)} code={normalizeCoupon(state.data.coupon)} checking={state.checking} />
      <label htmlFor="dropealy-coupon">Tem um cupom?</label>
      <div className="coupon-control__fields">
        <input id="dropealy-coupon" name="coupon" type="text" value={state.couponInput || ''} maxLength={128}
          placeholder="Digite seu cupom" autoComplete="off" spellCheck={false} aria-describedby="dropealy-coupon-message"
          disabled={state.checking} onChange={event => state.editCoupon(event.target.value)} />
        <button type="submit" disabled={state.checking || !state.couponInput?.trim()}>Aplicar cupom</button>
        {state.couponInput || hasAppliedCoupon(state) ? <button type="button" className="coupon-control__clear" onClick={() => state.editCoupon('')} disabled={state.checking}>Remover</button> : null}
      </div>
      <p id="dropealy-coupon-message" role="status" aria-live="polite">{state.couponMessage || (hasAppliedCoupon(state) ? 'Cupom aplicado.' : 'O desconto será exibido após aplicar um cupom válido.')}</p>
    </form>
  )
}

export function CheckoutStatus() {
  const state = useContext(CheckoutContext)
  if (!state) throw new Error('CheckoutProvider não configurado.')
  const message = checkoutMessage(state)
  if (!message) return null
  return <p role="status" aria-live="polite" className="text-center text-white/70">{message}</p>
}

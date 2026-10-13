'use client'

import { useState, useEffect, useRef } from 'react'
import { useCheckout, usePricing, CouponControl, CheckoutStatus } from './CheckoutProvider'
import { COMMERCIAL_PLANS, MASTER_INSTALLMENT_TOTAL_CENTS, commercialPrice } from '../lib/commercialPlans.mjs'

function PlanFeatures({ features }) {
  return (
    <ul>
      {features.map(({ label, icon }) => (
        <li key={label}>
          {icon && (
            <img className="pricing-card__feature-icon" src={`/assets/${icon}-icon.svg`} alt="" aria-hidden="true" width="20" height="20" />
          )}
          <span className="pricing-card__feature-label">{label}</span>
        </li>
      ))}
    </ul>
  )
}

function GiftIcon() {
  return (
    <svg className="arsenal-bonus__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7h-2.18A3 3 0 0 0 12 5.94 3 3 0 0 0 6.18 7H4a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h1v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7h1a1 1 0 0 0 1-1V9a2 2 0 0 0-2-2ZM9 4a1 1 0 0 1 1 1v2H9a1.5 1.5 0 1 1 0-3Zm5 1a1 1 0 1 1 1 1.5H14V5Zm-9 6V9h6v2H5Zm1 2h5v6H6v-6Zm12 6h-5v-6h5v6Zm2-8h-7V9h7v2Z" />
    </svg>
  )
}

function CrownIcon() {
  return (
    <svg className="arsenal-anchor__crown" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3.25 7.1 4.1 3.25 3.58-5.7a1.25 1.25 0 0 1 2.14 0l3.58 5.7 4.1-3.25a1 1 0 0 1 1.58.97l-1.5 9.18H3.17l-1.5-9.18a1 1 0 0 1 1.58-.97ZM4 19h16a1 1 0 1 1 0 2H4a1 1 0 1 1 0-2Z" />
    </svg>
  )
}

export default function Features() {
  const getCheckoutProps = useCheckout()
  const { prices, normalPrices, couponApplied } = usePricing()
  const [openIndex, setOpenIndex] = useState(-1)
  const [currentStep, setCurrentStep] = useState(0)
  const [deliveryCardIndex, setDeliveryCardIndex] = useState(0)
  const deliveryCarouselRef = useRef(null)

  const steps = [
    {
      id: 'ugc-creator',
      number: '01',
      shortTitle: 'Catálogo de produtos',
      eyebrow: 'Catálogo de produtos',
      title: 'Encontre o próximo produto da sua loja.',
      description: 'Explore produtos com fotos, descrições e informações técnicas reunidas para preparar seus anúncios.',
      bullets: [
        'Tudo em um lugar: fotos e detalhes do produto.',
        'Escolha com clareza: consulte preço e estoque.',
        'Pronto para preparar: selecione e avance para o anúncio.',
      ],
    },
    {
      id: 'radar-produtos',
      number: '02',
      shortTitle: 'Contas conectadas',
      eyebrow: 'Contas conectadas',
      title: 'Conecte suas contas. Centralize sua operação.',
      description: 'Organize suas contas de marketplace em um só lugar e escolha onde publicar seus produtos.',
      bullets: [
        'Tudo conectado: reúna suas contas no mesmo painel.',
        'Status à vista: acompanhe suas conexões.',
        'Destino definido: escolha a conta de cada publicação.',
      ],
    },
    {
      id: 'animacoes',
      number: '03',
      shortTitle: 'Publicação integrada',
      eyebrow: 'Publicação integrada',
      title: 'Do catálogo ao anúncio, em poucos passos.',
      description: 'Aproveite as informações do produto, revise os detalhes e publique na sua conta conectada.',
      bullets: [
        'Menos retrabalho: aproveite os dados do catálogo.',
        'Revisão antes do envio: confira os detalhes.',
        'Conta selecionada: publique no destino certo.',
      ],
    },
    {
      id: 'revealy-boost',
      number: '04',
      shortTitle: 'Gestão de anúncios',
      eyebrow: 'Gestão de anúncios',
      title: 'Seus anúncios organizados. Mais controle para vender.',
      description: 'Visualize suas publicações, acompanhe os status e saiba em qual conta cada produto está anunciado.',
      bullets: [
        'Visão centralizada: consulte suas publicações.',
        'Status claros: acompanhe a situação dos anúncios.',
        'Organização por conta: identifique onde cada produto está.',
      ],
    },
  ]

  useEffect(() => {
    if (currentStep < 2) return undefined

    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 5000)

    return () => clearTimeout(timer)
  }, [currentStep])

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length)
  }

  const goToStep = (index) => {
    setCurrentStep(index)
  }


  const faqs = [
    {
      question: 'O que é a Dropealy e quais integrações cada plano inclui?',
      answer: (
        <span className="text-left">
          A Dropealy reúne catálogo, publicação e gestão de anúncios para sua operação nos marketplaces.
          <br />
          O trimestral e o vitalício incluem integrações com Mercado Livre, Shopee e Amazon, respeitando a disponibilidade de cada marketplace.
        </span>
      ),
    },
    {
      question: 'Preciso aparecer ou gravar minha voz para usar a Revealy?',
      answer: (
        <span className="text-left">
          Não. A plataforma foi feita exatamente para quem quer vender no total anonimato. Você pode criar avatares UGC do zero e gerar a voz deles por inteligência artificial apenas colando o seu script de texto.
        </span>
      ),
    },
    {
      question: 'O uso de avatares de IA pode dar ban ou shadowban no TikTok?',
      answer: (
        <span className="text-left">
          Não. Os vídeos gerados pela Revealy simulam perfeitamente o comportamento e a estética de um conteúdo humano real (UGC). Além disso, o nosso recurso Revealy Boost trabalha estritamente dentro das diretrizes e regras do algoritmo, garantindo um crescimento orgânico e seguro para a sua conta.
        </span>
      ),
    },
    {
      question: 'Eu recebo algum modelo ou treinamento para começar?',
      answer: (
        <span className="text-left">
          O trimestral inclui a Área de Membros Exclusiva com Aulas. No vitalício, os bônus são a Área de Membros Exclusiva com Aulas, Gemini Plus e CapCut Pro.
        </span>
      ),
    },
    {
      question: 'Quanto custa cada plano?',
      answer: (
        <span className="text-left">
          Trimestral: {commercialPrice(prices.trial)} por 3 meses. Vitalício: {couponApplied ? <>{commercialPrice(prices.master)} à vista</> : <>{COMMERCIAL_PLANS.master.installmentCount}x de {commercialPrice(COMMERCIAL_PLANS.master.installmentCents)} ou {commercialPrice(prices.master)} à vista</>}, com acesso vitalício.
        </span>
      ),
    },
    {
      question: 'Qual é a duração de cada plano?',
      answer: (
        <span className="text-left">
          O plano trimestral garante acesso por 3 meses. O plano vitalício é um pagamento único, garantindo seu acesso para sempre sem nenhuma taxa de renovação.
          <br />
          Além disso, independente do plano escolhido, você conta com a nossa Garantia Blindada de 180 dias. Se em até 6 meses você decidir que a ferramenta não é para você, devolvemos todo o seu dinheiro. Risco zero para você testar!
        </span>
      ),
    },
  ]

  const deliveryCards = [
    {
      id: 'produtos-validados',
      title: <>Catálogo<br />organizado</>,
      description: <>Produtos e informações reunidos<br />para facilitar sua rotina.</>,
      items: ['Fotos e descrições', 'Dados do produto', 'Preço e estoque'],
      icon: 'bolt',
      background: 'radial-gradient(circle at 85% 8%, rgba(245,158,43,.30), transparent 42%), linear-gradient(145deg, #0c0b0e 0%, #09090b 100%)',
    },
    {
      id: 'conteudo-ia',
      title: <>Publicação<br />integrada</>,
      description: <>Prepare seu anúncio e envie para<br />a sua conta conectada.</>,
      items: ['Seleção de produto', 'Definição de preço', 'Acompanhamento do envio'],
      icon: 'code',
      reverse: true,
      background: 'radial-gradient(circle at 17% 100%, rgba(245,158,43,.36), transparent 42%), linear-gradient(145deg, #0b0b0d 0%, #09090b 100%)',
    },
    {
      id: 'escala-inteligente',
      title: <>Gestão<br />de anúncios</>,
      description: <>Veja os anúncios criados pela<br />Dropealy em um só painel.</>,
      items: ['Status de publicação', 'Conta vinculada', 'Acesso ao anúncio'],
      icon: 'chart',
      background: 'radial-gradient(circle at 7% 0%, rgba(245,158,43,.34), transparent 38%), linear-gradient(145deg, #0b0b0d 0%, #09090b 100%)',
    },
  ]

  useEffect(() => {
    const carousel = deliveryCarouselRef.current
    const mobileViewport = window.matchMedia('(max-width: 1023px)')

    if (!carousel || !mobileViewport.matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setDeliveryCardIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % deliveryCards.length
        const nextCard = carousel.children[nextIndex]

        if (nextCard) {
          const centeredPosition = nextCard.offsetLeft - (carousel.clientWidth - nextCard.clientWidth) / 2
          carousel.scrollTo({ left: centeredPosition, behavior: 'smooth' })
        }

        return nextIndex
      })
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

  const DeliveryIcon = ({ type }) => (
    <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[20px] border border-[#F59E2B]/60 bg-[#251705]/80 text-[#F59E2B] shadow-[inset_0_0_24px_rgba(245,158,43,.12)] sm:h-[78px] sm:w-[78px]">
      {type === 'bolt' ? (
        <svg width="37" height="37" viewBox="0 0 24 24" fill="none"><path d="m13 2-9 11h7l-1 9 9-12h-7l1-8Z" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : type === 'code' ? (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7V3Z" fill="currentColor" opacity=".3" /><path d="m10 11-2 2 2 2m4-4 2 2-2 2m-1-5-2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : (
        <svg width="37" height="37" viewBox="0 0 24 24" fill="none"><path d="m4 16 5-5 4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 7h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      )}
    </div>
  )

  return (
    <>
      <div className="relative w-full h-[89px] overflow-hidden opacity-70 bg-[#050208]">
        <div className="flex w-max animate-scroll-left">
          {[0, 1].map((group) => (
            <div key={group} aria-hidden={group === 1} className="flex h-[89px] min-w-[720px] items-center justify-around gap-16 px-10 sm:min-w-[960px] sm:gap-28">
              <div className="relative h-[89px] w-[116px] shrink-0 overflow-hidden" role="img" aria-label="Amazon">
                <img src="/assets/marcas.png" alt="" className="absolute left-[-212px] top-0 h-[89px] w-[1692px] max-w-none" />
              </div>
              <div className="relative h-[89px] w-[112px] shrink-0 overflow-hidden" role="img" aria-label="Shopee">
                <img src="/assets/marcas.png" alt="" className="absolute left-[-338px] top-0 h-[89px] w-[1692px] max-w-none" />
              </div>
              <div className="relative h-[89px] w-[120px] shrink-0 overflow-hidden" role="img" aria-label="Mercado Livre">
                <img src="/assets/marcas.png" alt="" className="absolute left-[-471px] top-0 h-[89px] w-[1692px] max-w-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="relative w-full bg-[#050208] px-6 py-24">
      <div className="mx-auto max-w-[1500px] text-center">
        <span
          className="inline-flex h-[53px] w-[268px] items-center justify-center rounded-full text-sm font-semibold uppercase tracking-wide text-black"
          style={{
            background: 'linear-gradient(135deg, #FFCF6E, #F59E2B)',
          }}
        >
          O que a Dropealy entrega
        </span>

        <h2 className="mt-6 font-articulat text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
          Do catálogo ao anúncio,<br />
          <span className="text-[#F5A623]">tudo em um só lugar.</span>
        </h2>

        <p className="mx-auto mt-4 max-w-3xl font-articulat text-xl text-white sm:text-2xl">
          Encontre produtos, publique no Mercado Livre e acompanhe sua operação.
        </p>
      </div>

      <div ref={deliveryCarouselRef} className="delivery-carousel mx-auto mt-16 flex w-full max-w-[1400px] snap-x snap-mandatory gap-5 overflow-x-auto px-[7vw] pb-5 sm:px-8 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {deliveryCards.map((card) => (
          <article
            key={card.id}
            className="relative flex min-h-[570px] w-[86vw] max-w-[430px] flex-none snap-center flex-col overflow-hidden rounded-[28px] border border-white/10 p-7 text-left shadow-[0_24px_80px_rgba(0,0,0,.35)] sm:min-h-[610px] sm:p-9 lg:min-h-[620px] lg:w-full lg:max-w-none"
            style={{ background: card.background }}
          >
            {card.id === 'escala-inteligente' && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] opacity-60" style={{ background: 'linear-gradient(140deg, transparent 0 28%, #3a2305 28% 38%, transparent 38% 48%, #5a3404 48% 63%, #2d1a04 63%)' }} />
            )}
            <div className="relative z-10 flex h-full flex-1 flex-col">
              <DeliveryIcon type={card.icon} />
              <div className={card.reverse ? 'order-2 mt-auto pt-9' : ''}>
                <h3 className="mt-7 font-articulat text-[43px] font-normal leading-[.94] tracking-[-.035em] text-white sm:text-[52px]">
                  {card.title}
                </h3>
                <p className="mt-5 font-articulat text-[18px] leading-[1.08] text-white/80 sm:text-[21px]">
                  {card.description}
                </p>
              </div>

              <div className={`rounded-[24px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm ${card.reverse ? 'order-1 mt-5' : 'mt-auto'}`}>
                <div className="flex flex-col gap-3">
                  {card.items.map((item, index) => (
                    <div key={item} className="flex min-h-[72px] items-center gap-4 rounded-[18px] border border-white/10 bg-black/70 px-4 sm:min-h-[80px] sm:px-5">
                      <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[15px] border border-[#F59E2B]/60 bg-[#251705]/80 font-articulat text-[28px] text-white sm:h-[58px] sm:w-[58px] sm:text-[31px]">
                        {index + 1}
                      </span>
                      <span className="font-articulat text-[17px] leading-tight text-white/90 sm:text-[20px]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-24 max-w-6xl text-center">
        <h2 className="font-manrope text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
          Sua operação de vendas,<br />
          <span className="text-[#F5A623]">do catálogo ao anúncio.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-3xl font-articulat text-base leading-relaxed text-white/75 sm:text-lg">
          A Dropealy reúne produtos, publicação no Mercado Livre e acompanhamento<br className="hidden sm:block" /> de anúncios em uma única plataforma. Mais organização para você começar<br className="hidden sm:block" /> e gerenciar sua operação.
        </p>

        <div className="video-feature-shell">
          <div className="video-feature-copy">
            <div className="video-feature-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m13.2 2-8 11h6.3L10.8 22l8-11h-6.3l.7-9Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="video-feature-eyebrow">{steps[currentStep].eyebrow}</p>
            <h3>{steps[currentStep].title}</h3>
            <p className="video-feature-description">{steps[currentStep].description}</p>
            <ul>
              {steps[currentStep].bullets.map((bullet) => {
                const [lead, ...rest] = bullet.split(':')
                return (
                  <li key={bullet}>
                    <span>•</span>
                    <p><strong>{lead}{rest.length ? ':' : ''}</strong>{rest.join(':')}</p>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="video-feature-stage" aria-label="Espaço reservado para vídeo" />
        </div>

        <div className="hidden">
          <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-[#F59E2B] opacity-10 blur-[120px]" />

          <div className="relative z-10">
            <div className="mb-6 flex justify-end">
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`h-2 w-2 rounded-full transition ${
                      index === currentStep ? 'bg-[#F5A623]' : 'bg-white/25'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col gap-6">
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border border-[#F59E2B]/60 bg-[#251705]/70 text-[#FFBF3F]">
                  {currentStep === 1 ? (
                    <svg width="31" height="31" viewBox="0 0 24 24" fill="none"><path d="m10.5 13.5 3-3M8.2 15.8l-1.4 1.4a3.4 3.4 0 0 1-4.8-4.8l3.2-3.2A3.4 3.4 0 0 1 10 9M15.8 8.2l1.4-1.4a3.4 3.4 0 1 1 4.8 4.8l-3.2 3.2A3.4 3.4 0 0 1 14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  ) : currentStep === 2 ? (
                    <svg width="31" height="31" viewBox="0 0 24 24" fill="none"><path d="M12 16V3m0 0L7 8m5-5 5 5M5 14v6h14v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : currentStep === 3 ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M4 13v-2c0-1.1.9-2 2-2h3l8-5v16l-8-5H6c-1.1 0-2-.9-2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="m8 15 1.5 5H13l-2-5M20 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="m4 7 8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M4 7v10l8 4 8-4V7M12 11v10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
                  )}
                </div>

                <p className="text-left font-articulat text-xs font-bold uppercase tracking-[.28em] text-[#F5A623]">{steps[currentStep].eyebrow}</p>
                <h3 className="text-left font-manrope text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  {steps[currentStep].title}
                </h3>

                <p className="text-left text-sm leading-relaxed text-white">
                  {steps[currentStep].description}
                </p>

                <ul className="flex flex-col gap-3 text-left text-sm text-white/80">
                  {steps[currentStep].bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="final-call__check">✓</span>
                      <span><strong className="text-white">{bullet.split(':')[0]}:</strong>{bullet.split(':').slice(1).join(':')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dropealy-mockup relative flex aspect-video w-full overflow-hidden rounded-[20px] border border-[#F59E2B]/35 bg-[#111216] p-4 text-left sm:p-6">
                <div className="w-[27%] border-r border-white/10 pr-3 text-[10px] text-white/60 sm:text-xs">
                  <strong className="mb-6 block text-base text-white sm:text-lg"><span className="text-[#F5A623]">D</span> Dropealy</strong>
                  {['Catálogo', 'Publicação', 'Anúncios', 'Contas', 'Configurações'].map((item) => <div key={item} className={`mb-3 rounded-lg px-2 py-2 ${item === ['Catálogo', 'Contas', 'Publicação', 'Anúncios'][currentStep] ? 'bg-[#F59E2B]/20 text-[#FFBF3F]' : ''}`}>{item}</div>)}
                </div>
                <div className="flex-1 pl-4 sm:pl-6">
                  <h4 className="text-xl font-bold text-white sm:text-3xl">{steps[currentStep].shortTitle}</h4>
                  {currentStep === 1 ? (
                    <div className="mt-4 space-y-3">
                      {['Conta principal', 'Loja 2'].map((account) => (
                        <div key={account} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/35 p-3">
                          <img src="/assets/mercado-livre.svg" alt="Mercado Livre" className="h-10 w-10 flex-none rounded-full object-contain" />
                          <div className="min-w-0 flex-1"><strong className="block text-[10px] text-white sm:text-sm">Mercado Livre</strong><span className="text-[8px] text-white/55 sm:text-xs">{account}</span></div>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[8px] text-emerald-400 sm:text-xs">● Conectada</span>
                          <span className="text-white/55">⋮</span>
                        </div>
                      ))}
                      <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-white/25 py-4 text-[10px] font-semibold text-white sm:text-sm"><span className="text-xl font-light">＋</span> Adicionar conta</button>
                    </div>
                  ) : currentStep === 2 ? (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[8px] text-white/45 sm:text-[11px]"><span className="text-[#F5A623]">● &nbsp; Produto</span><span>② &nbsp; Revisão</span><span>③ &nbsp; Publicação</span></div>
                      <div className="mt-3 grid grid-cols-[30%_1fr] gap-3">
                        <div className="aspect-square overflow-hidden rounded-lg border border-white/15 bg-white/90"><img src="/assets/ventilador-mesa.png" alt="Ventilador de Mesa Portátil USB" className="h-full w-full object-cover" /></div>
                        <div><strong className="block text-[9px] text-white sm:text-xs">Ventilador de Mesa Portátil USB</strong><label className="mt-2 block text-[7px] text-white/50 sm:text-[10px]">Título do anúncio</label><div className="mt-1 rounded-md border border-white/15 bg-white/[.03] px-2 py-1.5 text-[7px] text-white/70 sm:text-[10px]">Ventilador de Mesa Portátil USB</div><label className="mt-2 block text-[7px] text-white/50 sm:text-[10px]">Descrição</label><div className="mt-1 h-9 rounded-md border border-white/15 bg-white/[.03] px-2 py-1.5 text-[7px] text-white/70 sm:text-[10px]">Compacto, portátil e fácil de usar.</div></div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[8px] sm:text-[10px]"><div><span className="text-white/50">Publicar em</span><div className="mt-1 flex items-center gap-2 rounded-md border border-white/15 px-2 py-1.5"><img src="/assets/mercado-livre.svg" alt="" className="h-4 w-4"/> Mercado Livre</div></div><div><span className="text-white/50">Conta</span><div className="mt-1 rounded-md border border-white/15 px-2 py-1.5">Conta principal⌄</div></div></div>
                      <button className="mt-3 w-full rounded-md bg-[linear-gradient(135deg,#FFCF6E,#F59E2B)] py-2 text-[9px] font-bold text-black sm:text-xs">Publicar anúncio</button>
                    </div>
                  ) : currentStep === 3 ? (
                    <div className="mt-3">
                      <div className="flex h-8 items-center rounded-lg border border-white/15 bg-white/[.03] px-3 text-[8px] text-white/35 sm:text-[11px]">⌕ &nbsp; Buscar anúncio</div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[8px] text-white/70 sm:text-[10px]"><div className="rounded-md border border-white/15 px-2 py-1.5">Todas as contas⌄</div><div className="rounded-md border border-white/15 px-2 py-1.5">Todos os status⌄</div></div>
                      <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-black/25">
                        <div className="grid grid-cols-[1.5fr_.85fr_.7fr_12px] gap-2 border-b border-white/10 px-2 py-1.5 text-[7px] text-white/40 sm:text-[9px]"><span>Produto</span><span>Conta</span><span>Status</span><span /></div>
                        {[
                          { name: 'Ventilador de Mesa', account: 'Conta principal', status: 'Ativo', image: '/assets/ventilador-mesa.png', active: true },
                          { name: 'Afiador de Facas', account: 'Loja 2', status: 'Pausado', emoji: '🔪', active: false },
                          { name: 'Almofada Lombar', account: 'Conta principal', status: 'Ativo', emoji: '◼', active: true },
                        ].map((item) => (
                          <div key={item.name} className="grid grid-cols-[1.5fr_.85fr_.7fr_12px] items-center gap-2 border-b border-white/10 px-2 py-1.5 last:border-0">
                            <div className="flex min-w-0 items-center gap-2">{item.image ? <img src={item.image} alt="" className="h-7 w-7 rounded object-cover" /> : <span className="flex h-7 w-7 items-center justify-center rounded bg-white/10 text-sm">{item.emoji}</span>}<span className="truncate text-[7px] font-semibold text-white sm:text-[9px]">{item.name}</span></div>
                            <span className="truncate text-[7px] text-white/55 sm:text-[9px]">{item.account}</span>
                            <span className={`inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[7px] sm:text-[9px] ${item.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}><span aria-hidden="true">●</span><span>{item.status}</span></span>
                            <span className="text-white/45">⋮</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <><div className="mt-4 h-9 rounded-xl border border-white/15 bg-white/[.03]" /><div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">{['Ventilador de Mesa', 'Afiador de Facas', 'Almofada Lombar'].map((item) => <div key={item} className="overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2"><div className="aspect-square rounded-lg bg-gradient-to-br from-white/20 to-white/[.03]"/><p className="mt-2 text-[8px] font-semibold text-white sm:text-xs">{item}</p><div className="mt-2 rounded-md bg-[linear-gradient(135deg,#FFCF6E,#F59E2B)] py-1 text-center text-[8px] font-bold text-black sm:text-xs">Anunciar →</div></div>)}</div></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-4">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex h-[59px] items-center justify-start gap-4 whitespace-nowrap rounded-full border text-sm font-semibold tracking-wide text-white transition pl-6 ${
                currentStep === index
                  ? 'border-[#FFCF6E] text-black'
                  : 'border-[#F59E2B]/55 bg-black/30 hover:border-[#F59E2B]'
              }`}
              style={{
                background: currentStep === index
                  ? 'linear-gradient(135deg, #FFCF6E, #F59E2B)'
                  : 'linear-gradient(90deg, rgba(245,158,43,.02), rgba(245,158,43,.08))',
                width: '235px',
              }}
            >
              {step.id === 'ugc-creator' && (
                <>
                  <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="33" height="33" rx="16.5" fill="url(#paint0_linear_ugc)" />
                    <path d="M16.025 22V12.8287L14.005 13.35V11.835L16.8069 10.597H18.0286V22H16.025Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_ugc" x1="0" y1="16.5" x2="33" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FFCF6E" />
                        <stop offset="0.35" stop-color="#F59E2B" />
                        <stop offset="0.65" stop-color="#B86A00" />
                        <stop offset="1" stop-color="#5A3000" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Catálogo de produtos
                </>
              )}
              {step.id === 'radar-produtos' && (
                <>
                  <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="33" height="33" rx="16.5" fill="url(#paint0_linear_radar)" />
                    <path d="M12.3797 22V20.5828C13.1073 20.0072 13.8023 19.4316 14.4648 18.856C15.1272 18.2804 15.7245 17.7103 16.2567 17.1456C16.7888 16.5809 17.2069 16.027 17.511 15.484C17.8151 14.941 17.9671 14.4197 17.9671 13.9202C17.9671 13.5944 17.9074 13.2903 17.7879 13.0079C17.6685 12.7256 17.4784 12.4975 17.2178 12.3237C16.968 12.15 16.6314 12.0631 16.2078 12.0631C15.7951 12.0631 15.4422 12.1554 15.149 12.34C14.8666 12.5246 14.6548 12.7744 14.5137 13.0894C14.3725 13.3934 14.3019 13.741 14.3019 14.1319H12.4122C12.434 13.3066 12.6132 12.617 12.9498 12.0631C13.2865 11.5092 13.7426 11.0966 14.3182 10.8251C14.8938 10.5427 15.5399 10.4015 16.2567 10.4015C17.0277 10.4015 17.6848 10.5427 18.2278 10.8251C18.7708 11.1074 19.1889 11.5038 19.4821 12.0142C19.7753 12.5246 19.9219 13.1274 19.9219 13.8224C19.9219 14.3328 19.8242 14.8378 19.6287 15.3374C19.4441 15.8261 19.1835 16.3039 18.8468 16.7709C18.5101 17.227 18.13 17.6723 17.7065 18.1067C17.2938 18.5302 16.8648 18.9375 16.4196 19.3284C15.9743 19.7085 15.5454 20.0615 15.1327 20.3873H20.2314V22H12.3797Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_radar" x1="0" y1="16.5" x2="33" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FFCF6E" />
                        <stop offset="0.35" stop-color="#F59E2B" />
                        <stop offset="0.65" stop-color="#B86A00" />
                        <stop offset="1" stop-color="#5A3000" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Contas conectadas
                </>
              )}
              {step.id === 'animacoes' && (
                <>
                  <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="33" height="33" rx="16.5" fill="url(#paint0_linear_prompts)" />
                    <path d="M16.3544 22.1955C15.6159 22.1955 14.9426 22.0652 14.3345 21.8045C13.7263 21.533 13.2376 21.1258 12.8684 20.5828C12.51 20.0289 12.3199 19.3339 12.2982 18.4976H14.2204C14.2313 18.8777 14.3182 19.2253 14.4811 19.5402C14.6548 19.8443 14.8992 20.0886 15.2141 20.2733C15.5291 20.447 15.9092 20.5339 16.3544 20.5339C16.778 20.5339 17.1363 20.4524 17.4296 20.2895C17.7336 20.1266 17.9617 19.904 18.1137 19.6217C18.2658 19.3393 18.3418 19.0244 18.3418 18.6768C18.3418 18.2533 18.2386 17.9058 18.0323 17.6343C17.826 17.3519 17.5436 17.1401 17.1852 16.999C16.8268 16.8578 16.4196 16.7872 15.9635 16.7872H15.1164V15.1745H15.9635C16.5608 15.1745 17.0495 15.0387 17.4296 14.7672C17.8097 14.4849 17.9997 14.0776 17.9997 13.5455C17.9997 13.1002 17.8531 12.7418 17.5599 12.4703C17.2775 12.1988 16.8703 12.0631 16.3381 12.0631C15.7843 12.0631 15.3444 12.226 15.0186 12.5518C14.7037 12.8776 14.5299 13.2794 14.4974 13.7573H12.5751C12.6077 13.0731 12.7815 12.4812 13.0964 11.9816C13.4222 11.4712 13.8621 11.0803 14.4159 10.8088C14.9698 10.5373 15.6159 10.4015 16.3544 10.4015C17.1255 10.4015 17.7771 10.5373 18.3092 10.8088C18.8414 11.0803 19.2432 11.4441 19.5147 11.9002C19.797 12.3563 19.9382 12.8559 19.9382 13.3989C19.9382 13.8224 19.8568 14.2079 19.6939 14.5555C19.531 14.903 19.3083 15.1962 19.026 15.4351C18.7545 15.6632 18.4341 15.8315 18.0649 15.9401C18.4884 16.027 18.8631 16.1953 19.1889 16.4451C19.5255 16.6949 19.7862 17.0153 19.9708 17.4062C20.1663 17.7863 20.264 18.2316 20.264 18.742C20.264 19.361 20.112 19.9366 19.8079 20.4687C19.5147 20.99 19.0749 21.4081 18.4884 21.7231C17.9128 22.038 17.2015 22.1955 16.3544 22.1955Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_prompts" x1="0" y1="16.5" x2="33" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FFCF6E" />
                        <stop offset="0.35" stop-color="#F59E2B" />
                        <stop offset="0.65" stop-color="#B86A00" />
                        <stop offset="1" stop-color="#5A3000" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Publicação integrada
                </>
              )}
              {step.id === 'revealy-boost' && (
                <>
                  <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="33" height="33" rx="16.5" fill="url(#paint0_linear_boost)" />
                    <path d="M17.3531 22V19.8334H11.7005V18.2696L17.0762 10.597H19.2916V18.123H20.8392V19.8334H19.2916V22H17.3531ZM13.8019 18.123H17.4671V12.7473L13.8019 18.123Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_boost" x1="0" y1="16.5" x2="33" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FFCF6E" />
                        <stop offset="0.35" stop-color="#F59E2B" />
                        <stop offset="0.65" stop-color="#B86A00" />
                        <stop offset="1" stop-color="#5A3000" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Gestão de anúncios
                </>
              )}
            </button>
          ))}
        </div>

        <div
          className="sales-ticker left-1/2 mt-20 w-screen -translate-x-1/2 sm:mt-24"
          aria-label="Venda sem ter estoque"
        >
          <div className="sales-ticker__track">
            {[0, 1].map((group) => (
              <div
                key={group}
                className="sales-ticker__group"
                aria-hidden={group === 1}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <span key={index} className="sales-ticker__item">
                    <span>Venda sem ter estoque</span>
                    <span className="sales-ticker__dot">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-6xl text-center sm:mt-28">
          <div className="arsenal-section mx-auto max-w-6xl">
            <p className="font-articulat text-xs font-semibold uppercase tracking-[0.42em] text-[#F59E2B]">
              Dropealy
            </p>
            <h3 className="mx-auto mt-3 max-w-3xl font-articulat text-3xl font-bold leading-[1.05] text-white sm:text-4xl md:text-5xl">
              Sua operação começa com<br className="hidden sm:block" /> <span className="text-[#F6B844]">as ferramentas certas</span>
            </h3>
            <p className="mx-auto mt-4 max-w-2xl font-articulat text-sm leading-relaxed text-white/70 sm:text-lg">
              Catálogo, publicação e acompanhamento em um só lugar.
            </p>

            <div className="mt-10 space-y-4 text-left">
              <article className="arsenal-card arsenal-card--blue">
                <img className="arsenal-thumb" src="/assets/catalogo-produtos.png" alt="Catálogo de produtos da Dropealy" />
                <div>
                  <h4>Catálogo de produtos</h4>
                  <p>Consulte fotos, descrições, preços e estoque para escolher o que anunciar.</p>
                </div>
              </article>
              <article className="arsenal-card arsenal-card--purple">
                <img className="arsenal-thumb" src="/assets/publicacao-gestao.png" alt="Publicação e gestão de anúncios na Dropealy" />
                <div>
                  <h4>Publicação e gestão de anúncios</h4>
                  <p>Prepare seus anúncios no Mercado Livre e acompanhe status, qualidade e tarifas estimadas.</p>
                </div>
              </article>
              <article className="arsenal-card arsenal-card--pink">
                <img className="arsenal-thumb" src="/images/bonus/members-area-1760x640.webp" alt="Área de membros da Dropealy com módulos e aulas" width="1760" height="640" loading="lazy" decoding="async" />
                <div>
                  <span className="arsenal-bonus"><GiftIcon /><b>Bônus do trimestral e vitalício</b></span>
                  <h4>Área de Membros Exclusiva com Aulas</h4>
                  <p>Aprenda a usar a ferramenta e colocar sua operação em prática.</p>
                </div>
              </article>
              <article className="arsenal-card arsenal-card--pink">
                <img className="arsenal-thumb" src="/images/bonus/gemini-plus-1760x640.webp" alt="Gemini Plus para apoiar ideias e conteúdos" width="1760" height="640" loading="lazy" decoding="async" />
                <div>
                  <span className="arsenal-bonus"><GiftIcon /><b>Bônus do plano vitalício</b></span>
                  <h4>Gemini Plus</h4>
                  <p>Conte com inteligência artificial para apoiar suas ideias e conteúdos.</p>
                </div>
              </article>
              <article className="arsenal-card arsenal-card--gray">
                <img className="arsenal-thumb" src="/images/bonus/capcut-pro-1760x640.webp" alt="Acesso ao CapCut Pro" width="1760" height="640" loading="lazy" decoding="async" />
                <div>
                  <span className="arsenal-bonus"><GiftIcon /><b>Bônus do plano vitalício</b></span>
                  <h4>CapCut Pro</h4>
                  <p>Edite vídeos, adicione legendas e prepare seus conteúdos de divulgação.</p>
                </div>
              </article>
              <div className="arsenal-anchor">
                <div className="arsenal-anchor__message">
                  <span className="arsenal-anchor__icon"><CrownIcon /></span>
                  <b>Escolha o plano <em>para sua operação</em></b>
                </div>
                <a href="#planos" className="arsenal-cta">
                  Conhecer os planos <span>→</span>
                </a>
              </div>
            </div>
          </div>

          <div className="relative mx-auto mt-28 max-w-[1450px] text-center">
            <div
              className="absolute top-0 z-0 hidden h-[933px] w-[933px] -translate-y-1/2 rounded-full bg-[#F59E2B] opacity-35 blur-[150px] lg:block"
              style={{ right: '-800px' }}
            />
            <h3 className="relative z-10 font-articulat text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
              Escolha o ritmo da
              <br />
              sua criação.
            </h3>

            <p className="mx-auto mt-2 font-articulat text-lg text-white sm:text-xl">
              Escolha entre acesso trimestral e vitalício.
            </p>

            <CouponControl />
            <CheckoutStatus />
            <div id="planos" className="pricing-grid">
              <article className="pricing-card">
                <p className="pricing-card__label">Plano Trial</p>
                <h4 className="pricing-card__title-lines">
                  <span>Mais contas para</span>
                  <span>ampliar suas vendas</span>
                </h4>
                {couponApplied ? <p className="pricing-card__original"><s>{commercialPrice(normalPrices.trial)}</s></p> : null}
                <div className="pricing-card__price"><strong>{commercialPrice(prices.trial)}</strong><span>/3 meses</span></div>
                <PlanFeatures features={COMMERCIAL_PLANS.trial.features} />
                <div className="master-bonus-box">
                  <strong>Bônus incluso no trimestral</strong>
                  {COMMERCIAL_PLANS.trial.bonuses.map((bonus) => <div className="master-bonus-box__item" key={bonus}>
                    <img src="/assets/check-icon.svg" alt="" aria-hidden="true" /><span>{bonus}</span>
                  </div>)}
                </div>
                <a {...getCheckoutProps('trial', 'https://checkout.perfectpay.com.br/pay/PPU38CQGI6H?')} target="_blank" rel="noopener noreferrer">Quero começar agora</a>
              </article>

              <article className="pricing-card pricing-card--featured">
                <div className="pricing-card__recommended">Recomendado</div>
                <p className="pricing-card__label">Plano Master</p>
                <h4 className="pricing-card__title-lines">
                  <span>Pague uma vez,</span>
                  <span>use para sempre</span>
                </h4>
                {couponApplied ? <p className="pricing-card__original"><s>{commercialPrice(normalPrices.master)}</s></p> : null}
                <div className="pricing-card__price pricing-card__price--master">
                  {!couponApplied ? <span>{COMMERCIAL_PLANS.master.installmentCount}x de</span> : null}
                  <strong>{commercialPrice(couponApplied ? prices.master : COMMERCIAL_PLANS.master.installmentCents)}</strong>
                </div>
                <p className="pricing-card__detail">{couponApplied ? 'À vista · Acesso vitalício' : <>ou {commercialPrice(prices.master)} à vista&nbsp; • &nbsp;Acesso vitalício</>}</p>
                <PlanFeatures features={COMMERCIAL_PLANS.master.features} />
                <div className="master-bonus-box">
                  <strong>Bônus exclusivos do vitalício</strong>
                  {COMMERCIAL_PLANS.master.bonuses.map((bonus) => <div className="master-bonus-box__item" key={bonus}>
                    <img src="/assets/check-icon.svg" alt="" aria-hidden="true" /><span>{bonus}</span>
                  </div>)}
                  {!couponApplied ? <small>Total no parcelamento: {commercialPrice(MASTER_INSTALLMENT_TOTAL_CENTS)}.</small> : null}
                </div>
                <a {...getCheckoutProps('master', 'https://checkout.perfectpay.com.br/pay/PPU38CQGGNH?')} target="_blank" rel="noopener noreferrer">Quero começar agora</a>
              </article>
            </div>

          </div>
        </div>
      </div>

      <section className="final-call mx-auto mt-28 w-[calc(100%-3rem)] max-w-[1050px] px-6 py-12 text-center sm:px-12 sm:py-16">
        <p className="font-articulat text-xs font-bold uppercase tracking-[0.34em] text-[#F5A623]">
          Seu próximo passo
        </p>
        <h2 className="mx-auto mt-4 max-w-4xl font-articulat text-3xl font-semibold leading-[1.08] text-white sm:text-4xl md:text-5xl">
          Do catálogo ao anúncio,<br className="hidden sm:block" /> comece <em>sua operação</em> com a Dropealy.
        </h2>
        <p className="mx-auto mt-5 max-w-3xl font-articulat text-sm leading-relaxed text-white/65 sm:text-base">
          Encontre produtos, prepare seus anúncios e acompanhe sua operação em um só lugar.
        </p>
        <ul className="mx-auto mt-7 max-w-2xl space-y-3 text-left">
          {[
            'Explore o catálogo com fotos, preços e informações dos produtos',
            'Conecte sua conta do Mercado Livre',
            'Prepare e publique seus anúncios pela plataforma',
            'Acompanhe status, qualidade e tarifas estimadas',
            'Aprenda com a área de membros inclusa no trimestral e no vitalício',
            'Use Gemini Plus e CapCut Pro, bônus exclusivos do vitalício',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 font-articulat text-sm text-white/85 sm:text-base">
              <span className="final-call__check">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <a href="#planos" className="final-call__button mx-auto mt-9">
          <span className="final-call__arrow" aria-hidden="true">
            <svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40.1176" height="39.2989" rx="19.6495" fill="white" />
              <path d="M22.0488 14.6816L27.0185 19.6513L22.0488 24.621" stroke="black" strokeWidth="1.22809" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.1016 19.6523H26.8807" stroke="black" strokeWidth="1.22809" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Começar agora na Dropealy
        </a>
        <p className="mt-5 font-articulat text-sm text-white/40">
          Escolha seu plano e dê o próximo passo.
        </p>
      </section>

      <div id="faq" className="mx-auto mt-24 w-full max-w-[1200px] px-6 text-center">
        <p
          className="font-articulat text-lg font-semibold bg-clip-text text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(90deg, #AB7BFF 19%, #FFFFFF 62%, #AB7BFF 100%)',
          }}
        >
          \\ FAQ
        </p>
        <h2 className="font-articulat mt-2 text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
          Perguntas Frequentes
        </h2>
      </div>

      <div className="relative mx-auto mt-12 flex w-full flex-col gap-4 px-6">
        <div className="absolute left-1/2 top-1/2 z-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F59E2B] opacity-35 blur-[120px] sm:h-[513px] sm:w-[513px]" />
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="relative z-10 mx-auto w-full max-w-[1200px] rounded-[19px] border px-5 py-5 sm:px-8 sm:py-6"
            style={{
              background: 'rgba(16, 16, 16, 0.27)',
              borderColor: 'rgba(46, 46, 46, 0.62)',
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-articulat text-lg font-medium text-white">
                {faq.question}
              </span>
              <span className="text-2xl text-white">
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            {openIndex === index && faq.answer && (
              <p className="font-articulat mt-4 text-left text-sm leading-relaxed text-white/70">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex justify-center px-6">
        <img
          src="/assets/dropealy-zouti.png"
          alt="Dropealy"
          className="h-auto w-full max-w-[1030.44px]"
        />
      </div>
    </section>

    <footer className="relative w-full overflow-hidden bg-[#090C11] px-6 py-16">
      <div className="absolute top-0 left-0 h-[1px] w-full bg-white/20" />
      <div className="absolute left-0 top-0 h-[300px] w-[300px] rounded-full bg-[#FFCF6E] opacity-20 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 h-[505px] w-[505px] bg-[#F59E2B] opacity-45 blur-[150px]" />

      <div className="relative mx-auto max-w-6xl sm:min-h-[286px]">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/assets/dropealy-logo-horizontal.png"
              alt="Dropealy"
              className="h-[41px] w-auto max-w-[160px] object-contain"
            />
          </div>

          <div>
            <h3 className="font-articulat text-lg font-semibold text-white">Menu</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#home" className="font-articulat text-sm text-white/60 hover:text-white">Home</a></li>
              <li><a href="#features" className="font-articulat text-sm text-white/60 hover:text-white">O que entregamos</a></li>
              <li><a href="#planos" className="font-articulat text-sm text-white/60 hover:text-white">Planos</a></li>
              <li><a href="#faq" className="font-articulat text-sm text-white/60 hover:text-white">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-articulat text-lg font-semibold text-white">Políticas e Termos</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#privacidade" className="font-articulat text-sm text-white/60 hover:text-white">Política de privacidade</a></li>
              <li><a href="#termos" className="font-articulat text-sm text-white/60 hover:text-white">Termos de Uso</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-articulat text-lg font-semibold text-white">Fale Conosco</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="mailto:contato@apprevealy.com" className="font-articulat text-sm text-white/60 hover:text-white">
                  contato@apprevealy.com
                </a>
              </li>
              <li>
                <a href="https://api.whatsapp.com/send?phone=5561994210220" target="_blank" rel="noopener noreferrer" className="font-articulat text-sm text-white/60 hover:text-white">
                  (61) 99421-0220
                </a>
              </li>
              <li className="font-articulat text-sm text-white/60">CNPJ: 54.948.665/0001-50</li>
            </ul>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-6 flex items-center gap-2 font-articulat text-sm font-semibold text-[#F59E2B] hover:text-[#FFCF6E]"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1_163)">
                  <rect width="15" height="15" rx="3.5919" fill="#F59E2B" />
                </g>
                <defs>
                  <clipPath id="clip0_1_163">
                    <rect width="15" height="15" rx="3.5919" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Voltar para o Topo
            </button>
          </div>
        </div>

        <div className="relative mt-12 flex flex-col items-center justify-between gap-6 pt-8 sm:min-h-[84px] sm:flex-row">
          <div className="absolute top-0 left-1/2 h-[1px] w-screen -translate-x-1/2 bg-white/20" />
          <p className="font-articulat text-xs text-white/40">
            2026 © Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#youtube" className="text-white/50 hover:text-white">
              <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1_175)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.583 3.37336C20.354 2.36936 19.676 1.57736 18.814 1.30536C17.255 0.818359 11 0.818359 11 0.818359C11 0.818359 4.748 0.818359 3.186 1.30536C2.327 1.57336 1.649 2.36536 1.417 3.37336C1 5.19536 1 9.00036 1 9.00036C1 9.00036 1 12.8054 1.417 14.6274C1.646 15.6314 2.324 16.4234 3.186 16.6954C4.748 17.1824 11 17.1824 11 17.1824C11 17.1824 17.255 17.1824 18.814 16.6954C19.673 16.4274 20.351 15.6354 20.583 14.6274C21 12.8054 21 9.00036 21 9.00036C21 9.00036 21 5.19536 20.583 3.37336Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.00195 12L14.198 9L9.00195 6V12Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                  <clipPath id="clip0_1_175">
                    <rect width="22" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a href="#tiktok" className="text-white/50 hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 7.125C19.7075 7.12351 18.4684 6.60942 17.5545 5.6955C16.6406 4.78158 16.1265 3.54247 16.125 2.25C16.125 2.15054 16.0855 2.05516 16.0152 1.98484C15.9448 1.91451 15.8495 1.875 15.75 1.875H12C11.9005 1.875 11.8052 1.91451 11.7348 1.98484C11.6645 2.05516 11.625 2.15054 11.625 2.25V14.625C11.6249 15.0277 11.5168 15.4229 11.3119 15.7696C11.1071 16.1162 10.8129 16.4015 10.4601 16.5957C10.1074 16.7899 9.70901 16.8859 9.30653 16.8737C8.90404 16.8614 8.51223 16.7414 8.17195 16.5261C7.83168 16.3108 7.55542 16.0081 7.37199 15.6496C7.18857 15.2912 7.1047 14.89 7.12915 14.4881C7.1536 14.0862 7.28545 13.6982 7.51097 13.3646C7.73648 13.031 8.04739 12.764 8.41125 12.5916C8.47535 12.561 8.52947 12.5129 8.56731 12.4529C8.60515 12.3928 8.62515 12.3232 8.625 12.2522V8.25C8.62502 8.19518 8.61303 8.14103 8.58986 8.09135C8.5667 8.04167 8.53292 7.99767 8.49091 7.96246C8.4489 7.92724 8.39968 7.90167 8.34672 7.88753C8.29376 7.87339 8.23835 7.87103 8.18438 7.88062C5.01469 8.445 2.625 11.3438 2.625 14.625C2.625 16.4152 3.33616 18.1321 4.60203 19.398C5.8679 20.6638 7.58479 21.375 9.375 21.375C11.1652 21.375 12.8821 20.6638 14.148 19.398C15.4138 18.1321 16.125 16.4152 16.125 14.625V10.26C17.5926 11.1568 19.2801 11.6293 21 11.625C21.0995 11.625 21.1948 11.5855 21.2652 11.5152C21.3355 11.4448 21.375 11.3495 21.375 11.25V7.5C21.375 7.40054 21.3355 7.30516 21.2652 7.23483C21.1948 7.16451 21.0995 7.125 21 7.125ZM20.625 10.8675C18.9488 10.7984 17.3299 10.2383 15.9694 9.25688C15.9133 9.21641 15.8471 9.19225 15.7781 9.18706C15.7091 9.18188 15.64 9.19588 15.5785 9.22752C15.517 9.25915 15.4654 9.30718 15.4295 9.3663C15.3936 9.42542 15.3747 9.49332 15.375 9.5625V14.625C15.375 16.2163 14.7429 17.7424 13.6176 18.8676C12.4924 19.9929 10.9663 20.625 9.375 20.625C7.7837 20.625 6.25758 19.9929 5.13236 18.8676C4.00714 17.7424 3.375 16.2163 3.375 14.625C3.375 11.8575 5.28 9.39469 7.875 8.71875V12.0291C7.41886 12.2924 7.0401 12.6712 6.77679 13.1274C6.51348 13.5835 6.37491 14.101 6.375 14.6277C6.37509 15.1544 6.51385 15.6718 6.77733 16.1278C7.0408 16.5839 7.4197 16.9626 7.87593 17.2257C8.33216 17.4889 8.84964 17.6274 9.37634 17.6271C9.90304 17.6269 10.4204 17.488 10.8764 17.2244C11.3324 16.9608 11.7109 16.5818 11.974 16.1255C12.2371 15.6692 12.3754 15.1517 12.375 14.625V2.625H15.3872C15.4801 3.98355 16.0617 5.26251 17.0246 6.22539C17.9875 7.18827 19.2665 7.76993 20.625 7.86281V10.8675Z" fill="white" fillOpacity="0.7" />
                <path d="M15.75 1.75C15.8826 1.75 16.0097 1.80272 16.1035 1.89648C16.1973 1.99025 16.25 2.11739 16.25 2.25L16.2559 2.48535C16.3154 3.65894 16.8077 4.77257 17.6426 5.60742C18.5331 6.4979 19.7407 6.99851 21 7C21.1326 7 21.2597 7.05272 21.3535 7.14648C21.4473 7.24025 21.5 7.36739 21.5 7.5V11.25C21.5 11.3826 21.4473 11.5097 21.3535 11.6035C21.2597 11.6973 21.1326 11.75 21 11.75C19.3307 11.7541 17.6921 11.314 16.25 10.4785V14.625C16.25 16.4484 15.5256 18.197 14.2363 19.4863C12.947 20.7756 11.1984 21.5 9.375 21.5C7.55164 21.5 5.80298 20.7756 4.51367 19.4863C3.22436 18.197 2.5 16.4484 2.5 14.625C2.5 11.285 4.93129 8.33327 8.16211 7.75781C8.23404 7.74503 8.30832 7.74777 8.37891 7.7666C8.44945 7.78543 8.51532 7.81933 8.57129 7.86621C8.6272 7.91308 8.67224 7.972 8.70312 8.03809C8.73401 8.10431 8.75002 8.17693 8.75 8.25V12.252L8.74512 12.3223C8.73535 12.3921 8.71071 12.4594 8.67285 12.5195C8.63498 12.5796 8.58513 12.631 8.52637 12.6699L8.46484 12.7041C8.1212 12.867 7.82724 13.1195 7.61426 13.4346C7.40131 13.7496 7.27699 14.1165 7.25391 14.4961C7.2309 14.8756 7.31022 15.2543 7.4834 15.5928C7.65663 15.9313 7.91792 16.2176 8.23926 16.4209C8.5605 16.624 8.93064 16.7375 9.31055 16.749C9.69045 16.7606 10.0664 16.6696 10.3994 16.4863C10.7325 16.3029 11.0106 16.0334 11.2041 15.7061C11.3976 15.3787 11.4999 15.0053 11.5 14.625V2.25C11.5 2.11739 11.5527 1.99025 11.6465 1.89648C11.7403 1.80272 11.8674 1.75 12 1.75H15.75ZM12.5 14.625L12.4932 14.8301C12.4621 15.3072 12.3217 15.7717 12.082 16.1875C11.808 16.6628 11.4135 17.0584 10.9385 17.333C10.4636 17.6074 9.92442 17.7517 9.37598 17.752C8.82747 17.7521 8.2886 17.6081 7.81348 17.334C7.33824 17.0598 6.94339 16.6655 6.66895 16.1904C6.39454 15.7154 6.25014 15.1765 6.25 14.6279C6.2499 14.0793 6.39466 13.5396 6.66895 13.0645C6.931 12.6107 7.30312 12.2312 7.75 11.959V8.88379C5.29128 9.6018 3.5 11.9695 3.5 14.625C3.5 16.1831 4.11893 17.6775 5.2207 18.7793C6.32248 19.8811 7.81685 20.5 9.375 20.5C10.9331 20.5 12.4275 19.8811 13.5293 18.7793C14.6311 17.6775 15.25 16.1831 15.25 14.625V9.5625C15.2497 9.47061 15.2746 9.38034 15.3223 9.30176C15.3702 9.22293 15.4395 9.15839 15.5215 9.11621C15.6034 9.07414 15.6953 9.05567 15.7871 9.0625C15.8791 9.06941 15.9682 9.10132 16.043 9.15527C17.3483 10.0968 18.8949 10.6433 20.5 10.7344V7.97656C19.1549 7.85713 17.8932 7.27011 16.9365 6.31348C15.9799 5.35684 15.3929 4.09512 15.2734 2.75H12.5V14.625Z" stroke="white" strokeOpacity="0.7" strokeWidth="0.25" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/revealyapp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1_181)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.496 3H16.505C18.987 3 21 5.012 21 7.496V16.505C21 18.987 18.988 21 16.504 21H7.496C5.013 21 3 18.988 3 16.504V7.496C3 5.013 5.012 3 7.496 3Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16.9503 6.71289C16.7643 6.71389 16.6133 6.86489 16.6133 7.05089C16.6133 7.23689 16.7653 7.38789 16.9513 7.38789C17.1373 7.38789 17.2883 7.23689 17.2883 7.05089C17.2893 6.86389 17.1373 6.71289 16.9503 6.71289Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14.546 9.45481C15.9519 10.8607 15.9519 13.1401 14.546 14.546C13.1401 15.9519 10.8607 15.9519 9.45481 14.546C8.04892 13.1401 8.04892 10.8607 9.45481 9.45481C10.8607 8.04892 13.1401 8.04892 14.546 9.45481Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                  <clipPath id="clip0_1_181">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a href="#whatsapp" className="text-white/50 hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M18.2041 5.76108C16.5581 4.11408 14.3691 3.20608 12.0371 3.20508C7.23014 3.20508 3.31914 7.11408 3.31814 11.9191C3.31614 13.4481 3.71714 14.9511 4.48114 16.2761L3.24414 20.7921L7.86614 19.5801C9.14514 20.2761 10.5771 20.6411 12.0331 20.6411H12.0371C16.8421 20.6411 20.7531 16.7311 20.7551 11.9261C20.7561 9.59808 19.8501 7.40908 18.2041 5.76108Z" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.0938 13.5599L13.4998 13.1569C13.8728 12.7869 14.4627 12.7399 14.8927 13.0419C15.3087 13.3339 15.6847 13.5959 16.0347 13.8399C16.5907 14.2259 16.6578 15.0179 16.1788 15.4959L15.8197 15.8549" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.14453 8.18036L8.50353 7.82136C8.98153 7.34336 9.77353 7.41036 10.1595 7.96536C10.4025 8.31536 10.6645 8.69136 10.9575 9.10736C11.2595 9.53736 11.2135 10.1274 10.8425 10.5004L10.4395 10.9064" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.8217 15.8553C14.3407 17.3293 11.8517 16.0773 9.88672 14.1113" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.88807 14.1147C7.92307 12.1487 6.67107 9.66069 8.14507 8.17969" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.4414 10.9043C10.7604 11.4073 11.1694 11.9053 11.6314 12.3673L11.6334 12.3693C12.0954 12.8313 12.5934 13.2403 13.0964 13.5593" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>

  </>
  )
}


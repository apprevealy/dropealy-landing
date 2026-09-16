'use client'

import { useState, useEffect, useRef } from 'react'

const LazyVideo = ({ src, poster }) => {
  const videoRef = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const resolvedPoster = poster || src.replace(/\.[^/.]+$/i, '.jpg')

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true)
        observer.disconnect()
      }
    }, { rootMargin: '600px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative h-64 w-40 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0b0810] shadow-lg sm:h-96 sm:w-56 md:h-[400px] md:w-64">
      <img src={resolvedPoster} alt="" aria-hidden="true" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isReady ? 'opacity-0' : 'opacity-100'}`} />
      <video ref={videoRef} src={shouldLoad ? src : undefined} autoPlay={shouldLoad} loop muted playsInline preload={shouldLoad ? 'metadata' : 'none'} aria-hidden="true" onLoadedData={() => setIsReady(true)} onCanPlay={() => setIsReady(true)} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

export default function Features() {
  const [openIndex, setOpenIndex] = useState(-1)
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [isValidCoupon, setIsValidCoupon] = useState(false)
  const [isInvalidCoupon, setIsInvalidCoupon] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [couponSecondsLeft, setCouponSecondsLeft] = useState(7 * 60)

  const validCoupons = ['PRESENTE50']

  const steps = [
    {
      id: 'ugc-creator',
      number: '01',
      title: 'UGC Creator com Inteligência Artificial',
      subtitle: 'Gere vídeos de conversão em massa sem precisar contratar gravadores ou aparecer na câmera.',
      description: 'Essa funcionalidade permite cruzar avatares hiper-realistas, cenários estratégicos e scripts validados para criar o criativo perfeito para o seu produto. Gere vídeos de UGC (conteúdo gerado por usuário) ultra-realistas com total controle sobre as narrativas e estética visual.',
      bullets: [
        'Diversidade e Personalidade: Escolha entre dezenas de variações de tons de pele, cores de olhos, estilos de cabelo e perfis comportamentais.',
        'Customização de Cenários: Adapte o ambiente de fundo do vídeo para dar mais naturalidade e contexto à sua oferta.',
        'Fábrica de Criativos: Combine avatares e prompts exclusivos para testar dezenas de variações do mesmo anúncio em minutos.',
      ],
    },
    {
      id: 'radar-produtos',
      number: '02',
      title: 'Radar de Produtos Inteligente',
      subtitle: 'Encontre produtos validados e tendências ocultas antes de todo o mercado.',
      description: 'Essa funcionalidade atua como um scanner inteligente que varre as maiores plataformas de vendas 24 horas por dia. A cada 6 horas, o sistema atualiza o ranking de forma automática, mostrando exatamente quais produtos estão subindo e quais estão descendo em faturamento, permitindo que você minere apenas os campeões de audiência.',
      bullets: [
        'Atualização em Tempo Real: Dados renovados a cada 6 horas para você pegar a onda do produto no momento exato do pico de vendas.',
        'Varredura Multiplataforma: Monitoramento constante em diversos marketplaces para garantir o fornecimento de ideias novas e criativas.',
        'Nichos Validados: Filtre facilmente por variações de nichos de alta conversão e encontre apenas produtos com excelentes avaliações dos clientes.',
      ],
    },
    {
      id: 'animacoes',
      number: '03',
      title: 'Engenharia de Ambientes Inteligente',
      subtitle: 'Combine suas melhores referências visuais e crie o cenário perfeito em segundos.',
      description: 'Essa funcionalidade permite fazer o upload de diferentes imagens e organizá-las na ordem certa. A IA da Revealy analisa os elementos e gera automaticamente um prompt avançado que une todas as características, texturas e iluminações das fotos enviadas em um único cenário ultra-realista.',
      bullets: [
        'Fusão de Referências: Junte fotos de locais diferentes para criar um estúdio ou ambiente totalmente novo e exclusivo.',
        'Prompt Automatizado: Esqueça termos técnicos difíceis. A ferramenta lê as imagens e escreve o comando perfeito por você.',
        'Consistência Cenográfica: Mantenha a mesma identidade visual e qualidade de fundo em toda a sua série de vídeos de UGC.',
      ],
    },
    {
      id: 'revealy-boost',
      number: '04',
      title: 'Revealy Boost',
      subtitle: 'Desbloqueie o TikTok Shop e conquiste seguidores em massa de forma 100% segura.',
      description: 'O Revealy Boost é a nossa tecnologia exclusiva focada em tração orgânica acelerada. Ele otimiza a distribuição dos seus vídeos para forçar o algoritmo a entregar seu conteúdo para o público certo, gerando um ganho massivo de seguidores reais sem infringir nenhuma diretriz da plataforma e sem o risco de compra de bots.',
      bullets: [
        'Passaporte TikTok Shop: Alcance os requisitos mínimos de seguidores rapidamente para liberar sua aba de vendas e começar a faturar.',
        'Crescimento 100% Legalizado: Estratégia baseada estritamente nas regras do algoritmo, mantendo a saúde e a integridade da sua conta blindadas.',
        'Público Qualificado: Atraia seguidores reais que realmente consomem o seu nicho, prontos para virarem compradores dos seus produtos.',
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

  const applyCoupon = () => {
    const upperCoupon = coupon.trim().toUpperCase()
    setCoupon(upperCoupon)
    if (validCoupons.includes(upperCoupon)) {
      setIsValidCoupon(true)
      setIsInvalidCoupon(false)
      setCouponSecondsLeft(7 * 60)
    } else {
      setIsValidCoupon(false)
      setIsInvalidCoupon(true)
    }
  }

  const getPrice = (planName) => {
    if (planName === 'Mensal') {
      return isValidCoupon ? 147 : 375
    } else {
      return isValidCoupon ? 297 : 695
    }
  }

  const getCheckoutLink = (planName) => {
    if (isValidCoupon) {
      return planName === 'Mensal'
        ? 'https://checkout.perfectpay.com.br/pay/PPU38CQDIKL'
        : 'https://checkout.perfectpay.com.br/pay/PPU38CQDIKN'
    } else {
      return planName === 'Mensal'
        ? 'https://checkout.perfectpay.com.br/pay/PPU38CQDJIE'
        : 'https://checkout.perfectpay.com.br/pay/PPU38CQDIQM'
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const couponFromUrl =
      urlParams.get('cupom') ||
      urlParams.get('coupon') ||
      urlParams.get('coupon_code')
    if (couponFromUrl) {
      const upperCoupon = couponFromUrl.trim().toUpperCase()
      setCoupon(upperCoupon)
      setShowCouponInput(true)
      setIsValidCoupon(false)
      setIsInvalidCoupon(false)
    }
  }, [])

  useEffect(() => {
    if (!isValidCoupon || couponSecondsLeft <= 0) return
    const timer = window.setInterval(() => {
      setCouponSecondsLeft((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [isValidCoupon, couponSecondsLeft])

  const couponTimer = `${String(Math.floor(couponSecondsLeft / 60)).padStart(2, '0')}:${String(couponSecondsLeft % 60).padStart(2, '0')}`

  const faqs = [
    {
      question: 'O que é a Revealy?',
      answer: (
        <span className="text-left">
          A Revealy é uma plataforma de tecnologia avançada que utiliza Inteligência Artificial para automatizar e escalar a sua operação de vendas digitais. Ela permite que você crie Avatares UGC (User Generated Content) hiper-realistas e produza vídeos em massa para vender produtos sem precisar aparecer ou contratar influenciadores.
          <br />
          Muito além de um gerador de vídeos, a Revealy é um ecossistema completo para contingência e escala de conteúdo. Ela possui integração direta com os maiores marketplaces do mercado (como TikTok Shop, Amazon, Shopee, Mercado Livre, Shein e AliExpress) e conta com ferramentas exclusivas como o Radar de Produtos (para mineração de tendências a cada 6 horas) e o Revealy Boost (para ganho seguro e acelerado de seguidores orgânicos). É a solução definitiva para quem quer dominar as vendas em lote no piloto automático.
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
          Sim! Ao se tornar um membro, você ganha acesso ao nosso painel exclusivo de orientações e ao nosso modelo oficial de slides no Canva para estruturar suas apresentações de lives e vídeos de alta conversão de forma simples e rápida.
        </span>
      ),
    },
    {
      question: 'Posso Cancelar Quando Quiser?',
      answer: (
        <span className="text-left">
          Sim! O nosso plano mensal pode ser cancelado a qualquer momento, direto pelo seu painel, sem multas, fidelidade ou letras miúdas. Já o plano vitalício é um pagamento único, garantindo seu acesso para sempre sem nenhuma taxa de renovação.
          <br />
          Além disso, independente do plano escolhido, você conta com a nossa Garantia Blindada de 180 dias. Se em até 6 meses você decidir que a ferramenta não é para você, devolvemos todo o seu dinheiro. Risco zero para você testar!
        </span>
      ),
    },
  ]

  const videos = [
    {
      src: '/assets/Vd%2001.MP4',
    },
    {
      src: '/assets/Vd%2003.mp4',
    },
    {
      src: '/assets/Vd%2004.mp4',
    },
    {
      src: '/assets/Vd%2006.mp4',
    },
    {
      src: '/assets/Vd%2007.MP4',
    },
    {
      src: '/assets/Vd%2005.mp4',
    },
    {
      src: '/assets/Vd%2008.mp4',
    },
    {
      src: '/assets/Vd%2009.MP4',
    },
    {
      src: '/assets/T%C3%8ANIS%20GIRANDO%20NA%20M%C3%83O.mp4',
    },
    {
      src: '/assets/DIVULGANDO%20LOOK%20EM%20FRENTE%20AO%20ESPELHO.mp4',
    },
    {
      src: '/assets/VD%20MANEQUIN.mp4',
    },
    {
      src: '/assets/vd-site-01.mp4',
    },
    {
      src: '/assets/vd-site-02.mp4',
    },
    {
      src: '/assets/vd-site-03.mp4',
    },
    {
      src: '/assets/vd-site-04.mp4',
    },
  ]

  const deliveryCards = [
    {
      id: 'produtos-validados',
      title: <>Produtos<br />Validados</>,
      description: <>Encontre produtos que já estão<br />vendendo no TikTok Shop.</>,
      items: ['Tendências em alta', 'Produtos campeões', 'Análise com IA'],
      icon: 'bolt',
      background: 'radial-gradient(circle at 85% 8%, rgba(81,20,144,.58), transparent 42%), linear-gradient(145deg, #0c0b0e 0%, #09090b 100%)',
    },
    {
      id: 'conteudo-ia',
      title: <>Conteúdo<br />com IA</>,
      description: <>Crie vídeos prontos para<br />publicar sem gravar.</>,
      items: ['Vídeos automáticos', 'Roteiros prontos', 'Sem aparecer'],
      icon: 'code',
      reverse: true,
      background: 'radial-gradient(circle at 17% 100%, rgba(81,20,144,.82), transparent 42%), linear-gradient(145deg, #0b0b0d 0%, #09090b 100%)',
    },
    {
      id: 'escala-inteligente',
      title: <>Escala<br />Inteligente</>,
      description: <>Produza mais conteúdo<br />e aumente suas vendas.</>,
      items: ['Publicação estratégica', 'Produção em massa', 'Crescimento acelerado'],
      icon: 'chart',
      background: 'radial-gradient(circle at 7% 0%, rgba(81,20,144,.8), transparent 38%), linear-gradient(145deg, #0b0b0d 0%, #09090b 100%)',
    },
  ]

  const DeliveryIcon = ({ type }) => (
    <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[20px] border border-[#9D63DC]/60 bg-[#281936]/80 text-[#AB7AFF] shadow-[inset_0_0_24px_rgba(157,57,220,.12)] sm:h-[78px] sm:w-[78px]">
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
          <img
            src="/assets/marcas.png"
            alt="Marcas parceiras"
            className="h-[89px] w-[1692px]"
          />
          <img
            src="/assets/marcas.png"
            alt="Marcas parceiras"
            className="h-[89px] w-[1692px]"
          />
        </div>
      </div>

      <section className="relative w-full bg-[#050208] px-6 py-24">
      <div className="mx-auto max-w-[1500px] text-center">
        <span
          className="inline-flex h-[53px] w-[268px] items-center justify-center rounded-full text-sm font-semibold uppercase tracking-wide text-white"
          style={{
            background:
              'linear-gradient(90deg, #511490 0%, #AB7BFF 50%, #511490 97%)',
          }}
        >
          O que entregamos
        </span>

        <h2 className="mt-6 font-articulat text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
          Tudo o que um estrategista{' '}
          <span className="hidden sm:inline">
            <br />
          </span>
          precisa{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #AB7BFF 19%, #FFFFFF 62%, #AB7BFF 100%)',
            }}
          >
            para
          </span>{' '}
          vender{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #AB7BFF 19%, #FFFFFF 62%, #AB7BFF 100%)',
            }}
          >
            mais.
          </span>
        </h2>

        <p className="mx-auto mt-4 max-w-3xl font-articulat text-xl text-white sm:text-2xl">
          Descubra produtos validados, crie conteúdo com{' '}
          <span className="hidden sm:inline">
            <br />
          </span>
          IA e escale suas vendas em uma única plataforma.
        </p>
      </div>

      <div className="delivery-carousel mx-auto mt-16 flex w-full max-w-[1400px] snap-x snap-mandatory gap-5 overflow-x-auto px-[7vw] pb-5 sm:px-8 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {deliveryCards.map((card) => (
          <article
            key={card.id}
            className="relative flex min-h-[570px] w-[86vw] max-w-[430px] flex-none snap-center flex-col overflow-hidden rounded-[28px] border border-white/10 p-7 text-left shadow-[0_24px_80px_rgba(0,0,0,.35)] sm:min-h-[610px] sm:p-9 lg:min-h-[620px] lg:w-full lg:max-w-none"
            style={{ background: card.background }}
          >
            {card.id === 'escala-inteligente' && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] opacity-60" style={{ background: 'linear-gradient(140deg, transparent 0 28%, #250746 28% 38%, transparent 38% 48%, #3c086e 48% 63%, #1f053d 63%)' }} />
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
                      <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[15px] border border-[#9D63DC]/60 bg-[#281936]/80 font-articulat text-[28px] text-white sm:h-[58px] sm:w-[58px] sm:text-[31px]">
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
        <h2 className="font-manrope text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl">
          A tecnologia que cria Avatares UGC com
          <br />
          IA.{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #AB7BFF 19%, #FFFFFF 62%, #AB7BFF 100%)',
            }}
          >
            Escale suas vendas sem aparecer.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-3xl font-articulat text-base text-white sm:text-lg">
          A Revealy é uma plataforma avançada de Inteligência Artificial focada na criação automatizada de vídeos e avatares hiper-realistas de UGC para explodir suas vendas. Construa um ecossistema de conteúdo. Eleve o padrão da sua operação e venda no piloto automático.
        </p>

        <div className="relative mx-auto mt-12 w-full max-w-6xl overflow-hidden rounded-[24px] border border-white/10 bg-[#0D0D0D] p-8 sm:p-10 lg:p-12">
          <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-[#511490] opacity-30 blur-[120px]" />

          <div className="relative z-10">
            <div className="mb-6 flex justify-end">
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`h-2 w-2 rounded-full transition ${
                      index === currentStep ? 'bg-purple-400' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col gap-6">
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border border-purple-400/30 bg-purple-900/20">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L4.09 12.11C3.89 12.35 3.78 12.65 3.78 12.96C3.78 13.58 4.28 14.08 4.9 14.08H11V22L19.91 11.89C20.11 11.65 20.22 11.35 20.22 11.04C20.22 10.42 19.72 9.92 19.1 9.92H13V2Z" stroke="#AB7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <h3 className="text-left font-manrope text-2xl font-semibold leading-tight sm:text-3xl">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #AB7BFF 19%, #FFFFFF 62%, #AB7BFF 100%)',
                    }}
                  >
                    {steps[currentStep].title}
                    <br />
                    {steps[currentStep].subtitle}
                  </span>
                </h3>

                <p className="text-left text-sm leading-relaxed text-white">
                  {steps[currentStep].description}
                </p>

                <ul className="flex flex-col gap-3 text-left text-sm text-white/80">
                  {steps[currentStep].bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-white" />
                      <span><strong className="text-white">{bullet.split(':')[0]}:</strong>{bullet.split(':').slice(1).join(':')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-[#161616]">
                {currentStep < 2 ? (
                  <video
                    key={steps[currentStep].id}
                    src={currentStep === 0 ? '/assets/ugc-cam-animation-01.mp4' : '/assets/ugc-cam-animation-02.mp4'}
                    poster={currentStep === 0 ? '/assets/ugc-cam-animation-01.jpg' : '/assets/ugc-cam-animation-02.jpg'}
                    autoPlay
                    muted
                    playsInline
                    preload="metadata"
                    onEnded={nextStep}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-4">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex h-[59px] items-center justify-start gap-4 rounded-full border text-sm font-semibold tracking-wide text-white transition pl-6 ${
                currentStep === index
                  ? 'border-[#3b2c55]'
                  : 'border-purple-400/30 bg-purple-900/10 hover:border-purple-400/60 hover:bg-purple-900/30'
              }`}
              style={{
                background: currentStep === index
                  ? 'linear-gradient(90deg, #AB7AFF 0%, #C19DFF 50%, #AB7AFF 100%)'
                  : 'linear-gradient(90deg, rgba(171, 122, 255, 0.05) 0%, rgba(171, 122, 255, 0.3) 100%)',
                width: '209px',
              }}
            >
              {step.id === 'ugc-creator' && (
                <>
                  <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="33" height="33" rx="16.5" fill="url(#paint0_linear_ugc)" />
                    <path d="M16.025 22V12.8287L14.005 13.35V11.835L16.8069 10.597H18.0286V22H16.025Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_ugc" x1="0" y1="16.5" x2="33" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#CDC4EC" />
                        <stop offset="0.35" stop-color="#AE78F4" />
                        <stop offset="0.65" stop-color="#545096" />
                        <stop offset="1" stop-color="#303579" />
                      </linearGradient>
                    </defs>
                  </svg>
                  UGC Creator
                </>
              )}
              {step.id === 'radar-produtos' && (
                <>
                  <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="33" height="33" rx="16.5" fill="url(#paint0_linear_radar)" />
                    <path d="M12.3797 22V20.5828C13.1073 20.0072 13.8023 19.4316 14.4648 18.856C15.1272 18.2804 15.7245 17.7103 16.2567 17.1456C16.7888 16.5809 17.2069 16.027 17.511 15.484C17.8151 14.941 17.9671 14.4197 17.9671 13.9202C17.9671 13.5944 17.9074 13.2903 17.7879 13.0079C17.6685 12.7256 17.4784 12.4975 17.2178 12.3237C16.968 12.15 16.6314 12.0631 16.2078 12.0631C15.7951 12.0631 15.4422 12.1554 15.149 12.34C14.8666 12.5246 14.6548 12.7744 14.5137 13.0894C14.3725 13.3934 14.3019 13.741 14.3019 14.1319H12.4122C12.434 13.3066 12.6132 12.617 12.9498 12.0631C13.2865 11.5092 13.7426 11.0966 14.3182 10.8251C14.8938 10.5427 15.5399 10.4015 16.2567 10.4015C17.0277 10.4015 17.6848 10.5427 18.2278 10.8251C18.7708 11.1074 19.1889 11.5038 19.4821 12.0142C19.7753 12.5246 19.9219 13.1274 19.9219 13.8224C19.9219 14.3328 19.8242 14.8378 19.6287 15.3374C19.4441 15.8261 19.1835 16.3039 18.8468 16.7709C18.5101 17.227 18.13 17.6723 17.7065 18.1067C17.2938 18.5302 16.8648 18.9375 16.4196 19.3284C15.9743 19.7085 15.5454 20.0615 15.1327 20.3873H20.2314V22H12.3797Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_radar" x1="0" y1="16.5" x2="33" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#CDC4EC" />
                        <stop offset="0.35" stop-color="#AE78F4" />
                        <stop offset="0.65" stop-color="#545096" />
                        <stop offset="1" stop-color="#303579" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Radar de Produtos
                </>
              )}
              {step.id === 'animacoes' && (
                <>
                  <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="33" height="33" rx="16.5" fill="url(#paint0_linear_prompts)" />
                    <path d="M16.3544 22.1955C15.6159 22.1955 14.9426 22.0652 14.3345 21.8045C13.7263 21.533 13.2376 21.1258 12.8684 20.5828C12.51 20.0289 12.3199 19.3339 12.2982 18.4976H14.2204C14.2313 18.8777 14.3182 19.2253 14.4811 19.5402C14.6548 19.8443 14.8992 20.0886 15.2141 20.2733C15.5291 20.447 15.9092 20.5339 16.3544 20.5339C16.778 20.5339 17.1363 20.4524 17.4296 20.2895C17.7336 20.1266 17.9617 19.904 18.1137 19.6217C18.2658 19.3393 18.3418 19.0244 18.3418 18.6768C18.3418 18.2533 18.2386 17.9058 18.0323 17.6343C17.826 17.3519 17.5436 17.1401 17.1852 16.999C16.8268 16.8578 16.4196 16.7872 15.9635 16.7872H15.1164V15.1745H15.9635C16.5608 15.1745 17.0495 15.0387 17.4296 14.7672C17.8097 14.4849 17.9997 14.0776 17.9997 13.5455C17.9997 13.1002 17.8531 12.7418 17.5599 12.4703C17.2775 12.1988 16.8703 12.0631 16.3381 12.0631C15.7843 12.0631 15.3444 12.226 15.0186 12.5518C14.7037 12.8776 14.5299 13.2794 14.4974 13.7573H12.5751C12.6077 13.0731 12.7815 12.4812 13.0964 11.9816C13.4222 11.4712 13.8621 11.0803 14.4159 10.8088C14.9698 10.5373 15.6159 10.4015 16.3544 10.4015C17.1255 10.4015 17.7771 10.5373 18.3092 10.8088C18.8414 11.0803 19.2432 11.4441 19.5147 11.9002C19.797 12.3563 19.9382 12.8559 19.9382 13.3989C19.9382 13.8224 19.8568 14.2079 19.6939 14.5555C19.531 14.903 19.3083 15.1962 19.026 15.4351C18.7545 15.6632 18.4341 15.8315 18.0649 15.9401C18.4884 16.027 18.8631 16.1953 19.1889 16.4451C19.5255 16.6949 19.7862 17.0153 19.9708 17.4062C20.1663 17.7863 20.264 18.2316 20.264 18.742C20.264 19.361 20.112 19.9366 19.8079 20.4687C19.5147 20.99 19.0749 21.4081 18.4884 21.7231C17.9128 22.038 17.2015 22.1955 16.3544 22.1955Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_prompts" x1="0" y1="16.5" x2="33" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#CDC4EC" />
                        <stop offset="0.35" stop-color="#AE78F4" />
                        <stop offset="0.65" stop-color="#545096" />
                        <stop offset="1" stop-color="#303579" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Animações
                </>
              )}
              {step.id === 'revealy-boost' && (
                <>
                  <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="33" height="33" rx="16.5" fill="url(#paint0_linear_boost)" />
                    <path d="M17.3531 22V19.8334H11.7005V18.2696L17.0762 10.597H19.2916V18.123H20.8392V19.8334H19.2916V22H17.3531ZM13.8019 18.123H17.4671V12.7473L13.8019 18.123Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_boost" x1="0" y1="16.5" x2="33" y2="16.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#CDC4EC" />
                        <stop offset="0.35" stop-color="#AE78F4" />
                        <stop offset="0.65" stop-color="#545096" />
                        <stop offset="1" stop-color="#303579" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Revealy Boost
                </>
              )}
            </button>
          ))}
        </div>

        <div
          className="sales-ticker left-1/2 mt-20 w-screen -translate-x-1/2 sm:mt-24"
          aria-label="Venda sem aparecer"
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
                    <span>Venda sem aparecer</span>
                    <span className="sales-ticker__dot">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-6xl text-center sm:mt-28">
          <p className="font-articulat text-xs font-semibold uppercase tracking-[0.28em] text-[#AC87FD]">
            O mercado já explodiu
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-articulat text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
            Os prompts <span className="text-[#AC87FD]">secretos</span> que estão
            <br className="hidden sm:block" /> <em className="font-normal">Viralizando No TikTok.</em>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl font-articulat text-base leading-relaxed text-white/65 sm:text-lg">
            Biblioteca privada de prompts UGC testados e prontos para colar. Cada movimento você vê aqui primeiro — é o que os alunos usam para gerar vídeos hiper-realistas que enganam a plataforma e explodem no For You.
          </p>

          <div className="relative mx-auto mt-12 overflow-hidden rounded-2xl">
            <div className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-[#050208] to-transparent sm:w-24" />
            <div className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-[#050208] to-transparent sm:w-24" />

            <div className="flex w-max gap-3 animate-marquee sm:gap-4">
              {[...videos, ...videos].map((video, index) => (
                <LazyVideo key={index} src={video.src} poster={video.poster} />
              ))}
            </div>
          </div>

          <div className="arsenal-section mx-auto mt-28 max-w-5xl">
            <p className="font-articulat text-xs font-semibold uppercase tracking-[0.22em] text-[#AC87FD]">
              Seu arsenal completo
            </p>
            <h3 className="mx-auto mt-3 max-w-2xl font-articulat text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Tudo o que você precisa para<br className="hidden sm:block" /> começar já está incluso
            </h3>
            <p className="mx-auto mt-4 max-w-2xl font-articulat text-sm leading-relaxed text-white/55 sm:text-base">
              Ao garantir seu acesso, você recebe todas as ferramentas abaixo sem pagar nada à parte: prompts, IA, saldo para gerar vídeos e editor profissional.
            </p>

            <div className="mt-10 space-y-4 text-left">
              <article className="arsenal-card arsenal-card--blue">
                <img className="arsenal-thumb" src="/assets/prompts-virais.png" alt="Biblioteca com mais de 500 prompts virais" />
                <div>
                  <h4>+ de 500 Prompts Virais</h4>
                  <p>Prompts de movimentos prontos para copiar e colar e criar vídeos ultra-realistas, com gestos, expressões e movimentos humanizados.</p>
                </div>
              </article>
              <article className="arsenal-card arsenal-card--purple">
                <img className="arsenal-thumb" src="/assets/revealy-influencers.png" alt="Revealy IA para criação de influencers" />
                <div>
                  <h4>Revealy IA</h4>
                  <p>A inteligência artificial completa para criar influenciadoras UGC hiper-realistas, trocar identidades e roupas, clonar movimentos e montar workflows em um só lugar.</p>
                </div>
              </article>
              <article className="arsenal-card arsenal-card--pink">
                <img className="arsenal-thumb" src="/assets/flow-1k.jpg" alt="Conta Flow VEO3 com 1.050 créditos" />
                <div>
                  <h4>Flow com 1K de saldo</h4>
                  <p>Você recebe uma conta Flow com 1.000 créditos para transformar suas ideias em vídeos profissionais e começar a produzir desde o primeiro dia.</p>
                </div>
              </article>
              <article className="arsenal-card arsenal-card--gray">
                <img className="arsenal-thumb" src="/assets/capcut-pro.jpg" alt="Acesso ao CapCut Pro" />
                <div>
                  <h4>CapCut Pro</h4>
                  <p>Editor profissional completo para finalizar seus vídeos, adicionar legendas, efeitos, áudio e deixar cada conteúdo pronto para vender no TikTok Shop.</p>
                </div>
              </article>
              <div className="arsenal-anchor">
                <div className="text-left">
                  <span>Valor real de tudo isso</span>
                  <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1">
                    <strong>R$ 7.633,80</strong>
                    <b>hoje sai por uma fração</b>
                  </div>
                </div>
                <a href="#planos" className="arsenal-cta">
                  Quero garantir minha vaga <span>→</span>
                </a>
              </div>
            </div>
          </div>

          <div className="relative mx-auto mt-28 max-w-3xl text-center">
            <div
              className="absolute top-0 z-0 hidden h-[933px] w-[933px] -translate-y-1/2 rounded-full bg-[#511490] opacity-60 blur-[150px] lg:block"
              style={{ right: '-800px' }}
            />
            <h3 className="relative z-10 font-articulat text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
              Escolha o ritmo da
              <br />
              sua criação.
            </h3>

            <p className="mx-auto mt-2 font-articulat text-lg text-white sm:text-xl">
              Cancele quando quiser. Sem letras miúdas.
            </p>

            <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-4">
              {showCouponInput ? (
                <div className="flex w-full max-w-[535px] flex-col items-center gap-2 px-4 sm:px-0">
                  <div className="flex w-full flex-col items-center gap-2 sm:flex-row">
                    <input
                      type="text"
                      placeholder="Digite seu cupom"
                      value={coupon}
                      onChange={(e) => {
                        setCoupon(e.target.value)
                        setIsValidCoupon(false)
                        setIsInvalidCoupon(false)
                      }}
                      className="h-[59px] w-full rounded-full border border-white/30 bg-black/30 px-6 text-sm text-white placeholder-white/50 backdrop-blur-sm focus:border-white/60 focus:outline-none sm:flex-1"
                      autoFocus
                    />
                    <button
                      onClick={applyCoupon}
                      className="flex h-[59px] w-full items-center justify-center rounded-full border text-sm font-semibold tracking-wide text-white transition hover:brightness-110 sm:w-[166px]"
                      style={{
                        backgroundColor: '#AB7AFF',
                        borderColor: '#3b2c55',
                        background:
                          'linear-gradient(90deg, #AB7AFF 0%, #C19DFF 50%, #AB7AFF 100%)',
                      }}
                    >
                      APLICAR
                    </button>
                  </div>
                  {isValidCoupon && (
                    <div className="coupon-gift-card text-left">
                      <div className="coupon-gift-icon" aria-hidden="true">
                        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                          <path d="M20 12v9H4v-9M2 7h20v5H2V7ZM12 7v14M12 7H7.5A2.5 2.5 0 1 1 10 4.5L12 7Zm0 0h4.5A2.5 2.5 0 1 0 14 4.5L12 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <span>Cupom presente aplicado</span>
                        <strong>{coupon}</strong>
                        <p>Este é um Cupom Presente Revealy. Quem compartilhou este código <b>abriu mão da própria comissão</b> para liberar um benefício especial para você.</p>
                      </div>
                    </div>
                  )}
                  {isInvalidCoupon && (
                    <p className="text-sm font-semibold text-red-400">Cupom inválido</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowCouponInput(true)}
                  className="flex h-[59px] w-[535px] items-center justify-center rounded-full border text-sm font-semibold tracking-wide text-white transition hover:brightness-110"
                  style={{
                    backgroundColor: '#AB7AFF',
                    borderColor: '#3b2c55',
                    background:
                      'linear-gradient(90deg, #AB7AFF 0%, #C19DFF 50%, #AB7AFF 100%)',
                  }}
                >
                  TEM UM CUPOM OU INDICAÇÃO?
                </button>
              )}
            </div>

            <div id="planos" className="relative mx-auto mt-16 flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-stretch">
              <div
                className="absolute top-1/2 z-0 hidden h-[933px] w-[933px] -translate-y-1/2 rounded-full bg-[#511490] opacity-60 blur-[150px] lg:block"
                style={{ left: '-800px' }}
              />
              <div
                className="relative z-10 w-full max-w-[425px] rounded-[18px] border border-[rgba(171,122,255,0.25)] px-6 py-8 backdrop-blur-[14px] sm:px-[37px] sm:py-[47px]"
                style={{ backdropFilter: 'blur(14.25px)', minHeight: '845px', background: 'rgba(80, 80, 80, 0.2)' }}
              >
                <div className="border-b border-[rgba(248,247,243,0.25)] pb-[19px] text-left">
                  <p className="font-articulat text-[13px] font-normal leading-[1.6] text-[#e3e2dd]">
                    Plano
                  </p>
                  <p className="font-articulat mt-[6px] text-[28px] font-semibold leading-[0.76] text-white">
                    Ideal para começar a vender
                  </p>
                </div>

                <div className="mt-[22px] flex items-center">
                  <p className={`font-albert text-[36px] font-semibold leading-[0.76] tracking-normal ${isValidCoupon ? 'text-[#AB7AFF]' : 'text-white'}`}>
                    R${getPrice('Mensal')}
                  </p>
                  <p className={`font-albert text-[16px] font-normal leading-[0.76] tracking-normal ${isValidCoupon ? 'text-[#AB7AFF]' : 'text-white'}`}>
                    /por mês
                  </p>
                  <p className="font-albert text-[28px] font-semibold leading-[0.76] tracking-normal text-white">

                  </p>
                </div>

                <div className="mt-[22px] flex flex-col gap-[4px]">
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Acesso mensal à plataforma
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Espionagem de produtos em alta
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Gerador de vídeos com IA
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Gerador de imagens com IA
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Calendário de postagens
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Tutorial completo passo a passo
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Indique e Ganhe
                    </p>
                  </div>
                </div>

                <div className="mt-[22px] h-0 w-[297px]">
                  <div className="h-0 w-[297px] border-b border-white/20" />
                </div>

                <a
                  href={getCheckoutLink('Mensal')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mx-auto mt-[22px] flex h-[52px] w-[247px] items-center justify-center rounded-[82px] bg-[#3d3d3d] transition hover:bg-[#4d4d4d]"
                >
                  <div className="absolute left-[5px] top-1/2 h-[39px] w-[40px] -translate-y-1/2 overflow-hidden rounded-[39px] bg-white flex items-center justify-center">
                    <svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40.1176" height="39.2989" rx="19.6495" fill="white"/>
                      <path d="M22.0488 14.6816L27.0185 19.6513L22.0488 24.621" stroke="black" stroke-width="1.22809" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M13.1016 19.6523H26.8807" stroke="black" stroke-width="1.22809" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <p className="font-articulat text-[13px] font-medium text-white whitespace-nowrap">
                    Quero começar agora
                  </p>
                </a>

                <div className="hidden">
                  <svg width="111" height="9" viewBox="0 0 111 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M109.853 2.42777C109.913 1.89382 109.807 1.51443 109.503 1.16844C109.139 0.754143 108.483 0.57666 107.642 0.57666H105.203C105.12 0.576696 105.04 0.606331 104.977 0.660242C104.914 0.714154 104.872 0.78881 104.859 0.870804L103.843 7.31155C103.838 7.34146 103.84 7.37205 103.848 7.40121C103.856 7.43036 103.871 7.45739 103.89 7.48042C103.91 7.50346 103.935 7.52195 103.962 7.53463C103.99 7.5473 104.02 7.55386 104.05 7.55384H105.424L105.323 8.19198C105.316 8.23666 105.319 8.28234 105.331 8.32588C105.343 8.36941 105.365 8.40977 105.394 8.44416C105.424 8.47856 105.46 8.50619 105.501 8.52513C105.542 8.54408 105.587 8.55391 105.632 8.55393H106.902C107.115 8.55393 107.297 8.39938 107.331 8.18949L107.344 8.12468L107.583 6.6076L107.598 6.52584L107.598 6.52235C107.605 6.481 107.626 6.44333 107.658 6.41616C107.69 6.389 107.73 6.37414 107.772 6.37428H107.961C108.593 6.37428 109.17 6.24665 109.629 5.9206C109.818 5.78599 109.984 5.61997 110.124 5.41956C110.357 5.09567 110.507 4.72014 110.563 4.32524C110.684 3.70405 110.628 3.15066 110.279 2.75282C110.171 2.63278 110.043 2.53313 109.9 2.45868L109.853 2.42827V2.42777ZM106.105 4.97385C106.155 4.94805 106.21 4.93454 106.265 4.93447H106.981C108.387 4.93447 109.487 4.36413 109.809 2.71294L109.811 2.70496C109.919 2.76678 110.01 2.83957 110.084 2.92333C110.356 3.23392 110.422 3.6886 110.308 4.27439C110.173 4.97086 109.876 5.42454 109.479 5.70722C109.079 5.99139 108.561 6.11354 107.962 6.11354H107.772C107.669 6.1134 107.569 6.15017 107.49 6.21723C107.411 6.2843 107.359 6.37727 107.342 6.47947L107.327 6.56123L107.088 8.07831L107.076 8.14313L107.076 8.14512C107.069 8.18633 107.048 8.22383 107.016 8.25087C106.984 8.27792 106.944 8.29275 106.902 8.29269H105.633C105.625 8.29272 105.617 8.29107 105.61 8.28787C105.604 8.28467 105.597 8.27999 105.592 8.27416C105.587 8.26832 105.584 8.26147 105.582 8.25408C105.58 8.24669 105.579 8.23894 105.58 8.23137L105.684 7.57329L106.105 4.97385Z" fill="#D1CFC7"/>
                    <path d="M83.9918 1.14307C83.6704 2.73012 83.3564 4.27453 83.0426 5.81885C82.9621 6.2149 82.8816 6.62338 82.7975 6.98389C82.6163 7.75984 81.9463 7.96631 80.9703 7.96631H68.3453C68.6806 6.36007 68.9919 4.67561 69.3424 3.03662C69.4113 2.71438 69.4594 2.37285 69.5475 2.06201C69.7166 1.46583 70.3027 1.17702 71.0192 1.14307H83.9918ZM73.86 3.89014C73.5725 3.78198 73.222 3.91084 73.0699 4.03369V4.03271C73.0725 3.97987 73.0908 3.94296 73.0934 3.89014H72.8014C72.6796 4.70217 72.5349 5.49162 72.3824 6.27295H72.7223C72.7715 5.96865 72.8042 5.64778 72.8727 5.36279C72.9505 5.6623 73.4568 5.60555 73.6705 5.48975C74.1116 5.25074 74.4517 4.11286 73.86 3.89014ZM79.7467 4.15967C79.7217 3.72538 79.0035 3.87836 78.6012 3.89014C78.5845 3.98419 78.5585 4.06971 78.5377 4.15967C78.7383 4.10931 79.3624 3.9551 79.4225 4.22314C79.4423 4.31208 79.4084 4.40656 79.3834 4.47607C78.8189 4.42249 78.3579 4.51654 78.2369 4.91943C78.156 5.18901 78.2462 5.4544 78.4186 5.52881C78.7511 5.67149 79.1565 5.5083 79.2965 5.28369C79.282 5.36137 79.2675 5.43974 79.2721 5.53662H79.5651C79.5682 5.25622 79.6089 5.02919 79.652 4.77686C79.6887 4.56205 79.7576 4.34928 79.7467 4.15967ZM82.2906 3.17822C82.2616 3.43369 82.2229 3.67946 82.1725 3.91357C81.3392 3.64935 80.8275 4.26387 80.8365 5.02197C80.8384 5.16863 80.8641 5.31475 80.9557 5.41846C81.1136 5.59685 81.5646 5.63959 81.7926 5.48975C81.8368 5.46066 81.8824 5.40735 81.9117 5.37061C81.9337 5.34288 81.9679 5.2708 81.9742 5.2915C81.9623 5.37174 81.9447 5.44613 81.943 5.53662H82.2516C82.3109 4.68337 82.4943 3.9545 82.6305 3.17822H82.2906ZM78.2535 3.88232C77.796 3.80748 77.3617 3.85429 77.1315 4.09619C76.9061 4.33314 76.7585 4.87757 76.8629 5.22021C76.9852 5.62086 77.5325 5.64313 77.9762 5.48975C77.9958 5.40916 78.0067 5.31875 78.024 5.23584C77.7816 5.36205 77.3185 5.42768 77.2106 5.14893C77.1793 5.06794 77.1706 4.9342 77.1783 4.83252C77.1959 4.60374 77.2795 4.32478 77.4078 4.19873C77.5851 4.02498 77.9347 4.0542 78.2135 4.15186C78.2222 4.05765 78.2416 3.97323 78.2535 3.88232ZM75.1481 3.85889C74.9026 3.87784 74.695 3.94835 74.5475 4.104C74.3666 4.29488 74.2205 4.71676 74.2633 5.10107C74.3245 5.64934 75.0053 5.63043 75.5504 5.49756C75.5597 5.40133 75.5834 5.31866 75.5983 5.22803C75.3737 5.31223 74.9835 5.42998 74.7526 5.28369C74.5783 5.17319 74.5775 4.89297 74.6344 4.6499C75.0007 4.63824 75.3818 4.64047 75.7487 4.6499C75.772 4.47768 75.8382 4.28969 75.7799 4.11963C75.703 3.89515 75.4279 3.83735 75.1481 3.85889ZM70.1305 3.2251C69.9947 3.9968 69.8709 4.78083 69.7194 5.53662H70.1071C70.1678 5.14899 70.2244 4.75742 70.3043 4.38916C70.6344 4.38099 71.0301 4.36672 71.3473 4.39697C71.2819 4.77991 71.2032 5.14922 71.1422 5.53662H71.5289C71.6533 4.7536 71.7847 3.97708 71.9401 3.2251H71.5446C71.496 3.54061 71.4412 3.85046 71.3864 4.15967C71.0345 4.16338 70.6749 4.17723 70.3356 4.15186C70.3997 3.84938 70.4457 3.52809 70.5094 3.2251H70.1305ZM72.1608 3.89014C72.152 3.89167 72.1523 3.90267 72.153 3.91357C72.0781 4.47444 71.977 5.00922 71.8688 5.53662H72.2086C72.2902 4.97197 72.3834 4.41916 72.5006 3.89014H72.1608ZM77.0201 3.89014C76.719 3.76855 76.4824 3.97457 76.3727 4.16748C76.3975 4.08163 76.4082 3.98083 76.4283 3.89014H76.1276C76.0542 4.46039 75.9462 4.99591 75.8434 5.53662H76.1832C76.2308 5.21562 76.2514 4.78305 76.3571 4.47607C76.4415 4.23075 76.6623 4.02126 76.9811 4.13525C76.9856 4.04493 77.011 3.97579 77.0201 3.89014ZM81.027 3.89795C80.7267 3.74756 80.4761 4.00051 80.3785 4.15186C80.4063 4.07421 80.4083 3.96977 80.4342 3.89014H80.1334C80.0525 4.45546 79.9552 5.0042 79.8414 5.53662H80.1891C80.1913 5.3185 80.2342 5.15687 80.2682 4.94287C80.3409 4.48597 80.4475 3.98467 80.9791 4.13525C80.9967 4.05804 81.0046 3.97039 81.027 3.89795ZM73.0621 4.23877C73.2411 4.01983 73.7662 3.99318 73.8199 4.35693C73.8663 4.67307 73.7419 5.06821 73.5914 5.22803C73.4096 5.42092 72.9624 5.41778 72.9274 5.09326C72.9122 4.95214 72.9649 4.80373 72.9908 4.65771C73.0171 4.51004 73.0363 4.36842 73.0621 4.23877ZM81.7223 4.07275C81.8923 4.05378 82.0156 4.0926 82.1403 4.13525C82.0256 4.59783 82.067 5.34347 81.5319 5.35498C81.3034 5.35973 81.1895 5.21783 81.1842 4.98291C81.1751 4.5711 81.3562 4.11378 81.7223 4.07275ZM79.3512 4.6665C79.3214 4.8529 79.2872 5.08943 79.1539 5.22021L79.0748 5.27783C78.8641 5.39659 78.4937 5.38895 78.5377 5.02979C78.5797 4.68923 78.9498 4.61732 79.3512 4.6665ZM75.1246 4.06396C75.3691 4.05472 75.5436 4.15488 75.4713 4.46045H74.6735C74.6987 4.27665 74.8646 4.07392 75.1246 4.06396ZM72.4059 3.20166C72.3377 3.21321 72.2987 3.23659 72.2721 3.27295C72.2292 3.33148 72.1892 3.50802 72.2555 3.57373C72.3201 3.6375 72.465 3.60339 72.5084 3.57373C72.5762 3.52701 72.6637 3.31374 72.5641 3.2251C72.5325 3.19707 72.4794 3.18918 72.4059 3.20166Z" fill="#D1CFC7"/>
                    <path d="M62.9296 8.99253H51.9817C51.7584 8.99253 51.5442 8.9038 51.3862 8.74587C51.2283 8.58793 51.1396 8.37373 51.1396 8.15038V4.60776H51.7463L51.8831 4.27651H52.1895L52.326 4.60635H53.5197V4.35546L53.6264 4.60811H54.246L54.3527 4.35125V4.60741H57.3188V4.06563H57.375C57.415 4.06703 57.4266 4.07054 57.4266 4.13721V4.60811H58.961V4.48214C59.1179 4.56179 59.3028 4.60846 59.4989 4.60846L59.5323 4.60811H59.5305H60.1762L60.3144 4.27827H60.6207L60.7558 4.60811H62.0001V4.29441L62.1882 4.60811H63.1833V2.53643H62.1984V2.781L62.0605 2.53643H61.0478V2.781L60.9211 2.53643H59.5537C59.3465 2.52596 59.1401 2.5686 58.954 2.6603L58.9614 2.65714V2.53643H58.0182V2.65714C57.904 2.56715 57.7598 2.52411 57.615 2.53678H57.6171H54.1703L53.939 3.0719L53.7015 2.53678H52.6158V2.78136L52.4961 2.53678H51.5698L51.1406 3.51929V1.41392C51.1406 1.19057 51.2294 0.976369 51.3873 0.818436C51.5452 0.660503 51.7594 0.571777 51.9828 0.571777H62.9307C63.154 0.571777 63.3682 0.660503 63.5262 0.818436C63.6841 0.976369 63.7728 1.19057 63.7728 1.41392V5.09129H63.1156C63.1051 5.09059 63.0924 5.09059 63.0802 5.09059C62.9279 5.09059 62.7865 5.1362 62.6686 5.21445L62.6714 5.2127V5.09129H61.6994C61.5475 5.0829 61.3973 5.12605 61.273 5.21375L61.2752 5.21235V5.09094H59.5396V5.21235C59.3976 5.13222 59.2371 5.09039 59.074 5.09094H59.0603H59.061H57.916V5.21235C57.7665 5.11653 57.589 5.07388 57.4122 5.09129L57.4153 5.09094H56.1342L55.8409 5.40815L55.5665 5.09094H53.6527V7.16402H55.5307L55.8328 6.8419L56.1174 7.16402H57.275V6.67873H57.4364C57.5916 6.6848 57.7464 6.65888 57.8911 6.60259L57.8834 6.6054V7.16472H58.8378V6.62469H58.8838C58.9421 6.62469 58.948 6.6268 58.948 6.68575V7.16507H61.8485L61.884 7.16577C62.0503 7.16577 62.2054 7.11595 62.3345 7.03068L62.3313 7.03243V7.16507H63.2514L63.2952 7.16577C63.4675 7.16577 63.6314 7.13033 63.7802 7.06612L63.7721 7.06928V8.15073C63.7721 8.37408 63.6834 8.58828 63.5255 8.74622C63.3675 8.90415 63.1533 8.99288 62.93 8.99288L62.9296 8.99253ZM58.5452 6.87348H58.188V5.38744H59.0077C59.1557 5.37372 59.3048 5.39863 59.4403 5.45973L59.4347 5.45762C59.5445 5.51798 59.6179 5.63307 59.6179 5.76501L59.6172 5.78852V5.78746L59.6175 5.8008C59.6175 5.97133 59.5147 6.118 59.3673 6.18187L59.3645 6.18292C59.4351 6.20818 59.494 6.25134 59.5379 6.30714L59.5386 6.30784C59.5881 6.38985 59.6089 6.48605 59.5975 6.58118L59.5979 6.57908V6.87313H59.2414V6.68715C59.2583 6.5859 59.2379 6.48196 59.1842 6.39451L59.1852 6.39626C59.1482 6.36815 59.1058 6.34784 59.0607 6.33656C59.0156 6.32528 58.9687 6.32327 58.9228 6.33065L58.9249 6.33029H58.5452V6.87313V6.87348ZM58.5452 5.69448V6.02818H58.9768C59.0377 6.0338 59.0991 6.02289 59.1544 5.99659L59.1522 5.99765C59.1748 5.98307 59.1934 5.96307 59.2063 5.93947C59.2191 5.91587 59.2259 5.88943 59.2259 5.86255L59.2256 5.85448V5.85483C59.2273 5.82801 59.2214 5.80125 59.2086 5.77765C59.1957 5.75405 59.1764 5.73458 59.1529 5.72149L59.1522 5.72114C59.099 5.69733 59.0405 5.68766 58.9824 5.69307H58.9838L58.5452 5.69448ZM55.3784 6.87313H53.9724V5.38744H55.4005L55.8374 5.87448L56.289 5.38744H57.4234C57.8262 5.38744 58.022 5.5478 58.022 5.87694C58.022 6.21204 57.8196 6.37486 57.4044 6.37486H56.9606V6.87278H56.2704L55.8331 6.38188L55.3787 6.87313H55.3784ZM56.6069 5.54675L56.0616 6.13274L56.6069 6.73768V5.54675ZM54.3264 6.26784V6.56329H55.1994L55.603 6.12748L55.2149 5.69448H54.3261V5.96466H55.1057V6.26748L54.3264 6.26784ZM56.9606 5.69483V6.07309H57.4192C57.5595 6.07309 57.6402 6.00151 57.6402 5.87659C57.6402 5.75729 57.5652 5.69448 57.423 5.69448L56.9606 5.69483ZM63.29 6.87383H62.6043V6.55452H63.2872C63.3383 6.56156 63.3901 6.5482 63.4314 6.51732L63.431 6.51767C63.4442 6.50544 63.4547 6.49062 63.4619 6.47414C63.4691 6.45765 63.4728 6.43986 63.4728 6.42188V6.42083V6.41626C63.4728 6.3985 63.469 6.38095 63.4615 6.36483C63.4541 6.34871 63.4432 6.33441 63.4296 6.32293C63.3933 6.29668 63.3485 6.28492 63.304 6.28994H63.3047L63.2391 6.28784C62.9184 6.27942 62.5552 6.26959 62.5552 5.82992C62.5552 5.61588 62.6893 5.38744 63.0644 5.38744H63.7721V5.70395H63.1247C63.0747 5.69835 63.0242 5.70841 62.9801 5.73272L62.9816 5.73202C62.9642 5.74342 62.9503 5.75928 62.9412 5.77793C62.9321 5.79658 62.9283 5.81732 62.93 5.83799V5.83764V5.8415C62.93 5.86514 62.9374 5.88818 62.9513 5.90734C62.9652 5.92649 62.9847 5.94078 63.0072 5.94817L63.0079 5.94852C63.0524 5.96224 63.0989 5.96794 63.1454 5.96537H63.1444L63.337 5.97028C63.4822 5.95579 63.6273 5.99902 63.7409 6.09063L63.7398 6.08993C63.7504 6.09835 63.7595 6.10748 63.7676 6.11765L63.7679 6.118L63.7721 6.68364C63.7131 6.7526 63.638 6.80598 63.5535 6.83909C63.469 6.87219 63.3777 6.884 63.2875 6.87348L63.29 6.87383ZM61.9043 6.87383H61.2123V6.55452H61.9008C61.9523 6.56126 62.0044 6.54794 62.0464 6.51732L62.0457 6.51767C62.0588 6.5054 62.0693 6.49056 62.0764 6.47408C62.0835 6.4576 62.0872 6.43983 62.0871 6.42188V6.42083V6.41837C62.0871 6.40031 62.0832 6.38246 62.0758 6.36601C62.0684 6.34955 62.0575 6.33487 62.044 6.32293C62.007 6.29666 61.9617 6.28492 61.9166 6.28994H61.9173L61.852 6.28784C61.5324 6.27942 61.1695 6.26959 61.1695 5.82992C61.1695 5.61588 61.3029 5.38744 61.6773 5.38744H62.3889V5.70395H61.7376C61.688 5.69841 61.6378 5.70847 61.5941 5.73272L61.5955 5.73202C61.5771 5.74471 61.5624 5.76213 61.5531 5.78246C61.5437 5.80279 61.54 5.82527 61.5424 5.84752C61.5448 5.86977 61.5531 5.89096 61.5666 5.90887C61.58 5.92677 61.598 5.94071 61.6187 5.94922L61.6194 5.94958C61.6645 5.9634 61.7116 5.9691 61.7587 5.96642H61.7576L61.9489 5.97133C62.0949 5.95726 62.2406 6.00055 62.3552 6.09204L62.3542 6.09099C62.3927 6.13349 62.422 6.18354 62.4403 6.23795C62.4585 6.29237 62.4653 6.34998 62.4601 6.40714V6.40539C62.4612 6.71523 62.2734 6.87313 61.9033 6.87313L61.9043 6.87383ZM60.9997 6.87383H59.8137V5.38709H60.9986V5.69412H60.1681V5.96431H60.9794V6.26713H60.1681V6.56259L60.9997 6.56399V6.87278V6.87383ZM61.691 4.31722H60.9678L60.8295 3.98597H60.0919L59.9579 4.31722H59.5424C59.3559 4.32705 59.1721 4.26827 59.0259 4.15195L59.0277 4.153C58.9582 4.07633 58.9055 3.98603 58.8729 3.88786C58.8402 3.78968 58.8284 3.68579 58.8382 3.5828L58.8378 3.5856C58.8288 3.48072 58.8412 3.37508 58.8743 3.27513C58.9073 3.17518 58.9603 3.08299 59.0301 3.00417L59.0294 3.00487C59.1031 2.94044 59.1893 2.89187 59.2825 2.86217C59.3758 2.83247 59.4742 2.82228 59.5716 2.83223L59.5688 2.83188H59.9126V3.14874H59.5758C59.5265 3.14239 59.4764 3.14699 59.4291 3.16222C59.3818 3.17744 59.3384 3.20291 59.3021 3.23682L59.3024 3.23646C59.2274 3.33254 59.191 3.45318 59.2003 3.57473V3.57297C59.1891 3.69784 59.2242 3.82247 59.2989 3.92316L59.2979 3.92176C59.3676 3.97877 59.4569 4.00622 59.5467 3.99826H59.5452H59.7046L60.2067 2.82978H60.74L61.3411 4.23335V2.82978H61.8818L62.5057 3.86421V2.82978H62.8707V4.31476H62.364L61.6903 3.19962V4.31476L61.691 4.31722ZM60.4632 3.08277L60.2186 3.67508H60.7088L60.4632 3.08277ZM57.0248 4.31652H56.6697V2.83083H57.4866C57.6357 2.81536 57.7862 2.84071 57.922 2.90417L57.9167 2.90206C57.9714 2.93226 58.0169 2.97654 58.0486 3.03028C58.0803 3.08403 58.0971 3.14529 58.0971 3.20769L58.0964 3.23225V3.2312V3.24208C58.0964 3.32312 58.0731 3.40245 58.0291 3.47054C57.9852 3.53863 57.9225 3.5926 57.8487 3.62596L57.8459 3.62701C57.9164 3.65368 57.9757 3.69649 58.021 3.75123L58.0217 3.75193C58.0717 3.83424 58.0924 3.9311 58.0803 4.02668L58.0806 4.02457V4.31616H57.7224L57.721 4.12879V4.10072C57.7337 4.0091 57.7134 3.91593 57.6638 3.8379L57.6648 3.83965C57.6276 3.81235 57.5854 3.79268 57.5406 3.78178C57.4958 3.77088 57.4493 3.76896 57.4037 3.77614L57.4058 3.77579H57.0251V4.31616L57.0248 4.31652ZM57.0248 3.13997V3.46981H57.4557C57.5165 3.47641 57.578 3.46545 57.6329 3.43823L57.6311 3.43893C57.6536 3.42527 57.6722 3.40605 57.6851 3.38313C57.698 3.36021 57.7048 3.33435 57.7048 3.30805L57.7045 3.29822V3.29857C57.7062 3.27191 57.7002 3.24531 57.687 3.22205C57.6739 3.19879 57.6542 3.17989 57.6304 3.16769L57.6297 3.16734C57.5763 3.14443 57.5182 3.1348 57.4602 3.13927H57.4613L57.0248 3.13997ZM53.2646 4.31652H52.5432L52.4067 3.98527H51.667L51.5294 4.31652H51.1434L51.7796 2.83083H52.307L52.9109 4.23686V2.83083H53.4902L53.9548 3.83825L54.3818 2.83083H54.9731V4.31581H54.6082L54.6075 3.15365L54.0927 4.31616H53.7811L53.265 3.1519V4.31616L53.2646 4.31652ZM52.0351 3.08277L51.7933 3.67508H52.2782L52.0351 3.08277ZM58.6627 4.31616H58.3006V2.83083H58.6631V4.31581L58.6627 4.31616ZM56.4219 4.31616H55.238V2.83083H56.424V3.13962H55.5931V3.40735H56.404V3.71228H55.5924V4.00913H56.4233V4.31581L56.4219 4.31616Z" fill="#D1CFC7"/>
                    <path d="M88.5573 0.574219H89.3229V8.99519H88.5573V0.574219Z" fill="#D1CFC7"/>
                    <path d="M92.3845 0.574219H93.15V8.22965H92.3845V0.574219Z" fill="#D1CFC7"/>
                    <path d="M90.0885 0.574219H91.6196V8.22965H90.0885V0.574219Z" fill="#D1CFC7"/>
                    <path d="M93.9156 0.574219H95.4467V8.22965H93.9156V0.574219Z" fill="#D1CFC7"/>
                    <path d="M96.2115 0.574219H97.7426V8.22965H96.2115V0.574219Z" fill="#D1CFC7"/>
                    <path d="M98.5093 0.574219H99.2749V8.99519H98.5093V0.574219Z" fill="#D1CFC7"/>
                    <path opacity="0.5" d="M43.0061 8.27978C42.3003 8.27988 41.6104 8.07069 41.0234 7.67865C40.4365 7.28662 39.9791 6.72935 39.7089 6.07731C39.4387 5.42528 39.3679 4.70776 39.5055 4.0155C39.6431 3.32324 39.9829 2.68732 40.4819 2.18817C40.9809 1.68902 41.6167 1.34905 42.3089 1.21125C43.0011 1.07345 43.7186 1.14402 44.3708 1.41402C45.0229 1.68402 45.5803 2.14134 45.9725 2.72813C46.3647 3.31493 46.5741 4.00485 46.5742 4.71065V4.71118C46.5732 5.65724 46.197 6.56427 45.5281 7.23329C44.8592 7.9023 43.9522 8.27865 43.0061 8.27978Z" fill="#D1CFC7"/>
                    <path d="M39.5344 8.27978C38.8286 8.27978 38.1386 8.07048 37.5518 7.67836C36.9649 7.28624 36.5075 6.7289 36.2374 6.07682C35.9673 5.42475 35.8966 4.70722 36.0343 4.01498C36.172 3.32274 36.5119 2.68688 37.011 2.1878C37.5101 1.68872 38.1459 1.34884 38.8382 1.21115C39.5304 1.07345 40.2479 1.14412 40.9 1.41422C41.5521 1.68432 42.1094 2.14172 42.5015 2.72857C42.8937 3.31542 43.103 4.00538 43.103 4.71118C43.102 5.65733 42.7257 6.56444 42.0567 7.23347C41.3876 7.9025 40.4805 8.27879 39.5344 8.27978Z" fill="#D1CFC7"/>
                    <path d="M5.90513 6.37585L4.58318 5.0539C4.53486 5.00559 4.47777 4.9968 4.44703 4.9968C4.41628 4.9968 4.35919 5.00559 4.31088 5.0539L2.98453 6.38025C2.83521 6.52957 2.60244 6.77112 1.82507 6.77112L3.45446 8.39612C3.70151 8.64286 4.03639 8.78145 4.38554 8.78145C4.7347 8.78145 5.06958 8.64286 5.31662 8.39612L6.9504 6.76673C6.55074 6.76673 6.21696 6.68768 5.90513 6.37585ZM2.98453 2.4012L4.31088 3.72755C4.34601 3.76268 4.39872 3.78464 4.44703 3.78464C4.49534 3.78464 4.54804 3.76268 4.58318 3.72755L5.89635 2.41438C6.20817 2.08938 6.56392 2.01471 6.96358 2.01471L5.3298 0.385326C5.08275 0.13859 4.74787 0 4.39872 0C4.04956 0 3.71468 0.13859 3.46764 0.385326L1.83825 2.01032C2.61122 2.01032 2.84838 2.26505 2.98453 2.4012Z" fill="#D1CFC7"/>
                    <path d="M8.39173 3.44715L7.40356 2.45458H6.85018C6.61302 2.45458 6.37585 2.55121 6.21336 2.72249L4.89579 4.04005C4.77282 4.16303 4.61032 4.22451 4.44782 4.22451C4.28049 4.22216 4.12032 4.15621 3.99985 4.04005L2.6735 2.70931C2.50661 2.54242 2.27823 2.4458 2.03667 2.4458H1.39107L0.385326 3.45593C0.13859 3.70298 0 4.03786 0 4.38701C0 4.73617 0.13859 5.07105 0.385326 5.31809L1.39107 6.32823H2.04107C2.27823 6.32823 2.50661 6.2316 2.67789 6.06471L4.00424 4.73836C4.12721 4.61539 4.28971 4.5539 4.45221 4.5539C4.61471 4.5539 4.77721 4.61539 4.90018 4.73836L6.22214 6.06032C6.38903 6.22721 6.61741 6.32383 6.85896 6.32383H7.41234L8.40051 5.33127C8.64829 5.07978 8.78645 4.74044 8.7848 4.3874C8.78315 4.03436 8.64184 3.69632 8.39173 3.44715Z" fill="#D1CFC7"/>
                    <path d="M30.0654 7.466L29.8962 6.61974H28.005L27.7041 7.45999L26.1884 7.463C26.91 5.72769 27.6331 3.99303 28.3578 2.25902C28.4812 1.96489 28.7001 1.8152 29.0228 1.8167C29.2695 1.81896 29.672 1.81896 30.2309 1.81745L31.4029 7.46375L30.0654 7.466ZM28.4308 5.46054H29.6494L29.1943 3.33923L28.4308 5.46054ZM18.66 1.81595L20.184 1.81745L17.828 7.46676L16.2852 7.46525C15.8972 5.97305 15.5141 4.4796 15.1357 2.98492C15.0605 2.68704 14.9116 2.47867 14.625 2.38013C14.2016 2.23827 13.7763 2.10235 13.3492 1.97241L13.3492 1.8182H15.7842C16.2054 1.8182 16.4514 2.02206 16.5304 2.4403C16.6101 2.8593 16.8102 3.92597 17.1322 5.64032L18.66 1.81595ZM22.2782 1.81745L21.0732 7.46525L19.6228 7.46375L20.8264 1.81595L22.2782 1.81745ZM25.2195 1.71289C25.6535 1.71289 26.2004 1.84829 26.5148 1.97241L26.2606 3.14365C25.9762 3.02931 25.5084 2.8751 25.1149 2.88036C24.5432 2.89014 24.1897 3.13011 24.1897 3.36029C24.1897 3.73491 24.8035 3.92372 25.4354 4.33293C26.1568 4.79932 26.2516 5.21832 26.2425 5.67342C26.2328 6.61823 25.4354 7.55025 23.7534 7.55025C22.9861 7.53897 22.7093 7.47428 22.0834 7.25237L22.3482 6.02998C22.9853 6.29703 23.2554 6.38203 23.8 6.38203C24.2988 6.38203 24.7268 6.18043 24.7305 5.82913C24.7335 5.57939 24.5801 5.45527 24.0204 5.14686C23.4608 4.83769 22.6754 4.40966 22.686 3.55061C22.6987 2.45084 23.7406 1.71289 25.2202 1.71289H25.2195Z" fill="#D1CFC7"/>
                  </svg>
                </div>
              </div>

              <div
                className={`relative z-10 w-full max-w-[425px] rounded-[18px] border px-6 py-8 backdrop-blur-[14px] sm:px-[37px] sm:py-[47px] ${isValidCoupon ? 'coupon-vitalicio-glow' : ''}`}
                style={{ backdropFilter: 'blur(14.25px)', minHeight: '845px', borderColor: 'rgba(171, 122, 255, 0.57)', background: 'rgba(67, 0, 112, 0.2)' }}
              >
                <div
                  className="absolute left-1/2 top-[-25px] z-20 -translate-x-1/2"
                >
                  <div
                    className="flex h-[50px] w-[207px] items-center justify-center rounded-full border"
                    style={{
                      borderColor: '#3b2c55',
                      background:
                        'linear-gradient(90deg, #AB7AFF 0%, #C19DFF 50%, #AB7AFF 100%)',
                      boxShadow: '-6px 4px 66.9px rgba(201, 170, 255, 0.7)',
                    }}
                  >
                    <p className="font-articulat text-sm font-semibold text-white">
                      Recomendado
                    </p>
                  </div>
                </div>

                <div className="border-b border-[rgba(248,247,243,0.25)] pb-[19px] text-left">
                  <p className="font-articulat text-[13px] font-normal leading-[1.6] text-[#e3e2dd]">
                    Plano
                  </p>
                  <p className="font-articulat mt-[6px] text-[28px] font-semibold leading-[0.76] text-white">
                    Pague uma vez,
                    <br />
                    use para sempre
                  </p>
                </div>

                <div className="mt-[22px] flex flex-col gap-[4px] text-left">
                  {isValidCoupon ? (
                    <>
                      <p className="font-albert text-[36px] font-semibold leading-[0.76] tracking-normal text-[#AB7AFF]">
                        <span className="text-[20px]">12x de</span> R$ 29,82
                      </p>
                      <p className="font-albert flex flex-wrap items-center gap-2 text-[16px] font-normal leading-none tracking-normal text-white">
                        <span>ou R$ 297 vitalício</span>
                        <span className="font-semibold text-red-500 line-through decoration-red-500 decoration-2">R$ 695</span>
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <p className="font-albert text-[36px] font-semibold leading-[0.76] tracking-normal text-white">
                        R$ 695
                      </p>
                      <p className="font-albert text-[16px] font-normal leading-[0.76] tracking-normal text-white">
                        /vitalicio
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-[22px] flex flex-col gap-[4px]">
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Tudo do plano Mensal
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Acesso vitalicio a plataforma
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Gerador de videos com IA
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Gerador de imagens com IA
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Suporte prioritário
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b border-[rgba(255,255,255,0.2)]">
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2] text-white">
                      Comunidade Exclusiva
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b" style={{ borderColor: '#AB7AFF' }}>
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2]" style={{ color: '#AB7AFF' }}>
                      Treinamento personalizado
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b" style={{ borderColor: '#AB7AFF' }}>
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2]" style={{ color: '#AB7AFF' }}>
                      Indique e ganhe
                    </p>
                  </div>
                  <div className="flex h-[48px] items-center gap-[21px] border-b" style={{ borderColor: '#AB7AFF' }}>
                    <div className="h-[13px] w-[13px]">
                      <img
                        src="/assets/check-icon.svg"
                        alt="check"
                        className="h-full w-full"
                      />
                    </div>
                    <p className="font-articulat text-[13px] font-light leading-[1.2]" style={{ color: '#AB7AFF' }}>
                      Bonus exclusivo
                    </p>
                  </div>
                </div>

                {isValidCoupon && (
                  <div className="vitalicio-bonus mt-5 text-left">
                    <span>Flow + CapCut Pro inclusos</span>
                    <p>A Revealy usa parte dos R$297 do acesso vitalício para entregar esses dois acessos. Não há cobranças separadas.</p>
                    <div>
                      <img src="/assets/check-icon.svg" alt="" aria-hidden="true" /> Conta privada Flow Pro 1K saldo <del>R$700,00</del>
                    </div>
                    <div>
                      <img src="/assets/check-icon.svg" alt="" aria-hidden="true" /> CapCut Pro <del>R$244,90</del>
                    </div>
                    <small>Economia total de R$944,90 adquirindo acesso vitalício com CapCut Pro e Google Flow Pro.</small>
                  </div>
                )}

                <div className="mt-[22px] h-0 w-[297px]">
                  <div className="h-0 w-[297px] border-b border-white/20" />
                </div>

                <a
                  href={getCheckoutLink('Vitalicio')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mx-auto mt-[22px] flex h-[52px] w-[247px] items-center justify-center rounded-[82px] border transition hover:brightness-110"
                  style={{
                    borderColor: '#3b2c55',
                    background:
                      'linear-gradient(90deg, #AB7AFF 0%, #C19DFF 50%, #AB7AFF 100%)',
                  }}
                >
                  <div className="absolute left-[5px] top-1/2 h-[39px] w-[40px] -translate-y-1/2 overflow-hidden rounded-[39px] bg-white flex items-center justify-center">
                    <svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40.1176" height="39.2989" rx="19.6495" fill="white"/>
                      <path d="M22.0488 14.6816L27.0185 19.6513L22.0488 24.621" stroke="black" stroke-width="1.22809" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M13.1016 19.6523H26.8807" stroke="black" stroke-width="1.22809" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <p className="font-articulat text-[13px] font-medium text-white whitespace-nowrap">
                    Quero começar agora
                  </p>
                </a>

                <div className="hidden">
                  <svg width="111" height="9" viewBox="0 0 111 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M109.853 2.42777C109.913 1.89382 109.807 1.51443 109.503 1.16844C109.139 0.754143 108.483 0.57666 107.642 0.57666H105.203C105.12 0.576696 105.04 0.606331 104.977 0.660242C104.914 0.714154 104.872 0.78881 104.859 0.870804L103.843 7.31155C103.838 7.34146 103.84 7.37205 103.848 7.40121C103.856 7.43036 103.871 7.45739 103.89 7.48042C103.91 7.50346 103.935 7.52195 103.962 7.53463C103.99 7.5473 104.02 7.55386 104.05 7.55384H105.424L105.323 8.19198C105.316 8.23666 105.319 8.28234 105.331 8.32588C105.343 8.36941 105.365 8.40977 105.394 8.44416C105.424 8.47856 105.46 8.50619 105.501 8.52513C105.542 8.54408 105.587 8.55391 105.632 8.55393H106.902C107.115 8.55393 107.297 8.39938 107.331 8.18949L107.344 8.12468L107.583 6.6076L107.598 6.52584L107.598 6.52235C107.605 6.481 107.626 6.44333 107.658 6.41616C107.69 6.389 107.73 6.37414 107.772 6.37428H107.961C108.593 6.37428 109.17 6.24665 109.629 5.9206C109.818 5.78599 109.984 5.61997 110.124 5.41956C110.357 5.09567 110.507 4.72014 110.563 4.32524C110.684 3.70405 110.628 3.15066 110.279 2.75282C110.171 2.63278 110.043 2.53313 109.9 2.45868L109.853 2.42827V2.42777ZM106.105 4.97385C106.155 4.94805 106.21 4.93454 106.265 4.93447H106.981C108.387 4.93447 109.487 4.36413 109.809 2.71294L109.811 2.70496C109.919 2.76678 110.01 2.83957 110.084 2.92333C110.356 3.23392 110.422 3.6886 110.308 4.27439C110.173 4.97086 109.876 5.42454 109.479 5.70722C109.079 5.99139 108.561 6.11354 107.962 6.11354H107.772C107.669 6.1134 107.569 6.15017 107.49 6.21723C107.411 6.2843 107.359 6.37727 107.342 6.47947L107.327 6.56123L107.088 8.07831L107.076 8.14313L107.076 8.14512C107.069 8.18633 107.048 8.22383 107.016 8.25087C106.984 8.27792 106.944 8.29275 106.902 8.29269H105.633C105.625 8.29272 105.617 8.29107 105.61 8.28787C105.604 8.28467 105.597 8.27999 105.592 8.27416C105.587 8.26832 105.584 8.26147 105.582 8.25408C105.58 8.24669 105.579 8.23894 105.58 8.23137L105.684 7.57329L106.105 4.97385Z" fill="#D1CFC7"/>
                    <path d="M83.9918 1.14307C83.6704 2.73012 83.3564 4.27453 83.0426 5.81885C82.9621 6.2149 82.8816 6.62338 82.7975 6.98389C82.6163 7.75984 81.9463 7.96631 80.9703 7.96631H68.3453C68.6806 6.36007 68.9919 4.67561 69.3424 3.03662C69.4113 2.71438 69.4594 2.37285 69.5475 2.06201C69.7166 1.46583 70.3027 1.17702 71.0192 1.14307H83.9918ZM73.86 3.89014C73.5725 3.78198 73.222 3.91084 73.0699 4.03369V4.03271C73.0725 3.97987 73.0908 3.94296 73.0934 3.89014H72.8014C72.6796 4.70217 72.5349 5.49162 72.3824 6.27295H72.7223C72.7715 5.96865 72.8042 5.64778 72.8727 5.36279C72.9505 5.6623 73.4568 5.60555 73.6705 5.48975C74.1116 5.25074 74.4517 4.11286 73.86 3.89014ZM79.7467 4.15967C79.7217 3.72538 79.0035 3.87836 78.6012 3.89014C78.5845 3.98419 78.5585 4.06971 78.5377 4.15967C78.7383 4.10931 79.3624 3.9551 79.4225 4.22314C79.4423 4.31208 79.4084 4.40656 79.3834 4.47607C78.8189 4.42249 78.3579 4.51654 78.2369 4.91943C78.156 5.18901 78.2462 5.4544 78.4186 5.52881C78.7511 5.67149 79.1565 5.5083 79.2965 5.28369C79.282 5.36137 79.2675 5.43974 79.2721 5.53662H79.5651C79.5682 5.25622 79.6089 5.02919 79.652 4.77686C79.6887 4.56205 79.7576 4.34928 79.7467 4.15967ZM82.2906 3.17822C82.2616 3.43369 82.2229 3.67946 82.1725 3.91357C81.3392 3.64935 80.8275 4.26387 80.8365 5.02197C80.8384 5.16863 80.8641 5.31475 80.9557 5.41846C81.1136 5.59685 81.5646 5.63959 81.7926 5.48975C81.8368 5.46066 81.8824 5.40735 81.9117 5.37061C81.9337 5.34288 81.9679 5.2708 81.9742 5.2915C81.9623 5.37174 81.9447 5.44613 81.943 5.53662H82.2516C82.3109 4.68337 82.4943 3.9545 82.6305 3.17822H82.2906ZM78.2535 3.88232C77.796 3.80748 77.3617 3.85429 77.1315 4.09619C76.9061 4.33314 76.7585 4.87757 76.8629 5.22021C76.9852 5.62086 77.5325 5.64313 77.9762 5.48975C77.9958 5.40916 78.0067 5.31875 78.024 5.23584C77.7816 5.36205 77.3185 5.42768 77.2106 5.14893C77.1793 5.06794 77.1706 4.9342 77.1783 4.83252C77.1959 4.60374 77.2795 4.32478 77.4078 4.19873C77.5851 4.02498 77.9347 4.0542 78.2135 4.15186C78.2222 4.05765 78.2416 3.97323 78.2535 3.88232ZM75.1481 3.85889C74.9026 3.87784 74.695 3.94835 74.5475 4.104C74.3666 4.29488 74.2205 4.71676 74.2633 5.10107C74.3245 5.64934 75.0053 5.63043 75.5504 5.49756C75.5597 5.40133 75.5834 5.31866 75.5983 5.22803C75.3737 5.31223 74.9835 5.42998 74.7526 5.28369C74.5783 5.17319 74.5775 4.89297 74.6344 4.6499C75.0007 4.63824 75.3818 4.64047 75.7487 4.6499C75.772 4.47768 75.8382 4.28969 75.7799 4.11963C75.703 3.89515 75.4279 3.83735 75.1481 3.85889ZM70.1305 3.2251C69.9947 3.9968 69.8709 4.78083 69.7194 5.53662H70.1071C70.1678 5.14899 70.2244 4.75742 70.3043 4.38916C70.6344 4.38099 71.0301 4.36672 71.3473 4.39697C71.2819 4.77991 71.2032 5.14922 71.1422 5.53662H71.5289C71.6533 4.7536 71.7847 3.97708 71.9401 3.2251H71.5446C71.496 3.54061 71.4412 3.85046 71.3864 4.15967C71.0345 4.16338 70.6749 4.17723 70.3356 4.15186C70.3997 3.84938 70.4457 3.52809 70.5094 3.2251H70.1305ZM72.1608 3.89014C72.152 3.89167 72.1523 3.90267 72.153 3.91357C72.0781 4.47444 71.977 5.00922 71.8688 5.53662H72.2086C72.2902 4.97197 72.3834 4.41916 72.5006 3.89014H72.1608ZM77.0201 3.89014C76.719 3.76855 76.4824 3.97457 76.3727 4.16748C76.3975 4.08163 76.4082 3.98083 76.4283 3.89014H76.1276C76.0542 4.46039 75.9462 4.99591 75.8434 5.53662H76.1832C76.2308 5.21562 76.2514 4.78305 76.3571 4.47607C76.4415 4.23075 76.6623 4.02126 76.9811 4.13525C76.9856 4.04493 77.011 3.97579 77.0201 3.89014ZM81.027 3.89795C80.7267 3.74756 80.4761 4.00051 80.3785 4.15186C80.4063 4.07421 80.4083 3.96977 80.4342 3.89014H80.1334C80.0525 4.45546 79.9552 5.0042 79.8414 5.53662H80.1891C80.1913 5.3185 80.2342 5.15687 80.2682 4.94287C80.3409 4.48597 80.4475 3.98467 80.9791 4.13525C80.9967 4.05804 81.0046 3.97039 81.027 3.89795ZM73.0621 4.23877C73.2411 4.01983 73.7662 3.99318 73.8199 4.35693C73.8663 4.67307 73.7419 5.06821 73.5914 5.22803C73.4096 5.42092 72.9624 5.41778 72.9274 5.09326C72.9122 4.95214 72.9649 4.80373 72.9908 4.65771C73.0171 4.51004 73.0363 4.36842 73.0621 4.23877ZM81.7223 4.07275C81.8923 4.05378 82.0156 4.0926 82.1403 4.13525C82.0256 4.59783 82.067 5.34347 81.5319 5.35498C81.3034 5.35973 81.1895 5.21783 81.1842 4.98291C81.1751 4.5711 81.3562 4.11378 81.7223 4.07275ZM79.3512 4.6665C79.3214 4.8529 79.2872 5.08943 79.1539 5.22021L79.0748 5.27783C78.8641 5.39659 78.4937 5.38895 78.5377 5.02979C78.5797 4.68923 78.9498 4.61732 79.3512 4.6665ZM75.1246 4.06396C75.3691 4.05472 75.5436 4.15488 75.4713 4.46045H74.6735C74.6987 4.27665 74.8646 4.07392 75.1246 4.06396ZM72.4059 3.20166C72.3377 3.21321 72.2987 3.23659 72.2721 3.27295C72.2292 3.33148 72.1892 3.50802 72.2555 3.57373C72.3201 3.6375 72.465 3.60339 72.5084 3.57373C72.5762 3.52701 72.6637 3.31374 72.5641 3.2251C72.5325 3.19707 72.4794 3.18918 72.4059 3.20166Z" fill="#D1CFC7"/>
                    <path d="M62.9296 8.99253H51.9817C51.7584 8.99253 51.5442 8.9038 51.3862 8.74587C51.2283 8.58793 51.1396 8.37373 51.1396 8.15038V4.60776H51.7463L51.8831 4.27651H52.1895L52.326 4.60635H53.5197V4.35546L53.6264 4.60811H54.246L54.3527 4.35125V4.60741H57.3188V4.06563H57.375C57.415 4.06703 57.4266 4.07054 57.4266 4.13721V4.60811H58.961V4.48214C59.1179 4.56179 59.3028 4.60846 59.4989 4.60846L59.5323 4.60811H59.5305H60.1762L60.3144 4.27827H60.6207L60.7558 4.60811H62.0001V4.29441L62.1882 4.60811H63.1833V2.53643H62.1984V2.781L62.0605 2.53643H61.0478V2.781L60.9211 2.53643H59.5537C59.3465 2.52596 59.1401 2.5686 58.954 2.6603L58.9614 2.65714V2.53643H58.0182V2.65714C57.904 2.56715 57.7598 2.52411 57.615 2.53678H57.6171H54.1703L53.939 3.0719L53.7015 2.53678H52.6158V2.78136L52.4961 2.53678H51.5698L51.1406 3.51929V1.41392C51.1406 1.19057 51.2294 0.976369 51.3873 0.818436C51.5452 0.660503 51.7594 0.571777 51.9828 0.571777H62.9307C63.154 0.571777 63.3682 0.660503 63.5262 0.818436C63.6841 0.976369 63.7728 1.19057 63.7728 1.41392V5.09129H63.1156C63.1051 5.09059 63.0924 5.09059 63.0802 5.09059C62.9279 5.09059 62.7865 5.1362 62.6686 5.21445L62.6714 5.2127V5.09129H61.6994C61.5475 5.0829 61.3973 5.12605 61.273 5.21375L61.2752 5.21235V5.09094H59.5396V5.21235C59.3976 5.13222 59.2371 5.09039 59.074 5.09094H59.0603H59.061H57.916V5.21235C57.7665 5.11653 57.589 5.07388 57.4122 5.09129L57.4153 5.09094H56.1342L55.8409 5.40815L55.5665 5.09094H53.6527V7.16402H55.5307L55.8328 6.8419L56.1174 7.16402H57.275V6.67873H57.4364C57.5916 6.6848 57.7464 6.65888 57.8911 6.60259L57.8834 6.6054V7.16472H58.8378V6.62469H58.8838C58.9421 6.62469 58.948 6.6268 58.948 6.68575V7.16507H61.8485L61.884 7.16577C62.0503 7.16577 62.2054 7.11595 62.3345 7.03068L62.3313 7.03243V7.16507H63.2514L63.2952 7.16577C63.4675 7.16577 63.6314 7.13033 63.7802 7.06612L63.7721 7.06928V8.15073C63.7721 8.37408 63.6834 8.58828 63.5255 8.74622C63.3675 8.90415 63.1533 8.99288 62.93 8.99288L62.9296 8.99253ZM58.5452 6.87348H58.188V5.38744H59.0077C59.1557 5.37372 59.3048 5.39863 59.4403 5.45973L59.4347 5.45762C59.5445 5.51798 59.6179 5.63307 59.6179 5.76501L59.6172 5.78852V5.78746L59.6175 5.8008C59.6175 5.97133 59.5147 6.118 59.3673 6.18187L59.3645 6.18292C59.4351 6.20818 59.494 6.25134 59.5379 6.30714L59.5386 6.30784C59.5881 6.38985 59.6089 6.48605 59.5975 6.58118L59.5979 6.57908V6.87313H59.2414V6.68715C59.2583 6.5859 59.2379 6.48196 59.1842 6.39451L59.1852 6.39626C59.1482 6.36815 59.1058 6.34784 59.0607 6.33656C59.0156 6.32528 58.9687 6.32327 58.9228 6.33065L58.9249 6.33029H58.5452V6.87313V6.87348ZM58.5452 5.69448V6.02818H58.9768C59.0377 6.0338 59.0991 6.02289 59.1544 5.99659L59.1522 5.99765C59.1748 5.98307 59.1934 5.96307 59.2063 5.93947C59.2191 5.91587 59.2259 5.88943 59.2259 5.86255L59.2256 5.85448V5.85483C59.2273 5.82801 59.2214 5.80125 59.2086 5.77765C59.1957 5.75405 59.1764 5.73458 59.1529 5.72149L59.1522 5.72114C59.099 5.69733 59.0405 5.68766 58.9824 5.69307H58.9838L58.5452 5.69448ZM55.3784 6.87313H53.9724V5.38744H55.4005L55.8374 5.87448L56.289 5.38744H57.4234C57.8262 5.38744 58.022 5.5478 58.022 5.87694C58.022 6.21204 57.8196 6.37486 57.4044 6.37486H56.9606V6.87278H56.2704L55.8331 6.38188L55.3787 6.87313H55.3784ZM56.6069 5.54675L56.0616 6.13274L56.6069 6.73768V5.54675ZM54.3264 6.26784V6.56329H55.1994L55.603 6.12748L55.2149 5.69448H54.3261V5.96466H55.1057V6.26748L54.3264 6.26784ZM56.9606 5.69483V6.07309H57.4192C57.5595 6.07309 57.6402 6.00151 57.6402 5.87659C57.6402 5.75729 57.5652 5.69448 57.423 5.69448L56.9606 5.69483ZM63.29 6.87383H62.6043V6.55452H63.2872C63.3383 6.56156 63.3901 6.5482 63.4314 6.51732L63.431 6.51767C63.4442 6.50544 63.4547 6.49062 63.4619 6.47414C63.4691 6.45765 63.4728 6.43986 63.4728 6.42188V6.42083V6.41626C63.4728 6.3985 63.469 6.38095 63.4615 6.36483C63.4541 6.34871 63.4432 6.33441 63.4296 6.32293C63.3933 6.29668 63.3485 6.28492 63.304 6.28994H63.3047L63.2391 6.28784C62.9184 6.27942 62.5552 6.26959 62.5552 5.82992C62.5552 5.61588 62.6893 5.38744 63.0644 5.38744H63.7721V5.70395H63.1247C63.0747 5.69835 63.0242 5.70841 62.9801 5.73272L62.9816 5.73202C62.9642 5.74342 62.9503 5.75928 62.9412 5.77793C62.9321 5.79658 62.9283 5.81732 62.93 5.83799V5.83764V5.8415C62.93 5.86514 62.9374 5.88818 62.9513 5.90734C62.9652 5.92649 62.9847 5.94078 63.0072 5.94817L63.0079 5.94852C63.0524 5.96224 63.0989 5.96794 63.1454 5.96537H63.1444L63.337 5.97028C63.4822 5.95579 63.6273 5.99902 63.7409 6.09063L63.7398 6.08993C63.7504 6.09835 63.7595 6.10748 63.7676 6.11765L63.7679 6.118L63.7721 6.68364C63.7131 6.7526 63.638 6.80598 63.5535 6.83909C63.469 6.87219 63.3777 6.884 63.2875 6.87348L63.29 6.87383ZM61.9043 6.87383H61.2123V6.55452H61.9008C61.9523 6.56126 62.0044 6.54794 62.0464 6.51732L62.0457 6.51767C62.0588 6.5054 62.0693 6.49056 62.0764 6.47408C62.0835 6.4576 62.0872 6.43983 62.0871 6.42188V6.42083V6.41837C62.0871 6.40031 62.0832 6.38246 62.0758 6.36601C62.0684 6.34955 62.0575 6.33487 62.044 6.32293C62.007 6.29666 61.9617 6.28492 61.9166 6.28994H61.9173L61.852 6.28784C61.5324 6.27942 61.1695 6.26959 61.1695 5.82992C61.1695 5.61588 61.3029 5.38744 61.6773 5.38744H62.3889V5.70395H61.7376C61.688 5.69841 61.6378 5.70847 61.5941 5.73272L61.5955 5.73202C61.5771 5.74471 61.5624 5.76213 61.5531 5.78246C61.5437 5.80279 61.54 5.82527 61.5424 5.84752C61.5448 5.86977 61.5531 5.89096 61.5666 5.90887C61.58 5.92677 61.598 5.94071 61.6187 5.94922L61.6194 5.94958C61.6645 5.9634 61.7116 5.9691 61.7587 5.96642H61.7576L61.9489 5.97133C62.0949 5.95726 62.2406 6.00055 62.3552 6.09204L62.3542 6.09099C62.3927 6.13349 62.422 6.18354 62.4403 6.23795C62.4585 6.29237 62.4653 6.34998 62.4601 6.40714V6.40539C62.4612 6.71523 62.2734 6.87313 61.9033 6.87313L61.9043 6.87383ZM60.9997 6.87383H59.8137V5.38709H60.9986V5.69412H60.1681V5.96431H60.9794V6.26713H60.1681V6.56259L60.9997 6.56399V6.87278V6.87383ZM61.691 4.31722H60.9678L60.8295 3.98597H60.0919L59.9579 4.31722H59.5424C59.3559 4.32705 59.1721 4.26827 59.0259 4.15195L59.0277 4.153C58.9582 4.07633 58.9055 3.98603 58.8729 3.88786C58.8402 3.78968 58.8284 3.68579 58.8382 3.5828L58.8378 3.5856C58.8288 3.48072 58.8412 3.37508 58.8743 3.27513C58.9073 3.17518 58.9603 3.08299 59.0301 3.00417L59.0294 3.00487C59.1031 2.94044 59.1893 2.89187 59.2825 2.86217C59.3758 2.83247 59.4742 2.82228 59.5716 2.83223L59.5688 2.83188H59.9126V3.14874H59.5758C59.5265 3.14239 59.4764 3.14699 59.4291 3.16222C59.3818 3.17744 59.3384 3.20291 59.3021 3.23682L59.3024 3.23646C59.2274 3.33254 59.191 3.45318 59.2003 3.57473V3.57297C59.1891 3.69784 59.2242 3.82247 59.2989 3.92316L59.2979 3.92176C59.3676 3.97877 59.4569 4.00622 59.5467 3.99826H59.5452H59.7046L60.2067 2.82978H60.74L61.3411 4.23335V2.82978H61.8818L62.5057 3.86421V2.82978H62.8707V4.31476H62.364L61.6903 3.19962V4.31476L61.691 4.31722ZM60.4632 3.08277L60.2186 3.67508H60.7088L60.4632 3.08277ZM57.0248 4.31652H56.6697V2.83083H57.4866C57.6357 2.81536 57.7862 2.84071 57.922 2.90417L57.9167 2.90206C57.9714 2.93226 58.0169 2.97654 58.0486 3.03028C58.0803 3.08403 58.0971 3.14529 58.0971 3.20769L58.0964 3.23225V3.2312V3.24208C58.0964 3.32312 58.0731 3.40245 58.0291 3.47054C57.9852 3.53863 57.9225 3.5926 57.8487 3.62596L57.8459 3.62701C57.9164 3.65368 57.9757 3.69649 58.021 3.75123L58.0217 3.75193C58.0717 3.83424 58.0924 3.9311 58.0803 4.02668L58.0806 4.02457V4.31616H57.7224L57.721 4.12879V4.10072C57.7337 4.0091 57.7134 3.91593 57.6638 3.8379L57.6648 3.83965C57.6276 3.81235 57.5854 3.79268 57.5406 3.78178C57.4958 3.77088 57.4493 3.76896 57.4037 3.77614L57.4058 3.77579H57.0251V4.31616L57.0248 4.31652ZM57.0248 3.13997V3.46981H57.4557C57.5165 3.47641 57.578 3.46545 57.6329 3.43823L57.6311 3.43893C57.6536 3.42527 57.6722 3.40605 57.6851 3.38313C57.698 3.36021 57.7048 3.33435 57.7048 3.30805L57.7045 3.29822V3.29857C57.7062 3.27191 57.7002 3.24531 57.687 3.22205C57.6739 3.19879 57.6542 3.17989 57.6304 3.16769L57.6297 3.16734C57.5763 3.14443 57.5182 3.1348 57.4602 3.13927H57.4613L57.0248 3.13997ZM53.2646 4.31652H52.5432L52.4067 3.98527H51.667L51.5294 4.31652H51.1434L51.7796 2.83083H52.307L52.9109 4.23686V2.83083H53.4902L53.9548 3.83825L54.3818 2.83083H54.9731V4.31581H54.6082L54.6075 3.15365L54.0927 4.31616H53.7811L53.265 3.1519V4.31616L53.2646 4.31652ZM52.0351 3.08277L51.7933 3.67508H52.2782L52.0351 3.08277ZM58.6627 4.31616H58.3006V2.83083H58.6631V4.31581L58.6627 4.31616ZM56.4219 4.31616H55.238V2.83083H56.424V3.13962H55.5931V3.40735H56.404V3.71228H55.5924V4.00913H56.4233V4.31581L56.4219 4.31616Z" fill="#D1CFC7"/>
                    <path d="M88.5573 0.574219H89.3229V8.99519H88.5573V0.574219Z" fill="#D1CFC7"/>
                    <path d="M92.3845 0.574219H93.15V8.22965H92.3845V0.574219Z" fill="#D1CFC7"/>
                    <path d="M90.0885 0.574219H91.6196V8.22965H90.0885V0.574219Z" fill="#D1CFC7"/>
                    <path d="M93.9156 0.574219H95.4467V8.22965H93.9156V0.574219Z" fill="#D1CFC7"/>
                    <path d="M96.2115 0.574219H97.7426V8.22965H96.2115V0.574219Z" fill="#D1CFC7"/>
                    <path d="M98.5093 0.574219H99.2749V8.99519H98.5093V0.574219Z" fill="#D1CFC7"/>
                    <path opacity="0.5" d="M43.0061 8.27978C42.3003 8.27988 41.6104 8.07069 41.0234 7.67865C40.4365 7.28662 39.9791 6.72935 39.7089 6.07731C39.4387 5.42528 39.3679 4.70776 39.5055 4.0155C39.6431 3.32324 39.9829 2.68732 40.4819 2.18817C40.9809 1.68902 41.6167 1.34905 42.3089 1.21125C43.0011 1.07345 43.7186 1.14402 44.3708 1.41402C45.0229 1.68402 45.5803 2.14134 45.9725 2.72813C46.3647 3.31493 46.5741 4.00485 46.5742 4.71065V4.71118C46.5732 5.65724 46.197 6.56427 45.5281 7.23329C44.8592 7.9023 43.9522 8.27865 43.0061 8.27978Z" fill="#D1CFC7"/>
                    <path d="M39.5344 8.27978C38.8286 8.27978 38.1386 8.07048 37.5518 7.67836C36.9649 7.28624 36.5075 6.7289 36.2374 6.07682C35.9673 5.42475 35.8966 4.70722 36.0343 4.01498C36.172 3.32274 36.5119 2.68688 37.011 2.1878C37.5101 1.68872 38.1459 1.34884 38.8382 1.21115C39.5304 1.07345 40.2479 1.14412 40.9 1.41422C41.5521 1.68432 42.1094 2.14172 42.5015 2.72857C42.8937 3.31542 43.103 4.00538 43.103 4.71118C43.102 5.65733 42.7257 6.56444 42.0567 7.23347C41.3876 7.9025 40.4805 8.27879 39.5344 8.27978Z" fill="#D1CFC7"/>
                    <path d="M5.90513 6.37585L4.58318 5.0539C4.53486 5.00559 4.47777 4.9968 4.44703 4.9968C4.41628 4.9968 4.35919 5.00559 4.31088 5.0539L2.98453 6.38025C2.83521 6.52957 2.60244 6.77112 1.82507 6.77112L3.45446 8.39612C3.70151 8.64286 4.03639 8.78145 4.38554 8.78145C4.7347 8.78145 5.06958 8.64286 5.31662 8.39612L6.9504 6.76673C6.55074 6.76673 6.21696 6.68768 5.90513 6.37585ZM2.98453 2.4012L4.31088 3.72755C4.34601 3.76268 4.39872 3.78464 4.44703 3.78464C4.49534 3.78464 4.54804 3.76268 4.58318 3.72755L5.89635 2.41438C6.20817 2.08938 6.56392 2.01471 6.96358 2.01471L5.3298 0.385326C5.08275 0.13859 4.74787 0 4.39872 0C4.04956 0 3.71468 0.13859 3.46764 0.385326L1.83825 2.01032C2.61122 2.01032 2.84838 2.26505 2.98453 2.4012Z" fill="#D1CFC7"/>
                    <path d="M8.39173 3.44715L7.40356 2.45458H6.85018C6.61302 2.45458 6.37585 2.55121 6.21336 2.72249L4.89579 4.04005C4.77282 4.16303 4.61032 4.22451 4.44782 4.22451C4.28049 4.22216 4.12032 4.15621 3.99985 4.04005L2.6735 2.70931C2.50661 2.54242 2.27823 2.4458 2.03667 2.4458H1.39107L0.385326 3.45593C0.13859 3.70298 0 4.03786 0 4.38701C0 4.73617 0.13859 5.07105 0.385326 5.31809L1.39107 6.32823H2.04107C2.27823 6.32823 2.50661 6.2316 2.67789 6.06471L4.00424 4.73836C4.12721 4.61539 4.28971 4.5539 4.45221 4.5539C4.61471 4.5539 4.77721 4.61539 4.90018 4.73836L6.22214 6.06032C6.38903 6.22721 6.61741 6.32383 6.85896 6.32383H7.41234L8.40051 5.33127C8.64829 5.07978 8.78645 4.74044 8.7848 4.3874C8.78315 4.03436 8.64184 3.69632 8.39173 3.44715Z" fill="#D1CFC7"/>
                    <path d="M30.0654 7.466L29.8962 6.61974H28.005L27.7041 7.45999L26.1884 7.463C26.91 5.72769 27.6331 3.99303 28.3578 2.25902C28.4812 1.96489 28.7001 1.8152 29.0228 1.8167C29.2695 1.81896 29.672 1.81896 30.2309 1.81745L31.4029 7.46375L30.0654 7.466ZM28.4308 5.46054H29.6494L29.1943 3.33923L28.4308 5.46054ZM18.66 1.81595L20.184 1.81745L17.828 7.46676L16.2852 7.46525C15.8972 5.97305 15.5141 4.4796 15.1357 2.98492C15.0605 2.68704 14.9116 2.47867 14.625 2.38013C14.2016 2.23827 13.7763 2.10235 13.3492 1.97241L13.3492 1.8182H15.7842C16.2054 1.8182 16.4514 2.02206 16.5304 2.4403C16.6101 2.8593 16.8102 3.92597 17.1322 5.64032L18.66 1.81595ZM22.2782 1.81745L21.0732 7.46525L19.6228 7.46375L20.8264 1.81595L22.2782 1.81745ZM25.2195 1.71289C25.6535 1.71289 26.2004 1.84829 26.5148 1.97241L26.2606 3.14365C25.9762 3.02931 25.5084 2.8751 25.1149 2.88036C24.5432 2.89014 24.1897 3.13011 24.1897 3.36029C24.1897 3.73491 24.8035 3.92372 25.4354 4.33293C26.1568 4.79932 26.2516 5.21832 26.2425 5.67342C26.2328 6.61823 25.4354 7.55025 23.7534 7.55025C22.9861 7.53897 22.7093 7.47428 22.0834 7.25237L22.3482 6.02998C22.9853 6.29703 23.2554 6.38203 23.8 6.38203C24.2988 6.38203 24.7268 6.18043 24.7305 5.82913C24.7335 5.57939 24.5801 5.45527 24.0204 5.14686C23.4608 4.83769 22.6754 4.40966 22.686 3.55061C22.6987 2.45084 23.7406 1.71289 25.2202 1.71289H25.2195Z" fill="#D1CFC7"/>
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <section className="final-call mx-auto mt-28 w-[calc(100%-3rem)] max-w-[1050px] px-6 py-12 text-center sm:px-12 sm:py-16">
        <p className="font-articulat text-xs font-semibold uppercase tracking-[0.25em] text-[#AC87FD]">
          Última chamada
        </p>
        <h2 className="mx-auto mt-4 max-w-4xl font-articulat text-3xl font-semibold leading-[1.08] text-white sm:text-4xl md:text-5xl">
          Enquanto você adia, <em>outros criadores</em><br className="hidden md:block" /> já estão produzindo e vendendo com IA
        </h2>
        <p className="mx-auto mt-5 max-w-3xl font-articulat text-sm leading-relaxed text-white/60 sm:text-base">
          A Revealy reúne as ferramentas que você precisa para encontrar produtos, criar conteúdos com IA e transformar ideias em criativos prontos para vender.
        </p>
        <ul className="mx-auto mt-7 max-w-2xl space-y-3 text-left">
          {[
            'Encontre produtos com potencial no Radar de Produtos',
            'Crie influencers e avatares virtuais consistentes',
            'Gere roteiros e prompts com agentes GPT especializados',
            'Produza imagens, animações e criativos UGC com IA',
            'Aprenda estratégias para postar, fazer lives e vender mais',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 font-articulat text-sm text-white/85 sm:text-base">
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
          Começar agora na Revealy
        </a>
        <p className="mt-4 font-articulat text-xs text-white/40">
          Pesquise, crie e publique com um processo mais simples.
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
        <div className="absolute left-1/2 top-1/2 z-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#511490] opacity-60 blur-[120px] sm:h-[513px] sm:w-[513px]" />
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
          src="/assets/Vector.png"
          alt="Vector"
          className="h-auto w-full max-w-[1030.44px]"
        />
      </div>
    </section>

    <footer className={`relative w-full overflow-hidden bg-[#090C11] px-6 py-16 ${isValidCoupon ? 'pb-28 sm:pb-24' : ''}`}>
      <div className="absolute top-0 left-0 h-[1px] w-full bg-white/20" />
      <div className="absolute left-0 top-0 h-[300px] w-[300px] rounded-full bg-[#AB7AFF] opacity-20 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 h-[505px] w-[505px] bg-[#511490] opacity-100 blur-[150px]" />

      <div className="relative mx-auto max-w-6xl sm:min-h-[286px]">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src="/assets/logo-lp.png"
              alt="Revealy"
              className="h-[41px] w-[141px]"
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
              className="mt-6 flex items-center gap-2 font-articulat text-sm font-semibold text-[#AB7AFF] hover:text-white"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1_163)">
                  <rect width="15" height="15" rx="3.5919" fill="#AB7AFF" />
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

    {isValidCoupon && (
      <div className="coupon-countdown" role="status" aria-live="polite">
        <span className="coupon-countdown__clock">◷</span>
        <span>Seu cupom</span>
        <strong>{coupon}</strong>
        <span>expira em</span>
        <b>{couponTimer}</b>
      </div>
    )}
  </>
  )
}

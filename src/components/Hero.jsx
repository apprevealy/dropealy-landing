
export default function Hero({ children }) {
  return (
    <section className="relative flex min-h-screen w-full items-end justify-center overflow-hidden bg-[#050208] pb-16 pt-28 sm:pb-20">
      <img
        src="/assets/dropealy-banner-1920x1080.png"
        alt="Dropealy - identidade visual dourada"
        className="absolute inset-0 hidden h-full w-full object-cover sm:block"
      />
      <img
        src="/assets/dropealy-hero-mobile-853x1844.png"
        alt="Dropealy - mobile"
        className="absolute inset-0 block h-full w-full object-cover sm:hidden"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {children}

      <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row">
        <a
          href="#planos"
          className="flex h-[62px] w-[270px] items-center justify-center rounded-full text-sm font-semibold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(245,158,43,0.7)] transition hover:brightness-110"
          style={{
            background:
              'linear-gradient(135deg, #FFCF6E, #F59E2B)',
          }}
        >
          Escalar minhas vendas
        </a>
        <a
          href="#planos"
          className="flex h-[62px] w-[270px] items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-black/30 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-black/50"
        >
          Conhecer a Revealy
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.64648 1.92969H12.2189C12.56 1.92969 12.8871 2.0652 13.1283 2.3064C13.3695 2.54761 13.505 2.87476 13.505 3.21587V12.2192C13.505 12.5603 13.3695 12.8874 13.1283 13.1287C12.8871 13.3699 12.56 13.5054 12.2189 13.5054H9.64648" stroke="currentColor" strokeWidth="1.28619" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.43164 10.9329L9.64711 7.71742L6.43164 4.50195" stroke="currentColor" strokeWidth="1.28619" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.64876 7.7168H1.93164" stroke="currentColor" strokeWidth="1.28619" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  )
}

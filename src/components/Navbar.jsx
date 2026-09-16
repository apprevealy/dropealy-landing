export default function Navbar() {
  return (
    <header className="absolute top-6 left-1/2 z-20 w-[92%] max-w-[717px] -translate-x-1/2">
      <nav className="flex h-[77px] items-center justify-between rounded-full border border-white/30 bg-black/40 px-6 backdrop-blur-md shadow-[0_0_40px_rgba(147,51,234,0.25)]">
        <div className="flex items-center gap-12">
          <img src="/assets/logo-lp.png" alt="Revealy" className="h-[41px] w-[141px]" />

          <div className="hidden items-center gap-[35px] text-sm font-medium text-white md:flex">
            <a href="#planos" className="transition hover:opacity-80">
              Planos
            </a>
            <a href="#faq" className="transition hover:opacity-80">
              FAQ
            </a>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <a
            href="https://new.apprevealy.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-sm leading-none text-white transition hover:opacity-80 sm:flex"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.18353 1.63699H10.3658C10.6552 1.63699 10.9327 1.75195 11.1373 1.95658C11.342 2.1612 11.4569 2.43873 11.4569 2.72812V10.366C11.4569 10.6554 11.342 10.9329 11.1373 11.1375C10.9327 11.3422 10.6552 11.4571 10.3658 11.4571H8.18353" stroke="currentColor" strokeWidth="1.09113" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.45624 9.27478L8.18405 6.54697L5.45624 3.81915" stroke="currentColor" strokeWidth="1.09113" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.18542 6.54643H1.63867" stroke="currentColor" strokeWidth="1.09113" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Entrar
          </a>
          <a
            href="#planos"
            className="flex h-[47px] w-[181px] items-center justify-center rounded-full text-sm font-medium text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] transition hover:brightness-110"
            style={{
              background:
                'linear-gradient(90deg, #511490 0%, #AB7BFF 50%, #511490 97%)',
            }}
          >
            Criar Conta
          </a>
        </div>
      </nav>
    </header>
  )
}

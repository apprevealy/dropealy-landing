// Oferta atual, compartilhada pela página oficial e pelas páginas dos parceiros.
// Preços de divulgação: os links de pagamento aprovados continuam na CheckoutProvider.
export const COMMERCIAL_PLANS = {
  starter: {
    priceCents: 12700,
    features: [
      { label: 'Acesso mensal à plataforma' },
      { label: '1 conta Mercado Livre', icon: 'check' },
      { label: 'Sem Integração Shopee', icon: 'x' },
      { label: 'Sem Integração Amazon', icon: 'x' },
      { label: 'Envios feitos em 15–25 dias úteis', icon: 'check' },
    ],
    bonuses: [],
  },
  trial: {
    priceCents: 24700,
    features: [
      { label: 'Acesso trimestral à plataforma' },
      { label: '3 contas Mercado Livre', icon: 'check' },
      { label: '3 contas Shopee', icon: 'check' },
      { label: '3 contas Amazon', icon: 'check' },
      { label: 'Envios feitos em 3–5 dias úteis', icon: 'check' },
    ],
    bonuses: ['Área de Membros Exclusiva com Aulas'],
  },
  master: {
    priceCents: 49700,
    installmentCount: 12,
    installmentCents: 4990,
    features: [
      { label: 'Acesso vitalício à plataforma' },
      { label: '6 contas Mercado Livre', icon: 'check' },
      { label: '6 contas Shopee', icon: 'check' },
      { label: '6 contas Amazon', icon: 'check' },
      { label: 'Envios feitos em 3–5 dias úteis', icon: 'check' },
    ],
    bonuses: ['Área de Membros Exclusiva com Aulas', 'Gemini Plus', 'CapCut Pro'],
  },
}

export function commercialPrice(cents) {
  return `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`
}

export const MASTER_INSTALLMENT_TOTAL_CENTS = COMMERCIAL_PLANS.master.installmentCount * COMMERCIAL_PLANS.master.installmentCents

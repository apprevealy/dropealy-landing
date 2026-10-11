// Oferta atual, compartilhada pela página oficial e pelas páginas dos parceiros.
// Preços de divulgação: os links de pagamento aprovados continuam na CheckoutProvider.
export const COMMERCIAL_PLANS = {
  starter: {
    priceCents: 9700,
    features: [
      { label: 'Acesso mensal à plataforma' },
      { label: '1 conta Mercado Livre', icon: 'check' },
      { label: 'Acesso aos fornecedores do Mercado Livre' },
      { label: 'Sem Integração Shopee', icon: 'x' },
      { label: 'Sem Integração Amazon', icon: 'x' },
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
      { label: 'Acesso aos fornecedores Amazon, Shopee e Mercado Livre' },
    ],
    bonuses: ['Área de membros exclusiva com aulas'],
  },
  master: {
    priceCents: 59700,
    installmentCount: 12,
    installmentCents: 5994,
    features: [
      { label: 'Acesso vitalício à plataforma' },
      { label: '6 contas Mercado Livre', icon: 'check' },
      { label: '6 contas Shopee', icon: 'check' },
      { label: '6 contas Amazon', icon: 'check' },
      { label: 'Acesso aos fornecedores Amazon, Shopee e Mercado Livre com envio mais rápido' },
    ],
    bonuses: ['Área de membros exclusiva com aulas', 'Gemini Plus', 'CapCut Pro'],
  },
}

export function commercialPrice(cents) {
  return `R$ ${(cents / 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
}

export const MASTER_INSTALLMENT_TOTAL_CENTS = COMMERCIAL_PLANS.master.installmentCount * COMMERCIAL_PLANS.master.installmentCents

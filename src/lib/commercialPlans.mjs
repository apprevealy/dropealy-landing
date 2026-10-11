// Oferta atual, compartilhada pela página oficial e pelas páginas dos parceiros.
// Preços de divulgação: os links de pagamento aprovados continuam na CheckoutProvider.
export const COMMERCIAL_PLANS = {
  starter: {
    priceCents: 9700,
    features: [
      'Acesso mensal à plataforma',
      'Conecte 1 conta do Mercado Livre',
      'Acesso aos fornecedores do Mercado Livre',
      'Integração com Shopee bloqueada neste plano',
      'Integração com Amazon bloqueada neste plano',
    ],
    bonuses: [],
  },
  trial: {
    priceCents: 24700,
    features: [
      'Acesso trimestral à plataforma',
      'Conecte 3 contas do Mercado Livre',
      'Conecte 3 contas da Shopee',
      'Conecte 3 contas da Amazon',
      'Acesso aos fornecedores Amazon, Shopee e Mercado Livre',
    ],
    bonuses: ['Área de membros exclusiva com aulas'],
  },
  master: {
    priceCents: 59700,
    installmentCount: 12,
    installmentCents: 5994,
    features: [
      'Acesso vitalício à plataforma',
      'Conecte 6 contas do Mercado Livre',
      'Conecte 6 contas da Shopee',
      'Conecte 6 contas da Amazon',
      'Acesso aos fornecedores Amazon, Shopee e Mercado Livre com envio mais rápido',
    ],
    bonuses: ['Área de membros exclusiva com aulas', 'Gemini Plus', 'CapCut Pro'],
  },
}

export function commercialPrice(cents) {
  return `R$ ${(cents / 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`
}

export const MASTER_INSTALLMENT_TOTAL_CENTS = COMMERCIAL_PLANS.master.installmentCount * COMMERCIAL_PLANS.master.installmentCents

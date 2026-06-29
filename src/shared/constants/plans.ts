// ─── Shared Plan Constants (DRY) ───
// Plans definidos UMA ÚNICA VEZ — antes duplicados em 3 arquivos

export interface PlanConfig {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limits: { products: number; users: number; locations: number; };
  highlighted: boolean;
  cta: string;
}

export const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para pequenas equipes começando",
    features: ["Até 30 itens", "1 usuário", "Dashboard básico", "Movimentações manuais"],
    limits: { products: 30, users: 1, locations: 1 },
    highlighted: false,
    cta: "Começar Grátis",
  },
  {
    id: "starter",
    name: "Starter",
    price: "R$ 49",
    period: "/mês",
    description: "Para negócios em crescimento",
    features: ["Até 500 itens", "3 usuários", "Relatórios avançados", "Leitor de códigos", "Exportação CSV", "API REST"],
    limits: { products: 500, users: 3, locations: 5 },
    highlighted: true,
    cta: "Testar Grátis",
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 149",
    period: "/mês",
    description: "Para operações em escala",
    features: ["Até 3.000 itens", "10 usuários", "API REST", "Leitor de códigos", "Relatórios customizados", "Múltiplas filiais"],
    limits: { products: 3000, users: 10, locations: 20 },
    highlighted: false,
    cta: "Assinar",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Para grandes operações",
    features: ["Itens ilimitados", "Usuários ilimitados", "Onboarding dedicado", "SLA personalizado"],
    limits: { products: -1, users: -1, locations: -1 },
    highlighted: false,
    cta: "Falar com Vendas",
  },
];

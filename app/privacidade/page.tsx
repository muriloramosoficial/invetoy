import { Box, Shield, Eye, Trash2, Database, Mail, Lock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

export const metadata = {
  title: "Política de Privacidade — INVENTOY",
  description:
    "Política de privacidade da INVENTOY em conformidade com a LGPD (Lei nº 13.709/2018). Saiba como tratamos seus dados pessoais.",
};

const sections = [
  {
    icon: Shield,
    title: "1. Quem somos",
    content:
      "A INVENTOY é uma plataforma de gestão de patrimonio, CNPJ 00.000.000/0001-00. Atuamos como Controladores dos dados pessoais tratados em nossa plataforma. Para assuntos de privacidade, nosso Encarregado (DPO) pode ser contatado pelo email dpo@invetoy.com.br.",
  },
  {
    icon: Database,
    title: "2. Dados que coletamos",
    content: "Coletamos os seguintes dados pessoais:\n\n• Dados de cadastro: nome completo, email, nome da empresa, cargo\n• Dados de acesso: endereço IP, agente do usuário, cookies necessários\n• Dados de uso: interações com a plataforma, funcionalidades acessadas\n• Dados de pagamento: processados por gateway de pagamentos terceirizado (PIX, Boleto, Cartão) — não armazenamos dados de cartão de crédito\n\nNão coletamos dados sensíveis (origem racial, convicção religiosa, saúde, dados genéticos ou biométricos).",
  },
  {
    icon: Eye,
    title: "3. Finalidade do tratamento",
    content:
      "Seus dados são utilizados para:\n\n• Prestação dos serviços contratados (gestão de patrimonio)\n• Criação e manutenção da sua conta\n• Processamento de pagamentos de assinaturas\n• Comunicações operacionais (notificações de patrimonio, faturas)\n• Melhoria contínua da plataforma\n• Cumprimento de obrigações legais e regulatórias",
  },
  {
    icon: Lock,
    title: "4. Base legal para o tratamento",
    content:
      "Tratamos seus dados com base nas seguintes hipóteses legais da LGPD:\n\n• Execução de contrato (Art. 7º, V): para prestar os serviços contratados\n• Legítimo interesse (Art. 7º, IX): para melhorar nossos serviços e prevenir fraudes\n• Consentimento (Art. 7º, I): para cookies não essenciais e comunicações de marketing\n• Obrigação legal (Art. 7º, II): para cumprir exigências fiscais e regulatórias",
  },
  {
    icon: RefreshCw,
    title: "5. Compartilhamento de dados",
    content:
      "Compartilhamos seus dados apenas com:\n\n\u2022 Gateway de pagamentos: processamento de assinaturas\n\u2022 Banco de dados gerenciado (Provedor nos EUA)\n\u2022 Vercel: hospedagem da aplicacao\n\nNao vendemos seus dados pessoais para terceiros. Todos os provedores contratados possuem conformidade com a LGPD.",
  },
  {
    icon: Trash2,
    title: "6. Retenção e exclusão",
    content:
      "Mantemos seus dados pessoais enquanto sua conta estiver ativa. Após o cancelamento:\n\n• Dados operacionais: mantidos por 90 dias (período de cortesia para recuperação)\n• Dados fiscais: retidos por 5 anos (obrigação legal)\n• Dados de pagamento: retidos conforme legislação aplicável\n\nApós os prazos, os dados são anonimizados ou excluídos permanentemente.",
  },
  {
    icon: Eye,
    title: "7. Seus direitos (LGPD Art. 18)",
    content:
      "Você tem direito a:\n\n1. Confirmar se tratamos seus dados pessoais\n2. Acessar seus dados\n3. Corrigir dados incompletos ou desatualizados\n4. Anonimizar ou bloquear dados desnecessários\n5. Excluir dados tratados com seu consentimento\n6. Portar seus dados para outro fornecedor\n7. Revogar seu consentimento a qualquer momento\n\nPara exercer seus direitos, acesse Configurações da conta ou envie email para dpo@invetoy.com.br. Responderemos em até 15 dias.",
  },
  {
    icon: Shield,
    title: "8. Segurança dos dados",
    content:
      "Adotamos medidas técnicas e administrativas para proteger seus dados:\n\n• Criptografia em trânsito (TLS 1.3)\n• Row Level Security (RLS) no banco de dados\n• Controle de acesso baseado em papéis (admin, manager, operator)\n• Monitoramento contínuo de segurança\n• Auditoria de movimentações\n• Backup diário dos dados",
  },
  {
    icon: Mail,
    title: "9. Encarregado (DPO)",
    content:
      "Nosso Encarregado de Proteção de Dados pode ser contatado:\n\nEmail: dpo@invetoy.com.br\nEndereço: São Paulo - SP\n\nPara reclamações sobre o tratamento de seus dados, você também pode contatar a Autoridade Nacional de Proteção de Dados (ANPD).",
  },
  {
    icon: Shield,
    title: "10. Alterações nesta política",
    content:
      "Esta política pode ser atualizada periodicamente. Notificaremos os usuários com 30 dias de antecedência sobre alterações relevantes através do email cadastrado. Recomendamos revisar esta página regularmente.",
  },
];

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-default">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <BackButton />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
                Política de Privacidade
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
              </p>
              <p className="text-xs text-text-muted mt-0.5">Última atualização: 26 de junho de 2026</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-brand-6 flex items-center justify-center shrink-0 mt-0.5">
                  <section.icon className="h-4 w-4 text-brand" />
                </div>
                <h2 className="text-lg font-medium text-text-primary">{section.title}</h2>
              </div>
              <div className="text-sm text-text-secondary leading-relaxed pl-11 whitespace-pre-line">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* DPO Contact Card */}
        <div className="mt-16 p-6 rounded-lg border border-brand-20 bg-brand-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-8 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium mb-1">
                Entre em contato com nosso DPO
              </p>
              <p className="text-sm text-text-secondary">
                Para exercer seus direitos como titular de dados, envie um email para{" "}
                <a href="mailto:dpo@invetoy.com.br" className="text-brand hover:underline font-medium">
                  dpo@invetoy.com.br
                </a>
              </p>
              <p className="text-xs text-text-muted mt-2">
                Responderemos sua solicitação em até 15 dias conforme previsto na LGPD.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border-default py-6 px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-brand" />
            <span className="text-sm text-text-muted">INVENTOY © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/termos" className="text-xs text-text-muted hover:text-text-primary transition-colors">
              Termos de Serviço
            </Link>
            <Link href="/privacidade" className="text-xs text-text-brand hover:text-brand-hover transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

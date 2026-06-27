import { Box, Shield, FileText, Scale, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

export const metadata = {
  title: "Termos de Serviço — INVENTOY",
  description:
    "Termos e condições de uso da plataforma INVENTOY. Leia atentamente antes de utilizar nossos serviços.",
};

const sections = [
  {
    icon: FileText,
    title: "1. Aceitação dos Termos",
    content:
      "Ao criar uma conta e utilizar a plataforma INVENTOY, você declara ter lido, compreendido e aceitado todos os termos e condições aqui descritos. Caso não concorde com qualquer disposição deste documento, você não deve utilizar nossos serviços.",
  },
  {
    icon: Scale,
    title: "2. Definições",
    content:
      "Para fins destes Termos: 'Plataforma' refere-se ao sistema INVENTOY; 'Usuário' refere-se à pessoa física ou jurídica que utiliza a plataforma; 'Conta' é o registro único que permite acesso aos serviços; 'Conteúdo' são os dados inseridos pelo usuário na plataforma.",
  },
  {
    icon: Shield,
    title: "3. Cadastro e Conta",
    content:
      "Para utilizar a plataforma, é necessário criar uma conta fornecendo informações precisas e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.",
  },
  {
    icon: Shield,
    title: "4. Planos e Pagamentos",
    content:
      "Oferecemos planos Free, Starter e Pro com funcionalidades e limites específicos. Os pagamentos são processados com segurança em Reais (R$), com suporte a PIX, Boleto e Cartão de Crédito. O cancelamento pode ser solicitado a qualquer momento, sem multas. O reembolso segue a política de cada meio de pagamento.",
  },
  {
    icon: Shield,
    title: "5. Propriedade Intelectual",
    content:
      "A plataforma INVENTOY, incluindo seu código, design, marcas e conteúdo visual, é propriedade exclusiva da INVENTOY. O usuário concede à INVENTOY uma licença para processar seus dados exclusivamente para fins de prestação dos serviços contratados.",
  },
  {
    icon: AlertTriangle,
    title: "6. Limitação de Responsabilidade",
    content:
      "A INVENTOY não se responsabiliza por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso da plataforma. Nossa responsabilidade máxima está limitada ao valor pago pelo serviço nos 12 meses anteriores ao evento. A plataforma é fornecida 'no estado em que se encontra', sem garantias de disponibilidade ininterrupta.",
  },
  {
    icon: Shield,
    title: "7. Privacidade e Dados",
    content:
      "O tratamento de dados pessoais segue nossa Política de Privacidade, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Você tem direito a acessar, corrigir, excluir e portar seus dados a qualquer momento através das configurações da conta ou pelo email dpo@invetoy.com.br.",
  },
  {
    icon: Shield,
    title: "8. Cancelamento e Exclusão",
    content:
      "Você pode cancelar sua conta a qualquer momento. Após o cancelamento, seus dados serão mantidos por 90 dias para permitir recuperação. Após esse período, os dados serão anonimizados ou excluídos permanentemente, salvo obrigação legal de retenção.",
  },
  {
    icon: Scale,
    title: "9. Disposições Gerais",
    content:
      "Estes Termos são regidos pela legislação brasileira. Qualquer disputa será solucionada no foro da comarca de São Paulo - SP. Caso alguma cláusula seja considerada inválida, as demais permanecem em vigor. A INVENTOY pode alterar estes termos a qualquer momento, notificando os usuários com 30 dias de antecedência.",
  },
];

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-default">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <BackButton />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
                Termos de Serviço
              </h1>
              <p className="text-sm text-text-muted mt-1">Última atualização: 26 de junho de 2026</p>
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
                <div className="w-8 h-8 rounded-md bg-brand/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                  <section.icon className="h-4 w-4 text-brand" />
                </div>
                <h2 className="text-lg font-medium text-text-primary">{section.title}</h2>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed pl-11">{section.content}</p>
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 p-6 rounded-lg border border-border-default bg-bg-surface">
          <div className="flex items-start gap-3">
            <Box className="h-5 w-5 text-brand shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-text-primary font-medium mb-1">
                INVENTOY — Gestão de Estoque Inteligente
              </p>
              <p className="text-sm text-text-muted">
                CNPJ: 00.000.000/0001-00 • contato@invetoy.com.br
              </p>
              <p className="text-sm text-text-muted mt-2">
                Para dúvidas sobre estes termos, entre em contato pelo email{" "}
                <a href="mailto:contato@invetoy.com.br" className="text-brand hover:underline">
                  contato@invetoy.com.br
                </a>
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
            <Link href="/privacidade" className="text-xs text-text-muted hover:text-text-primary transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="text-xs text-text-brand hover:text-brand-hover transition-colors">
              Termos de Serviço
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

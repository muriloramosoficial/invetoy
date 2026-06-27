"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Download, BarChart3, Package, AlertTriangle, ArrowRightLeft, TrendingUp } from "lucide-react";

const reports = [
  {
    id: "inventory-summary",
    title: "Resumo do Inventario",
    description: "Visao completa de todos os itens com quantidades e valores",
    icon: Package,
    color: "text-brand",
  },
  {
    id: "low-stock",
    title: "Estoque Baixo",
    description: "Produtos abaixo do nivel minimo de estoque que precisam de atencao",
    icon: AlertTriangle,
    color: "text-brand-warning",
  },
  {
    id: "movements",
    title: "Historico de Movimentacoes",
    description: "Registro cronologico de todas as movimentacoes com filtros",
    icon: ArrowRightLeft,
    color: "text-brand-info",
  },
  {
    id: "valuation",
    title: "Valorizacao do Estoque",
    description: "Analise de custo e valor de venda do estoque atual",
    icon: TrendingUp,
    color: "text-brand",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Relatorios
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Gere e exporte relatorios de inventario
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[4px] bg-brand-dim flex items-center justify-center">
                    <report.icon className={`h-5 w-5 ${report.color}`} />
                  </div>
                  <div>
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button size="sm">
                  <FileText className="h-3.5 w-3.5" />
                  Gerar
                </Button>
                <Button variant="secondary" size="sm">
                  <Download className="h-3.5 w-3.5" />
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent reports */}
      <div>
        <h2 className="text-sm font-medium text-text-primary mb-3">Gerados Recentemente</h2>
        <Card>
          <div className="p-5 text-center text-text-muted">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum relatorio gerado ainda</p>
            <p className="text-xs mt-1">Gere seu primeiro relatorio acima</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

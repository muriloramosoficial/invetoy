"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  FileText,
  Download,
  BarChart3,
  Package,
  AlertTriangle,
  ArrowRightLeft,
  TrendingUp,
  Loader2,
  FileSpreadsheet,
  FileDown,
  FileCode2,
} from "lucide-react";
import { exportData, type ExportFormat } from "@/lib/export-utils";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

interface Report {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const reports: Report[] = [
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

const exportFormats: { value: ExportFormat; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "csv", label: "CSV", icon: FileSpreadsheet },
  { value: "xlsx", label: "Excel", icon: FileDown },
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "xml", label: "XML", icon: FileCode2 },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [exporting, setExporting] = useState<{ reportId: string; format: ExportFormat } | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const showError = useCallback((msg: string) => {
    toastError(msg);
  }, [toastError]);

  const fetchReportData = async (reportId: string): Promise<Record<string, unknown>[]> => {
    const supabase = createClient();

    switch (reportId) {
      case "inventory-summary": {
        const { data: products, error } = await supabase
          .from("products")
          .select("id, name, sku, description, category:categories(name), price, cost, is_active, created_at")
          .order("name", { ascending: true });

        if (error) throw error;
        return (products || []).map((p: Record<string, unknown>) => ({
          Nome: p.name || "",
          SKU: p.sku || "",
          Descricao: (p.description as string)?.slice(0, 100) || "",
          Categoria: (p.category as Record<string, unknown>)?.name || "-",
          "Preco Venda": p.price ? `R$ ${Number(p.price).toFixed(2)}` : "-",
          "Preco Custo": p.cost ? `R$ ${Number(p.cost).toFixed(2)}` : "-",
          Status: p.is_active ? "Ativo" : "Inativo",
          "Criado em": p.created_at ? new Date(p.created_at as string).toLocaleDateString("pt-BR") : "-",
        }));
      }

      case "low-stock": {
        const { data: allItems, error: allError } = await supabase
          .from("inventory_items")
          .select("id, quantity, min_stock, product:products(name, sku)")
          .order("quantity", { ascending: true });

        if (allError) throw allError;

        const lowItems = (allItems || []).filter(
          (i: Record<string, unknown>) => Number(i.quantity || 0) <= Number(i.min_stock || 0)
        );

        return lowItems.map((i: Record<string, unknown>) => ({
          Produto: (i.product as Record<string, unknown>)?.name || "-",
          SKU: (i.product as Record<string, unknown>)?.sku || "-",
          "Qtd. Atual": i.quantity ?? 0,
          "Estq. Minimo": i.min_stock ?? 0,
          Diferenca: Number(i.quantity || 0) - Number(i.min_stock || 0),
          Status: Number(i.quantity || 0) <= 0 ? "ESGOTADO" : "BAIXO",
        }));
      }

      case "movements": {
        const { data: movements, error } = await supabase
          .from("movements")
          .select("id, type, quantity, created_at, notes, reference, product:products(name, sku), from_location:locations!from_location_id(name), to_location:locations!to_location_id(name)")
          .order("created_at", { ascending: false })
          .limit(500);

        if (error) throw error;

        return (movements || []).map((m: Record<string, unknown>) => ({
          Produto: (m.product as Record<string, unknown>)?.name || "-",
          SKU: (m.product as Record<string, unknown>)?.sku || "-",
          Tipo: String(m.type || "").toUpperCase(),
          Quantidade: m.quantity ?? 0,
          Origem: (m.from_location as Record<string, unknown>)?.name || "-",
          Destino: (m.to_location as Record<string, unknown>)?.name || "-",
          Referencia: m.reference || "-",
          Observacao: (m.notes as string)?.slice(0, 80) || "-",
          Data: m.created_at ? new Date(m.created_at as string).toLocaleString("pt-BR") : "-",
        }));
      }

      case "valuation": {
        const { data: products, error } = await supabase
          .from("products")
          .select("id, name, sku, price, cost, is_active")
          .order("name", { ascending: true });

        if (error) throw error;

        return (products || []).map((p: Record<string, unknown>) => ({
          Nome: p.name || "",
          SKU: p.sku || "",
          "Preco Venda": p.price ? `R$ ${Number(p.price).toFixed(2)}` : "-",
          "Preco Custo": p.cost ? `R$ ${Number(p.cost).toFixed(2)}` : "-",
          Margem:
            p.price && p.cost
              ? `${(((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100).toFixed(1)}%`
              : "-",
          Status: p.is_active ? "Ativo" : "Inativo",
        }));
      }

      default:
        return [];
    }
  };

  const handleGenerate = async (report: Report) => {
    setGenerating(report.id);
    try {
      const data = await fetchReportData(report.id);
      if (data.length === 0) {
        showError("Nenhum dado encontrado para este relatorio.");
        return;
      }
      // Default: export to CSV on "Gerar"
      const columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
      const fileName = `${report.title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}`;
      exportData(data, columns, fileName, "csv", report.title);
      toastSuccess(`Relatorio "${report.title}" gerado com sucesso!`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao gerar relatorio");
    } finally {
      setGenerating(null);
    }
  };

  const handleExport = async (report: Report, format: ExportFormat) => {
    setExporting({ reportId: report.id, format });
    try {
      const data = await fetchReportData(report.id);
      if (data.length === 0) {
        showError("Nenhum dado encontrado para exportar.");
        return;
      }
      const columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
      const fileName = `${report.title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}`;
      exportData(data, columns, fileName, format, report.title);
      toastSuccess(`Relatorio exportado como ${format.toUpperCase()}!`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao exportar relatorio");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Relatorios</h1>
        <p className="text-sm text-text-muted mt-1">
          Gere e exporte relatorios de inventario nos formatos CSV, Excel, PDF ou XML
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {reports.map((report) => {
          const ReportIcon = report.icon;
          const isGenerating = generating === report.id;
          const isExporting = exporting?.reportId === report.id;

          return (
            <Card key={report.id}>
              <CardHeader className="p-4 lg:p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-[4px] bg-brand-dim flex items-center justify-center shrink-0">
                      <ReportIcon className={`h-4 w-4 md:h-5 md:w-5 ${report.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm md:text-base">{report.title}</CardTitle>
                      <CardDescription className="text-xs md:text-sm">{report.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 lg:px-5 pb-4 lg:pb-5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleGenerate(report)}
                    disabled={!!generating || !!exporting}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    {isGenerating ? "Gerando..." : "Gerar"}
                  </Button>

                  <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                    {exportFormats.map((fmt) => {
                      const FmtIcon = fmt.icon;
                      const isLoading = isExporting && exporting?.format === fmt.value;
                      return (
                        <Button
                          key={fmt.value}
                          variant="secondary"
                          size="sm"
                          className="flex-1 sm:flex-initial px-1.5 md:px-2"
                          onClick={() => handleExport(report, fmt.value)}
                          disabled={!!generating || !!exporting}
                          title={`Exportar como ${fmt.label}`}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FmtIcon className="h-3.5 w-3.5" />
                          )}
                          <span className="text-[10px] ml-1 hidden sm:inline">{fmt.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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

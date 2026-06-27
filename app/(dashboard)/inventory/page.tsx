"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { TechBadge } from "@/components/tech-badge";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Edit3,
  ArrowRightLeft,
  RotateCcw,
  SlidersHorizontal,
  Package,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { InventoryItem, Product, Location, Category } from "@/types";

interface InventoryWithRelations extends InventoryItem {
  product: Product & { category?: Category };
  location: Location;
}

type FilterChip = "all" | "low" | "critical";

function getStatus(item: InventoryWithRelations): "ok" | "low" | "critical" {
  if (item.quantity === 0) return "critical";
  if (item.quantity < (item.product.min_stock || 0)) return "low";
  return "ok";
}

function statusBadge(status: "ok" | "low" | "critical") {
  switch (status) {
    case "ok":
      return <TechBadge variant="green">OK</TechBadge>;
    case "low":
      return <TechBadge variant="yellow">BAIXO</TechBadge>;
    case "critical":
      return <TechBadge variant="red">CRITICO</TechBadge>;
  }
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from("inventory_items")
          .select(`
            *,
            product:products(
              *,
              category:categories(*)
            ),
            location:locations(*)
          `);

        if (queryError) throw queryError;
        if (mounted) setItems((data || []) as unknown as InventoryWithRelations[]);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Erro ao carregar estoque");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filteredItems = items.filter((item) => {
    const status = getStatus(item);
    const product = item.product;

    const matchesSearch =
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.category?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "low" && status === "low") ||
      (activeFilter === "critical" && status === "critical");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Estoque
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Carregando..." : `${filteredItems.length} itens · Gerencie niveis de estoque e localizacoes`}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      {error && (
        <div className="rounded-[4px] border border-brand-danger-30 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por SKU, nome, categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted-60 focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {([
            { key: "all" as FilterChip, label: "Todos" },
            { key: "low" as FilterChip, label: "Estoque Baixo" },
            { key: "critical" as FilterChip, label: "Critico" },
          ]).map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeFilter === chip.key
                  ? "bg-brand-dim text-brand border border-brand-30"
                  : "bg-bg-surface text-text-secondary border border-border-default hover:border-[#444] hover:text-text-primary"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <Button variant="secondary" size="sm">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
        </Button>
      </div>

      {/* Data Table */}
      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Qtd Total</TableHead>
              <TableHead>Localizacao</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Carregando estoque...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Package className="h-8 w-8" />
                    <p className="text-sm">Nenhum item encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const status = getStatus(item);
                const product = item.product;
                const loc = item.location;
                const locLabel = loc.aisle && loc.shelf ? `${loc.aisle}-S${loc.shelf}` : loc.name;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-mono text-xs text-brand">{product.sku}</span>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span className="text-xs text-text-muted">{product.category?.name || "-"}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {item.quantity}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-text-secondary">
                        {locLabel}
                      </span>
                    </TableCell>
                    <TableCell>{statusBadge(status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Ajustar"
                          onClick={() => setAdjustModalOpen(true)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" title="Mover">
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" title="Editar">
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Adjustment Modal */}
      <Dialog
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Ajuste Rapido"
        description="Selecione um item para ajustar niveis de estoque"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            {[
              { value: "in", label: "Entrada" },
              { value: "out", label: "Saida" },
              { value: "count", label: "Contagem" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-[4px] border border-border-default bg-bg-surface cursor-pointer hover:border-brand-30 hover:bg-brand-dim transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-dim"
              >
                <input
                  type="radio"
                  name="adjustType"
                  value={opt.value}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-text-primary">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Quantidade
            </label>
            <input
              type="number"
              defaultValue={1}
              min={1}
              className="w-full h-14 rounded-[4px] border border-border-default bg-bg-surface px-4 text-2xl font-mono text-text-primary text-center focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Observacoes <span className="text-brand-danger">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Motivo do ajuste..."
              className="w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted-60 focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setAdjustModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setAdjustModalOpen(false)}>
              Confirmar Ajuste
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}

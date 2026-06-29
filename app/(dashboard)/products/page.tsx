"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { TechBadge } from "@/components/tech-badge";
import {
  Plus,
  Edit3,
  Archive,
  RotateCcw,
  Search,
  Package,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { getBrowserClient } from "@infra/database/supabase/client";
import { useToast } from "@/components/ui/toast";
import { FilterBar } from "@/components/ui/filter-bar";
import { useProducts } from "@modules/catalog/presentation/hooks/use-products";
import type { Condition } from "@modules/catalog/domain/product.types";

const conditions = [
  { value: "excelente", label: "Excelente" },
  { value: "bom", label: "Bom" },
  { value: "regular", label: "Regular" },
  { value: "ruim", label: "Ruim" },
  { value: "danificado", label: "Danificado" },
];

const emptyForm = {
  asset_tag: "",
  name: "",
  category_id: "",
  description: "",
  brand: "",
  model: "",
  serial_number: "",
  acquisition_date: "",
  warranty_expiry: "",
  responsible_user: "",
  condition: "bom",
  cost: "",
};

export default function ProductsPage() {
  const {
    products,
    categories,
    loading,
    error,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    showArchived,
    setShowArchived,
    refresh,
    create,
    update,
    archive,
  } = useProducts();
  const { error: toastError } = useToast();
  const [filterCondition, setFilterCondition] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof products[number] | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const conditionOptions = conditions.map((c) => ({ value: c.value, label: c.label }));

  const filtered = products.filter((p) => {
    const matchesCondition = filterCondition === "all" || p.condition === filterCondition;
    return matchesCondition;
  });

  const resetForm = () => setForm({ ...emptyForm });

  const openCreate = () => {
    setEditingProduct(null);
    resetForm();
    setForm((f) => ({ ...f, asset_tag: "PAT-" }));
    setModalOpen(true);
  };

  const openEdit = (p: typeof products[number]) => {
    setEditingProduct(p);
    setForm({
      asset_tag: p.asset_tag || "",
      name: p.name,
      category_id: p.category_id || "",
      description: p.description || "",
      brand: p.brand || "",
      model: p.model || "",
      serial_number: p.serial_number || "",
      acquisition_date: p.acquisition_date || "",
      warranty_expiry: p.warranty_expiry || "",
      responsible_user: p.responsible_user || "",
      condition: p.condition || "bom",
      cost: p.cost?.toString() || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        asset_tag: form.asset_tag || undefined,
        name: form.name,
        category_id: form.category_id || undefined,
        description: form.description || undefined,
        brand: form.brand || undefined,
        model: form.model || undefined,
        serial_number: form.serial_number || undefined,
        acquisition_date: form.acquisition_date || undefined,
        warranty_expiry: form.warranty_expiry || undefined,
        responsible_user: form.responsible_user || undefined,
        condition: (form.condition || undefined) as Condition | undefined,
        cost: form.cost ? parseFloat(form.cost) : undefined,
        sku: form.asset_tag || undefined,
        unit: "un" as const,
        min_stock: 0,
        price: undefined,
      };

      if (editingProduct) {
        await update(editingProduct.id, payload);
      } else {
        // Insert directly since create in the hook expects ProductInsert without id
        const supabase = getBrowserClient();
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }

      setModalOpen(false);
      refresh();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Arquivar este item? Ele nao sera exibido nas listas padrao.")) return;
    try {
      await archive(id);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao arquivar");
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const supabase = getBrowserClient();
      const { error } = await supabase.from("products").update({ archived_at: null }).eq("id", id);
      if (error) throw error;
      refresh();
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao desarquivar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">Patrimonio</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5 sm:mt-1 truncate">
            {loading ? "Carregando..." : `${filtered.length} itens cadastrados`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button variant="secondary" size="sm" className="px-2 sm:px-3" onClick={() => setShowArchived(!showArchived)} title={showArchived ? "Ocultar Arquivados" : "Mostrar Arquivados"}>
            {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline ml-1">{showArchived ? "Ocultar Arquivados" : "Mostrar Arquivados"}</span>
          </Button>
          <Button size="sm" className="px-2 sm:px-3" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Novo Item</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-[4px] border border-brand-danger-20 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[160px] sm:min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por placa, nome, marca, modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted-60 focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
          />
        </div>

        <FilterBar
          filters={[
            {
              key: "category",
              label: "Categoria",
              options: categoryOptions,
            },
            {
              key: "condition",
              label: "Condicao",
              options: conditionOptions,
            },
          ]}
          activeFilters={{ category: filterCategory, condition: filterCondition }}
          onFilterChange={(key, value) => {
            if (key === "category") setFilterCategory(value);
            if (key === "condition") setFilterCondition(value);
          }}
          onClear={() => {
            setFilterCategory("all");
            setFilterCondition("all");
          }}
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Marca / Modelo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Responsavel</TableHead>
              <TableHead>Condicao</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Carregando...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Package className="h-8 w-8" />
                    <p className="text-sm">Nenhum item de patrimonio encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const isArchived = !!p.archived_at;
                return (
                <TableRow key={p.id} className={isArchived ? "opacity-50" : ""}>
                  <TableCell>
                    <span className="font-mono text-xs text-brand font-semibold">{p.asset_tag || "-"}</span>
                    {isArchived && (
                      <span className="ml-1 text-[10px] font-medium text-text-muted bg-bg-surface px-1 py-0.5 rounded">ARQ</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <span className="text-xs text-text-secondary">
                      {p.brand && p.model ? `${p.brand} ${p.model}` : p.brand || p.model || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-text-muted">{p.category?.name || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-text-secondary">{p.responsible_user || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <TechBadge
                      variant={
                        p.condition === "excelente" || p.condition === "bom"
                          ? "green"
                          : p.condition === "regular"
                          ? "yellow"
                          : "red"
                      }
                    >
                      {(p.condition || "bom").toUpperCase()}
                    </TechBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)} disabled={isArchived}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      {isArchived ? (
                        <Button variant="ghost" size="icon-sm" onClick={() => handleUnarchive(p.id)} title="Desarquivar">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger" onClick={() => handleArchive(p.id)} title="Arquivar">
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <Package className="h-8 w-8" />
            <p className="text-sm">Nenhum item de patrimonio encontrado</p>
          </div>
        ) : (
          filtered.map((p) => {
            const isArchived = !!p.archived_at;
            return (
              <div
                key={p.id}
                className={`rounded-[6px] border ${isArchived ? "border-border-default opacity-50" : "border-border-default"} bg-bg-card p-4`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-brand font-semibold">{p.asset_tag || "-"}</span>
                      {isArchived && (
                        <span className="text-[10px] font-medium text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">ARQUIVADO</span>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-text-primary truncate">{p.name}</h3>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-2">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)} disabled={isArchived}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {isArchived ? (
                      <Button variant="ghost" size="icon-sm" onClick={() => handleUnarchive(p.id)} title="Desarquivar">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger" onClick={() => handleArchive(p.id)} title="Arquivar">
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <span>{p.brand && p.model ? `${p.brand} ${p.model}` : p.brand || p.model || "-"}</span>
                    {p.category?.name && <><span className="text-text-muted">·</span><span>{p.category.name}</span></>}
                  </div>
                  {p.responsible_user && (
                    <p className="text-text-muted">Resp: {p.responsible_user}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-default">
                  <TechBadge
                    variant={
                      p.condition === "excelente" || p.condition === "bom"
                        ? "green"
                        : p.condition === "regular"
                        ? "yellow"
                        : "red"
                    }
                  >
                    {(p.condition || "bom").toUpperCase()}
                  </TechBadge>
                  {p.cost && (
                    <span className="text-xs font-mono text-text-secondary">
                      R$ {Number(p.cost).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Editar Item" : "Novo Item de Patrimonio"}
        description={editingProduct ? `Editando ${editingProduct.asset_tag}` : "Registre um novo bem da empresa"}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Placa de Patrimonio"
              placeholder="ex: PAT-0001"
              value={form.asset_tag}
              onChange={(e) => set("asset_tag", e.target.value)}
            />
            <Input
              label="Nome do Item"
              placeholder="ex: Monitor Dell 24"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Marca"
              placeholder="ex: Dell"
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
            />
            <Input
              label="Modelo"
              placeholder="ex: P2422H"
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Numero de Serie"
              placeholder="ex: SN12345678"
              value={form.serial_number}
              onChange={(e) => set("serial_number", e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Categoria
              </label>
              <select
                value={form.category_id}
                onChange={(e) => set("category_id", e.target.value)}
                className="flex h-10 w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
              >
                <option value="">Selecionar...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Responsavel"
              placeholder="Nome do responsavel"
              value={form.responsible_user}
              onChange={(e) => set("responsible_user", e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Condicao
              </label>
              <select
                value={form.condition}
                onChange={(e) => set("condition", e.target.value)}
                className="flex h-10 w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
              >
                {conditions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data de Aquisicao"
              type="date"
              value={form.acquisition_date}
              onChange={(e) => set("acquisition_date", e.target.value)}
            />
            <Input
              label="Garantia Ate"
              type="date"
              value={form.warranty_expiry}
              onChange={(e) => set("warranty_expiry", e.target.value)}
            />
          </div>

          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.cost}
            onChange={(e) => set("cost", e.target.value)}
          />

          <Input
            label="Descricao"
            placeholder="Descricao opcional"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />

          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editingProduct ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
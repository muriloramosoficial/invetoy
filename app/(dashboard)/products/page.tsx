"use client";

import { useState, useEffect } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import type { Product, Category } from "@/types";

const conditions = [
  { value: "excelente", label: "Excelente" },
  { value: "bom", label: "Bom" },
  { value: "regular", label: "Regular" },
  { value: "ruim", label: "Ruim" },
  { value: "danificado", label: "Danificado" },
];

interface ProductWithCategory extends Product {
  category?: Category;
}

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
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: toastError } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showArchived, setShowArchived] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const query = supabase.from("products").select("*, category:categories(*)");
        if (!showArchived) query.is("archived_at", null);
        const [productsResult, categoriesResult] = await Promise.all([
          query,
          supabase.from("categories").select("*"),
        ]);

        if (productsResult.error) throw productsResult.error;
        if (categoriesResult.error) throw categoriesResult.error;

        if (mounted) setProducts((productsResult.data || []) as unknown as ProductWithCategory[]);
        if (mounted) setCategories(categoriesResult.data || []);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Erro ao carregar patrimonio");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [refreshKey, showArchived]);

  const filtered = products.filter(
    (p) =>
      (p.asset_tag || "").toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.model || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.serial_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => setForm({ ...emptyForm });

  const openCreate = () => {
    setEditingProduct(null);
    resetForm();
    setForm((f) => ({ ...f, asset_tag: "PAT-" }));
    setModalOpen(true);
  };

  const openEdit = (p: ProductWithCategory) => {
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
      const supabase = createClient();
      const payload = {
        asset_tag: form.asset_tag || null,
        name: form.name,
        category_id: form.category_id || null,
        description: form.description || null,
        brand: form.brand || null,
        model: form.model || null,
        serial_number: form.serial_number || null,
        acquisition_date: form.acquisition_date || null,
        warranty_expiry: form.warranty_expiry || null,
        responsible_user: form.responsible_user || null,
        condition: form.condition || null,
        cost: form.cost ? parseFloat(form.cost) : null,
        sku: form.asset_tag || null,
        unit: "un",
        min_stock: 0,
        price: null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }

      setModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Arquivar este item? Ele nao sera exibido nas listas padrao.")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").update({ archived_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao arquivar");
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").update({ archived_at: null }).eq("id", id);
      if (error) throw error;
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao desarquivar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Patrimonio</h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Carregando..." : `${filtered.length} itens cadastrados`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showArchived ? "Ocultar Arquivados" : "Mostrar Arquivados"}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo Item
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-[4px] border border-brand-danger-20 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar por placa, nome, marca, modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted-60 focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
        />
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
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

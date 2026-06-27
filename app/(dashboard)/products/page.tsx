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
  Trash2,
  Search,
  Package,
  Loader2,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/types";

const units = [
  { value: "un", label: "Unidade" },
  { value: "kg", label: "Quilograma" },
  { value: "g", label: "Grama" },
  { value: "l", label: "Litro" },
  { value: "ml", label: "Mililitro" },
  { value: "cx", label: "Caixa" },
  { value: "pc", label: "Peça" },
];

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
  sku: "",
  name: "",
  category_id: "",
  unit: "un",
  description: "",
  cost: "",
  price: "",
  min_stock: "",
  asset_tag: "",
  brand: "",
  model: "",
  serial_number: "",
  acquisition_date: "",
  warranty_expiry: "",
  responsible_user: "",
  condition: "bom",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"estoque" | "patrimonio">("estoque");
  const [form, setForm] = useState(emptyForm);
  const [refreshKey, setRefreshKey] = useState(0);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const [productsResult, categoriesResult, stockResult] = await Promise.all([
          supabase.from("products").select(`*, category:categories(*)`),
          supabase.from("categories").select("*"),
          supabase.from("inventory_items").select("product_id, quantity"),
        ]);

        if (productsResult.error) throw productsResult.error;
        if (categoriesResult.error) throw categoriesResult.error;
        if (stockResult.error) throw stockResult.error;

        if (mounted) setProducts((productsResult.data || []) as unknown as ProductWithCategory[]);
        if (mounted) setCategories(categoriesResult.data || []);

        const stock: Record<string, number> = {};
        (stockResult.data || []).forEach((item: { product_id: string; quantity: number }) => {
          stock[item.product_id] = (stock[item.product_id] || 0) + item.quantity;
        });
        if (mounted) setStockMap(stock);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Erro ao carregar produtos");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [refreshKey]);

  const isPatrimonio = (p: ProductWithCategory) => !!p.asset_tag;

  const estoque = products.filter((p) => !isPatrimonio(p));
  const patrimonio = products.filter((p) => isPatrimonio(p));

  const filtered = (tab === "estoque" ? estoque : patrimonio).filter(
    (p) =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.asset_tag || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.serial_number || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => setForm({ ...emptyForm });

  const openCreate = () => {
    setEditingProduct(null);
    resetForm();
    if (tab === "patrimonio") {
      setForm((f) => ({ ...f, asset_tag: "PAT-" }));
    }
    setModalOpen(true);
  };

  const openEdit = (p: ProductWithCategory) => {
    setEditingProduct(p);
    setForm({
      sku: p.sku,
      name: p.name,
      category_id: p.category_id || "",
      unit: p.unit,
      description: p.description || "",
      cost: p.cost?.toString() || "",
      price: p.price?.toString() || "",
      min_stock: p.min_stock.toString(),
      asset_tag: p.asset_tag || "",
      brand: p.brand || "",
      model: p.model || "",
      serial_number: p.serial_number || "",
      acquisition_date: p.acquisition_date || "",
      warranty_expiry: p.warranty_expiry || "",
      responsible_user: p.responsible_user || "",
      condition: p.condition || "bom",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        sku: form.sku,
        name: form.name,
        category_id: form.category_id || null,
        unit: form.unit,
        description: form.description || null,
        cost: form.cost ? parseFloat(form.cost) : null,
        price: form.price ? parseFloat(form.price) : null,
        min_stock: parseInt(form.min_stock) || 0,
        asset_tag: form.asset_tag || null,
        brand: form.brand || null,
        model: form.model || null,
        serial_number: form.serial_number || null,
        acquisition_date: form.acquisition_date || null,
        warranty_expiry: form.warranty_expiry || null,
        responsible_user: form.responsible_user || null,
        condition: form.condition || null,
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
      setError(err instanceof Error ? err.message : "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir produto");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            {tab === "estoque" ? "Estoque" : "Patrimonio"}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {loading
              ? "Carregando..."
              : tab === "estoque"
              ? `${estoque.length} itens no estoque`
              : `${patrimonio.length} bens patrocinados`}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {tab === "estoque" ? "Novo Item" : "Novo Patrimonio"}
        </Button>
      </div>

      <div className="flex gap-1 p-1 bg-bg-surface border border-border-default rounded-[4px] w-fit">
        <button
          onClick={() => { setTab("estoque"); setSearch(""); }}
          className={`px-4 py-2 text-sm rounded-[2px] transition-colors ${
            tab === "estoque"
              ? "bg-brand text-black font-medium"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Package className="h-4 w-4 inline mr-1.5" />
          Estoque
        </button>
        <button
          onClick={() => { setTab("patrimonio"); setSearch(""); }}
          className={`px-4 py-2 text-sm rounded-[2px] transition-colors ${
            tab === "patrimonio"
              ? "bg-brand text-black font-medium"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <Tag className="h-4 w-4 inline mr-1.5" />
          Patrimonio
        </button>
      </div>

      {error && (
        <div className="rounded-[4px] border border-brand-danger-30 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder={tab === "estoque" ? "Buscar por SKU, nome, categoria..." : "Buscar por placa, nome, marca, serie..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted-60 focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
        />
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {tab === "estoque" ? (
                <>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Preco</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Placa</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Responsavel</TableHead>
                  <TableHead>Condicao</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tab === "estoque" ? 9 : 7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Carregando...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tab === "estoque" ? 9 : 7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Package className="h-8 w-8" />
                    <p className="text-sm">
                      {tab === "estoque"
                        ? "Nenhum item encontrado"
                        : "Nenhum patrimonio encontrado"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const stock = stockMap[p.id] || 0;
                return (
                  <TableRow key={p.id}>
                    {tab === "estoque" ? (
                      <>
                        <TableCell>
                          <span className="font-mono text-xs text-brand">{p.sku}</span>
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          <span className="text-xs text-text-muted">{p.category?.name || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-text-secondary">{p.unit}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          R$ {(p.cost ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          R$ {(p.price ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={stock <= p.min_stock ? "text-brand-danger" : "text-text-primary"}>
                            {stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          {p.is_active ? (
                            <TechBadge variant="green">ATIVO</TechBadge>
                          ) : (
                            <TechBadge variant="red">INATIVO</TechBadge>
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <span className="font-mono text-xs text-brand font-semibold">{p.asset_tag}</span>
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
                      </>
                    )}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
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

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Editar Item" : "Novo Item"}
        description={editingProduct ? `Editando ${editingProduct.sku || editingProduct.asset_tag}` : "Adicione um novo item ao catalogo"}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={tab === "estoque" ? "SKU" : "Placa de Patrimonio"}
              placeholder={tab === "estoque" ? "ex: ELT-001" : "ex: PAT-0001"}
              value={tab === "patrimonio" ? form.asset_tag : form.sku}
              onChange={(e) => set(tab === "patrimonio" ? "asset_tag" : "sku", e.target.value)}
            />
            <Input
              label="Nome"
              placeholder="ex: Monitor Dell 24"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          {tab === "patrimonio" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SKU (opcional)"
                  placeholder="ex: MON-001"
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                />
                <Input
                  label="Marca"
                  placeholder="ex: Dell"
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Modelo"
                  placeholder="ex: P2422H"
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                />
                <Input
                  label="Numero de Serie"
                  placeholder="ex: SN12345678"
                  value={form.serial_number}
                  onChange={(e) => set("serial_number", e.target.value)}
                />
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
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
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
            {tab === "estoque" && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                  Unidade
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  className="flex h-10 w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
                >
                  {units.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Input
            label="Descricao"
            placeholder="Descricao opcional"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />

          {tab === "estoque" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Custo (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.cost}
                  onChange={(e) => set("cost", e.target.value)}
                />
                <Input
                  label="Preco (R$)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <Input
                label="Estoque Minimo"
                type="number"
                placeholder="0"
                value={form.min_stock}
                onChange={(e) => set("min_stock", e.target.value)}
              />
            </>
          )}

          {tab === "patrimonio" && (
            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.cost}
              onChange={(e) => set("cost", e.target.value)}
            />
          )}

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

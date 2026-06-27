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

interface ProductWithCategory extends Product {
  category?: Category;
}

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

  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formUnit, setFormUnit] = useState("un");
  const [formDescription, setFormDescription] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formMinStock, setFormMinStock] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

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
        (stockResult.data || []).forEach((item) => {
          stock[item.product_id] = (stock[item.product_id] || 0) + item.quantity;
        });
        if (mounted) setStockMap(stock);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to fetch products");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [refreshKey]);

  const filtered = products.filter(
    (p) =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormSku("");
    setFormName("");
    setFormCategoryId("");
    setFormUnit("un");
    setFormDescription("");
    setFormCost("");
    setFormPrice("");
    setFormMinStock("");
  };

  const openCreate = () => {
    setEditingProduct(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (p: ProductWithCategory) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormCategoryId(p.category_id || "");
    setFormUnit(p.unit);
    setFormDescription(p.description || "");
    setFormCost(p.cost?.toString() || "");
    setFormPrice(p.price?.toString() || "");
    setFormMinStock(p.min_stock.toString());
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        sku: formSku,
        name: formName,
        category_id: formCategoryId || null,
        unit: formUnit,
        description: formDescription || null,
        cost: formCost ? parseFloat(formCost) : null,
        price: formPrice ? parseFloat(formPrice) : null,
        min_stock: parseInt(formMinStock) || 0,
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
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Products</h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Loading..." : `${filtered.length} products · Manage your product catalog`}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {error && (
        <div className="rounded-[4px] border border-brand-danger/30 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by SKU, name, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted/60 focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none"
        />
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Loading products...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Package className="h-8 w-8" />
                    <p className="text-sm">No products found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const stock = stockMap[p.id] || 0;
                return (
                  <TableRow key={p.id}>
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
                        <TechBadge variant="green">ACTIVE</TechBadge>
                      ) : (
                        <TechBadge variant="red">INACTIVE</TechBadge>
                      )}
                    </TableCell>
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
        title={editingProduct ? "Edit Product" : "New Product"}
        description={editingProduct ? `Editing ${editingProduct.sku}` : "Create a new product in your catalog"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              placeholder="e.g., ELT-001"
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
            />
            <Input
              label="Name"
              placeholder="e.g., Resistor 10kΩ"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Category
              </label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Unit
              </label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="flex h-10 w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none"
              >
                {units.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Description"
            placeholder="Optional description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cost (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formCost}
              onChange={(e) => setFormCost(e.target.value)}
            />
            <Input
              label="Price (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Stock"
              type="number"
              placeholder="0"
              value={formMinStock}
              onChange={(e) => setFormMinStock(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}

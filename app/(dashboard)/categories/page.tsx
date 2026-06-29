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
import { Plus, Edit3, Archive, RotateCcw, Loader2, FolderOpen, Eye, EyeOff, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import type { Category } from "@/types";

const colorOptions = ["#3ECF8E", "#53B1E5", "#F5A623", "#E5484D", "#8B5CF6", "#06B6D4", "#F472B6", "#A1A1AA"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCountMap, setProductCountMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: toastError } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState("#3ECF8E");

  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const query = supabase.from("categories").select("*");
        if (!showArchived) query.is("archived_at", null);
        const [categoriesResult, productsResult] = await Promise.all([
          query,
          supabase.from("products").select("category_id"),
        ]);

        if (categoriesResult.error) throw categoriesResult.error;
        if (productsResult.error) throw productsResult.error;

        if (mounted) setCategories(categoriesResult.data || []);

        const countMap: Record<string, number> = {};
        (productsResult.data || []).forEach((p: { category_id: string | null }) => {
          if (p.category_id) {
            countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
          }
        });
        if (mounted) setProductCountMap(countMap);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Erro ao carregar categorias");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [refreshKey, showArchived]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormColor("#3ECF8E");
  };

  const openCreate = () => {
    setEditingCategory(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description || "");
    setFormColor(cat.color || "#3ECF8E");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const payload = {
        name: formName,
        description: formDescription || null,
        color: formColor,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }

      setModalOpen(false);
      setRefreshKey(k => k + 1);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Arquivar esta categoria? Ela nao sera exibida nas listas padrao.")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").update({ archived_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      setRefreshKey(k => k + 1);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao arquivar categoria");
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").update({ archived_at: null }).eq("id", id);
      if (error) throw error;
      setRefreshKey(k => k + 1);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao desarquivar categoria");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Categorias
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Carregando..." : `${categories.length} categorias · Organize seus produtos`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showArchived ? "Ocultar Arquivados" : "Mostrar Arquivados"}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Adicionar Categoria
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-[4px] border border-brand-danger-30 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted-60 focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
          />
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descricao</TableHead>
              <TableHead className="text-right">Produtos</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Carregando categorias...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <FolderOpen className="h-8 w-8" />
                    <p className="text-sm">Nenhuma categoria encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((cat) => {
                const isArchived = !!cat.archived_at;
                return (
                <TableRow key={cat.id} className={isArchived ? "opacity-50" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color || "#A1A1AA" }}
                      />
                      <span className="font-medium">{cat.name}</span>
                      {isArchived && (
                        <span className="text-[10px] font-medium text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">ARQUIVADO</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-text-muted text-sm">
                    {cat.description || "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {productCountMap[cat.id] || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)} disabled={isArchived}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      {isArchived ? (
                        <Button variant="ghost" size="icon-sm" onClick={() => handleUnarchive(cat.id)} title="Desarquivar">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger" onClick={() => handleArchive(cat.id)} title="Arquivar">
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
            <p className="text-sm">Carregando categorias...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <FolderOpen className="h-8 w-8" />
            <p className="text-sm">Nenhuma categoria encontrada</p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isArchived = !!cat.archived_at;
            return (
              <div
                key={cat.id}
                className={`rounded-[6px] border ${isArchived ? "border-border-default opacity-50" : "border-border-default"} bg-bg-card p-4`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || "#A1A1AA" }}
                    />
                    <div>
                      <h3 className="text-sm font-medium text-text-primary">
                        {cat.name}
                        {isArchived && (
                          <span className="ml-2 text-[10px] font-medium text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">ARQUIVADO</span>
                        )}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">{cat.description || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-2">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)} disabled={isArchived}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {isArchived ? (
                      <Button variant="ghost" size="icon-sm" onClick={() => handleUnarchive(cat.id)} title="Desarquivar">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger" onClick={() => handleArchive(cat.id)} title="Arquivar">
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border-default text-xs text-text-secondary">
                  <span className="font-mono font-medium">{productCountMap[cat.id] || 0}</span> produtos vinculados
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Editar Categoria" : "Criar Categoria"}
        description={editingCategory ? `Editando "${editingCategory.name}"` : "Adicionar uma nova categoria de produto"}
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            placeholder="ex: Eletronicos"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Input
            label="Descricao"
            placeholder="ex: Componentes eletronicos e semicondutores"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Cor
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-colors ${
                    formColor === color ? "border-white" : "border-transparent hover:border-white/50"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editingCategory ? "Salvar Alteracoes" : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}

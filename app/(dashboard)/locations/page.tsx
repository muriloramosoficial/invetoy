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
import { Plus, Archive, RotateCcw, Loader2, MapPin, Eye, EyeOff, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import type { Location } from "@/types";

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [itemCountMap, setItemCountMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: toastError } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formAisle, setFormAisle] = useState("");
  const [formShelf, setFormShelf] = useState("");
  const [formDescription, setFormDescription] = useState("");
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
        const query = supabase.from("locations").select("*");
        if (!showArchived) query.is("archived_at", null);
        const [locationsResult, itemsResult] = await Promise.all([
          query,
          supabase.from("inventory_items").select("location_id"),
        ]);

        if (locationsResult.error) throw locationsResult.error;
        if (itemsResult.error) throw itemsResult.error;

        if (mounted) setLocations(locationsResult.data || []);

        const countMap: Record<string, number> = {};
        (itemsResult.data || []).forEach((item: { location_id: string }) => {
          countMap[item.location_id] = (countMap[item.location_id] || 0) + 1;
        });
        if (mounted) setItemCountMap(countMap);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Erro ao carregar locais");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [refreshKey, showArchived]);

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase()) ||
    (loc.aisle || "").toLowerCase().includes(search.toLowerCase()) ||
    (loc.shelf || "").toLowerCase().includes(search.toLowerCase()) ||
    (loc.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("locations").insert({
        name: formName,
        aisle: formAisle || null,
        shelf: formShelf || null,
        description: formDescription || null,
      });
      if (error) throw error;

      setModalOpen(false);
      setFormName("");
      setFormAisle("");
      setFormShelf("");
      setFormDescription("");
      setRefreshKey(k => k + 1);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao criar local");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Arquivar este local? Ele nao sera exibido nas listas padrao.")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("locations").update({ archived_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      setRefreshKey(k => k + 1);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao arquivar local");
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("locations").update({ archived_at: null }).eq("id", id);
      if (error) throw error;
      setRefreshKey(k => k + 1);
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Erro ao desarquivar local");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Locais
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Carregando..." : `${locations.length} locais · Gerencie areas de armazenamento`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showArchived ? "Ocultar Arquivados" : "Mostrar Arquivados"}
          </Button>
          <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar Local
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
            placeholder="Buscar local..."
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
              <TableHead>Corredor</TableHead>
              <TableHead>Estante</TableHead>
              <TableHead>Descricao</TableHead>
              <TableHead className="text-right">Itens</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Carregando locais...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <MapPin className="h-8 w-8" />
                    <p className="text-sm">Nenhum local encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations.map((loc) => {
                const isArchived = !!loc.archived_at;
                return (
                <TableRow key={loc.id} className={isArchived ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{loc.name}
                    {isArchived && (
                      <span className="ml-1 text-[10px] font-medium text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">ARQUIVADO</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-brand">{loc.aisle || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-text-secondary">{loc.shelf || "-"}</span>
                  </TableCell>
                  <TableCell className="text-text-muted text-sm">
                    {loc.description || "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">{itemCountMap[loc.id] || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isArchived ? (
                        <Button variant="ghost" size="icon-sm" onClick={() => handleUnarchive(loc.id)} title="Desarquivar">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger" onClick={() => handleArchive(loc.id)} title="Arquivar">
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
            <p className="text-sm">Carregando locais...</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <MapPin className="h-8 w-8" />
            <p className="text-sm">Nenhum local encontrado</p>
          </div>
        ) : (
          filteredLocations.map((loc) => {
            const isArchived = !!loc.archived_at;
            return (
              <div
                key={loc.id}
                className={`rounded-[6px] border ${isArchived ? "border-border-default opacity-50" : "border-border-default"} bg-bg-card p-4`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary">
                      {loc.name}
                      {isArchived && (
                        <span className="ml-2 text-[10px] font-medium text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">ARQUIVADO</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {loc.aisle && (
                        <span className="font-mono text-xs text-brand">Corr: {loc.aisle}</span>
                      )}
                      {loc.shelf && (
                        <span className="font-mono text-xs text-text-secondary">Est: {loc.shelf}</span>
                      )}
                    </div>
                    {loc.description && (
                      <p className="text-xs text-text-muted mt-1 truncate">{loc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-2">
                    {isArchived ? (
                      <Button variant="ghost" size="icon-sm" onClick={() => handleUnarchive(loc.id)} title="Desarquivar">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger" onClick={() => handleArchive(loc.id)} title="Arquivar">
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border-default text-xs text-text-secondary">
                  <span className="font-mono font-medium">{itemCountMap[loc.id] || 0}</span> itens neste local
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Adicionar Local"
        description="Criar uma nova localizacao de armazenamento"
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            placeholder="ex: Galpao Principal - Estante A1"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Corredor"
              placeholder="ex: A"
              value={formAisle}
              onChange={(e) => setFormAisle(e.target.value)}
            />
            <Input
              label="Estante"
              placeholder="ex: 1"
              value={formShelf}
              onChange={(e) => setFormShelf(e.target.value)}
            />
          </div>
          <Input
            label="Descricao"
            placeholder="Descricao opcional"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Salvando..." : "Criar Local"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}

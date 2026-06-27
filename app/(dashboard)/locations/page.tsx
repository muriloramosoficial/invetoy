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
import { Plus, Trash2, Loader2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Location } from "@/types";

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [itemCountMap, setItemCountMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formAisle, setFormAisle] = useState("");
  const [formShelf, setFormShelf] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const [locationsResult, itemsResult] = await Promise.all([
          supabase.from("locations").select("*"),
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
  }, [refreshKey]);

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
      setError(err instanceof Error ? err.message : "Erro ao criar local");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este local?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir local");
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
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar Local
        </Button>
      </div>

      {error && (
        <div className="rounded-[4px] border border-brand-danger-30 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      <div className="rounded-[6px] border border-border-default overflow-hidden">
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
            ) : locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <MapPin className="h-8 w-8" />
                    <p className="text-sm">Nenhum local encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.name}</TableCell>
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
                      <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger" onClick={() => handleDelete(loc.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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

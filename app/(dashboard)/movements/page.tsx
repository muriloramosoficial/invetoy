"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { TechBadge } from "@/components/tech-badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightLeft,
  RotateCcw,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ClipboardListIcon,
} from "lucide-react";
import { FilterBar } from "@/components/ui/filter-bar";
import type { Movement, Product, Location, Profile } from "@/types";
import { useMovements } from "@/hooks/use-movements";

interface MovementWithRelations extends Movement {
  product?: Product;
  from_location?: Location | null;
  to_location?: Location | null;
  user?: Profile;
}

function MovementIcon({ type }: { type: string }) {
  switch (type) {
    case "in":
      return <ArrowDownCircle className="h-4 w-4 text-brand" />;
    case "out":
      return <ArrowUpCircle className="h-4 w-4 text-brand-danger" />;
    case "transfer":
      return <ArrowRightLeft className="h-4 w-4 text-brand-info" />;
    case "count":
      return <ClipboardList className="h-4 w-4 text-brand-warning" />;
    default:
      return <RotateCcw className="h-4 w-4 text-text-muted" />;
  }
}

const typeLabels: Record<string, string> = {
  in: "Entrada",
  out: "Saida",
  transfer: "Transferencia",
  count: "Contagem",
  adjustment: "Ajuste",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function MovementsPage() {
  const { data: movements, loading, error } = useMovements({ limit: 100 });
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const typeOptions = Object.entries(typeLabels).map(([value, label]) => ({ value, label }));

  const filtered = (movements as MovementWithRelations[]).filter((m) => {
    const matchesSearch =
      (m.product?.sku || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.user?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "all" || m.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Movimentacoes
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Carregando..." : "Registro de atividade · Todas as alteracoes de inventario registradas cronologicamente"}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-[4px] border border-brand-danger-30 bg-brand-danger-dim p-3 text-sm text-brand-danger">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por SKU ou usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted-60 focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
          />
        </div>

        <FilterBar
          filters={[
            {
              key: "type",
              label: "Tipo",
              options: typeOptions,
            },
          ]}
          activeFilters={{ type: filterType }}
          onFilterChange={(key, value) => {
            if (key === "type") setFilterType(value);
          }}
          onClear={() => setFilterType("all")}
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead>De</TableHead>
              <TableHead>Para</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Carregando movimentacoes...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <ClipboardListIcon className="h-8 w-8" />
                    <p className="text-sm">Nenhuma movimentacao encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => {
                const userName = m.user?.name || "Desconhecido";
                const initials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                const fromName = m.from_location
                  ? [m.from_location.aisle, m.from_location.shelf].filter(Boolean).join("-S") || m.from_location.name
                  : "-";
                const toName = m.to_location
                  ? [m.to_location.aisle, m.to_location.shelf].filter(Boolean).join("-S") || m.to_location.name
                  : "-";

                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs text-text-muted whitespace-nowrap">
                      {formatDate(m.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-bg-elevated flex items-center justify-center">
                          <span className="text-[10px] font-medium text-text-muted">
                            {initials}
                          </span>
                        </div>
                        <span className="text-sm">{userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-brand">{m.product?.sku || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <MovementIcon type={m.type} />
                        <TechBadge
                          variant={
                            m.type === "in" ? "green" :
                            m.type === "out" ? "red" :
                            m.type === "transfer" ? "blue" : "yellow"
                          }
                        >
                          {typeLabels[m.type] || m.type}
                        </TechBadge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={
                        m.type === "in" || m.type === "count" ? "text-brand" :
                        m.type === "out" ? "text-brand-danger" : "text-text-primary"
                      }>
                        {m.quantity > 0 ? "+" : ""}{m.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      {fromName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-text-muted">
                      {toName}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Carregando movimentacoes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
            <ClipboardListIcon className="h-8 w-8" />
            <p className="text-sm">Nenhuma movimentacao encontrada</p>
          </div>
        ) : (
          filtered.map((m) => {
            const userName = m.user?.name || "Desconhecido";
            const initials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
            const fromName = m.from_location
              ? [m.from_location.aisle, m.from_location.shelf].filter(Boolean).join("-S") || m.from_location.name
              : "-";
            const toName = m.to_location
              ? [m.to_location.aisle, m.to_location.shelf].filter(Boolean).join("-S") || m.to_location.name
              : "-";

            return (
              <div
                key={m.id}
                className="rounded-[6px] border border-border-default bg-bg-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center">
                      <span className="text-[10px] font-medium text-text-muted">{initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary truncate max-w-[160px]">{userName}</p>
                      <p className="text-[10px] font-mono text-text-muted">{formatDate(m.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-base font-semibold font-mono ${
                      m.type === "in" || m.type === "count" ? "text-brand" :
                      m.type === "out" ? "text-brand-danger" : "text-text-primary"
                    }`}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <MovementIcon type={m.type} />
                  <TechBadge
                    variant={
                      m.type === "in" ? "green" :
                      m.type === "out" ? "red" :
                      m.type === "transfer" ? "blue" : "yellow"
                    }
                  >
                    {typeLabels[m.type] || m.type}
                  </TechBadge>
                  {m.product?.sku && (
                    <span className="font-mono text-xs text-brand ml-auto">{m.product.sku}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-text-muted">
                  {fromName !== "-" && (
                    <span className="truncate">De: {fromName}</span>
                  )}
                  {toName !== "-" && (
                    <><span>→</span><span className="truncate">{toName}</span></>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Mostrando {filtered.length} de {movements.length} movimentacoes
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-text-muted px-2">Pagina 1 de 1</span>
          <Button variant="secondary" size="sm" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

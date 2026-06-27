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
  in: "Entry",
  out: "Exit",
  transfer: "Transfer",
  count: "Count",
  adjustment: "Adjustment",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function MovementsPage() {
  const { data: movements, loading, error } = useMovements({ limit: 100 });
  const [search, setSearch] = useState("");

  const filtered = (movements as MovementWithRelations[]).filter(
    (m) =>
      (m.product?.sku || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.user?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Movements
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {loading ? "Loading..." : "Audit log · All inventory changes recorded chronologically"}
          </p>
        </div>
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
          placeholder="Search by SKU or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted-60 focus:border-brand-40 focus:ring-1 focus:ring-brand-20 transition-colors outline-none"
        />
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Loading movements...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <ClipboardListIcon className="h-8 w-8" />
                    <p className="text-sm">No movements found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => {
                const userName = m.user?.name || "Unknown";
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Showing {filtered.length} of {movements.length} movements
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-text-muted px-2">Page 1 of 1</span>
          <Button variant="secondary" size="sm" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

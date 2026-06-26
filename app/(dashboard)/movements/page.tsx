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
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

const movements = [
  { id: "1", date: "2024-06-26T10:23:00", user: "Carlos Silva", sku: "ELT-001", type: "in" as const, qty: 50, from: "-", to: "A1-S3" },
  { id: "2", date: "2024-06-26T09:15:00", user: "Ana Oliveira", sku: "MEC-042", type: "out" as const, qty: 5, from: "A2-S1", to: "Produção" },
  { id: "3", date: "2024-06-25T16:42:00", user: "Carlos Silva", sku: "HID-007", type: "in" as const, qty: 20, from: "-", to: "A3-S2" },
  { id: "4", date: "2024-06-25T14:30:00", user: "Pedro Santos", sku: "ELT-015", type: "transfer" as const, qty: 10, from: "A1-S6", to: "A1-S8" },
  { id: "5", date: "2024-06-25T11:05:00", user: "Ana Oliveira", sku: "FERR-09", type: "out" as const, qty: 3, from: "A4-S1", to: "Manutenção" },
  { id: "6", date: "2024-06-24T15:20:00", user: "Carlos Silva", sku: "QUI-023", type: "count" as const, qty: 34, from: "A5-S3", to: "A5-S3" },
  { id: "7", date: "2024-06-24T10:00:00", user: "Pedro Santos", sku: "PNE-003", type: "in" as const, qty: 50, from: "-", to: "A6-S2" },
  { id: "8", date: "2024-06-23T16:15:00", user: "Ana Oliveira", sku: "ELT-002", type: "adjustment" as const, qty: -2, from: "A1-S4", to: "A1-S4" },
];

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = movements.filter(
    (m) =>
      m.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Movements
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Audit log · All inventory changes recorded chronologically
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by SKU or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted/60 focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none"
        />
      </div>

      {/* Table */}
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
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-xs text-text-muted whitespace-nowrap">
                  {formatDate(m.date)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-bg-elevated flex items-center justify-center">
                      <span className="text-[10px] font-medium text-text-muted">
                        {m.user.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <span className="text-sm">{m.user}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-brand">{m.sku}</span>
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
                      {typeLabels[m.type]}
                    </TechBadge>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  <span className={
                    m.type === "in" || m.type === "count" ? "text-brand" :
                    m.type === "out" ? "text-brand-danger" : "text-text-primary"
                  }>
                    {m.qty > 0 ? "+" : ""}{m.qty}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-text-muted">
                  {m.from}
                </TableCell>
                <TableCell className="font-mono text-xs text-text-muted">
                  {m.to}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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

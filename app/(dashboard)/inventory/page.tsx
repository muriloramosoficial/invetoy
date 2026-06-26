"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { TechBadge } from "@/components/tech-badge";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Edit3,
  ArrowRightLeft,
  RotateCcw,
  Filter,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronDown,
  Package,
} from "lucide-react";

// Sample data
const inventoryItems = [
  { id: "1", sku: "ELT-001", name: "Resistor 10kΩ", category: "Eletrônicos", totalQty: 150, location: "A1-S3", status: "ok" as const, price: 0.15 },
  { id: "2", sku: "ELT-002", name: "Capacitor 100µF", category: "Eletrônicos", totalQty: 80, location: "A1-S4", status: "ok" as const, price: 0.45 },
  { id: "3", sku: "MEC-042", name: "Parafuso M8 x 30mm", category: "Mecânica", totalQty: 12, location: "A2-S1", status: "low" as const, price: 0.08 },
  { id: "4", sku: "HID-007", name: "Óleo Hidráulico AW68", category: "Hidráulica", totalQty: 2, location: "A3-S2", status: "critical" as const, price: 45.90 },
  { id: "5", sku: "FERR-09", name: "Chave Allen 5mm", category: "Ferramentas", totalQty: 1, location: "A4-S1", status: "critical" as const, price: 12.50 },
  { id: "6", sku: "ELT-015", name: "Microcontrolador ATmega328", category: "Eletrônicos", totalQty: 25, location: "A1-S6", status: "ok" as const, price: 18.90 },
  { id: "7", sku: "QUI-023", name: "Solvente Limpeza", category: "Químicos", totalQty: 34, location: "A5-S3", status: "ok" as const, price: 8.75 },
  { id: "8", sku: "ALI-008", name: "Lubrificante Food Grade", category: "Insumos", totalQty: 18, location: "A2-S4", status: "low" as const, price: 32.00 },
  { id: "9", sku: "PNE-003", name: "O-ring 25mm", category: "Vedação", totalQty: 8, location: "A6-S2", status: "low" as const, price: 0.55 },
  { id: "10", sku: "ELT-022", name: "Display LCD 16x2", category: "Eletrônicos", totalQty: 45, location: "A1-S8", status: "ok" as const, price: 22.30 },
  { id: "11", sku: "MEC-055", name: "Rolamento 6205ZZ", category: "Mecânica", totalQty: 67, location: "A2-S6", status: "ok" as const, price: 15.40 },
  { id: "12", sku: "HID-012", name: "Mangueira Hidráulica 1/4", category: "Hidráulica", totalQty: 22, location: "A3-S5", status: "ok" as const, price: 28.60 },
];

type FilterChip = "all" | "low" | "critical" | "no-movement";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "low" && item.status === "low") ||
      (activeFilter === "critical" && item.status === "critical");

    return matchesSearch && matchesFilter;
  });

  const statusBadge = (status: "ok" | "low" | "critical") => {
    switch (status) {
      case "ok":
        return <TechBadge variant="green">OK</TechBadge>;
      case "low":
        return <TechBadge variant="yellow">LOW</TechBadge>;
      case "critical":
        return <TechBadge variant="red">CRITICAL</TechBadge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Inventory
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {filteredItems.length} items · Manage stock levels and locations
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by SKU, name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted/60 focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2">
          {[
            { key: "all" as FilterChip, label: "All" },
            { key: "low" as FilterChip, label: "Low Stock" },
            { key: "critical" as FilterChip, label: "Critical" },
          ].map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                activeFilter === chip.key
                  ? "bg-brand-dim text-brand border border-brand/30"
                  : "bg-bg-surface text-text-secondary border border-border-default hover:border-[#444] hover:text-text-primary"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <Button variant="secondary" size="sm">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      {/* Data Table */}
      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Total Qty</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className="font-mono text-xs text-brand">{item.sku}</span>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <span className="text-xs text-text-muted">{item.category}</span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {item.totalQty}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-text-secondary">
                    {item.location}
                  </span>
                </TableCell>
                <TableCell>{statusBadge(item.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Adjust"
                      onClick={() => setAdjustModalOpen(true)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" title="Move">
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" title="Edit">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Package className="h-8 w-8" />
                    <p className="text-sm">No items found matching your criteria</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Adjustment Modal */}
      <Dialog
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Quick Adjustment"
        description="ELT-001 · Resistor 10kΩ — Current stock: 150 units at A1-S3"
      >
        <div className="space-y-4">
          {/* Adjustment type radio */}
          <div className="flex gap-2">
            {[
              { value: "in", label: "Entry" },
              { value: "out", label: "Exit" },
              { value: "count", label: "Count" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-[4px] border border-border-default bg-bg-surface cursor-pointer hover:border-brand/30 hover:bg-brand-dim transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand-dim"
              >
                <input
                  type="radio"
                  name="adjustType"
                  value={opt.value}
                  className="sr-only"
                />
                <span className="text-sm font-medium text-text-primary">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {/* Quantity input */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Quantity
            </label>
            <input
              type="number"
              defaultValue={1}
              min={1}
              className="w-full h-14 rounded-[4px] border border-border-default bg-bg-surface px-4 text-2xl font-mono text-text-primary text-center focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none"
            />
          </div>

          {/* Notes (required for exit) */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Notes <span className="text-brand-danger">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Reason for adjustment..."
              className="w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setAdjustModalOpen(false)}>
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}

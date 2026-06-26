"use client";

import { useState } from "react";
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
import { Plus, Edit3, Trash2, MapPin } from "lucide-react";

const initialLocations = [
  { id: "1", name: "Ala A - Estante 1", aisle: "A", shelf: "1", description: "Componentes eletrônicos", items: 45 },
  { id: "2", name: "Ala A - Estante 2", aisle: "A", shelf: "2", description: "Peças mecânicas pequenas", items: 32 },
  { id: "3", name: "Ala B - Estante 1", aisle: "B", shelf: "1", description: "Ferramentas manuais", items: 28 },
  { id: "4", name: "Ala C - Estante 3", aisle: "C", shelf: "3", description: "Produtos químicos", items: 15 },
  { id: "5", name: "Galpão 2 - Palete 4", aisle: "G2", shelf: "4", description: "Peças grandes", items: 8 },
];

export default function LocationsPage() {
  const [locations] = useState(initialLocations);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Locations
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {locations.length} locations · Manage storage areas
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Aisle</TableHead>
              <TableHead>Shelf</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-medium">{loc.name}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-brand">{loc.aisle}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-text-secondary">{loc.shelf}</span>
                </TableCell>
                <TableCell className="text-text-muted text-sm">
                  {loc.description}
                </TableCell>
                <TableCell className="text-right font-mono">{loc.items}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Location"
        description="Create a new storage location"
      >
        <div className="space-y-4">
          <Input label="Name" placeholder="e.g., Galpão Principal - Estante A1" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Aisle" placeholder="e.g., A" />
            <Input label="Shelf" placeholder="e.g., 1" />
          </div>
          <Input label="Description" placeholder="Optional description" />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              Create Location
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}

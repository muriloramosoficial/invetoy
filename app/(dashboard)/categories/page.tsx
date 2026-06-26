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
import { Plus, Edit3, Trash2, Tags } from "lucide-react";

const initialCategories = [
  { id: "1", name: "Eletrônicos", description: "Componentes eletrônicos e semicondutores", color: "#3ECF8E", products: 156 },
  { id: "2", name: "Mecânica", description: "Peças mecânicas e ferramentas", color: "#53B1E5", products: 89 },
  { id: "3", name: "Hidráulica", description: "Componentes hidráulicos e pneumáticos", color: "#F5A623", products: 45 },
  { id: "4", name: "Químicos", description: "Produtos químicos e solventes", color: "#E5484D", products: 23 },
  { id: "5", name: "Ferramentas", description: "Ferramentas manuais e elétricas", color: "#8B5CF6", products: 67 },
  { id: "6", name: "Insumos", description: "Matéria-prima e insumos diversos", color: "#06B6D4", products: 34 },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<typeof initialCategories[0] | null>(null);

  const openCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEdit = (cat: typeof initialCategories[0]) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {categories.length} categories · Organize your products
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-text-muted text-sm">
                  {cat.description}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {cat.products}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)}>
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

      {/* Create/Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Create Category"}
        description={editingCategory ? `Editing "${editingCategory.name}"` : "Add a new product category"}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g., Eletrônicos"
            defaultValue={editingCategory?.name}
          />
          <Input
            label="Description"
            placeholder="e.g., Componentes eletrônicos e semicondutores"
            defaultValue={editingCategory?.description}
          />
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
              Color
            </label>
            <div className="flex items-center gap-2">
              {["#3ECF8E", "#53B1E5", "#F5A623", "#E5484D", "#8B5CF6", "#06B6D4", "#F472B6", "#A1A1AA"].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/50 transition-colors"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}

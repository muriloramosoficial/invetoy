import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório").max(50),
  name: z.string().min(1, "Nome é obrigatório").max(200),
  description: z.string().max(500).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  min_stock: z.number().int().min(0).default(0),
  unit: z.enum(["un", "kg", "g", "l", "ml", "cx", "pc"]).default("un"),
  price: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

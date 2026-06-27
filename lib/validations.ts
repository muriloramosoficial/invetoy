import { z } from "zod";

// ─── Auth ───

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email muito longo")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(128, "Senha muito longa"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo")
    .transform((v) => v.trim()),
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email muito longo")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(128, "Senha muito longa"),
  companyName: z
    .string()
    .min(2, "Nome da empresa deve ter no mínimo 2 caracteres")
    .max(200, "Nome da empresa muito longo")
    .transform((v) => v.trim()),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve ter 11 dígitos")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v && v !== "" ? v : null)),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v && v !== "" ? v : null)),
});

// ─── V1 API Products ───

export const createProductSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório").max(100).transform((v) => v.trim()),
  name: z.string().min(1, "Nome é obrigatório").max(200).transform((v) => v.trim()),
  description: z.string().max(1000).optional().nullable().default(null),
  category_id: z.string().uuid("Categoria inválida").optional().nullable().default(null),
  min_stock: z.number().int().min(0).optional().nullable().default(0),
  unit: z.string().max(20).optional().nullable().default("un"),
  price: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
});

export const updateProductSchema = z.object({
  sku: z.string().min(1).max(100).transform((v) => v.trim()).optional(),
  name: z.string().min(1).max(200).transform((v) => v.trim()).optional(),
  description: z.string().max(1000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  min_stock: z.number().int().min(0).optional().nullable(),
  unit: z.string().max(20).optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  is_active: z.boolean().optional(),
});

// ─── V1 API Movements ───

const movementTypes = ["in", "out", "transfer", "adjustment", "count"] as const;

export const createMovementSchema = z.object({
  product_id: z.string().uuid("ID do produto inválido"),
  type: z.enum(movementTypes, { message: "Tipo inválido. Use: in, out, transfer, adjustment, count" }),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  location_id: z.string().uuid("ID do local inválido"),
  to_location_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
});

// ─── API Keys ───

export const createApiKeySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100).transform((v) => v.trim()),
  permissions: z.array(z.enum(["read", "write", "admin"])).optional().default(["read"]),
});

export const revokeApiKeySchema = z.object({
  keyId: z.string().uuid("ID da chave inválido"),
});

// ─── Webhook (Asaas) ───

export const asaasWebhookSchema = z.object({
  event: z.string().min(1),
  payment: z
    .object({
      id: z.string(),
      subscription: z.string().optional(),
      customer: z.string(),
      value: z.number(),
      netValue: z.number(),
      status: z.string(),
      dueDate: z.string(),
      billingType: z.string(),
      invoiceUrl: z.string().optional(),
    })
    .optional(),
  subscription: z
    .object({
      id: z.string(),
      customer: z.string(),
      status: z.string().optional(),
      plan: z.string().optional(),
    })
    .optional(),
});

// ─── Admin Plans ───

export const updatePlanSchema = z.object({
  id: z.string().uuid("ID do plano inválido"),
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional(),
  price: z.number().min(0).optional(),
  max_products: z.number().int().min(0).optional(),
  max_users: z.number().int().min(0).optional(),
  max_locations: z.number().int().min(0).optional(),
  features: z.record(z.string(), z.boolean()).optional(),
  sort_order: z.number().int().optional(),
  highlighted: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// ─── Admin API Keys (staff) ───

export const createStaffApiKeySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100).transform((v) => v.trim()),
  permissions: z.array(z.enum(["read", "write", "admin"])).optional().default(["read"]),
});

// ─── Common query params ───

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(50),
});

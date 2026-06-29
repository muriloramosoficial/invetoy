import type { Category } from "./category.types";

export interface Product {
  id: string;
  tenant_id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string | null;
  category?: Category;
  min_stock: number;
  unit: "un" | "kg" | "g" | "l" | "ml" | "cx" | "pc";
  price: number | null;
  cost: number | null;
  image_url: string | null;
  is_active: boolean;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  asset_tag: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  acquisition_date: string | null;
  warranty_expiry: string | null;
  responsible_user: string | null;
  condition: "excelente" | "bom" | "regular" | "ruim" | "danificado" | null;
  current_location_id?: string | null;
  current_location_name?: string | null;
}

export type Unit = "un" | "kg" | "g" | "l" | "ml" | "cx" | "pc";
export type Condition = "excelente" | "bom" | "regular" | "ruim" | "danificado";

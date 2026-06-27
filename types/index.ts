// ─── Tenant & Auth ───

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  payment_provider: "asaas" | null;
  payment_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | null;
  plan: "free" | "starter" | "pro" | "enterprise";
  locale: "pt-BR";
  cnpj: string | null;
  asaas_api_key_sandbox: string | null;
  asaas_api_key_production: string | null;
  asaas_env: "sandbox" | "production";
  asaas_webhook_url_sandbox: string | null;
  asaas_webhook_url_production: string | null;
  asaas_webhook_secret_sandbox: string | null;
  asaas_webhook_secret_production: string | null;
}

export interface Profile {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: "admin" | "manager" | "operator";
  created_at: string;
  cpf: string | null;
  is_system_admin?: boolean;
  is_staff?: boolean;
}

// ─── Inventory Core ───

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  archived_at?: string | null;
}

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  aisle: string | null;
  shelf: string | null;
  description: string | null;
  created_at: string;
  archived_at?: string | null;
}

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
  // Patrimonio
  asset_tag: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  acquisition_date: string | null;
  warranty_expiry: string | null;
  responsible_user: string | null;
  condition: "excelente" | "bom" | "regular" | "ruim" | "danificado" | null;
  // Virtual (from v_assets view)
  current_location_id?: string | null;
  current_location_name?: string | null;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  product?: Product;
  location_id: string;
  location?: Location;
  quantity: number;
  batch: string | null;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
}

export type MovementType = "in" | "out" | "transfer" | "adjustment" | "count";

export interface Movement {
  id: string;
  tenant_id: string;
  product_id: string;
  product?: Product;
  from_location_id: string | null;
  from_location?: Location | null;
  to_location_id: string | null;
  to_location?: Location | null;
  quantity: number;
  type: MovementType;
  reference: string | null;
  notes: string | null;
  user_id: string;
  user?: Profile;
  created_at: string;
}

// ─── Dashboard / Analytics ───

export interface DashboardMetrics {
  total_items: number;
  total_products: number;
  total_value: number;
  low_stock_count: number;
  expiring_count: number;
  movements_today: number;
}

export interface ChartDataPoint {
  date: string;
  entries: number;
  exits: number;
}

export interface LowStockAlert {
  product_id: string;
  sku: string;
  name: string;
  current_quantity: number;
  min_stock: number;
  location: string;
}

// ─── Pagination ───

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ─── Payment ───

export interface PaymentMethod {
  id: string;
  type: "credit_card" | "boleto" | "pix";
  last_digits: string | null;
  holder_name: string | null;
  is_default: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  features: string[];
  limits: {
    products: number;
    users: number;
    locations: number;
  };
}

// ─── Form Types ───

export interface AdjustmentForm {
  product_id: string;
  type: "in" | "out" | "count";
  quantity: number;
  location_id: string;
  notes?: string;
  batch?: string;
  expiration_date?: string;
}

export interface TransferForm {
  product_id: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  notes?: string;
}

// ─── i18n ───

export type SupportedLocale = "pt-BR";

export interface Locale {
  code: SupportedLocale;
  name: string;
  flag: string;
}


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

export type Role = "admin" | "manager" | "operator";

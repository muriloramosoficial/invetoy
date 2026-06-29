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

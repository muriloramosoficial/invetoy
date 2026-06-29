export interface AdminMetrics {
  totalTenants: number;
  activeSubscriptions: number;
  totalUsers: number;
  totalProducts: number;
  revenue: number;
}

export interface AdminActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

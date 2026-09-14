export type User = {
  id: string;
  username?: string | null;
  email: string;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  status?: string | null;
  department?: string | null;
  createdAt?: string;
  lastLoginAt?: string | null;
};

export type Dashboard = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalStaff: number;
  departments: number;
  todaysActivity: number;
  pendingItems: number;
  systemStatus: string;
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    user?: string;
    ipAddress?: string;
    createdAt: string;
  }>;
};

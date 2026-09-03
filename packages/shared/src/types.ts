export type ConfigStatus = 'active' | 'warning' | 'danger' | 'error' | 'untested';

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface SupabaseConfigDTO {
  id: string;
  userId: string;
  accountEmail: string;
  databaseName: string;
  supabaseUrl: string;
  websiteUrl?: string | null;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  databasePassword?: string | null;
  poolerUrl?: string | null;
  envDataFrontend?: Record<string, string> | null;
  envDataBackend?: Record<string, string> | null;
  githubRepoLinks?: string[] | null;
  status: ConfigStatus;
  isTableGenerated: boolean;
  lastInteraction: string | null;
  lastPingStatus: 'success' | 'failed' | null;
  createdAt: string;
  updatedAt: string;
}

export interface KeepAliveDataRow {
  id: number;
  pingMessage: string;
  createdBy: string;
  createdAt: string;
}

export interface ActivityLogDTO {
  id: string;
  userId: string;
  configId: string | null;
  accountName?: string;
  databaseName?: string;
  action: 'insert' | 'delete' | 'generate_table' | 'health_check' | 'bulk_delete' | 'auto_ping' | string;
  status: 'success' | 'failed' | string;
  message: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

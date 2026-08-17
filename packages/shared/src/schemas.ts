import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createConfigSchema = z.object({
  accountEmail: z.string().email('Invalid Supabase account email'),
  databaseName: z.string().min(1, 'Database name is required').max(100),
  supabaseUrl: z
    .string()
    .url('Must be a valid URL')
    .regex(/^https:\/\/[a-z0-9-]+\.supabase\.co$/, 'Must be a valid Supabase URL (e.g. https://xxx.supabase.co)'),
  websiteUrl: z
    .string()
    .url('Must be a valid URL (e.g. https://mywebsite.com)')
    .or(z.literal(''))
    .optional(),
  supabaseAnonKey: z
    .string()
    .min(1, 'Anon Key is required'),
  supabaseServiceRoleKey: z
    .string()
    .min(1, 'Service Role Key is required'),
  poolerUrl: z
    .string()
    .regex(/^postgresql:\/\/.*@aws.*$/, "Must be a valid Supabase Connection Pooler URL (e.g. postgresql://...@aws...)")
    .or(z.literal(''))
    .optional(),
  githubRepoLinks: z
    .array(z.string().url('Must be a valid URL'))
    .max(2, 'Maximum 2 repository links allowed')
    .optional(),
  envDataFrontend: z.record(z.string()).optional(),
  envDataBackend: z.record(z.string()).optional(),
});

export const updateConfigSchema = createConfigSchema.partial();

export const pingSchema = z.object({
  pingMessage: z.string().max(500).optional(),
});

export const bulkDeleteSchema = z.object({
  rowIds: z.array(z.number().int().positive()).min(1, 'At least one row ID required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateConfigInput = z.infer<typeof createConfigSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type PingInput = z.infer<typeof pingSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

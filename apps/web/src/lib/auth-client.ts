import { createAuthClient } from "better-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/auth`,
});

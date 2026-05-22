// src/services/telemetry.ts
import { initDynamicSupabase } from '../lib/supabase';

export interface SafeResult<T> {
  data: T | null;
  error: Error | null;
}

export const telemetryService = {
  async getAllAssets() {
    const client = initDynamicSupabase();
    if (!client) throw new Error("No Supabase client");

    const { data, error } = await client
      .from("properties_db")
      .select("*")
      .order("title");

    return { data, error };
  },

  async getVisitors() {
    const client = initDynamicSupabase();
    const { data, error } = await client
      .from("visitors_db")
      .select("*")
      .order("last_active_at", { ascending: false });
    return { data, error };
  },

  // Add more as we go...
};
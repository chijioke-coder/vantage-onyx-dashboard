// src/services/telemetry.ts
import { createClient } from '@supabase/supabase-js';

export interface SafeResult<T> {
  data: T | null;
  error: any;
}

let supabaseClient: any = null;

export const initDynamicSupabase = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Supabase env vars missing");
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
};

export const telemetryService = {
  async getAllAssets() {
    const client = initDynamicSupabase();
    if (!client) throw new Error("Supabase not configured");
    
    const { data, error } = await client
      .from("properties_db")
      .select("*")
      .order("title", { ascending: true });
    
    return { data, error };
  },

  async getVisitors() {
    const client = initDynamicSupabase();
    if (!client) throw new Error("Supabase not configured");
    
    const { data, error } = await client
      .from("visitors_db")
      .select("*")
      .order("last_active_at", { ascending: false });
    
    return { data, error };
  }
};
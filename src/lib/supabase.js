import { createClient } from "@supabase/supabase-js";

const ENCRYPTION_SALT_HEX = "VANTAGE_ONYX_SIGMA_99X_SECURITY_NODE";

const obfuscateString = (plainText) => {
  if (!plainText) return "";
  try { return btoa(unescape(encodeURIComponent(plainText + ENCRYPTION_SALT_HEX))); } 
  catch (e) { return ""; }
};

const restoreString = (cipherText) => {
  if (!cipherText) return "";
  try {
    const decoded = decodeURIComponent(escape(atob(cipherText)));
    return decoded.replace(ENCRYPTION_SALT_HEX, "");
  } catch (e) { return ""; }
};

/**
 * Hybrid Core Config Reader: Checks Vite environment variables first, 
 * then checks browser local storage for non-technical buyers.
 * NOTE: Vite uses import.meta.env exclusively - process.env is NOT available in browser
 */
export const getDatabaseConfig = () => {
  // 1. Try gathering from Vite environment context (import.meta.env.VITE_*)
  const envUrl = import.meta.env?.VITE_SUPABASE_URL || "";
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, isHardcoded: true };
  }

  // 2. Fallback to encrypted browser sandbox storage if no cloud variables exist
  const secureUrl = localStorage.getItem("vox_cluster_target_url");
  const secureKey = localStorage.getItem("vox_cluster_anon_token");
  
  return {
    url: restoreString(secureUrl),
    key: restoreString(secureKey),
    isHardcoded: false
  };
};

export const saveDatabaseConfig = (url, key) => {
  localStorage.setItem("vox_cluster_target_url", obfuscateString(url));
  localStorage.setItem("vox_cluster_anon_token", obfuscateString(key));
};

export const disconnectDatabase = () => {
  localStorage.removeItem("vox_cluster_target_url");
  localStorage.removeItem("vox_cluster_anon_token");
};

export const initDynamicSupabase = () => {
  const { url, key } = getDatabaseConfig();
  if (!url || !key) return null;
  
  try {
    return createClient(url, key, {
      auth: { persistSession: false }
    });
  } catch (error) {
    console.error("Matrix Bridge Connection Exception:", error);
    return null;
  }
};

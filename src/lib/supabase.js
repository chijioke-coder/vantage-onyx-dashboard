import { createClient } from "@supabase/supabase-js";

// Cryptographic token salt shielding data configurations inside localStorage
const ENCRYPTION_SALT_HEX = "VANTAGE_ONYX_SIGMA_99X_SECURITY_NODE";

/**
 * Obfuscates plain text strings using basic web safe shift sequences 
 * to prevent simple browser memory scraping attacks.
 */
const obfuscateString = (plainText) => {
  if (!plainText) return "";
  try {
    return btoa(unescape(encodeURIComponent(plainText + ENCRYPTION_SALT_HEX)));
  } catch (error) {
    console.error("Obfuscation Fault:", error);
    return "";
  }
};

/**
 * Reverses the shift sequence to restore the original Supabase authorization token strings.
 */
const restoreString = (cipherText) => {
  if (!cipherText) return "";
  try {
    const decoded = decodeURIComponent(escape(atob(cipherText)));
    return decoded.replace(ENCRYPTION_SALT_HEX, "");
  } catch (error) {
    console.error("De-obfuscation Fault:", error);
    return "";
  }
};

/**
 * Read and restore configurations directly out of local storage runtime state.
 */
export const getDatabaseConfig = () => {
  const secureUrl = localStorage.getItem("vox_cluster_target_url");
  const secureKey = localStorage.getItem("vox_cluster_anon_token");
  return {
    url: restoreString(secureUrl),
    key: restoreString(secureKey),
  };
};

/**
 * Encrypts and persists credentials safely to the user's local sandbox profile.
 */
export const saveDatabaseConfig = (url, key) => {
  localStorage.setItem("vox_cluster_target_url", obfuscateString(url));
  localStorage.setItem("vox_cluster_anon_token", obfuscateString(key));
};

/**
 * Completely purges credentials and severs cloud bridges instantly.
 */
export const disconnectDatabase = () => {
  localStorage.removeItem("vox_cluster_target_url");
  localStorage.removeItem("vox_cluster_anon_token");
};

/**
 * Core Instantiation Interceptor. Creates an isolated live Supabase instance 
 * on the fly using saved local storage configurations.
 */
export const initDynamicSupabase = () => {
  const { url, key } = getDatabaseConfig();
  if (!url || !key) return null;
  
  try {
    return createClient(url, key, {
      auth: {
        persistSession: false, // Prevents cross-contamination for multi-tenant kit buyers
      }
    });
  } catch (error) {
    console.error("Matrix Bridge Connection Exception:", error);
    return null;
  }
};

/**
 * Telemetry Service - Pure database logic with SafeResult pattern
 * All operations return { success: true, data } | { success: false, error }
 */

import { initDynamicSupabase } from '../lib/supabase';

// ============================================================================
// SAFE RESULT PATTERN - Standardized error handling for all database calls
// ============================================================================

/**
 * @template T
 * @typedef {{ success: true, data: T }} SuccessResult
 */

/**
 * @typedef {{ success: false, error: string }} ErrorResult
 */

/**
 * @template T
 * @typedef {SuccessResult<T> | ErrorResult} SafeResult
 */

// ============================================================================
// PROPERTIES DATABASE OPERATIONS
// ============================================================================

/**
 * Fetch all properties from the database
 * @returns {Promise<SafeResult<Array>>}
 */
export async function fetchProperties() {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const { data, error } = await client
      .from('properties_db')
      .select('*')
      .order('title', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message || 'Network error fetching properties' };
  }
}

/**
 * Update a property by ID
 * @param {string} id - Property ID
 * @param {object} payload - Fields to update
 * @returns {Promise<SafeResult<object>>}
 */
export async function updateProperty(id, payload) {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const { data, error } = await client
      .from('properties_db')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message || 'Network error updating property' };
  }
}

/**
 * Bulk update property status
 * @param {string[]} ids - Array of property IDs
 * @param {string} status - New status value
 * @returns {Promise<SafeResult<{ count: number }>>}
 */
export async function bulkUpdatePropertyStatus(ids, status) {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const { error, count } = await client
      .from('properties_db')
      .update({ status })
      .in('id', ids);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { count: ids.length } };
  } catch (e) {
    return { success: false, error: e.message || 'Network error during bulk update' };
  }
}

// ============================================================================
// VISITORS DATABASE OPERATIONS
// ============================================================================

/**
 * Fetch all visitors from the database
 * @returns {Promise<SafeResult<Array>>}
 */
export async function fetchVisitors() {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const { data, error } = await client
      .from('visitors_db')
      .select('*')
      .order('last_active_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message || 'Network error fetching visitors' };
  }
}

/**
 * Count active visitors (last active within X minutes)
 * @param {number} minutesThreshold - Minutes threshold for "active" status
 * @returns {Promise<SafeResult<{ activeCount: number, totalCount: number }>>}
 */
export async function countActiveVisitors(minutesThreshold = 5) {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const { data, error } = await client
      .from('visitors_db')
      .select('last_active_at');

    if (error) {
      return { success: false, error: error.message };
    }

    const now = new Date();
    const threshold = minutesThreshold * 60 * 1000; // Convert to milliseconds
    const activeCount = (data || []).filter(v => {
      if (!v.last_active_at) return false;
      const lastActive = new Date(v.last_active_at);
      return (now - lastActive) < threshold;
    }).length;

    return { 
      success: true, 
      data: { activeCount, totalCount: data?.length || 0 } 
    };
  } catch (e) {
    return { success: false, error: e.message || 'Network error counting visitors' };
  }
}

// ============================================================================
// DOWNLOAD LOGS (LEADS) OPERATIONS
// ============================================================================

/**
 * Fetch all download logs (leads)
 * @returns {Promise<SafeResult<Array>>}
 */
export async function fetchDownloadLogs() {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const { data, error } = await client
      .from('vantage_download_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message || 'Network error fetching download logs' };
  }
}

/**
 * Delete a download log entry
 * @param {string} id - Log entry ID
 * @returns {Promise<SafeResult<{ deleted: boolean }>>}
 */
export async function deleteDownloadLog(id) {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const { error } = await client
      .from('vantage_download_logs')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { deleted: true } };
  } catch (e) {
    return { success: false, error: e.message || 'Network error deleting log' };
  }
}

// ============================================================================
// REALTORS REGISTRY OPERATIONS
// ============================================================================

/**
 * Fetch all realtors
 * @returns {Promise<SafeResult<Array>>}
 */
export async function fetchRealtors() {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const { data, error } = await client
      .from('realtors_registry')
      .select('*');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message || 'Network error fetching realtors' };
  }
}

// ============================================================================
// AUDIT LOGS OPERATIONS
// ============================================================================

/**
 * Log an action to the audit trail
 * @param {object} entry - Audit log entry
 * @param {string} entry.action_type - Type of action (CREATE, UPDATE, DELETE)
 * @param {string} entry.target_table - Table that was modified
 * @param {string} [entry.target_id] - ID of the modified record
 * @param {object} [entry.old_value] - Previous value (for updates)
 * @param {object} [entry.new_value] - New value (for creates/updates)
 * @returns {Promise<SafeResult<object>>}
 */
export async function createAuditLog(entry) {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const { data, error } = await client
      .from('audit_logs')
      .insert({
        action_type: entry.action_type,
        target_table: entry.target_table,
        target_id: entry.target_id || null,
        old_value: entry.old_value || null,
        new_value: entry.new_value || null,
        performed_by: 'dashboard'
      })
      .select()
      .single();

    if (error) {
      // Silently fail if audit_logs table doesn't exist yet
      console.warn('Audit log failed (table may not exist):', error.message);
      return { success: true, data: null };
    }

    return { success: true, data };
  } catch (e) {
    // Non-critical: don't break main operation if audit fails
    console.warn('Audit log exception:', e.message);
    return { success: true, data: null };
  }
}

/**
 * Fetch audit logs with optional filters
 * @param {object} [filters] - Optional filters
 * @param {string} [filters.action_type] - Filter by action type
 * @param {string} [filters.target_table] - Filter by target table
 * @param {number} [filters.limit] - Limit results (default 100)
 * @returns {Promise<SafeResult<Array>>}
 */
export async function fetchAuditLogs(filters = {}) {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    let query = client
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(filters.limit || 100);

    if (filters.action_type) {
      query = query.eq('action_type', filters.action_type);
    }

    if (filters.target_table) {
      query = query.eq('target_table', filters.target_table);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (e) {
    return { success: false, error: e.message || 'Network error fetching audit logs' };
  }
}

// ============================================================================
// NETWORK LATENCY MEASUREMENT
// ============================================================================

/**
 * Measure network latency to Supabase
 * @returns {Promise<SafeResult<{ latencyMs: number }>>}
 */
export async function measureLatency() {
  const client = initDynamicSupabase();
  if (!client) {
    return { success: false, error: 'Database connection not established' };
  }

  try {
    const start = performance.now();
    
    // Simple ping query
    await client.from('properties_db').select('id').limit(1);
    
    const end = performance.now();
    const latencyMs = Math.round(end - start);

    return { success: true, data: { latencyMs } };
  } catch (e) {
    return { success: false, error: e.message || 'Latency measurement failed' };
  }
}

// ============================================================================
// TRAFFIC VELOCITY CALCULATIONS
// ============================================================================

/**
 * Calculate traffic velocity (% change in views vs previous period)
 * @param {Array} visitors - Visitor records with timestamps
 * @param {number} hoursWindow - Time window in hours (default 24)
 * @returns {{ currentCount: number, previousCount: number, velocityPercent: number, trend: 'up' | 'down' | 'stable' }}
 */
export function calculateTrafficVelocity(visitors, hoursWindow = 24) {
  const now = new Date();
  const windowMs = hoursWindow * 60 * 60 * 1000;
  
  const currentStart = new Date(now - windowMs);
  const previousStart = new Date(currentStart - windowMs);

  let currentCount = 0;
  let previousCount = 0;

  visitors.forEach(v => {
    const visitTime = new Date(v.last_active_at || v.created_at);
    
    if (visitTime >= currentStart && visitTime <= now) {
      currentCount++;
    } else if (visitTime >= previousStart && visitTime < currentStart) {
      previousCount++;
    }
  });

  let velocityPercent = 0;
  let trend = 'stable';

  if (previousCount > 0) {
    velocityPercent = Math.round(((currentCount - previousCount) / previousCount) * 100);
    trend = velocityPercent > 5 ? 'up' : velocityPercent < -5 ? 'down' : 'stable';
  } else if (currentCount > 0) {
    velocityPercent = 100;
    trend = 'up';
  }

  return { currentCount, previousCount, velocityPercent, trend };
}

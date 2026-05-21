/**
 * TanStack Query Hooks - High-frequency data fetching with caching
 * Replaces useState + useEffect patterns with proper SWR
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  fetchProperties,
  fetchVisitors,
  fetchDownloadLogs,
  fetchRealtors,
  fetchAuditLogs,
  updateProperty,
  bulkUpdatePropertyStatus,
  deleteDownloadLog,
  createAuditLog
} from '../services/telemetry';
import { initDynamicSupabase } from '../lib/supabase';

// ============================================================================
// QUERY KEYS - Centralized for cache invalidation
// ============================================================================

export const queryKeys = {
  properties: ['properties'],
  visitors: ['visitors'],
  downloadLogs: ['downloadLogs'],
  realtors: ['realtors'],
  auditLogs: ['auditLogs']
};

// ============================================================================
// PROPERTIES QUERIES
// ============================================================================

/**
 * Hook to fetch all properties with automatic caching and background refresh
 */
export function useProperties(enabled = true) {
  return useQuery({
    queryKey: queryKeys.properties,
    queryFn: async () => {
      const result = await fetchProperties();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled,
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true
  });
}

/**
 * Hook to update a property with optimistic updates
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload, oldValue }) => {
      const result = await updateProperty(id, payload);
      if (!result.success) throw new Error(result.error);
      
      // Create audit log
      await createAuditLog({
        action_type: 'UPDATE',
        target_table: 'properties_db',
        target_id: id,
        old_value: oldValue,
        new_value: payload
      });
      
      return result.data;
    },
    onMutate: async ({ id, payload }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.properties });

      // Snapshot the previous value
      const previousProperties = queryClient.getQueryData(queryKeys.properties);

      // Optimistically update
      queryClient.setQueryData(queryKeys.properties, (old) =>
        old?.map((p) => (p.id === id ? { ...p, ...payload } : p))
      );

      return { previousProperties };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProperties) {
        queryClient.setQueryData(queryKeys.properties, context.previousProperties);
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs });
    }
  });
}

/**
 * Hook for bulk status updates
 */
export function useBulkUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }) => {
      const result = await bulkUpdatePropertyStatus(ids, status);
      if (!result.success) throw new Error(result.error);
      
      // Create audit log for bulk action
      await createAuditLog({
        action_type: 'BULK_UPDATE',
        target_table: 'properties_db',
        old_value: { ids },
        new_value: { status, count: ids.length }
      });
      
      return result.data;
    },
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.properties });
      const previousProperties = queryClient.getQueryData(queryKeys.properties);
      
      queryClient.setQueryData(queryKeys.properties, (old) =>
        old?.map((p) => (ids.includes(p.id) ? { ...p, status } : p))
      );

      return { previousProperties };
    },
    onError: (err, variables, context) => {
      if (context?.previousProperties) {
        queryClient.setQueryData(queryKeys.properties, context.previousProperties);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs });
    }
  });
}

// ============================================================================
// VISITORS QUERIES
// ============================================================================

/**
 * Hook to fetch visitors with high-frequency refresh
 */
export function useVisitors(enabled = true) {
  return useQuery({
    queryKey: queryKeys.visitors,
    queryFn: async () => {
      const result = await fetchVisitors();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled,
    staleTime: 10000, // Visitors data goes stale faster
    refetchInterval: 30000 // Refetch every 30 seconds
  });
}

// ============================================================================
// DOWNLOAD LOGS (LEADS) QUERIES
// ============================================================================

/**
 * Hook to fetch download logs
 */
export function useDownloadLogs(enabled = true) {
  return useQuery({
    queryKey: queryKeys.downloadLogs,
    queryFn: async () => {
      const result = await fetchDownloadLogs();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled,
    staleTime: 30000,
    refetchInterval: 60000
  });
}

/**
 * Hook to delete a download log
 */
export function useDeleteDownloadLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const result = await deleteDownloadLog(id);
      if (!result.success) throw new Error(result.error);
      
      await createAuditLog({
        action_type: 'DELETE',
        target_table: 'vantage_download_logs',
        target_id: id
      });
      
      return result.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.downloadLogs });
      const previousLogs = queryClient.getQueryData(queryKeys.downloadLogs);
      
      queryClient.setQueryData(queryKeys.downloadLogs, (old) =>
        old?.filter((log) => log.id !== id)
      );

      return { previousLogs };
    },
    onError: (err, id, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(queryKeys.downloadLogs, context.previousLogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.downloadLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs });
    }
  });
}

// ============================================================================
// REALTORS QUERIES
// ============================================================================

/**
 * Hook to fetch realtors
 */
export function useRealtors(enabled = true) {
  return useQuery({
    queryKey: queryKeys.realtors,
    queryFn: async () => {
      const result = await fetchRealtors();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled,
    staleTime: 60000
  });
}

// ============================================================================
// AUDIT LOGS QUERIES
// ============================================================================

/**
 * Hook to fetch audit logs
 */
export function useAuditLogs(filters = {}, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.auditLogs, filters],
    queryFn: async () => {
      const result = await fetchAuditLogs(filters);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled,
    staleTime: 30000
  });
}

// ============================================================================
// SUPABASE REALTIME HOOK
// ============================================================================

/**
 * Hook to subscribe to Supabase Realtime changes on visitors_db
 * Updates the "Cluster Online" indicator in real-time
 */
export function useVisitorsRealtime(enabled = true) {
  const queryClient = useQueryClient();
  const channelRef = useRef(null);
  const [activeCount, setActiveCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Calculate active visitors (within last 5 minutes)
  const calculateActiveVisitors = useCallback((visitors) => {
    if (!visitors || !Array.isArray(visitors)) return 0;
    
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
    
    return visitors.filter(v => {
      if (!v.last_active_at) return false;
      const lastActive = new Date(v.last_active_at);
      return lastActive >= fiveMinutesAgo;
    }).length;
  }, []);

  // Update count when visitors data changes
  useEffect(() => {
    const visitors = queryClient.getQueryData(queryKeys.visitors);
    if (visitors) {
      setActiveCount(calculateActiveVisitors(visitors));
    }
  }, [queryClient, calculateActiveVisitors]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!enabled) return;

    const client = initDynamicSupabase();
    if (!client) return;

    // Subscribe to visitors_db changes
    const channel = client
      .channel('visitors_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitors_db'
        },
        (payload) => {
          // Invalidate and refetch visitors query
          queryClient.invalidateQueries({ queryKey: queryKeys.visitors });
          setLastUpdate(new Date());
          
          // Update active count optimistically
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const visitors = queryClient.getQueryData(queryKeys.visitors) || [];
            let updatedVisitors;
            
            if (payload.eventType === 'INSERT') {
              updatedVisitors = [payload.new, ...visitors];
            } else {
              updatedVisitors = visitors.map(v => 
                v.visitor_id === payload.new.visitor_id ? payload.new : v
              );
            }
            
            setActiveCount(calculateActiveVisitors(updatedVisitors));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        client.removeChannel(channelRef.current);
      }
    };
  }, [enabled, queryClient, calculateActiveVisitors]);

  return { activeCount, lastUpdate };
}

// ============================================================================
// SYNC ALL DATA HOOK
// ============================================================================

/**
 * Hook to force sync all data
 */
export function useSyncAllData() {
  const queryClient = useQueryClient();

  const syncAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.properties });
    queryClient.invalidateQueries({ queryKey: queryKeys.visitors });
    queryClient.invalidateQueries({ queryKey: queryKeys.downloadLogs });
    queryClient.invalidateQueries({ queryKey: queryKeys.realtors });
    queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs });
  }, [queryClient]);

  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  return { syncAll, clearCache };
}

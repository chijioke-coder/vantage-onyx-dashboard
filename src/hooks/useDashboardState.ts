// src/hooks/useDashboardState.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { telemetryService } from '../services/telemetry';

export function useDashboardData() {
  const queryClient = useQueryClient();

  const assetsQuery = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await telemetryService.getAllAssets();
      if (res.error) throw res.error;
      return res.data || [];
    },
    refetchInterval: 10000, // High-frequency
  });

  const visitorsQuery = useQuery({
    queryKey: ['visitors'],
    queryFn: async () => {
      const res = await telemetryService.getVisitors();
      if (res.error) throw res.error;
      return res.data || [];
    },
    refetchInterval: 5000,
  });

  return {
    assets: assetsQuery.data || [],
    visitors: visitorsQuery.data || [],
    isLoading: assetsQuery.isLoading || visitorsQuery.isLoading,
    refetchAll: () => queryClient.invalidateQueries(),
  };
}
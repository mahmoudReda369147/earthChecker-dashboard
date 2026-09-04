import { useQuery } from '@tanstack/react-query'
import { getOverviewStatsService } from './services'

const KEY = 'overview'

export const useOverviewStats = (params) =>
  useQuery({
    queryKey: [KEY, params],
    queryFn: () => getOverviewStatsService(params),
    select: (res) => res?.data,
    refetchInterval: 30000, // auto refresh overview stats every 30 seconds
  })

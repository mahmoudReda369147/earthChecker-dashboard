import api from '../../lib/axios'
import { OVERVIEW_ENDPOINTS } from './endpoints'

export const getOverviewStatsService = (params) =>
  api.get(OVERVIEW_ENDPOINTS.GET_STATS, { params }).then((r) => r.data)

import { useQuery } from '@tanstack/react-query'
import { getCycleStagesService, getStageFormService } from './services'

const KEY = 'stages'

export function useCycleStages(cycleId) {
  return useQuery({
    queryKey: [KEY, cycleId],
    queryFn:  () => getCycleStagesService(cycleId),
    enabled:  !!cycleId,
    select:   (d) => d?.data?.stages ?? [],
  })
}

export function useStageForm(stageId) {
  return useQuery({
    queryKey: [KEY, 'form', stageId],
    queryFn:  () => getStageFormService(stageId),
    enabled:  !!stageId,
    select:   (d) => d?.data ?? null,
  })
}

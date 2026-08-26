import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { getSubmissionsService, submitFormService, getCycleSubmissionsService } from './services'

const KEY = 'submissions'

export function useSubmissions(params) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn:  () => getSubmissionsService(params),
    placeholderData: keepPreviousData,
  })
}

export function useCycleSubmissions(cycleId) {
  return useQuery({
    queryKey: [KEY, cycleId],
    queryFn:  () => getCycleSubmissionsService(cycleId),
    enabled:  !!cycleId,
    select:   (d) => d?.data?.submissions ?? [],
  })
}

export function useSubmitForm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: submitFormService,
    onSuccess:  (_, variables) => {
      qc.invalidateQueries({ queryKey: [KEY, variables.cycleId] })
      qc.invalidateQueries({ queryKey: ['stages', variables.cycleId] })
      qc.invalidateQueries({ queryKey: ['cycles'] })
    },
  })
}

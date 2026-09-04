import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSubmissionAnalysesService,
  rateAnalysisService,
  updateAnalysisProblemTypeService,
} from './services'

export function useSubmissionAnalyses(submissionId) {
  return useQuery({
    queryKey: ['analyses', submissionId],
    queryFn:  () => getSubmissionAnalysesService(submissionId),
    enabled:  !!submissionId,
  })
}

export function useRateAnalysis(submissionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rateAnalysisService,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['analyses', submissionId] })
      qc.invalidateQueries({ queryKey: ['submissions'] })
    },
  })
}

export function useUpdateAnalysisProblemType(submissionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateAnalysisProblemTypeService,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['analyses', submissionId] })
      qc.invalidateQueries({ queryKey: ['submissions'] })
    },
  })
}

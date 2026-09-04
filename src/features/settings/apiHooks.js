import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSettingsService,
  updateSettingsService,
  rotateApiKeyService,
} from './services'

export function useSettings(options = {}) {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettingsService,
    ...options,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateSettingsService,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useRotateApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: rotateApiKeyService,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

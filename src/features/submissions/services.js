import api from '../../lib/axios'
import { SUBMISSIONS_ENDPOINTS } from './endpoints'

export const getSubmissionsService = (params) =>
  api.get(SUBMISSIONS_ENDPOINTS.LIST, { params }).then((r) => r.data)

export const submitFormService       = (body)     =>
  api.post(SUBMISSIONS_ENDPOINTS.SUBMIT, body).then((r) => r.data)

export const getCycleSubmissionsService = (cycleId) =>
  api.get(SUBMISSIONS_ENDPOINTS.BY_CYCLE(cycleId)).then((r) => r.data)

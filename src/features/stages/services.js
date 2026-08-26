import api from '../../lib/axios'
import { STAGES_ENDPOINTS } from './endpoints'

export const getCycleStagesService = (cycleId) =>
  api.get(STAGES_ENDPOINTS.BY_CYCLE(cycleId)).then((r) => r.data)

export const getStageFormService = (stageId) =>
  api.get(STAGES_ENDPOINTS.FORM(stageId)).then((r) => r.data)

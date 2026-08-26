import api from '../../lib/axios'
import { ANALYSES_ENDPOINTS } from './endpoints'

export const getSubmissionAnalysesService = (submissionId) =>
  api.get(ANALYSES_ENDPOINTS.BY_SUBMISSION(submissionId)).then((r) => r.data)

export const rateAnalysisService = ({ analysisId, action }) =>
  api.patch(ANALYSES_ENDPOINTS.RATE(analysisId), { action }).then((r) => r.data)

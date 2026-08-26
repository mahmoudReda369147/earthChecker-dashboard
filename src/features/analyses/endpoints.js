export const ANALYSES_ENDPOINTS = {
  BY_SUBMISSION: (submissionId) => `/analyses/submission/${submissionId}`,
  RATE:          (analysisId)   => `/analyses/${analysisId}/rate`,
}

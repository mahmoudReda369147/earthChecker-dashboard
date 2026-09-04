import api from '../../lib/axios'
import { SETTINGS_ENDPOINTS } from './endpoints'

export async function getSettingsService() {
  const res = await api.get(SETTINGS_ENDPOINTS.BASE)
  return res.data
}

export async function updateSettingsService(payload) {
  const res = await api.put(SETTINGS_ENDPOINTS.BASE, payload)
  return res.data
}

export async function rotateApiKeyService() {
  const res = await api.post(SETTINGS_ENDPOINTS.ROTATE_KEY)
  return res.data
}

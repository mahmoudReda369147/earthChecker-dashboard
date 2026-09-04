import api from '../../lib/axios'
import { MODULES_ENDPOINTS } from './endpoints'

/** GET /api/modules — paginated + filtered */
export const listModulesService = (params) =>
  api.get(MODULES_ENDPOINTS.LIST, { params }).then((r) => r.data)

/** POST /api/modules */
export const createModuleService = (body) =>
  api.post(MODULES_ENDPOINTS.CREATE, body).then((r) => r.data)

/** GET /api/modules/:id */
export const getModuleService = (id) =>
  api.get(MODULES_ENDPOINTS.GET(id)).then((r) => r.data)

/** PATCH /api/modules/:id */
export const updateModuleService = ({ id, data, ...rest }) =>
  api.patch(MODULES_ENDPOINTS.UPDATE(id), data || rest).then((r) => r.data)

/** DELETE /api/modules/:id  (soft delete) */
export const deleteModuleService = (id) =>
  api.delete(MODULES_ENDPOINTS.DELETE(id)).then((r) => r.data)

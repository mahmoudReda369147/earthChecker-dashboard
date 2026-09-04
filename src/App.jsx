import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

/* ── Auth feature ── */
import LoginPage          from './features/auth/pages/LoginPage'
import SignupPage         from './features/auth/pages/SignupPage'
import VerifyEmailPage    from './features/auth/pages/VerifyEmailPage'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage  from './features/auth/pages/ResetPasswordPage'

/* ── Other feature pages ── */
import OverviewPage     from './features/overview/pages/OverviewPage'
import ModulesPage      from './features/modules/pages/ModulesPage'
import UpdateModulePage from './features/modules/pages/UpdateModulePage'
import ModuleDetailPage from './features/modules/pages/ModuleDetailPage'
import FormsBuilderPage from './features/forms/pages/FormsBuilderPage'
import FormPreviewPage  from './features/forms/pages/FormPreviewPage'
import CreateFormPage   from './features/forms/pages/CreateFormPage'
import OrderFormsPage   from './features/forms/pages/OrderFormsPage'
import StaffPage        from './features/staff/pages/StaffPage'
import CreateStaffPage  from './features/staff/pages/CreateStaffPage'
import AIAgentsPage     from './features/agents/pages/AIAgentsPage'
import CreateAgentPage  from './features/agents/pages/CreateAgentPage'
import UpdateAgentPage  from './features/agents/pages/UpdateAgentPage'
import CyclesPage       from './features/cycles/pages/CyclesPage'
import CreateCyclePage  from './features/cycles/pages/CreateCyclePage'
import CycleDetailPage  from './features/cycles/pages/CycleDetailPage'
import CycleStagesPage  from './features/cycles/pages/CycleStagesPage'
import StageSubmitPage  from './features/cycles/pages/StageSubmitPage'
import SubmissionsPage  from './features/submissions/pages/SubmissionsPage'
import SubmissionAnalysesPage from './features/analyses/pages/SubmissionAnalysesPage'
import SettingsPage     from './features/settings/pages/SettingsPage'

/* ── Layout & auth guard ── */
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute  from './components/auth/ProtectedRoute'
import PublicRoute     from './components/auth/PublicRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes (redirects to dashboard if already logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login"                 element={<LoginPage />} />
          <Route path="/signup"                element={<SignupPage />} />
          <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

        {/* Standalone — no dashboard chrome */}
        <Route path="/form-preview"          element={<FormPreviewPage />} />
        <Route path="/form-preview/:formId"  element={<FormPreviewPage />} />
        <Route path="/stage-submit/:stageId" element={<StageSubmitPage />} />

        {/* Protected dashboard — requires valid session */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview"              element={<OverviewPage />} />
            <Route path="modules"                             element={<ModulesPage />} />
            <Route path="modules/:id"                        element={<ModuleDetailPage />} />
            <Route path="modules/:id/update"                 element={<UpdateModulePage />} />
            <Route path="modules/:id/forms/create"           element={<CreateFormPage />} />
            <Route path="modules/:id/forms/:formId/edit"     element={<CreateFormPage />} />
            <Route path="modules/:id/forms/order"            element={<OrderFormsPage />} />
            <Route path="forms"                              element={<FormsBuilderPage />} />
            <Route path="staff"                              element={<StaffPage />} />
            <Route path="staff/create"                    element={<CreateStaffPage />} />
            <Route path="staff/:staffId/edit"             element={<CreateStaffPage />} />
            <Route path="agents"                element={<AIAgentsPage />} />
            <Route path="agents/create"         element={<CreateAgentPage />} />
            <Route path="agents/:id/update"     element={<UpdateAgentPage />} />
            <Route path="cycles"                   element={<CyclesPage />} />
            <Route path="cycles/create"           element={<CreateCyclePage />} />
            <Route path="cycles/:cycleId"         element={<CycleDetailPage />} />
            <Route path="cycles/:cycleId/edit"    element={<CreateCyclePage />} />
            <Route path="cycles/:cycleId/stages"  element={<CycleStagesPage />} />
            <Route path="submissions"           element={<SubmissionsPage />} />
            <Route path="submissions/:submissionId/analyses" element={<SubmissionAnalysesPage />} />
            <Route path="settings"              element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

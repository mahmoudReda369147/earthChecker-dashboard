import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  Save,
  Building2,
  Bell,
  Key,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Lock,
  Globe,
  Phone,
  MapPin,
  Mail,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Modal from '../../../components/ui/Modal'
import { useMe } from '../../auth/apiHooks'
import { useSettings, useUpdateSettings, useRotateApiKey } from '../apiHooks'

function Section({ title, icon: Icon, badge, children }) {
  return (
    <div className="rounded-2xl p-6 mb-6 bg-gradient-to-b from-[rgba(15,23,42,0.96)] to-[rgba(11,19,38,0.98)] backdrop-blur-xl border border-[rgba(0,212,255,0.15)] shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[rgba(143,163,184,0.1)] pb-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-cyan">
              <Icon size={16} />
            </div>
          )}
          <h3 className="font-orbitron text-[0.82rem] font-bold text-text-primary tracking-[0.08em] uppercase">
            {title}
          </h3>
        </div>
        {badge && (
          <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-orbitron font-bold bg-[rgba(0,212,255,0.12)] text-cyan border border-[rgba(0,212,255,0.25)]">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 border-b border-[rgba(143,163,184,0.06)] last:border-0">
      <div className="sm:w-72 shrink-0">
        <p className="text-[0.84rem] font-semibold text-text-primary">{label}</p>
        {hint && <p className="text-[0.72rem] text-text-muted mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="flex-1 max-w-xl w-full">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        className={`relative w-11 h-6 rounded-full transition-all border ${
          checked
            ? 'bg-[rgba(0,212,255,0.25)] border-cyan/50 shadow-[0_0_12px_rgba(0,212,255,0.25)]'
            : 'bg-black/40 border-white/15'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
            checked
              ? 'left-[calc(100%-22px)] bg-cyan shadow-[0_0_8px_rgba(0,212,255,0.8)]'
              : 'left-[2px] bg-steel'
          }`}
        />
      </div>
      {label && <span className="text-[0.82rem] font-medium text-steel">{label}</span>}
    </label>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { data: me, isLoading: meLoading } = useMe()
  const isCEO = me?.role === 'ceo'

  const { data: settingsResponse, isLoading: settingsLoading, isError: settingsError } = useSettings({
    enabled: isCEO,
  })

  const { mutateAsync: updateSettings, isPending: updating } = useUpdateSettings()
  const { mutateAsync: rotateApiKey, isPending: rotating } = useRotateApiKey()

  const [form, setForm] = useState({
    name: '',
    industry: 'Apparel Manufacturing',
    phone: '',
    website: '',
    address: '',
    emailNotifications: true,
    rejectionAlerts: true,
    cycleCompletionAlerts: true,
    weeklySummaryReport: false,
    apiKey: '',
    webhookUrl: '',
  })

  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rotateModalOpen, setRotateModalOpen] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', text: '' }

  // Populate local form state when settings load
  useEffect(() => {
    if (settingsResponse?.data?.company) {
      const c = settingsResponse.data.company
      setForm({
        name: c.name || '',
        industry: c.industry || 'Apparel Manufacturing',
        phone: c.phone || '',
        website: c.website || '',
        address: c.address || '',
        emailNotifications: c.notificationSettings?.emailNotifications ?? true,
        rejectionAlerts: c.notificationSettings?.rejectionAlerts ?? true,
        cycleCompletionAlerts: c.notificationSettings?.cycleCompletionAlerts ?? true,
        weeklySummaryReport: c.notificationSettings?.weeklySummaryReport ?? false,
        apiKey: c.apiSettings?.apiKey || '',
        webhookUrl: c.apiSettings?.webhookUrl || '',
      })
    }
  }, [settingsResponse])

  // Handle Save
  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setFeedback(null)
    try {
      await updateSettings({
        name: form.name,
        industry: form.industry,
        phone: form.phone,
        website: form.website,
        address: form.address,
        notificationSettings: {
          emailNotifications: form.emailNotifications,
          rejectionAlerts: form.rejectionAlerts,
          cycleCompletionAlerts: form.cycleCompletionAlerts,
          weeklySummaryReport: form.weeklySummaryReport,
        },
        apiSettings: {
          webhookUrl: form.webhookUrl,
        },
      })
      setFeedback({ type: 'success', text: 'Organization settings saved successfully!' })
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Failed to save settings' })
    }
  }

  // Handle API Key Rotation
  const handleRotateKey = async () => {
    setFeedback(null)
    try {
      const res = await rotateApiKey()
      if (res?.data?.apiKey) {
        setForm((prev) => ({ ...prev, apiKey: res.data.apiKey }))
      }
      setRotateModalOpen(false)
      setFeedback({ type: 'success', text: 'API Key rotated successfully! Ensure you update your API clients.' })
    } catch (err) {
      setFeedback({ type: 'error', text: err?.response?.data?.message || 'Failed to rotate API Key' })
    }
  }

  const handleCopyKey = () => {
    if (!form.apiKey) return
    navigator.clipboard.writeText(form.apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ── 1. Loading State ── */
  if (meLoading || (isCEO && settingsLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-cyan">
        <Loader2 size={32} className="animate-spin" />
        <p className="font-orbitron text-xs font-bold tracking-wider uppercase">Loading Organization Settings…</p>
      </div>
    )
  }

  /* ── 2. Role Restriction (CEO Only Guard) ── */
  if (!isCEO) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-red-400 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-pulse">
          <ShieldAlert size={40} />
        </div>
        <h2 className="font-orbitron text-xl font-bold text-text-primary tracking-wide mb-2 uppercase">
          Access Restricted — CEO Only
        </h2>
        <p className="text-steel max-w-md text-[0.88rem] leading-relaxed mb-6">
          Organization, AI decision rules, API access, and system notification settings can only be viewed and modified by company Executives (CEO).
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard/overview')}
            className="btn-primary text-xs py-2.5 px-6 font-orbitron font-semibold tracking-wider uppercase"
          >
            Return to Overview
          </button>
        </div>
      </div>
    )
  }

  /* ── 3. CEO Settings View ── */
  return (
    <div>
      <PageHeader
        title="Organization Settings"
        subtitle="Configure company profile, system notifications, and developer API integrations"
        badge="CEO Access"
        actions={
          <button
            onClick={handleSave}
            disabled={updating}
            className="btn-primary text-[0.72rem] py-[9px] px-[18px] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {updating ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {updating ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      {/* Status Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl mb-6 flex items-center gap-3 border transition-all ${
            feedback.type === 'success'
              ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-emerald-400'
              : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-copper'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-[0.83rem] font-medium">{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-auto text-xs opacity-70 hover:opacity-100 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {settingsError && (
        <div className="p-4 rounded-xl mb-6 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-copper text-xs font-medium">
          Failed to fetch settings from server. Please check your backend connection.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Organization Profile */}
        <Section title="Organization Profile" icon={Building2} badge="Enterprise Identity">
          <Field label="Company / Business Name" hint="Official organization name shown on reports and inspect logs">
            <div className="relative">
              <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Apex Textile Group"
                className="input-glass w-full text-[0.83rem] py-2 pl-9 pr-4"
              />
            </div>
          </Field>

          <Field label="Industry Sector" hint="Customizes AI inspection models and quality benchmarks">
            <select
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="input-glass w-full text-[0.83rem] py-2 px-3 [color-scheme:dark]"
            >
              <option value="Apparel Manufacturing">Apparel Manufacturing</option>
              <option value="Textile & Fabric Production">Textile & Fabric Production</option>
              <option value="Footwear & Leather">Footwear & Leather</option>
              <option value="Garment Accessories">Garment Accessories</option>
              <option value="Automotive & Industrial Products">Automotive & Industrial Products</option>
              <option value="Quality Inspection & Testing">Quality Inspection & Testing</option>
            </select>
          </Field>

          <Field label="Primary Contact Email" hint="Executive email used for security and operational digests">
            <div className="relative opacity-80">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="email"
                readOnly
                value={settingsResponse?.data?.ceoEmail || me?.email || ''}
                className="input-glass w-full text-[0.83rem] py-2 pl-9 pr-4 bg-black/40 cursor-not-allowed text-steel"
              />
            </div>
          </Field>

          <Field label="Phone Number" hint="Official contact number for critical inspection alerts">
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="input-glass w-full text-[0.83rem] py-2 pl-9 pr-4"
              />
            </div>
          </Field>

          <Field label="Official Website URL" hint="Company website link">
            <div className="relative">
              <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel" />
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://apexgroup.com"
                className="input-glass w-full text-[0.83rem] py-2 pl-9 pr-4"
              />
            </div>
          </Field>

          <Field label="Facility / Office Address" hint="Physical headquarters or primary factory location">
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-3 text-steel" />
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="104 Quality Way, Industrial Zone, Bldg A"
                className="input-glass w-full text-[0.83rem] py-2 pl-9 pr-4 transition-all"
              />
            </div>
          </Field>
        </Section>

        {/* Section 2: Notification Preferences */}
        <Section title="Notification Preferences" icon={Bell} badge="System Alerts">
          <Field
            label="Email Operational Notifications"
            hint="Receive real-time email notifications for critical quality events"
          >
            <Toggle
              checked={form.emailNotifications}
              onChange={(val) => setForm({ ...form, emailNotifications: val })}
              label={form.emailNotifications ? 'Enabled' : 'Disabled'}
            />
          </Field>

          <Field
            label="Defect & Rejection Spikes"
            hint="Instant priority notification when an agent detects repeated inspection failures"
          >
            <Toggle
              checked={form.rejectionAlerts}
              onChange={(val) => setForm({ ...form, rejectionAlerts: val })}
              label={form.rejectionAlerts ? 'Alert Active' : 'Off'}
            />
          </Field>

          <Field
            label="Cycle Completion Alerts"
            hint="Send alert notification when an operational cycle finishes processing"
          >
            <Toggle
              checked={form.cycleCompletionAlerts}
              onChange={(val) => setForm({ ...form, cycleCompletionAlerts: val })}
              label={form.cycleCompletionAlerts ? 'Alert Active' : 'Off'}
            />
          </Field>

          <Field
            label="Weekly Executive Summary"
            hint="Send Monday morning PDF digest of throughput, defects, and staff matrix to CEO email"
          >
            <Toggle
              checked={form.weeklySummaryReport}
              onChange={(val) => setForm({ ...form, weeklySummaryReport: val })}
              label={form.weeklySummaryReport ? 'Subscribed' : 'Unsubscribed'}
            />
          </Field>
        </Section>

        {/* Section 4: API Keys & Webhooks */}
        <Section title="API Access & Webhooks" icon={Key} badge="Developer Access">
          <Field
            label="Production API Key"
            hint="Use this key to authenticate external inspection devices or automated software"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={form.apiKey || 'No key generated yet'}
                  className="input-glass w-full text-[0.8rem] font-mono py-2 pl-3 pr-10 bg-black/60 border border-cyan/20"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-cyan text-xs transition-colors"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyKey}
                  title="Copy API Key"
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-steel hover:text-cyan hover:border-cyan/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRotateModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-copper/10 border border-copper/30 text-copper hover:bg-copper/20 text-xs font-semibold font-orbitron flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw size={12} /> Rotate Key
                </button>
              </div>
            </div>
          </Field>

          <Field
            label="Inspection Webhook Endpoint"
            hint="HTTP POST target URL for real-time inspection payload events"
          >
            <input
              type="url"
              value={form.webhookUrl}
              onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
              placeholder="https://api.yourcompany.com/v1/webhooks/feedbrush"
              className="input-glass w-full text-[0.83rem] font-mono py-2 px-3"
            />
          </Field>
        </Section>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={updating}
            className="btn-primary text-xs py-3 px-8 font-orbitron font-semibold tracking-wider uppercase flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {updating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {updating ? 'Updating Settings…' : 'Save Organization Settings'}
          </button>
        </div>
      </form>

      {/* Confirm Key Rotation Modal */}
      <Modal open={rotateModalOpen} onClose={() => setRotateModalOpen(false)} title="Rotate Production API Key" size="sm">
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-copper/10 border border-copper/30 text-copper flex items-start gap-3 text-xs leading-relaxed">
            <Lock size={18} className="shrink-0 mt-0.5" />
            <span>
              Rotating your API key will immediately invalidate the current key. Any external system or scanner using the existing key will lose access until updated.
            </span>
          </div>
          <p className="text-[0.83rem] text-steel">Are you sure you want to generate a new API key for your organization?</p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-ghost flex-1 justify-center text-xs"
              onClick={() => setRotateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRotateKey}
              disabled={rotating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-copper/20 border border-copper/50 text-copper font-orbitron text-xs font-bold uppercase hover:bg-copper/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {rotating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {rotating ? 'Rotating…' : 'Confirm Rotate'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

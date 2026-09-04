import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useRegister } from '../apiHooks'

export default function SignupPage() {
  const navigate = useNavigate()
  const { mutate: register, isPending } = useRegister()

  const [form, setForm] = useState({ companyName: '', fullName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setServerError(null)
    setSuccessMsg(null)
    register(
      {
        name:     form.fullName,
        email:    form.email,
        password: form.password,
        company:  { name: form.companyName },
      },
      {
        onSuccess: (data) => {
          setSuccessMsg(data?.message || 'Account created! Please check your email to verify your account.')
        },
        onError: (err) => {
          setServerError(err?.response?.data?.message || 'Registration failed. Please try again.')
        },
      }
    )
  }

  const FIELDS = [
    { name: 'companyName', label: 'Company Name', type: 'text',     placeholder: 'Apex Textile Group' },
    { name: 'fullName',    label: 'Full Name',    type: 'text',     placeholder: 'Ahmad Karimi' },
    { name: 'email',       label: 'Work Email',   type: 'email',    placeholder: 'you@company.com' },
    { name: 'password',    label: 'Password',     type: 'password', placeholder: 'Min. 8 characters' },
  ]

  return (
    <section style={{
      position: 'relative', width: '100%', minHeight: '100vh', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto',
    }}>
      {/* ── Background Video ── */}
      <video
        autoPlay muted loop playsInline
        poster="/background.png"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      >
        <source src="/assets/videos/Fabric_texture_under_scanning_beam_delpmaspu_.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(6,8,16,0.78) 0%, rgba(6,8,16,0.5) 50%, rgba(6,8,16,0.72) 100%)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(6,8,16,0.8) 100%)',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        backgroundImage:
          'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Scan line */}
      <div className="scan-line" style={{ zIndex: 4 }} />

      {/* Corner decorations */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 4 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M0 60 L0 0 L60 0" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" fill="none"/>
          <path d="M0 40 L0 0 L40 0" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5" fill="none"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 4 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M60 0 L60 60 L0 60" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" fill="none"/>
          <path d="M60 20 L60 60 L20 60" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5" fill="none"/>
        </svg>
      </div>

      {/* ── Content ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 20, padding: '24px 24px', maxWidth: 860, textAlign: 'center', margin: 'auto',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 100,
          background: 'rgba(200,121,65,0.08)',
          border: '1px solid rgba(200,121,65,0.25)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeInDown 0.8s ease both',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#c87941',
            animation: 'copperPulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(200,121,65,0.9)',
          }}>
            Start Free 14-Day Trial
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          display: 'flex', flexDirection: 'column', gap: 4,
          animation: 'fadeInUp 1s ease 0.2s both',
        }}>
          <span style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 'clamp(1.6rem, 4vw, 3rem)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em',
            color: '#ffffff',
            textShadow: '0 0 60px rgba(0,212,255,0.3)',
          }}>
            Build Your
          </span>
          <span style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 'clamp(1.6rem, 4vw, 3rem)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 60%, #c87941 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Inspection Armor
          </span>
        </h1>

        {/* Glass form card */}
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(8,12,20,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: 16,
          boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.04)',
          padding: '24px 26px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'left',
          animation: 'fadeInUp 1s ease 0.4s both',
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(200,121,65,0.35), rgba(0,212,255,0.35), transparent)',
          }} />

          {successMsg && (
            <div style={{
              marginBottom: 16, padding: '12px 14px',
              background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 8, fontSize: '0.82rem', color: '#a0cfdf', lineHeight: 1.5,
            }}>
              {successMsg}
              <div style={{ marginTop: 10 }}>
                <Link to="/login" style={{ color: '#00d4ff', fontWeight: 600, textDecoration: 'none' }}>
                  Go to Login
                </Link>
              </div>
            </div>
          )}

          {serverError && (
            <div style={{
              marginBottom: 16, padding: '10px 14px',
              background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)',
              borderRadius: 8, fontSize: '0.8rem', color: '#ff8080',
            }}>
              {serverError}
            </div>
          )}

          {!successMsg && (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FIELDS.map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label style={{
                    display: 'block', marginBottom: 5,
                    fontSize: '0.72rem', fontWeight: 600,
                    color: '#8fa3b8', letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {label}
                  </label>
                  {name === 'password' ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name={name}
                        value={form[name]}
                        onChange={handle}
                        placeholder={placeholder}
                        className="input-glass"
                        required
                        style={{ width: '100%', paddingRight: 38 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#8fa3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          padding: 0,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#00d4ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#8fa3b8')}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  ) : (
                    <input
                      type={type} name={name}
                      value={form[name]} onChange={handle}
                      placeholder={placeholder}
                      className="input-glass"
                      required
                      style={{ width: '100%' }}
                    />
                  )}
                </div>
              ))}

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 2 }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ accentColor: '#00d4ff', width: 13, height: 13, marginTop: 2, flexShrink: 0 }}
                />
                <span style={{ fontSize: '0.75rem', color: '#8fa3b8', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <span style={{ color: '#00d4ff', cursor: 'pointer' }}>Terms of Service</span>
                  {' '}and{' '}
                  <span style={{ color: '#00d4ff', cursor: 'pointer' }}>Privacy Policy</span>
                </span>
              </label>

              <button
                type="submit"
                className="btn-primary"
                disabled={isPending || !agreed}
                style={{ width: '100%', justifyContent: 'center', opacity: (isPending || !agreed) ? 0.55 : 1 }}
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Creating workspace...
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Create Account
                  </>
                )}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(143,163,184,0.1)' }} />
            <span style={{ fontSize: '0.7rem', color: '#3d4f63' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(143,163,184,0.1)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#8fa3b8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 1s ease 0.6s both',
        }}>
          {['No Credit Card Required', 'Cancel Anytime', 'GDPR Compliant'].map((item) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.8rem', fontWeight: 600,
              color: 'rgba(143,163,184,0.7)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(200,121,65,0.6)' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

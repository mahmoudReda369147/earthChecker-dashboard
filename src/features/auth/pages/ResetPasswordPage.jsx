import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useResetPassword } from '../apiHooks'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const { mutate: resetPassword, isPending } = useResetPassword()

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState(null)

  const mismatch   = confirm.length > 0 && password !== confirm
  const tooShort   = password.length > 0 && password.length < 8
  const canSubmit  = password.length >= 8 && password === confirm && !isPending

  const submit = (e) => {
    e.preventDefault()
    setError(null)
    resetPassword(
      { token, password },
      {
        onSuccess: () => setSuccess(true),
        onError: (err) => {
          setError(err?.response?.data?.message || 'Reset failed. The link may have expired.')
        },
      }
    )
  }

  return (
    <section style={{
      position: 'relative', width: '100%', height: '100vh', minHeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {/* ── Background Video ── */}
      <video
        autoPlay muted loop playsInline poster="/background.png"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      >
        <source src="/assets/videos/Flow_delpmaspu_1.mp4" type="video/mp4" />
      </video>

      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(6,8,16,0.78) 0%, rgba(6,8,16,0.5) 50%, rgba(6,8,16,0.72) 100%)',
      }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 2,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(6,8,16,0.85) 100%)',
      }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <div className="scan-line" style={{ zIndex: 4 }} />

      {/* Corners */}
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
        gap: 28, padding: '0 24px', maxWidth: 860, textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 18px', borderRadius: 100,
          background: 'rgba(0,212,255,0.07)',
          border: '1px solid rgba(0,212,255,0.25)',
          backdropFilter: 'blur(10px)',
          animation: 'fadeInDown 0.8s ease both',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#00d4ff',
            animation: 'pulseGlow 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(0,212,255,0.9)',
          }}>
            Secure Reset
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
            color: '#ffffff', textShadow: '0 0 60px rgba(0,212,255,0.3)',
          }}>
            Set Your New
          </span>
          <span style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 'clamp(1.6rem, 4vw, 3rem)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em',
            background: 'linear-gradient(90deg, #00d4ff, #007acc, #00d4ff)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmer 4s linear infinite',
          }}>
            Password
          </span>
        </h1>

        {/* Glass card */}
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(8,12,20,0.72)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: 16,
          boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.04)',
          padding: '32px 28px',
          position: 'relative', overflow: 'hidden', textAlign: 'left',
          animation: 'fadeInUp 1s ease 0.4s both',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)',
          }} />

          {success ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: '1rem', fontWeight: 800, color: '#eef2f7' }}>
                Password Reset!
              </h2>
              <p style={{ fontSize: '0.83rem', color: '#8fa3b8', lineHeight: 1.6, maxWidth: 300 }}>
                Your password has been updated. All active sessions have been signed out for security.
              </p>
              <Link
                to="/login"
                className="btn-primary"
                style={{ marginTop: 8, textDecoration: 'none', justifyContent: 'center' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <p style={{ color: '#8fa3b8', fontSize: '0.82rem', marginBottom: 20 }}>
                Must be at least 8 characters. All sessions will be signed out.
              </p>

              {error && (
                <div style={{
                  marginBottom: 16, padding: '10px 14px',
                  background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.25)',
                  borderRadius: 8, fontSize: '0.8rem', color: '#ff8080',
                }}>
                  {error}{' '}
                  <Link to="/forgot-password" style={{ color: '#00d4ff', fontWeight: 600 }}>
                    Request a new link
                  </Link>
                </div>
              )}

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{
                    display: 'block', marginBottom: 6,
                    fontSize: '0.72rem', fontWeight: 600,
                    color: '#8fa3b8', letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    New Password
                  </label>
                  <input
                    type="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="input-glass" required
                    style={{ width: '100%' }}
                  />
                  {tooShort && (
                    <p style={{ marginTop: 5, fontSize: '0.72rem', color: '#c87941' }}>
                      Password must be at least 8 characters.
                    </p>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block', marginBottom: 6,
                    fontSize: '0.72rem', fontWeight: 600,
                    color: '#8fa3b8', letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    Confirm Password
                  </label>
                  <input
                    type="password" value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat new password"
                    className="input-glass" required
                    style={{ width: '100%', borderColor: mismatch ? 'rgba(200,121,65,0.5)' : undefined }}
                  />
                  {mismatch && (
                    <p style={{ marginTop: 5, fontSize: '0.72rem', color: '#c87941' }}>
                      Passwords do not match.
                    </p>
                  )}
                </div>

                <button
                  type="submit" className="btn-primary"
                  disabled={!canSubmit}
                  style={{ width: '100%', justifyContent: 'center', opacity: canSubmit ? 1 : 0.5 }}
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Reset Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 1s ease 0.6s both',
        }}>
          {['End-to-End Encrypted', 'Secure Password Reset', 'All Sessions Revoked'].map((item) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.8rem', fontWeight: 600,
              color: 'rgba(143,163,184,0.7)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(0,212,255,0.6)' }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

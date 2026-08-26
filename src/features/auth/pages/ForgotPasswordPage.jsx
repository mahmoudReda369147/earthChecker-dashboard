import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../apiHooks'

export default function ForgotPasswordPage() {
  const { mutate: forgot, isPending } = useForgotPassword()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    forgot({ email }, {
      onSuccess: () => setSubmitted(true),
      onError:   () => setSubmitted(true),
    })
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
        <source src="/assets/videos/Flow_delpmaspu_.mp4" type="video/mp4" />
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
            Account Recovery
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
            Forgot Your
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
            Password?
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

          {submitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: '1rem', fontWeight: 800, color: '#eef2f7' }}>
                Check Your Email
              </h2>
              <p style={{ fontSize: '0.83rem', color: '#8fa3b8', lineHeight: 1.6, maxWidth: 300 }}>
                If <span style={{ color: '#00d4ff' }}>{email}</span> is registered, a password reset link has been sent. It expires in <strong>15 minutes</strong>.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#3d4f63', marginTop: 4 }}>
                Didn't receive it?{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  style={{ color: '#00d4ff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <p style={{ color: '#8fa3b8', fontSize: '0.82rem', marginBottom: 20 }}>
                Enter your email and we'll send a reset link.
              </p>

              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{
                    display: 'block', marginBottom: 6,
                    fontSize: '0.72rem', fontWeight: 600,
                    color: '#8fa3b8', letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-glass" required
                    style={{ width: '100%' }}
                  />
                </div>

                <button
                  type="submit" className="btn-primary" disabled={isPending}
                  style={{ width: '100%', justifyContent: 'center', opacity: isPending ? 0.7 : 1 }}
                >
                  {isPending ? (
                    <>
                      <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(143,163,184,0.1)' }} />
            <span style={{ fontSize: '0.7rem', color: '#3d4f63' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(143,163,184,0.1)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#8fa3b8', marginTop: 16 }}>
            Remember it?{' '}
            <Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 1s ease 0.6s both',
        }}>
          {['End-to-End Encrypted', 'Secure Password Reset', 'ISO 27001'].map((item) => (
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

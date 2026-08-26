import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../../lib/axios'
import { AUTH_ENDPOINTS } from '../endpoints'

function useVerifyEmail(token) {
  const [state, setState] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) { setState('error'); setMessage('No token provided.'); return }

    api.get(AUTH_ENDPOINTS.VERIFY_EMAIL(token))
      .then(({ data }) => {
        if (data?.message?.includes('already')) {
          setState('already_verified')
        } else {
          setState('success')
        }
        setMessage(data?.message || '')
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || ''
        if (err?.response?.status === 400) {
          setState('expired')
        } else {
          setState('error')
        }
        setMessage(msg)
      })
  }, [token])

  return { state, message }
}

const CFG = {
  loading: {
    icon: (
      <svg className="animate-spin" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.7)" strokeWidth="1.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ),
    title: 'Verifying...',
    body:  'Please wait while we verify your email address.',
    accent: '0,212,255',
    action: null,
  },
  success: {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: 'Email Verified!',
    body:  'Your account is now active. You can sign in.',
    accent: '0,212,255',
    action: { to: '/login', label: 'Sign In' },
  },
  already_verified: {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 8 12 12 14 14"/>
      </svg>
    ),
    title: 'Already Verified',
    body:  'Your email is already confirmed. Go ahead and sign in.',
    accent: '0,212,255',
    action: { to: '/login', label: 'Sign In' },
  },
  expired: {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c87941" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    title: 'Link Expired',
    body:  'The verification link has expired or is invalid. Request a new one.',
    accent: '200,121,65',
    action: { to: '/signup', label: 'Back to Sign Up' },
  },
  error: {
    icon: (
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#c87941" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    title: 'Verification Failed',
    body:  'Something went wrong. Please try again or contact support.',
    accent: '200,121,65',
    action: { to: '/login', label: 'Back to Login' },
  },
}

export default function VerifyEmailPage() {
  const { token } = useParams()
  const { state, message } = useVerifyEmail(token)
  const cfg = CFG[state] || CFG.error
  const isCyan = cfg.accent === '0,212,255'

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
        <source src="/assets/videos/Flow_delpmaspu_2.mp4" type="video/mp4" />
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
          <path d="M0 60 L0 0 L60 0" stroke={`rgba(${cfg.accent},0.4)`} strokeWidth="1.5" fill="none"/>
          <path d="M0 40 L0 0 L40 0" stroke={`rgba(${cfg.accent},0.2)`} strokeWidth="0.5" fill="none"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 4 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M60 0 L60 60 L0 60" stroke={`rgba(${cfg.accent},0.4)`} strokeWidth="1.5" fill="none"/>
          <path d="M60 20 L60 60 L20 60" stroke={`rgba(${cfg.accent},0.2)`} strokeWidth="0.5" fill="none"/>
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
          background: `rgba(${cfg.accent},0.07)`,
          border: `1px solid rgba(${cfg.accent},0.25)`,
          backdropFilter: 'blur(10px)',
          animation: 'fadeInDown 0.8s ease both',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isCyan ? '#00d4ff' : '#c87941',
            animation: isCyan ? 'pulseGlow 2s ease-in-out infinite' : 'copperPulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: `rgba(${cfg.accent},0.9)`,
          }}>
            Email Verification
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          display: 'flex', flexDirection: 'column', gap: 4,
          animation: 'fadeInUp 1s ease 0.2s both',
        }}>
          <span style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 'clamp(1.8rem, 4.5vw, 3.4rem)',
            fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em',
            color: '#ffffff', textShadow: `0 0 60px rgba(${cfg.accent},0.3)`,
          }}>
            {cfg.title}
          </span>
        </h1>

        {/* Glass card */}
        <div style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(8,12,20,0.72)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid rgba(${cfg.accent},0.12)`,
          borderRadius: 16,
          boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(${cfg.accent},0.04)`,
          padding: '40px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          animation: 'fadeInUp 1s ease 0.4s both',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
            background: `linear-gradient(90deg, transparent, rgba(${cfg.accent},0.4), transparent)`,
          }} />

          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `rgba(${cfg.accent},0.06)`,
            border: `1px solid rgba(${cfg.accent},0.2)`,
            boxShadow: `0 0 24px rgba(${cfg.accent},0.12)`,
          }}>
            {cfg.icon}
          </div>

          <p style={{ fontSize: '0.88rem', color: '#8fa3b8', lineHeight: 1.6, maxWidth: 320 }}>
            {message || cfg.body}
          </p>

          {cfg.action && (
            <Link
              to={cfg.action.to}
              className="btn-primary"
              style={{ marginTop: 8, textDecoration: 'none', justifyContent: 'center' }}
            >
              {cfg.action.label}
            </Link>
          )}
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
          animation: 'fadeInUp 1s ease 0.6s both',
        }}>
          {['End-to-End Encrypted', 'AI Quality Platform'].map((item) => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.8rem', fontWeight: 600,
              color: 'rgba(143,163,184,0.7)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: `rgba(${cfg.accent},0.6)` }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

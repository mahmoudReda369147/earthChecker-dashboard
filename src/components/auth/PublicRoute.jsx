import { Navigate, Outlet } from 'react-router-dom'
import { useMe } from '../../features/auth/apiHooks'

export default function PublicRoute() {
  const hasToken = Boolean(localStorage.getItem('accessToken'))
  const { data: user, isLoading } = useMe()

  // If user has a token and session check is in-flight, show spinner
  if (hasToken && isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050a14',
        }}
      >
        <svg
          className="animate-spin"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(0,212,255,0.7)"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    )
  }

  // If user is already logged in, redirect them to dashboard overview
  if (hasToken && user) {
    return <Navigate to="/dashboard/overview" replace />
  }

  return <Outlet />
}

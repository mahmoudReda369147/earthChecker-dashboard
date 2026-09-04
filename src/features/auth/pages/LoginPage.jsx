import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../apiHooks";

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [serverError, setServerError] = useState(null);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setServerMsg(null);
    setServerError(null);
    login(form, {
      onSuccess: () => navigate("/dashboard/overview", { replace: true }),
      onError: (err) => {
        const msg =
          err?.response?.data?.message || "Login failed. Please try again.";
        const code = err?.response?.data?.code;
        if (code === "EMAIL_NOT_VERIFIED") {
          setServerMsg(
            "Your email is not verified yet. Check your inbox or resend the link.",
          );
        } else {
          setServerError(msg);
        }
      },
    });
  };

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
      }}
    >
      {/* ── Background Video ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/background.png"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source
          src="/assets/videos/Robotic_eye_pulsing_energy_delpmaspu_.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(135deg, rgba(6,8,16,0.75) 0%, rgba(6,8,16,0.5) 50%, rgba(6,8,16,0.7) 100%)",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(6,8,16,0.8) 100%)",
        }}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scan line */}
      <div className="scan-line" style={{ zIndex: 4 }} />

      {/* Corner decorations */}
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 4 }}>
        <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
          <path
            d="M0 60 L0 0 L60 0"
            stroke="rgba(0,212,255,0.4)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0 40 L0 0 L40 0"
            stroke="rgba(0,212,255,0.2)"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      </div>
      <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 4 }}>
        <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
          <path
            d="M60 0 L60 60 L0 60"
            stroke="rgba(0,212,255,0.4)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M60 20 L60 60 L20 60"
            stroke="rgba(0,212,255,0.2)"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      </div>

      {/* ── Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "16px 24px",
          maxWidth: 860,
          textAlign: "center",
          margin: "auto",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 100,
            background: "rgba(0,212,255,0.07)",
            border: "1px solid rgba(0,212,255,0.25)",
            backdropFilter: "blur(10px)",
            animation: "fadeInDown 0.8s ease both",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00d4ff",
              animation: "pulseGlow 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(0,212,255,0.9)",
            }}
          >
            AI-Powered Quality Control
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            animation: "fadeInUp 1s ease 0.2s both",
          }}
        >
          <span
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: "clamp(1.5rem, 3.2vw, 2.5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              textShadow: "0 0 60px rgba(0,212,255,0.3)",
            }}
          >
            Welcome Back
          </span>
          <span
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: "clamp(1.5rem, 3.2vw, 2.5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              background: "linear-gradient(90deg, #00d4ff, #007acc, #00d4ff)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite",
            }}
          >
            To Your Dashboard
          </span>
        </h1>

        {/* Glass form card */}
        <div
          style={{
            width: "100%",
            maxWidth: 410,
            background: "rgba(8,12,20,0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(0,212,255,0.12)",
            borderRadius: 16,
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(0,212,255,0.04)",
            padding: "24px 26px",
            position: "relative",
            overflow: "hidden",
            textAlign: "left",
            animation: "fadeInUp 1s ease 0.4s both",
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
            }}
          />

          {serverError && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                background: "rgba(255,80,80,0.08)",
                border: "1px solid rgba(255,80,80,0.25)",
                borderRadius: 8,
                fontSize: "0.8rem",
                color: "#ff8080",
              }}
            >
              {serverError}
            </div>
          )}
          {serverMsg && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                background: "rgba(0,212,255,0.06)",
                border: "1px solid rgba(0,212,255,0.2)",
                borderRadius: 8,
                fontSize: "0.8rem",
                color: "#8fa3b8",
              }}
            >
              {serverMsg}
            </div>
          )}

          <form
            onSubmit={submit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Email field */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#8fa3b8",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handle}
                placeholder="you@company.com"
                className="input-glass"
                required
                style={{ width: "100%" }}
              />
            </div>

            {/* Password field with Eye toggle button */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "#8fa3b8",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  className="input-glass"
                  required
                  style={{ width: "100%", paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#8fa3b8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justify: "center",
                    padding: 0,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#00d4ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#8fa3b8")
                  }
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "0.78rem",
                  color: "#00d4ff",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isPending}
              style={{
                width: "100%",
                justifyContent: "center",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "20px 0",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(143,163,184,0.1)",
              }}
            />
            <span style={{ fontSize: "0.7rem", color: "#3d4f63" }}>or</span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(143,163,184,0.1)",
              }}
            />
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.82rem",
              color: "#8fa3b8",
            }}
          >
            New to EarthChecker?{" "}
            <Link
              to="/signup"
              style={{
                color: "#00d4ff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeInUp 1s ease 0.6s both",
          }}
        >
          {[
            "99% Detection Accuracy",
            "< 2s Image Analysis",
            "End-to-End Encrypted",
          ].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "rgba(143,163,184,0.7)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "rgba(0,212,255,0.6)",
                }}
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

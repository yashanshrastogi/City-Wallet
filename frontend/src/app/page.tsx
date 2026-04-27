"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  MapPin,
  Sparkles,
  ChevronRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="shimmer" style={{ width: 200, height: 48, borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative orbs */}
      <div
        className="animate-float"
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="animate-float"
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "3s",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{
          maxWidth: 480,
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo & Brand */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 32px var(--accent-glow)",
            }}
          >
            <Wallet size={36} color="white" />
          </motion.div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            City <span className="gradient-text">Wallet</span>
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            Hyper-personalized offers powered by AI, delivered right when you
            need them.
          </p>
        </div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginBottom: 40,
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: <MapPin size={13} />, text: "Location-Aware" },
            { icon: <Sparkles size={13} />, text: "AI-Powered" },
            { icon: <Zap size={13} />, text: "Real-Time" },
          ].map((item) => (
            <span key={item.text} className="badge badge-accent">
              {item.icon}
              {item.text}
            </span>
          ))}
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
          style={{ padding: 36 }}
        >
          <button
            id="google-signin-btn"
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px 24px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text-primary)",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              transition: "all 0.3s ease",
              opacity: loading ? 0.6 : 1,
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = "var(--accent-primary)";
                e.currentTarget.style.background = "rgba(99,102,241,0.06)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? "Connecting..." : "Continue with Google"}
          </button>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <Shield size={14} color="var(--text-muted)" />
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
              Secured with OAuth 2.0 encryption
            </p>
          </div>
        </motion.div>

        {/* Bottom features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            textAlign: "center",
          }}
        >
          {[
            { icon: <Globe size={18} />, label: "Geofenced" },
            { icon: <Sparkles size={18} />, label: "AI Offers" },
            { icon: <Shield size={18} />, label: "GDPR Ready" },
          ].map((f) => (
            <div key={f.label} style={{ color: "var(--text-muted)", fontSize: 12 }}>
              <div
                style={{
                  marginBottom: 6,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {f.icon}
              </div>
              {f.label}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}

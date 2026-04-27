"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User, Store, ArrowRight, ShieldCheck } from "lucide-react";

export default function RoleSelectPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const selectRole = async (role: "user" | "merchant") => {
    setLoading(role);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/role-decider`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(session as any)?.idToken}`,
          },
          body: JSON.stringify({ role }),
        }
      );

      if (res.ok) {
        // Redirect to dashboard to reload the layout
        window.location.href = "/dashboard";
      } else {
        const error = await res.json();
        console.error("Failed to assign role:", error);
        alert("Failed to assign role. Please try again.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "var(--bg-primary)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 40, maxWidth: 600 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            background: "rgba(99, 102, 241, 0.1)",
            color: "var(--accent-primary)",
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          <ShieldCheck size={18} />
          Welcome to City Wallet
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
          How do you want to use City Wallet?
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Choose your account type. You can explore exclusive AI-powered offers as a user, or create hyper-personalized campaigns as a merchant.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          maxWidth: 800,
          width: "100%",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {/* User Card */}
        <button
          onClick={() => selectRole("user")}
          disabled={loading !== null}
          className="glass-card"
          style={{
            flex: "1 1 300px",
            padding: 32,
            textAlign: "left",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid var(--border)",
            background: loading === "user" ? "rgba(99,102,241,0.05)" : "var(--bg-card)",
            position: "relative",
            overflow: "hidden",
            opacity: loading === "merchant" ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(99,102,241,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              color: "var(--accent-primary)",
            }}
          >
            <User size={28} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Continue as User
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
            Discover personalized offers, unlock rewards, and get real-time notifications when you enter merchant geofences.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--accent-primary)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {loading === "user" ? "Setting up account..." : "Select User"}
            <ArrowRight size={16} />
          </div>
        </button>

        {/* Merchant Card */}
        <button
          onClick={() => selectRole("merchant")}
          disabled={loading !== null}
          className="glass-card"
          style={{
            flex: "1 1 300px",
            padding: 32,
            textAlign: "left",
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid var(--border)",
            background: loading === "merchant" ? "rgba(139,92,246,0.05)" : "var(--bg-card)",
            position: "relative",
            overflow: "hidden",
            opacity: loading === "user" ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = "var(--accent-secondary)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(139,92,246,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              color: "var(--accent-secondary)",
            }}
          >
            <Store size={28} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Continue as Merchant
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24 }}>
            Create AI-driven promotional campaigns, set up geofences, and configure hyper-personalized offers for your customers.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--accent-secondary)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {loading === "merchant" ? "Setting up account..." : "Select Merchant"}
            <ArrowRight size={16} />
          </div>
        </button>
      </div>
    </div>
  );
}

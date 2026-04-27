"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Shield,
  Crown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  Store,
} from "lucide-react";
import api from "@/lib/api";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetRole = async (role: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSelectedRole(role);

    try {
      await api.post("/role-decider", { role });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to set role.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      value: "customer",
      label: "Customer",
      description: "Browse and discover personalized offers from nearby merchants",
      icon: <UserCheck size={24} />,
      color: "#6366f1",
    },
    {
      value: "merchant",
      label: "Merchant",
      description: "Create and publish offers to reach customers in your area",
      icon: <Store size={24} />,
      color: "#10b981",
    },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 36 }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 6,
          }}
        >
          Your <span className="gradient-text">Profile</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Manage your account and role preferences.
        </p>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{ padding: 32 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 28,
            }}
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="avatar"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  objectFit: "cover",
                  border: "2px solid var(--border)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: "var(--accent-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                {session?.user?.name?.[0] || "U"}
              </div>
            )}
            <div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {session?.user?.name || "User"}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 4,
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                <Mail size={14} />
                {session?.user?.email}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
              }}
            >
              <Shield size={16} color="var(--accent-primary)" />
              <div>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Authentication
                </p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>
                  Google OAuth 2.0
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
              }}
            >
              <Crown size={16} color="var(--warning)" />
              <div>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Current Role
                </p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>
                  {selectedRole || "Not set"}{" "}
                  {selectedRole && (
                    <span className="badge badge-accent" style={{ marginLeft: 8 }}>
                      Active
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Role Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{ padding: 32 }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Choose Your Role
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginBottom: 24,
            }}
          >
            Select how you want to use City Wallet.
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {roles.map((role) => {
              const isSelected = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  id={`role-${role.value}-btn`}
                  onClick={() => handleSetRole(role.value)}
                  disabled={loading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${isSelected ? role.color + "60" : "var(--border)"}`,
                    background: isSelected
                      ? `${role.color}10`
                      : "rgba(255,255,255,0.02)",
                    cursor: loading ? "not-allowed" : "pointer",
                    textAlign: "left",
                    transition: "all 0.3s ease",
                    fontFamily: "'Inter', sans-serif",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: `${role.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: role.color,
                      flexShrink: 0,
                    }}
                  >
                    {role.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: isSelected
                          ? role.color
                          : "var(--text-primary)",
                        marginBottom: 4,
                      }}
                    >
                      {role.label}
                      {isSelected && (
                        <CheckCircle2
                          size={16}
                          style={{
                            marginLeft: 8,
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--success-glow)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--success)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={16} />
                Role updated successfully!
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--danger)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

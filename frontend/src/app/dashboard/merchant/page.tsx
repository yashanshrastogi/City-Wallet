"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Store,
  Percent,
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  TrendingUp,
  Package,
} from "lucide-react";
import api from "@/lib/api";

export default function MerchantPage() {
  const { data: session } = useSession();
  const [config, setConfig] = useState({
    max_offer: 15,
    traffic: 50,
    target_item: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post("/merchant", config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        "Failed to publish. Make sure your role is set to merchant.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
          Merchant <span className="gradient-text">Panel</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Configure your offer parameters. Our AI will match you with relevant
          customers.
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
        {/* Config Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          style={{ padding: 28 }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Store size={18} color="var(--accent-primary)" />
            Offer Configuration
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Max Offer */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Percent size={13} />
                Maximum Discount (%)
              </label>
              <input
                id="max-offer-input"
                type="number"
                className="input-field"
                min={0}
                max={100}
                value={config.max_offer}
                onChange={(e) =>
                  setConfig({ ...config, max_offer: Number(e.target.value) })
                }
              />
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.04)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${config.max_offer}%`,
                    height: "100%",
                    background: "var(--accent-gradient)",
                    borderRadius: 2,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Traffic Score */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Users size={13} />
                Expected Foot Traffic Score
              </label>
              <input
                id="traffic-input"
                type="number"
                className="input-field"
                min={0}
                max={100}
                value={config.traffic}
                onChange={(e) =>
                  setConfig({ ...config, traffic: Number(e.target.value) })
                }
              />
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.04)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${config.traffic}%`,
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #10b981, #059669)",
                    borderRadius: 2,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Target Item */}
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Target size={13} />
                Target Product / Category
              </label>
              <input
                id="target-item-input"
                className="input-field"
                placeholder="e.g. Espresso, Electronics, Pizza..."
                value={config.target_item}
                onChange={(e) =>
                  setConfig({ ...config, target_item: e.target.value })
                }
              />
            </div>

            <button
              id="publish-offer-btn"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "16px",
                fontSize: 15,
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Publishing...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Publish Offer
                </>
              )}
            </button>
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
                  padding: "14px 18px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--success-glow)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--success)",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={18} />
                Offer published successfully!
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 16,
                  padding: "14px 18px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--danger)",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <div className="glass-card" style={{ padding: 28 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 20,
              }}
            >
              Live Preview
            </h3>
            <div className="offer-card" style={{ background: "var(--bg-card)" }}>
              <div className="offer-card-accent" />
              <div style={{ padding: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(99,102,241,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Package size={22} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>
                      {session?.user?.name || "Your Store"}
                    </p>
                    <p
                      style={{ fontSize: 12, color: "var(--text-muted)" }}
                    >
                      Merchant Offer
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(99,102,241,0.08)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    marginBottom: 12,
                  }}
                >
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "var(--accent-primary)",
                    }}
                  >
                    Up to {config.max_offer}% OFF
                  </p>
                </div>

                {config.target_item && (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    On:{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {config.target_item}
                    </strong>
                  </p>
                )}

                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    gap: 16,
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <TrendingUp size={12} />
                    Traffic: {config.traffic}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 16,
              }}
            >
              Tips
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              <p>
                💡 Higher traffic scores increase your visibility in busy areas.
              </p>
              <p>
                🎯 Specific target items (e.g. "Flat White") convert better than generic categories.
              </p>
              <p>
                📊 Offers between 10-25% have the highest claim rate.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

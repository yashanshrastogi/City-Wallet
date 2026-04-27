"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Search,
  MapPin,
  Sparkles,
  Coffee,
  ShoppingBag,
  Utensils,
  Loader2,
  CheckCircle2,
  Tag,
  ThermometerSun,
  Calendar,
} from "lucide-react";
import api from "@/lib/api";

interface OfferResult {
  merchant: string;
  discount: string;
  item: string;
  context?: {
    temperature?: number;
    day?: string;
    geo_zone?: string;
  };
}

const quickIntents = [
  { label: "Coffee", icon: <Coffee size={16} />, value: "coffee" },
  { label: "Food", icon: <Utensils size={16} />, value: "lunch" },
  { label: "Shopping", icon: <ShoppingBag size={16} />, value: "shopping" },
];

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [intent, setIntent] = useState("");
  const [geoZone, setGeoZone] = useState("");
  const [loading, setLoading] = useState(false);
  const [offer, setOffer] = useState<OfferResult | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!intent || !geoZone) return;
    setLoading(true);
    setError(null);
    setOffer(null);

    try {
      const { data } = await api.post("/trigger", {
        intent_token: intent,
        geo_zone: geoZone,
        timestamp: new Date().toISOString(),
      });

      const tid = data.task_id;
      setTaskId(tid);

      // Poll for offer
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const { data: offerData } = await api.get(`/offers/${tid}`);
          if (offerData.offer) {
            setOffer(offerData.offer);
            setLoading(false);
            clearInterval(poll);
          }
        } catch {
          // Not ready yet
        }
        if (attempts > 10) {
          clearInterval(poll);
          setLoading(false);
          setError("Offer generation timed out. Please try again.");
        }
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.detail || "Failed to trigger offer search.");
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
          Discover <span className="gradient-text">Offers</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Tell us what you&apos;re looking for and your location — our AI will
          find the best deals nearby.
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{ padding: 28, marginBottom: 28 }}
      >
        {/* Quick intents */}
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Quick search
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {quickIntents.map((qi) => (
            <button
              key={qi.value}
              onClick={() => setIntent(qi.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${intent === qi.value ? "var(--accent-primary)" : "var(--border)"}`,
                background:
                  intent === qi.value
                    ? "rgba(99,102,241,0.1)"
                    : "transparent",
                color:
                  intent === qi.value
                    ? "var(--accent-primary)"
                    : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                transition: "all 0.2s ease",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {qi.icon}
              {qi.label}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 8,
                display: "block",
              }}
            >
              What are you looking for?
            </label>
            <div style={{ position: "relative" }}>
              <Sparkles
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="intent-input"
                className="input-field"
                placeholder="e.g. coffee, pizza, electronics..."
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 8,
                display: "block",
              }}
            >
              Your location
            </label>
            <div style={{ position: "relative" }}>
              <MapPin
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                id="location-input"
                className="input-field"
                placeholder="e.g. Berlin, Munich, Hamburg..."
                value={geoZone}
                onChange={(e) => setGeoZone(e.target.value)}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>
        </div>

        <button
          id="find-offers-btn"
          className="btn-primary"
          onClick={handleSearch}
          disabled={loading || !intent || !geoZone}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "16px",
            fontSize: 15,
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              Searching for offers...
            </>
          ) : (
            <>
              <Search size={18} />
              Find Offers
            </>
          )}
        </button>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card"
            style={{
              padding: 20,
              marginBottom: 20,
              borderColor: "rgba(239,68,68,0.3)",
              color: "var(--danger)",
              fontSize: 14,
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading shimmer */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="offer-card" style={{ marginBottom: 16 }}>
              <div className="offer-card-accent" />
              <div style={{ padding: 24 }}>
                <div
                  className="shimmer"
                  style={{
                    width: "60%",
                    height: 20,
                    borderRadius: 6,
                    marginBottom: 12,
                  }}
                />
                <div
                  className="shimmer"
                  style={{
                    width: "40%",
                    height: 16,
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                />
                <div
                  className="shimmer"
                  style={{ width: "80%", height: 14, borderRadius: 6 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offer Result */}
      <AnimatePresence>
        {offer && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="offer-card">
              <div className="offer-card-accent" />
              <div style={{ padding: 28 }}>
                {/* Success badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  <CheckCircle2 size={18} color="var(--success)" />
                  <span className="badge badge-success">Offer Found</span>
                </div>

                {/* Merchant name */}
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    marginBottom: 12,
                  }}
                >
                  {offer.merchant}
                </h3>

                {/* Discount */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    marginBottom: 16,
                  }}
                >
                  <Tag size={16} color="var(--accent-primary)" />
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--accent-primary)",
                    }}
                  >
                    {offer.discount}
                  </span>
                </div>

                {/* Item */}
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    marginBottom: 20,
                  }}
                >
                  Looking for: <strong>{offer.item}</strong>
                </p>

                {/* Context */}
                {offer.context && (
                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      padding: "16px 20px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {offer.context.temperature !== undefined && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ThermometerSun size={14} color="var(--warning)" />
                        <span
                          style={{ fontSize: 13, color: "var(--text-secondary)" }}
                        >
                          {offer.context.temperature}°C
                        </span>
                      </div>
                    )}
                    {offer.context.day && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={14} color="var(--accent-primary)" />
                        <span
                          style={{ fontSize: 13, color: "var(--text-secondary)" }}
                        >
                          {offer.context.day}
                        </span>
                      </div>
                    )}
                    {offer.context.geo_zone && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={14} color="var(--success)" />
                        <span
                          style={{ fontSize: 13, color: "var(--text-secondary)" }}
                        >
                          {offer.context.geo_zone}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action */}
                <button
                  className="btn-primary"
                  style={{
                    marginTop: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onClick={() => {
                    setOffer(null);
                    setIntent("");
                    setGeoZone("");
                  }}
                >
                  <Search size={16} />
                  Search Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

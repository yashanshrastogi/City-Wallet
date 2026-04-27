"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Sparkles, Coffee, ShoppingBag, Utensils,
  Loader2, CheckCircle2, Tag, ThermometerSun, Calendar,
  Copy, Check, Repeat2, Pizza, Dumbbell, Music2,
} from "lucide-react";
import api from "@/lib/api";

interface OfferResult {
  offer_title?: string;
  description?: string;
  discount_code?: string;
  visual_theme?: string;
  urgency?: string;
  cta_text?: string;
  merchant?: string;
  task_id?: string;
}

const quickIntents = [
  { label: "Coffee",   icon: <Coffee size={15} />,    value: "coffee"   },
  { label: "Food",     icon: <Utensils size={15} />,  value: "lunch"    },
  { label: "Shopping", icon: <ShoppingBag size={15} />, value: "shopping" },
  { label: "Pizza",    icon: <Pizza size={15} />,     value: "pizza"    },
  { label: "Gym",      icon: <Dumbbell size={15} />,  value: "gym"      },
  { label: "Music",    icon: <Music2 size={15} />,    value: "events"   },
];

const urgencyColor: Record<string, string> = {
  High:   "#f87171",
  Medium: "#fbbf24",
  Low:    "#22d3a4",
};

export default function DiscoverPage() {
  const [intent, setIntent]     = useState("");
  const [geoZone, setGeoZone]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [offer, setOffer]       = useState<OfferResult | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const copyCode = useCallback(() => {
    if (offer?.discount_code) {
      navigator.clipboard.writeText(offer.discount_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [offer]);

  const handleSearch = async () => {
    if (!intent.trim() || !geoZone.trim()) return;
    setLoading(true);
    setError(null);
    setOffer(null);
    setPollCount(0);

    try {
      const { data } = await api.post("/trigger", {
        intent_token: intent.trim(),
        geo_zone: geoZone.trim(),
        timestamp: new Date().toISOString(),
      });

      const taskId: string = data.task_id;
      let attempts = 0;
      const maxAttempts = 12;

      const poll = setInterval(async () => {
        attempts++;
        setPollCount(attempts);
        try {
          const { data: offerData } = await api.get(`/offers/${taskId}`);
          if (offerData.offer) {
            setOffer(offerData.offer);
            setLoading(false);
            clearInterval(poll);
          }
        } catch { /* Not ready yet */ }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setLoading(false);
          setError("Offer generation timed out — the pipeline may be warming up. Try again.");
        }
      }, 1800);
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.detail || "Failed to trigger offer search.");
    }
  };

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6, fontFamily: "var(--font-display)" }}>
          Discover <span className="gradient-text">Offers</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Tell us what you're looking for. Our AI will find the best deals nearby in real-time.
        </p>
      </motion.div>

      {/* Search Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        
        {/* Quick intents */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10,
          textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Quick search
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {quickIntents.map((qi) => (
            <button key={qi.value} onClick={() => setIntent(qi.value)}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 16px",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${intent === qi.value ? "var(--accent-primary)" : "var(--border)"}`,
                background: intent === qi.value ? "rgba(124,127,255,0.12)" : "transparent",
                color: intent === qi.value ? "var(--accent-primary)" : "var(--text-secondary)",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                transition: "all 0.2s ease", fontFamily: "var(--font-body)",
              }}>
              {qi.icon}{qi.label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 7,
              display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              What are you looking for?
            </label>
            <div style={{ position: "relative" }}>
              <Sparkles size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                color: "var(--text-muted)", pointerEvents: "none" }} />
              <input className="input-field" placeholder="e.g. coffee, pizza, shoes…"
                value={intent} onChange={(e) => setIntent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{ paddingLeft: 38 }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 7,
              display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your location
            </label>
            <div style={{ position: "relative" }}>
              <MapPin size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                color: "var(--text-muted)", pointerEvents: "none" }} />
              <input className="input-field" placeholder="e.g. Berlin, Munich, Delhi…"
                value={geoZone} onChange={(e) => setGeoZone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{ paddingLeft: 38 }} />
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSearch}
          disabled={loading || !intent.trim() || !geoZone.trim()}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 9, padding: "15px", fontSize: 15 }}>
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Generating offer{pollCount > 0 ? ` (${pollCount}/12)…` : "…"}
            </>
          ) : (
            <><Search size={17} /> Find Offers</>
          )}
        </button>

        {loading && (
          <div style={{ marginTop: 14 }}>
            <div className="progress-bar-wrap">
              <motion.div className="progress-bar"
                animate={{ width: `${Math.min((pollCount / 12) * 100, 95)}%` }}
                transition={{ duration: 0.4 }}
                style={{ background: "var(--accent-gradient)" }} />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
              AI pipeline processing · context enrichment · offer generation
            </p>
          </div>
        )}
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-card" style={{ padding: 18, marginBottom: 20,
              borderColor: "rgba(248,113,113,0.3)", color: "var(--danger)", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      <AnimatePresence>
        {loading && !offer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="offer-card">
              <div className="offer-card-accent" />
              <div style={{ padding: 28 }}>
                {[["60%", 22], ["40%", 16], ["80%", 14]].map(([w, h], i) => (
                  <div key={i} className="shimmer" style={{ width: w, height: h, borderRadius: 6, marginBottom: 12 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offer Result */}
      <AnimatePresence>
        {offer && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}>
            <div className="offer-card">
              <div className="offer-card-accent" style={{ background: offer.visual_theme || "var(--accent-gradient)", height: 3 }} />
              <div style={{ padding: 28 }}>
                {/* Success + urgency */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={17} color="var(--success)" />
                    <span className="badge badge-success">Offer Ready</span>
                  </div>
                  {offer.urgency && (
                    <span className="badge" style={{
                      background: `${urgencyColor[offer.urgency] || "#7c7fff"}18`,
                      color: urgencyColor[offer.urgency] || "var(--accent-primary)",
                      border: `1px solid ${urgencyColor[offer.urgency] || "var(--accent-primary)"}40`,
                    }}>
                      {offer.urgency} Urgency
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
                  marginBottom: 10, fontFamily: "var(--font-display)" }}>
                  {offer.offer_title || offer.merchant || "Special Offer"}
                </h2>

                {/* Description */}
                {offer.description && (
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
                    {offer.description}
                  </p>
                )}

                {/* Discount code */}
                {offer.discount_code && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px",
                      borderRadius: "var(--radius-sm)", background: "rgba(124,127,255,0.1)",
                      border: "1px dashed rgba(124,127,255,0.35)" }}>
                      <Tag size={15} color="var(--accent-primary)" />
                      <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "0.1em",
                        fontFamily: "monospace", color: "var(--accent-primary)" }}>
                        {offer.discount_code}
                      </span>
                    </div>
                    <button onClick={copyCode} className="btn-secondary"
                      style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 16px", flexShrink: 0 }}>
                      {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}

                {/* CTA */}
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button className="btn-primary" style={{ flex: 1 }}>
                    {offer.cta_text || "Claim Offer"}
                  </button>
                  <button className="btn-secondary" onClick={() => { setOffer(null); setIntent(""); setGeoZone(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Repeat2 size={15} /> Search Again
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && !offer && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
          <Sparkles size={36} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: 14 }}>Enter your intent and location to discover AI-powered offers.</p>
        </motion.div>
      )}
    </div>
  );
}

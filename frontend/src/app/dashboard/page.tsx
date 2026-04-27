"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet, TrendingUp, MapPin, Sparkles, ArrowUpRight,
  Clock, Target, Zap, Activity, ChevronRight, BarChart3,
} from "lucide-react";
import api from "@/lib/api";

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

interface DashboardData {
  role: string;
  email: string;
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  useEffect(() => {
    const token = (session as any)?.idToken;
    if (!token) return;
    api.get("/me").then((r) => setDashData(r.data)).catch(console.error);
  }, [session]);

  const stats = [
    { label: "Active Offers",   value: "12",   change: "+3 today",         icon: <Sparkles size={19} />, color: "#7c7fff", bg: "rgba(124,127,255,0.12)" },
    { label: "Nearby Deals",    value: "8",    change: "within 500m",      icon: <MapPin size={19} />,   color: "#22d3a4", bg: "rgba(34,211,164,0.12)"  },
    { label: "Total Savings",   value: "€47",  change: "+€12 this week",   icon: <TrendingUp size={19} />, color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    { label: "Wallet Balance",  value: "€230", change: "5 linked cards",   icon: <Wallet size={19} />,   color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
  ];

  const recentOffers = [
    { merchant: "Café Bohème",   discount: "20% off Flat White",  context: "Rainy day boost",  time: "2m ago",  color: "#7c7fff", code: "RAIN-W20" },
    { merchant: "Urban Bites",   discount: "Buy 1 Get 1 Burger",  context: "Lunch hour deal",  time: "15m ago", color: "#22d3a4", code: "LUNCH-B1G1" },
    { merchant: "TechZone",      discount: "15% off Accessories", context: "Weekend special",  time: "1h ago",  color: "#fbbf24", code: "WKND-T15" },
  ];

  const activityData = [65, 45, 80, 55, 90, 72, 88];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const peak = Math.max(...activityData);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, fontWeight: 500 }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6, fontFamily: "var(--font-display)" }}>
          Welcome back, <span className="gradient-text">{firstName}</span> 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          {dashData?.role === "merchant"
            ? "Your offers are live. Track performance and update configurations below."
            : "Here's what's happening with your offers today."}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeIn}
            className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: stat.bg,
                display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: 11, color: stat.color, fontWeight: 600,
                background: `${stat.color}18`, padding: "3px 8px", borderRadius: 20 }}>
                {stat.change}
              </div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4, fontFamily: "var(--font-display)" }}>
              {stat.value}
            </p>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, marginBottom: 24 }}>
        {/* Recent Offers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "var(--font-display)" }}>
              Recent Offers
            </h2>
            <a href="/dashboard/discover" style={{
              fontSize: 12.5, color: "var(--accent-primary)", textDecoration: "none",
              fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
            }}>
              See all <ChevronRight size={14} />
            </a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentOffers.map((offer, i) => (
              <motion.div key={offer.merchant} custom={i + 4} initial="hidden" animate="visible" variants={fadeIn}
                className="offer-card">
                <div className="offer-card-accent" style={{ background: offer.color }} />
                <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: `${offer.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Target size={21} color={offer.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{offer.merchant}</h3>
                    <p style={{ fontSize: 13, color: offer.color, fontWeight: 600 }}>{offer.discount}</p>
                    <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{offer.context}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 11 }}>
                      <Clock size={11} />{offer.time}
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: offer.color,
                      background: `${offer.color}15`, padding: "2px 7px", borderRadius: 5, fontWeight: 700 }}>
                      {offer.code}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
          className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <BarChart3 size={16} color="var(--accent-primary)" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Weekly Activity</h3>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginBottom: 8 }}>
            {activityData.map((val, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / peak) * 100}%` }}
                  transition={{ delay: 0.6 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                  style={{
                    width: "100%", minHeight: 4, borderRadius: 5,
                    background: i === 4 ? "var(--accent-gradient)" : "rgba(124,127,255,0.2)",
                    position: "relative", cursor: "pointer",
                  }}
                  title={`${val} offers`}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            {days.map((d, i) => (
              <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: i === 4 ? "var(--accent-primary)" : "var(--text-muted)", fontWeight: i === 4 ? 700 : 400 }}>
                {d}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: "var(--radius-sm)", background: "rgba(124,127,255,0.07)", border: "1px solid rgba(124,127,255,0.14)" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Peak day this week</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>Friday</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>90 offers matched</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16, fontFamily: "var(--font-display)" }}>
          Quick Actions
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <a href="/dashboard/discover" className="glass-card" style={{ padding: 22, textDecoration: "none", color: "inherit",
            display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(124,127,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={22} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>Find Offers</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Discover deals near you</p>
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" style={{ marginLeft: "auto" }} />
          </a>
          <a href="/dashboard/profile" className="glass-card" style={{ padding: 22, textDecoration: "none", color: "inherit",
            display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(34,211,164,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={22} color="var(--success)" />
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>Account Status</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>View profile & settings</p>
            </div>
            <ArrowUpRight size={16} color="var(--text-muted)" style={{ marginLeft: "auto" }} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}

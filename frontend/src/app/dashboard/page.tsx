"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Clock,
  Target,
  Zap,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

export default function DashboardOverview() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const stats = [
    {
      label: "Active Offers",
      value: "12",
      change: "+3 today",
      icon: <Sparkles size={20} />,
      color: "#6366f1",
    },
    {
      label: "Nearby Deals",
      value: "8",
      change: "500m radius",
      icon: <MapPin size={20} />,
      color: "#10b981",
    },
    {
      label: "Savings",
      value: "€47",
      change: "+€12 this week",
      icon: <TrendingUp size={20} />,
      color: "#f59e0b",
    },
    {
      label: "Wallet Balance",
      value: "€230",
      change: "5 cards",
      icon: <Wallet size={20} />,
      color: "#8b5cf6",
    },
  ];

  const recentOffers = [
    {
      merchant: "Café Bohème",
      discount: "20% off Flat White",
      context: "Rainy day special",
      time: "2 min ago",
      color: "#6366f1",
    },
    {
      merchant: "Urban Bites",
      discount: "Buy 1 Get 1 Burger",
      context: "Lunch hour deal",
      time: "15 min ago",
      color: "#10b981",
    },
    {
      merchant: "TechZone",
      discount: "15% off Accessories",
      context: "Weekend offer",
      time: "1 hr ago",
      color: "#f59e0b",
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
          Welcome back, <span className="gradient-text">{firstName}</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Here&apos;s what&apos;s happening with your offers today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: 32 }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="glass-card"
            style={{ padding: 24 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${stat.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <ArrowUpRight size={16} color="var(--text-muted)" />
            </div>
            <p
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: 4,
              }}
            >
              {stat.value}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {stat.label}
            </p>
            <p
              style={{
                fontSize: 12,
                color: stat.color,
                marginTop: 8,
                fontWeight: 500,
              }}
            >
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Offers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Recent Offers
          </h2>
          <a
            href="/dashboard/discover"
            style={{
              fontSize: 13,
              color: "var(--accent-primary)",
              textDecoration: "none",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View all <ArrowUpRight size={14} />
          </a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recentOffers.map((offer, i) => (
            <motion.div
              key={offer.merchant}
              custom={i + 4}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="offer-card"
            >
              <div className="offer-card-accent" />
              <div
                style={{
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${offer.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Target size={22} color={offer.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {offer.merchant}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: offer.color,
                      fontWeight: 600,
                    }}
                  >
                    {offer.discount}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {offer.context}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    color: "var(--text-muted)",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  <Clock size={12} />
                  {offer.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <a
          href="/dashboard/discover"
          className="glass-card"
          style={{
            padding: 24,
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(99,102,241,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={22} color="var(--accent-primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
              Find Offers
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Discover deals near you
            </p>
          </div>
        </a>
        <a
          href="/dashboard/merchant"
          className="glass-card"
          style={{
            padding: 24,
            textDecoration: "none",
            color: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(16,185,129,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Store size={22} color="var(--success)" />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
              Merchant Panel
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Configure your offers
            </p>
          </div>
        </a>
      </motion.div>
    </div>
  );
}

function Store(props: { size: number; color: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
      <path d="M18 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
      <path d="M14 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
      <path d="M10 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
      <path d="M6 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

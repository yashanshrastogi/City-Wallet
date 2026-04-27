"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Wallet,
  LayoutDashboard,
  Search,
  Store,
  User,
  LogOut,
  Settings,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

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
        <div className="animate-pulse-glow" style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          background: "var(--accent-gradient)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Wallet size={28} color="white" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  const navItems = [
    { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Overview" },
    { href: "/dashboard/discover", icon: <Search size={18} />, label: "Discover Offers" },
    { href: "/dashboard/merchant", icon: <Store size={18} />, label: "Merchant Panel" },
    { href: "/dashboard/profile", icon: <User size={18} />, label: "Profile" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Wallet size={20} color="white" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                City <span className="gradient-text">Wallet</span>
              </h2>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                AI-Powered Offers
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "16px 0", flex: 1 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              padding: "0 32px",
              marginBottom: 12,
            }}
          >
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                style={{ position: "relative" }}
              >
                {item.icon}
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* User */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--accent-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {session.user?.name?.[0] || "U"}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {session.user?.name || "User"}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {session.user?.email}
              </p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--danger)";
              e.currentTarget.style.color = "var(--danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">{children}</main>
    </div>
  );
}

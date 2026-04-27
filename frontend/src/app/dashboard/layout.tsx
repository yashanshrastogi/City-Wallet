"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  LayoutDashboard,
  Search,
  Store,
  User,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status !== "authenticated") return;

    // FIX: was using session.accessToken (Google OAuth token)
    // Backend verifies Google ID tokens — must use session.idToken
    const token = (session as any)?.idToken;
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.role && pathname !== "/dashboard/role-select") {
          router.push("/dashboard/role-select");
        } else {
          setRole(data.role);
        }
      })
      .catch((err) => console.error("Role fetch error:", err))
      .finally(() => setRoleLoading(false));
  }, [status, session, pathname, router]);

  if (status === "loading" || (status === "authenticated" && roleLoading)) {
    return (
      <div className="fullscreen-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="loader-ring"
        />
      </div>
    );
  }

  if (!session) return null;

  if (pathname === "/dashboard/role-select") {
    return <main style={{ width: "100%", minHeight: "100vh" }}>{children}</main>;
  }

  const allNavItems = [
    { href: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Overview", roles: ["user", "merchant"] },
    { href: "/dashboard/discover", icon: <Search size={18} />, label: "Discover Offers", roles: ["user"] },
    { href: "/dashboard/merchant", icon: <Store size={18} />, label: "Merchant Panel", roles: ["merchant"] },
    { href: "/dashboard/profile", icon: <User size={18} />, label: "Profile", roles: ["user", "merchant"] },
  ];

  const navItems = allNavItems.filter((item) => role && item.roles.includes(role));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
              zIndex: 40, display: "none",
            }}
            className="mobile-overlay"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Wallet size={20} color="white" />
          </div>
          <div>
            <h2 className="logo-text">
              City <span className="gradient-text">Wallet</span>
            </h2>
            <p className="logo-sub">AI-Powered Offers</p>
          </div>
        </div>

        {/* Role badge */}
        {role && (
          <div className="role-badge-wrap">
            <span className={`role-badge role-badge-${role}`}>
              <Zap size={11} />
              {role === "merchant" ? "Merchant" : "Customer"}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ padding: "8px 0", flex: 1 }}>
          <p className="nav-label">Navigation</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {isActive && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />}
              </a>
            );
          })}
        </nav>

        {/* User section */}
        <div className="sidebar-user">
          <div className="user-info">
            {session.user?.image ? (
              <img src={session.user.image} alt="avatar" className="user-avatar" />
            ) : (
              <div className="user-avatar-fallback">
                {session.user?.name?.[0] || "U"}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="user-name">{session.user?.name || "User"}</p>
              <p className="user-email">{session.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="signout-btn"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Mobile header */}
        <div className="mobile-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hamburger">
            <span /><span /><span />
          </button>
          <span className="gradient-text" style={{ fontWeight: 700 }}>City Wallet</span>
          {session.user?.image && (
            <img src={session.user.image} alt="avatar" style={{ width: 32, height: 32, borderRadius: 8 }} />
          )}
        </div>
        {children}
      </main>
    </div>
  );
}

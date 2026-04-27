"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const logout = () => {
    signOut({ callbackUrl: "/" });
  };

  const requireAuth = () => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  };

  return {
    user: session?.user,
    token: session?.accessToken,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    logout,
    requireAuth,
  };
}

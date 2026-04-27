"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function GoogleLogin() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await signIn("google", {
      callbackUrl: "/dashboard/customer",
    });
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
    >
      {loading ? "Signing in..." : "Sign in with Google"}
    </button>
  );
}

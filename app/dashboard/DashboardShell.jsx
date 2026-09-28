"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/dashboard/Sidebar";

function Guard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/dashboard/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/dashboard/login");
    }
  }, [loading, user, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-ivory text-sm text-charcoal/60">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-warm-ivory">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10">{children}</main>
    </div>
  );
}

export default function DashboardShell({ children }) {
  return (
    <AuthProvider>
      <Guard>{children}</Guard>
    </AuthProvider>
  );
}
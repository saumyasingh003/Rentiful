"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

import { useGetAuthUserQuery } from "../state/api";
import { NAVBAR_HEIGHT } from "../lib/constants";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [layoutLoading, setLayoutLoading] = useState(true);
  console.log("auth info :", authUser)

  /* ================= Role-based redirect ================= */
  useEffect(() => {
    if (!authUser) return;

    const userRole = authUser.userRole?.toLowerCase();

    if (
      (userRole === "manager" && pathname.startsWith("/tenants")) ||
      (userRole === "tenant" && pathname.startsWith("/managers"))
    ) {
      router.push(
        userRole === "manager"
          ? "/managers/properties"
          : "/tenants/favorites",
        { scroll: false }
      );
      return;
    }

    setLayoutLoading(false);
  }, [authUser, pathname, router]);

  /* ================= Loading ================= */
  if (authLoading || layoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!authUser?.userRole) return null;

  /* ================= Layout ================= */
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen w-full bg-transparent  flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Content below navbar */}
        <div
          className="flex flex-1 w-full"
          style={{ marginTop: `${NAVBAR_HEIGHT}px` }}
        >
          {/* Sidebar */}
          <AppSidebar userType={authUser.userRole.toLowerCase()} />

          {/* Main Content */}
          <main className="flex-1 w-full  ml-66   overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

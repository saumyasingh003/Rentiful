'use client';
import Navbar from "@/components/Navbar";
import React from "react";
import { useGetAuthUserQuery } from "../state/api";


const Layout = ({ children }: { children: React.ReactNode }) => {
  const {data : authUser} = useGetAuthUserQuery();
  console.log("user-data" , authUser);
  console.log(" userinfo:", authUser?.userInfo);
  
  return (
    <div className="min-h-screen ">
      <Navbar />
      <main className="flex w-full flex-col pt-[var(--navbar-height)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;

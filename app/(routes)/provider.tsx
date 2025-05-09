"use client";
import React from "react";
import AppHeader from "../_components/AppHeader";

function DashboardProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default DashboardProvider;

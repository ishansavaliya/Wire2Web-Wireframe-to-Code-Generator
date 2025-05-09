"use client";
import { AuthContext } from "@/context/AuthContext";
import React, { useContext } from "react";

interface AuthContextType {
  user: any | null;
}

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set a default null user, no authentication required
  const user = null;

  return (
    <AuthContext.Provider value={{ user }}>
      <div>{children}</div>
    </AuthContext.Provider>
  );
}

// Custom hook to use auth
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default Provider;

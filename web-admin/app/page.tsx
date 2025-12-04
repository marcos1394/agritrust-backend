"use client";

import { useUser } from "@clerk/nextjs";
import DashboardHome from "../components/DashboardHome"; // Tu Dashboard viejo
import LandingPage from "../components/LandingPage";     // Tu Landing nueva
import { Loader2 } from "lucide-react";

export default function Page() {
  const { isSignedIn, isLoaded } = useUser();

  // 1. Cargando estado de Clerk
  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  // 2. Si está logueado -> DASHBOARD
  if (isSignedIn) {
    return <DashboardHome />;
  }

  // 3. Si NO está logueado -> LANDING PAGE
  return <LandingPage />;
}
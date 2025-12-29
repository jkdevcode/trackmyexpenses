import React from "react";

import { LandingHeader } from "@/features/landing/components/LandingHeader";
import { LandingFooter } from "@/features/landing/components/LandingFooter";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-grow">{children}</main>
      <LandingFooter />
    </div>
  );
}

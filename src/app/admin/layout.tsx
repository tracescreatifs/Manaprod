import type { ReactNode } from "react";
import type { Metadata } from "next";

// Dashboard : jamais indexé (cahier 10), jamais mis en cache (proxy et
// lectures de session, toujours dynamiques).
export const metadata: Metadata = {
  title: "Dashboard | MANA PROD",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}

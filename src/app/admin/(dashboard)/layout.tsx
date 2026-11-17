import { Suspense, type ReactNode } from "react";
import { AdminBar } from "@/components/admin/admin-bar";
import { AdminNav, AdminNavFallback } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/auth";

// Coquille du dashboard (prototype .adm). La session est lue dans une
// frontière Suspense : la page reste dynamique, jamais mise en cache.
async function SignedInBar() {
  const { user } = await requireAdmin();
  return <AdminBar email={user.email ?? null} />;
}

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col bg-bg">
      <Suspense fallback={<AdminBar email={null} />}>
        <SignedInBar />
      </Suspense>
      <div className="grid flex-1 grid-cols-1 min-[1000px]:grid-cols-[230px_minmax(0,1fr)]">
        <Suspense fallback={<AdminNavFallback />}>
          <AdminNav />
        </Suspense>
        <main id="contenu" tabIndex={-1} className="min-w-0 px-[clamp(20px,4vw,64px)] py-[clamp(24px,4vw,56px)] outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

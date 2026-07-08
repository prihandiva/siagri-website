import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="layout-wrapper">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <main className="page-content animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

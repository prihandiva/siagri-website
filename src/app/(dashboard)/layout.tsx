import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
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
      <DashboardWrapper>
        {children}
      </DashboardWrapper>
    </SessionProvider>
  );
}

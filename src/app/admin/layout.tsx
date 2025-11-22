import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminHeader from "./components/AdminHeader";
import SessionProvider from "./components/SessionProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <SessionProvider>
      <div className="-mt-24 min-h-screen bg-gray-50">
        <AdminHeader userEmail={session?.user?.email || "Admin"} />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </SessionProvider>
  );
}

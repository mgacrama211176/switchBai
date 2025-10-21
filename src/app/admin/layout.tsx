import AdminHeader from "./components/AdminHeader";
import SessionProvider from "./components/SessionProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout without session check - protection happens at page level
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </SessionProvider>
  );
}

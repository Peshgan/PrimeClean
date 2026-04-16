import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Панель администратора — PrimeClean",
  robots: "noindex, nofollow",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, sans-serif" }}>
      {children}
    </div>
  );
}

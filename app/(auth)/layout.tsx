import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceder",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Gradient de fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-[30%] -right-[10%] h-[500px] w-[500px] rounded-full bg-accent/5 blur-[100px]" />
      </div>
      {children}
    </div>
  );
}

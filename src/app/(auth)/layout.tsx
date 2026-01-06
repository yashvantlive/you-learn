import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - YouLearn",
  description: "Secure student access",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      {/* यह सिर्फ एक Wrapper है, यहाँ कोई Logic नहीं होगा */}
      {children}
    </div>
  );
}
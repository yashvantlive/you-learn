import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | YouLearn",
    default: "Authentication | YouLearn", // Fallback title
  },
  description: "Secure student access portal for YouLearn. Login to continue your learning journey.",
  keywords: ["YouLearn", "Student Login", "Exam Prep", "Auth"],
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ✅ FIX: Remove 'flex' & 'min-h-screen' from here because the Page component 
    // already handles the full-screen layout. This prevents layout conflicts.
    <div className="w-full h-full bg-slate-50 antialiased">
      {children}
    </div>
  );
}
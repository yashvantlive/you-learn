import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors">
            <ArrowLeft size={20} /> Back to Login
          </Link>
          <span className="text-sm font-bold text-slate-400">Last Updated: January 2026</span>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 space-y-8">
          <div className="space-y-4 border-b border-slate-100 pb-8">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
              <Shield size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Privacy Policy</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              At YouLearn, we value your trust. This policy outlines how we protect your data in accordance with the Digital Personal Data Protection Act (DPDP) 2023 and global standards.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-violet-500" /> 1. Data We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Identity Data:</strong> Name, email address, and profile picture provided via Google Login.</li>
              <li><strong>Academic Data:</strong> Class, board, subjects, and quiz performance history to personalize your learning.</li>
              <li><strong>Device Data:</strong> IP address and browser type for security and session management.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-500" /> 2. How We Use Your Data
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Your data is used solely to enhance your educational experience:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>To create and manage your unique learning profile.</li>
              <li>To generate personalized quizzes and AI-driven recommendations.</li>
              <li>To maintain the integrity of our Battle Mode and leaderboards.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">3. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We employ industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Your Google account credentials are never stored on our servers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">4. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed">
              You have the right to request access to your data, correction of inaccuracies, or complete deletion of your account ("Right to be Forgotten"). Contact support to exercise these rights.
            </p>
          </section>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
            <p className="text-slate-600 text-sm">
              Have questions? Contact our Data Protection Officer at <a href="mailto:privacy@youlearn.com" className="text-violet-600 font-bold hover:underline">privacy@youlearn.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import Link from "next/link";
import { ArrowLeft, BookOpen, Gavel, AlertCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors">
            <ArrowLeft size={20} /> Back to Login
          </Link>
          <span className="text-sm font-bold text-slate-400">Effective: January 2026</span>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 space-y-8">
          <div className="space-y-4 border-b border-slate-100 pb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Gavel size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">Terms of Service</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Welcome to YouLearn. By accessing our platform, you agree to these terms, designed to ensure a fair and productive learning environment for all students.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-500" /> 1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 leading-relaxed">
              By logging in with Google, you accept these Terms and our Privacy Policy. If you are under 13, you confirm that you have parental consent to use this platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-violet-500" /> 2. User Conduct
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You agree to use YouLearn solely for educational purposes. The following actions are strictly prohibited and may result in an immediate ban:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Cheating, exploiting bugs, or using bots in Battle Mode.</li>
              <li>Sharing offensive, inappropriate, or harmful content in any interactive areas.</li>
              <li>Attempting to reverse-engineer or disrupt the platform's infrastructure.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">3. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              All quizzes, questions, and learning materials on YouLearn are the intellectual property of YouLearn or its content partners. You may not copy, distribute, or sell any content without explicit permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">4. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              YouLearn is an educational aid and does not guarantee specific exam results. The platform is provided "as is," and we are not liable for any interruptions or data loss, though we strive for 99.9% uptime.
            </p>
          </section>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
            <p className="text-slate-600 text-sm">
              These terms are governed by the laws of India. For legal inquiries, please contact <a href="mailto:legal@youlearn.com" className="text-violet-600 font-bold hover:underline">legal@youlearn.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
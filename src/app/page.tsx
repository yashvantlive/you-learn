"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LandingModal } from "@/components/ui/landing-modal";
import { 
  ArrowRight, Sparkles, ShieldCheck, Zap, 
  BrainCircuit, Users, BookOpen, Trophy, 
  CheckCircle2, ChevronRight, Play
} from "lucide-react";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  
  // Modal State Management
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-violet-100 selection:text-violet-900">
      
      {/* --- 1. HEADER --- */}
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-pink-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} fill="currentColor" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">YouLearn</span>
          </div>

          <nav className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-24 h-10 bg-slate-100 rounded-xl animate-pulse" />
            ) : user ? (
              <Link 
                href="/dashboard"
                className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <Link 
                href="/login"
                className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Student Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-20 space-y-24 md:space-y-32 overflow-hidden">
        
        {/* --- 2. HERO SECTION --- */}
        <section className="relative px-6 max-w-7xl mx-auto text-center">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-200/30 rounded-full blur-[100px] -z-10" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-200/20 rounded-full blur-[80px] -z-10" />

          <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
              v1.0 Now Live for Class 10
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              The Operating System for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600">
                Academic Success.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Stop memorizing blindly. Start learning strategically. 
              YouLearn combines gamification, analytics, and CBSE curriculum into one powerful Student OS.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href={user ? "/dashboard" : "/login"}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-xl text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                {user ? "Launch Dashboard" : "Start Learning Free"} <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => setActiveModal('about')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 font-bold rounded-xl text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Play size={18} className="fill-slate-700" /> How it Works
              </button>
            </div>
          </div>
        </section>

        {/* --- 3. TRUST STRIP --- */}
        <section className="px-6 border-y border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center opacity-80">
            {[
              { label: "Aligned with", val: "CBSE Syllabus" },
              { label: "Trusted by", val: "Top Scholars" },
              { label: "Architecture", val: "Distraction Free" },
              { label: "Platform", val: "100% Secure" },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">{item.label}</p>
                <p className="text-lg font-black text-slate-800">{item.val}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- 4. FEATURES GRID --- */}
        <section className="px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              More than just a quiz app.
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              We redesigned the study experience to keep you in the "Flow State".
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-8 hover:border-violet-300 transition-all group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Solo Focus Mode</h3>
              <p className="text-slate-500 leading-relaxed">
                Chapter-wise deep practice sessions designed to identify your weak spots instantly. 
                No timers, just pure learning.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-8 hover:border-violet-300 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-100 to-transparent rounded-bl-full" />
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform relative z-10">
                <Trophy size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">Battle Royale</h3>
              <p className="text-slate-500 leading-relaxed relative z-10">
                Competition drives excellence. Challenge friends or random opponents in real-time 
                curriculum battles.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-8 hover:border-violet-300 transition-all group">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Analytics</h3>
              <p className="text-slate-500 leading-relaxed">
                We track your accuracy, speed, and topic mastery. Get a visual roadmap of what 
                to study next.
              </p>
            </div>
          </div>
        </section>

        {/* --- 5. BENEFITS SECTION --- */}
        <section className="px-6 max-w-7xl mx-auto">
          <div className="glass-panel bg-slate-900 text-white p-8 md:p-16 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-600 to-pink-600 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/3" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  Designed for the <br /> 
                  <span className="text-violet-400">Modern Student</span>
                </h2>
                <div className="space-y-4">
                  {[
                    "Replace scrolling with scoring.",
                    "Master concepts, don't just memorize.",
                    "Build a resume of achievements.",
                    "Join a community of top rankers."
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="text-green-400 shrink-0" size={20} />
                      <span className="font-medium text-slate-200 text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all"
                  >
                    Join the League <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
              
              <div className="hidden md:block">
                {/* Abstract UI Representation */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center font-bold text-xl">Y</div>
                    <div>
                      <div className="h-4 w-32 bg-white/20 rounded mb-2" />
                      <div className="h-3 w-20 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 w-full bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-16 w-full bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-16 w-full bg-white/20 rounded-xl border-l-4 border-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 6. FOOTER --- */}
        <footer className="px-6 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white">
                    <Sparkles size={12} fill="currentColor" />
                  </div>
                  <span className="font-bold text-slate-900">YouLearn</span>
                </div>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                  Building the future of education by turning study sessions into engaging experiences.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><Link href="/login" className="hover:text-violet-600 transition-colors">Login</Link></li>
                  <li><Link href="/dashboard" className="hover:text-violet-600 transition-colors">Dashboard</Link></li>
                  <li><button onClick={() => setActiveModal('about')} className="hover:text-violet-600 transition-colors">About Us</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><button onClick={() => setActiveModal('privacy')} className="hover:text-violet-600 transition-colors">Privacy Policy</button></li>
                  <li><button onClick={() => setActiveModal('terms')} className="hover:text-violet-600 transition-colors">Terms of Service</button></li>
                  <li><button onClick={() => setActiveModal('contact')} className="hover:text-violet-600 transition-colors">Contact Support</button></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} YouLearn Education. All rights reserved. Made with ❤️ in India.
            </div>
          </div>
        </footer>
      </main>

      {/* --- MODALS --- */}
      
      <LandingModal 
        isOpen={activeModal === 'about'} 
        onClose={closeModal} 
        title="About YouLearn"
      >
        <p>YouLearn is an initiative to modernize education for CBSE students. We believe that learning shouldn't be a chore—it should be an experience.</p>
        <p>Our mission is to create a "Student OS" that combines the best aspects of gaming, productivity, and structured curriculum to help students perform better with less stress.</p>
        <p className="font-bold text-slate-800">Why we exist:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>To remove the fear of exams.</li>
          <li>To make practice habit-forming.</li>
          <li>To provide data-driven insights to parents and students.</li>
        </ul>
      </LandingModal>

      <LandingModal 
        isOpen={activeModal === 'contact'} 
        onClose={closeModal} 
        title="Contact Support"
      >
        <p>Need help? We are here for you.</p>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
          <p className="font-bold text-slate-900">Email Us</p>
          <a href="mailto:support@youlearn.in" className="text-violet-600 hover:underline">support@youlearn.in</a>
        </div>
        <p className="mt-4 text-xs text-slate-400">Our support team usually responds within 24 hours.</p>
      </LandingModal>

      <LandingModal 
        isOpen={activeModal === 'privacy'} 
        onClose={closeModal} 
        title="Privacy Policy"
      >
        <p><strong>Last Updated: January 2026</strong></p>
        <p>At YouLearn, we take your privacy seriously. This simplified policy explains how we handle your data.</p>
        <h4 className="font-bold text-slate-800 mt-4">1. Data Collection</h4>
        <p>We collect basic profile information (name, email via Google Auth) and your learning progress (quiz scores, streaks).</p>
        <h4 className="font-bold text-slate-800 mt-4">2. Data Usage</h4>
        <p>We use your data solely to personalize your learning experience and generate performance reports. We do NOT sell your data to third parties.</p>
      </LandingModal>

      <LandingModal 
        isOpen={activeModal === 'terms'} 
        onClose={closeModal} 
        title="Terms of Service"
      >
        <p>By using YouLearn, you agree to become a part of a respectful learning community.</p>
        <h4 className="font-bold text-slate-800 mt-4">Code of Conduct</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Do not cheat during Multiplayer Battles.</li>
          <li>Respect other students in the community.</li>
          <li>Do not attempt to hack or disrupt the platform services.</li>
        </ul>
        <p className="mt-4">Violation of these terms may result in account suspension.</p>
      </LandingModal>

    </div>
  );
}
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic"; // ✅ 1. Import dynamic
import {
  Upload,
  Edit3,
  BarChart3,
  PenTool,
  Shield,
  ChevronRight,
  FolderOpen,
  Loader2 // ✅ Import Loader
} from "lucide-react";

import AdminDashboard from "./_components/AdminDashboard"; // Keep Dashboard static (renders first)

// ✅ 2. Optimize heavy components with Dynamic Imports
const QuestionBankExplorer = dynamic(() => import("./_components/QuestionBankExplorer"), {
  loading: () => <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>,
});

const BulkUploader = dynamic(() => import("./_components/BulkUploader"), {
  loading: () => <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>,
});

const ManualUpload = dynamic(() => import("./_components/ManualUpload"), {
  loading: () => <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>,
});

const EditQuestion = dynamic(() => import("./_components/EditQuestion"), {
  loading: () => <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>,
});

type Section = "dashboard" | "bulk" | "manual" | "edit" | "explorer";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");

  const sections = [
    {
      id: "dashboard" as Section,
      title: "Dashboard",
      description: "Overview & Analytics",
      icon: BarChart3,
      color: "from-violet-500 to-purple-600",
      bgColor: "from-violet-50 to-purple-50",
    },
    {
      id: "explorer" as Section,
      title: "File Explorer",
      description: "Folder View Manager",
      icon: FolderOpen,
      color: "from-cyan-500 to-blue-600",
      bgColor: "from-cyan-50 to-blue-50",
    },
    {
      id: "bulk" as Section,
      title: "Bulk Upload",
      description: "JSON File Import",
      icon: Upload,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
    },
    {
      id: "manual" as Section,
      title: "Manual Upload",
      description: "Add One Question",
      icon: PenTool,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
    },
    {
      id: "edit" as Section,
      title: "Edit Questions",
      description: "Search & Delete",
      icon: Edit3,
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50",
    },
  ];

  const currentSection = sections.find((s) => s.id === activeSection)!;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                <Shield className="w-7 h-7 text-white" />
              </div>
              Admin Panel
            </h1>
            <p className="text-slate-500 font-medium text-lg mt-2">
              Manage your question bank efficiently
            </p>
          </div>

          {/* Active Section Badge */}
          <div className={`px-6 py-3 bg-gradient-to-r ${currentSection.color} text-white rounded-xl font-bold shadow-lg flex items-center gap-2`}>
            <currentSection.icon className="w-5 h-5" />
            {currentSection.title}
          </div>
        </motion.div>

        {/* Section Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(section.id)}
              className={`glass-panel p-6 text-left transition-all ${
                activeSection === section.id
                  ? `bg-gradient-to-br ${section.bgColor} border-2 shadow-xl`
                  : "hover:shadow-lg"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-r ${section.color} ${
                  activeSection === section.id ? "shadow-lg" : "opacity-70"
                }`}
              >
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-slate-900 mb-1 flex items-center justify-between text-sm md:text-base">
                {section.title}
                {activeSection === section.id && (
                  <ChevronRight className="w-4 h-4 text-violet-600" />
                )}
              </h3>
              <p className="text-xs text-slate-600 font-medium line-clamp-1">
                {section.description}
              </p>
            </motion.button>
          ))}
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === "dashboard" && <AdminDashboard />}
            {activeSection === "explorer" && <QuestionBankExplorer />}
            {activeSection === "bulk" && <BulkUploader />}
            {activeSection === "manual" && <ManualUpload />}
            {activeSection === "edit" && <EditQuestion />}
          </motion.div>
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200"
        >
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-bold text-slate-900 mb-2">📊 Dashboard</h4>
              <p className="text-slate-600">
                View comprehensive analytics of your question bank.
              </p>
            </div>
             <div>
              <h4 className="font-bold text-slate-900 mb-2">📂 File Explorer</h4>
              <p className="text-slate-600">
                Navigate folders and edit JSON directly like a pro.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-2">⚡ Bulk Upload</h4>
              <p className="text-slate-600">
                Upload hundreds of questions at once using JSON files.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-2">✏️ Edit & Manage</h4>
              <p className="text-slate-600">
                Search and delete individual questions with filters.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Copy, Check, Headphones, X, ExternalLink, Clock } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function SupportModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [copied, setCopied] = useState(false);

  const supportEmail = 'support@zerofx.club';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (activeModal !== 'support') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          onClick={closeModal}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-[0_25px_70px_rgba(99,102,241,0.2)] overflow-hidden p-6 sm:p-8 z-10"
        >
          {/* Top gradient highlight */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4">
              <Headphones className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              Customer Support
            </h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              We are here to assist you 24/7 with any inquiries, deposits, or trading questions.
            </p>
          </div>

          {/* Support Email Card */}
          <div className="mt-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Official Support Email
            </span>

            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
                <span className="font-bold text-slate-800 text-sm sm:text-base truncate select-all">
                  {supportEmail}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 24/7 Status Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Average response time: <strong className="text-emerald-600 font-bold">10–15 mins</strong></span>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:${supportEmail}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email Now</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            <button
              onClick={closeModal}
              className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

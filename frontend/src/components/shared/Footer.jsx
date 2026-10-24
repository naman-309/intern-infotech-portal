import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, MapPin, Phone, Mail, Shield, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { DevBadge, DevCreditsModal } from './DevCreditsModal';

export const Footer = () => {
  const [creditsOpen, setCreditsOpen] = useState(false);
  return (
    <footer className="relative bg-[#05070D] border-t border-white/10 text-slate-400 text-sm overflow-hidden">
      {/* Specular Inner Top Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[180px] bg-indigo-600/[0.04] blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institute Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 border border-white/20">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                INTERN <span className="bg-gradient-to-r from-indigo-400 to-sky-300 bg-clip-text text-transparent">INFOTECH</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An elite offline software engineering academy training top engineers, system architects, and distributed cloud builders through rigorous laboratory projects.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Admissions Open for 2026 Cohorts
            </div>
          </div>

          {/* Col 2: Academic Programs */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-200 tracking-wider mb-4 font-mono">
              Core Programs
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Full-Stack Software Engineering
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Distributed Systems & Architecture
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Advanced Data Structures & Algorithms
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  DevOps, SRE & Container Systems
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Access */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-200 tracking-wider mb-4 font-mono">
              Portal Access
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Faculty & Teacher Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Administration Gateway
                </Link>
              </li>
              <li>
                <Link to="/register-student" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Request Admission
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Offline Campus Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-200 tracking-wider mb-4 font-mono">
              Offline Campus
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>402 Tech Hub, IT Corridor, Electronic City, Bengaluru 560100</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>admissions@interninfotech.edu</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Intern Infotech Academy. All rights reserved. In-person pedagogy.</p>
          <div className="flex items-center gap-6">
            <DevBadge onClick={() => setCreditsOpen(true)} />
            <Link to="/about" className="hover:text-slate-300 transition-colors">Pedagogy</Link>
            <Link to="/courses" className="hover:text-slate-300 transition-colors">Curriculum</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Campus Inquiries</Link>
          </div>
        </div>
      </div>
      <DevCreditsModal isOpen={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </footer>
  );
};

export default Footer;

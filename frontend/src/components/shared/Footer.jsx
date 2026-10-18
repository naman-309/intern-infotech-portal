import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { MapPin, Phone, Mail, Shield, BookOpen, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institute Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <Logo textClassName="text-lg" isDark={true} />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              An elite offline software engineering institute training top engineers, system architects, and distributed cloud builders through rigorous laboratory projects.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Admissions Open for 2026 Offline Cohorts
            </div>
          </div>

          {/* Col 2: Academic Programs */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-slate-200 tracking-wider mb-4 font-mono">
              Core Programs
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="/#courses" className="hover:text-slate-200 transition-colors">
                  Full-Stack Software Engineering
                </a>
              </li>
              <li>
                <a href="/#courses" className="hover:text-slate-200 transition-colors">
                  Distributed Systems & Architecture
                </a>
              </li>
              <li>
                <a href="/#courses" className="hover:text-slate-200 transition-colors">
                  Advanced Data Structures & Algorithms
                </a>
              </li>
              <li>
                <a href="/#courses" className="hover:text-slate-200 transition-colors">
                  DevOps, SRE & Container Systems
                </a>
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
                <Link to="/login" className="hover:text-slate-200 transition-colors">
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-slate-200 transition-colors">
                  Faculty & Teacher Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-slate-200 transition-colors">
                  Administration Gateway
                </Link>
              </li>
              <li>
                <Link to="/register-student" className="hover:text-slate-200 transition-colors text-indigo-400">
                  Verify Offline Enrollment
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
                <span>admissions@infotech-academy.edu</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Intern Infotech Institute. Offline technical education. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Non-guarantee transparent placement policy</span>
            <span>Accredited offline laboratories</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { MapPin, Phone, Mail, Shield, BookOpen, ExternalLink, Code2, Sparkles, Terminal } from 'lucide-react';
import { DevBadge, DevCreditsModal } from './DevCreditsModal';

export const Footer = () => {
  const [creditsOpen, setCreditsOpen] = useState(false);

  return (
    <>
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
                Campus Hours: 7:00 AM – 7:00 PM Open Daily
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
                    Full Stack Development (8 Months)
                  </a>
                </li>
                <li>
                  <a href="/#courses" className="hover:text-slate-200 transition-colors">
                    DevOps & Cloud Engineering (7 Months)
                  </a>
                </li>
                <li>
                  <a href="/#courses" className="hover:text-slate-200 transition-colors">
                    DSA & Systems Engineering (6 Months)
                  </a>
                </li>
                <li>
                  <a href="/#courses" className="hover:text-slate-200 transition-colors">
                    Cybersecurity & Defense (6 Months)
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
                  <Link to="/register-student" className="hover:text-slate-200 transition-colors text-sky-400">
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
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">404, 4th Floor, Vibrant Business Tower, Geeta Bhawan Square, 9A/9B Manoromaganj, A.B. Road, Indore, MP 452001</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <a href="tel:+919826064440" className="hover:text-white transition-colors">+91 98260 64440</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>admissions@infotech-academy.edu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar with dev@nkkr Branding */}
          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p>&copy; {new Date().getFullYear()} Intern Infotech Institute. Offline technical education.</p>
              <span className="hidden sm:inline text-slate-700">•</span>
              <span className="text-slate-500">Operating Hours: 7:00 AM – 7:00 PM</span>
            </div>

            {/* Prominent dev@nkkr Signature Flex */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCreditsOpen(true)}
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/80 transition-all cursor-pointer text-slate-300 hover:text-white"
              >
                <Code2 className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-6 transition-transform" />
                <span className="text-[11px] font-mono">
                  Built & Architected by <strong className="text-sky-300 group-hover:text-sky-200">dev@nkkr</strong>
                </span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Easter Egg Modal */}
      <DevCreditsModal isOpen={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { GlassButton, GlassBadge, GlassCard3D } from '../../components/ui';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Building,
  ShieldCheck,
} from 'lucide-react';
import {
  MagneticButton,
  ScrollReveal,
  PageTransition,
  AnimatedBackground,
} from '../../components/motion';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: 'Full-Stack Software Engineering',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Inquiry logged! Our offline admissions desk will contact you to coordinate your visit pass.');
  };

  return (
    <PageTransition className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 border-b border-white/10 overflow-hidden">
        <AnimatedBackground />

        {/* Ambient Glow Beam */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-gradient-to-b from-indigo-500/15 via-cyan-500/5 to-transparent blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal direction="down">
            <GlassBadge variant="primary" className="mb-4">OFFLINE CAMPUS INQUIRIES</GlassBadge>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Visit Our{' '}
              <span className="hologram-text">
                Bengaluru Campus
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Students enroll offline after a personal technical evaluation and campus tour.
              Book your workstation trial pass below.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16 sm:py-20 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Campus Info */}
          <div className="space-y-6">
            <div>
              <GlassBadge variant="info">CAMPUS VISITS & COUNSELING</GlassBadge>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-3">
                Offline Admissions Office
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Walk in for a campus tour or schedule an appointment with an instructor.
              </p>
            </div>

            <div className="space-y-4">
              <GlassCard3D intensity={6} className="p-4 flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Main Campus & Lab Facility</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    402 Tech Hub, IT Corridor, Electronic City, Bengaluru 560100
                  </p>
                </div>
              </GlassCard3D>

              <GlassCard3D intensity={6} className="p-4 flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Admissions Desk Direct Line</h4>
                  <p className="text-xs text-slate-400 mt-1">+91 98765 43210</p>
                </div>
              </GlassCard3D>

              <GlassCard3D intensity={6} className="p-4 flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Email Communications</h4>
                  <p className="text-xs text-slate-400 mt-1">admissions@interninfotech.edu</p>
                </div>
              </GlassCard3D>

              <GlassCard3D intensity={6} className="p-4 flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Campus Laboratory Hours</h4>
                  <p className="text-xs text-slate-400 mt-1">Mon–Sat: 8:00 AM – 8:00 PM IST</p>
                </div>
              </GlassCard3D>
            </div>
          </div>

          {/* Form */}
          <div>
            <GlassCard3D intensity={6} className="p-8">
              <h3 className="text-lg font-bold text-white mb-1">Book an Offline Lab Visit</h3>
              <p className="text-xs text-slate-400 mb-6">
                Fill in your details to schedule a campus tour and lab trial session.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-emerald-300">Appointment Request Confirmed</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Our admissions team has logged your visit request. We will contact you at your provided phone number to confirm your campus workstation entry slot.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number (Required for campus entry pass)
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-10 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Course of Interest</label>
                    <select
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="w-full h-10 px-3.5 py-2 bg-[#080B14] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option>Full-Stack Software Engineering (6 Months)</option>
                      <option>Distributed Systems & Backend Architecture (4 Months)</option>
                      <option>Advanced Data Structures & Algorithms (3 Months)</option>
                      <option>DevOps & Cloud Native Systems (4 Months)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Message or Specific Questions (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your background or scheduled date preference…"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>
                  <MagneticButton className="w-full">
                    <GlassButton type="submit" variant="primary" className="w-full gap-2 mt-2">
                      <Send className="w-4 h-4" />
                      Submit Campus Visit Request
                    </GlassButton>
                  </MagneticButton>
                </form>
              )}
            </GlassCard3D>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default ContactPage;

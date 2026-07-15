import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initMagnetic } from '../lib/hover';

const ROLES = [
  'Student',
  'Journalist',
  'Analyst',
  'Think-tank / researcher',
  'NGO staff',
  'Educator / faculty',
  'Other',
];

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [submitted, setSubmitted] = useState(false);
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cleanupBtn = () => {};
    if (btnRef.current) cleanupBtn = initMagnetic(btnRef.current);

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!containerRef.current) return;
      
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 28, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          }
        }
      );
    });

    return () => {
      mm.revert();
      cleanupBtn();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    // TODO(wire-up): POST { email, role } to the list provider; feeds the
    // 3-email onboarding sequence in talk-to-cash-playbook.md Stage 1.
    setSubmitted(true);
  };

  return (
    <section id="waitlist" className="relative w-full bg-[#05070d] pb-24 md:pb-32 px-6 flex justify-center overflow-hidden">
      {/* Seam: resume from QuoteSection's final color and fade back to base */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #0E3350 0%, #05070d 100%)' }}
      />
      <div ref={containerRef} className="w-full max-w-xl flex flex-col items-center text-center relative pt-40 md:pt-48">
        <h2 className="font-instrument text-3xl md:text-5xl text-white">
          Be reading it <span className="italic">at launch</span>
        </h2>
        <p className="font-inter text-white/60 text-sm md:text-base mt-5 leading-relaxed">
          Join the waitlist and the Daily Brief arrives the day we open. No spam: a short launch sequence and then the brief itself.
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="done"
              role="status"
              aria-live="polite"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="liquid-glass rounded-2xl px-8 py-10 mt-10 w-full"
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="w-8 h-8 mx-auto mb-4"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="11" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
                <motion.path
                  d="M7 12.4 L10.4 15.8 L17 8.6"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: reduced ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.25, ease: 'easeOut' }}
                />
              </motion.svg>
              <p className="font-instrument text-white text-2xl">You&rsquo;re on the list.</p>
              <p className="font-inter text-white/60 text-sm mt-3">
                Watch your inbox: the first note explains what arrives and when.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-col gap-4 w-full font-inter"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                autoComplete="email"
                className="w-full bg-white/5 border border-white/15 rounded-full px-6 py-3.5 text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                aria-label="I am a"
                className="w-full bg-white/5 border border-white/15 rounded-full px-6 py-3.5 text-white text-sm focus:outline-none focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all appearance-none cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-[#05070d] text-white">
                    {r}
                  </option>
                ))}
              </select>
              <button
                ref={btnRef}
                type="submit"
                className="w-full bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow"
              >
                Join the waitlist
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Waitlist;

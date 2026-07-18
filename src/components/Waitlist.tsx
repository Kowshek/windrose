import { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { initMagnetic } from '../lib/hover';
import { StoryContext } from '../lib/scroll';
import BriefArrival from './visuals/BriefArrival';

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
  const story = useContext(StoryContext);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [submitted, setSubmitted] = useState(false);
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const visualInView = useInView(visualRef, { amount: 0.3 });

  useEffect(() => {
    let cleanupBtn = () => {};
    if (btnRef.current) cleanupBtn = initMagnetic(btnRef.current);

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!containerRef.current) return;

      if (story) {
        // Story entrance: copy wipes up out of a blur, then the form controls
        // build in sequence. Children only, so the wrapper stays free for
        // Landing's parallax x and the fit-scale.
        const text = containerRef.current.querySelectorAll('.wl-copy');
        const controls = containerRef.current.querySelectorAll('input, select, button');
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            containerAnimation: story,
            start: "left 82%",
          },
        });
        tl.fromTo(text,
          { opacity: 0, y: 26, filter: 'blur(6px)', clipPath: 'inset(0% 0% 100% 0%)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.1,
          }
        ).fromTo(controls,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.85, ease: "expo.out", stagger: 0.09 },
          0.25
        );
        return;
      }

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
  }, [story]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    // TODO(wire-up): POST { email, role } to the list provider; feeds the
    // 3-email onboarding sequence in talk-to-cash-playbook.md Stage 1.
    setSubmitted(true);
  };

  return (
    <section id="waitlist" className="relative w-full lg:min-h-screen pb-20 md:pb-28 px-6 lg:px-12 flex items-center justify-center overflow-hidden">
      {/* Seam: resume from QuoteSection's final color and fade back to base */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #0E3350 0%, #05070d 100%)' }}
      />
      {/* Split screen: the ask on the left, live radar proof on the right. */}
      <div ref={containerRef} className="w-full max-w-[1400px] relative pt-36 md:pt-44 lg:pt-0 lg:grid lg:grid-cols-[45fr_55fr] lg:gap-x-20 xl:gap-x-28 lg:items-center">
        <div>
          <h2 data-story-fg className="wl-copy font-instrument text-4xl md:text-6xl leading-[1.08] tracking-tight text-white">
            Be reading it <span className="italic">at launch</span>
          </h2>
          <p className="wl-copy font-inter text-white/60 text-sm md:text-base mt-6 leading-relaxed max-w-md">
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
                className="mt-12 max-w-md"
              >
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 mb-4"
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
                className="mt-12 flex flex-col gap-4 w-full max-w-md font-inter"
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
                  className="w-full bg-white text-black px-8 py-4 rounded-full font-medium text-base tracking-wide hover:bg-white/90 active:scale-[0.98] transition-all duration-300 button-glow"
                >
                  Join the waitlist
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden lg:flex justify-center">
          <div ref={visualRef} className="w-full flex justify-center">
            <BriefArrival live={visualInView} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Waitlist;

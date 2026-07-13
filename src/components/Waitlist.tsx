import { useState } from 'react';

const ROLES = ['Student', 'Analyst', 'Journalist', 'Faculty', 'Other'];

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES[0]);
  const [submitted, setSubmitted] = useState(false);

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
      <div className="w-full max-w-xl flex flex-col items-center text-center relative pt-40 md:pt-48">
        <h2 className="font-instrument text-3xl md:text-5xl text-white">
          Be reading it <span className="italic">at launch</span>
        </h2>
        <p className="font-inter text-white/60 text-sm md:text-base mt-5 leading-relaxed">
          Join the waitlist and the Daily Brief arrives the day we open. No spam — a short launch sequence and then the brief itself.
        </p>

        {submitted ? (
          <div className="liquid-glass rounded-2xl px-8 py-10 mt-10 w-full">
            <p className="font-instrument text-white text-2xl">You&rsquo;re on the list.</p>
            <p className="font-inter text-white/60 text-sm mt-3">
              Watch your inbox — the first note explains what arrives, and when.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 w-full font-inter">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="w-full bg-white/5 border border-white/15 rounded-full px-6 py-3.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              aria-label="I am a"
              className="w-full bg-white/5 border border-white/15 rounded-full px-6 py-3.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors appearance-none cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-[#0a0a0c] text-white">
                  {r}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow"
            >
              Join the waitlist
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Waitlist;

import { useState, useEffect, useRef } from 'react';
import { initCardGlow, initMagnetic } from '../lib/hover';

const Pledge = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cleanupCard = () => {};
    let cleanupBtn = () => {};

    if (cardRef.current) cleanupCard = initCardGlow(cardRef.current);
    if (btnRef.current) cleanupBtn = initMagnetic(btnRef.current);

    return () => {
      cleanupCard();
      cleanupBtn();
    };
  }, [isSubmitted]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');

    // TODO(wire-up): tag these signups "founding-pledge", no payment integration yet.
    console.log('Pledge submission:', { email });
    
    setIsSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-[#010A17] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background glow treatments */}
      <div 
        className="absolute top-0 inset-x-0 h-[500px] z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(135,200,245,0.14) 0%, transparent 100%)' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[40px] z-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,230,255,0.05) 0%, transparent 70%)' }}
      />

      {/* Main Content Column */}
      <main className="relative z-10 w-full max-w-xl flex flex-col items-center text-center gap-8 mt-12 mb-12">
        
        {/* Wordmark */}
        <div className="font-instrument italic text-white/80 text-2xl md:text-3xl">
          Windrose
        </div>
        
        {/* Heading */}
        <h1 className="font-instrument text-glow text-3xl md:text-5xl text-white leading-tight max-w-lg">
          Analyst-grade Europe monitoring, <br className="hidden sm:block" />
          <span className="italic">at a student's price.</span>
        </h1>

        {/* Liquid-glass Card */}
        <div ref={cardRef} className="liquid-glass rounded-2xl p-8 md:p-10 w-full flex flex-col gap-6 text-left">
          <div className="text-white/40 text-sm tracking-[0.3em] uppercase">
            Founding tier, first 50 members
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <span className="font-instrument text-5xl md:text-6xl text-white">₹2,999</span>
            <span className="text-white/60 font-inter">/ year · $47 / year international</span>
          </div>

          <p className="font-inter text-white/60 text-sm leading-relaxed">
            Roughly 40% off the launch annual price, locked for life. Daily Brief, weekly assessment, events calendar, and the published methodology, from day one.
          </p>

          <p className="font-inter text-white/35 text-sm leading-relaxed">
            Founding pricing, confirmed at launch. Reserving costs nothing now, with no card or charge until the product is live.
          </p>

          {isSubmitted ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-2 mt-2 animate-fade-in fade-up">
              <h3 className="font-instrument text-2xl text-white">Your spot is reserved.</h3>
              <p className="font-inter text-white/60 text-sm">
                We'll be in touch personally before launch with the founding-member details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-inter mt-2">
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/15 rounded-full px-6 py-3.5 text-white text-sm focus:outline-none focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all"
              />
              <button
                ref={btnRef}
                type="submit"
                className="w-full bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow"
              >
                Reserve my spot
              </button>
            </form>
          )}
        </div>

        {/* Disclaimer */}
        <p className="font-inter text-white/30 text-sm text-center max-w-lg mt-4 leading-relaxed">
          Windrose provides informational analysis for research and education. It is not a duty-of-care, security, or emergency-notification service, and no completeness or real-time guarantee is made.
        </p>

      </main>
    </div>
  );
};

export default Pledge;

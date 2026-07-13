import { useState, useEffect, useRef } from 'react';

const ThreeBeats = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const beats = [
    {
      num: '01',
      title: 'Stop drowning in headlines',
      body: '5–8 items a day, each with what happened, why it matters, and what to watch. The triage is done before you open it.',
    },
    {
      num: '02',
      title: 'See ahead',
      body: 'The events calendar and risk map show what is coming, not just what broke — summits, elections, deadlines, flashpoints.',
    },
    {
      num: '03',
      title: 'Learn the craft',
      body: 'Every brief shows its sourcing and method — the same tradecraft the profession uses, taught as you read.',
    },
  ];

  return (
    <section id="beats" className="relative w-full bg-[#05070d] py-24 md:py-32 px-6 flex justify-center overflow-hidden">
      {/* Atmosphere echo from the hero's earth glow */}
      <div
        className="absolute inset-x-0 top-0 h-[420px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 0%, rgba(120,185,230,0.07), transparent 60%)' }}
      />
      <div className="w-full max-w-6xl flex flex-col items-center relative">
        <h2 className="font-instrument text-3xl md:text-5xl text-center text-white mb-16 max-w-3xl">
          Built for people who read the world for a living<span className="italic"> — or want to.</span>
        </h2>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
          {beats.map((beat, index) => (
            <div
              key={beat.num}
              className={`liquid-glass rounded-2xl p-8 flex flex-col gap-4 text-left transition-all duration-[900ms] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[28px]'
              }`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                transitionDelay: `${index * 140}ms`
              }}
            >
              <div className="text-white/30 text-xs tracking-[0.3em] font-inter">
                {beat.num}
              </div>
              <h3 className="font-instrument text-2xl md:text-3xl text-white">
                {beat.title}
              </h3>
              <p className="font-inter text-white/60 text-sm leading-relaxed">
                {beat.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreeBeats;

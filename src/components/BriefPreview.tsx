import { useState, useEffect, useRef } from 'react';

const BriefPreview = () => {
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

  const blocks = [
    {
      label: 'What happened',
      body: 'Warsaw announced expanded checks at the two remaining Belarus crossings on 12 July, citing renewed instrumentalized-migration activity. Freight transit continues, with reported delays of 9–14 hours.',
    },
    {
      label: 'Why it matters',
      body: 'The move narrows one of the last land corridors for EU–Belarus trade and raises the cost of escalation for Minsk before the August transit talks. Retaliation against Polish hauliers would be consistent with past responses.',
    },
    {
      label: 'Watch next',
      body: 'A Belarusian customs response within 7–10 days; EU Council language on border instrumentalization at the 24 July session.',
    },
  ];

  return (
    <section id="preview" className="relative w-full bg-[#05070d] py-24 md:py-32 px-6 flex justify-center overflow-hidden">
      <div
        className="absolute right-0 top-1/4 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 80% 50%, rgba(135,200,245,0.05), transparent 65%)' }}
      />
      <div ref={ref} className="w-full max-w-3xl flex flex-col items-center relative">
        <p className="font-inter text-white/40 text-xs tracking-[0.3em] uppercase text-center">
          Product preview
        </p>
        <h2 className="font-instrument text-3xl md:text-5xl text-center text-white mt-4">
          One item from the <span className="italic">Daily Brief</span>
        </h2>
        <p className="font-inter text-white/50 text-sm text-center mt-4">
          Sample item, shown in the real format.
        </p>

        <article
          className={`liquid-glass rounded-2xl p-8 md:p-12 mt-12 w-full transition-all duration-[900ms] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[28px]'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: '150ms' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-inter text-white/40 text-xs tracking-wide">Daily Brief · 12 July 2026</span>
            <span className="font-inter text-[11px] tracking-wide text-white/70 border border-white/15 rounded-full px-3 py-1">
              Indicator: border friction — elevated
            </span>
          </div>

          <h3 className="font-instrument text-white text-2xl md:text-3xl leading-snug mt-6">
            Poland tightens Belarus border regime ahead of transit talks
          </h3>

          <div className="mt-8 space-y-7">
            {blocks.map((b) => (
              <div key={b.label}>
                <div className="font-inter text-white/40 text-[11px] tracking-[0.25em] font-semibold uppercase">
                  {b.label}
                </div>
                <p className="font-inter text-white/75 text-sm leading-relaxed mt-2">{b.body}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-8 pt-5">
            <p className="font-inter text-white/35 text-xs leading-relaxed">
              Sources: PAP · Polish MSWiA statement · Belta (state media) — corroboration: two independent, one state.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default BriefPreview;

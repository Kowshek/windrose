import WindroseMark from './visuals/WindroseMark';

const Footer = () => {
  return (
    <footer className="w-full bg-[#03050a] border-t border-white/5 py-12 px-6 flex justify-center text-center">
      <div className="w-full max-w-4xl flex flex-col items-center gap-6">
        <WindroseMark trackCursor className="w-9 h-9 text-white/60" />
        <h3 className="font-instrument italic text-white/70 text-xl md:text-2xl mb-2">
          Windrose
        </h3>

        <p className="font-inter text-white/40 text-xs leading-relaxed max-w-2xl">
          Windrose provides informational analysis for research and education. It is not a duty-of-care, security, or emergency-notification service, and no completeness or real-time guarantee is made.
        </p>

        <p className="font-inter text-white/30 text-xs leading-relaxed max-w-2xl">
          We collect your email only to send the brief and launch updates, never shared, never sold, unsubscribe anytime.
        </p>

        <p className="font-inter text-white/20 text-xs mt-4">
          © 2026 Windrose. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

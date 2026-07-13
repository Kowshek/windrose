import { useState, useEffect } from 'react';
import { scrollToTarget } from '../lib/scroll';

const Button = ({ children, className = '', href }: { children: React.ReactNode; className?: string, href?: string }) => {
  if (href) {
    return (
      <a href={href} className={`inline-block bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow ${className}`}>
        {children}
      </a>
    );
  }
  return (
    <button className={`bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow ${className}`}>
      {children}
    </button>
  );
};

const Hero = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  // Frost the navbar once the hero is left behind (nav is fixed and otherwise
  // transparent — without this, page content scrolls straight through the links)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Why Windrose', href: '#beats' },
    { label: 'Daily Brief', href: '#preview' },
    { label: 'Method', href: '#method' },
    { label: 'Universities', href: '#universities' }
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    scrollToTarget(targetId);
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #05070d 0%, #081527 55%, #0b2740 100%)' }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLVideoElement).style.display = 'none';
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-500 ${
          scrolled ? 'bg-[#05070d]/70 backdrop-blur-md border-b border-white/5' : ''
        }`}
      >
        <div className="font-instrument italic text-white text-2xl md:text-3xl">Windrose</div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-white/80 hover:text-white text-sm tracking-wide transition-colors font-inter"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Button href="#waitlist">Join the waitlist</Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden relative z-[60] w-6 h-5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span
            className="w-full h-[2px] bg-white transition-all duration-300 absolute left-0"
            style={{
              top: '0px',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              transform: isMenuOpen ? 'translateY(9px) rotate(45deg)' : 'translateY(0) rotate(0)'
            }}
          />
          <span
            className="w-full h-[2px] bg-white transition-all duration-300 absolute left-0"
            style={{
              top: '9px',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              opacity: isMenuOpen ? 0 : 1,
              transform: isMenuOpen ? 'scaleX(0)' : 'scaleX(1)'
            }}
          />
          <span
            className="w-full h-[2px] bg-white transition-all duration-300 absolute left-0"
            style={{
              top: '18px',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              transform: isMenuOpen ? 'translateY(-9px) rotate(-45deg)' : 'translateY(0) rotate(0)'
            }}
          />
        </button>
      </nav>

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[55] w-[85%] max-w-[340px] bg-[#0a0608]/95 backdrop-blur-xl border-l border-white/10 transition-transform duration-500 flex flex-col px-8 pt-32 pb-8 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        <div className="flex flex-col gap-8 flex-1">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-white text-2xl tracking-wide font-medium transition-all duration-500 font-inter"
              style={{
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? 'translateX(0)' : 'translateX(32px)',
                transitionDelay: isMenuOpen ? `${150 + i * 75}ms` : '0ms'
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div
          className="transition-all duration-500"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(32px)',
            transitionDelay: isMenuOpen ? '450ms' : '0ms'
          }}
        >
          <Button href="#waitlist" className="w-full text-center">Join the waitlist</Button>
        </div>
      </div>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center -mt-[120px] px-4 pointer-events-none z-10">
        <h1 className="font-instrument text-white text-[36px] md:text-7xl lg:text-[110px] leading-[0.9] tracking-tight text-center text-glow">
          See what's coming.<br />
          <span className="italic">Not just what broke.</span>
        </h1>
        <p className="font-inter text-white/70 text-sm md:text-base text-center mt-5 md:mt-7 max-w-xl">
          Analyst-grade monitoring of Europe — triaged, assessed, and sourced by a published methodology, at a price a student can pay.
        </p>
        <div className="pointer-events-auto flex flex-col md:flex-row items-center gap-4 mt-6 md:mt-9">
          <a href="#waitlist" onClick={(e) => handleSmoothScroll(e, '#waitlist')} className="bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow text-center w-full md:w-auto">
            For individuals — join the waitlist
          </a>
          <a href="#universities" onClick={(e) => handleSmoothScroll(e, '#universities')} className="liquid-glass text-white px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/10 transition-all duration-300 text-center w-full md:w-auto">
            For universities
          </a>
        </div>
        <p className="text-white/40 text-xs mt-4 font-inter text-center pointer-events-auto">
          Students · analysts · journalists · researchers
        </p>
      </div>

      {/* Indicator */}
      <div className="hidden md:flex absolute bottom-8 left-8 items-center gap-4 z-10 font-inter">
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
          <div className="w-4 h-[2px] bg-white/60" />
        </div>
        <div className="text-white/60 text-xs flex flex-col tracking-wider uppercase">
          <span>The daily brief</span>
          <span>starts below</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { scrollToTarget } from '../lib/scroll';
import { initMagnetic } from '../lib/hover';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import WindroseMark from './visuals/WindroseMark';

/** One word of the headline choreography: rises and pulls into focus. */
const HeadWord = ({ children, italic = false }: { children: string; italic?: boolean }) => (
  <motion.span
    className={`inline-block ${italic ? 'italic' : ''}`}
    variants={{
      hidden: { y: '0.45em', opacity: 0, filter: 'blur(10px)' },
      show: {
        y: '0em',
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
      },
    }}
  >
    {children}
  </motion.span>
);

const Button = ({ children, className = '', href }: { children: React.ReactNode; className?: string, href?: string }) => {
  const btnRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  useEffect(() => {
    if (btnRef.current) {
      return initMagnetic(btnRef.current);
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href?.startsWith('#')) {
      e.preventDefault();
      scrollToTarget(href);
    }
  };

  if (href) {
    return (
      <a ref={btnRef as React.RefObject<HTMLAnchorElement>} href={href} onClick={handleClick} className={`inline-block bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow ${className}`}>
        {children}
      </a>
    );
  }
  return (
    <button ref={btnRef as React.RefObject<HTMLButtonElement>} className={`bg-white text-black px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 button-glow ${className}`}>
      {children}
    </button>
  );
};

const Hero = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBootDismissed, setIsBootDismissed] = useState(false);
  const reduced = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const centerContentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleDismiss = () => {
      setIsBootDismissed(true);
    };

    const boot = document.getElementById('boot');
    if (!boot || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsBootDismissed(true);
    } else {
      window.addEventListener('boot-dismissed', handleDismiss);
    }

    // Safety fallback: if video is already loaded when component mounts
    if (videoRef.current && videoRef.current.readyState >= 2) {
      window.dispatchEvent(new CustomEvent('hero-video-loaded'));
    }

    return () => {
      window.removeEventListener('boot-dismissed', handleDismiss);
    };
  }, []);

  const handleVideoLoaded = () => {
    window.dispatchEvent(new CustomEvent('hero-video-loaded'));
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!sectionRef.current || !videoWrapperRef.current || !centerContentRef.current) return;

      gsap.to(centerContentRef.current, {
        y: -80,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom 40%',
          scrub: true,
        }
      });

      gsap.to(videoWrapperRef.current, {
        scale: 1.06,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    });

    return () => mm.revert();
  }, []);

  // Close mobile menu on resize and handle scroll state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen]);

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
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <div
        ref={videoWrapperRef}
        className="absolute inset-0 w-full h-full overflow-hidden origin-center"
        style={{ background: 'linear-gradient(180deg, #05070d 0%, #081527 55%, #0b2740 100%)' }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
          onLoadedData={handleVideoLoaded}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLVideoElement).style.display = 'none';
          }}
        >
          {/* <source src="/hero.mp4" type="video/mp4" /> */}
          <source src="https://res.cloudinary.com/vewxyxqu/video/upload/v1783964499/hero_capgqo.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 md:px-12 py-5 border-b transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isScrolled ? 'bg-[#05070d]/70 backdrop-blur-md border-white/5' : 'border-transparent'
          } ${isBootDismissed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} motion-reduce:transition-none motion-reduce:opacity-100`}
        style={{ transitionDelay: isBootDismissed ? '100ms' : '0ms' }}
      >
        <div className="flex items-center gap-2.5">
          <WindroseMark className="w-6 h-6 md:w-7 md:h-7 text-white/90" />
          <span className="font-instrument italic text-white text-2xl md:text-3xl">Windrose</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-12">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="group relative text-white/80 hover:text-white text-sm tracking-wide transition-colors font-inter py-1"
            >
              {link.label}
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <Button href="#waitlist" className="whitespace-nowrap">Join the waitlist</Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden relative z-[60] w-6 h-5"
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
        className={`fixed top-0 right-0 bottom-0 z-[55] w-[85%] max-w-[340px] bg-[#05070d]/95 backdrop-blur-xl border-l border-white/10 transition-transform duration-500 flex flex-col px-8 pt-32 pb-8 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
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
      <div ref={centerContentRef} className="absolute inset-0 flex flex-col items-center justify-center -mt-[120px] px-4 pointer-events-none z-10">
        <motion.h1
          className="font-instrument text-white text-[36px] md:text-7xl lg:text-[110px] leading-[0.9] tracking-tight text-center text-glow"
          initial={reduced ? 'show' : 'hidden'}
          animate={isBootDismissed || reduced ? 'show' : 'hidden'}
          variants={{ hidden: {}, show: {} }}
          transition={{
            staggerChildren: reduced ? 0 : 0.075,
            delayChildren: reduced ? 0 : 0.1,
            duration: reduced ? 0 : 0.95,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="block">
            <HeadWord>See</HeadWord> <HeadWord>what&rsquo;s</HeadWord> <HeadWord>coming.</HeadWord>
          </span>
          <span className="block">
            <HeadWord italic>Not</HeadWord> <HeadWord italic>just</HeadWord>{' '}
            <HeadWord italic>what</HeadWord> <HeadWord italic>broke.</HeadWord>
          </span>
        </motion.h1>
        <p
          className={`font-inter text-white/70 text-sm md:text-base text-center mt-5 md:mt-7 max-w-xl transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isBootDismissed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0`}
          style={{ transitionDelay: isBootDismissed ? '120ms' : '0ms' }}
        >
          Analyst-grade monitoring of Europe, triaged, assessed, and sourced by a published methodology, at a price a student can pay.
        </p>
        <div
          className={`pointer-events-auto flex flex-col md:flex-row items-center gap-4 mt-6 md:mt-9 transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isBootDismissed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0`}
          style={{ transitionDelay: isBootDismissed ? '240ms' : '0ms' }}
        >
          <Button href="#waitlist" className="w-full md:w-auto text-center">
            For individuals, join the waitlist
          </Button>
          <a ref={(el) => { if (el) initMagnetic(el); }} href="#universities" onClick={(e) => handleSmoothScroll(e, '#universities')} className="liquid-glass text-white px-8 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-white/10 transition-colors text-center w-full md:w-auto">
            For universities
          </a>
        </div>
        <p
          className={`text-white/40 text-xs leading-relaxed mt-4 max-w-xs sm:max-w-none mx-auto font-inter text-center pointer-events-auto transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isBootDismissed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0`}
          style={{ transitionDelay: isBootDismissed ? '360ms' : '0ms' }}
        >
          Students · journalists · analysts · think-tank&nbsp;researchers · NGO&nbsp;staff · educators
        </p>
      </div>

      {/* Indicator */}
      <div className="hidden md:flex absolute bottom-8 left-8 items-center gap-4 z-10 font-inter">
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center overflow-hidden">
          <motion.svg
            viewBox="0 0 12 14"
            className="w-3 h-3.5"
            fill="none"
            animate={reduced ? undefined : { y: [0, 3, 0] }}
            transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
          >
            <path d="M6 1 V13 M1.5 8.5 L6 13 L10.5 8.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
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

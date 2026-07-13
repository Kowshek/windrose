import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Pledge from './pages/Pledge';
import Cursor from './components/Cursor';

function App() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const boot = document.getElementById('boot');

    if (prefersReduced) {
      if (boot) boot.remove();
    } else {
      let dismissed = false;
      const dismissBoot = () => {
        if (dismissed) return;
        dismissed = true;
        if (boot) {
          boot.style.opacity = '0';
          setTimeout(() => {
            boot.remove();
          }, 500);
        }
        window.dispatchEvent(new CustomEvent('boot-dismissed'));
      };

      // Condition 2: 1200ms have elapsed since mount
      const timer = setTimeout(dismissBoot, 1200);

      const handleVideoLoaded = () => {
        clearTimeout(timer);
        dismissBoot();
      };

      window.addEventListener('hero-video-loaded', handleVideoLoaded);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('hero-video-loaded', handleVideoLoaded);
      };
    }
  }, []);

  return (
    <>
      <Cursor />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pledge" element={<Pledge />} />
      </Routes>
    </>
  );
}

export default App;

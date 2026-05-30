import React, { useState, useEffect, useRef } from 'react';

// Modular Component Imports
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import SpecsTabs from './components/SpecsTabs';
import StrapConfigurator from './components/StrapConfigurator';
import ConciergeScheduler from './components/ConciergeScheduler';
import CartDrawer from './components/CartDrawer';

// Configuration
const frameCount = 240;

// Custom status messages during preloading
const loadStatusMessages = [
  { threshold: 15, msg: 'Initializing CFB Oscillator...' },
  { threshold: 35, msg: 'Calibrating Unidirectional Bezel...' },
  { threshold: 55, msg: 'Tensioning Balance Spring...' },
  { threshold: 75, msg: 'Pressurizing Titanium Chamber...' },
  { threshold: 95, msg: 'Securing ScubaTec Verde Calibre...' },
  { threshold: 100, msg: 'System Ready // Commencing Descent' }
];

// Helper to resolve frame paths
const getFramePath = (index) => {
  const formattedIndex = String(index).padStart(3, '0');
  return `watch clips/ezgif-frame-${formattedIndex}.jpg`;
};

export default function App() {
  // Preloader State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState('Initializing Systems...');
  
  // Navigation & Scroll State
  const [scrolled, setScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Upgrade States
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [selectedStrap, setSelectedStrap] = useState('textile');
  const [activeSpecTab, setActiveSpecTab] = useState('movement');
  
  const [bookingStep, setBookingStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    boutique: 'Geneva Boutique',
    date: '2026-06-01',
    time: '10:00 AM',
    name: '',
    email: '',
    phone: '',
    vipNotes: ''
  });

  // References
  const canvasRef = useRef(null);
  const bubblesContainerRef = useRef(null);
  const preloadedImagesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  
  // Web Audio Synth References
  const audioCtxRef = useRef(null);
  const ambientOscRef = useRef(null);
  const ambientGainRef = useRef(null);
  
  // Interpolation States (useRef to avoid re-renders during 60fps canvas loop)
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const ease = 0.08; // Damping coefficient

  // --- 1. VIEWPORT INTERSECTION OBSERVER TRIGGER (SNAPPY CARD REVEALS) ---
  useEffect(() => {
    if (!isLoaded) return;

    // Decouple text revealing from strict scroll boundaries
    // Trigger instantly as soon as 15% of the section is visible in the viewport
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15 
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [isLoaded]);

  // --- 2. AUDIO SYNTHESIS ENGINE (ZERO-LATENCY WEB AUDIO API) ---
  const initAudioEngine = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      ambientOscRef.current = osc;
      ambientGainRef.current = gain;
    } catch (err) {
      console.warn('Web Audio synthesis is blocked by browser interaction guidelines.', err);
    }
  };

  const handleAudioToggle = () => {
    if (!audioCtxRef.current) {
      initAudioEngine();
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (isAudioPlaying) {
      ambientGainRef.current?.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      setTimeout(() => {
        if (ctx.state === 'running') ctx.suspend();
      }, 500);
      setIsAudioPlaying(false);
    } else {
      if (ctx.state === 'suspended') ctx.resume();
      ambientGainRef.current?.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.5);
      setIsAudioPlaying(true);
      playBezelTick();
    }
  };

  const playBezelTick = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
    
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (err) {
      // Node decay fails gracefully
    }
  };

  const handleHoverEvent = () => {
    if (isAudioPlaying) {
      playBezelTick();
    }
  };

  // --- 3. ASYNCHRONOUS PRELOADER PIPELINE ---
  useEffect(() => {
    let loadedCount = 0;
    const imagesArray = [];

    const updateProgress = () => {
      loadedCount++;
      const percentage = Math.floor((loadedCount / frameCount) * 100);
      setLoadingProgress(percentage);

      const activeMsg = loadStatusMessages.find(m => percentage <= m.threshold) || loadStatusMessages[loadStatusMessages.length - 1];
      setLoaderStatus(activeMsg.msg);

      if (loadedCount === frameCount) {
        preloadedImagesRef.current = imagesArray;
        setTimeout(() => {
          setIsLoaded(true);
        }, 600);
      }
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = updateProgress;
      img.onerror = () => {
        updateProgress();
      };
      imagesArray.push(img);
    }
  }, []);

  // --- 4. CANVAS COVER ASPECT-RATIO SCALE ---
  const scaleCanvasCover = (canvas, ctx, img) => {
    if (!img || !img.complete) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = windowWidth * dpr;
    canvas.height = windowHeight * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = `${windowWidth}px`;
    canvas.style.height = `${windowHeight}px`;

    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;

    const imgRatio = imgWidth / imgHeight;
    const screenRatio = windowWidth / windowHeight;

    let drawWidth, drawHeight, drawX, drawY;

    if (screenRatio > imgRatio) {
      drawWidth = windowWidth;
      drawHeight = windowWidth / imgRatio;
      drawX = 0;
      drawY = (windowHeight - drawHeight) / 2;
    } else {
      drawWidth = windowHeight * imgRatio;
      drawHeight = windowHeight;
      drawX = (windowWidth - drawWidth) / 2;
      drawY = 0;
    }

    ctx.clearRect(0, 0, windowWidth, windowHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  // --- 5. CANVAS RENDER LOOP (LERPed Scroll Animation) ---
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = () => {
      currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * ease;
      const frameToDraw = Math.round(currentFrameRef.current);
      const clampedFrame = Math.min(frameCount - 1, Math.max(0, frameToDraw));
      const activeImage = preloadedImagesRef.current[clampedFrame];

      if (activeImage) {
        scaleCanvasCover(canvas, ctx, activeImage);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    const initialImg = preloadedImagesRef.current[0];
    if (initialImg) {
      scaleCanvasCover(canvas, ctx, initialImg);
    }

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isLoaded]);

  // --- 6. SCROLL AND RESIZE EVENT BINDINGS ---
  useEffect(() => {
    if (!isLoaded) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = docHeight - winHeight;
      
      if (maxScroll <= 0) return;

      const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
      
      // Drive watch disassembling sequence frame index smoothly on scroll
      targetFrameRef.current = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));

      setScrolled(scrollTop > 50);

      // Coordinate navbar link highlights
      const percent = scrollFraction * 100;
      let activeIdx = 0;

      if (percent > 0 && percent <= 15) {
        activeIdx = 0;
      } else if (percent > 15 && percent <= 40) {
        activeIdx = 1;
      } else if (percent > 40 && percent <= 65) {
        activeIdx = 2;
      } else if (percent > 65 && percent <= 85) {
        activeIdx = 3;
      } else if (percent > 85) {
        activeIdx = 4;
      }

      setActiveIndex(activeIdx);
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const activeImage = preloadedImagesRef.current[Math.round(currentFrameRef.current)];
      if (activeImage) {
        scaleCanvasCover(canvas, ctx, activeImage);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded]);

  // --- 7. AMBIENT BUBBLES BACKGROUND LERPER ---
  useEffect(() => {
    if (!isLoaded || !bubblesContainerRef.current) return;

    const bubblesContainer = bubblesContainerRef.current;
    const activeBubbles = [];
    const maxBubbles = 20;

    const createBubble = () => {
      if (activeBubbles.length >= maxBubbles) return;

      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      
      const size = Math.random() * 10 + 4;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      
      const duration = Math.random() * 10 + 10;
      bubble.style.animationDuration = `${duration}s`;
      
      const delay = Math.random() * 8;
      bubble.style.animationDelay = `${delay}s`;

      bubblesContainer.appendChild(bubble);
      activeBubbles.push(bubble);

      const recycleTimer = setTimeout(() => {
        bubble.remove();
        const index = activeBubbles.indexOf(bubble);
        if (index > -1) activeBubbles.splice(index, 1);
        createBubble();
      }, (duration + delay) * 1000);

      bubble.recycleTimer = recycleTimer;
    };

    for (let i = 0; i < maxBubbles; i++) {
      createBubble();
    }

    return () => {
      activeBubbles.forEach(b => {
        clearTimeout(b.recycleTimer);
        b.remove();
      });
    };
  }, [isLoaded]);

  // Clean up global audio ref on unmount
  useEffect(() => {
    return () => {
      ambientOscRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  const handleBookingChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* 1. PREMIUM MECHANICAL PRELOADER */}
      <Preloader 
        loadingProgress={loadingProgress}
        loaderStatus={loaderStatus}
        isLoaded={isLoaded}
      />

      {/* 2. APPLE-STYLE ULTRA-MINIMAL TOP NAV BAR */}
      <Navbar 
        scrolled={scrolled}
        isLoaded={isLoaded}
        activeIndex={activeIndex}
        isAudioPlaying={isAudioPlaying}
        handleAudioToggle={handleAudioToggle}
        handleHoverEvent={handleHoverEvent}
        setIsCartOpen={setIsCartOpen}
      />

      {/* 3. STICKY VIEWPORT CANVAS WRAPPER */}
      <div className="canvas-wrapper">
        <div className="sea-lighting"></div>
        <div className="sea-radial-glow"></div>
        <div className="bubbles-bg" ref={bubblesContainerRef}></div>
        
        {isLoaded && <canvas id="watch-canvas" ref={canvasRef}></canvas>}
      </div>

      {/* 4. EDITORIAL SCROLL NARRATIVE SECTIONS */}
      <main className="scrollytelling-container">
        
        {/* SECTION 1: HERO / INTRO */}
        <section className="scroll-section" id="overview" data-section="0">
          <div className="section-content text-center hero-text">
            <h2 className="mono-label" data-animate="slide-up">01 // PRELUDE</h2>
            <h1 className="main-headline" data-animate="slide-up">
              <span className="brand-prefix">Carl F. Bucherer</span>
              <span className="green-gradient-text">Patravi ScubaTec Verde</span>
            </h1>
            <h3 className="sub-headline" data-animate="slide-up">Master of the Depths.</h3>
            <p className="supporting-line" data-animate="slide-up">
              Luxury dive engineering, redefined for the ultimate explorer.
            </p>
            <div className="scroll-prompt" data-animate="slide-up">
              <span>SCROLL TO DESCEND</span>
              <div className="scroll-arrow"></div>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOROLOGICAL REVEAL */}
        <section className="scroll-section" id="craftsmanship" data-section="1">
          <div className="section-content left-aligned">
            <div className="content-card">
              <h2 className="mono-label" data-animate="slide-up">02 // ARCHITECTURE</h2>
              <h1 className="editorial-title" data-animate="slide-up">
                Precision-engineered <br />for the Abyss.
              </h1>
              <p className="editorial-body" data-animate="slide-up">
                COSC-certified chronometer movement, delicate balance spring, and uncompromised all-day water resistance. Watch every element separate down the Z-axis in a floating horological ballet.
              </p>
              <div className="premium-feature-badge" data-animate="slide-up">
                <span className="badge-dot"></span> CERTIFIED SWISS CHRONOMETER
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: DEEP-SEA ENGINEERING */}
        <section className="scroll-section" id="movement" data-section="2">
          <div className="section-content right-aligned">
            <div className="content-card specs-card">
              <h2 className="mono-label" data-animate="slide-up">03 // CALIBRE & PRESSURE</h2>
              <h1 className="editorial-title" data-animate="slide-up">
                Uncompromising <br />Deep-Sea Control.
              </h1>
              
              <SpecsTabs 
                activeSpecTab={activeSpecTab}
                setActiveSpecTab={setActiveSpecTab}
                handleHoverEvent={handleHoverEvent}
                playBezelTick={playBezelTick}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: ARTISTRY & STRAP CONFIGURATOR */}
        <section className="scroll-section" id="specs" data-section="3">
          <div className="section-content left-aligned">
            <div className="content-card configurator-card">
              <h2 className="mono-label" data-animate="slide-up">04 // MATERIALS CONFIGURATOR</h2>
              <h1 className="editorial-title" data-animate="slide-up">
                Immersive, <br />Marine Artistry.
              </h1>
              <p className="editorial-body" data-animate="slide-up">
                Customize your Patravi ScubaTec Verde to match your next dive challenge. Toggle our premium luxury configurations:
              </p>
              
              <StrapConfigurator 
                selectedStrap={selectedStrap}
                setSelectedStrap={setSelectedStrap}
                handleHoverEvent={handleHoverEvent}
                playBezelTick={playBezelTick}
              />
            </div>
          </div>
        </section>

        {/* SECTION 5: REASSEMBLY & CONCIERGE SCHEDULER */}
        <section className="scroll-section" id="boutique" data-section="4">
          <div className="section-content text-center hero-text cta-section">
            <h2 className="mono-label" data-animate="slide-up">05 // CHRONOLOGY</h2>
            
            <ConciergeScheduler 
              bookingStep={bookingStep}
              setBookingStep={setBookingStep}
              bookingData={bookingData}
              handleBookingChange={handleBookingChange}
              playBezelTick={playBezelTick}
              handleHoverEvent={handleHoverEvent}
              setIsCartOpen={setIsCartOpen}
            />
          </div>
        </section>
      </main>

      {/* 5. INTERACTIVE BOUTIQUE EXPERIENCE BOTTOM DRAWER */}
      <section className="boutique-drawer-section" id="experience">
        {/* Ambient top glow line */}
        <div className="boutique-glow-line" />

        <div className="boutique-container">
          {/* Header */}
          <div className="boutique-header">
            <span className="boutique-eyebrow">
              <span className="boutique-eyebrow-dot" />
              PRIVATE BOUTIQUE NETWORK
            </span>
            <h2 className="boutique-title">Secure Your Private<br /><span className="boutique-title-accent">Horological Experience</span></h2>
            <p className="boutique-desc">
              Our dedicated concierge specialists await. Reserve an intimate, one-on-one session with the Patravi ScubaTec Verde — in the city of your choosing.
            </p>
          </div>

          {/* Location Cards */}
          <div className="boutique-grid">

            {/* Geneva */}
            <div className="boutique-card">
              <div className="boutique-card-top">
                <div className="boutique-location-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                <div className="boutique-avail-badge">
                  <span className="avail-dot" />
                  Available Today
                </div>
              </div>
              <div className="boutique-card-body">
                <span className="boutique-city-tag">SWITZERLAND — GVA</span>
                <h3 className="boutique-city">Geneva Boutique</h3>
                <p className="boutique-address">Rue du Rhône 86<br />1204 Genève, CH</p>
                <p className="boutique-hours">Mon–Sat · 10:00–19:00</p>
              </div>
              <div className="boutique-card-footer">
                <button
                  className="boutique-cta-btn"
                  onClick={() => { playBezelTick(); setBookingData(prev => ({ ...prev, boutique: 'Geneva Boutique' })); setBookingStep(1); }}
                  onMouseEnter={handleHoverEvent}
                >
                  <span>Book a Viewing</span>
                  <svg className="btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            {/* Zürich — featured */}
            <div className="boutique-card boutique-card--featured">
              <div className="boutique-card-top">
                <div className="boutique-location-icon boutique-location-icon--featured">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                <div className="boutique-avail-badge boutique-avail-badge--featured">
                  <span className="avail-dot avail-dot--featured" />
                  Flagship Maison
                </div>
              </div>
              <div className="boutique-card-body">
                <span className="boutique-city-tag">SWITZERLAND — ZRH</span>
                <h3 className="boutique-city">Zürich Flagship</h3>
                <p className="boutique-address">Bahnhofstrasse 53<br />8001 Zürich, CH</p>
                <p className="boutique-hours">Mon–Sat · 09:30–19:30</p>
              </div>
              <div className="boutique-card-footer">
                <button
                  className="boutique-cta-btn boutique-cta-btn--primary"
                  onClick={() => { playBezelTick(); setBookingData(prev => ({ ...prev, boutique: 'Zürich Boutique' })); setBookingStep(1); }}
                  onMouseEnter={handleHoverEvent}
                >
                  <span>Book a Viewing</span>
                  <svg className="btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            {/* New York */}
            <div className="boutique-card">
              <div className="boutique-card-top">
                <div className="boutique-location-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                <div className="boutique-avail-badge">
                  <span className="avail-dot" />
                  Available Today
                </div>
              </div>
              <div className="boutique-card-body">
                <span className="boutique-city-tag">UNITED STATES — JFK</span>
                <h3 className="boutique-city">New York Salon</h3>
                <p className="boutique-address">730 Fifth Avenue<br />New York, NY 10019</p>
                <p className="boutique-hours">Mon–Sun · 10:00–20:00</p>
              </div>
              <div className="boutique-card-footer">
                <button
                  className="boutique-cta-btn"
                  onClick={() => { playBezelTick(); setBookingData(prev => ({ ...prev, boutique: 'New York Salon' })); setBookingStep(1); }}
                  onMouseEnter={handleHoverEvent}
                >
                  <span>Book a Viewing</span>
                  <svg className="btn-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

          </div>

          {/* Footer strip */}
          <div className="boutique-footer">
            <div className="boutique-footer-inner">
              <span className="boutique-footer-brand">Carl F. Bucherer · Since 1888</span>
              <p className="copylink">© 2026 Carl F. Bucherer. All Rights Reserved. Engineered in Switzerland.</p>
              <span className="boutique-footer-cert">COSC Certified · ISO 6425 · 500M WR</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VIP CART CHECKOUT SLIDING DRAWER OVERLAY */}
      <CartDrawer 
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        selectedStrap={selectedStrap}
        cartSuccess={cartSuccess}
        setCartSuccess={setCartSuccess}
        playBezelTick={playBezelTick}
        handleHoverEvent={handleHoverEvent}
      />
    </>
  );
}

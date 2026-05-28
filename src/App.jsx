import React, { useState, useEffect, useRef } from 'react';

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
  // Vite serves static files in the public directory relative to the web root
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

  // References
  const canvasRef = useRef(null);
  const bubblesContainerRef = useRef(null);
  const preloadedImagesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  
  // Interpolation States (useRef to avoid re-renders during 60fps canvas loop)
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const ease = 0.08; // Heavy premium momentum damping

  // 1. ASYNCHRONOUS PRELOADER ENGINE
  useEffect(() => {
    let loadedCount = 0;
    const imagesArray = [];

    const updateProgress = () => {
      loadedCount++;
      const percentage = Math.floor((loadedCount / frameCount) * 100);
      setLoadingProgress(percentage);

      // Procedural mechanical status text based on progress
      const activeMsg = loadStatusMessages.find(m => percentage <= m.threshold) || loadStatusMessages[loadStatusMessages.length - 1];
      setLoaderStatus(activeMsg.msg);

      if (loadedCount === frameCount) {
        preloadedImagesRef.current = imagesArray;
        // Hold preloader briefly for visual transition luxury
        setTimeout(() => {
          setIsLoaded(true);
        }, 600);
      }
    };

    // Preload 240 sequential frames
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = updateProgress;
      img.onerror = () => {
        console.warn(`Vite asset frame ${i} not found. Continuing preloading...`);
        updateProgress();
      };
      imagesArray.push(img);
    }
  }, []);

  // 2. HIGH-PERFORMANCE ASPECT RATIO "COVER" RENDERER
  const scaleCanvasCover = (canvas, ctx, img) => {
    if (!img || !img.complete) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Handle Retina / HiDPI Display density
    const dpr = window.devicePixelRatio || 1;
    canvas.width = windowWidth * dpr;
    canvas.height = windowHeight * dpr;
    ctx.scale(dpr, dpr);

    // Apply style sizes
    canvas.style.width = `${windowWidth}px`;
    canvas.style.height = `${windowHeight}px`;

    // Original image dimensions
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

  // 3. CANVAS RENDER LOOP (LERP INTERPOLATED)
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const render = () => {
      // Linear interpolation calculation
      currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * ease;
      const frameToDraw = Math.round(currentFrameRef.current);
      
      // Safety bounds clamp
      const clampedFrame = Math.min(frameCount - 1, Math.max(0, frameToDraw));
      const activeImage = preloadedImagesRef.current[clampedFrame];

      if (activeImage) {
        scaleCanvasCover(canvas, ctx, activeImage);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Draw initial assembled watch frame immediately
    const initialImg = preloadedImagesRef.current[0];
    if (initialImg) {
      scaleCanvasCover(canvas, ctx, initialImg);
    }

    // Launch momentum loop
    render();

    // Clean up animation on unmount
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isLoaded]);

  // 4. SCROLL AND RESIZE BINDINGS
  useEffect(() => {
    if (!isLoaded) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = docHeight - winHeight;
      
      if (maxScroll <= 0) return;

      const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
      
      // Update target frame for rendering loop
      targetFrameRef.current = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));

      // Scroll thresholds for navigation styling
      setScrolled(scrollTop > 50);

      // Coordinate editorial card reveals
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

    // Run initial scroll update
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded]);

  // 5. PROCEDURAL AMBENT BUBBLES
  useEffect(() => {
    if (!isLoaded || !bubblesContainerRef.current) return;

    const bubblesContainer = bubblesContainerRef.current;
    const activeBubbles = [];
    const maxBubbles = 25;

    const createBubble = () => {
      if (activeBubbles.length >= maxBubbles) return;

      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      
      const size = Math.random() * 10 + 4; // 4px to 14px
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      
      const duration = Math.random() * 10 + 10; // 10s to 20s
      bubble.style.animationDuration = `${duration}s`;
      
      const delay = Math.random() * 8;
      bubble.style.animationDelay = `${delay}s`;

      bubblesContainer.appendChild(bubble);
      activeBubbles.push(bubble);

      // Recycle bubble
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

  // Calculate circular loader progress offset (svg perimeter is 283)
  const loaderOffset = 283 - (283 * (loadingProgress / 100));

  return (
    <>
      {/* 1. PREMIUM METRIC-STYLE PRELOADER */}
      <div id="preloader" className={`preloader-overlay ${isLoaded ? 'fade-out' : ''}`}>
        <div className="preloader-content">
          <div className="preloader-glow"></div>
          
          <div className="circular-indicator">
            <svg className="gear-ring" viewBox="0 0 100 100">
              <circle className="gear-track" cx="50" cy="50" r="45"></circle>
              <circle 
                className="gear-progress" 
                cx="50" 
                cy="50" 
                r="45"
                style={{ strokeDasharray: 283, strokeDashoffset: loaderOffset }}
              ></circle>
            </svg>
            <div className="loader-percentage">{String(loadingProgress).padStart(2, '0')}</div>
          </div>
          
          <div className="loader-status">
            <div className="status-title">CFB CALIBRE INIT</div>
            <div className="status-sub">{loaderStatus}</div>
          </div>
          
          <div className="loader-tech-metrics">
            <span>EST. DEPTH CRIT: 500M</span>
            <span className="pulse-indicator">● OPERATIONAL</span>
            <span>CAL. CFB A2050</span>
          </div>
        </div>
      </div>

      {/* 2. APPLE-STYLE ULTRA-MINIMAL TOP NAV BAR */}
      <nav className={`nav-bar ${scrolled ? 'scrolled' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
        <div className="nav-container">
          <a href="#" className="nav-brand">
            <span className="brand-brand">Carl F. Bucherer</span>
            <span className="brand-divider">|</span>
            <span className="brand-model">Patravi ScubaTec Verde</span>
          </a>
          
          <div className="nav-links">
            <a href="#overview" className={`nav-link ${activeIndex === 0 ? 'active' : ''}`}>Overview</a>
            <a href="#craftsmanship" className={`nav-link ${activeIndex === 1 ? 'active' : ''}`}>Craftsmanship</a>
            <a href="#movement" className={`nav-link ${activeIndex === 2 ? 'active' : ''}`}>Movement</a>
            <a href="#specs" className={`nav-link ${activeIndex === 3 ? 'active' : ''}`}>Specs</a>
            <a href="#boutique" className={`nav-link ${activeIndex === 4 ? 'active' : ''}`}>Boutique</a>
          </div>
          
          <div className="nav-cta">
            <a href="#experience" className="cta-button">Experience Patravi</a>
          </div>
        </div>
      </nav>

      {/* 3. STICKY VIEWPORT CANVAS WRAPPER */}
      <div className="canvas-wrapper">
        <div className="sea-lighting"></div>
        <div className="sea-radial-glow"></div>
        <div className="bubbles-bg" ref={bubblesContainerRef}></div>
        
        {isLoaded && <canvas id="watch-canvas" ref={canvasRef}></canvas>}
      </div>

      {/* 4. EDITORIAL SCROLL narrative layers */}
      <main className="scrollytelling-container">
        
        {/* SECTION 1: HERO / INTRO */}
        <section className={`scroll-section ${activeIndex === 0 ? 'reveal-active' : ''}`} id="overview" data-section="0">
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
        <section className={`scroll-section ${activeIndex === 1 ? 'reveal-active' : ''}`} id="craftsmanship" data-section="1">
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
        <section className={`scroll-section ${activeIndex === 2 ? 'reveal-active' : ''}`} id="movement" data-section="2">
          <div className="section-content right-aligned">
            <div className="content-card">
              <h2 className="mono-label" data-animate="slide-up">03 // CALIBRE & PRESSURE</h2>
              <h1 className="editorial-title" data-animate="slide-up">
                Uncompromising <br />Deep-Sea Control.
              </h1>
              
              <ul className="editorial-bullets">
                <li data-animate="slide-up">
                  <span className="bullet-number">500M</span>
                  <div className="bullet-text">
                    <strong>Water Resistance</strong>
                    <p>Engineered to withstand pressures of up to 50 bar under the ocean's weight.</p>
                  </div>
                </li>
                <li data-animate="slide-up">
                  <span className="bullet-number">HE</span>
                  <div className="bullet-text">
                    <strong>Innovative Helium Valve</strong>
                    <p>Automatic valve protects the internal gear train by releasing expanding helium gas.</p>
                  </div>
                </li>
                <li data-animate="slide-up">
                  <span className="bullet-number">LUM</span>
                  <div className="bullet-text">
                    <strong>Super-LumiNova® Indices</strong>
                    <p>Coated in premium electric cyan for absolute readability in the darkest trenches.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 4: ARTISTRY & TEXTURES */}
        <section className={`scroll-section ${activeIndex === 3 ? 'reveal-active' : ''}`} id="specs" data-section="3">
          <div className="section-content left-aligned">
            <div className="content-card">
              <h2 className="mono-label" data-animate="slide-up">04 // MATERIALS</h2>
              <h1 className="editorial-title" data-animate="slide-up">
                Immersive, <br />Marine Artistry.
              </h1>
              <p className="editorial-body" data-animate="slide-up">
                A celebration of sustainability and craftsmanship. Features a unique, high-contrast green textured wave dial, combined with a durable rubber strap overlayed with textile woven from ocean-recovered materials. 
              </p>
              <div className="material-stats" data-animate="slide-up">
                <div className="stat-item">
                  <span className="stat-value">CERAMIC</span>
                  <span className="stat-label">Bezel Material</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">ECO-TEXTILE</span>
                  <span className="stat-label">Strap Base</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: REASSEMBLY & CTA */}
        <section className={`scroll-section ${activeIndex === 4 ? 'reveal-active' : ''}`} id="boutique" data-section="4">
          <div className="section-content text-center hero-text cta-section">
            <h2 className="mono-label" data-animate="slide-up">05 // CHRONOLOGY</h2>
            <h1 className="main-headline final-headline" data-animate="slide-up">
              Master the Ocean.<br />Defy Time.
            </h1>
            <h3 className="sub-headline final-sub" data-animate="slide-up">Patravi ScubaTec Verde. Your partner in exploration.</h3>
            
            <div className="cta-buttons-group" data-animate="slide-up">
              <a href="#experience" className="cta-button-large glow-btn">
                <span>Experience Patravi</span>
              </a>
              <a href="#viewing" className="text-link-button">
                Book a Viewing <span className="arrow-right">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 5. INTERACTIVE BOUTIQUE EXPERIENCE BOTTOM DRAWER */}
      <section className="boutique-drawer-section" id="experience">
        <div className="boutique-container">
          <div className="boutique-header">
            <span className="boutique-subtitle">GENÈVE // ZÜRICH // TOKYO // NEW YORK</span>
            <h2 className="boutique-title">Secure Your Private Experience</h2>
            <p className="boutique-desc">Connect with a Carl F. Bucherer specialist for a private, bespoke viewing of the Patravi ScubaTec Verde flagship luxury dive watch.</p>
          </div>
          
          <div className="boutique-grid">
            <div className="boutique-card">
              <span className="boutique-city">Geneva Boutique</span>
              <p className="boutique-address">Rue du Rhône 86, 1204 Genève</p>
              <a href="#" className="boutique-action">Select Boutique</a>
            </div>
            <div className="boutique-card">
              <span className="boutique-city">Zürich Boutique</span>
              <p className="boutique-address">Bahnhofstrasse 53, 8001 Zürich</p>
              <a href="#" className="boutique-action">Select Boutique</a>
            </div>
            <div className="boutique-card">
              <span className="boutique-city">New York Salon</span>
              <p className="boutique-address">Fifth Avenue 730, New York, NY 10019</p>
              <a href="#" className="boutique-action">Select Boutique</a>
            </div>
          </div>
          
          <div className="boutique-footer">
            <p className="copylink">© 2026 Carl F. Bucherer. All Rights Reserved. Engineered in Switzerland.</p>
          </div>
        </div>
      </section>
    </>
  );
}

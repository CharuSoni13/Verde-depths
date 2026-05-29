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

  // --- NEW UPGRADE STATES ---
  // 1. Soundscape Engine States
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // 2. VIP Checkout Drawer States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  
  // 3. Strap Configurator States
  const [selectedStrap, setSelectedStrap] = useState('textile'); // 'textile' | 'rubber' | 'titanium'
  
  // 4. Movement Specs Tabs States
  const [activeSpecTab, setActiveSpecTab] = useState('movement'); // 'movement' | 'casing' | 'dive'
  
  // 5. Multi-Step Concierge Booking States
  const [bookingStep, setBookingStep] = useState(0); // 0: Boutique, 1: Date/Time, 2: Client Info, 3: Success
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
  const ease = 0.08; // Heavy premium momentum damping

  // --- AUDIO SYNTHESIS PIPELINE ---
  // Initialize continuous deep-sea hum hum and gain filters
  const initAudioEngine = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Triangle wave oscillator for thick under-water hum (55Hz - A1 note)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, ctx.currentTime);

      // Muffled lowpass filter to represent submerged ocean environment
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, ctx.currentTime);

      // Low volume gain to be subtle background sound
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      ambientOscRef.current = osc;
      ambientGainRef.current = gain;
    } catch (err) {
      console.warn('Web Audio API not fully supported or blocked by browser permission.', err);
    }
  };

  // Toggle ambient synth track
  const handleAudioToggle = () => {
    if (!audioCtxRef.current) {
      initAudioEngine();
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (isAudioPlaying) {
      // Fade out gain cleanly
      ambientGainRef.current?.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      setTimeout(() => {
        if (ctx.state === 'running') ctx.suspend();
      }, 500);
      setIsAudioPlaying(false);
    } else {
      // Resume context & fade gain back in
      if (ctx.state === 'suspended') ctx.resume();
      ambientGainRef.current?.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.5);
      setIsAudioPlaying(true);
      playBezelTick(); // Audio feedback click
    }
  };

  // Programmatic watch bezel click synthesizer
  const playBezelTick = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
    
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Fast exponential pitch drop to mimic mechanical metallic snap
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

      // Rapid volume decay
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (err) {
      // Audio node fails gracefully
    }
  };

  // Hook hover events to play tick sounds
  const handleHoverEvent = () => {
    if (isAudioPlaying) {
      playBezelTick();
    }
  };

  // ASYNCHRONOUS PRELOADER PIPELINE
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

  // CANVAS COVER SCALE CALCULATION
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

  // CANVAS RENDER LOOP (LERPed)
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

  // SCROLL & WINDOW RESIZE HANDLERS
  useEffect(() => {
    if (!isLoaded) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = docHeight - winHeight;
      
      if (maxScroll <= 0) return;

      const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
      targetFrameRef.current = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));

      setScrolled(scrollTop > 50);

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

  // PROCEDURAL BUBBLE GENERATOR
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

  // Clean up global audio on unmount
  useEffect(() => {
    return () => {
      ambientOscRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  // VIP Checkout form submissions
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    playBezelTick();
    setCartSuccess(true);
  };

  // Concierge booking inputs
  const handleBookingChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  // Calendar dates mock (June 1st to June 7th)
  const availableDates = [
    { label: 'MON // JUN 1', val: '2026-06-01' },
    { label: 'TUE // JUN 2', val: '2026-06-02' },
    { label: 'WED // JUN 3', val: '2026-06-03' },
    { label: 'THU // JUN 4', val: '2026-06-04' },
    { label: 'FRI // JUN 5', val: '2026-06-05' },
    { label: 'SAT // JUN 6', val: '2026-06-06' }
  ];

  const availableTimes = ['10:00 AM', '12:30 PM', '02:00 PM', '04:30 PM', '06:00 PM'];

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

      {/* 2. APPLE-STYLE ULTRA-MINIMAL TOP NAV BAR WITH SOUND TOGGLE */}
      <nav className={`nav-bar ${scrolled ? 'scrolled' : ''}`} style={{ opacity: isLoaded ? 1 : 0 }}>
        <div className="nav-container">
          <a href="#" className="nav-brand" onMouseEnter={handleHoverEvent}>
            <span className="brand-brand">Carl F. Bucherer</span>
            <span className="brand-divider">|</span>
            <span className="brand-model">Patravi ScubaTec Verde</span>
          </a>
          
          <div className="nav-links">
            <a href="#overview" className={`nav-link ${activeIndex === 0 ? 'active' : ''}`} onMouseEnter={handleHoverEvent}>Overview</a>
            <a href="#craftsmanship" className={`nav-link ${activeIndex === 1 ? 'active' : ''}`} onMouseEnter={handleHoverEvent}>Craftsmanship</a>
            <a href="#movement" className={`nav-link ${activeIndex === 2 ? 'active' : ''}`} onMouseEnter={handleHoverEvent}>Movement</a>
            <a href="#specs" className={`nav-link ${activeIndex === 3 ? 'active' : ''}`} onMouseEnter={handleHoverEvent}>Specs</a>
            <a href="#boutique" className={`nav-link ${activeIndex === 4 ? 'active' : ''}`} onMouseEnter={handleHoverEvent}>Boutique</a>
          </div>
          
          <div className="nav-controls-group">
            {/* Audio Wave Controller Button */}
            <button 
              className={`audio-wave-btn ${isAudioPlaying ? 'active' : ''}`} 
              onClick={handleAudioToggle}
              onMouseEnter={handleHoverEvent}
              title={isAudioPlaying ? 'Mute Soundscape' : 'Play Immersive Soundscape'}
            >
              <div className="wave-bar bar-1"></div>
              <div className="wave-bar bar-2"></div>
              <div className="wave-bar bar-3"></div>
              <div className="wave-bar bar-4"></div>
              <span className="audio-btn-label">{isAudioPlaying ? 'AMBIENT ON' : 'SOUND ON'}</span>
            </button>

            <button 
              className="cta-button" 
              onClick={() => { playBezelTick(); setIsCartOpen(true); }}
              onMouseEnter={handleHoverEvent}
            >
              Experience Patravi
            </button>
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

      {/* 4. EDITORIAL SCROLL NARRATIVE LAYERS */}
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

        {/* SECTION 3: DEEP-SEA ENGINEERING WITH TECH SPEC TABS */}
        <section className={`scroll-section ${activeIndex === 2 ? 'reveal-active' : ''}`} id="movement" data-section="2">
          <div className="section-content right-aligned">
            <div className="content-card specs-card">
              <h2 className="mono-label" data-animate="slide-up">03 // CALIBRE & PRESSURE</h2>
              <h1 className="editorial-title" data-animate="slide-up">
                Uncompromising <br />Deep-Sea Control.
              </h1>
              
              {/* Interactive Specifications Tabs Selector */}
              <div className="specs-tabs-container" data-animate="slide-up">
                <button 
                  className={`spec-tab-btn ${activeSpecTab === 'movement' ? 'active' : ''}`}
                  onClick={() => { playBezelTick(); setActiveSpecTab('movement'); }}
                  onMouseEnter={handleHoverEvent}
                >
                  Calibre CFB
                </button>
                <button 
                  className={`spec-tab-btn ${activeSpecTab === 'casing' ? 'active' : ''}`}
                  onClick={() => { playBezelTick(); setActiveSpecTab('casing'); }}
                  onMouseEnter={handleHoverEvent}
                >
                  Casing & Crystal
                </button>
                <button 
                  className={`spec-tab-btn ${activeSpecTab === 'dive' ? 'active' : ''}`}
                  onClick={() => { playBezelTick(); setActiveSpecTab('dive'); }}
                  onMouseEnter={handleHoverEvent}
                >
                  Dive Shield
                </button>
              </div>

              {/* Specs Panels */}
              <div className="specs-panel-content" data-animate="slide-up">
                {activeSpecTab === 'movement' && (
                  <ul className="editorial-bullets animated-panel">
                    <li>
                      <span className="bullet-number">CFB</span>
                      <div className="bullet-text">
                        <strong>Calibre CFB A2050</strong>
                        <p>Swiss-made automatic chronometer movement, COSC certified, featuring 33 jewels and 38-hour power reserve.</p>
                      </div>
                    </li>
                    <li>
                      <span className="bullet-number">OSC</span>
                      <div className="bullet-text">
                        <strong>Peripheral Rotor Winding</strong>
                        <p>Innovative bidirectional peripheral rotor winding mechanism ensures uncompromised thinness and visibility.</p>
                      </div>
                    </li>
                  </ul>
                )}

                {activeSpecTab === 'casing' && (
                  <ul className="editorial-bullets animated-panel">
                    <li>
                      <span className="bullet-number">CER</span>
                      <div className="bullet-text">
                        <strong>Ceramic Unidirectional Bezel</strong>
                        <p>Scratch-resistant green ceramic insert with a highly legible 60-minute scale for absolute safety during decompression.</p>
                      </div>
                    </li>
                    <li>
                      <span className="bullet-number">SAP</span>
                      <div className="bullet-text">
                        <strong>Anti-Reflective Sapphire</strong>
                        <p>Double anti-reflective coating on a domed sapphire crystal ensures crystal-clear visual clarity in extreme glare.</p>
                      </div>
                    </li>
                  </ul>
                )}

                {activeSpecTab === 'dive' && (
                  <ul className="editorial-bullets animated-panel">
                    <li>
                      <span className="bullet-number">500M</span>
                      <div className="bullet-text">
                        <strong>Titanium Pressure Chamber</strong>
                        <p>Sealed structure rated up to 50 bar (500 meters) of extreme underwater force.</p>
                      </div>
                    </li>
                    <li>
                      <span className="bullet-number">HE</span>
                      <div className="bullet-text">
                        <strong>Helium Escape Valve</strong>
                        <p>Automatic valve prevents watch crystal expansion blowout during professional saturation dive ascents.</p>
                      </div>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: ARTISTRY & STRAP CONFIGURATOR */}
        <section className={`scroll-section ${activeIndex === 3 ? 'reveal-active' : ''}`} id="specs" data-section="3">
          <div className="section-content left-aligned">
            <div className="content-card configurator-card">
              <h2 className="mono-label" data-animate="slide-up">04 // MATERIALS CONFIGURATOR</h2>
              <h1 className="editorial-title" data-animate="slide-up">
                Immersive, <br />Marine Artistry.
              </h1>
              <p className="editorial-body" data-animate="slide-up">
                Customize your Patravi ScubaTec Verde to match your next dive challenge. Toggle our premium luxury configurations:
              </p>
              
              {/* Swatch Selector Controls */}
              <div className="strap-configurator-swatches" data-animate="slide-up">
                <button 
                  className={`swatch-btn textile ${selectedStrap === 'textile' ? 'active' : ''}`}
                  onClick={() => { playBezelTick(); setSelectedStrap('textile'); }}
                  onMouseEnter={handleHoverEvent}
                  title="Woven Green Eco-Textile"
                >
                  <span className="swatch-color green-textile"></span>
                  <span className="swatch-name">TEXTILE</span>
                </button>
                
                <button 
                  className={`swatch-btn rubber ${selectedStrap === 'rubber' ? 'active' : ''}`}
                  onClick={() => { playBezelTick(); setSelectedStrap('rubber'); }}
                  onMouseEnter={handleHoverEvent}
                  title="Signature Wave Black Rubber"
                >
                  <span className="swatch-color black-rubber"></span>
                  <span className="swatch-name">RUBBER</span>
                </button>
                
                <button 
                  className={`swatch-btn titanium ${selectedStrap === 'titanium' ? 'active' : ''}`}
                  onClick={() => { playBezelTick(); setSelectedStrap('titanium'); }}
                  onMouseEnter={handleHoverEvent}
                  title="Sandblasted Titanium Link"
                >
                  <span className="swatch-color titanium-metal"></span>
                  <span className="swatch-name">TITANIUM</span>
                </button>
              </div>

              {/* Dynamic Showcase Text & Mockup Box */}
              <div className="configurator-showcase" data-animate="slide-up">
                <div className="showcase-visual-overlay">
                  <div className={`mockup-strap-visual ${selectedStrap}`}></div>
                </div>
                
                <div className="showcase-details">
                  {selectedStrap === 'textile' && (
                    <>
                      <strong>Eco-Textile Woven Green</strong>
                      <p>Double-reinforced green woven textile made entirely from ocean-recovered plastic bottles, overlayed on premium vulcanized rubber. Optimized for lightweight flexibility.</p>
                      <span className="price-tag">RESERVATION INCLUDED // $6,900 CHF</span>
                    </>
                  )}
                  {selectedStrap === 'rubber' && (
                    <>
                      <strong>Signature Wave Black Rubber</strong>
                      <p>Professional tactical black elastomer rubber strap with textured geometric decompression relief wave designs and adjustable diving extension buckle.</p>
                      <span className="price-tag">RESERVATION INCLUDED // $6,800 CHF</span>
                    </>
                  )}
                  {selectedStrap === 'titanium' && (
                    <>
                      <strong>Brushed Grade 5 Titanium</strong>
                      <p>Hyper-durable, sandblasted titanium metallic link bracelet with standard luxury folding safety clasp and integrated wet-suit slider expansion locks.</p>
                      <span className="price-tag">PREMIUM OPTION // $7,400 CHF</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: REASSEMBLY & CONCIERGE SCHEDULER WIZARD */}
        <section className={`scroll-section ${activeIndex === 4 ? 'reveal-active' : ''}`} id="boutique" data-section="4">
          <div className="section-content text-center hero-text cta-section">
            <h2 className="mono-label" data-animate="slide-up">05 // CHRONOLOGY</h2>
            
            {bookingStep === 3 ? (
              // Booking Complete State
              <div className="booking-wizard success-wizard" data-animate="slide-up">
                <div className="success-icon-badge">●</div>
                <h1 className="main-headline final-headline">Boutique Appointment Secured</h1>
                <p className="editorial-body success-desc">
                  Thank you, <strong>{bookingData.name}</strong>. Your private horological viewing session has been registered at our <strong>{bookingData.boutique}</strong>.
                </p>
                <div className="vip-ticket-badge">
                  <div className="ticket-field">
                    <span>CONFIRMATION ID:</span>
                    <strong>CFB-{Math.floor(Math.random() * 8999 + 1000)}-VIP</strong>
                  </div>
                  <div className="ticket-field">
                    <span>SCHEDULED TIME:</span>
                    <strong>{bookingData.date} @ {bookingData.time}</strong>
                  </div>
                </div>
                <button 
                  className="cta-button-large reset-booking-btn"
                  onClick={() => { playBezelTick(); setBookingStep(0); }}
                  onMouseEnter={handleHoverEvent}
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              // Active Booking States
              <>
                <h1 className="main-headline final-headline" data-animate="slide-up">
                  {bookingStep === 0 && 'Master the Ocean. Defy Time.'}
                  {bookingStep === 1 && 'Select View Date & Time'}
                  {bookingStep === 2 && 'Submit VIP Details'}
                </h1>
                
                <h3 className="sub-headline final-sub" data-animate="slide-up">
                  {bookingStep === 0 && 'Patravi ScubaTec Verde. Your partner in exploration.'}
                  {bookingStep === 1 && `Boutique Session // ${bookingData.boutique}`}
                  {bookingStep === 2 && 'Verify client contact information for your private viewing'}
                </h3>
                
                {bookingStep === 0 && (
                  <div className="cta-buttons-group" data-animate="slide-up">
                    <button 
                      className="cta-button-large glow-btn"
                      onClick={() => { playBezelTick(); setIsCartOpen(true); }}
                      onMouseEnter={handleHoverEvent}
                    >
                      Experience Patravi
                    </button>
                    
                    <button 
                      className="text-link-button"
                      onClick={() => { playBezelTick(); setBookingStep(1); }}
                      onMouseEnter={handleHoverEvent}
                    >
                      Book a Viewing <span className="arrow-right">→</span>
                    </button>
                  </div>
                )}

                {/* Booking Wizard container */}
                {bookingStep > 0 && (
                  <div className="booking-wizard-box" data-animate="slide-up">
                    
                    {/* WIZARD STEP 1: DATE & TIME SELECTOR */}
                    {bookingStep === 1 && (
                      <div className="wizard-step-panel">
                        <div className="booking-boutique-selector">
                          <label>BOUTIQUE SALON</label>
                          <select 
                            value={bookingData.boutique} 
                            onChange={(e) => handleBookingChange('boutique', e.target.value)}
                            onMouseEnter={handleHoverEvent}
                          >
                            <option value="Geneva Boutique">Geneva Boutique // Rue du Rhône 86</option>
                            <option value="Zürich Boutique">Zürich Boutique // Bahnhofstrasse 53</option>
                            <option value="New York Salon">New York Salon // Fifth Avenue 730</option>
                          </select>
                        </div>

                        <label className="form-grid-label">CHOOSE DATE</label>
                        <div className="calendar-grid-ui">
                          {availableDates.map((item) => (
                            <button
                              key={item.val}
                              className={`calendar-cell ${bookingData.date === item.val ? 'active' : ''}`}
                              onClick={() => { playBezelTick(); handleBookingChange('date', item.val); }}
                              onMouseEnter={handleHoverEvent}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        <label className="form-grid-label">CHOOSE TIME</label>
                        <div className="time-slots-ui">
                          {availableTimes.map((t) => (
                            <button
                              key={t}
                              className={`time-slot-btn ${bookingData.time === t ? 'active' : ''}`}
                              onClick={() => { playBezelTick(); handleBookingChange('time', t); }}
                              onMouseEnter={handleHoverEvent}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <div className="wizard-controls">
                          <button 
                            className="wizard-back-btn" 
                            onClick={() => { playBezelTick(); setBookingStep(0); }}
                            onMouseEnter={handleHoverEvent}
                          >
                            Cancel
                          </button>
                          <button 
                            className="cta-button-large wizard-next-btn" 
                            onClick={() => { playBezelTick(); setBookingStep(2); }}
                            onMouseEnter={handleHoverEvent}
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {/* WIZARD STEP 2: VIP CONTACT FIELDS */}
                    {bookingStep === 2 && (
                      <form onSubmit={(e) => { e.preventDefault(); setBookingStep(3); }} className="wizard-step-panel client-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>VIP CLIENT FULL NAME</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Sterling Archer" 
                              value={bookingData.name}
                              onChange={(e) => handleBookingChange('name', e.target.value)}
                              onMouseEnter={handleHoverEvent}
                            />
                          </div>
                          <div className="form-group">
                            <label>EMAIL ADDRESS</label>
                            <input 
                              type="email" 
                              required 
                              placeholder="e.g. archer@isis.org" 
                              value={bookingData.email}
                              onChange={(e) => handleBookingChange('email', e.target.value)}
                              onMouseEnter={handleHoverEvent}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>CONTACT PHONE NUMBER</label>
                            <input 
                              type="tel" 
                              required 
                              placeholder="+41 22 780 1234" 
                              value={bookingData.phone}
                              onChange={(e) => handleBookingChange('phone', e.target.value)}
                              onMouseEnter={handleHoverEvent}
                            />
                          </div>
                          <div className="form-group">
                            <label>CONCIERGE & DIETARY VIP REQUESTS</label>
                            <input 
                              type="text" 
                              placeholder="Dietary requests or specific watch models you'd like to inspect" 
                              value={bookingData.vipNotes}
                              onChange={(e) => handleBookingChange('vipNotes', e.target.value)}
                              onMouseEnter={handleHoverEvent}
                            />
                          </div>
                        </div>

                        <div className="wizard-controls">
                          <button 
                            type="button" 
                            className="wizard-back-btn" 
                            onClick={() => { playBezelTick(); setBookingStep(1); }}
                            onMouseEnter={handleHoverEvent}
                          >
                            Back
                          </button>
                          <button 
                            type="submit" 
                            className="cta-button-large wizard-submit-btn"
                            onMouseEnter={handleHoverEvent}
                          >
                            Securing Appointment
                          </button>
                        </div>
                      </form>
                    )}

                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* 5. INTERACTIVE BOUTIQUE EXP GRID DRAWER */}
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
              <button 
                className="boutique-action-btn"
                onClick={() => { playBezelTick(); setBookingData(prev => ({ ...prev, boutique: 'Geneva Boutique' })); setBookingStep(1); }}
                onMouseEnter={handleHoverEvent}
              >
                Schedule Appointment
              </button>
            </div>
            <div className="boutique-card">
              <span className="boutique-city">Zürich Boutique</span>
              <p className="boutique-address">Bahnhofstrasse 53, 8001 Zürich</p>
              <button 
                className="boutique-action-btn"
                onClick={() => { playBezelTick(); setBookingData(prev => ({ ...prev, boutique: 'Zürich Boutique' })); setBookingStep(1); }}
                onMouseEnter={handleHoverEvent}
              >
                Schedule Appointment
              </button>
            </div>
            <div className="boutique-card">
              <span className="boutique-city">New York Salon</span>
              <p className="boutique-address">Fifth Avenue 730, New York, NY 10019</p>
              <button 
                className="boutique-action-btn"
                onClick={() => { playBezelTick(); setBookingData(prev => ({ ...prev, boutique: 'New York Salon' })); setBookingStep(1); }}
                onMouseEnter={handleHoverEvent}
              >
                Schedule Appointment
              </button>
            </div>
          </div>
          
          <div className="boutique-footer">
            <p className="copylink">© 2026 Carl F. Bucherer. All Rights Reserved. Engineered in Switzerland.</p>
          </div>
        </div>
      </section>

      {/* 6. VIP CART CHECKOUT SLIDING DRAWER OVERLAY */}
      <div 
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={() => { playBezelTick(); setIsCartOpen(false); }}
      >
        <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="cart-drawer-header">
            <h3>Bespoke VIP Reservation</h3>
            <button 
              className="close-drawer-btn" 
              onClick={() => { playBezelTick(); setIsCartOpen(false); }}
              onMouseEnter={handleHoverEvent}
            >
              ✕
            </button>
          </div>

          {cartSuccess ? (
            // Cart Success Modal
            <div className="cart-success-view">
              <div className="success-icon-badge">●</div>
              <h3>Reservation Active</h3>
              <p>Your luxury watch reservation deposit has been registered successfully. A VIP Concierge Specialist will call you within 15 minutes to coordinate your boutique sizing and secure insured delivery.</p>
              
              <div className="cart-item-summary">
                <strong>Patravi ScubaTec Verde</strong>
                <span>Strap Type: {selectedStrap.toUpperCase()}</span>
                <span>Insured Deposit: $500.00 CHF</span>
              </div>
              
              <button 
                className="cta-button-large close-cart-success-btn"
                onClick={() => { playBezelTick(); setIsCartOpen(false); setCartSuccess(false); }}
                onMouseEnter={handleHoverEvent}
              >
                Return to Exhibition
              </button>
            </div>
          ) : (
            // Cart Reservation Form
            <form onSubmit={handleCheckoutSubmit} className="cart-checkout-form">
              <div className="cart-items-list">
                <div className="cart-product-item">
                  <div className={`cart-product-visual ${selectedStrap}`}></div>
                  <div className="cart-product-details">
                    <h4>Patravi ScubaTec Verde</h4>
                    <span className="cart-strap-desc">Configured: {selectedStrap.toUpperCase()} Strap</span>
                    <span className="cart-price">Total Value: {selectedStrap === 'titanium' ? '$7,400 CHF' : selectedStrap === 'rubber' ? '$6,800 CHF' : '$6,900 CHF'}</span>
                  </div>
                </div>
              </div>

              {/* Deposit Billing details */}
              <div className="cart-deposit-charge">
                <div className="deposit-row">
                  <span>Refundable Viewing Deposit:</span>
                  <strong>$500.00 CHF</strong>
                </div>
                <p className="deposit-disclaimer">Charging a fully refundable reservation deposit guarantees that this timepiece is immediately withdrawn from active public display and reserved for your inspection.</p>
              </div>

              {/* Payment Fields */}
              <div className="payment-fields-section">
                <div className="form-group">
                  <label>CARDHOLDER NAME</label>
                  <input type="text" required placeholder="Sterling Archer" onMouseEnter={handleHoverEvent} />
                </div>
                <div className="form-group">
                  <label>SECURE CREDIT CARD NUMBER</label>
                  <input type="text" maxLength="19" required placeholder="4000 1234 5678 9010" onMouseEnter={handleHoverEvent} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>EXP DATE</label>
                    <input type="text" maxLength="5" required placeholder="06/30" onMouseEnter={handleHoverEvent} />
                  </div>
                  <div className="form-group">
                    <label>CVV CODE</label>
                    <input type="text" maxLength="3" required placeholder="007" onMouseEnter={handleHoverEvent} />
                  </div>
                </div>
              </div>

              {/* Safety Assurances */}
              <div className="checkout-trust-badges">
                <div className="trust-badge-item">
                  <span className="badge-icon">🛡️</span>
                  <div className="badge-text">
                    <strong>Armored Insured Courier</strong>
                    <p>Insured complimentary Swiss transit.</p>
                  </div>
                </div>
                <div className="trust-badge-item">
                  <span className="badge-icon">🔬</span>
                  <div className="badge-text">
                    <strong>5-Year Chronometer Warranty</strong>
                    <p>Certified Swiss horology guarantees.</p>
                  </div>
                </div>
              </div>

              <button type="submit" className="cta-button-large secure-checkout-btn" onMouseEnter={handleHoverEvent}>
                Confirm Reservation // $500 CHF
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

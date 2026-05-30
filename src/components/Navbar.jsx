import React from 'react';

export default function Navbar({ 
  scrolled, 
  isLoaded, 
  activeIndex, 
  isAudioPlaying, 
  handleAudioToggle, 
  handleHoverEvent, 
  setIsCartOpen 
}) {
  return (
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
            onClick={() => { setIsCartOpen(true); }}
            onMouseEnter={handleHoverEvent}
          >
            Experience Patravi
          </button>
        </div>
      </div>
    </nav>
  );
}

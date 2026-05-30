import React from 'react';

export default function StrapConfigurator({ 
  selectedStrap, 
  setSelectedStrap, 
  handleHoverEvent, 
  playBezelTick 
}) {
  const selectStrap = (strap) => {
    playBezelTick();
    setSelectedStrap(strap);
  };

  return (
    <div className="strap-configurator-wrapper">
      {/* Swatch Selector Controls */}
      <div className="strap-configurator-swatches">
        <button 
          className={`swatch-btn textile ${selectedStrap === 'textile' ? 'active' : ''}`}
          onClick={() => selectStrap('textile')}
          onMouseEnter={handleHoverEvent}
          title="Woven Green Eco-Textile"
        >
          <span className="swatch-color green-textile"></span>
          <span className="swatch-name">TEXTILE</span>
        </button>
        
        <button 
          className={`swatch-btn rubber ${selectedStrap === 'rubber' ? 'active' : ''}`}
          onClick={() => selectStrap('rubber')}
          onMouseEnter={handleHoverEvent}
          title="Signature Wave Black Rubber"
        >
          <span className="swatch-color black-rubber"></span>
          <span className="swatch-name">RUBBER</span>
        </button>
        
        <button 
          className={`swatch-btn titanium ${selectedStrap === 'titanium' ? 'active' : ''}`}
          onClick={() => selectStrap('titanium')}
          onMouseEnter={handleHoverEvent}
          title="Sandblasted Titanium Link"
        >
          <span className="swatch-color titanium-metal"></span>
          <span className="swatch-name">TITANIUM</span>
        </button>
      </div>

      {/* Dynamic Showcase Text & Mockup Box */}
      <div className="configurator-showcase">
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
  );
}

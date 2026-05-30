import React from 'react';

export default function SpecsTabs({ 
  activeSpecTab, 
  setActiveSpecTab, 
  handleHoverEvent, 
  playBezelTick 
}) {
  const selectTab = (tab) => {
    playBezelTick();
    setActiveSpecTab(tab);
  };

  return (
    <div className="specs-tabs-wrapper">
      {/* Interactive Specifications Tabs Selector */}
      <div className="specs-tabs-container">
        <button 
          className={`spec-tab-btn ${activeSpecTab === 'movement' ? 'active' : ''}`}
          onClick={() => selectTab('movement')}
          onMouseEnter={handleHoverEvent}
        >
          Calibre CFB
        </button>
        <button 
          className={`spec-tab-btn ${activeSpecTab === 'casing' ? 'active' : ''}`}
          onClick={() => selectTab('casing')}
          onMouseEnter={handleHoverEvent}
        >
          Casing & Crystal
        </button>
        <button 
          className={`spec-tab-btn ${activeSpecTab === 'dive' ? 'active' : ''}`}
          onClick={() => selectTab('dive')}
          onMouseEnter={handleHoverEvent}
        >
          Dive Shield
        </button>
      </div>

      {/* Specs Panels */}
      <div className="specs-panel-content">
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
  );
}

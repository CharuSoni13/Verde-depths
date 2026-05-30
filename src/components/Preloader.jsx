import React from 'react';

export default function Preloader({ loadingProgress, loaderStatus, isLoaded }) {
  // SVG perimeter for r=45 track is 2 * Math.PI * 45 ≈ 283
  const loaderOffset = 283 - (283 * (loadingProgress / 100));

  return (
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
  );
}

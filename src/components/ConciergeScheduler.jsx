import React from 'react';

// Calendar dates mock (June 1st to June 6th)
const availableDates = [
  { label: 'MON // JUN 1', val: '2026-06-01' },
  { label: 'TUE // JUN 2', val: '2026-06-02' },
  { label: 'WED // JUN 3', val: '2026-06-03' },
  { label: 'THU // JUN 4', val: '2026-06-04' },
  { label: 'FRI // JUN 5', val: '2026-06-05' },
  { label: 'SAT // JUN 6', val: '2026-06-06' }
];

const availableTimes = ['10:00 AM', '12:30 PM', '02:00 PM', '04:30 PM', '06:00 PM'];

export default function ConciergeScheduler({
  bookingStep,
  setBookingStep,
  bookingData,
  handleBookingChange,
  playBezelTick,
  handleHoverEvent,
  setIsCartOpen
}) {
  const proceedStep = (step) => {
    playBezelTick();
    setBookingStep(step);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    playBezelTick();
    setBookingStep(3);
  };

  return (
    <div className="concierge-scheduler-wrapper">
      {bookingStep === 3 ? (
        // Booking Complete State
        <div className="success-wizard">
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
            onClick={() => proceedStep(0)}
            onMouseEnter={handleHoverEvent}
          >
            Book Another Appointment
          </button>
        </div>
      ) : (
        // Active Booking States
        <>
          <h1 className="main-headline final-headline">
            {bookingStep === 0 && 'Master the Ocean. Defy Time.'}
            {bookingStep === 1 && 'Select View Date & Time'}
            {bookingStep === 2 && 'Submit VIP Details'}
          </h1>
          
          <h3 className="sub-headline final-sub">
            {bookingStep === 0 && 'Patravi ScubaTec Verde. Your partner in exploration.'}
            {bookingStep === 1 && `Boutique Session // ${bookingData.boutique}`}
            {bookingStep === 2 && 'Verify client contact information for your private viewing'}
          </h3>
          
          {bookingStep === 0 && (
            <div className="cta-buttons-group">
              <button 
                className="cta-button-large glow-btn"
                onClick={() => { playBezelTick(); setIsCartOpen(true); }}
                onMouseEnter={handleHoverEvent}
              >
                Experience Patravi
              </button>
              
              <button 
                className="text-link-button"
                onClick={() => proceedStep(1)}
                onMouseEnter={handleHoverEvent}
              >
                Book a Viewing <span className="arrow-right">→</span>
              </button>
            </div>
          )}

          {/* Booking Wizard container */}
          {bookingStep > 0 && (
            <div className="booking-wizard-box">
              
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
                        type="button"
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
                        type="button"
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
                      type="button"
                      className="wizard-back-btn" 
                      onClick={() => proceedStep(0)}
                      onMouseEnter={handleHoverEvent}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      className="cta-button-large wizard-next-btn" 
                      onClick={() => proceedStep(2)}
                      onMouseEnter={handleHoverEvent}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* WIZARD STEP 2: VIP CONTACT FIELDS */}
              {bookingStep === 2 && (
                <form onSubmit={handleFormSubmit} className="wizard-step-panel client-form">
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
                      <label>CONCIERGE VIP REQUESTS</label>
                      <input 
                        type="text" 
                        placeholder="Specific watch configs or boutique requests" 
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
                      onClick={() => proceedStep(1)}
                      onMouseEnter={handleHoverEvent}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="cta-button-large wizard-submit-btn"
                      onMouseEnter={handleHoverEvent}
                    >
                      Secure Appointment
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
        </>
      )}
    </div>
  );
}

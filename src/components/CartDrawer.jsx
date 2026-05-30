import React from 'react';

export default function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  selectedStrap,
  cartSuccess,
  setCartSuccess,
  playBezelTick,
  handleHoverEvent
}) {
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    playBezelTick();
    setCartSuccess(true);
  };

  const getWatchPrice = () => {
    return selectedStrap === 'titanium' ? '$7,400 CHF' : selectedStrap === 'rubber' ? '$6,800 CHF' : '$6,900 CHF';
  };

  return (
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
                  <span className="cart-price">Total Value: {getWatchPrice()}</span>
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
  );
}

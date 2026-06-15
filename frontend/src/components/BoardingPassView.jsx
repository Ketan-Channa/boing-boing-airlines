import React, { useState, useEffect } from 'react';
import { Printer, Plane, CheckSquare, ArrowRight } from 'lucide-react';

export default function BoardingPassView({ showToast, preloadedPnr, clearPreloadedPnr }) {
  const [pnr, setPnr]               = useState('');
  const [reservation, setReservation] = useState(null);
  const [searching, setSearching]   = useState(false);

  const [passAesthetic, setPassAesthetic] = useState({
    seat: '12A', gate: 'D-34', class: 'Economy', boardingTime: '08:45 AM',
  });

  // Auto-fetch when a preloaded PNR is passed in from BookFlightView
  useEffect(() => {
    if (preloadedPnr) {
      setPnr(preloadedPnr);
      fetchPass(preloadedPnr);
      // Clear the preloaded PNR so navigating away and back doesn't auto-fetch again
      if (clearPreloadedPnr) clearPreloadedPnr();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadedPnr]);

  const fetchPass = async (pnrValue) => {
    const target = (pnrValue || pnr).trim();
    if (!target) { showToast('Please enter a PNR number', 'error'); return; }
    setSearching(true);
    setReservation(null);
    try {
      const res  = await fetch(`/api/reservations/${target}`);
      const data = await res.json();
      if (data.success) {
        setReservation(data.reservation);
        const row    = Math.floor(1 + Math.random() * 32);
        const col    = ['A','B','C','D','E','F'][Math.floor(Math.random() * 6)];
        const gates  = ['A-10','B-14','C-08','D-22','E-03'];
        const classes= ['First Class','Business','Premium Economy','Economy'];
        const h      = Math.floor(1 + Math.random() * 12);
        const m      = ['00','15','30','45'][Math.floor(Math.random() * 4)];
        const ap     = Math.random() > 0.5 ? 'AM' : 'PM';
        setPassAesthetic({
          seat        : data.reservation.seat_number || `${row}${col}`,
          gate        : gates[Math.floor(Math.random() * gates.length)],
          class       : data.reservation.cabin_class || classes[Math.floor(Math.random() * classes.length)],
          boardingTime: `${h}:${m} ${ap}`,
        });
        showToast('Boarding pass compiled');
      } else {
        showToast('Invalid PNR. Please try again.', 'error');
      }
    } catch {
      showToast('Connection to server failed', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleFetchPass = async (e) => {
    e.preventDefault();
    await fetchPass(pnr);
  };

  const handlePrint = () => window.print();

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Boarding Pass Portal</h2>
          <p className="panel-subtitle">
            {preloadedPnr
              ? 'Loading your boarding pass…'
              : 'Look up a reservation PNR to print a high-fidelity boarding card'}
          </p>
        </div>
      </div>

      {/* PNR search form */}
      <form onSubmit={handleFetchPass}
        className="search-header"
        style={{ justifyContent:'flex-start', gap:'1rem', flexWrap:'wrap' }}
      >
        <div className="form-group" style={{ minWidth:'260px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter reservation PNR"
            value={pnr}
            onChange={e => setPnr(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={searching}>
          {searching ? 'Compiling…' : 'ENTER'}
        </button>
      </form>

      {reservation ? (
        <div style={{ animation:'fadeIn 0.3s', marginTop:'2rem' }}>
          {/* Action buttons */}
          <div className="boarding-pass-print-btn no-print">
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={18} />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          {/* Physical Boarding Pass */}
          <div className="boarding-pass-card" id="printable-boarding-pass">
            <div className="boarding-pass-cutout-top"></div>
            <div className="boarding-pass-cutout-bottom"></div>

            {/* Left main stub */}
            <div className="main-pass">
              <div className="pass-header">
                <div className="pass-brand">
                  <Plane size={24} style={{ transform:'rotate(45deg)', color:'#1e3a8a' }} />
                  <span className="pass-logo">BOING BOING AIRLINES</span>
                </div>
                <div className="pass-title">Boarding Pass</div>
              </div>

              <div className="flight-destinations">
                <div className="destination-airport">
                  <span className="airport-code">{reservation.src ? reservation.src.substring(0,3).toUpperCase() : 'SRC'}</span>
                  <span className="airport-name">{reservation.src}</span>
                </div>
                <div className="flight-icon-wrapper">
                  <div className="flight-icon-line"></div>
                  <div className="flight-icon-plane">
                    <Plane size={20} style={{ transform:'rotate(90deg)' }} />
                  </div>
                </div>
                <div className="destination-airport" style={{ alignItems:'flex-end' }}>
                  <span className="airport-code">{reservation.dest ? reservation.dest.substring(0,3).toUpperCase() : 'DST'}</span>
                  <span className="airport-name">{reservation.dest}</span>
                </div>
              </div>

              <div className="passenger-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Passenger Name</span>
                  <span className="detail-value">{reservation.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Flight Code</span>
                  <span className="detail-value" style={{ color:'#1e3a8a' }}>{reservation.flightcode}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date of Travel</span>
                  <span className="detail-value">{reservation.ddate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Gate</span>
                  <span className="detail-value" style={{ color:'#d97706' }}>{passAesthetic.gate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Seat Assignment</span>
                  <span className="detail-value">{passAesthetic.seat}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Boarding Time</span>
                  <span className="detail-value">{passAesthetic.boardingTime}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Class</span>
                  <span className="detail-value">{passAesthetic.class}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Journey Type</span>
                  <span className="detail-value">{reservation.ticket_type || 'ONE-WAY'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Baggage Allowance</span>
                  <span className="detail-value">{reservation.extra_luggage || 25} KG</span>
                </div>
                {reservation.return_date && (
                  <div className="detail-item">
                    <span className="detail-label">Return Date</span>
                    <span className="detail-value" style={{ color:'#b45309' }}>{reservation.return_date}</span>
                  </div>
                )}
              </div>

              {/* PNR & Ticket prominently */}
              <div style={{
                display:'flex', gap:'2rem', marginTop:'1.5rem',
                paddingTop:'1rem', borderTop:'2px dashed #e2e8f0',
              }}>
                <div>
                  <span style={{ fontSize:'0.6875rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em' }}>PNR Code</span>
                  <div style={{ fontSize:'1.25rem', fontWeight:900, color:'#1e3a8a', letterSpacing:'0.05em' }}>{reservation.PNR}</div>
                </div>
                <div>
                  <span style={{ fontSize:'0.6875rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em' }}>Ticket ID</span>
                  <div style={{ fontSize:'1.25rem', fontWeight:900, color:'#7c3aed', letterSpacing:'0.05em' }}>{reservation.TICKET}</div>
                </div>
              </div>
            </div>

            {/* Right perforated stub */}
            <div className="stub-pass">
              <div>
                <div className="stub-header">Flight Stub</div>
                <div className="stub-destinations">
                  <span className="stub-airport-code">{reservation.src ? reservation.src.substring(0,3).toUpperCase() : 'SRC'}</span>
                  <ArrowRight size={14} style={{ color:'#94a3b8' }} />
                  <span className="stub-airport-code">{reservation.dest ? reservation.dest.substring(0,3).toUpperCase() : 'DST'}</span>
                </div>
                <div className="stub-details">
                  <div className="detail-item">
                    <span className="detail-label">Passenger</span>
                    <span className="detail-value" style={{ fontSize:'0.875rem' }}>{reservation.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Seat</span>
                    <span className="detail-value">{passAesthetic.seat}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Baggage</span>
                    <span className="detail-value">{reservation.extra_luggage || 25} KG</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Gate</span>
                    <span className="detail-value">{passAesthetic.gate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Flight</span>
                    <span className="detail-value">{reservation.flightcode}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date</span>
                    <span className="detail-value" style={{ fontSize:'0.875rem' }}>{reservation.ddate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">PNR</span>
                    <span className="detail-value" style={{ fontSize:'0.8125rem', color:'#1e3a8a' }}>{reservation.PNR}</span>
                  </div>
                </div>
              </div>
              <div className="barcode-wrapper">
                <div className="barcode"></div>
                <span className="barcode-text">{reservation.TICKET}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', gap:'2rem', marginTop:'2rem' }}>
          <div style={{ flex:1 }}>
            <div className="empty-state">
              <CheckSquare className="empty-icon" />
              <p>
                {searching
                  ? 'Fetching boarding pass…'
                  : 'Type in a reservation PNR above to generate the boarding pass card'}
              </p>
            </div>
          </div>
          <div className="layout-image-container" style={{ width:'300px' }}>
            <img src="/icons/unnamed.png" alt="Boarding Pass Visual" className="layout-image" style={{ aspectRatio:'1/1' }} />
          </div>
        </div>
      )}
    </div>
  );
}

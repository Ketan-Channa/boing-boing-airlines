import React, { useState } from 'react';

export default function CancelTicketView({ showToast, setActiveTab }) {
  const [pnr, setPnr] = useState('');
  const [reservation, setReservation] = useState(null);
  const [cancelId, setCancelId] = useState('');
  const [searching, setSearching] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleFetch = async () => {
    if (!pnr.trim()) {
      showToast('Please enter a PNR number', 'error');
      return;
    }
    setSearching(true);
    setReservation(null);
    try {
      const response = await fetch(`/api/reservations/${pnr.trim()}`);
      const data = await response.json();
      if (data.success) {
        setReservation(data.reservation);
        // Generate random cancel ID like Java (random.nextInt(100000))
        setCancelId(String(Math.floor(10000 + Math.random() * 90000)));
        showToast('Booking details fetched');
      } else {
        showToast(data.message || 'INVALID CREDENTIALS', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to database', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleCancelFlight = async (e) => {
    e.preventDefault();
    if (!reservation) return;

    setCancelling(true);
    try {
      const payload = {
        pnr: reservation.PNR,
        name: reservation.name,
        cancelno: cancelId,
        fcode: reservation.flightcode,
        date: reservation.ddate
      };
      
      const response = await fetch('/api/reservations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        showToast('TICKET CANCELLED SUCCESSFULLY');
        setReservation(null);
        setPnr('');
        setActiveTab('dashboard');
      } else {
        showToast(data.message || 'Error executing cancellation', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error while canceling ticket', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Cancel Flight Tickets</h2>
          <p className="panel-subtitle">Revoke passenger bookings, issue refund claims, and remove allocations from database</p>
        </div>
      </div>

      <div className="layout-split">
        <div className="layout-form">
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">PNR Lookup</label>
            <div className="lookup-group">
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter PNR code" 
                value={pnr}
                onChange={(e) => setPnr(e.target.value)}
              />
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleFetch}
                disabled={searching}
              >
                {searching ? 'Querying...' : 'SHOW DETAILS'}
              </button>
            </div>
          </div>

          {reservation && (
            <form onSubmit={handleCancelFlight} style={{ animation: 'fadeIn 0.2s' }}>
              <div className="form-grid" style={{ marginBottom: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Passenger Name</label>
                  <div style={{ fontWeight: 'bold' }}>{reservation.name}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Cancel ID (Randomized)</label>
                  <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{cancelId}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Flight Code</label>
                  <div><code>{reservation.flightcode}</code></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Travel Date</label>
                  <div>{reservation.ddate}</div>
                </div>
              </div>

              <div className="btn-group">
                <button type="submit" className="btn btn-danger" disabled={cancelling}>
                  {cancelling ? 'Revoking...' : 'CANCEL FLIGHTS'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('dashboard')}>
                  BACK
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="layout-image-container">
          <img src="/icons/cancelflight.jpg" alt="Cancel Flight Visual" className="layout-image" />
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { FileText } from 'lucide-react';

export default function JourneyDetailsView({ showToast, setActiveTab }) {
  const [pnr, setPnr] = useState('');
  const [reservation, setReservation] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
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
        showToast('Reservation loaded');
      } else {
        showToast(data.message || 'NO INFORMATION FOUND', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error querying database PNR', 'error');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Passenger Journey Records</h2>
          <p className="panel-subtitle">Look up active airline reservations and flight allocations by PNR</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setActiveTab('dashboard')}>
          BACK
        </button>
      </div>

      <form onSubmit={handleSearch} className="search-header" style={{ justifyContent: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ minWidth: '260px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Enter PNR number" 
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={searching}>
          {searching ? 'Loading...' : 'SHOW DETAILS'}
        </button>
      </form>

      {reservation ? (
        <div className="table-container" style={{ animation: 'fadeIn 0.2s' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>PNR</th>
                <th>Ticket ID</th>
                <th>Aadhar ID</th>
                <th>Name</th>
                <th>Nationality</th>
                <th>Flight Name</th>
                <th>Flight Code</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Date</th>
                <th>Seats</th>
                <th>Class</th>
                <th>Meal</th>
                <th>Wi-Fi</th>
                <th>Baggage</th>
                <th>Price</th>
                <th>Ticket Type</th>
                <th>Return Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{reservation.PNR}</td>
                <td><code>{reservation.TICKET}</code></td>
                <td>{reservation.aadhar}</td>
                <td>{reservation.name}</td>
                <td>{reservation.nationality}</td>
                <td>{reservation.flightname}</td>
                <td>{reservation.flightcode}</td>
                <td>{reservation.src}</td>
                <td>{reservation.dest}</td>
                <td>{reservation.ddate}</td>
                <td style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{reservation.seat_number || '—'}</td>
                <td>{reservation.cabin_class || 'ECONOMY'}</td>
                <td>{reservation.meal_included ? 'Yes' : 'No'}</td>
                <td>{reservation.wifi_included ? 'Yes' : 'No'}</td>
                <td>{reservation.extra_luggage || 25} KG</td>
                <td style={{ fontWeight: 'bold', color: '#10b981' }}>₹{Number(reservation.total_price).toLocaleString('en-IN')}</td>
                <td style={{ fontWeight: 'bold', color: reservation.ticket_type === 'ROUND-TRIP' ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {reservation.ticket_type || 'ONE-WAY'}
                </td>
                <td>{reservation.return_date || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <FileText className="empty-icon" />
          <p>Provide a valid passenger PNR above to display reservation credentials</p>
        </div>
      )}
    </div>
  );
}

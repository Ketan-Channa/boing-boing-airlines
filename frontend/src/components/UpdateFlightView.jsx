import React, { useState } from 'react';
import { Search, Edit3, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const CABIN_CLASSES = ['ECONOMY','PREMIUM ECONOMY','BUSINESS','FIRST CLASS'];

export default function UpdateFlightView({ showToast, setActiveTab }) {
  const [pnr, setPnr]               = useState('');
  const [reservation, setReservation] = useState(null);
  const [searching, setSearching]   = useState(false);
  const [updating, setUpdating]     = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled]   = useState(false);
  const [refundShown, setRefundShown] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const [form, setForm] = useState({
    ddate:'', return_date:'', cabin_class:'ECONOMY',
    seat_number:'', meal_included:false, wifi_included:false,
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) { showToast('Enter a PNR number','error'); return; }
    setSearching(true);
    setReservation(null); setCancelled(false); setConfirmCancel(false);
    try {
      const res  = await fetch(`/api/reservations/${pnr.trim()}`);
      const data = await res.json();
      if (data.success) {
        const r = data.reservation;
        setReservation(r);
        setForm({
          ddate         : r.ddate||'',
          return_date   : r.return_date||'',
          cabin_class   : r.cabin_class||'ECONOMY',
          seat_number   : r.seat_number||'',
          meal_included : !!r.meal_included,
          wifi_included : !!r.wifi_included,
        });
        showToast('Reservation found');
      } else {
        showToast('PNR not found','error');
      }
    } catch { showToast('Server error','error'); }
    finally { setSearching(false); }
  };

  const handleUpdate = async () => {
    if (!form.ddate) { showToast('Travel date is required','error'); return; }
    setUpdating(true);
    try {
      const res  = await fetch(`/api/reservations/${pnr.trim()}`,{
        method :'PUT',
        headers:{'Content-Type':'application/json'},
        body   : JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { showToast('Booking updated successfully!'); }
      else showToast(data.message||'Update failed','error');
    } catch { showToast('Server error','error'); }
    finally { setUpdating(false); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const refund = Math.round((reservation.total_price||0) * 0.75);
      const res  = await fetch('/api/reservations/cancel',{
        method :'POST',
        headers:{'Content-Type':'application/json'},
        body   : JSON.stringify({
          pnr         : reservation.PNR,
          name        : reservation.name,
          cancelno    : `CAN-${Math.floor(10000+Math.random()*90000)}`,
          fcode       : reservation.flightcode,
          date        : reservation.ddate,
          refundAmount: refund,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelled(true);
        setRefundShown(refund);
        setReservation(null);
        showToast('Booking cancelled. Refund initiated.');
      } else showToast(data.message||'Cancellation failed','error');
    } catch { showToast('Server error','error'); }
    finally { setCancelling(false); setConfirmCancel(false); }
  };

  const field = (label, id, type='text', value, onChange, placeholder) => (
    <div className="form-group" key={id}>
      <label className="form-label" htmlFor={id}>{label}</label>
      <input id={id} type={type} className="form-input" value={value}
        onChange={e=>onChange(e.target.value)} placeholder={placeholder||label}/>
    </div>
  );

  return (
    <div className="panel" style={{animation:'fadeIn 0.2s'}}>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Update / Cancel Booking</h2>
          <p className="panel-subtitle">Look up a reservation by PNR to modify travel details or cancel the ticket</p>
        </div>
        <button className="btn btn-secondary" onClick={()=>setActiveTab('dashboard')}>BACK</button>
      </div>

      {/* PNR Search */}
      <form onSubmit={handleSearch} style={{display:'flex',gap:'0.75rem',marginBottom:'2rem',maxWidth:'480px'}}>
        <input type="text" className="form-input" placeholder="Enter reservation PNR (e.g. PNR-123456)"
          value={pnr} onChange={e=>setPnr(e.target.value)}/>
        <button type="submit" className="btn btn-primary" disabled={searching}>
          <Search size={18}/>{searching?'Searching…':'FIND'}
        </button>
      </form>

      {/* Cancellation success */}
      {cancelled && refundShown !== null && (
        <div style={{
          padding:'2rem',background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.3)',
          borderRadius:'12px',textAlign:'center',animation:'fadeIn 0.3s',
        }}>
          <CheckCircle2 size={48} style={{color:'#10b981',marginBottom:'1rem'}}/>
          <h3 style={{color:'#10b981',fontWeight:'900',marginBottom:'0.5rem'}}>Booking Cancelled</h3>
          <p style={{color:'var(--text-secondary)',marginBottom:'1rem'}}>Your ticket has been cancelled successfully.</p>
          <div style={{display:'inline-block',padding:'0.75rem 2rem',background:'rgba(16,185,129,0.15)',borderRadius:'10px',border:'1px solid rgba(16,185,129,0.3)'}}>
            <div style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em'}}>Refund Amount (75%)</div>
            <div style={{fontSize:'2rem',fontWeight:'900',color:'#10b981'}}>{fmt(refundShown)}</div>
            <div style={{fontSize:'0.8125rem',color:'var(--text-muted)'}}>will be credited within 5-7 business days</div>
          </div>
        </div>
      )}

      {/* Reservation editor */}
      {reservation && !cancelled && (
        <div style={{animation:'fadeIn 0.3s'}}>
          {/* Current Booking Info */}
          <div style={{
            padding:'1.25rem 1.5rem',background:'rgba(56,189,248,0.05)',
            border:'1px solid rgba(56,189,248,0.15)',borderRadius:'12px',marginBottom:'2rem',
          }}>
            <div style={{fontWeight:'800',marginBottom:'1rem',color:'var(--primary)',fontSize:'0.875rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Current Booking</div>
            <div className="form-grid">
              {[
                ['PNR',reservation.PNR], ['Ticket',reservation.TICKET],
                ['Passenger',reservation.name], ['Flight',`${reservation.flightname} (${reservation.flightcode})`],
                ['Route',`${reservation.src} → ${reservation.dest}`], ['Travel Date',reservation.ddate],
                ['Class',reservation.cabin_class||'ECONOMY'], ['Seat',reservation.seat_number||'—'],
                ['Total Paid',fmt(reservation.total_price||0)], ['Payment',reservation.payment_method||'—'],
              ].map(([l,v])=>(
                <div key={l}><label className="form-label" style={{color:'var(--text-muted)'}}>{l}</label><div style={{fontWeight:'700'}}>{v}</div></div>
              ))}
            </div>
          </div>

          {/* Edit Form */}
          <div style={{fontWeight:'800',marginBottom:'1rem',fontSize:'0.875rem',textTransform:'uppercase',letterSpacing:'0.05em',color:'var(--text-secondary)'}}>
            <Edit3 size={14} style={{marginRight:'0.4rem',verticalAlign:'middle'}}/>
            Modify Booking
          </div>
          <div className="form-grid" style={{marginBottom:'1.5rem'}}>
            {field('New Travel Date','ddate','date',form.ddate,v=>setForm(f=>({...f,ddate:v})))}
            {field('Return Date (if round-trip)','rdate','date',form.return_date,v=>setForm(f=>({...f,return_date:v})))}
            <div className="form-group">
              <label className="form-label">Cabin Class</label>
              <select className="form-select" value={form.cabin_class} onChange={e=>setForm(f=>({...f,cabin_class:e.target.value}))}>
                {CABIN_CLASSES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {field('Seat Number','seat','text',form.seat_number,v=>setForm(f=>({...f,seat_number:v})),'e.g. 12A')}
          </div>

          <div style={{display:'flex',gap:'1rem',marginBottom:'2rem',flexWrap:'wrap'}}>
            <label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer'}}>
              <input type="checkbox" checked={form.meal_included} onChange={e=>setForm(f=>({...f,meal_included:e.target.checked}))}/>
              <span style={{fontWeight:'600'}}>Meal Inclusion</span>
            </label>
            <label style={{display:'flex',alignItems:'center',gap:'0.5rem',cursor:'pointer'}}>
              <input type="checkbox" checked={form.wifi_included} onChange={e=>setForm(f=>({...f,wifi_included:e.target.checked}))}/>
              <span style={{fontWeight:'600'}}>Wi-Fi</span>
            </label>
          </div>

          <div className="btn-group">
            <button type="button" className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
              <Edit3 size={18}/>{updating?'Updating…':'UPDATE BOOKING'}
            </button>
            <button type="button" className="btn btn-secondary"
              style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#ef4444'}}
              onClick={()=>setConfirmCancel(true)}>
              <Trash2 size={18}/>CANCEL BOOKING
            </button>
          </div>

          {/* Cancel Confirmation Dialog */}
          {confirmCancel && (
            <div style={{
              marginTop:'1.5rem',padding:'1.5rem',
              background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.3)',
              borderRadius:'12px',animation:'fadeIn 0.2s',
            }}>
              <div style={{display:'flex',gap:'0.75rem',alignItems:'flex-start',marginBottom:'1rem'}}>
                <AlertTriangle size={20} style={{color:'#ef4444',flexShrink:0,marginTop:2}}/>
                <div>
                  <div style={{fontWeight:'800',color:'#ef4444',marginBottom:'0.25rem'}}>Confirm Cancellation</div>
                  <div style={{fontSize:'0.875rem',color:'var(--text-secondary)'}}>
                    Are you sure you want to cancel PNR <strong>{reservation.PNR}</strong>?
                    You will receive a refund of{' '}
                    <strong style={{color:'#10b981'}}>{fmt(Math.round((reservation.total_price||0)*0.75))}</strong>{' '}
                    (75% of {fmt(reservation.total_price||0)}).
                  </div>
                </div>
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-primary"
                  style={{background:'#ef4444',borderColor:'#ef4444'}}
                  onClick={handleCancel} disabled={cancelling}>
                  {cancelling?'Cancelling…':'YES, CANCEL TICKET'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={()=>setConfirmCancel(false)}>
                  No, Keep Booking
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

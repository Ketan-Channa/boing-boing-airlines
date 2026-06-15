import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Printer, ArrowRight, Plane, Tag, CreditCard,
  Smartphone, Building2, MapPin, Utensils, Wifi, User,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const CABIN_ZONES = [
  { label:'First Class',       rows:[1,4],   col:'#fbbf24', bg:'rgba(251,191,36,0.12)',  priceKey:'price_first'   },
  { label:'Business Class',    rows:[5,10],  col:'#818cf8', bg:'rgba(129,140,248,0.12)', priceKey:'price_business' },
  { label:'Premium Economy',   rows:[11,15], col:'#38bdf8', bg:'rgba(56,189,248,0.12)',  priceKey:'price_economy', premMulti:1.3 },
  { label:'Economy',           rows:[16,30], col:'#6ee7b7', bg:'rgba(110,231,183,0.08)', priceKey:'price_economy' },
];

function getZone(row) {
  return CABIN_ZONES.find(z => row >= z.rows[0] && row <= z.rows[1]) || CABIN_ZONES[3];
}

function getSeatPrice(flight, row) {
  const z = getZone(row);
  const base = flight?.[z.priceKey] || 0;
  return z.premMulti ? Math.round(base * z.premMulti) : base;
}

// ─── Boarding Pass Card (same as before) ─────────────────────────────────────
function BoardingPassCard({ ticket }) {
  const [pass] = useState(() => {
    const row = Math.floor(1+Math.random()*32);
    const col = ['A','B','C','D','E','F'][Math.floor(Math.random()*6)];
    const gates = ['A-10','B-14','C-08','D-22','E-03'];
    const h = Math.floor(1+Math.random()*12);
    const m = ['00','15','30','45'][Math.floor(Math.random()*4)];
    const ap = Math.random()>0.5?'AM':'PM';
    return {
      seat: ticket.seatNumber || `${row}${col}`,
      gate: gates[Math.floor(Math.random()*gates.length)],
      boardingTime: `${h}:${m} ${ap}`,
    };
  });
  const src3 = (ticket.source||'SRC').substring(0,3).toUpperCase();
  const dst3 = (ticket.destination||'DST').substring(0,3).toUpperCase();
  return (
    <div className="boarding-pass-card" id="printable-boarding-pass">
      <div className="boarding-pass-cutout-top"/>
      <div className="boarding-pass-cutout-bottom"/>
      <div className="main-pass">
        <div className="pass-header">
          <div className="pass-brand">
            <Plane size={24} style={{transform:'rotate(45deg)',color:'#1e3a8a'}}/>
            <span className="pass-logo">BOING BOING AIRLINES</span>
          </div>
          <div className="pass-title">Boarding Pass</div>
        </div>
        <div className="flight-destinations">
          <div className="destination-airport">
            <span className="airport-code">{src3}</span>
            <span className="airport-name">{ticket.source}</span>
          </div>
          <div className="flight-icon-wrapper">
            <div className="flight-icon-line"/>
            <div className="flight-icon-plane"><Plane size={20} style={{transform:'rotate(90deg)'}}/></div>
          </div>
          <div className="destination-airport" style={{alignItems:'flex-end'}}>
            <span className="airport-code">{dst3}</span>
            <span className="airport-name">{ticket.destination}</span>
          </div>
        </div>
        <div className="passenger-details-grid">
          {[
            ['Passenger',ticket.name], ['Flight',ticket.flightcode],
            ['Class',ticket.cabinClass], ['Seat',pass.seat],
            ['Gate',pass.gate], ['Date',ticket.date],
            ['Boarding',pass.boardingTime], ['Type',ticket.ticketType],
            ['Baggage', `${ticket.extraLuggage || 25} KG`],
            ticket.mealIncluded && ['Meal','Included'],
            ticket.wifiIncluded && ['Wi-Fi','Included'],
          ].filter(Boolean).map(([l,v])=>(
            <div className="detail-item" key={l}>
              <span className="detail-label">{l}</span>
              <span className="detail-value">{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:'2rem',marginTop:'1.5rem',paddingTop:'1rem',borderTop:'2px dashed #e2e8f0'}}>
          <div>
            <span style={{fontSize:'0.6875rem',fontWeight:800,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em'}}>PNR Code</span>
            <div style={{fontSize:'1.25rem',fontWeight:900,color:'#1e3a8a'}}>{ticket.pnr}</div>
          </div>
          <div>
            <span style={{fontSize:'0.6875rem',fontWeight:800,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em'}}>Ticket ID</span>
            <div style={{fontSize:'1.25rem',fontWeight:900,color:'#7c3aed'}}>{ticket.ticket}</div>
          </div>
          <div>
            <span style={{fontSize:'0.6875rem',fontWeight:800,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em'}}>Total Paid</span>
            <div style={{fontSize:'1.25rem',fontWeight:900,color:'#10b981'}}>{fmt(ticket.totalPrice)}</div>
          </div>
        </div>
      </div>
      <div className="stub-pass">
        <div>
          <div className="stub-header">Flight Stub</div>
          <div className="stub-destinations">
            <span className="stub-airport-code">{src3}</span>
            <ArrowRight size={14} style={{color:'#94a3b8'}}/>
            <span className="stub-airport-code">{dst3}</span>
          </div>
          <div className="stub-details">
            {[
              ['Passenger',ticket.name],['Seat',pass.seat],['Gate',pass.gate],
              ['Flight',ticket.flightcode],['Date',ticket.date],['PNR',ticket.pnr],
            ].map(([l,v])=>(
              <div className="detail-item" key={l}>
                <span className="detail-label">{l}</span>
                <span className="detail-value" style={{fontSize:'0.875rem'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="barcode-wrapper">
          <div className="barcode"/>
          <span className="barcode-text">{ticket.ticket}</span>
        </div>
      </div>
    </div>
  );
}

// ─── SEAT MAP ─────────────────────────────────────────────────────────────────
function SeatMap({ flight, selectedSeats, onSeatSelect }) {
  const cols = ['A','B','C','D','E','F'];
  const totalRows = 30;

  return (
    <div>
      {/* Legend */}
      <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'1.25rem'}}>
        {CABIN_ZONES.map(z=>(
          <div key={z.label} style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
            <div style={{width:14,height:14,background:z.col,borderRadius:3}}/>
            <span style={{fontSize:'0.75rem',fontWeight:'600',color:'var(--text-secondary)'}}>{z.label}</span>
          </div>
        ))}
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
          <div style={{width:14,height:14,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:3}}/>
          <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Available</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
          <div style={{width:14,height:14,background:'#22c55e',borderRadius:3}}/>
          <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Selected</span>
        </div>
      </div>

      {/* Aircraft cabin diagram */}
      <div style={{
        background:'rgba(15,23,42,0.5)',border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:'16px',padding:'1.5rem',overflowY:'auto',maxHeight:'420px',
      }}>
        {/* Nose */}
        <div style={{textAlign:'center',marginBottom:'1rem',fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:'700'}}>
          ✈ FRONT OF AIRCRAFT
        </div>

        {/* Column headers */}
        <div style={{display:'grid',gridTemplateColumns:'30px 1fr 16px 1fr',gap:'4px',marginBottom:'6px',paddingLeft:'2px'}}>
          <div/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'4px'}}>
            {['A','B','C'].map(c=><div key={c} style={{textAlign:'center',fontSize:'0.65rem',color:'var(--text-muted)',fontWeight:'700'}}>{c}</div>)}
          </div>
          <div/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'4px'}}>
            {['D','E','F'].map(c=><div key={c} style={{textAlign:'center',fontSize:'0.65rem',color:'var(--text-muted)',fontWeight:'700'}}>{c}</div>)}
          </div>
        </div>

        {Array.from({length:totalRows},(_,i)=>i+1).map(row=>{
          const zone = getZone(row);
          const price = getSeatPrice(flight, row);
          return (
            <div key={row} style={{display:'grid',gridTemplateColumns:'30px 1fr 16px 1fr',gap:'4px',marginBottom:'4px',alignItems:'center'}}>
              {/* Row number + zone marker */}
              <div style={{fontSize:'0.6rem',color:zone.col,fontWeight:'800',textAlign:'right',paddingRight:'4px'}}>{row}</div>

              {/* Left seats A B C */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'4px'}}>
                {['A','B','C'].map(col=>{
                  const id=`${row}${col}`;
                  const isSel=selectedSeats.some(s => s.id === id);
                  return (
                    <button key={col} title={`Seat ${id} — ${zone.label} — ${fmt(price)}`}
                      onClick={()=>onSeatSelect(id,zone,price)}
                      style={{
                        width:'100%',aspectRatio:'1',borderRadius:'4px',border:'none',cursor:'pointer',
                        fontSize:'0.55rem',fontWeight:'700',
                        background: isSel ? '#22c55e' : zone.bg,
                        color      : isSel ? '#fff'   : zone.col,
                        outline    : isSel ? `2px solid #22c55e` : '1px solid rgba(255,255,255,0.08)',
                        transition :'all 0.1s',
                      }}
                    >{id}</button>
                  );
                })}
              </div>

              {/* Aisle indicator */}
              <div/>

              {/* Right seats D E F */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'4px'}}>
                {['D','E','F'].map(col=>{
                  const id=`${row}${col}`;
                  const isSel=selectedSeats.some(s => s.id === id);
                  return (
                    <button key={col} title={`Seat ${id} — ${zone.label} — ${fmt(price)}`}
                      onClick={()=>onSeatSelect(id,zone,price)}
                      style={{
                        width:'100%',aspectRatio:'1',borderRadius:'4px',border:'none',cursor:'pointer',
                        fontSize:'0.55rem',fontWeight:'700',
                        background: isSel ? '#22c55e' : zone.bg,
                        color      : isSel ? '#fff'   : zone.col,
                        outline    : isSel ? `2px solid #22c55e` : '1px solid rgba(255,255,255,0.08)',
                        transition :'all 0.1s',
                      }}
                    >{id}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedSeats.length > 0 && (
        <div style={{
          marginTop:'1rem',padding:'0.75rem 1rem',
          background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',
          borderRadius:'8px',display:'flex',alignItems:'center',gap:'0.75rem',
        }}>
          <CheckCircle2 size={16} style={{color:'#22c55e'}}/>
          <span style={{fontWeight:'700',color:'#22c55e'}}>{selectedSeats.length} Seat(s) selected</span>
          <span style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>
            {selectedSeats.map(s => s.id).join(', ')} — Total: {fmt(selectedSeats.reduce((acc, s) => acc + s.price, 0))}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main BookFlightView ──────────────────────────────────────────────────────
const STEPS = ['Passenger','Route','Seats','Add-ons','Payment'];

export default function BookFlightView({ showToast, setActiveTab, navigateToBoardingPass }) {
  const [step, setStep]                 = useState(0);

  // Step 0 — Passenger
  const [aadhar, setAadhar]             = useState('');
  const [passenger, setPassenger]       = useState(null);
  const [fetchingUser, setFetchingUser] = useState(false);

  // Step 1 — Route
  const [flightType, setFlightType]     = useState('DOMESTIC');
  const [sources, setSources]           = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedSrc, setSelectedSrc]   = useState('');
  const [selectedDst, setSelectedDst]   = useState('');
  const [matchedFlights, setMatchedFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [fetchingFlights, setFetchingFlights] = useState(false);
  const [passportNo, setPassportNo]     = useState('');

  // Step 2 — Seats
  const [selectedSeats, setSelectedSeats] = useState([]); // array of { id, zone, price }
  const [seatSelectionMode, setSeatSelectionMode] = useState('single'); // 'single' | 'multiple'

  // Step 3 — Add-ons + Dates
  const [ticketType, setTicketType]     = useState('ONE-WAY');
  const [travelDate, setTravelDate]     = useState('');
  const [returnDate, setReturnDate]     = useState('');
  const [mealIncluded, setMealIncluded] = useState(false);
  const [wifiIncluded, setWifiIncluded] = useState(false);
  const [extraLuggage, setExtraLuggage] = useState(25); // total baggage KG (25 KG standard)

  // Step 4 — Payment
  const [couponCode, setCouponCode]     = useState('');
  const [coupon, setCoupon]             = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId]               = useState('');
  const [bank, setBank]                 = useState('');
  const [booking, setBooking]           = useState(false);

  // Done
  const [bookedTicket, setBookedTicket] = useState(null);
  const [view, setView]                 = useState('form'); // 'form'|'receipt'|'boarding-pass'

  // Load all flights for dropdowns
  useEffect(() => {
    fetch('/api/flights')
      .then(r=>r.json())
      .then(data=>{
        const domestic = data.filter(f=>f.flight_type==='DOMESTIC');
        const intl     = data.filter(f=>f.flight_type==='INTERNATIONAL');
        const pool = flightType==='DOMESTIC' ? domestic : intl;
        setSources([...new Set(pool.map(f=>f.source))]);
        setDestinations([...new Set(pool.map(f=>f.destination))]);
      })
      .catch(()=>{});
  // eslint-disable-next-line
  }, [flightType]);

  useEffect(()=>{
    fetch('/api/flights')
      .then(r=>r.json())
      .then(data=>{
        const pool = data.filter(f=>f.flight_type===flightType);
        const srcs = [...new Set(pool.map(f=>f.source))];
        const dsts = [...new Set(pool.map(f=>f.destination))];
        setSources(srcs); setDestinations(dsts);
        if(srcs.length) setSelectedSrc(srcs[0]);
        if(dsts.length) setSelectedDst(dsts[0]);
      }).catch(()=>{});
  },[flightType]);

  // Computed price
  const basePrice  = selectedSeats.reduce((sum, s) => sum + s.price, 0) || (selectedFlight?.price_economy || 0);
  const seatsCount = Math.max(1, selectedSeats.length);
  const mealAdd    = mealIncluded  ? 2000 * seatsCount : 0;
  const wifiAdd    = wifiIncluded  ? 1000 * seatsCount : 0;
  const luggAdd    = Math.max(0, extraLuggage - 25) * 1000;
  const subTotal   = (basePrice + mealAdd + wifiAdd + luggAdd) * (ticketType==='ROUND-TRIP'?2:1);
  const tax        = Math.round(subTotal * 0.18);
  const discount   = coupon ? Math.round(subTotal * coupon.discount_percent / 100) : 0;
  const totalPrice = subTotal + tax - discount;

  const cabinClass = selectedSeats.length > 0 ? Array.from(new Set(selectedSeats.map(s => s.zone.label))).join(', ') : 'Economy';

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFetchPassenger = async () => {
    if (!aadhar.trim()) { showToast('Enter Aadhar ID','error'); return; }
    setFetchingUser(true);
    try {
      const res  = await fetch(`/api/passengers/${aadhar}`);
      const data = await res.json();
      if (data.success) { setPassenger(data.passenger); showToast('Passenger found'); }
      else showToast(data.message||'Not found','error');
    } catch { showToast('Server error','error'); }
    finally { setFetchingUser(false); }
  };

  const handleFetchFlights = async () => {
    if (!selectedSrc||!selectedDst) { showToast('Select origin and destination','error'); return; }
    setFetchingFlights(true);
    setMatchedFlights([]); setSelectedFlight(null);
    try {
      const res  = await fetch(`/api/flights/search?source=${selectedSrc}&destination=${selectedDst}&type=${flightType}`);
      const data = await res.json();
      if (data.success) { setMatchedFlights(data.flights); showToast(`${data.flights.length} flight(s) found`); }
      else showToast('No flights found on this route','error');
    } catch { showToast('Error fetching flights','error'); }
    finally { setFetchingFlights(false); }
  };

  const handleSeatSelect = (id, zone, price) => {
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === id);
      if (exists) return prev.filter(s => s.id !== id);
      if (seatSelectionMode === 'single') {
        return [{ id, zone, price }];
      }
      return [...prev, { id, zone, price }];
    });
  };

  const handleCouponValidate = async () => {
    if (!couponCode.trim()) { showToast('Enter a coupon code','error'); return; }
    setValidatingCoupon(true);
    try {
      const res  = await fetch('/api/coupons/validate',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({code:couponCode}) });
      const data = await res.json();
      if (data.success) { setCoupon(data.coupon); showToast(`Coupon applied! ${data.coupon.discount_percent}% off`); }
      else { setCoupon(null); showToast(data.message||'Invalid coupon','error'); }
    } catch { showToast('Error validating coupon','error'); }
    finally { setValidatingCoupon(false); }
  };

  const handleBook = async () => {
    if (!travelDate) { showToast('Select a travel date','error'); return; }
    if (ticketType==='ROUND-TRIP'&&!returnDate) { showToast('Select return date','error'); return; }
    if (!paymentMethod) { showToast('Select a payment method','error'); return; }
    if (paymentMethod==='UPI'&&!upiId.trim()) { showToast('Enter UPI ID','error'); return; }
    if (paymentMethod==='NETBANKING'&&!bank) { showToast('Select your bank','error'); return; }
    if (flightType==='INTERNATIONAL'&&!passportNo.trim()) { showToast('Passport number required for international flights','error'); return; }

    setBooking(true);
    try {
      const payload = {
        aadhar       : passenger.aadhar,
        name         : passenger.name,
        nationality  : passenger.nationality,
        flightname   : selectedFlight.f_name,
        flightcode   : selectedFlight.f_code,
        source       : selectedSrc,
        destination  : selectedDst,
        date         : travelDate,
        ticketType, returnDate: ticketType==='ROUND-TRIP'?returnDate:null,
        cabinClass, seatNumber: selectedSeats.map(s => s.id).join(', '),
        mealIncluded, wifiIncluded, extraLuggage, totalPrice,
        paymentMethod, passportNo: flightType==='INTERNATIONAL'?passportNo:null,
        couponCode: coupon?couponCode:null, discountAmount: discount,
        flightType,
      };
      const res  = await fetch('/api/reservations',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        showToast('Flight booked successfully!');
        setBookedTicket({ ...payload, pnr:data.pnr, ticket:data.ticket });
        setView('receipt');
      } else showToast(data.message||'Booking failed','error');
    } catch { showToast('Server error','error'); }
    finally { setBooking(false); }
  };

  const handleReset = () => {
    setStep(0); setView('form');
    setAadhar(''); setPassenger(null); setFlightType('DOMESTIC');
    setSelectedFlight(null); setMatchedFlights([]);
    setSelectedSeats([]);
    setTicketType('ONE-WAY'); setTravelDate(''); setReturnDate('');
    setMealIncluded(false); setWifiIncluded(false); setExtraLuggage(25);
    setCoupon(null); setCouponCode(''); setPaymentMethod('');
    setUpiId(''); setBank(''); setBookedTicket(null);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: Boarding Pass
  // ══════════════════════════════════════════════════════════════════════════
  if (view==='boarding-pass' && bookedTicket) {
    return (
      <div className="panel" id="no-print-wrapper">
        <div className="panel-header no-print" style={{borderBottom:'none',marginBottom:'1.5rem'}}>
          <div>
            <h2 className="panel-title" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <Plane size={22} style={{color:'var(--primary)'}}/>Boarding Pass
            </h2>
            <p className="panel-subtitle">Ready to print — save as PDF from the print dialog</p>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={()=>window.print()}>
              <Printer size={18}/> Print / Save as PDF
            </button>
            <button className="btn btn-secondary" onClick={()=>setView('receipt')}>← Back to Receipt</button>
            <button className="btn btn-secondary" onClick={handleReset}>Book Another</button>
          </div>
        </div>
        <div style={{overflowX:'auto',paddingBottom:'1rem'}}>
          <BoardingPassCard ticket={bookedTicket}/>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: Receipt
  // ══════════════════════════════════════════════════════════════════════════
  if (view==='receipt' && bookedTicket) {
    return (
      <div className="panel" style={{animation:'fadeIn 0.3s'}}>
        <div className="panel-header" style={{borderBottom:'none',marginBottom:'1.5rem'}}>
          <div>
            <h2 className="panel-title" style={{color:'var(--success)',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              <CheckCircle2 size={24}/> Ticket Booked Successfully!
            </h2>
            <p className="panel-subtitle">Official Flight Reservation Voucher & Receipt</p>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary"
              style={{background:'linear-gradient(135deg,#818cf8,#38bdf8)',color:'#0f172a'}}
              onClick={()=>navigateToBoardingPass(bookedTicket.pnr)}>
              <Plane size={18} style={{transform:'rotate(45deg)'}}/>Check Boarding Pass
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>Book Another</button>
            <button className="btn btn-secondary" onClick={()=>setActiveTab('dashboard')}>Dashboard</button>
          </div>
        </div>
        <div style={{
          background:'rgba(15,23,42,0.4)',border:'1px solid rgba(56,189,248,0.15)',
          borderRadius:'16px',padding:'2.5rem',boxShadow:'0 10px 30px rgba(0,0,0,0.25)',position:'relative',overflow:'hidden',
        }}>
          <div style={{position:'absolute',top:0,left:0,width:'100%',height:'4px',background:'linear-gradient(90deg,var(--secondary),var(--primary))'}}/>
          <div style={{display:'flex',justifyContent:'space-between',borderBottom:'1px dashed rgba(255,255,255,0.1)',paddingBottom:'1.5rem',marginBottom:'2rem'}}>
            <div>
              <h3 style={{fontSize:'1.5rem',fontWeight:'800',letterSpacing:'0.05em'}}>BOING BOING AIRLINES</h3>
              <p style={{fontSize:'0.8125rem',color:'var(--text-secondary)',margin:0}}>e-Ticket & Passenger Confirmation</p>
            </div>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',justifyContent:'flex-end'}}>
              <span style={{background:'rgba(56,189,248,0.1)',border:'1px solid rgba(56,189,248,0.3)',color:'var(--primary)',padding:'0.35rem 0.75rem',borderRadius:'6px',fontSize:'0.8125rem',fontWeight:'700'}}>{bookedTicket.ticketType}</span>
              <span style={{background:'rgba(129,140,248,0.1)',border:'1px solid rgba(129,140,248,0.3)',color:'var(--secondary)',padding:'0.35rem 0.75rem',borderRadius:'6px',fontSize:'0.8125rem',fontWeight:'700'}}>{bookedTicket.cabinClass}</span>
            </div>
          </div>
          <div className="form-grid" style={{marginBottom:'2rem'}}>
            {[
              ['Passenger',bookedTicket.name,'var(--text-primary)'],
              ['Nationality',bookedTicket.nationality,'var(--text-primary)'],
              ['Aadhar',bookedTicket.aadhar,'var(--text-secondary)'],
              ['Carrier',bookedTicket.flightname,'var(--primary)'],
              ['Seat',bookedTicket.seatNumber||'—','var(--secondary)'],
              ['Meal',bookedTicket.mealIncluded?'Included':'Not included','var(--text-secondary)'],
              ['Wi-Fi',bookedTicket.wifiIncluded?'Included':'Not included','var(--text-secondary)'],
              ['Baggage', `${bookedTicket.extraLuggage || 25} KG`, 'var(--text-secondary)'],
              bookedTicket.passportNo && ['Passport',bookedTicket.passportNo,'var(--text-secondary)'],
            ].filter(Boolean).map(([l,v,c])=>(
              <div className="form-group" key={l}>
                <label className="form-label" style={{color:'var(--text-muted)'}}>{l}</label>
                <div style={{fontSize:'1rem',fontWeight:'700',color:c}}>{v}</div>
              </div>
            ))}
          </div>
          {/* Route */}
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'12px',padding:'1.5rem 2rem',marginBottom:'2rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:'700',textTransform:'uppercase'}}>Origin</span>
              <h4 style={{fontSize:'1.5rem',fontWeight:'800',margin:'4px 0 0'}}>{bookedTicket.source}</h4>
            </div>
            <ArrowRight size={20} style={{color:'var(--primary)'}}/>
            <div style={{textAlign:'right'}}>
              <span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:'700',textTransform:'uppercase'}}>Destination</span>
              <h4 style={{fontSize:'1.5rem',fontWeight:'800',margin:'4px 0 0'}}>{bookedTicket.destination}</h4>
            </div>
          </div>
          {/* Price summary */}
          <div style={{background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'10px',padding:'1.25rem',marginBottom:'2rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><span style={{color:'var(--text-muted)'}}>Base Fare ({bookedTicket.cabinClass})</span><span style={{fontWeight:'700'}}>{fmt(basePrice||selectedFlight?.price_economy||0)}</span></div>
            {mealIncluded && <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><span style={{color:'var(--text-muted)'}}>Meal (×{seatsCount})</span><span>+{fmt(mealAdd)}</span></div>}
            {wifiIncluded && <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><span style={{color:'var(--text-muted)'}}>Wi-Fi (×{seatsCount})</span><span>+{fmt(wifiAdd)}</span></div>}
            {extraLuggage > 25 && <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><span style={{color:'var(--text-muted)'}}>Extra Luggage ({extraLuggage - 25} kg)</span><span>+{fmt(luggAdd)}</span></div>}
            {ticketType==='ROUND-TRIP' && <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><span style={{color:'var(--text-muted)'}}>× 2 (Round-trip)</span><span/></div>}
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><span style={{color:'var(--text-muted)'}}>GST (18%)</span><span>+{fmt(tax)}</span></div>
            {discount>0 && <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><span style={{color:'#10b981'}}>Coupon ({coupon?.discount_percent}% off)</span><span style={{color:'#10b981'}}>-{fmt(discount)}</span></div>}
            <div style={{display:'flex',justifyContent:'space-between',paddingTop:'0.75rem',borderTop:'1px solid rgba(255,255,255,0.1)'}}><span style={{fontWeight:'800',fontSize:'1rem'}}>Total Paid</span><span style={{fontWeight:'900',fontSize:'1.25rem',color:'#10b981'}}>{fmt(totalPrice)}</span></div>
          </div>
          {/* PNR */}
          <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'2rem',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:'1.5rem'}}>
            <div style={{display:'flex',gap:'2.5rem'}}>
              <div>
                <span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em'}}>PNR Code</span>
                <div style={{fontSize:'1.5rem',fontWeight:'900',color:'var(--primary)'}}>{bookedTicket.pnr}</div>
              </div>
              <div>
                <span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.05em'}}>Ticket ID</span>
                <div style={{fontSize:'1.5rem',fontWeight:'900',color:'var(--secondary)'}}>{bookedTicket.ticket}</div>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.25rem'}}>
              <div className="barcode" style={{width:'180px',height:'40px'}}/>
              <span className="barcode-text" style={{fontSize:'0.6875rem'}}>{bookedTicket.ticket}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: Multi-step Booking Form
  // ══════════════════════════════════════════════════════════════════════════
  const canNext = () => {
    if (step===0) return !!passenger;
    if (step===1) return !!selectedFlight;
    if (step===2) return selectedSeats.length > 0;
    if (step===3) return !!travelDate && (ticketType!=='ROUND-TRIP'||!!returnDate);
    return true;
  };

  return (
    <div className="panel" style={{animation:'fadeIn 0.2s'}}>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Book Flight Tickets</h2>
          <p className="panel-subtitle">Complete the steps below to reserve your seat</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="step-indicator">
        {STEPS.map((s,i)=>(
          <div key={s} className={`step-item ${i===step?'active':i<step?'done':''}`}>
            <div className="step-circle">{i<step?'✓':i+1}</div>
            <span className="step-label">{s}</span>
            {i<STEPS.length-1 && <div className="step-line"/>}
          </div>
        ))}
      </div>

      <div style={{marginTop:'2rem'}}>

        {/* ─── STEP 0: Passenger ───────────────────────────────────────── */}
        {step===0 && (
          <div style={{maxWidth:'520px'}}>
            <div className="form-group" style={{marginBottom:'1.5rem'}}>
              <label className="form-label">Aadhar ID Lookup</label>
              <div className="lookup-group">
                <input type="text" className="form-input" placeholder="Enter 12-digit Aadhar number"
                  value={aadhar} onChange={e=>setAadhar(e.target.value)}/>
                <button type="button" className="btn btn-primary" onClick={handleFetchPassenger} disabled={fetchingUser}>
                  {fetchingUser?'Fetching…':'FETCH'}
                </button>
              </div>
            </div>
            {passenger && (
              <div style={{padding:'1.25rem',border:'1px solid rgba(56,189,248,0.2)',borderRadius:'10px',background:'rgba(56,189,248,0.04)',animation:'fadeIn 0.2s'}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem',color:'var(--primary)'}}>
                  <User size={18}/><span style={{fontWeight:'800'}}>Passenger Found</span>
                </div>
                <div className="form-grid">
                  {[['Name',passenger.name],['Nationality',passenger.nationality],['Gender',passenger.gender],['DOB',passenger.date_of_birth||'—']].map(([l,v])=>(
                    <div key={l}><label className="form-label">{l}</label><div style={{fontWeight:'700'}}>{v}</div></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 1: Route ───────────────────────────────────────────── */}
        {step===1 && (
          <div style={{maxWidth:'600px'}}>
            <div className="form-group" style={{marginBottom:'1.5rem'}}>
              <label className="form-label">Flight Type</label>
              <div className="radio-group">
                {['DOMESTIC','INTERNATIONAL'].map(t=>(
                  <label key={t} className="radio-label">
                    <input type="radio" name="ftype" className="radio-input" checked={flightType===t} onChange={()=>setFlightType(t)}/>
                    <span>{t==='DOMESTIC'?'🇮🇳 Domestic':'🌐 International'}</span>
                  </label>
                ))}
              </div>
            </div>
            {flightType==='INTERNATIONAL' && (
              <div className="form-group" style={{marginBottom:'1.5rem',animation:'fadeIn 0.2s'}}>
                <label className="form-label">Passport Number <span style={{color:'#ef4444'}}>*</span></label>
                <input type="text" className="form-input" placeholder="e.g. A1234567"
                  value={passportNo} onChange={e=>setPassportNo(e.target.value)}/>
              </div>
            )}
            <div className="form-grid" style={{marginBottom:'1rem'}}>
              <div className="form-group">
                <label className="form-label">Origin Airport</label>
                <select className="form-select" value={selectedSrc} onChange={e=>setSelectedSrc(e.target.value)}>
                  {sources.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Destination Airport</label>
                <select className="form-select" value={selectedDst} onChange={e=>setSelectedDst(e.target.value)}>
                  {destinations.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <button type="button" className="btn btn-secondary" style={{width:'100%',marginBottom:'1.5rem'}}
              onClick={handleFetchFlights} disabled={fetchingFlights}>
              {fetchingFlights?'Searching…':'SEARCH FLIGHTS'}
            </button>
            {matchedFlights.length>0 && (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',animation:'fadeIn 0.2s'}}>
                {matchedFlights.map(f=>(
                  <div key={f.f_code}
                    onClick={()=>setSelectedFlight(f)}
                    style={{
                      padding:'1rem 1.25rem',borderRadius:'10px',cursor:'pointer',transition:'all 0.15s',
                      border:`2px solid ${selectedFlight?.f_code===f.f_code?'var(--primary)':'rgba(255,255,255,0.06)'}`,
                      background: selectedFlight?.f_code===f.f_code ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.02)',
                    }}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.5rem'}}>
                      <div>
                        <span style={{fontWeight:'800',color:'var(--primary)'}}>{f.f_code}</span>
                        <span style={{marginLeft:'0.75rem',color:'var(--text-secondary)'}}>{f.f_name}</span>
                      </div>
                      <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
                        <span style={{fontWeight:'700'}}>{f.departure_time} → {f.arrival_time}</span>
                        <span style={{color:'#10b981',fontWeight:'800'}}>from {fmt(f.price_economy)}</span>
                      </div>
                    </div>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:'0.4rem'}}>
                      {f.source_airport} → {f.dest_airport}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 2: Seat Map ────────────────────────────────────────── */}
        {step===2 && selectedFlight && (
          <div>
            <div className="form-group" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
              <label className="form-label">Seat Selection Mode</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="seatMode" className="radio-input" checked={seatSelectionMode==='single'} onChange={()=>{
                    setSeatSelectionMode('single');
                    setSelectedSeats([]);
                  }}/>
                  <span>Single Seat</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="seatMode" className="radio-input" checked={seatSelectionMode==='multiple'} onChange={()=>setSeatSelectionMode('multiple')}/>
                  <span>Multiple Seats</span>
                </label>
              </div>
            </div>
            <SeatMap flight={selectedFlight} selectedSeats={selectedSeats} onSeatSelect={handleSeatSelect}/>
          </div>
        )}

        {/* ─── STEP 3: Add-ons & Dates ─────────────────────────────────── */}
        {step===3 && (
          <div style={{maxWidth:'560px'}}>
            <div className="form-group" style={{marginBottom:'1.5rem'}}>
              <label className="form-label">Journey Type</label>
              <div className="radio-group">
                {['ONE-WAY','ROUND-TRIP'].map(t=>(
                  <label key={t} className="radio-label">
                    <input type="radio" name="jtype" className="radio-input" checked={ticketType===t} onChange={()=>setTicketType(t)}/>
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-grid" style={{marginBottom:'1.5rem'}}>
              <div className="form-group">
                <label className="form-label">Departure Date</label>
                <input type="date" className="form-input" value={travelDate} onChange={e=>setTravelDate(e.target.value)} required/>
              </div>
              {ticketType==='ROUND-TRIP' && (
                <div className="form-group">
                  <label className="form-label">Return Date</label>
                  <input type="date" className="form-input" value={returnDate} onChange={e=>setReturnDate(e.target.value)} required/>
                </div>
              )}
            </div>
            <div className="form-section-label">Optional Add-ons</div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginTop:'0.75rem'}}>
              <label style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'1rem',border:`1px solid ${mealIncluded?'rgba(245,158,11,0.4)':'rgba(255,255,255,0.06)'}`,borderRadius:'10px',cursor:'pointer',background:mealIncluded?'rgba(245,158,11,0.06)':'transparent',transition:'all 0.2s'}}>
                <input type="checkbox" style={{width:18,height:18}} checked={mealIncluded} onChange={e=>setMealIncluded(e.target.checked)}/>
                <Utensils size={18} style={{color:'#f59e0b'}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'700'}}>Meal Inclusion</div>
                  <div style={{fontSize:'0.8125rem',color:'var(--text-muted)'}}>Hot meals & beverages served on board</div>
                </div>
                <span style={{fontWeight:'800',color:'#f59e0b'}}>+₹2,000 / seat</span>
              </label>
              <label style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'1rem',border:`1px solid ${wifiIncluded?'rgba(56,189,248,0.4)':'rgba(255,255,255,0.06)'}`,borderRadius:'10px',cursor:'pointer',background:wifiIncluded?'rgba(56,189,248,0.06)':'transparent',transition:'all 0.2s'}}>
                <input type="checkbox" style={{width:18,height:18}} checked={wifiIncluded} onChange={e=>setWifiIncluded(e.target.checked)}/>
                <Wifi size={18} style={{color:'var(--primary)'}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:'700'}}>In-flight Wi-Fi</div>
                  <div style={{fontSize:'0.8125rem',color:'var(--text-muted)'}}>High-speed satellite internet throughout the journey</div>
                </div>
                <span style={{fontWeight:'800',color:'var(--primary)'}}>+₹1,000 / seat</span>
              </label>
            </div>

            <div className="form-section-label" style={{marginTop:'1.5rem'}}>Baggage Allowance</div>
            <div style={{
              padding:'1rem', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px',
              background:'rgba(255,255,255,0.02)', marginTop:'0.75rem', marginBottom:'1.5rem'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
                <div>
                  <div style={{fontWeight:'700'}}>Check-in Baggage</div>
                  <div style={{fontSize:'0.8125rem',color:'var(--text-muted)'}}>Standard 25 KG included. Additional weight charged at ₹1,000/KG.</div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                  <button type="button" className="btn btn-secondary" style={{padding:'0.25rem 0.5rem', minWidth:'32px'}}
                    onClick={() => setExtraLuggage(w => Math.max(25, w - 5))} disabled={extraLuggage <= 25}>-</button>
                  <span style={{fontWeight:'800', minWidth:'60px', textAlign:'center'}}>{extraLuggage} KG</span>
                  <button type="button" className="btn btn-secondary" style={{padding:'0.25rem 0.5rem', minWidth:'32px'}}
                    onClick={() => setExtraLuggage(w => Math.min(50, w + 5))} disabled={extraLuggage >= 50}>+</button>
                </div>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8125rem', color:extraLuggage > 25 ? '#f59e0b' : 'var(--text-muted)'}}>
                <span>Additional Weight: {Math.max(0, extraLuggage - 25)} KG</span>
                <span style={{fontWeight:'700'}}>Cost: {extraLuggage > 25 ? `+${fmt((extraLuggage - 25) * 1000)}` : 'FREE'}</span>
              </div>
            </div>

            {/* Price preview */}
            <div style={{marginTop:'1.5rem',padding:'1rem',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'10px'}}>
              <div style={{fontWeight:'700',marginBottom:'0.5rem',color:'var(--text-secondary)'}}>Price Summary</div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-muted)'}}>Base ({cabinClass} × {seatsCount})</span><span>{fmt(basePrice)}</span></div>
              {mealIncluded&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-muted)'}}>Meal (× {seatsCount})</span><span>+{fmt(mealAdd)}</span></div>}
              {wifiIncluded&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-muted)'}}>Wi-Fi (× {seatsCount})</span><span>+{fmt(wifiAdd)}</span></div>}
              {extraLuggage>25&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-muted)'}}>Extra Luggage ({extraLuggage - 25} kg)</span><span>+{fmt(luggAdd)}</span></div>}
              {ticketType==='ROUND-TRIP'&&<div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-muted)'}}>× 2 legs</span><span/></div>}
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'var(--text-muted)'}}>GST 18%</span><span>+{fmt(tax)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:'0.5rem',paddingTop:'0.5rem',borderTop:'1px solid rgba(255,255,255,0.08)'}}><span style={{fontWeight:'800'}}>Estimated Total</span><span style={{fontWeight:'900',color:'#10b981'}}>{fmt(totalPrice)}</span></div>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Payment ─────────────────────────────────────────── */}
        {step===4 && (
          <div style={{maxWidth:'560px'}}>
            {/* Coupon */}
            <div className="form-section-label">Coupon / Promo Code</div>
            <div style={{display:'flex',gap:'0.75rem',marginBottom:'1.5rem',marginTop:'0.75rem'}}>
              <input type="text" className="form-input" placeholder="e.g. BOING10"
                value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())}/>
              <button type="button" className="btn btn-secondary" onClick={handleCouponValidate} disabled={validatingCoupon}>
                <Tag size={16}/>{validatingCoupon?'…':'APPLY'}
              </button>
            </div>
            {coupon && (
              <div style={{padding:'0.75rem 1rem',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'8px',marginBottom:'1rem',color:'#10b981',fontWeight:'700',fontSize:'0.875rem'}}>
                ✓ {coupon.description} — {coupon.discount_percent}% off applied!
              </div>
            )}
            <div style={{padding:'0.75rem 1rem',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'8px',marginBottom:'1.5rem',fontSize:'0.8125rem',color:'var(--text-muted)'}}>
              💡 Available coupons: <strong style={{color:'var(--text-secondary)'}}>BOING10, SUMMER20, INTL15, WELCOME5, BUSINESS25</strong>
            </div>

            {/* Payment Method */}
            <div className="form-section-label">Payment Method</div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginTop:'0.75rem',marginBottom:'1.5rem'}}>
              {[
                { id:'UPI',       label:'UPI Payment',              icon:<Smartphone size={20}/>, desc:'Pay instantly using any UPI app'        },
                { id:'NETBANKING',label:'Net Banking',              icon:<Building2 size={20}/>,  desc:'All major Indian banks supported'       },
                { id:'COUNTER',   label:'Pay at Airport Counter',   icon:<MapPin size={20}/>,     desc:'Pay cash/card at check-in counter'      },
                { id:'CARD',      label:'Credit / Debit Card',      icon:<CreditCard size={20}/>, desc:'Visa, Mastercard, Rupay accepted'       },
              ].map(m=>(
                <div key={m.id} onClick={()=>setPaymentMethod(m.id)} style={{
                  padding:'1rem',border:`2px solid ${paymentMethod===m.id?'var(--primary)':'rgba(255,255,255,0.06)'}`,
                  borderRadius:'10px',cursor:'pointer',display:'flex',alignItems:'center',gap:'1rem',
                  background:paymentMethod===m.id?'rgba(56,189,248,0.06)':'transparent',transition:'all 0.15s',
                }}>
                  <div style={{color:paymentMethod===m.id?'var(--primary)':'var(--text-muted)',transition:'all 0.15s'}}>{m.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:'700'}}>{m.label}</div>
                    <div style={{fontSize:'0.8125rem',color:'var(--text-muted)'}}>{m.desc}</div>
                  </div>
                  <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${paymentMethod===m.id?'var(--primary)':'rgba(255,255,255,0.15)'}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {paymentMethod===m.id && <div style={{width:10,height:10,borderRadius:'50%',background:'var(--primary)'}}/>}
                  </div>
                </div>
              ))}
            </div>

            {/* UPI detail */}
            {paymentMethod==='UPI' && (
              <div className="form-group" style={{animation:'fadeIn 0.2s',marginBottom:'1rem'}}>
                <label className="form-label">UPI ID</label>
                <input type="text" className="form-input" placeholder="yourname@upi" value={upiId} onChange={e=>setUpiId(e.target.value)}/>
              </div>
            )}
            {/* Bank detail */}
            {paymentMethod==='NETBANKING' && (
              <div className="form-group" style={{animation:'fadeIn 0.2s',marginBottom:'1rem'}}>
                <label className="form-label">Select Bank</label>
                <select className="form-select" value={bank} onChange={e=>setBank(e.target.value)}>
                  <option value="">Choose your bank</option>
                  {['SBI','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra','Punjab National Bank','Bank of Baroda','Canara Bank','Union Bank'].map(b=>
                    <option key={b} value={b}>{b}</option>
                  )}
                </select>
              </div>
            )}
            {paymentMethod==='COUNTER' && (
              <div style={{padding:'0.75rem 1rem',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:'8px',marginBottom:'1rem',fontSize:'0.875rem',color:'#f59e0b'}}>
                ⚠ Your booking will be confirmed. Payment must be made at the airport counter before check-in. Bring your PNR number.
              </div>
            )}

            {/* Final price summary */}
            <div style={{padding:'1.25rem',background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'10px'}}>
              <div style={{fontWeight:'700',marginBottom:'0.75rem'}}>Order Summary</div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem'}}><span style={{color:'var(--text-muted)'}}>Base Fare (×{seatsCount})</span><span>{fmt(basePrice)}</span></div>
              {mealIncluded&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem'}}><span style={{color:'var(--text-muted)'}}>Meal (×{seatsCount})</span><span>+{fmt(mealAdd)}</span></div>}
              {wifiIncluded&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem'}}><span style={{color:'var(--text-muted)'}}>Wi-Fi (×{seatsCount})</span><span>+{fmt(wifiAdd)}</span></div>}
              {extraLuggage>25&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem'}}><span style={{color:'var(--text-muted)'}}>Extra Luggage ({extraLuggage - 25} kg)</span><span>+{fmt(luggAdd)}</span></div>}
              {ticketType==='ROUND-TRIP'&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem'}}><span style={{color:'var(--text-muted)'}}>Round-trip ×2</span><span>{fmt(subTotal/2)} →  {fmt(subTotal)}</span></div>}
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem'}}><span style={{color:'var(--text-muted)'}}>GST (18%)</span><span>+{fmt(tax)}</span></div>
              {discount>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem'}}><span style={{color:'#10b981'}}>Coupon discount</span><span style={{color:'#10b981'}}>-{fmt(discount)}</span></div>}
              <div style={{display:'flex',justifyContent:'space-between',paddingTop:'0.75rem',borderTop:'1px solid rgba(255,255,255,0.1)'}}><span style={{fontWeight:'900',fontSize:'1rem'}}>TOTAL</span><span style={{fontWeight:'900',fontSize:'1.25rem',color:'#10b981'}}>{fmt(totalPrice)}</span></div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="btn-group" style={{marginTop:'2rem'}}>
          {step<4 ? (
            <>
              <button type="button" className="btn btn-primary" onClick={()=>setStep(s=>s+1)} disabled={!canNext()}>
                {step===3?'Proceed to Payment →':'Next →'}
              </button>
              {step>0 && <button type="button" className="btn btn-secondary" onClick={()=>setStep(s=>s-1)}>← Back</button>}
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleBook} disabled={booking||!paymentMethod}>
              {booking?'Processing…':'✓ CONFIRM & BOOK'}
            </button>
          )}
          {step>0 && step<4 && <button type="button" className="btn btn-secondary" onClick={()=>setStep(s=>s-1)}>← Back</button>}
          <button type="button" className="btn btn-secondary" onClick={()=>setActiveTab('dashboard')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plane, Clock, Users, Wifi, Coffee, Wind } from 'lucide-react';

// Helper — compute duration between two time strings like "06:00 AM" and "08:10 AM"
function calcDuration(dep, arr) {
  if (!dep || !arr) return '—';
  try {
    const parse = (t) => {
      const [time, period] = t.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    let diff = parse(arr) - parse(dep);
    if (diff < 0) diff += 24 * 60; // overnight
    const hh = Math.floor(diff / 60);
    const mm = diff % 60;
    return `${hh}h ${mm}m`;
  } catch { return '—'; }
}

// Pseudo-random but stable per flight code
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Math.abs(h) / 2147483647;
}

function flightMeta(code) {
  const r = seededRandom(code);
  const statuses = [
    { label: 'On Time',  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Boarding', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
    { label: 'On Time',  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Delayed',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  ];
  return {
    status  : statuses[Math.floor(r * statuses.length)],
    seats   : Math.floor(r * 80) + 20,          // 20–99 seats
    hasWifi  : r > 0.4,
    hasMeal  : r > 0.35,
    aircraft : ['Boeing 737', 'Airbus A320', 'Boeing 777', 'ATR 72'][Math.floor(r * 4)],
  };
}

export default function FlightDetailsView({ showToast, setActiveTab }) {
  const [flights, setFlights]       = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSrc, setFilterSrc]   = useState('All');
  const [filterDst, setFilterDst]   = useState('All');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'DOMESTIC' | 'INTERNATIONAL'
  const [sortBy, setSortBy]         = useState('default'); // 'default' | 'depart' | 'duration'
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch('/api/flights')
      .then(r => r.json())
      .then(data => { setFlights(data); setLoading(false); })
      .catch(() => { showToast('Failed to fetch flight list', 'error'); setLoading(false); });
  }, [showToast]);

  const sources = ['All', ...new Set(flights.map(f => f.source))];
  const dests   = ['All', ...new Set(flights.map(f => f.destination))];

  let displayed = flights.filter(f => {
    const q = searchTerm.toLowerCase();
    const matchQ = !q || f.f_code.toLowerCase().includes(q) || f.f_name.toLowerCase().includes(q)
      || f.source.toLowerCase().includes(q) || f.destination.toLowerCase().includes(q);
    const matchSrc = filterSrc === 'All' || f.source === filterSrc;
    const matchDst = filterDst === 'All' || f.destination === filterDst;
    const matchType = filterType === 'All' || f.flight_type === filterType;
    return matchQ && matchSrc && matchDst && matchType;
  });

  if (sortBy === 'depart') {
    displayed = [...displayed].sort((a, b) => (a.departure_time || '').localeCompare(b.departure_time || ''));
  } else if (sortBy === 'duration') {
    displayed = [...displayed].sort((a, b) =>
      calcDuration(a.departure_time, a.arrival_time).localeCompare(
        calcDuration(b.departure_time, b.arrival_time)
      )
    );
  }

  const onTimeCount = flights.filter(f => flightMeta(f.f_code).status.label === 'On Time').length;
  const boardingCount = flights.filter(f => flightMeta(f.f_code).status.label === 'Boarding').length;
  const delayedCount = flights.filter(f => flightMeta(f.f_code).status.label === 'Delayed').length;

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Flight Schedules</h2>
          <p className="panel-subtitle">Complete list of active airline routes with live timing and status</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setActiveTab('dashboard')}>BACK</button>
      </div>

      {/* Stats bar */}
      {!loading && (
        <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {[
            { label:'Total Flights',  value: flights.length,  color:'var(--primary)'   },
            { label:'On Time',        value: onTimeCount,     color:'#10b981'           },
            { label:'Now Boarding',   value: boardingCount,   color:'#f59e0b'           },
            { label:'Delayed',        value: delayedCount,    color:'#ef4444'           },
          ].map(s => (
            <div key={s.label} style={{
              flex: '1 1 120px',
              background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.06)',
              borderRadius:'10px', padding:'0.875rem 1.25rem',
            }}>
              <div style={{ fontSize:'1.625rem', fontWeight:'900', color: s.color }}>{s.value}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters row */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap', alignItems:'center' }}>
        <div className="search-input-wrapper" style={{ flex:'1 1 220px', minWidth:'180px' }}>
          <Search size={18} className="search-icon" />
          <input type="text" className="form-input" placeholder="Search flights..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft:'2.5rem' }} />
        </div>
        <select className="form-select" style={{ flex:'0 1 150px' }}
          value={filterSrc} onChange={e => setFilterSrc(e.target.value)}>
          {sources.map(s => <option key={s} value={s}>{s === 'All' ? 'All Origins' : s}</option>)}
        </select>
        <select className="form-select" style={{ flex:'0 1 150px' }}
          value={filterDst} onChange={e => setFilterDst(e.target.value)}>
          {dests.map(d => <option key={d} value={d}>{d === 'All' ? 'All Destinations' : d}</option>)}
        </select>
        <select className="form-select" style={{ flex:'0 1 150px' }}
          value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="All">All Types</option>
          <option value="DOMESTIC">Domestic</option>
          <option value="INTERNATIONAL">International</option>
        </select>
        <select className="form-select" style={{ flex:'0 1 160px' }}
          value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="default">Sort: Default</option>
          <option value="depart">Sort: Departure</option>
          <option value="duration">Sort: Duration</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">
          <RefreshCw className="empty-icon" style={{ animation:'spin 2s linear infinite' }} />
          <p>Querying scheduled flights from the database...</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <Plane className="empty-icon" />
          <p>No flights match your search or filter</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
          {displayed.map((flight) => {
            const meta     = flightMeta(flight.f_code);
            const duration = calcDuration(flight.departure_time, flight.arrival_time);
            const src3 = (flight.source      || '').substring(0,3).toUpperCase();
            const dst3 = (flight.destination || '').substring(0,3).toUpperCase();

            return (
              <div key={flight.f_code} style={{
                background    :'rgba(30,41,59,0.6)',
                border        :'1px solid rgba(255,255,255,0.06)',
                borderRadius  :'12px',
                padding       :'1.25rem 1.5rem',
                display       :'flex',
                alignItems    :'center',
                gap           :'1.5rem',
                flexWrap      :'wrap',
                transition    :'all 0.2s',
                cursor        :'default',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                {/* Airline + code */}
                <div style={{ minWidth:'160px' }}>
                  <div style={{ fontWeight:'800', fontSize:'1rem', color:'var(--primary)' }}>{flight.f_name}</div>
                  <code style={{
                    background:'rgba(255,255,255,0.06)', padding:'0.15rem 0.5rem',
                    borderRadius:'4px', fontSize:'0.8125rem', color:'var(--text-secondary)',
                  }}>{flight.f_code}</code>
                </div>

                {/* Route with airport codes */}
                <div style={{ flex:1, display:'flex', alignItems:'center', gap:'1rem', minWidth:'200px' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.5rem', fontWeight:'900', color:'var(--text-primary)', lineHeight:1 }}>{src3}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{flight.source}</div>
                  </div>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
                    <div style={{ fontSize:'0.6875rem', color:'var(--text-muted)', fontWeight:'600' }}>{duration}</div>
                    <div style={{ height:'2px', width:'100%', background:'rgba(255,255,255,0.08)', borderRadius:'1px', position:'relative' }}>
                      <div style={{ position:'absolute', top:'-5px', left:'50%', transform:'translateX(-50%)', color:'var(--primary)' }}>
                        <Plane size={14} style={{ transform:'rotate(90deg)' }} />
                      </div>
                    </div>
                    <div style={{ fontSize:'0.6875rem', color:'var(--text-muted)' }}>Direct</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.5rem', fontWeight:'900', color:'var(--text-primary)', lineHeight:1 }}>{dst3}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{flight.destination}</div>
                  </div>
                </div>

                {/* Timings */}
                <div style={{ display:'flex', gap:'1.5rem', alignItems:'center', minWidth:'180px' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'0.6875rem', color:'var(--text-muted)', fontWeight:'600', textTransform:'uppercase' }}>Departs</div>
                    <div style={{ fontWeight:'800', fontSize:'1rem', color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'4px' }}>
                      <Clock size={12} style={{ color:'var(--primary)' }} />
                      {flight.departure_time || '—'}
                    </div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'0.6875rem', color:'var(--text-muted)', fontWeight:'600', textTransform:'uppercase' }}>Arrives</div>
                    <div style={{ fontWeight:'800', fontSize:'1rem', color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'4px' }}>
                      <Clock size={12} style={{ color:'var(--secondary)' }} />
                      {flight.arrival_time || '—'}
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  {meta.hasWifi && (
                    <span title="Wi-Fi Available" style={{ background:'rgba(56,189,248,0.1)', color:'var(--primary)', padding:'0.3rem', borderRadius:'6px' }}>
                      <Wifi size={14} />
                    </span>
                  )}
                  {meta.hasMeal && (
                    <span title="Meal Included" style={{ background:'rgba(245,158,11,0.1)', color:'var(--accent)', padding:'0.3rem', borderRadius:'6px' }}>
                      <Coffee size={14} />
                    </span>
                  )}
                  <span title="Aircraft type" style={{ background:'rgba(129,140,248,0.1)', color:'var(--secondary)', padding:'0.3rem', borderRadius:'6px', fontSize:'0.6875rem', fontWeight:'700', display:'flex', alignItems:'center' }}>
                    {meta.aircraft.split(' ')[1] || meta.aircraft}
                  </span>
                </div>

                {/* Seats */}
                <div style={{ textAlign:'center', minWidth:'70px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px', color: meta.seats < 30 ? '#ef4444' : 'var(--success)', fontWeight:'800' }}>
                    <Users size={13} />
                    {meta.seats}
                  </div>
                  <div style={{ fontSize:'0.6875rem', color:'var(--text-muted)' }}>seats left</div>
                </div>

                {/* Status badge */}
                <div style={{
                  background : meta.status.bg,
                  color      : meta.status.color,
                  border     : `1px solid ${meta.status.color}40`,
                  padding    : '0.3rem 0.75rem',
                  borderRadius:'20px',
                  fontSize   :'0.75rem',
                  fontWeight :'800',
                  letterSpacing:'0.05em',
                  textTransform:'uppercase',
                  whiteSpace :'nowrap',
                }}>
                  {meta.status.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

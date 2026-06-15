import React, { useState, useEffect } from 'react';
import { Plane, Megaphone, TrendingUp, Users, Clock, Globe, Wifi, AlertCircle, CheckCircle, Info } from 'lucide-react';

const ANNOUNCEMENTS = [
  {
    type   : 'alert',
    icon   : <AlertCircle size={16} />,
    title  : 'Runway 2 Maintenance',
    body   : 'Delhi IGI Airport Runway 2 will be under maintenance on 20 Jun 2026 between 02:00–06:00 AM. Expect delays on AI-101 and BB-777.',
    time   : '2 hours ago',
    color  : '#f59e0b',
  },
  {
    type   : 'info',
    icon   : <Info size={16} />,
    title  : 'New Route Launched',
    body   : 'Boing Boing Airlines announces the new Delhi → Amsterdam (BB-210) non-stop route starting July 1, 2026.',
    time   : '5 hours ago',
    color  : '#38bdf8',
  },
  {
    type   : 'success',
    icon   : <CheckCircle size={16} />,
    title  : 'Summer Sale Active',
    body   : 'Use coupon code SUMMER20 to get 20% off on all bookings made before September 30, 2026.',
    time   : '1 day ago',
    color  : '#10b981',
  },
  {
    type   : 'info',
    icon   : <Megaphone size={16} />,
    title  : 'Wi-Fi Upgrade',
    body   : 'High-speed satellite Wi-Fi is now available on all Boing Boing Air long-haul international flights at no extra charge for business class.',
    time   : '2 days ago',
    color  : '#818cf8',
  },
];

const NEWS = [
  {
    headline: 'Boing Boing Air ranked #1 in Customer Satisfaction 2026',
    source  : 'Aviation Weekly',
    time    : 'Jun 14, 2026',
    color   : '#38bdf8',
  },
  {
    headline: 'IndiGo expands fleet with 50 new Airbus A320neo aircraft',
    source  : 'Business Standard',
    time    : 'Jun 13, 2026',
    color   : '#10b981',
  },
  {
    headline: 'Air India announces new non-stop routes to 12 US cities in 2027',
    source  : 'Times of India',
    time    : 'Jun 12, 2026',
    color   : '#f59e0b',
  },
];

function statusBadge(s) {
  const map = {
    'On Time' : { bg:'rgba(16,185,129,0.1)', color:'#10b981', border:'rgba(16,185,129,0.3)' },
    'Boarding': { bg:'rgba(245,158,11,0.1)', color:'#f59e0b', border:'rgba(245,158,11,0.3)' },
    'Delayed' : { bg:'rgba(239,68,68,0.1)',  color:'#ef4444', border:'rgba(239,68,68,0.3)'  },
  };
  const s2 = map[s] || map['On Time'];
  return (
    <span style={{
      background:s2.bg, color:s2.color, border:`1px solid ${s2.border}`,
      padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.7rem', fontWeight:'800',
    }}>{s}</span>
  );
}

export default function DashboardView() {
  const [flights, setFlights]   = useState([]);
  const [stats, setStats]       = useState({ flights:0, domestic:0, international:0 });
  const [time, setTime]         = useState(new Date());

  useEffect(() => {
    fetch('/api/flights')
      .then(r => r.json())
      .then(data => {
        setFlights(data.slice(0,10)); // top 10 for board
        setStats({
          flights      : data.length,
          domestic     : data.filter(f=>f.flight_type==='DOMESTIC').length,
          international: data.filter(f=>f.flight_type==='INTERNATIONAL').length,
        });
      })
      .catch(()=>{});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fake status based on flight code hash
  const fakeStatus = (code) => {
    const h = code.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
    return ['On Time','On Time','Boarding','On Time','Delayed'][h%5];
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

      {/* Live Clock Banner */}
      <div style={{
        background:'linear-gradient(135deg,rgba(30,58,138,0.5) 0%,rgba(56,189,248,0.15) 100%)',
        border:'1px solid rgba(56,189,248,0.2)', borderRadius:'16px',
        padding:'1.25rem 2rem',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem',
      }}>
        <div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:'900', margin:0 }}>Welcome to Operations Centre</h2>
          <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.875rem' }}>
            Boing Boing Airlines — Ground Control Dashboard
          </p>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'1.75rem', fontWeight:'900', color:'var(--primary)', letterSpacing:'0.04em', fontFamily:'monospace' }}>
            {time.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
          </div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:'600' }}>
            {time.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:'1rem' }}>
        {[
          { icon:<Plane size={22}/>,    label:'Total Flights',   value: stats.flights,       color:'var(--primary)'  },
          { icon:<Globe size={22}/>,    label:'International',   value: stats.international, color:'#818cf8'         },
          { icon:<TrendingUp size={22}/>,label:'Domestic',       value: stats.domestic,      color:'#10b981'         },
          { icon:<Users size={22}/>,    label:'On Time Today',   value: '94%',               color:'#f59e0b'         },
          { icon:<Wifi size={22}/>,     label:'Wi-Fi Flights',   value: '18',                color:'#38bdf8'         },
          { icon:<Clock size={22}/>,    label:'Avg. Delay (min)',value: '12',                color:'#ef4444'         },
        ].map(s => (
          <div key={s.label} style={{
            background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:'12px', padding:'1.25rem',
            display:'flex', alignItems:'center', gap:'1rem',
          }}>
            <div style={{ color:s.color, background:`${s.color}18`, padding:'0.6rem', borderRadius:'10px' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:'1.5rem', fontWeight:'900', color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:'600', marginTop:'2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: Departure Board + Announcements */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'1.5rem', alignItems:'start' }}>

        {/* Departure Board */}
        <div style={{
          background:'rgba(15,23,42,0.6)', border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'16px', overflow:'hidden',
        }}>
          <div style={{
            padding:'1rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)',
            display:'flex', alignItems:'center', gap:'0.75rem',
          }}>
            <Plane size={18} style={{ color:'var(--primary)' }} />
            <span style={{ fontWeight:'800', fontSize:'1rem' }}>Live Departures</span>
            <span style={{
              marginLeft:'auto', background:'rgba(16,185,129,0.1)', color:'#10b981',
              border:'1px solid rgba(16,185,129,0.3)', padding:'0.2rem 0.6rem',
              borderRadius:'10px', fontSize:'0.7rem', fontWeight:'800',
            }}>LIVE</span>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  {['Flight','Route','Departs','Arrives','Status'].map(h=>(
                    <th key={h} style={{ padding:'0.75rem 1rem', textAlign:'left', color:'var(--text-muted)', fontWeight:'700', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flights.map((f, i) => (
                  <tr key={f.f_code} style={{
                    borderBottom:'1px solid rgba(255,255,255,0.04)',
                    background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(56,189,248,0.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background= i%2===0?'transparent':'rgba(255,255,255,0.01)'}
                  >
                    <td style={{ padding:'0.75rem 1rem' }}>
                      <div style={{ fontWeight:'700', color:'var(--primary)' }}>{f.f_code}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{f.f_name}</div>
                    </td>
                    <td style={{ padding:'0.75rem 1rem' }}>
                      <span style={{ fontWeight:'700' }}>{f.source?.substring(0,3).toUpperCase()}</span>
                      <span style={{ color:'var(--text-muted)', margin:'0 0.35rem' }}>→</span>
                      <span style={{ fontWeight:'700' }}>{f.destination?.substring(0,3).toUpperCase()}</span>
                    </td>
                    <td style={{ padding:'0.75rem 1rem', color:'var(--text-primary)', fontWeight:'600' }}>{f.departure_time||'—'}</td>
                    <td style={{ padding:'0.75rem 1rem', color:'var(--text-secondary)' }}>{f.arrival_time||'—'}</td>
                    <td style={{ padding:'0.75rem 1rem' }}>{statusBadge(fakeStatus(f.f_code))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
            <Megaphone size={18} style={{ color:'var(--accent)' }} />
            <span style={{ fontWeight:'800', fontSize:'1rem' }}>Announcements</span>
          </div>
          {ANNOUNCEMENTS.map((a, i) => (
            <div key={i} style={{
              background:'rgba(15,23,42,0.6)', border:`1px solid ${a.color}30`,
              borderLeft:`3px solid ${a.color}`, borderRadius:'10px', padding:'1rem',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem', color:a.color }}>
                {a.icon}
                <span style={{ fontWeight:'700', fontSize:'0.875rem' }}>{a.title}</span>
                <span style={{ marginLeft:'auto', fontSize:'0.7rem', color:'var(--text-muted)' }}>{a.time}</span>
              </div>
              <p style={{ margin:0, fontSize:'0.8125rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{a.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Airline News */}
      <div style={{
        background:'rgba(15,23,42,0.6)', border:'1px solid rgba(255,255,255,0.06)',
        borderRadius:'16px', padding:'1.25rem 1.5rem',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' }}>
          <TrendingUp size={18} style={{ color:'var(--secondary)' }} />
          <span style={{ fontWeight:'800', fontSize:'1rem' }}>Aviation News</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1rem' }}>
          {NEWS.map((n,i)=>(
            <div key={i} style={{
              borderLeft:`3px solid ${n.color}`, paddingLeft:'1rem',
            }}>
              <p style={{ margin:'0 0 0.25rem', fontWeight:'700', fontSize:'0.875rem', color:'var(--text-primary)' }}>{n.headline}</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <span style={{ fontSize:'0.75rem', color:n.color, fontWeight:'700' }}>{n.source}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

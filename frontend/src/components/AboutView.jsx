import React, { useState } from 'react';
import { Plane, Globe, Users, Award, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const MANUAL = [
  {
    title:'How to Register a Passenger',
    steps:[
      'Click "Add Customer" in the sidebar.',
      'Fill in the passenger\'s Full Name, Aadhar ID, Nationality, Phone, Date of Birth, Gender, and Residential Address.',
      'Enter an Emergency Contact number.',
      'If the passenger is an international traveller, enable the "International Traveller" toggle and fill in Passport Number, Expiry Date, and Issuing Country.',
      'Click "SAVE CUSTOMER". The record is created or updated automatically.',
    ],
  },
  {
    title:'How to Search & Book Flights',
    steps:[
      'Click "Book Flights" in the sidebar.',
      'Step 1 — Enter the passenger\'s Aadhar ID and click FETCH.',
      'Step 2 — Choose Domestic or International, select Origin and Destination, then click SEARCH FLIGHTS. Pick a flight from the list.',
      'Step 3 — Select a seat on the visual aircraft cabin map. Colour zones indicate First, Business, Premium Economy, and Economy.',
      'Step 4 — Choose One-Way or Round-Trip, set travel dates, and optionally add Meal and/or Wi-Fi.',
      'Step 5 — Apply a coupon code if you have one, choose a payment method, and click CONFIRM & BOOK.',
    ],
  },
  {
    title:'How to Check Your Boarding Pass',
    steps:[
      'After booking, click "Check Boarding Pass" on the receipt to jump directly to your boarding pass.',
      'Alternatively, open "Check Boarding Pass" from the sidebar, enter the PNR number, and click ENTER.',
      'The boarding pass shows your seat, gate, boarding time, PNR, Ticket ID, and a barcode.',
      'Click "Print / Save as PDF" to download or print your boarding pass.',
    ],
  },
  {
    title:'How to Update a Booking',
    steps:[
      'Click "Update Booking" in the sidebar.',
      'Enter your PNR number and click FIND.',
      'Edit the travel date, return date, cabin class, seat number, or add-on preferences.',
      'Click "UPDATE BOOKING" to save changes.',
    ],
  },
  {
    title:'How to Cancel a Booking',
    steps:[
      'Click "Update Booking" in the sidebar and find your reservation by PNR.',
      'Click the red "CANCEL BOOKING" button.',
      'A confirmation dialog will show your refund amount (75% of the original ticket price).',
      'Click "YES, CANCEL TICKET" to confirm. The refund is credited within 5-7 business days.',
    ],
  },
  {
    title:'Available Coupon Codes',
    steps:[
      'BOING10 — 10% off your first booking (valid until Dec 2027)',
      'SUMMER20 — 20% summer sale discount (valid until Sep 2026)',
      'INTL15 — 15% off international flights (valid until Jun 2027)',
      'WELCOME5 — 5% welcome bonus (valid until Dec 2027)',
      'BUSINESS25 — 25% off business class bookings (valid until Dec 2026)',
    ],
  },
];

export default function AboutView({ setActiveTab }) {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="panel" style={{animation:'fadeIn 0.2s'}}>

      {/* Hero */}
      <div style={{
        background:'linear-gradient(135deg,rgba(30,58,138,0.6) 0%,rgba(56,189,248,0.15) 100%)',
        border:'1px solid rgba(56,189,248,0.2)',borderRadius:'16px',
        padding:'3rem 2.5rem',marginBottom:'2rem',textAlign:'center',position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',top:0,left:0,width:'100%',height:'4px',background:'linear-gradient(90deg,var(--secondary),var(--primary))'}}/>
        <div style={{
          width:80,height:80,borderRadius:'50%',
          background:'linear-gradient(135deg,rgba(56,189,248,0.2),rgba(129,140,248,0.2))',
          border:'1px solid rgba(56,189,248,0.3)',
          display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 auto 1.5rem',
        }}>
          <Plane size={36} style={{color:'var(--primary)',transform:'rotate(45deg)'}}/>
        </div>
        <h1 style={{fontSize:'2.5rem',fontWeight:'900',marginBottom:'0.5rem',letterSpacing:'0.05em'}}>BOING BOING AIRLINES</h1>
        <p style={{color:'var(--text-secondary)',fontSize:'1.125rem',marginBottom:'0.25rem'}}>Your journey, our passion</p>
        <p style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>Airline Management System v2.0</p>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
        {[
          { icon:<Globe size={24}/>,   label:'Destinations',   value:'50+',    color:'var(--primary)'   },
          { icon:<Plane size={24}/>,   label:'Active Flights',  value:'30',     color:'#818cf8'          },
          { icon:<Users size={24}/>,   label:'Passengers / Day',value:'12,000+',color:'#10b981'          },
          { icon:<Award size={24}/>,   label:'Years of Service',value:'18',     color:'#f59e0b'          },
        ].map(s=>(
          <div key={s.label} style={{
            background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:'12px',padding:'1.5rem',textAlign:'center',
          }}>
            <div style={{color:s.color,display:'flex',justifyContent:'center',marginBottom:'0.75rem'}}>{s.icon}</div>
            <div style={{fontSize:'1.75rem',fontWeight:'900',color:s.color}}>{s.value}</div>
            <div style={{fontSize:'0.8125rem',color:'var(--text-muted)',fontWeight:'600'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* About Text */}
      <div style={{
        background:'rgba(15,23,42,0.5)',border:'1px solid rgba(255,255,255,0.06)',
        borderRadius:'12px',padding:'1.75rem 2rem',marginBottom:'2rem',
      }}>
        <h2 style={{fontSize:'1.25rem',fontWeight:'800',marginBottom:'1rem',color:'var(--primary)'}}>About Us</h2>
        <p style={{color:'var(--text-secondary)',lineHeight:1.7,marginBottom:'1rem'}}>
          Boing Boing Airlines was founded with a singular vision: to make air travel accessible, comfortable, and delightful for every passenger. From our humble beginnings operating a single domestic route in 2006, we have grown into one of India's most trusted carriers, now serving over 50 destinations across 20 countries.
        </p>
        <p style={{color:'var(--text-secondary)',lineHeight:1.7}}>
          Our fleet of modern Boeing 737, Airbus A320, and Boeing 777 aircraft is maintained to the highest safety standards. Whether you're flying economy on a short domestic hop or settling into our award-winning First Class cabin for a long-haul international journey, Boing Boing Airlines promises an experience that keeps you coming back.
        </p>
      </div>

      {/* User Manual Accordion */}
      <div style={{marginBottom:'2rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
          <BookOpen size={20} style={{color:'var(--secondary)'}}/>
          <h2 style={{fontSize:'1.25rem',fontWeight:'800',margin:0}}>User Manual</h2>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {MANUAL.map((item,i)=>(
            <div key={i} style={{
              border:'1px solid rgba(255,255,255,0.06)',borderRadius:'10px',overflow:'hidden',
              background: openIdx===i ? 'rgba(56,189,248,0.04)' : 'rgba(15,23,42,0.4)',
              transition:'all 0.2s',
            }}>
              <button
                onClick={()=>setOpenIdx(openIdx===i?null:i)}
                style={{
                  width:'100%',padding:'1rem 1.25rem',
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  background:'transparent',border:'none',cursor:'pointer',
                  color: openIdx===i?'var(--primary)':'var(--text-primary)',
                  fontWeight:'700',fontSize:'0.9375rem',textAlign:'left',
                  borderBottom: openIdx===i ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <span>{i+1}. {item.title}</span>
                {openIdx===i ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
              </button>
              {openIdx===i && (
                <div style={{padding:'1.25rem',animation:'fadeIn 0.2s'}}>
                  <ol style={{margin:0,paddingLeft:'1.25rem',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                    {item.steps.map((s,j)=>(
                      <li key={j} style={{color:'var(--text-secondary)',lineHeight:1.6,fontSize:'0.9rem'}}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Credits */}
      <div style={{
        textAlign:'center',padding:'2rem',
        background:'rgba(129,140,248,0.05)',border:'1px solid rgba(129,140,248,0.15)',
        borderRadius:'12px',
      }}>
        <p style={{color:'var(--text-muted)',marginBottom:'0.25rem',fontSize:'0.875rem'}}>Airline Management System</p>
        <p style={{fontWeight:'800',fontSize:'1.125rem',color:'var(--secondary)',margin:0}}>
          Designed &amp; Developed by <span style={{color:'var(--primary)'}}>Ketan Channa</span>
        </p>
        <p style={{color:'var(--text-muted)',fontSize:'0.8125rem',marginTop:'0.5rem'}}>© 2026 Boing Boing Airlines. All rights reserved.</p>
      </div>

    </div>
  );
}

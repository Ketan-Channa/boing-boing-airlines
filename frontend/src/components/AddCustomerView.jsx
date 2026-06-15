import React, { useState } from 'react';
import { UserPlus, Globe, ChevronDown, ChevronUp } from 'lucide-react';

const Field = ({ label, id, type='text', value, onChange, required, placeholder, min }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>{label}{required&&<span style={{color:'#ef4444'}}> *</span>}</label>
    <input id={id} type={type} className="form-input"
      placeholder={placeholder||label} value={value}
      onChange={e=>onChange(e.target.value)} required={required} min={min} />
  </div>
);

export default function AddCustomerView({ showToast, setActiveTab }) {
  const [form, setForm] = useState({
    name: '', nationality: '', phone: '', gender: '',
    date_of_birth: '', address: '', emergency_contact: '',
    aadhar: '', is_international: false,
    passport_no: '', passport_expiry: '', passport_country: '',
  });
  const [loading, setLoading]           = useState(false);
  const [showPassport, setShowPassport] = useState(false);

  const update = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'is_international') setShowPassport(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.aadhar) { showToast('Name and Aadhar are required', 'error'); return; }
    if (form.is_international && !form.passport_no) {
      showToast('Passport number is required for international travellers', 'error'); return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/passengers', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setForm({ name:'', nationality:'', phone:'', gender:'', date_of_birth:'', address:'',
          emergency_contact:'', aadhar:'', is_international:false,
          passport_no:'', passport_expiry:'', passport_country:'' });
        setShowPassport(false);
      } else {
        showToast(data.message || 'Error saving customer', 'error');
      }
    } catch { showToast('Server connection error', 'error'); }
    finally { setLoading(false); }
  };


  return (
    <div className="panel" style={{ animation:'fadeIn 0.2s' }}>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Customer Registration</h2>
          <p className="panel-subtitle">Register a new passenger or update existing records via Aadhar ID</p>
        </div>
      </div>

      <div className="layout-split">
        <div className="layout-form">
          <form onSubmit={handleSubmit}>

            {/* Section: Personal Info */}
            <div className="form-section-label">Personal Information</div>
            <div className="form-grid">
              <Field label="Full Name" id="name" value={form.name} onChange={v=>update('name',v)} required placeholder="As per government ID" />
              <Field label="Aadhar ID" id="aadhar" value={form.aadhar} onChange={v=>update('aadhar',v)} required placeholder="12-digit Aadhar number" />
              <Field label="Nationality" id="nationality" value={form.nationality} onChange={v=>update('nationality',v)} placeholder="e.g. Indian" />
              <Field label="Phone Number" id="phone" type="tel" value={form.phone} onChange={v=>update('phone',v)} placeholder="+91 XXXXX XXXXX" />
              <Field label="Date of Birth" id="dob" type="date" value={form.date_of_birth} onChange={v=>update('date_of_birth',v)} />
              <div className="form-group">
                <label className="form-label" htmlFor="gender">Gender</label>
                <select id="gender" className="form-select" value={form.gender} onChange={e=>update('gender',e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn:'1/-1' }}>
                <label className="form-label" htmlFor="address">Residential Address</label>
                <textarea id="address" className="form-input" rows={2}
                  placeholder="Full address including city and PIN code"
                  value={form.address} onChange={e=>update('address',e.target.value)}
                  style={{ resize:'vertical' }} />
              </div>
              <Field label="Emergency Contact" id="ec" value={form.emergency_contact} onChange={v=>update('emergency_contact',v)} placeholder="Name — phone number" />
            </div>

            {/* Section: International Traveller Toggle */}
            <div style={{
              marginTop:'1.5rem', padding:'1rem 1.25rem',
              background: form.is_international ? 'rgba(129,140,248,0.08)' : 'rgba(255,255,255,0.02)',
              border:`1px solid ${form.is_international ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius:'10px', cursor:'pointer', transition:'all 0.2s',
            }} onClick={()=>update('is_international',!form.is_international)}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <Globe size={18} style={{ color: form.is_international ? '#818cf8' : 'var(--text-muted)' }} />
                <span style={{ fontWeight:'700', color: form.is_international ? 'var(--secondary)' : 'var(--text-secondary)' }}>
                  International Traveller
                </span>
                <span style={{ marginLeft:'auto', fontSize:'0.8125rem', color:'var(--text-muted)' }}>
                  (Enable to add passport details)
                </span>
                {form.is_international ? <ChevronUp size={16} style={{color:'var(--secondary)'}}/> : <ChevronDown size={16} style={{color:'var(--text-muted)'}}/>}
              </div>
            </div>

            {/* Passport Section */}
            {showPassport && (
              <div style={{ animation:'fadeIn 0.25s', marginTop:'1rem', padding:'1.25rem',
                border:'1px solid rgba(129,140,248,0.2)', borderRadius:'10px',
                background:'rgba(129,140,248,0.04)' }}>
                <div className="form-section-label" style={{ marginBottom:'1rem', color:'var(--secondary)' }}>
                  Passport & Travel Documents
                </div>
                <div className="form-grid">
                  <Field label="Passport Number" id="pno" value={form.passport_no} onChange={v=>update('passport_no',v)} required placeholder="e.g. A1234567" />
                  <Field label="Passport Expiry Date" id="pexp" type="date" value={form.passport_expiry} onChange={v=>update('passport_expiry',v)} required />
                  <Field label="Issuing Country" id="pc" value={form.passport_country} onChange={v=>update('passport_country',v)} required placeholder="e.g. India" />
                </div>
              </div>
            )}

            <div className="btn-group" style={{ marginTop:'2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <UserPlus size={18} />
                {loading ? 'Saving…' : 'SAVE CUSTOMER'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={()=>setActiveTab('dashboard')}>
                BACK
              </button>
            </div>
          </form>
        </div>

        <div className="layout-image-container">
          <img src="/icons/addcustomer.jpg" alt="Customer Registration" className="layout-image" />
        </div>
      </div>
    </div>
  );
}

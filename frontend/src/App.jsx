import React, { useState, useEffect } from 'react';
import {
  Plane, UserPlus, Calendar, CheckSquare, LogOut,
  Compass, Info, CheckCircle2, AlertTriangle, Edit3, HelpCircle,
} from 'lucide-react';

// Sub-components
import Splash          from './components/Splash';
import AuthView        from './components/AuthView';
import DashboardView   from './components/DashboardView';
import AddCustomerView from './components/AddCustomerView';
import FlightDetailsView from './components/FlightDetailsView';
import BookFlightView  from './components/BookFlightView';
import BoardingPassView from './components/BoardingPassView';
import UpdateFlightView from './components/UpdateFlightView';
import AboutView       from './components/AboutView';

export default function App() {
  const [showSplash, setShowSplash]       = useState(true);
  const [user, setUser]                   = useState(null);
  const [activeTab, setActiveTab]         = useState('dashboard');
  const [toast, setToast]                 = useState(null);
  const [preloadedPnr, setPreloadedPnr]   = useState(null);

  const navigateToBoardingPass = (pnr) => {
    setPreloadedPnr(pnr);
    setActiveTab('boarding-pass');
  };

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
    showToast('Logged out successfully', 'info');
  };

  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;
  if (!user)      return <AuthView setUser={setUser} showToast={showToast} />;

  const NAV = [
    { group:'Operations', items:[
      { id:'dashboard',     icon:<Compass size={20}/>,    label:'Dashboard'         },
      { id:'add-customer',  icon:<UserPlus size={20}/>,   label:'Add Customer'      },
      { id:'flight-details',icon:<Plane size={20}/>,      label:'Flight Details'    },
      { id:'book-flight',   icon:<Calendar size={20}/>,   label:'Book Flights'      },
    ]},
    { group:'Ticketing', items:[
      { id:'boarding-pass', icon:<CheckSquare size={20}/>,label:'Check Boarding Pass'},
      { id:'update-flight', icon:<Edit3 size={20}/>,      label:'Update Booking'    },
    ]},
    { group:'Info', items:[
      { id:'about',         icon:<HelpCircle size={20}/>, label:'About Us'          },
    ]},
  ];

  const pageTitle = {
    'dashboard'     : 'Dashboard Overview',
    'add-customer'  : 'Customer Registration',
    'flight-details': 'Flight Information',
    'book-flight'   : 'Flight Booking System',
    'boarding-pass' : 'Boarding Pass Desk',
    'update-flight' : 'Update / Cancel Booking',
    'about'         : 'About Boing Boing Airlines',
  };

  return (
    <div className="app-container">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : ''}`}>
          {toast.type === 'error' ? <AlertTriangle size={18}/> : toast.type==='info' ? <Info size={18}/> : <CheckCircle2 size={18}/>}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Plane className="logo-icon" size={28} style={{ transform:'rotate(45deg)', color:'var(--primary)' }} />
          <span>Boing Boing Air</span>
        </div>

        <nav className="sidebar-menu">
          {NAV.map(group => (
            <React.Fragment key={group.group}>
              <div className="sidebar-category">{group.group}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item" onClick={handleLogout}
            style={{ width:'100%', border:'none', background:'none' }}>
            <LogOut size={20}/>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h1 className="page-title">{pageTitle[activeTab] || 'Boing Boing Airlines'}</h1>
          <div className="user-profile">
            <span style={{ fontSize:'0.875rem', color:'var(--text-secondary)' }}>
              Welcome, {user.username || 'Administrator'}
            </span>
            <div className="avatar">{(user.username || 'AD').substring(0,2).toUpperCase()}</div>
          </div>
        </header>

        <section className="content-body">
          {activeTab === 'dashboard'      && <DashboardView setActiveTab={setActiveTab} />}
          {activeTab === 'add-customer'   && <AddCustomerView showToast={showToast} setActiveTab={setActiveTab} />}
          {activeTab === 'flight-details' && <FlightDetailsView showToast={showToast} setActiveTab={setActiveTab} />}
          {activeTab === 'book-flight'    && <BookFlightView showToast={showToast} setActiveTab={setActiveTab} navigateToBoardingPass={navigateToBoardingPass} />}
          {activeTab === 'boarding-pass'  && <BoardingPassView showToast={showToast} preloadedPnr={preloadedPnr} clearPreloadedPnr={()=>setPreloadedPnr(null)} />}
          {activeTab === 'update-flight'  && <UpdateFlightView showToast={showToast} setActiveTab={setActiveTab} />}
          {activeTab === 'about'          && <AboutView setActiveTab={setActiveTab} />}
        </section>
      </main>
    </div>
  );
}

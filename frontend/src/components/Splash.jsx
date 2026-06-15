import React, { useState, useEffect } from 'react';

export default function Splash({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase]       = useState('');

  const phases = [
    'Initialising systems…',
    'Loading flight database…',
    'Connecting to airport network…',
    'Calibrating navigation…',
    'Ready for takeoff!',
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 4) + 1;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(onFinish, 600);
      }
      setProgress(current);
      if      (current < 20)  setPhase(phases[0]);
      else if (current < 40)  setPhase(phases[1]);
      else if (current < 65)  setPhase(phases[2]);
      else if (current < 85)  setPhase(phases[3]);
      else                    setPhase(phases[4]);
    }, 50);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="splash-container">
      {/* Animated starfield dots */}
      <div className="splash-stars">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="splash-star" style={{
            left    : `${Math.random() * 100}%`,
            top     : `${Math.random() * 100}%`,
            width   : `${Math.random() * 3 + 1}px`,
            height  : `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${Math.random() * 2 + 2}s`,
          }} />
        ))}
      </div>

      {/* Plane silhouette */}
      <div className="splash-plane">✈</div>

      {/* Main content */}
      <div className="splash-content">
        <div className="splash-logo-ring">
          <span className="splash-logo-icon">✈</span>
        </div>

        <h1 className="splash-title">BOING BOING AIRLINES</h1>
        <p className="splash-tagline">Your journey, our passion</p>

        {/* Loading bar */}
        <div className="splash-progress-container">
          <div className="splash-progress-bar">
            <div
              className="splash-progress-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="splash-progress-shimmer" />
            </div>
          </div>
          <div className="splash-progress-meta">
            <span className="splash-phase">{phase}</span>
            <span className="splash-percent">{progress}%</span>
          </div>
        </div>

        <p className="splash-credit">Designed by <strong>Ketan Channa</strong></p>
      </div>
    </div>
  );
}

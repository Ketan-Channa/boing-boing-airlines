import React, { useState } from 'react';
import { Plane, LogIn, UserPlus, Key, Info, HelpCircle, Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ value, onChange, placeholder, show, setShow }) => (
  <div style={{ position: 'relative', width: '100%' }}>
    <input 
      type={show ? "text" : "password"} 
      className="form-input" 
      value={value} 
      onChange={onChange}
      placeholder={placeholder}
      required
      style={{ paddingRight: '2.5rem', width: '100%' }}
    />
    <button 
      type="button"
      onClick={() => setShow(!show)}
      style={{
        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);

export default function AuthView({ setUser, showToast }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regQuestion, setRegQuestion] = useState('What is your favorite airline?');
  const [regAnswer, setRegAnswer] = useState('');

  // Forgot Password fields
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Username lookup, 2: Security question answer & reset
  const [fetchedQuestion, setFetchedQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmNewPassword, setForgotConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmNewPassword, setShowForgotConfirmNewPassword] = useState(false);

  const securityQuestions = [
    'What is your favorite airline?',
    'What was the name of your first pet?',
    'In what city were you born?',
    'What was the model of your first car?',
    'What is your mother\'s maiden name?'
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      showToast('Please enter username and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        showToast('Login successful!');
      } else {
        showToast(data.message || 'INVALID USERNAME OR PASSWORD', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection to server failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regUsername || !regPassword || !regConfirmPassword || !regAnswer) {
      showToast('All fields are required', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
          securityQuestion: regQuestion,
          securityAnswer: regAnswer
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast(data.message || 'Account created successfully!');
        setMode('login');
        // Clear registration states
        setRegUsername('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegAnswer('');
      } else {
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Database server error', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password lookup username
  const handleForgotLookup = async (e) => {
    e.preventDefault();
    if (!forgotUsername) {
      showToast('Please enter your username', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotUsername })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setFetchedQuestion(data.securityQuestion);
        setForgotStep(2);
        showToast('Security question loaded');
      } else {
        showToast(data.message || 'Username not found', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection to server failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password verify and reset password
  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (!forgotAnswer || !forgotNewPassword || !forgotConfirmNewPassword) {
      showToast('All fields are required', 'error');
      return;
    }
    if (forgotNewPassword !== forgotConfirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername,
          securityAnswer: forgotAnswer,
          newPassword: forgotNewPassword
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast(data.message || 'Password reset successful!');
        setMode('login');
        // Clear forgot password states
        setForgotUsername('');
        setForgotStep(1);
        setFetchedQuestion('');
        setForgotAnswer('');
        setForgotNewPassword('');
        setForgotConfirmNewPassword('');
      } else {
        showToast(data.message || 'Verification failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error resetting password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetAllFields = () => {
    setLoginUsername('');
    setLoginPassword('');
    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegAnswer('');
    setForgotUsername('');
    setForgotStep(1);
    setFetchedQuestion('');
    setForgotAnswer('');
    setForgotNewPassword('');
    setForgotConfirmNewPassword('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        {/* Branding header */}
        <div className="login-header">
          <div className="login-logo">
            <Plane size={36} style={{ transform: 'rotate(45deg)', color: 'var(--primary)' }} />
            <span>Boing Boing Air</span>
          </div>
          <p className="login-subtitle">
            {mode === 'login' && 'Administrator Portal Access'}
            {mode === 'register' && 'Create Administrator Account'}
            {mode === 'forgot' && 'Account Recovery Portal'}
          </p>
        </div>

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-input" 
                value={loginUsername} 
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Password</label>
              <PasswordInput 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                show={showLoginPassword}
                setShow={setShowLoginPassword}
              />
            </div>

            <div className="auth-row">
              <span className="auth-link" onClick={() => { setMode('forgot'); resetAllFields(); }}>
                Forgot Password?
              </span>
            </div>

            <div className="btn-group" style={{ flexDirection: 'column', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <LogIn size={18} />
                {loading ? 'Authenticating...' : 'SUBMIT'}
              </button>
            </div>

            <p className="auth-switch-text">
              Don't have an account?
              <span className="auth-link" onClick={() => { setMode('register'); resetAllFields(); }}>
                Create Account
              </span>
            </p>
          </form>
        )}

        {/* 2. REGISTER MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-input" 
                value={regUsername} 
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Pick username"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Password</label>
              <PasswordInput 
                value={regPassword} 
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Enter password"
                show={showRegPassword}
                setShow={setShowRegPassword}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Confirm Password</label>
              <PasswordInput 
                value={regConfirmPassword} 
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                show={showRegConfirmPassword}
                setShow={setShowRegConfirmPassword}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Security Question</label>
              <select 
                className="form-select" 
                value={regQuestion}
                onChange={(e) => setRegQuestion(e.target.value)}
              >
                {securityQuestions.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Security Answer</label>
              <input 
                type="text" 
                className="form-input" 
                value={regAnswer} 
                onChange={(e) => setRegAnswer(e.target.value)}
                placeholder="Answer for password recovery"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </button>

            <p className="auth-switch-text">
              Already have an account?
              <span className="auth-link" onClick={() => { setMode('login'); resetAllFields(); }}>
                Login Here
              </span>
            </p>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <div>
            {forgotStep === 1 ? (
              <form onSubmit={handleForgotLookup}>
                <p className="auth-step-desc">
                  Enter your administrator username to retrieve your security challenge question.
                </p>
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={forgotUsername} 
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  <HelpCircle size={18} />
                  {loading ? 'Searching...' : 'RETRIEVE QUESTION'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset}>
                <p className="auth-step-desc">
                  Verify your identity by answering the challenge question and setting a new password.
                </p>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Your Security Question</label>
                  <div className="auth-security-question-box">
                    {fetchedQuestion}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Your Answer</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={forgotAnswer} 
                    onChange={(e) => setForgotAnswer(e.target.value)}
                    placeholder="Enter answer"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">New Password</label>
                  <PasswordInput 
                    value={forgotNewPassword} 
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    show={showForgotNewPassword}
                    setShow={setShowForgotNewPassword}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label">Confirm New Password</label>
                  <PasswordInput 
                    value={forgotConfirmNewPassword} 
                    onChange={(e) => setForgotConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    show={showForgotConfirmNewPassword}
                    setShow={setShowForgotConfirmNewPassword}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  <Key size={18} />
                  {loading ? 'Resetting password...' : 'RESET PASSWORD'}
                </button>
              </form>
            )}

            <p className="auth-switch-text">
              Go back to 
              <span className="auth-link" onClick={() => { setMode('login'); resetAllFields(); }}>
                Login Screen
              </span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

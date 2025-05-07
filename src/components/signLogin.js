import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {userService} from '../services/apiService';
import '../style/signLogin.css';

const SignLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();
    
    const toggleForm = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('customer');
        setMessage({ text: '', type: '' });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            if (isLogin) {
                const result = await userService.login(email, password, role);
                setMessage({ text: result.message || 'Login successful', type: 'success' });
                
                // Redirect based on role
                if (role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (role === 'organization') {
                    navigate('/org/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                if (password !== confirmPassword) {
                    setMessage({ text: 'Password and confirmation do not match', type: 'error' });
                    setLoading(false);
                    return;
                }
                
                const result = await userService.register(email, password, role);
                setMessage({ text: result.message || 'Registration successful', type: 'success' });
                
                // Redirect based on role
                if (role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (role === 'organization') {
                    navigate('/org/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            setMessage({ text: error.message || 'An error occurred', type: 'error' });
            console.error('Auth error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
      <body className= "signlogin">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">
                {isLogin ? 'Welcome Back!' : 'Join Us Today'}
              </h2>
              <p className="auth-subtitle">
                {isLogin ? 'Login to access your account' : 'Create a new account'}
              </p>
            </div>
            
            <div className="auth-content">
              {message.text && (
                <div className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="input-container">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="form-input"
                    />
                    <div className="input-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        {showPassword ? (
                          <>
                            <path strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </>
                        ) : (
                          <>
                            <path strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Confirm Password Field (only for register) */}
                {!isLogin && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <div className="input-container">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="form-input"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          {showConfirmPassword ? (
                            <>
                              <path strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </>
                          ) : (
                            <>
                              <path strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Role Selection (only for register) */}
                {!isLogin && (
                  <div className="form-group">
                    <label className="form-label">
                      Account Type
                    </label>
                    <div className="role-options">
                      {['customer', 'organization', 'admin'].map((r) => (
                        <div key={r} className="role-option">
                          <input
                            type="radio"
                            id={r}
                            name="role"
                            checked={role === r}
                            onChange={() => setRole(r)}
                            className="role-input"
                          />
                          <label
                            htmlFor={r}
                            className={`role-label ${role === r ? 'role-label-selected' : ''}`}
                          >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </label>
                          <div className={`role-check ${role === r ? 'visible' : ''}`}>
                            <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`submit-button ${loading ? 'loading' : ''}`}
                >
                  {loading ? (
                    <span className="loading-text">
                      <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="4" strokeOpacity="0.25"></circle>
                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" strokeWidth="4"></path>
                      </svg>
                      {isLogin ? 'Logging in...' : 'Registering...'}
                    </span>
                  ) : isLogin ? (
                    'Login'
                  ) : (
                    'Register'
                  )}
                </button>
              </form>
              
              {/* Toggle between login/register */}
              <div className="toggle-form">
                <span>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  onClick={toggleForm}
                  className="toggle-link"
                >
                  {isLogin ? 'Register here' : 'Login here'}
                </button>
              </div>
              
              {/* Divider */}
              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">OR</span>
                <div className="divider-line"></div>
              </div>
              
              {/* Social Login Buttons */}
              <div className="social-buttons">
                <button type="button" className="social-button facebook">
                  <svg className="social-icon" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                  <span>Facebook</span>
                </button>
                <button type="button" className="social-button google">
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.137-2.664-6.735-2.664-5.523 0-10 4.477-10 10s4.477 10 10 10c8.396 0 10-7.524 10-10 0-0.61-0.056-1.216-0.158-1.808h-9.842z" fill="#4285F4" />
                    <path d="M3.545 7.523l3.275 2.401c0.76-2.301 2.863-3.972 5.18-3.972 1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.137-2.664-6.735-2.664-4.344 0-8.074 2.702-9.455 6.596z" fill="#EA4335" />
                    <path d="M12.545 21.239c2.598 0 4.951-1 6.735-2.664l-3.219-2.401c-0.899 0.6-2.035 0.934-3.516 0.934-2.798 0-5.133-1.657-5.845-3.972h-5.445v2.687c1.381 3.894 5.111 6.596 9.455 6.596z" fill="#34A853" />
                    <path d="M21.545 12.239c0-0.61-0.056-1.216-0.158-1.808h-9.842v3.821h5.445c-0.323 1.031-0.813 1.908-1.426 2.608l3.219 2.401c1.941-1.832 3.162-4.548 3.162-8.022z" fill="#FBBC05" />
                  </svg>
                  <span>Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        </body>
      );
    };
    
    export default SignLogin;
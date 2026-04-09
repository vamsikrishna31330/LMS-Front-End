import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleDemoLogin = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setRole(cred.role);
    setIsSignup(false);
    setErrors({});
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isSignup && (!name || name.trim().length < 2)) newErrors.name = 'Name must be at least 2 characters';
    if (!emailPattern.test(email)) newErrors.email = 'Please enter a valid email address';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (isSignup) {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) newErrors.phone = 'Phone number must contain exactly 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsLoading(true);

    if (isSignup) {
      const digitsOnly = phone.replace(/\D/g, '');
      const result = await signup(name.trim(), email, password, digitsOnly, role);
      setIsLoading(false);
      if (result.success) {
        setIsSignup(false);
        setPassword('');
        setPhone('');
        setName('');
        setErrors({ _success: 'Account created! Please sign in.' });
      } else {
        setServerError(result.error);
      }
      return;
    }

    const result = await login(email, password, role);
    setIsLoading(false);
    if (result.success) {
      const roleRoutes = { admin: '/admin', instructor: '/instructor', student: '/student', 'content-creator': '/content-creator' };
      navigate(roleRoutes[result.user.role] || '/');
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">📚</div>
          <h1>{isSignup ? 'Create your EduLearn account' : 'Welcome to EduLearn'}</h1>
          <p>{isSignup ? 'Join EduLearn and start your learning journey' : 'Your comprehensive learning management platform'}</p>
        </div>

        {serverError && <div className="error-banner">⚠️ {serverError}</div>}
        {errors._success && <div className="success-banner">✅ {errors._success}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="form-group">
              <label htmlFor="name">Full Name*</label>
              <input
                type="text" id="name" placeholder="Your full name"
                value={name} onChange={(e) => setName(e.target.value)} required
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address{isSignup ? '*' : ''}</label>
            <input
              type="email" id="email" placeholder="example@domain.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password{isSignup ? '*' : ''}</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'} id="password"
                placeholder="Minimum 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required minLength={6}
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="phone">Phone Number*</label>
              <input
                type="text" id="phone" placeholder="10-digit phone number"
                value={phone} onChange={(e) => setPhone(e.target.value)} required
              />
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">Select Your Role</label>
            <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="role-select">
              <option value="student">🎓 Student</option>
              <option value="instructor">👨‍🏫 Instructor</option>
              <option value="admin">🛡️ Admin</option>
              <option value="content-creator">✏️ Content Creator</option>
            </select>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? '⏳ Please wait...' : isSignup ? '🚀 Create Account' : '🔑 Sign In'}
          </button>
        </form>

        <div className="login-footer">
          {!isSignup && (
            <>
              <p className="demo-title">⚡ Quick Demo Login</p>
              <div className="demo-credentials">
                {DEMO_CREDENTIALS.map((cred) => (
                  <button key={cred.role} type="button" className="demo-btn" onClick={() => handleDemoLogin(cred)}>
                    <span className="demo-icon">{cred.icon}</span>
                    <span className="demo-role">{cred.label}</span>
                  </button>
                ))}
              </div>
              <p className="demo-note">Click any button to auto-fill demo credentials</p>
            </>
          )}
          <p className="toggle-auth-text">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" className="toggle-auth-btn" onClick={() => {
              setIsSignup(p => !p); setPassword(''); setPhone(''); setName(''); setErrors({}); setServerError('');
            }}>
              {isSignup ? ' Sign in' : ' Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

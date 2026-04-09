import { createContext, useState, useContext, useEffect } from 'react';
// FIX: Import setAuthToken so api.js stays in sync whenever login/logout occurs.
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

const API_URL = 'http://localhost:8081/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Demo credentials for quick login (frontend only — hits real backend)
export const DEMO_CREDENTIALS = [
  { role: 'admin',           email: 'admin@edulearn.com',      password: 'admin123',      label: 'Admin',     icon: '🛡️' },
  { role: 'instructor',      email: 'instructor@edulearn.com', password: 'instructor123', label: 'Instructor', icon: '👨‍🏫' },
  { role: 'student',         email: 'student@edulearn.com',    password: 'student123',    label: 'Student',   icon: '🎓' },
  { role: 'content-creator', email: 'creator@edulearn.com',    password: 'creator123',    label: 'Creator',   icon: '✏️' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('lmsToken');
    const savedUser  = localStorage.getItem('lmsUser');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      // FIX: Restore auth token in api.js on page reload so persistent sessions
      // still send the Authorization header on all subsequent API calls.
      setAuthToken(savedToken);
    }
    setLoading(false);
  }, []);

  // ── Login via real backend ──────────────────────────────────────────────────
  const login = async (email, password, role) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };

      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('lmsToken', data.token);
      localStorage.setItem('lmsUser', JSON.stringify(data.user));
      // FIX: Sync the token into api.js so all subsequent API calls include
      // the Authorization header without needing to pass it manually each time.
      setAuthToken(data.token);
      return { success: true, user: data.user };
    } catch {
      // Backend unreachable — fall back to demo mode (no real DB needed for demos)
      return loginDemo(email, password, role);
    }
  };

  // Offline/demo fallback — never stores passwords in localStorage
  const loginDemo = (email, password, role) => {
    const demo = DEMO_CREDENTIALS.find(
      d => d.email === email && d.password === password && d.role === role
    );
    if (!demo) return { success: false, error: 'Invalid email, password, or role.' };
    const demoUser = { id: `demo_${demo.role}`, name: demo.label + ' (Demo)', email: demo.email, role: demo.role };
    setUser(demoUser);
    setToken('demo_token');
    setIsAuthenticated(true);
    localStorage.setItem('lmsUser', JSON.stringify(demoUser));
    localStorage.setItem('lmsToken', 'demo_token');
    // Demo mode uses no real token — clear any previous real token from api.js
    setAuthToken(null);
    return { success: true, user: demoUser };
  };

  // ── Register via real backend ───────────────────────────────────────────────
  const signup = async (name, email, password, phone, role) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Registration failed' };
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to server. Please ensure the backend is running.' };
    }
  };

  // ── Update profile ──────────────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('lmsUser', JSON.stringify(updatedUser));

    if (token && token !== 'demo_token') {
      try {
        await fetch(`${API_URL}/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(updates),
        });
      } catch { /* local update already applied */ }
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('lmsUser');
    localStorage.removeItem('lmsToken');
    // FIX: Clear the token from api.js on logout so no stale Authorization
    // header is sent on subsequent unauthenticated or new-session requests.
    setAuthToken(null);
  };

  // Expose auth header for API calls in other contexts
  const authHeader = () => token && token !== 'demo_token'
    ? { Authorization: `Bearer ${token}` }
    : {};

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, signup, logout, updateProfile, authHeader }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

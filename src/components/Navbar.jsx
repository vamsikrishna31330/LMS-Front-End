import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationsContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, typeIcon } = useNotifications();
  const navigate = useNavigate();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifsRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    if (!user) {
      navigate('/');
      return;
    }

    const roleRoutes = {
      admin: '/admin',
      instructor: '/instructor',
      student: '/student',
      'content-creator': '/content-creator',
    };

    navigate(roleRoutes[user.role] || '/');
  };

  const avatarLetter = user?.name ? user.name[0].toUpperCase() : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo" onClick={handleLogoClick}>
          <span className="logo-icon">📚</span>
          <span className="logo-text">EduLearn</span>
        </div>

        {/* Right controls */}
        {user && (
          <div className="navbar-right">
            {/* Dark mode */}
            <button
              className="nav-icon-btn"
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Notifications */}
            <div className="nav-dropdown-wrap" ref={notifsRef}>
              <button
                className="nav-icon-btn notif-btn"
                onClick={() => { setShowNotifs(p => !p); setShowUserMenu(false); }}
                aria-label="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifs && (
                <div className="nav-dropdown notif-panel">
                  <div className="notif-header">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <button className="mark-all-btn" onClick={markAllAsRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <p className="notif-empty">No notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`notif-item ${n.read ? 'read' : 'unread'}`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <span className="notif-icon">{typeIcon(n.type)}</span>
                          <div className="notif-body">
                            <p className="notif-msg">{n.message}</p>
                            <span className="notif-time">{n.time}</span>
                          </div>
                          <button
                            className="notif-delete"
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            aria-label="Dismiss"
                          >×</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="nav-dropdown-wrap" ref={userMenuRef}>
              <button
                className="nav-avatar-btn"
                onClick={() => { setShowUserMenu(p => !p); setShowNotifs(false); }}
                aria-label="User menu"
              >
                <span className="nav-avatar">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="nav-avatar-img" />
                  ) : (
                    avatarLetter
                  )}
                </span>
                <div className="nav-user-info">
                  <span className="nav-user-name">{user.name}</span>
                  <span className="nav-user-role">{user.role}</span>
                </div>
                <span className="nav-chevron">▾</span>
              </button>

              {showUserMenu && (
                <div className="nav-dropdown user-menu">
                  <button className="user-menu-item" onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                    <span>👤</span> My Profile
                  </button>
                  <hr className="menu-divider" />
                  <button className="user-menu-item danger" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

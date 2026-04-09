import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    profilePhoto: user?.profilePhoto || ''
  });
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const roleColors = { admin: '#ef4444', instructor: '#f59e0b', student: '#6366f1', 'content-creator': '#10b981' };
  const roleIcons = { admin: '🛡️', instructor: '👨‍🏫', student: '🎓', 'content-creator': '✏️' };

  const handleSave = () => {
    if (!form.name.trim()) return;
    setPhotoError('');
    updateProfile(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file.');
      return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setPhotoError('Image must be 2MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, profilePhoto: String(reader.result || '') }));
      setPhotoError('');
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const roleRoute = { admin: '/admin', instructor: '/instructor', student: '/student', 'content-creator': '/content-creator' };

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <div className="profile-page">

          <button className="back-btn" onClick={() => navigate(roleRoute[user?.role] || '/')}>← Back to Dashboard</button>

          {saved && <div className="profile-saved-banner">✅ Profile updated successfully!</div>}

          <div className="profile-hero">
            <div className="profile-avatar-large">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="profile-avatar-img" />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>
            <div className="profile-hero-info">
              <h1>{user?.name}</h1>
              <div className="profile-role-badge" style={{ background: roleColors[user?.role] + '22', color: roleColors[user?.role], border: `1px solid ${roleColors[user?.role]}44` }}>
                {roleIcons[user?.role]} {user?.role}
              </div>
              <p className="profile-email">📧 {user?.email}</p>
              {user?.phone && <p className="profile-phone">📱 {user.phone}</p>}
            </div>
          </div>

          <div className="profile-sections">
            <div className="profile-section">
              <div className="profile-section-header">
                <h2>Personal Information</h2>
                {!editing && <button className="edit-btn" onClick={() => setEditing(true)}>✏️ Edit</button>}
              </div>

              {editing ? (
                <div className="profile-edit-form">
                  <div className="pf-group">
                    <label>Profile Photo</label>
                    <div className="profile-photo-input-wrap">
                      <label htmlFor="profile-photo-input" className="photo-upload-btn">📷 Upload Photo</label>
                      <input
                        id="profile-photo-input"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="profile-photo-input"
                      />
                      {form.profilePhoto && (
                        <button type="button" className="remove-photo-btn" onClick={() => setForm(prev => ({ ...prev, profilePhoto: '' }))}>
                          Remove
                        </button>
                      )}
                    </div>
                    {photoError && <p className="error-text-inline">{photoError}</p>}
                  </div>
                  <div className="pf-group">
                    <label>Full Name</label>
                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                  </div>
                  <div className="pf-group">
                    <label>Bio</label>
                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." rows={3} />
                  </div>
                  <div className="pf-group">
                    <label>Phone Number</label>
                    <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit phone number" />
                  </div>
                  <div className="pf-actions">
                    <button className="save-profile-btn" onClick={handleSave}>💾 Save Changes</button>
                    <button className="cancel-profile-btn" onClick={() => {
                      setEditing(false);
                      setPhotoError('');
                      setForm({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '', profilePhoto: user?.profilePhoto || '' });
                    }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="profile-info-grid">
                  <div className="pinfo-item"><span className="pinfo-label">Name</span><span className="pinfo-value">{user?.name || '—'}</span></div>
                  <div className="pinfo-item"><span className="pinfo-label">Email</span><span className="pinfo-value">{user?.email || '—'}</span></div>
                  <div className="pinfo-item"><span className="pinfo-label">Role</span><span className="pinfo-value">{user?.role || '—'}</span></div>
                  <div className="pinfo-item"><span className="pinfo-label">Phone</span><span className="pinfo-value">{user?.phone || '—'}</span></div>
                  <div className="pinfo-item full"><span className="pinfo-label">Bio</span><span className="pinfo-value">{user?.bio || 'No bio added yet.'}</span></div>
                </div>
              )}
            </div>

            <div className="profile-section danger-zone">
              <h2>Account</h2>
              <p>Sign out of your EduLearn account on this device.</p>
              <button className="logout-profile-btn" onClick={handleLogout}>🚪 Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

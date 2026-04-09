import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { useCourses } from '../context/CoursesContext';
import { userAPI } from '../services/api';
import './AdminDashboard.css';

const safeParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeRole = (role = '') => {
  if (!role) return 'student';
  const key = String(role).toLowerCase();
  if (key === 'contentcreator' || key === 'content_creator') return 'content-creator';
  return key;
};

const normalizeUser = (user) => ({
  id: user.id,
  name: user.name || user.fullName || 'User',
  email: user.email || '',
  role: normalizeRole(user.role),
});

const mergeUsers = (localUsers, remoteUsers) => {
  const byEmail = new Map();

  (Array.isArray(localUsers) ? localUsers : []).forEach((user) => {
    if (!user?.email) return;
    byEmail.set(String(user.email).toLowerCase(), normalizeUser(user));
  });

  (Array.isArray(remoteUsers) ? remoteUsers : []).forEach((user) => {
    if (!user?.email) return;
    byEmail.set(String(user.email).toLowerCase(), normalizeUser(user));
  });

  return [...byEmail.values()];
};

const AdminDashboard = () => {
  const { courses, addCourse, updateCourse, deleteCourse: removeCourse } = useCourses();
  const [activeSection, setActiveSection] = useState('overview');
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student', password: '' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [userDraft, setUserDraft] = useState({ name: '', email: '', role: 'student' });
  const [newCourse, setNewCourse] = useState({ title: '', instructor: '', description: '', duration: '', status: 'active' });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseDraft, setCourseDraft] = useState({ title: '', instructor: '', description: '', duration: '', status: 'active' });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const defaultUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'instructor' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'content-creator' }
    ];

    const hydrateUsers = async () => {
      const localUsers = safeParse(localStorage.getItem('lmsUsers'), defaultUsers);
      if (isMounted) setUsers(Array.isArray(localUsers) ? localUsers : defaultUsers);

      try {
        const remoteUsers = await userAPI.getAll();
        if (!isMounted) return;

        const mergedUsers = mergeUsers(localUsers, remoteUsers);
        setUsers(mergedUsers);
      } catch {
        // Keep local users if backend is unavailable or unauthorized.
      }
    };

    hydrateUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (users.length > 0) localStorage.setItem('lmsUsers', JSON.stringify(users));
  }, [users]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.name && newUser.email) {
      const create = async () => {
        // Store user record without password — passwords are managed by the backend
        const { password: _pw, ...safeUser } = newUser;

        try {
          const created = await userAPI.create({ ...newUser, role: normalizeRole(newUser.role) });
          setUsers(prev => [...prev, normalizeUser(created)]);
        } catch {
          // Local fallback for demo/offline mode
          setUsers(prev => [...prev, { ...safeUser, id: Date.now(), role: normalizeRole(safeUser.role) }]);
        } finally {
          setNewUser({ name: '', email: '', role: 'student', password: '' });
        }
      };

      create();
    }
  };

  const handleDeleteUser = (id) => {
    const remove = async () => {
      try {
        await userAPI.delete(id);
      } catch {
        // Local fallback deletion still applies.
      } finally {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    };

    remove();
    setDeleteConfirm(null);
  };

  const handleDeleteCourse = (id) => {
    removeCourse(id);
    setDeleteConfirm(null);
  };

  const handleStartEditUser = (user) => {
    setEditingUserId(user.id);
    setUserDraft({ name: user.name, email: user.email, role: normalizeRole(user.role) });
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setUserDraft({ name: '', email: '', role: 'student' });
  };

  const handleSaveUser = async (id) => {
    if (!userDraft.name.trim() || !userDraft.email.trim()) return;

    try {
      await userAPI.update(id, {
        name: userDraft.name.trim(),
        email: userDraft.email.trim(),
        role: normalizeRole(userDraft.role),
      });
    } catch {
      // Local fallback update still applies.
    } finally {
      setUsers(prev => prev.map(u => (
        u.id === id
          ? { ...u, name: userDraft.name.trim(), email: userDraft.email.trim(), role: normalizeRole(userDraft.role) }
          : u
      )));
      handleCancelEditUser();
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title.trim()) return;

    try {
      await addCourse({
        title: newCourse.title.trim(),
        instructor: newCourse.instructor.trim() || 'Admin Team',
        description: newCourse.description.trim(),
        duration: newCourse.duration.trim(),
        status: newCourse.status || 'active',
      });
      setNewCourse({ title: '', instructor: '', description: '', duration: '', status: 'active' });
    } catch {
      // Errors handled in addCourse path (backend/local fallback).
    }
  };

  const handleStartEditCourse = (course) => {
    setEditingCourseId(course.id);
    setCourseDraft({
      title: course.title || '',
      instructor: course.instructor || '',
      description: course.description || '',
      duration: course.duration || '',
      status: course.status || 'active',
    });
  };

  const handleCancelEditCourse = () => {
    setEditingCourseId(null);
    setCourseDraft({ title: '', instructor: '', description: '', duration: '', status: 'active' });
  };

  const handleSaveCourse = (courseId) => {
    if (!courseDraft.title.trim()) return;
    updateCourse(courseId, {
      title: courseDraft.title.trim(),
      instructor: courseDraft.instructor.trim() || 'Admin Team',
      description: courseDraft.description.trim(),
      duration: courseDraft.duration.trim(),
      status: courseDraft.status || 'active',
    });
    handleCancelEditCourse();
  };

  const handleToggleCourseStatus = (id) => {
    const course = courses.find(c => c.id === id);
    if (course) updateCourse(id, { status: course.status === 'active' ? 'draft' : 'active' });
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});
  const sectionTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'courses', label: 'Courses' },
    { key: 'settings', label: 'Settings' },
    { key: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="dashboard-container role-admin-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage platform settings, users, roles, and course content</p>
          </div>
          <div className="header-kpi-row">
            <div className="header-kpi-card">
              <span>Total Users</span>
              <strong>{users.length}</strong>
            </div>
            <div className="header-kpi-card">
              <span>Total Courses</span>
              <strong>{courses.length}</strong>
            </div>
            <div className="header-kpi-card">
              <span>Active Courses</span>
              <strong>{courses.filter(c => c.status === 'active').length}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-pill-nav" role="tablist" aria-label="Admin dashboard sections">
          {sectionTabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              className={`pill-btn ${activeSection === tab.key ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="dashboard-cards">
          <Card icon="👥" title="Total Users" description={`${users.length} registered users`} className="info-card" onClick={() => setActiveSection('users')} />
          <Card icon="📚" title="Total Courses" description={`${courses.length} courses available`} className="success-card" onClick={() => setActiveSection('courses')} />
          <Card icon="⚙️" title="Platform Settings" description="Configure system settings" className="warning-card" onClick={() => setActiveSection('settings')} />
          <Card icon="📊" title="Analytics" description="View platform statistics" className="action-card" onClick={() => setActiveSection('analytics')} />
        </div>

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">🗑️</div>
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
              <div className="modal-actions">
                <button className="modal-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="modal-confirm" onClick={() => deleteConfirm.type === 'user' ? handleDeleteUser(deleteConfirm.id) : handleDeleteCourse(deleteConfirm.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'overview' && (
          <div className="section-content">
            <h2>Platform Overview</h2>
            <p className="overview-text">Welcome to the Admin Dashboard. Manage all aspects of EduLearn from here.</p>
            <div className="quick-stats">
              <div className="stat-box"><span className="stat-icon">👥</span><span className="stat-number">{users.length}</span><span className="stat-label">Total Users</span></div>
              <div className="stat-box"><span className="stat-icon">📚</span><span className="stat-number">{courses.length}</span><span className="stat-label">Total Courses</span></div>
              <div className="stat-box"><span className="stat-icon">✅</span><span className="stat-number">{courses.filter(c => c.status === 'active').length}</span><span className="stat-label">Active Courses</span></div>
              <div className="stat-box"><span className="stat-icon">🎓</span><span className="stat-number">{roleCounts['student'] || 0}</span><span className="stat-label">Students</span></div>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="section-content">
            <h2>User Management</h2>
            <div className="add-user-form">
              <h3>Add New User</h3>
              <form onSubmit={handleAddUser} className="admin-add-user-row">
                <input type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required className="form-input" />
                <input type="email" placeholder="Email address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required className="form-input" />
                <input type="password" placeholder="Temporary password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required className="form-input" minLength={6} />
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="form-input">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="content-creator">Content Creator</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" className="add-btn">Add User</button>
              </form>
            </div>

            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search users by name, email, or role..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div className="users-table">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        {editingUserId === u.id ? (
                          <input
                            type="text"
                            className="form-input"
                            value={userDraft.name}
                            onChange={e => setUserDraft(prev => ({ ...prev, name: e.target.value }))}
                          />
                        ) : (
                          <div className="user-cell"><span className="user-avatar-sm">{u.name[0]}</span>{u.name}</div>
                        )}
                      </td>
                      <td>
                        {editingUserId === u.id ? (
                          <input
                            type="email"
                            className="form-input"
                            value={userDraft.email}
                            onChange={e => setUserDraft(prev => ({ ...prev, email: e.target.value }))}
                          />
                        ) : u.email}
                      </td>
                      <td>
                        {editingUserId === u.id ? (
                          <select
                            className="form-input"
                            value={userDraft.role}
                            onChange={e => setUserDraft(prev => ({ ...prev, role: e.target.value }))}
                          >
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                            <option value="content-creator">Content Creator</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`role-badge role-${u.role}`}>{u.role}</span>
                        )}
                      </td>
                      <td>
                        {editingUserId === u.id ? (
                          <div className="admin-inline-actions">
                            <button className="save-btn" onClick={() => handleSaveUser(u.id)}>Save</button>
                            <button className="modal-cancel" onClick={handleCancelEditUser}>Cancel</button>
                          </div>
                        ) : (
                          <div className="admin-inline-actions">
                            <button className="toggle-btn" onClick={() => handleStartEditUser(u)}>Edit</button>
                            <button className="delete-btn" onClick={() => setDeleteConfirm({ id: u.id, name: u.name, type: 'user' })}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <p className="empty-state">No users match your search.</p>}
            </div>
          </div>
        )}

        {activeSection === 'courses' && (
          <div className="section-content">
            <h2>Course Management</h2>
            <div className="add-user-form admin-course-form">
              <h3>Create Course</h3>
              <form onSubmit={handleAddCourse} className="admin-course-row">
                <input
                  type="text"
                  placeholder="Course title"
                  className="form-input"
                  value={newCourse.title}
                  onChange={e => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  placeholder="Instructor"
                  className="form-input"
                  value={newCourse.instructor}
                  onChange={e => setNewCourse(prev => ({ ...prev, instructor: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 8 weeks)"
                  className="form-input"
                  value={newCourse.duration}
                  onChange={e => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                />
                <select
                  className="form-input"
                  value={newCourse.status}
                  onChange={e => setNewCourse(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  className="form-input"
                  value={newCourse.description}
                  onChange={e => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                />
                <button type="submit" className="add-btn">Create Course</button>
              </form>
            </div>

            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                  {editingCourseId === course.id ? (
                    <div className="admin-course-edit-grid">
                      <input
                        type="text"
                        className="form-input"
                        value={courseDraft.title}
                        onChange={e => setCourseDraft(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Course title"
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={courseDraft.instructor}
                        onChange={e => setCourseDraft(prev => ({ ...prev, instructor: e.target.value }))}
                        placeholder="Instructor"
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={courseDraft.duration}
                        onChange={e => setCourseDraft(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="Duration"
                      />
                      <select
                        className="form-input"
                        value={courseDraft.status}
                        onChange={e => setCourseDraft(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                      </select>
                      <textarea
                        className="form-input"
                        value={courseDraft.description}
                        onChange={e => setCourseDraft(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        rows={3}
                      />
                      <div className="admin-inline-actions">
                        <button className="save-btn" onClick={() => handleSaveCourse(course.id)}>Save</button>
                        <button className="modal-cancel" onClick={handleCancelEditCourse}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="course-header">
                        <h3>{course.title}</h3>
                        <span className={`status-badge ${course.status}`}>{course.status}</span>
                      </div>
                      <p className="course-instructor">👨‍🏫 {course.instructor}</p>
                      <p className="course-students">👥 {course.students || 0} students</p>
                      {course.description && <p className="course-description-inline">{course.description}</p>}
                      <div className="course-actions">
                        <button className="toggle-btn" onClick={() => handleStartEditCourse(course)}>Edit</button>
                        <button className="toggle-btn" onClick={() => handleToggleCourseStatus(course.id)}>
                          {course.status === 'active' ? 'Set Draft' : 'Activate'}
                        </button>
                        <button className="delete-btn" onClick={() => setDeleteConfirm({ id: course.id, name: course.title, type: 'course' })}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="section-content">
            <h2>Platform Settings</h2>
            <div className="settings-form">
              <div className="setting-item"><label>Platform Name</label><input type="text" defaultValue="EduLearn LMS" className="form-input" /></div>
              <div className="setting-item"><label>Max Students per Course</label><input type="number" defaultValue="100" className="form-input" /></div>
              <div className="setting-item setting-checkbox"><label>Enable Course Reviews</label><input type="checkbox" defaultChecked /></div>
              <div className="setting-item setting-checkbox"><label>Auto-Approve Courses</label><input type="checkbox" /></div>
              <button className="save-btn" onClick={() => alert('Settings saved!')}>Save Settings</button>
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="section-content">
            <h2>Platform Analytics</h2>
            <div className="analytics-grid">
              {[
                { title: 'Total Revenue', value: '₹24,500', change: '+12% from last month', positive: true },
                { title: 'Active Students', value: '1,234', change: '+8% from last month', positive: true },
                { title: 'Completion Rate', value: '78%', change: '+5% from last month', positive: true },
                { title: 'Avg. Rating', value: '4.6 ⭐', change: '+0.3 from last month', positive: true },
              ].map(item => (
                <div key={item.title} className="analytics-card">
                  <h3>{item.title}</h3>
                  <p className="analytics-value">{item.value}</p>
                  <span className={`analytics-change ${item.positive ? 'positive' : 'negative'}`}>{item.change}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { useCourses } from '../context/CoursesContext';
import './ContentCreatorDashboard.css';

const ContentCreatorDashboard = () => {
  const { courses } = useCourses();
  const [activeSection, setActiveSection] = useState('overview');
  const [materials, setMaterials] = useState([]);

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'video',
    course: '',
    description: ''
  });

  // Load materials from localStorage on mount
  useEffect(() => {
    const savedMaterials = localStorage.getItem('lmsMaterials');
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    } else {
      // Default materials
      setMaterials([
        { id: 1, title: 'Introduction to React Hooks', type: 'video', course: 'React Fundamentals', status: 'published' },
        { id: 2, title: 'JavaScript ES6 Features Guide', type: 'document', course: 'Advanced JavaScript', status: 'draft' },
        { id: 3, title: 'Component Lifecycle Quiz', type: 'quiz', course: 'React Fundamentals', status: 'published' }
      ]);
    }
  }, []);

  // Save materials to localStorage whenever they change
  useEffect(() => {
    if (materials.length > 0) {
      localStorage.setItem('lmsMaterials', JSON.stringify(materials));
    }
  }, [materials]);

  const handleCreateMaterial = (e) => {
    e.preventDefault();
    if (newMaterial.title && newMaterial.course) {
      setMaterials([...materials, {
        ...newMaterial,
        id: Date.now(),
        status: 'draft'
      }]);
      setNewMaterial({ title: '', type: 'video', course: '', description: '' });
    }
  };

  const handleToggleStatus = (id) => {
    setMaterials(materials.map(m =>
      m.id === id ? { ...m, status: m.status === 'published' ? 'draft' : 'published' } : m
    ));
  };

  const handleDelete = (id) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const sectionTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'materials', label: 'My Materials' },
    { key: 'create', label: 'Create' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'library', label: 'Library' },
  ];

  return (
    <div className="dashboard-container role-creator-dashboard">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Content Creator Dashboard</h1>
          <p>Develop course materials, update content, and ensure educational quality</p>
          <div className="header-kpi-row">
            <div className="header-kpi-card">
              <span>Total Materials</span>
              <strong>{materials.length}</strong>
            </div>
            <div className="header-kpi-card">
              <span>Published</span>
              <strong>{materials.filter(m => m.status === 'published').length}</strong>
            </div>
            <div className="header-kpi-card">
              <span>Drafts</span>
              <strong>{materials.filter(m => m.status === 'draft').length}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-pill-nav" role="tablist" aria-label="Content creator dashboard sections">
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
          <Card
            icon="📝"
            title="My Materials"
            description={`${materials.length} total items`}
            className="info-card"
            onClick={() => setActiveSection('materials')}
          />
          <Card
            icon="➕"
            title="Create Content"
            description="Add new material"
            className="action-card"
            onClick={() => setActiveSection('create')}
          />
          <Card
            icon="📊"
            title="Analytics"
            description="View engagement stats"
            className="success-card"
            onClick={() => setActiveSection('analytics')}
          />
          <Card
            icon="📚"
            title="Content Library"
            description="Browse all content"
            className="warning-card"
            onClick={() => setActiveSection('library')}
          />
        </div>

        {activeSection === 'materials' && (
          <div className="section-content">
            <h2>My Course Materials</h2>
            <div className="materials-list">
              {materials.map(material => (
                <div key={material.id} className="material-card">
                  <div className="material-icon">
                    {material.type === 'video' && '🎥'}
                    {material.type === 'document' && '📄'}
                    {material.type === 'quiz' && '📝'}
                  </div>
                  <div className="material-info">
                    <h3>{material.title}</h3>
                    <p className="material-meta">
                      <span className="material-type">{material.type}</span>
                      <span className="material-course">{material.course}</span>
                    </p>
                    <span className={`status-badge ${material.status}`}>
                      {material.status}
                    </span>
                  </div>
                  <div className="material-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleToggleStatus(material.id)}
                    >
                      {material.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(material.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'create' && (
          <div className="section-content">
            <h2>Create New Material</h2>
            <form className="create-form" onSubmit={handleCreateMaterial}>
              <div className="form-group">
                <label>Material Title</label>
                <input
                  type="text"
                  placeholder="Enter material title"
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Content Type</label>
                <select
                  value={newMaterial.type}
                  onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value})}
                >
                  <option value="video">Video Lecture</option>
                  <option value="document">Document/PDF</option>
                  <option value="quiz">Quiz/Assessment</option>
                  <option value="presentation">Presentation</option>
                  <option value="code">Code Example</option>
                </select>
              </div>

              <div className="form-group">
                <label>Course Name</label>
                <select
                  value={newMaterial.course}
                  onChange={(e) => setNewMaterial({...newMaterial, course: e.target.value})}
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Enter material description"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                  rows="5"
                />
              </div>

              <div className="form-group">
                <label>Upload File</label>
                <div className="file-upload">
                  <button type="button" className="upload-btn">
                    📁 Choose File
                  </button>
                  <span className="file-info">No file selected</span>
                </div>
              </div>

              <button type="submit" className="submit-btn">Create Material</button>
            </form>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="section-content">
            <h2>Content Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Total Views</h3>
                <p className="analytics-value">12,458</p>
                <span className="analytics-change positive">+15% this month</span>
              </div>
              <div className="analytics-card">
                <h3>Engagement Rate</h3>
                <p className="analytics-value">86%</p>
                <span className="analytics-change positive">+8% this month</span>
              </div>
              <div className="analytics-card">
                <h3>Completion Rate</h3>
                <p className="analytics-value">72%</p>
                <span className="analytics-change positive">+5% this month</span>
              </div>
              <div className="analytics-card">
                <h3>Avg. Rating</h3>
                <p className="analytics-value">4.7 ⭐</p>
                <span className="analytics-change positive">+0.2 this month</span>
              </div>
            </div>

            <div className="popular-content">
              <h3>Most Popular Content</h3>
              <div className="content-rankings">
                <div className="ranking-item">
                  <span className="rank">1</span>
                  <span className="content-title">Introduction to React Hooks</span>
                  <span className="views">2,345 views</span>
                </div>
                <div className="ranking-item">
                  <span className="rank">2</span>
                  <span className="content-title">Component Lifecycle Quiz</span>
                  <span className="views">1,892 views</span>
                </div>
                <div className="ranking-item">
                  <span className="rank">3</span>
                  <span className="content-title">JavaScript ES6 Features Guide</span>
                  <span className="views">1,567 views</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'library' && (
          <div className="section-content">
            <h2>Content Library</h2>
            <div className="library-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Videos</button>
              <button className="filter-btn">Documents</button>
              <button className="filter-btn">Quizzes</button>
            </div>

            <div className="library-grid">
              {materials.map(material => (
                <div key={material.id} className="library-card">
                  <div className="library-card-header">
                    <span className="library-icon">
                      {material.type === 'video' && '🎥'}
                      {material.type === 'document' && '📄'}
                      {material.type === 'quiz' && '📝'}
                    </span>
                    <span className={`status-indicator ${material.status}`}></span>
                  </div>
                  <h4>{material.title}</h4>
                  <p className="library-course">{material.course}</p>
                  <div className="library-stats">
                    <span>👁️ 1.2k views</span>
                    <span>⭐ 4.5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'overview' && (
          <div className="section-content">
            <h2>Content Creator Overview</h2>
            <p className="overview-text">
              Welcome to your content creation hub! Develop high-quality course materials,
              track engagement, and ensure educational excellence.
            </p>

            <div className="overview-stats">
              <div className="stat-box">
                <span className="stat-icon">📝</span>
                <div className="stat-details">
                  <span className="stat-number">{materials.length}</span>
                  <span className="stat-label">Total Materials</span>
                </div>
              </div>
              <div className="stat-box">
                <span className="stat-icon">✅</span>
                <div className="stat-details">
                  <span className="stat-number">
                    {materials.filter(m => m.status === 'published').length}
                  </span>
                  <span className="stat-label">Published</span>
                </div>
              </div>
              <div className="stat-box">
                <span className="stat-icon">⏳</span>
                <div className="stat-details">
                  <span className="stat-number">
                    {materials.filter(m => m.status === 'draft').length}
                  </span>
                  <span className="stat-label">Drafts</span>
                </div>
              </div>
            </div>

            <div className="quick-tips">
              <h3>💡 Content Creation Tips</h3>
              <ul>
                <li>Keep video lectures under 15 minutes for better engagement</li>
                <li>Include interactive quizzes after each major topic</li>
                <li>Use clear, concise language in all materials</li>
                <li>Add real-world examples to illustrate concepts</li>
                <li>Regularly update content based on student feedback</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCreatorDashboard;

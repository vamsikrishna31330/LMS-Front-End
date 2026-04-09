import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { useCourses } from '../context/CoursesContext';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../context/AssignmentsContext';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEnrolledCourses, getAvailableCourses, enrollInCourse, updateProgress, courses: allCourses } = useCourses();
  const { getStudentAssignments, submitAssignment, assignments: allAssignments, submissions } = useAssignments();
  const [activeSection, setActiveSection] = useState('overview');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');

  useEffect(() => {
    setEnrolledCourses(getEnrolledCourses(user.id));
    setAvailableCourses(getAvailableCourses(user.id));
  }, [user.id, allCourses]);

  useEffect(() => {
    const enrolledIds = enrolledCourses.map(c => c.id);
    setAssignments(getStudentAssignments(user.id, enrolledIds));
  }, [user.id, allAssignments, enrolledCourses]);

  const handleEnroll = (courseId, courseTitle) => {
    enrollInCourse(user.id, courseId);
    setEnrollSuccess(`Successfully enrolled in "${courseTitle}"!`);
    setTimeout(() => setEnrollSuccess(''), 3000);
  };

  const handleContinueLearning = (courseId) => navigate(`/course/${courseId}`);

  const handleFileSelect = (e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); };

  const handleSubmitAssignment = (assignmentId) => {
    if (selectedFile) {
      submitAssignment(assignmentId, user.id, user.name, selectedFile);
      setSelectedAssignment(null);
      setSelectedFile(null);
    }
  };

  const filteredCourses = availableCourses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.instructor || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overallProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((s, c) => s + (c.progress || 0), 0) / enrolledCourses.length)
    : 0;

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const sectionTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'courses', label: 'My Courses' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'progress', label: 'Progress' },
    { key: 'browse', label: 'Browse' },
  ];

  return (
    <div className="dashboard-container role-student-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
            <p>Track your progress, submit assignments, and discover new courses</p>
          </div>
          <div className="header-kpi-row">
            <div className="header-kpi-card">
              <span>Enrolled</span>
              <strong>{enrolledCourses.length}</strong>
            </div>
            <div className="header-kpi-card">
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </div>
            <div className="header-kpi-card">
              <span>Avg Progress</span>
              <strong>{overallProgress}%</strong>
            </div>
          </div>
        </div>

        {enrollSuccess && <div className="enroll-success-banner">🎉 {enrollSuccess}</div>}

        <div className="dashboard-pill-nav" role="tablist" aria-label="Student dashboard sections">
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
          <Card icon="📚" title="My Courses" description={`${enrolledCourses.length} enrolled`} className="info-card" onClick={() => setActiveSection('courses')} />
          <Card icon="📝" title="Assignments" description={`${pendingCount} pending`} className="warning-card" onClick={() => setActiveSection('assignments')} />
          <Card icon="📊" title="Progress" description={`${overallProgress}% avg`} className="success-card" onClick={() => setActiveSection('progress')} />
          <Card icon="🔍" title="Browse" description={`${availableCourses.length} available`} className="action-card" onClick={() => setActiveSection('browse')} />
        </div>

        {activeSection === 'overview' && (
          <div className="section-content">
            <h2>Dashboard Overview</h2>
            <p className="overview-text">
              You have <strong>{pendingCount}</strong> pending assignment{pendingCount !== 1 ? 's' : ''} and are enrolled in <strong>{enrolledCourses.length}</strong> course{enrolledCourses.length !== 1 ? 's' : ''}.
            </p>
            <div className="quick-actions">
              <div className="action-card-large" onClick={() => setActiveSection('courses')}>
                <span className="action-icon">📚</span>
                <h3>Continue Learning</h3>
                <p>Resume your enrolled courses</p>
              </div>
              <div className="action-card-large" onClick={() => setActiveSection('browse')}>
                <span className="action-icon">🔍</span>
                <h3>Explore Courses</h3>
                <p>Discover new learning opportunities</p>
              </div>
              <div className="action-card-large" onClick={() => setActiveSection('assignments')}>
                <span className="action-icon">📝</span>
                <h3>My Assignments</h3>
                <p>{pendingCount} pending submission{pendingCount !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {enrolledCourses.length > 0 && (
              <div className="recent-progress">
                <h3>Course Progress</h3>
                {enrolledCourses.slice(0, 3).map(course => (
                  <div key={course.id} className="course-progress-item">
                    <div className="course-progress-header">
                      <span className="course-title">{course.title}</span>
                      <span className="course-percentage">{course.progress || 0}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${course.progress || 0}%` }}></div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'courses' && (
          <div className="section-content">
            <h2>My Enrolled Courses</h2>
            {enrolledCourses.length === 0 ? (
              <div className="empty-state-card">
                <span>📚</span>
                <h3>No courses yet</h3>
                <p>Browse available courses and enroll to get started!</p>
                <button className="submit-btn" onClick={() => setActiveSection('browse')}>Browse Courses</button>
              </div>
            ) : (
              <div className="courses-grid">
                {enrolledCourses.map(course => (
                  <div key={course.id} className="course-card">
                    <div className="course-card-top">
                      <h3>{course.title}</h3>
                      <span className="course-tag">Enrolled</span>
                    </div>
                    <p className="course-instructor">👨‍🏫 {course.instructor}</p>
                    <div className="progress-section">
                      <div className="progress-header-row">
                        <span>Progress</span>
                        <span className="progress-pct">{course.progress || 0}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${course.progress || 0}%` }}></div></div>
                    </div>
                    <div className="next-lesson">
                      <span className="next-lesson-label">Next:</span>
                      <span className="next-lesson-title">{course.nextLesson || 'Introduction'}</span>
                    </div>
                    <button className="continue-btn" onClick={() => handleContinueLearning(course.id)}>Continue Learning →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'assignments' && (
          <div className="section-content">
            <h2>My Assignments</h2>
            {assignments.length === 0 ? (
              <div className="empty-state-card"><span>📝</span><h3>No assignments yet</h3><p>Assignments from your enrolled courses will appear here.</p></div>
            ) : (
              <div className="assignments-list">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="assignment-card">
                    <div className="assignment-header">
                      <div>
                        <h3>{assignment.title}</h3>
                        <p className="assignment-course">📚 {assignment.course}</p>
                        <p className="assignment-due">📅 Due: {assignment.dueDate}</p>
                        {assignment.submittedFile && <p className="assignment-file">📎 {assignment.submittedFile}</p>}
                        {assignment.submittedDate && <p className="assignment-submitted-date">Submitted: {assignment.submittedDate}</p>}
                      </div>
                      <div className="assignment-status">
                        {assignment.status === 'pending' && <span className="status-badge pending">Pending</span>}
                        {assignment.status === 'submitted' && !assignment.grade && <span className="status-badge submitted">Under Review</span>}
                        {assignment.grade && (
                          <div className="grade-display">
                            <span className="status-badge graded">Graded</span>
                            <span className="grade-badge">Grade: {assignment.grade}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {assignment.status === 'pending' && selectedAssignment !== assignment.id && (
                      <button className="submit-btn" onClick={() => { setSelectedAssignment(assignment.id); setSelectedFile(null); }}>Submit Assignment</button>
                    )}

                    {selectedAssignment === assignment.id && (
                      <div className="submission-form">
                        <div className="file-upload-section">
                          <label htmlFor={`file-${assignment.id}`} className="file-upload-label">
                            <span>📁</span>
                            <span>{selectedFile ? selectedFile.name : 'Click to choose file'}</span>
                          </label>
                          <input id={`file-${assignment.id}`} type="file" className="file-input" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.zip,.txt,.jpg,.png" />
                        </div>
                        <div className="submission-actions">
                          <button className="submit-file-btn" onClick={() => handleSubmitAssignment(assignment.id)} disabled={!selectedFile}>Submit File</button>
                          <button className="cancel-submission-btn" onClick={() => { setSelectedAssignment(null); setSelectedFile(null); }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'progress' && (
          <div className="section-content">
            <h2>Learning Progress</h2>
            <div className="progress-overview">
              <div className="overall-progress-card">
                <div className="circular-progress-wrap">
                  <div className="circular-progress">
                    <span className="progress-value">{overallProgress}%</span>
                  </div>
                </div>
                <div>
                  <h3>Overall Completion</h3>
                  <p>Across {enrolledCourses.length} enrolled course{enrolledCourses.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {enrolledCourses.length > 0 && (
                <div className="courses-progress-list">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="course-progress-item">
                      <div className="course-progress-header">
                        <span className="course-title">{course.title}</span>
                        <span className="course-percentage">{course.progress || 0}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${course.progress || 0}%` }}></div></div>
                    </div>
                  ))}
                </div>
              )}

              <div className="achievements">
                <h3>🏆 Achievements</h3>
                <div className="achievements-grid">
                  <div className={`achievement-badge ${enrolledCourses.length > 0 ? '' : 'locked'}`}>
                    <span>🎓</span><span>First Enrollment</span>
                  </div>
                  <div className={`achievement-badge ${assignments.filter(a => a.status !== 'pending').length > 0 ? '' : 'locked'}`}>
                    <span>📤</span><span>First Submission</span>
                  </div>
                  <div className={`achievement-badge ${enrolledCourses.length >= 3 ? '' : 'locked'}`}>
                    <span>⭐</span><span>3 Courses</span>
                  </div>
                  <div className="achievement-badge locked"><span>🏆</span><span>Complete 5 Courses</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'browse' && (
          <div className="section-content">
            <h2>Browse Courses</h2>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search by course title or instructor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {filteredCourses.length === 0 ? (
              <div className="empty-state-card">
                <span>🎉</span>
                <h3>{searchQuery ? 'No results found' : "You're all caught up!"}</h3>
                <p>{searchQuery ? 'Try a different search term.' : "You're enrolled in all available courses!"}</p>
              </div>
            ) : (
              <div className="browse-grid">
                {filteredCourses.map(course => (
                  <div key={course.id} className="browse-card">
                    <div className="browse-card-thumb">📚</div>
                    <div className="browse-card-body">
                      <h3>{course.title}</h3>
                      <p className="course-instructor">👨‍🏫 {course.instructor}</p>
                      {course.description && <p className="course-description">{course.description}</p>}
                      <div className="course-meta">
                        <span>⏱️ {course.duration || '8 weeks'}</span>
                        <span>👥 {course.students || 0} students</span>
                      </div>
                      <button className="enroll-btn" onClick={() => handleEnroll(course.id, course.title)}>Enroll Now →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

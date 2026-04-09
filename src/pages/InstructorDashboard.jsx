import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { useCourses } from '../context/CoursesContext';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../context/AssignmentsContext';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { courses: allCourses, addCourse, getInstructorCourses, enrollments, resetCourses } = useCourses();
  const { getSubmittedAssignments, gradeAssignment, createAssignment, assignments: allAssignments, submissions } = useAssignments();
  const [activeSection, setActiveSection] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', duration: '' });
  const [newModules, setNewModules] = useState([{ title: '', lessons: [{ title: '', content: '', video_url: '', duration: '' }] }]);
  const [newAssignment, setNewAssignment] = useState({ title: '', courseId: '', dueDate: '' });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const instructorCourses = getInstructorCourses(user);
    setCourses(instructorCourses);
  }, [allCourses, user]);

  useEffect(() => {
    if (courses.length > 0) setSubmittedAssignments(getSubmittedAssignments(courses));
  }, [courses, allAssignments, submissions]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (newCourse.title) {
      // Filter out empty modules and lessons
      const validModules = newModules
        .filter(m => m.title.trim())
        .map((m, idx) => ({
          ...m,
          id: Date.now() + idx,
          order_index: idx,
          lessons: m.lessons
            .filter(l => l.title.trim())
            .map((l, lIdx) => ({
              ...l,
              id: Date.now() + idx * 100 + lIdx,
              duration: parseInt(l.duration) || 0,
            }))
        }));

      try {
        await addCourse({
          ...newCourse,
          instructor: user.name,
          instructorId: user.id,
          createdBy: 'instructor',
          status: 'active',
          modules: validModules
        });
        setNewCourse({ title: '', description: '', duration: '' });
        setNewModules([{ title: '', lessons: [{ title: '', content: '', video_url: '', duration: '' }] }]);
        showToast('✅ Course created successfully!');
        setActiveSection('courses');
      } catch (err) {
        showToast(`❌ Failed to save course to database: ${err.message || 'Server error'}`);
      }
    }
  };

  const addModuleField = () => {
    setNewModules([...newModules, { title: '', lessons: [{ title: '', content: '', video_url: '', duration: '' }] }]);
  };

  const removeModuleField = (idx) => {
    setNewModules(newModules.filter((_, i) => i !== idx));
  };

  const updateModule = (idx, field, value) => {
    const updated = [...newModules];
    updated[idx] = { ...updated[idx], [field]: value };
    setNewModules(updated);
  };

  const addLessonField = (moduleIdx) => {
    const updated = [...newModules];
    updated[moduleIdx].lessons.push({ title: '', content: '', video_url: '', duration: '' });
    setNewModules(updated);
  };

  const removeLessonField = (moduleIdx, lessonIdx) => {
    const updated = [...newModules];
    updated[moduleIdx].lessons = updated[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
    setNewModules(updated);
  };

  const updateLesson = (moduleIdx, lessonIdx, field, value) => {
    const updated = [...newModules];
    updated[moduleIdx].lessons[lessonIdx] = { ...updated[moduleIdx].lessons[lessonIdx], [field]: value };
    setNewModules(updated);
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (newAssignment.title && newAssignment.courseId && newAssignment.dueDate) {
      const selectedCourse = courses.find(c => c.id === parseInt(newAssignment.courseId));
      createAssignment({ title: newAssignment.title, course: selectedCourse.title, courseId: selectedCourse.id, dueDate: newAssignment.dueDate });
      setNewAssignment({ title: '', courseId: '', dueDate: '' });
      showToast('✅ Assignment created successfully!');
      setActiveSection('courses');
    }
  };

  const handleGrade = (submissionId) => {
    if (grade.trim()) {
      gradeAssignment(submissionId, grade.trim());
      setSelectedSubmission(null);
      setGrade('');
      showToast('✅ Grade submitted successfully!');
    }
  };

  // Build real student list from enrollments
  const myStudents = courses.flatMap(course => {
    const courseEnrollments = (enrollments || []).filter(e => e.courseId === course.id);
    return courseEnrollments.map(e => ({
      userId: e.userId,
      course: course.title,
      progress: e.progress || 0,
    }));
  });

  const pendingGrades = submittedAssignments.filter(s => !s.grade).length;
  const sectionTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'courses', label: 'Courses' },
    { key: 'grading', label: 'Grading' },
    { key: 'students', label: 'Students' },
    { key: 'create', label: 'Create Course' },
    { key: 'createAssignment', label: 'Create Assignment' },
  ];

  return (
    <div className="dashboard-container role-instructor-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Instructor Dashboard</h1>
          <p>Create courses, grade assignments, and interact with students</p>
          <div className="header-kpi-row">
            <div className="header-kpi-card">
              <span>Courses</span>
              <strong>{courses.length}</strong>
            </div>
            <div className="header-kpi-card">
              <span>Learners</span>
              <strong>{myStudents.length}</strong>
            </div>
            <div className="header-kpi-card">
              <span>Pending Grades</span>
              <strong>{pendingGrades}</strong>
            </div>
          </div>
        </div>

        {toast && <div className="toast-banner">{toast}</div>}

        <div className="dashboard-pill-nav" role="tablist" aria-label="Instructor dashboard sections">
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
          <Card icon="📚" title="My Courses" description={`${courses.length} courses`} className="info-card" onClick={() => setActiveSection('courses')} />
          <Card icon="✏️" title="Grade Assignments" description={`${pendingGrades} pending`} className="warning-card" onClick={() => setActiveSection('grading')} />
          <Card icon="📝" title="Create Assignment" description="Add new assignment" className="success-card" onClick={() => setActiveSection('createAssignment')} />
          <Card icon="➕" title="Create Course" description="Start a new course" className="action-card" onClick={() => setActiveSection('create')} />
        </div>

        <button className="reset-courses-btn" onClick={() => { resetCourses(); showToast('✅ Courses reset to defaults!'); }}>
          🔄 Reset to Default Courses (with videos)
        </button>

        {activeSection === 'overview' && (
          <div className="section-content">
            <h2>Welcome back, {user?.name?.split(' ')[0] || 'Instructor'}! 👋</h2>
            <p className="overview-text">Manage your courses, grade assignments, and engage with students.</p>
            <div className="overview-stats">
              <div className="stat-card">
                <span className="stat-icon">📚</span>
                <div className="stat-info"><span className="stat-number">{courses.length}</span><span className="stat-label">Active Courses</span></div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <div className="stat-info"><span className="stat-number">{courses.reduce((s, c) => s + (c.students || 0), 0)}</span><span className="stat-label">Total Students</span></div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⏳</span>
                <div className="stat-info"><span className="stat-number">{pendingGrades}</span><span className="stat-label">Pending Grades</span></div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'courses' && (
          <div className="section-content">
            <h2>My Courses</h2>
            {courses.length === 0 ? (
              <div className="no-courses-message">
                <p>📚 You haven't created any courses yet.</p>
                <button className="btn-primary btn-offset" onClick={() => setActiveSection('create')}>Create Your First Course</button>
              </div>
            ) : (
              <div className="courses-grid">
                {courses.map(course => (
                  <div key={course.id} className="course-card">
                    <h3>{course.title}</h3>
                    <div className="course-stats">
                      <div className="stat"><span className="stat-icon">👥</span><span>{course.students || 0} Students</span></div>
                      <div className="stat"><span className="stat-icon">📝</span><span>{course.assignments || 0} Assignments</span></div>
                      <div className="stat"><span className="stat-icon">⏳</span><span>{course.pending || 0} Pending</span></div>
                    </div>
                    <div className="course-actions">
                      <button className="btn-primary" onClick={() => setActiveSection('createAssignment')}>Add Assignment</button>
                      <button className="btn-secondary" onClick={() => setActiveSection('students')}>View Students</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'grading' && (
          <div className="section-content">
            <h2>Grade Assignments</h2>
            {submittedAssignments.length === 0 ? (
              <div className="no-assignments-message"><p>📝 No assignments submitted yet.</p></div>
            ) : (
              <div className="assignments-list">
                {submittedAssignments.map(sub => (
                  <div key={sub.id} className="assignment-card">
                    <div className="assignment-header">
                      <div>
                        <h3>{sub.title}</h3>
                        <p className="assignment-meta">👤 {sub.studentName} &nbsp;|&nbsp; 📚 {sub.course}</p>
                        <p className="assignment-date">📅 Submitted: {sub.submittedDate}</p>
                        {sub.submittedFile && <p className="assignment-file">📎 {sub.submittedFile}</p>}
                        {!sub.grade && <p className="assignment-status-text">⏳ Awaiting Grade</p>}
                      </div>
                      <div className="assignment-status">
                        {sub.grade ? (
                          <div className="grade-display">
                            <span className="status-badge graded">Graded</span>
                            <span className="grade-badge">Grade: {sub.grade}</span>
                          </div>
                        ) : (
                          selectedSubmission !== sub.id && (
                            <button className="grade-btn" onClick={() => setSelectedSubmission(sub.id)}>Give Grade</button>
                          )
                        )}
                      </div>
                    </div>
                    {selectedSubmission === sub.id && (
                      <div className="grading-form">
                        <input type="text" placeholder="e.g. A, B+, 85/100" value={grade} onChange={e => setGrade(e.target.value)} />
                        <button className="submit-grade-btn" onClick={() => handleGrade(sub.id)}>Submit Grade</button>
                        <button className="cancel-btn" onClick={() => { setSelectedSubmission(null); setGrade(''); }}>Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'students' && (
          <div className="section-content">
            <h2>My Students</h2>
            {myStudents.length === 0 ? (
              <div className="no-courses-message"><p>👥 No students have enrolled in your courses yet.</p></div>
            ) : (
              <div className="students-grid">
                {myStudents.map((s, i) => (
                  <div key={i} className="student-card">
                    <div className="student-avatar">👨‍🎓</div>
                    <h3>Student #{s.userId}</h3>
                    <p>{s.course}</p>
                    <p className="student-progress">Progress: {s.progress}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'create' && (
          <div className="section-content">
            <h2>Create New Course</h2>
            <form className="create-course-form" onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label>Course Title *</label>
                <input type="text" placeholder="e.g. React for Beginners" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="What will students learn?" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} rows={4} />
              </div>
              <div className="form-group">
                <label>Duration (e.g. 8 weeks)</label>
                <input type="text" placeholder="e.g. 6 weeks" value={newCourse.duration} onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })} />
              </div>

              <div className="modules-section">
                <h3>Course Modules</h3>
                {newModules.map((module, moduleIdx) => (
                  <div key={moduleIdx} className="module-form-card">
                    <div className="module-form-header">
                      <h4>Module {moduleIdx + 1}</h4>
                      {newModules.length > 1 && (
                        <button type="button" className="btn-icon" onClick={() => removeModuleField(moduleIdx)}>❌</button>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Module Title *</label>
                      <input type="text" placeholder="e.g. Getting Started" value={module.title} onChange={e => updateModule(moduleIdx, 'title', e.target.value)} required />
                    </div>

                    <div className="lessons-section">
                      <h5>Lessons</h5>
                      {module.lessons.map((lesson, lessonIdx) => (
                        <div key={lessonIdx} className="lesson-form-card">
                          <div className="lesson-form-header">
                            <span>Lesson {lessonIdx + 1}</span>
                            {module.lessons.length > 1 && (
                              <button type="button" className="btn-icon" onClick={() => removeLessonField(moduleIdx, lessonIdx)}>❌</button>
                            )}
                          </div>
                          <div className="form-row">
                            <input type="text" placeholder="Lesson title" value={lesson.title} onChange={e => updateLesson(moduleIdx, lessonIdx, 'title', e.target.value)} />
                            <input type="text" placeholder="Duration (seconds)" value={lesson.duration} onChange={e => updateLesson(moduleIdx, lessonIdx, 'duration', e.target.value)} />
                          </div>
                          <input type="text" placeholder="Video URL (YouTube embed, MP4, etc.)" value={lesson.video_url} onChange={e => updateLesson(moduleIdx, lessonIdx, 'video_url', e.target.value)} />
                          <textarea placeholder="Lesson content/description" value={lesson.content} onChange={e => updateLesson(moduleIdx, lessonIdx, 'content', e.target.value)} rows={2} />
                        </div>
                      ))}
                      <button type="button" className="btn-secondary btn-small" onClick={() => addLessonField(moduleIdx)}>+ Add Lesson</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn-secondary" onClick={addModuleField}>+ Add Module</button>
              </div>

              <button type="submit" className="btn-primary btn-wide">Create Course</button>
            </form>
          </div>
        )}

        {activeSection === 'createAssignment' && (
          <div className="section-content">
            <h2>Create Assignment</h2>
            {courses.length === 0 ? (
              <div className="no-courses-message">
                <p>📚 Create a course first before adding assignments!</p>
                <button className="btn-primary btn-offset" onClick={() => setActiveSection('create')}>Create Course</button>
              </div>
            ) : (
              <form className="create-course-form" onSubmit={handleCreateAssignment}>
                <div className="form-group">
                  <label>Assignment Title *</label>
                  <input type="text" placeholder="e.g. Build a React App" value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Course *</label>
                  <select value={newAssignment.courseId} onChange={e => setNewAssignment({ ...newAssignment, courseId: e.target.value })} required>
                    <option value="">Select a course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date *</label>
                  <input type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <button type="submit" className="btn-primary btn-wide">Create Assignment</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;

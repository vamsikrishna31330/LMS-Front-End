import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Quiz from '../components/Quiz';
import { useCourses } from '../context/CoursesContext';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../context/AssignmentsContext';
import './CourseContent.css';

const API_URL = 'http://localhost:8081/api';

// Helper to convert any YouTube URL to embed format
const convertYouTubeUrl = (url) => {
  if (!url) return null;
  
  // Already an embed URL
  if (url.includes('/embed/')) return url;
  
  // YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  
  // Short URL: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  
  // Return original if no match
  return url;
};

const isYouTubeVideoUrl = (url = '') =>
  /(?:youtube\.com|youtu\.be)/i.test(url);

const RELIABLE_VIDEO_POOL = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
];

const getReliableVideoUrl = (moduleIndex, lessonIndex) => {
  const idx = Math.abs((moduleIndex * 7) + lessonIndex) % RELIABLE_VIDEO_POOL.length;
  return RELIABLE_VIDEO_POOL[idx];
};

const isBlockedFallbackUrl = (url = '') =>
  url.includes('storage.googleapis.com/gtv-videos-bucket/sample/') ||
  url.includes('commondatastorage.googleapis.com/gtv-videos-bucket/sample/');

const isGenericSampleFallbackUrl = (url = '') =>
  RELIABLE_VIDEO_POOL.includes(url);

const sanitizeLessonVideoUrl = (lesson, moduleIndex, lessonIndex, courseTitle) => {
  const originalUrl = lesson?.video_url || '';
  const preferredUrl = getBlueprintForCourse(courseTitle)?.[moduleIndex]?.lessons?.[lessonIndex]?.video_url;

  if (!originalUrl || isBlockedFallbackUrl(originalUrl)) {
    return preferredUrl || getReliableVideoUrl(moduleIndex, lessonIndex);
  }

  if (isGenericSampleFallbackUrl(originalUrl) && preferredUrl) {
    return preferredUrl;
  }

  return originalUrl;
};

const DEFAULT_MODULE_BLUEPRINTS = [
  {
    title: 'Foundation Concepts',
    lessons: [
      {
        title: 'Course Introduction',
        content: 'Get an overview of this course, what you will build, and how to succeed with each module.',
        duration: 480,
        video_url: 'https://www.youtube.com/watch?v=VfGW0Qiy2I0',
      },
      {
        title: 'Core Concepts',
        content: 'Understand the key concepts and terminology you will use throughout this course.',
        duration: 720,
        video_url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
      },
      {
        title: 'Hands-on Setup',
        content: 'Set up the tools, project structure, and workflow needed for the upcoming lessons.',
        duration: 600,
        video_url: 'https://www.youtube.com/watch?v=Q33KBiDriJY',
      },
    ],
  },
  {
    title: 'Applied Practice',
    lessons: [
      {
        title: 'Real-world Walkthrough',
        content: 'Apply concepts with guided examples that mirror production use cases.',
        duration: 780,
        video_url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
      },
      {
        title: 'Debugging and Review',
        content: 'Learn how to debug common issues and evaluate your implementation quality.',
        duration: 660,
        video_url: 'https://www.youtube.com/watch?v=jS4aFq5-91M',
      },
      {
        title: 'Module Recap',
        content: 'Summarize key takeaways and prepare for the next stage of the course.',
        duration: 540,
        video_url: 'https://www.youtube.com/watch?v=DHjqpvDnNGE',
      },
    ],
  },
  {
    title: 'Project and Assessment',
    lessons: [
      {
        title: 'Mini Project Planning',
        content: 'Break down requirements and design a practical mini project based on this course.',
        duration: 600,
        video_url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
      },
      {
        title: 'Project Implementation',
        content: 'Build the project step by step and validate the expected outcomes.',
        duration: 900,
        video_url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
      },
      {
        title: 'Final Checklist',
        content: 'Review project quality, finalize documentation, and confirm readiness for assessment.',
        duration: 480,
        video_url: 'https://www.youtube.com/watch?v=3PHXvlpOkf4',
      },
    ],
  },
];

const COURSE_SPECIFIC_BLUEPRINTS = {
  react: [
    {
      title: 'React Fundamentals',
      lessons: [
        {
          title: 'JSX and Components',
          content: 'Learn how JSX maps to UI elements and how components help you build reusable interfaces.',
          duration: 660,
          video_url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
        },
        {
          title: 'Props and State',
          content: 'Understand one-way data flow with props and local component state updates.',
          duration: 720,
          video_url: 'https://www.youtube.com/watch?v=IYvD9oBCuJI',
        },
        {
          title: 'Events and Conditional UI',
          content: 'Handle user interactions and render dynamic UI with conditional patterns.',
          duration: 600,
          video_url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        },
      ],
    },
    {
      title: 'React Application Patterns',
      lessons: [
        {
          title: 'Hooks Deep Dive',
          content: 'Use useState, useEffect, and custom hooks to organize stateful logic cleanly.',
          duration: 840,
          video_url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
        },
        {
          title: 'Routing and Navigation',
          content: 'Build multi-page experiences using React Router and protected routes.',
          duration: 720,
          video_url: 'https://www.youtube.com/watch?v=Law7wfdg_ls',
        },
        {
          title: 'API Integration',
          content: 'Fetch data, handle loading and errors, and render responsive UI states.',
          duration: 780,
          video_url: 'https://www.youtube.com/watch?v=4UZrsTqkcW4',
        },
      ],
    },
  ],
  javascript: [
    {
      title: 'Modern JavaScript Essentials',
      lessons: [
        {
          title: 'ES6 Syntax Refresh',
          content: 'Practice let/const, arrow functions, template literals, and destructuring.',
          duration: 600,
          video_url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
        },
        {
          title: 'Arrays and Objects in Practice',
          content: 'Use map/filter/reduce and object spread patterns in realistic examples.',
          duration: 780,
          video_url: 'https://www.youtube.com/watch?v=R8rmfD9Y5-c',
        },
        {
          title: 'Scopes and Closures',
          content: 'Understand lexical scope and closure behavior for robust JavaScript code.',
          duration: 660,
          video_url: 'https://www.youtube.com/watch?v=1JsJx1x35c0',
        },
      ],
    },
    {
      title: 'Async JavaScript',
      lessons: [
        {
          title: 'Promises and Async Flow',
          content: 'Model asynchronous control flow with promises and proper error handling.',
          duration: 780,
          video_url: 'https://www.youtube.com/watch?v=PoRJizFvM7s',
        },
        {
          title: 'Async/Await in APIs',
          content: 'Write cleaner async code with async/await while keeping it readable and testable.',
          duration: 720,
          video_url: 'https://www.youtube.com/watch?v=V_Kr9OSfDeU',
        },
        {
          title: 'Concurrency Strategies',
          content: 'Use Promise.all and batching patterns to optimize asynchronous workloads.',
          duration: 600,
          video_url: 'https://www.youtube.com/watch?v=vn3tm0quoqE',
        },
      ],
    },
  ],
  python: [
    {
      title: 'Python Basics',
      lessons: [
        {
          title: 'Syntax and Data Types',
          content: 'Learn Python syntax, variables, and common data types for everyday coding.',
          duration: 660,
          video_url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
        },
        {
          title: 'Control Flow and Loops',
          content: 'Build logic with if/elif/else, for loops, while loops, and comprehensions.',
          duration: 720,
          video_url: 'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ',
        },
        {
          title: 'Functions and Modules',
          content: 'Create reusable functions and organize code into Python modules.',
          duration: 600,
          video_url: 'https://www.youtube.com/watch?v=NSbOtYzIQI0',
        },
      ],
    },
    {
      title: 'Python OOP and Practice',
      lessons: [
        {
          title: 'Classes and Objects',
          content: 'Design classes, initialize instances, and implement class behavior.',
          duration: 780,
          video_url: 'https://www.youtube.com/watch?v=JeznW_7DlB0',
        },
        {
          title: 'Error Handling',
          content: 'Use try/except/finally patterns to make your applications resilient.',
          duration: 540,
          video_url: 'https://www.youtube.com/watch?v=NIWwJbo-9_8',
        },
        {
          title: 'Mini Project Build',
          content: 'Apply Python fundamentals in a guided mini-project with clean structure.',
          duration: 900,
          video_url: 'https://www.youtube.com/watch?v=8ext9G7xspg',
        },
      ],
    },
  ],
  database: [
    {
      title: 'Database Verification Basics',
      lessons: [
        {
          title: 'Relational Database Foundations',
          content: 'Understand tables, keys, relationships, and normalization basics for reliable schemas.',
          duration: 660,
          video_url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
        },
        {
          title: 'Writing Validation Queries',
          content: 'Use SELECT, JOIN, GROUP BY, and WHERE clauses to verify dataset correctness.',
          duration: 720,
          video_url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
        },
        {
          title: 'Data Quality Checks',
          content: 'Create repeatable checks for duplicates, nulls, and integrity constraints.',
          duration: 600,
          video_url: 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw',
        },
      ],
    },
    {
      title: 'Practical DB Verification',
      lessons: [
        {
          title: 'Schema Validation Workflow',
          content: 'Validate schema migrations and detect mismatches before deployment.',
          duration: 780,
          video_url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
        },
        {
          title: 'Test Data Strategies',
          content: 'Generate realistic test data to validate business rules and edge cases.',
          duration: 660,
          video_url: 'https://www.youtube.com/watch?v=AA7i2GcTGwU',
        },
        {
          title: 'Verification Report',
          content: 'Document findings and convert verification results into actionable fixes.',
          duration: 540,
          video_url: 'https://www.youtube.com/watch?v=4cWkVbC2bNE',
        },
      ],
    },
  ],
};

const normalizeTitle = (value = '') => value.toLowerCase();

const getBlueprintForCourse = (title = '') => {
  const key = normalizeTitle(title);
  if (key.includes('react')) return COURSE_SPECIFIC_BLUEPRINTS.react;
  if (key.includes('javascript')) return COURSE_SPECIFIC_BLUEPRINTS.javascript;
  if (key.includes('python')) return COURSE_SPECIFIC_BLUEPRINTS.python;
  if (key.includes('db') || key.includes('database') || key.includes('sql')) return COURSE_SPECIFIC_BLUEPRINTS.database;
  return DEFAULT_MODULE_BLUEPRINTS;
};

const createFallbackLessons = (courseTitle, moduleIndex, baseId) => {
  const blueprint = getBlueprintForCourse(courseTitle)[moduleIndex] || DEFAULT_MODULE_BLUEPRINTS[moduleIndex % DEFAULT_MODULE_BLUEPRINTS.length];
  return (blueprint.lessons || []).map((lesson, index) => ({
    id: baseId + index + 1,
    title: lesson.title,
    content: lesson.content,
    duration: lesson.duration,
    video_url: lesson.video_url || getReliableVideoUrl(moduleIndex, index),
  }));
};

const ensureCourseModulesHaveLessons = (existingModules, courseTitle, parsedCourseId) => {
  const courseNumericId = Number(parsedCourseId) || 999;

  if (!Array.isArray(existingModules) || existingModules.length === 0) {
    return getBlueprintForCourse(courseTitle).map((moduleBlueprint, idx) => ({
      id: courseNumericId * 100 + idx + 1,
      title: moduleBlueprint.title,
      order_index: idx,
      lessons: createFallbackLessons(courseTitle, idx, courseNumericId * 1000 + idx * 100),
    }));
  }

  return existingModules.map((module, idx) => {
    const moduleLessons = Array.isArray(module.lessons) ? module.lessons : [];
    if (moduleLessons.length > 0) {
      return {
        ...module,
        lessons: moduleLessons.map((lesson, lessonIdx) => ({
          ...lesson,
          video_url: sanitizeLessonVideoUrl(lesson, idx, lessonIdx, courseTitle),
        })),
      };
    }

    const moduleBaseId = (Number(module.id) || courseNumericId * 100 + idx + 1) * 100;
    return {
      ...module,
      title: module.title || getBlueprintForCourse(courseTitle)[idx]?.title || `Module ${idx + 1}`,
      lessons: createFallbackLessons(courseTitle, idx, moduleBaseId),
    };
  });
};

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, authHeader } = useAuth();
  const { courses, updateProgress, setCourses } = useCourses();
  const { getAssignmentsByCourse } = useAssignments();

  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usingLocalData, setUsingLocalData] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  const [showAssignments, setShowAssignments] = useState(false);
  const [showObjectives, setShowObjectives] = useState(false);

  // Find course from context (works in both demo and real mode)
  const course = courses.find(c => c.id === parseInt(courseId));
  const courseAssignments = getAssignmentsByCourse(parseInt(courseId));

  useEffect(() => { loadCourseData(); }, [courseId, user.id]);

  const loadCourseData = async () => {
    setLoading(true);
    try {
      const headers = authHeader();
      const [modulesRes, progressRes] = await Promise.all([
        fetch(`${API_URL}/courses/${courseId}/modules`, { headers }),
        fetch(`${API_URL}/courses/${courseId}/progress/${user.id}`, { headers }),
      ]);

      if (!modulesRes.ok) throw new Error('No backend modules');

      const modulesData = await modulesRes.json();

      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (mod) => {
          const lessonsRes = await fetch(`${API_URL}/modules/${mod.id}/lessons`, { headers });
          const lessons = lessonsRes.ok ? await lessonsRes.json() : [];
          return { ...mod, lessons };
        })
      );
      const enrichedModules = ensureCourseModulesHaveLessons(modulesWithLessons, course?.title, courseId);
      setModules(enrichedModules);

      const progressData = progressRes.ok ? await progressRes.json() : [];
      const completedIds = new Set(progressData.map(p => p.lesson_id));
      setCompletedLessonIds(completedIds);

      const allLessons = enrichedModules.flatMap(m => m.lessons);
      const pct = allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0;
      setOverallProgress(pct);
      updateProgress(user.id, parseInt(courseId), pct);

      if (enrichedModules.length > 0 && !currentModule) {
        setCurrentModule(enrichedModules[0]);
        if (enrichedModules[0].lessons?.length > 0) setCurrentLesson(enrichedModules[0].lessons[0]);
        setExpandedModules({ [enrichedModules[0].id]: true });
      }
    } catch {
      // Backend not available — show demo content or course modules if available
      setUsingLocalData(true);
      
      // Check if course has modules stored in context
      if (course?.modules && course.modules.length > 0) {
        // Sort modules by order_index
        const sortedModules = [...course.modules].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        // Sort lessons within each module by id
        const sortedModulesWithLessons = sortedModules.map(m => ({
          ...m,
          lessons: [...(m.lessons || [])].sort((a, b) => (a.id || 0) - (b.id || 0))
        }));
        const enrichedModules = ensureCourseModulesHaveLessons(sortedModulesWithLessons, course?.title, courseId);
        setModules(enrichedModules);
        setCurrentModule(enrichedModules[0]);
        if (enrichedModules[0].lessons?.length > 0) setCurrentLesson(enrichedModules[0].lessons[0]);
        setExpandedModules({ [enrichedModules[0].id]: true });
      } else {
        const generatedModules = ensureCourseModulesHaveLessons([], course?.title, courseId);
        setModules(generatedModules);
        setCurrentModule(generatedModules[0]);
        setCurrentLesson(generatedModules[0].lessons[0]);
        setExpandedModules({ [generatedModules[0].id]: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    const newCompleted = new Set([...completedLessonIds, currentLesson.id]);
    setCompletedLessonIds(newCompleted);

    const allLessons = modules.flatMap(m => m.lessons);
    const pct = Math.round((newCompleted.size / allLessons.length) * 100);
    setOverallProgress(pct);
    updateProgress(user.id, parseInt(courseId), pct);

    if (!usingLocalData) {
      try {
        await fetch(`${API_URL}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ student_id: user.id, lesson_id: currentLesson.id }),
        });
      } catch { /* local update applied */ }
    }
  };

  const toggleModule = (moduleId) => setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));

  const isLessonCompleted = (lessonId) => completedLessonIds.has(lessonId);

  const allLessonsCompleted = (module) =>
    module.lessons?.length > 0 && module.lessons.every(l => isLessonCompleted(l.id));

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  const getNextItem = () => {
    if (!currentModule || !currentLesson) return null;
    const lessonIdx = currentModule.lessons?.findIndex(l => l.id === currentLesson.id);
    if (lessonIdx < currentModule.lessons.length - 1)
      return { type: 'lesson', item: currentModule.lessons[lessonIdx + 1] };
    if (allLessonsCompleted(currentModule) && !showQuiz)
      return { type: 'quiz' };
    const modIdx = modules.findIndex(m => m.id === currentModule.id);
    if (modIdx < modules.length - 1)
      return { type: 'module', item: modules[modIdx + 1] };
    return null;
  };

  const handleNext = () => {
    const next = getNextItem();
    if (!next) { alert('🎉 Congratulations! You have completed the course!'); return; }
    if (next.type === 'lesson') { setCurrentLesson(next.item); setShowQuiz(false); }
    else if (next.type === 'quiz') { setShowQuiz(true); }
    else if (next.type === 'module') {
      setCurrentModule(next.item);
      setCurrentLesson(next.item.lessons?.[0] || null);
      setShowQuiz(false);
      setExpandedModules(prev => ({ ...prev, [next.item.id]: true }));
    }
  };

  if (loading) {
    return (
      <div className="course-layout">
        <Navbar />
        <div className="course-loading">Loading course content...</div>
      </div>
    );
  }

  return (
    <div className="course-layout">
      <Navbar />
      
      <div className="course-body">
        {/* Left Sidebar - Navigation */}
        <aside className="course-sidebar">
          <div className="course-sidebar-header">
            <h2 className="course-title">{course?.title || 'Course'}</h2>
            <p className="course-provider">EduLearn Platform</p>
          </div>
          
          <nav className="course-nav">
            <div className="nav-section">
              <button className="nav-item back-link" onClick={() => navigate('/student')}>
                ← Back to Dashboard
              </button>
            </div>
            
            <div className="nav-section">
              <h3 className="nav-section-title">Course Material</h3>
              <ul className="nav-list">
                {[...modules].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((module, idx) => {
                  const isActive = currentModule?.id === module.id;
                  const completed = allLessonsCompleted(module);
                  return (
                    <li key={module.id} className={`nav-item ${isActive ? 'active' : ''} ${completed ? 'completed' : ''}`}>
                      <button onClick={() => { setCurrentModule(module); setCurrentLesson(module.lessons?.[0]); setShowQuiz(false); }}>
                        <span className="nav-item-icon">{completed ? '✓' : isActive ? '●' : '○'}</span>
                        <span className="nav-item-text">Module {idx + 1}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <div className="nav-section">
              <h3 className="nav-section-title">Course Info</h3>
              <ul className="nav-list">
                <li className="nav-item">
                  <button onClick={() => setShowAssignments(!showAssignments)}>
                    <span className="nav-item-text">Grades</span>
                    <span className="nav-item-badge">{overallProgress}%</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="course-main">
          {showQuiz ? (
            <Quiz
              moduleId={currentModule?.id}
              studentId={user.id}
              onComplete={() => { setShowQuiz(false); loadCourseData(); }}
              onClose={() => { setShowQuiz(false); loadCourseData(); }}
            />
          ) : currentLesson ? (
            <div className="lesson-content">
              {/* Module Header */}
              <div className="module-content-header">
                <div className="module-stats">
                  <span className="stat">
                    <span className="stat-icon">📹</span>
                    {currentModule?.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) / 60} min of videos left
                  </span>
                  {currentModule?.quiz && (
                    <span className="stat">
                      <span className="stat-icon">📝</span>
                      1 graded assessment left
                    </span>
                  )}
                </div>
              </div>

              {/* Content Text */}
              <div className="lesson-text">
                <p>{currentLesson.content || 'No content available for this lesson.'}</p>
                
                <button className="show-objectives-btn" onClick={() => setShowObjectives(!showObjectives)}>
                  {showObjectives ? '▼' : '▶'} Show Learning Objectives
                </button>
                
                {showObjectives && (
                  <div className="learning-objectives">
                    <ul>
                      <li>Understand the core concepts of {currentModule?.title}</li>
                      <li>Apply practical examples in real-world scenarios</li>
                      <li>Complete all lessons and pass the module quiz</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Video Section */}
              {currentLesson.video_url && (
                <div className="video-section-wrapper">
                  <div className="video-header">
                    <span className="video-badge">VIDEO</span>
                    <h3>{currentLesson.title}</h3>
                    <span className="video-duration">{formatDuration(currentLesson.duration)}</span>
                  </div>
                  <div className="video-player-container">
                    {isYouTubeVideoUrl(currentLesson.video_url) ? (
                      <iframe
                        src={convertYouTubeUrl(currentLesson.video_url)}
                        title={currentLesson.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="eager"
                      />
                    ) : (
                      <video controls preload="metadata" style={{ width: '100%', height: '100%', background: '#000' }}>
                        <source src={currentLesson.video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                  <a className="resume-btn" href={currentLesson.video_url} target="_blank" rel="noreferrer">Open Video</a>
                </div>
              )}

              {/* Lesson Navigation */}
              <div className="lesson-actions">
                {isLessonCompleted(currentLesson.id) ? (
                  <button className="action-btn completed" disabled>
                    ✓ Marked as Complete
                  </button>
                ) : (
                  <button className="action-btn primary" onClick={handleMarkComplete}>
                    Mark as Complete
                  </button>
                )}
                
                <button className="action-btn secondary" onClick={handleNext}>
                  {getNextItem()?.type === 'quiz' ? 'Take Module Quiz →'
                    : getNextItem()?.type === 'module' ? 'Next Module →'
                    : getNextItem() ? 'Next Lesson →'
                    : 'Finish Course 🎉'}
                </button>
              </div>

              {/* Module Lessons List (AWS Style) */}
              <div className="module-lessons-list">
                <div className="module-header-bar">
                  <h4>{currentModule?.title} Introduction</h4>
                </div>
                
                {[...(currentModule?.lessons || [])].sort((a, b) => (a.id || 0) - (b.id || 0)).map((lesson, idx) => {
                  const completed = isLessonCompleted(lesson.id);
                  const isCurrent = currentLesson?.id === lesson.id;
                  
                  return (
                    <div 
                      key={lesson.id} 
                      className={`content-item ${isCurrent ? 'active' : ''} ${completed ? 'completed' : ''}`}
                      onClick={() => setCurrentLesson(lesson)}
                    >
                      <div className="content-item-icon">
                        {lesson.video_url ? '📹' : '📄'}
                      </div>
                      <div className="content-item-details">
                        <span className="content-item-title">{lesson.title}</span>
                        <span className="content-item-type">
                          {lesson.video_url ? 'Video' : 'Reading'} • {formatDuration(lesson.duration)}
                        </span>
                      </div>
                      {isCurrent && <button className="resume-small-btn">Resume</button>}
                      {completed && <span className="completed-check">✓</span>}
                    </div>
                  );
                })}

                {allLessonsCompleted(currentModule) && currentModule?.quiz && (
                  <div 
                    className={`content-item quiz-item ${showQuiz ? 'active' : ''}`}
                    onClick={() => setShowQuiz(true)}
                  >
                    <div className="content-item-icon">📝</div>
                    <div className="content-item-details">
                      <span className="content-item-title">{currentModule.quiz.title}</span>
                      <span className="content-item-type">
                        Practice Assignment • {currentModule.quiz.questions?.length} questions • {currentModule.quiz.time_limit} min
                      </span>
                    </div>
                    <span className="quiz-badge">Graded</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-content">
              <p>No lessons available in this module.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseContent;

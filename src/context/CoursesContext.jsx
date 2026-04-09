import { createContext, useState, useContext, useEffect } from 'react';
import { courseAPI, getAuthToken } from '../services/api';

const CoursesContext = createContext();

export const useCourses = () => {
  const context = useContext(CoursesContext);
  if (!context) throw new Error('useCourses must be used within CoursesProvider');
  return context;
};

// Default seed courses — instructorId matches demo user id from AuthContext
const DEFAULT_COURSES = [
  {
    id: 1,
    title: 'React Fundamentals',
    instructor: 'Jane Smith',
    instructorId: 'demo_instructor',
    students: 45,
    assignments: 8,
    pending: 12,
    status: 'active',
    description: 'Learn the basics of React including components, props, and state management.',
    duration: '8 weeks',
    createdBy: 'instructor',
    modules: [
      {
        id: 1,
        title: 'Getting Started with React',
        order_index: 0,
        lessons: [
          { id: 1, title: 'What is React?', content: 'React is a JavaScript library for building user interfaces, maintained by Facebook.', duration: 480, video_url: 'https://www.youtube.com/embed/w7ejDZ8SWv8' },
          { id: 2, title: 'Setting Up Your Environment', content: 'Install Node.js, npm, and create your first React app using create-react-app.', duration: 600, video_url: 'https://www.youtube.com/embed/9U3IhL9s7xQ' },
          { id: 3, title: 'Your First Component', content: 'Learn to create and render your first React component.', duration: 540, video_url: 'https://www.youtube.com/embed/9U3IhL9s7xQ' },
        ],
        quiz: {
          id: 1,
          title: 'React Basics Quiz',
          time_limit: 15,
          passing_score: 70,
          questions: [
            { id: 1, question_text: 'What is React?', options: ['A database', 'A JavaScript library for building UIs', 'A CSS framework', 'A programming language'], correct_answer: 'B', points: 10 },
            { id: 2, question_text: 'Which command creates a new React app?', options: ['npm create react', 'npx create-react-app my-app', 'npm build react', 'react-new my-app'], correct_answer: 'B', points: 10 },
            { id: 3, question_text: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript XHR'], correct_answer: 'A', points: 10 },
            { id: 4, question_text: 'React uses a virtual DOM. True or False?', options: ['True', 'False', 'Only in development', 'Only in production'], correct_answer: 'A', points: 10 },
          ]
        }
      },
      {
        id: 2,
        title: 'Components and Props',
        order_index: 1,
        lessons: [
          { id: 4, title: 'Understanding Components', content: 'Components are the building blocks of React applications.', duration: 720, video_url: 'https://www.youtube.com/embed/9U3IhL9s7xQ' },
          { id: 5, title: 'Props and Data Flow', content: 'Learn how to pass data between components using props.', duration: 900, video_url: 'https://www.youtube.com/embed/9U3IhL9s7xQ' },
        ],
        quiz: {
          id: 2,
          title: 'Components & Props Quiz',
          time_limit: 20,
          passing_score: 70,
          questions: [
            { id: 5, question_text: 'How do you pass data to a child component?', options: ['Using state', 'Using props', 'Using context', 'Using refs'], correct_answer: 'B', points: 10 },
            { id: 6, question_text: 'Are props mutable (can be changed)?', options: ['Yes, always', 'Yes, in child components', 'No, they are read-only', 'Only in class components'], correct_answer: 'C', points: 10 },
            { id: 7, question_text: 'What syntax is used to render a component?', options: ['<Component />', 'Component()', 'render(Component)', 'show(Component)'], correct_answer: 'A', points: 10 },
          ]
        }
      },
      {
        id: 3,
        title: 'State and Events',
        order_index: 2,
        lessons: [
          { id: 6, title: 'Introduction to State', content: 'State allows components to store and manage dynamic data.', duration: 780, video_url: 'https://www.youtube.com/embed/9U3IhL9s7xQ' },
          { id: 7, title: 'Handling Events', content: 'Learn to handle user interactions like clicks and form submissions.', duration: 840, video_url: 'https://www.youtube.com/embed/9U3IhL9s7xQ' },
          { id: 8, title: 'Conditional Rendering', content: 'Render different UI based on state and conditions.', duration: 600, video_url: 'https://www.youtube.com/embed/9U3IhL9s7xQ' },
        ],
        quiz: {
          id: 3,
          title: 'State & Events Quiz',
          time_limit: 15,
          passing_score: 75,
          questions: [
            { id: 8, question_text: 'Which hook is used to manage state in functional components?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correct_answer: 'B', points: 10 },
            { id: 9, question_text: 'How do you update state?', options: ['Direct assignment', 'Using the setter function', 'this.setState only', 'Mutating the variable'], correct_answer: 'B', points: 10 },
            { id: 10, question_text: 'Event handlers in React use:', options: ['camelCase naming', 'lowercase naming', 'UPPERCASE naming', 'snake_case naming'], correct_answer: 'A', points: 10 },
            { id: 11, question_text: 'setState is asynchronous. True or False?', options: ['True', 'False', 'Only in class components', 'Only in functional components'], correct_answer: 'A', points: 10 },
          ]
        }
      },
    ],
  },
  {
    id: 2,
    title: 'Advanced JavaScript',
    instructor: 'Jane Smith',
    instructorId: 'demo_instructor',
    students: 32,
    assignments: 6,
    pending: 5,
    status: 'active',
    description: 'Master advanced JavaScript concepts including async programming, ES6+, and more.',
    duration: '6 weeks',
    createdBy: 'instructor',
    modules: [
      {
        id: 4,
        title: 'ES6+ Features',
        order_index: 0,
        lessons: [
          { id: 12, title: 'Arrow Functions', content: 'Learn the concise syntax of arrow functions and their lexical scoping.', duration: 540, video_url: 'https://www.youtube.com/embed/hdI2bqOjy3c' },
          { id: 13, title: 'Destructuring', content: 'Extract values from arrays and objects with destructuring syntax.', duration: 480, video_url: 'https://www.youtube.com/embed/hdI2bqOjy3c' },
          { id: 14, title: 'Template Literals', content: 'Create strings with embedded expressions using template literals.', duration: 360, video_url: 'https://www.youtube.com/embed/hdI2bqOjy3c' },
        ],
        quiz: {
          id: 4,
          title: 'ES6 Features Quiz',
          time_limit: 15,
          passing_score: 70,
          questions: [
            { id: 12, question_text: 'What is the arrow function syntax?', options: ['function => {}', '() => {}', '->() {}', 'lambda {}'], correct_answer: 'B', points: 10 },
            { id: 13, question_text: 'How do you destructure an object?', options: ['const {a} = obj', 'const [a] = obj', 'obj.get(a)', 'extract obj.a'], correct_answer: 'A', points: 10 },
            { id: 14, question_text: 'Template literals use:', options: ['Single quotes', 'Double quotes', 'Backticks ``', 'Curly braces'], correct_answer: 'C', points: 10 },
          ]
        }
      },
      {
        id: 5,
        title: 'Asynchronous JavaScript',
        order_index: 1,
        lessons: [
          { id: 15, title: 'Promises', content: 'Understand promises for handling asynchronous operations.', duration: 660, video_url: 'https://www.youtube.com/embed/hdI2bqOjy3c' },
          { id: 16, title: 'Async/Await', content: 'Write cleaner async code with async/await syntax.', duration: 720, video_url: 'https://www.youtube.com/embed/hdI2bqOjy3c' },
          { id: 17, title: 'Fetch API', content: 'Make HTTP requests using the modern Fetch API.', duration: 600, video_url: 'https://www.youtube.com/embed/hdI2bqOjy3c' },
        ],
        quiz: {
          id: 5,
          title: 'Async JavaScript Quiz',
          time_limit: 20,
          passing_score: 70,
          questions: [
            { id: 15, question_text: 'What does async function return?', options: ['A string', 'A number', 'A Promise', 'Undefined'], correct_answer: 'C', points: 10 },
            { id: 16, question_text: 'Which keyword waits for a Promise?', options: ['promise', 'await', 'wait', 'then'], correct_answer: 'B', points: 10 },
            { id: 17, question_text: 'Fetch API returns:', options: ['XML data', 'A Promise', 'JSON directly', 'A callback'], correct_answer: 'B', points: 10 },
            { id: 18, question_text: 'What is Promise.all() used for?', options: ['First promise', 'Rejecting all', 'Waiting for all promises', 'Creating promises'], correct_answer: 'C', points: 10 },
          ]
        }
      },
      {
        id: 6,
        title: 'Arrays and Objects',
        order_index: 2,
        lessons: [
          { id: 18, title: 'Array Methods', content: 'Master map, filter, reduce, and other array methods.', duration: 900, video_url: 'https://www.youtube.com/embed/hdI2bqOjy3c' },
          { id: 19, title: 'Spread and Rest Operators', content: 'Use ...spread and ...rest for flexible data handling.', duration: 540, video_url: 'https://www.youtube.com/embed/hdI2bqOjy3c' },
        ],
        quiz: {
          id: 6,
          title: 'Arrays Quiz',
          time_limit: 15,
          passing_score: 70,
          questions: [
            { id: 19, question_text: 'Which method creates a new array by transforming elements?', options: ['filter', 'map', 'reduce', 'forEach'], correct_answer: 'B', points: 10 },
            { id: 20, question_text: 'What does the spread operator (...) do?', options: ['Adds numbers', 'Expands iterables', 'Creates arrays', 'Loops over data'], correct_answer: 'B', points: 10 },
            { id: 21, question_text: 'reduce() method returns:', options: ['An array', 'A single value', 'Boolean', 'Undefined'], correct_answer: 'B', points: 10 },
          ]
        }
      },
    ],
  },
  {
    id: 3,
    title: 'Python Programming',
    instructor: 'John Instructor',
    instructorId: 'other_instructor',
    students: 28,
    assignments: 0,
    pending: 0,
    status: 'active',
    description: 'Introduction to Python programming for beginners. Learn syntax, data types, and basic algorithms.',
    duration: '10 weeks',
    createdBy: 'instructor',
    modules: [
      {
        id: 7,
        title: 'Python Basics',
        order_index: 0,
        lessons: [
          { id: 20, title: 'Introduction to Python', content: 'What is Python and why is it popular?', duration: 600, video_url: 'https://www.youtube.com/embed/rfscVS0vtbw' },
          { id: 21, title: 'Variables and Data Types', content: 'Numbers, strings, lists, dictionaries, and more.', duration: 720, video_url: 'https://www.youtube.com/embed/rfscVS0vtbw' },
          { id: 22, title: 'Control Flow', content: 'If statements, loops, and conditionals in Python.', duration: 780, video_url: 'https://www.youtube.com/embed/rfscVS0vtbw' },
        ],
        quiz: {
          id: 7,
          title: 'Python Basics Quiz',
          time_limit: 15,
          passing_score: 65,
          questions: [
            { id: 22, question_text: 'How do you print in Python?', options: ['echo()', 'console.log()', 'print()', 'printf()'], correct_answer: 'C', points: 10 },
            { id: 23, question_text: 'Which data type is mutable?', options: ['String', 'Tuple', 'List', 'Integer'], correct_answer: 'C', points: 10 },
            { id: 24, question_text: 'Python uses indentation to define blocks. True?', options: ['True', 'False', 'Only in loops', 'Only in functions'], correct_answer: 'A', points: 10 },
          ]
        }
      },
      {
        id: 8,
        title: 'Functions and OOP',
        order_index: 1,
        lessons: [
          { id: 23, title: 'Functions in Python', content: 'Define and call functions, arguments and return values.', duration: 840, video_url: 'https://www.youtube.com/embed/rfscVS0vtbw' },
          { id: 24, title: 'Object-Oriented Programming', content: 'Classes, objects, inheritance in Python.', duration: 900, video_url: 'https://www.youtube.com/embed/rfscVS0vtbw' },
        ],
        quiz: {
          id: 8,
          title: 'Python OOP Quiz',
          time_limit: 20,
          passing_score: 70,
          questions: [
            { id: 25, question_text: 'How do you define a function?', options: ['function name():', 'def name():', 'func name():', 'define name():'], correct_answer: 'B', points: 10 },
            { id: 26, question_text: 'What keyword creates a class?', options: ['class', 'def', 'struct', 'object'], correct_answer: 'A', points: 10 },
            { id: 27, question_text: 'self in Python refers to:', options: ['Global object', 'Instance itself', 'Static method', 'Parent class'], correct_answer: 'B', points: 10 },
            { id: 28, question_text: 'Constructor method in Python is:', options: ['__init__', '__construct__', 'constructor', 'new'], correct_answer: 'A', points: 10 },
          ]
        }
      },
    ],
  },
];

const safeParse = (value, fallback) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeCourse = (course) => ({
  ...course,
  id: course.id,
  title: course.title,
  description: course.description || '',
  duration: course.duration || '',
  instructor: course.instructor || course.instructor_name || course.instructorName || '',
  instructorId: course.instructorId ?? course.instructor_id ?? null,
  students: course.students ?? 0,
  assignments: course.assignments ?? 0,
  pending: course.pending ?? 0,
  status: course.status || 'active',
  modules: course.modules || [],
});

const mergeCourseLists = (localCourses, remoteCourses) => {
  const localById = new Map(localCourses.map(course => [String(course.id), course]));
  const remoteIds = new Set(remoteCourses.map(course => String(course.id)));

  const mergedRemoteCourses = remoteCourses.map(remoteCourse => {
    const existingCourse = localById.get(String(remoteCourse.id));
    if (!existingCourse) return remoteCourse;

    return {
      ...remoteCourse,
      ...existingCourse,
      instructor: existingCourse.instructor || remoteCourse.instructor,
      instructorId: existingCourse.instructorId ?? remoteCourse.instructorId,
      modules: existingCourse.modules?.length ? existingCourse.modules : remoteCourse.modules,
    };
  });

  const orphanLocalCourses = localCourses.filter(course => !remoteIds.has(String(course.id)));
  return [...mergedRemoteCourses, ...orphanLocalCourses];
};

export const CoursesProvider = ({ children }) => {
  const [courses, setCourses] = useState(() => {
    const savedCourses = safeParse(localStorage.getItem('lmsCourses'), null);
    return Array.isArray(savedCourses) ? savedCourses : DEFAULT_COURSES;
  });
  const [enrollments, setEnrollments] = useState(() => {
    const savedEnrollments = safeParse(localStorage.getItem('lmsEnrollments'), null);
    return Array.isArray(savedEnrollments) ? savedEnrollments : [];
  });

  useEffect(() => {
    let isActive = true;

    const hydrateCourses = async () => {
      try {
        const remoteCourses = await courseAPI.getAll();
        if (!isActive || !Array.isArray(remoteCourses)) return;

        setCourses(prevCourses => mergeCourseLists(
          Array.isArray(prevCourses) ? prevCourses : DEFAULT_COURSES,
          remoteCourses.map(normalizeCourse)
        ));
      } catch {
        // Keep the local cache if the backend is unavailable.
      }
    };

    hydrateCourses();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => { localStorage.setItem('lmsCourses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('lmsEnrollments', JSON.stringify(enrollments)); }, [enrollments]);

  const addCourse = async (course) => {
    try {
      const created = await courseAPI.create({
        title: course.title,
        description: course.description || '',
        duration: course.duration || '',
      });

      const createdCourse = {
        ...course,
        id: created.id,
        students: 0,
        assignments: 0,
        pending: 0,
        status: course.status || 'active',
        modules: course.modules || [],
      };

      setCourses(prev => [...prev, createdCourse]);
      return createdCourse;
    } catch (error) {
      const token = getAuthToken();
      // Keep local fallback only for explicit demo/offline mode.
      if (token === null || token === 'demo_token') {
        const newCourse = {
          ...course,
          id: Date.now(),
          students: 0,
          assignments: 0,
          pending: 0,
          status: course.status || 'active',
          modules: course.modules || [],
        };
        setCourses(prev => [...prev, newCourse]);
        return newCourse;
      }

      // For authenticated backend users, do not fake success locally.
      throw error;
    }
  };

  const updateCourse = (courseId, updates) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, ...updates } : c));
  };

  const deleteCourse = (courseId) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setEnrollments(prev => prev.filter(e => e.courseId !== courseId));
  };

  const enrollInCourse = (userId, courseId) => {
    const alreadyEnrolled = enrollments.some(e => e.userId === userId && e.courseId === courseId);
    if (alreadyEnrolled) return;
    setEnrollments(prev => [...prev, {
      id: Date.now(), userId, courseId, progress: 0, enrolledDate: new Date().toISOString()
    }]);
    setCourses(prev => prev.map(c =>
      c.id === courseId ? { ...c, students: (c.students || 0) + 1 } : c
    ));
  };

  const getEnrolledCourses = (userId) => {
    const userEnrollments = enrollments.filter(e => e.userId === userId);
    return userEnrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      return course ? { ...course, progress: enrollment.progress, enrollmentId: enrollment.id } : null;
    }).filter(Boolean);
  };

  const getAvailableCourses = (userId) => {
    const enrolledIds = enrollments.filter(e => e.userId === userId).map(e => e.courseId);
    return courses.filter(c => !enrolledIds.includes(c.id) && c.status === 'active');
  };

  const isEnrolled = (userId, courseId) =>
    enrollments.some(e => e.userId === userId && e.courseId === courseId);

  const updateProgress = (userId, courseId, progress) => {
    setEnrollments(prev => prev.map(e =>
      e.userId === userId && e.courseId === courseId ? { ...e, progress } : e
    ));
  };

  // Fix: match by id OR email OR name to handle both real DB users and demo users
  const getInstructorCourses = (user) => {
    if (!user) return [];

    return courses.filter(c =>
      String(c.instructorId) === String(user.id) ||
      String(c.instructorId) === String(user.email) ||
      c.instructor === user.name ||
      // Demo fallback: Jane Smith is the demo instructor
      (String(user.id) === 'demo_instructor' && String(c.instructorId) === 'demo_instructor')
    );
  };

  // Reset to default courses (for testing/reset)
  const resetCourses = () => {
    localStorage.removeItem('lmsCourses');
    localStorage.removeItem('lmsEnrollments');
    setCourses(DEFAULT_COURSES);
    setEnrollments([]);
  };

  return (
    <CoursesContext.Provider value={{
      courses,
      enrollments,
      addCourse,
      updateCourse,
      deleteCourse,
      enrollInCourse,
      getEnrolledCourses,
      getAvailableCourses,
      isEnrolled,
      updateProgress,
      getInstructorCourses,
      setCourses,
      resetCourses,
    }}>
      {children}
    </CoursesContext.Provider>
  );
};

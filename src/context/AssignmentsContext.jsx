import { createContext, useState, useContext, useEffect } from 'react';

const AssignmentsContext = createContext();

export const useAssignments = () => {
  const context = useContext(AssignmentsContext);
  if (!context) throw new Error('useAssignments must be used within AssignmentsProvider');
  return context;
};

// Generate dates relative to today so they're never stale
const futureDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const safeParse = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const DEFAULT_ASSIGNMENTS = [
  {
    id: 1,
    title: 'Build a Todo App',
    course: 'React Fundamentals',
    courseId: 1,
    dueDate: futureDate(14),
    // No studentId — this is the assignment template, submissions are separate
  },
  {
    id: 2,
    title: 'Async Programming Exercise',
    course: 'Advanced JavaScript',
    courseId: 2,
    dueDate: futureDate(21),
  },
];

const COURSE_ASSIGNMENT_TEMPLATES = {
  react: [
    'Build Reusable React Components',
    'Create State-driven Form UI',
    'Implement API Data Dashboard',
  ],
  javascript: [
    'Async/Await Data Processing Task',
    'Array Methods Problem Set',
    'Promise Error Handling Exercise',
  ],
  python: [
    'Python Functions and Modules Lab',
    'OOP Class Design Assignment',
    'Control Flow Coding Challenge',
  ],
  database: [
    'SQL Query Validation Worksheet',
    'Schema Design Review',
    'Data Quality Audit Task',
  ],
  generic: [
    'Module Summary Assignment',
    'Practical Implementation Task',
    'Final Reflection and Report',
  ],
};

const normalizeTitle = (value = '') => value.toLowerCase();

const getAssignmentTemplatesForCourse = (courseTitle = '') => {
  const key = normalizeTitle(courseTitle);
  if (key.includes('react')) return COURSE_ASSIGNMENT_TEMPLATES.react;
  if (key.includes('javascript')) return COURSE_ASSIGNMENT_TEMPLATES.javascript;
  if (key.includes('python')) return COURSE_ASSIGNMENT_TEMPLATES.python;
  if (key.includes('db') || key.includes('database') || key.includes('sql')) return COURSE_ASSIGNMENT_TEMPLATES.database;
  return COURSE_ASSIGNMENT_TEMPLATES.generic;
};

const ensureAssignmentsForCourses = (courses, existingAssignments = []) => {
  if (!Array.isArray(courses) || courses.length === 0) return existingAssignments;

  const normalizedAssignments = Array.isArray(existingAssignments) ? existingAssignments : [];
  const nextAssignments = [...normalizedAssignments];
  let nextId = normalizedAssignments.reduce((maxId, item) => {
    const parsed = Number(item.id);
    return Number.isFinite(parsed) ? Math.max(maxId, parsed) : maxId;
  }, 0) + 1;

  courses.forEach((course, courseIdx) => {
    const courseId = Number(course.id);
    if (!Number.isFinite(courseId)) return;

    const existingForCourse = nextAssignments.filter(a => Number(a.courseId) === courseId).length;
    const needed = Math.max(0, 2 - existingForCourse);
    if (needed === 0) return;

    const templates = getAssignmentTemplatesForCourse(course.title);
    for (let i = 0; i < needed; i += 1) {
      const templateTitle = templates[(existingForCourse + i) % templates.length];
      nextAssignments.push({
        id: nextId,
        title: templateTitle,
        course: course.title,
        courseId,
        dueDate: futureDate(10 + (courseIdx * 4) + (i * 7)),
      });
      nextId += 1;
    }
  });

  return nextAssignments;
};

// Submissions are tracked separately per student
const DEFAULT_SUBMISSIONS = [
  {
    id: 301,
    assignmentId: 1,
    studentId: 'demo_student',
    studentName: 'Alex Student',
    submittedFile: 'todo-app.zip',
    submittedDate: new Date().toLocaleDateString(),
    grade: 'A',
    status: 'graded',
  },
];

export const AssignmentsProvider = ({ children }) => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const savedAssignments = safeParse(localStorage.getItem('lmsAssignments'), null);
    const savedSubmissions = safeParse(localStorage.getItem('lmsSubmissions'), null);
    const savedCourses = safeParse(localStorage.getItem('lmsCourses'), []);

    const baseAssignments = Array.isArray(savedAssignments) && savedAssignments.length > 0
      ? savedAssignments
      : DEFAULT_ASSIGNMENTS;

    const hydratedAssignments = ensureAssignmentsForCourses(savedCourses, baseAssignments);
    setAssignments(hydratedAssignments);
    setSubmissions(Array.isArray(savedSubmissions) ? savedSubmissions : DEFAULT_SUBMISSIONS);
  }, []);

  useEffect(() => { localStorage.setItem('lmsAssignments', JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem('lmsSubmissions', JSON.stringify(submissions)); }, [submissions]);

  // Get assignments for enrolled courses only, with submission status per student
  const getStudentAssignments = (studentId, enrolledCourseIds = []) => {
    const relevantAssignments = enrolledCourseIds.length > 0
      ? assignments.filter(a => enrolledCourseIds.includes(a.courseId))
      : assignments; // fallback: show all (for demo with no enrollment data)

    return relevantAssignments.map(assignment => {
      const submission = submissions.find(
        s => s.assignmentId === assignment.id && s.studentId === studentId
      );
      return {
        ...assignment,
        studentId: submission?.studentId || null,
        studentName: submission?.studentName || null,
        submittedFile: submission?.submittedFile || null,
        submittedDate: submission?.submittedDate || null,
        grade: submission?.grade || null,
        status: submission
          ? (submission.grade ? 'graded' : 'submitted')
          : 'pending',
      };
    });
  };

  // Get submitted assignments for courses taught by instructor
  const getSubmittedAssignments = (instructorCourses) => {
    const courseIds = instructorCourses.map(c => c.id);
    const courseAssignments = assignments.filter(a => courseIds.includes(a.courseId));
    return courseAssignments.flatMap(assignment => {
      return submissions
        .filter(s => s.assignmentId === assignment.id)
        .map(s => ({ ...assignment, ...s, assignmentId: assignment.id }));
    });
  };

  const submitAssignment = (assignmentId, studentId, studentName, file) => {
    const existing = submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
    if (existing) return; // already submitted
    setSubmissions(prev => [...prev, {
      id: Date.now(),
      assignmentId,
      studentId,
      studentName,
      submittedFile: file.name,
      submittedDate: new Date().toLocaleDateString(),
      grade: null,
      status: 'submitted',
    }]);
  };

  const gradeAssignment = (submissionId, grade) => {
    setSubmissions(prev => prev.map(s =>
      s.id === submissionId ? { ...s, grade, status: 'graded' } : s
    ));
  };

  const createAssignment = (assignmentData) => {
    const newAssignment = {
      id: Date.now(),
      title: assignmentData.title,
      course: assignmentData.course,
      courseId: assignmentData.courseId,
      dueDate: assignmentData.dueDate,
    };
    setAssignments(prev => [...prev, newAssignment]);
    return newAssignment;
  };

  const getAssignmentsByCourse = (courseId) =>
    assignments.filter(a => a.courseId === courseId);

  return (
    <AssignmentsContext.Provider value={{
      assignments,
      submissions,
      submitAssignment,
      gradeAssignment,
      createAssignment,
      getStudentAssignments,
      getSubmittedAssignments,
      getAssignmentsByCourse,
    }}>
      {children}
    </AssignmentsContext.Provider>
  );
};

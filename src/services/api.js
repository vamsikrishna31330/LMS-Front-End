const API_URL = 'http://localhost:8081/api';

// FIX: Module-level token store so AuthContext can inject the token once after login,
// and every subsequent API call automatically sends the Authorization header.
let _authToken = null;
export const setAuthToken = (token) => { _authToken = token; };
export const getAuthToken = () => _authToken;

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      // FIX: Automatically attach the Bearer token to every request when available.
      // Previously no Authorization header was sent, causing 401 on all protected endpoints.
      ...(_authToken ? { Authorization: `Bearer ${_authToken}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// User API functions
export const userAPI = {
  getAll: () => apiRequest('/users'),
  getById: (id) => apiRequest(`/users/${id}`),
  create: (userData) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id, userData) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Course API functions
export const courseAPI = {
  getAll: () => apiRequest('/courses'),
  getById: (id) => apiRequest(`/courses/${id}`),
  create: (courseData) => apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData),
  }),
  update: (id, courseData) => apiRequest(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  }),
  delete: (id) => apiRequest(`/courses/${id}`, {
    method: 'DELETE',
  }),
};

// Lesson API functions
export const lessonAPI = {
  getByModule: (moduleId) => apiRequest(`/modules/${moduleId}/lessons`),
  getById: (id) => apiRequest(`/lessons/${id}`),
};

// Module API functions
export const moduleAPI = {
  getByCourse: (courseId) => apiRequest(`/courses/${courseId}/modules`),
  getById: (id) => apiRequest(`/modules/${id}`),
};

// Quiz API functions
export const quizAPI = {
  getByModule: (moduleId) => apiRequest(`/modules/${moduleId}/quiz`),
  getQuestions: (quizId) => apiRequest(`/quizzes/${quizId}/questions`),
  submitAttempt: (data) => apiRequest('/quiz-attempts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAttempts: (studentId, quizId) => apiRequest(`/quiz-attempts/${studentId}/${quizId}`),
};

// Progress API functions
export const progressAPI = {
  getByCourseAndStudent: (courseId, studentId) => apiRequest(`/courses/${courseId}/progress/${studentId}`),
  getPercentage: (courseId, studentId) => apiRequest(`/courses/${courseId}/progress/${studentId}/percentage`),
  markComplete: (studentId, lessonId) => apiRequest('/progress', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId, lesson_id: lessonId }),
  }),
};

// Test API connection
export const testAPI = () => apiRequest('/test');

export default apiRequest;

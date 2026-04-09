import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CoursesProvider } from './context/CoursesContext';
import { AssignmentsProvider } from './context/AssignmentsContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ContentCreatorDashboard from './pages/ContentCreatorDashboard';
import CourseContent from './pages/CourseContent';
import Profile from './pages/Profile';
import './App.css';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <CoursesProvider>
            <AssignmentsProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/instructor" element={<ProtectedRoute allowedRole="instructor"><InstructorDashboard /></ProtectedRoute>} />
                  <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
                  <Route path="/course/:courseId" element={<ProtectedRoute allowedRole="student"><CourseContent /></ProtectedRoute>} />
                  <Route path="/content-creator" element={<ProtectedRoute allowedRole="content-creator"><ContentCreatorDashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </AssignmentsProvider>
          </CoursesProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Home.css';

const stats = [
  { icon: '🎓', value: '12,000+', label: 'Students' },
  { icon: '📚', value: '300+', label: 'Courses' },
  { icon: '👨‍🏫', value: '80+', label: 'Instructors' },
  { icon: '⭐', value: '4.8', label: 'Avg Rating' },
];

const features = [
  { icon: '🎯', title: 'Interactive Courses', desc: 'Engaging modules, quizzes, and assignments.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Real-time dashboards to monitor your growth.' },
  { icon: '🔐', title: 'Role-based Access', desc: 'Tailored views for every type of user.' },
  { icon: '📝', title: 'Smart Assignments', desc: 'Submit, grade and track with ease.' },
  { icon: '💬', title: 'Collaboration', desc: 'Instructors and students working together.' },
  { icon: '📱', title: 'Responsive Design', desc: 'Seamless on desktop, tablet, or mobile.' },
];

const Home = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="home">
      {/* Navbar */}
      <header className="home-nav">
        <div className="home-nav-inner">
          <div className="home-nav-logo">
            <span>📚</span>
            <span className="home-nav-brand">EduLearn</span>
          </div>
          <div className="home-nav-actions">
            <button className="home-theme-btn" onClick={toggleTheme} title="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </button>
            <button className="home-login-btn" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-glow home-glow-1" />
        <div className="home-hero-glow home-glow-2" />
        <div className="home-hero-content">
          <span className="home-hero-chip">🚀 The future of learning is here</span>
          <h1 className="home-hero-title">
            Learn Smarter.<br />
            <span className="home-hero-gradient">Grow Faster.</span>
          </h1>
          <p className="home-hero-sub">
            EduLearn LMS empowers students, instructors, admins, and content creators with
            role-based dashboards, smart assignments, and real-time progress tracking.
          </p>
          <div className="home-hero-btns">
            <button className="home-btn-primary" onClick={() => navigate('/login')}>
              Get Started Free →
            </button>
            <button className="home-btn-ghost" onClick={() => navigate('/login')}>
              Explore Demo
            </button>
          </div>
          <div className="home-hero-roles">
            {['Students', 'Instructors', 'Admins', 'Content Creators'].map(r => (
              <span key={r} className="home-role-pill">{r}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="home-stats">
        <div className="home-stats-inner">
          {stats.map(s => (
            <div key={s.label} className="home-stat">
              <span className="home-stat-icon">{s.icon}</span>
              <span className="home-stat-value">{s.value}</span>
              <span className="home-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <div className="home-section-inner">
          <p className="home-section-tag">Why EduLearn?</p>
          <h2 className="home-section-title">Everything you need to learn & teach</h2>
          <div className="home-features-grid">
            {features.map(f => (
              <div key={f.title} className="home-feature-card">
                <span className="home-feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta-section">
        <div className="home-cta-inner">
          <h2>Ready to start your learning journey?</h2>
          <p>Join thousands of learners and educators on EduLearn today.</p>
          <button className="home-btn-primary large" onClick={() => navigate('/login')}>
            Create Free Account →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© {new Date().getFullYear()} EduLearn LMS • Built for smart learning</p>
      </footer>
    </div>
  );
};

export default Home;

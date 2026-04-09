import { useState, useEffect } from 'react';
import { useCourses } from '../context/CoursesContext';
import './Quiz.css';

const Quiz = ({ moduleId, studentId, onComplete, onClose }) => {
  const { courses } = useCourses();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [usingLocalData, setUsingLocalData] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [moduleId]);

  useEffect(() => {
    if (quiz?.time_limit && !result) {
      const totalSeconds = quiz.time_limit * 60;
      setTimeLeft(totalSeconds);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      // Try to find quiz in local course data first
      let foundQuiz = null;
      for (const course of courses) {
        const module = course.modules?.find(m => m.id === moduleId);
        if (module?.quiz) {
          foundQuiz = module.quiz;
          break;
        }
      }

      if (foundQuiz) {
        setQuiz(foundQuiz);
        setQuestions(foundQuiz.questions || []);
        setUsingLocalData(true);
      } else {
        setQuiz(null);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;
    
    questions.forEach(q => {
      maxScore += q.points;
      if (answers[q.id] === q.correct_answer) {
        totalScore += q.points;
      }
    });
    
    const percentage = Math.round((totalScore / maxScore) * 100);
    return { score: percentage, passed: percentage >= (quiz?.passing_score || 70) };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { score, passed } = calculateScore();
    
    try {
      // Simulate submission for local data
      const response = {
        score,
        passed,
        message: passed ? 'Great job! You passed the quiz.' : 'Keep studying and try again!'
      };
      
      setResult(response);
      if (passed && onComplete) {
        onComplete(response);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  if (loading) {
    return <div className="quiz-loading">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="quiz-error">No quiz available for this module.</div>;
  }

  if (result) {
    return (
      <div className="quiz-container">
        <div className={`quiz-result ${result.passed ? 'passed' : 'failed'}`}>
          <h2>{result.passed ? '🎉 Congratulations!' : '📚 Keep Learning'}</h2>
          <div className="result-score">
            <span className="score-value">{result.score}%</span>
            <span className="score-label">Your Score</span>
          </div>
          <p className="result-message">{result.message}</p>
          <div className="result-details">
            <p>Passing Score: {quiz.passing_score}%</p>
            <p>Questions: {questions.length}</p>
          </div>
          <div className="result-actions">
            <button className="close-btn" onClick={onClose}>
              {result.passed ? 'Continue to Next Module' : 'Review Material & Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{quiz.title}</h2>
        <div className="quiz-meta">
          {timeLeft !== null && (
            <div className={`timer ${timeLeft < 60 ? 'urgent' : ''}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
          <div className="progress-indicator">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
      </div>

      <div className="quiz-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="quiz-content">
        {currentQ && (
          <div className="question-card">
            <h3 className="question-text">
              {currentQuestion + 1}. {currentQ.question_text}
            </h3>
            
            <div className="options-list">
              {currentQ.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = answers[currentQ.id] === letter;
                
                return (
                  <label 
                    key={idx} 
                    className={`option-label ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      value={letter}
                      checked={isSelected}
                      onChange={() => handleAnswer(currentQ.id, letter)}
                    />
                    <span className="option-letter">{letter}</span>
                    <span className="option-text">{option}</span>
                  </label>
                );
              })}
            </div>

            <div className="question-points">
              Points: {currentQ.points}
            </div>
          </div>
        )}
      </div>

      <div className="quiz-navigation">
        <button 
          className="nav-btn prev"
          onClick={goToPrevious}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>

        <div className="answered-count">
          Answered: {answeredCount}/{questions.length}
        </div>

        {currentQuestion < questions.length - 1 ? (
          <button 
            className="nav-btn next"
            onClick={goToNext}
          >
            Next →
          </button>
        ) : (
          <button 
            className="submit-btn"
            onClick={handleSubmit}
            disabled={submitting || answeredCount < questions.length}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;

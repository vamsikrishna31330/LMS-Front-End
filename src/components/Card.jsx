import './Card.css';

const handleCardKeyDown = (event, onClick) => {
  if (!onClick) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick();
  }
};

const Card = ({ icon, title, description, className = '', onClick }) => (
  <div
    className={`card ${className}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={(event) => handleCardKeyDown(event, onClick)}
  >
    <div className="card-icon">{icon}</div>
    <div className="card-body">
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{description}</p>
    </div>
    {onClick && <span className="card-arrow">→</span>}
  </div>
);

export default Card;

import React from 'react';
import { Link } from 'react-router-dom';

const ChallengeCard = ({ challenge }) => {
  const { id, title, description, difficulty, status, path } = challenge;
  
  return (
    <div className="card challenge-card">
      <div className="challenge-header">
        <h3>{title}</h3>
        <div className="challenge-status">
          <span className={`status-${status}`}>
            {status === 'complete' ? '✓ Completed' : '⟳ In Progress'}
          </span>
          <span className="challenge-difficulty">
            {Array(difficulty).fill('★').join('')}
          </span>
        </div>
      </div>
      <p>{description}</p>
      <Link to={path} className="btn">
        {status === 'complete' ? 'Review Challenge' : 'Start Challenge'}
      </Link>
    </div>
  );
};

export default ChallengeCard; 
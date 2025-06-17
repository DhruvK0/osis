import React from 'react';

const Dashboard = () => {
  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const stats = [
    { label: 'Tasks Today', value: '5', icon: '📋' },
    { label: 'Completed', value: '3', icon: '✅' },
    { label: 'Pending', value: '2', icon: '⏳' },
    { label: 'Focus Time', value: '2.5h', icon: '🎯' },
  ];

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>Good day! 👋</h2>
        <div className="date-time">
          <div className="date">{currentDate}</div>
          <div className="time">{currentTime}</div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-button">
            <span>📝</span>
            Add Task
          </button>
          <button className="action-button">
            <span>📅</span>
            Schedule Event
          </button>
          <button className="action-button">
            <span>💡</span>
            Quick Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
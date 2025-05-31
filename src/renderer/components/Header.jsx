import React from 'react';

const Header = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>🤖 OSIS</h1>
          <span className="subtitle">Personal Life Assistant</span>
        </div>
        <nav className="navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header; 
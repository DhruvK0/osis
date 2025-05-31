import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default App; 
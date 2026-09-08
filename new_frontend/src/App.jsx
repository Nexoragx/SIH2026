import React, { useState, useEffect } from 'react';
import { useAuth } from './context/useAuth.js';
import Navbar from './components/Navbar.jsx';
import AuthModal from './components/AuthModal.jsx';
import AssessmentForm from './components/AssessmentForm.jsx';
import ResultModal from './components/ResultModal.jsx';
import ObserverDashboard from './components/ObserverDashboard.jsx';
import PipelineVisualizer from './components/PipelineVisualizer.jsx';

export default function App() {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState(
    user && user.role && user.role.includes('observer') ? 'observer' : 'assessment'
  );
  const [assessmentResult, setAssessmentResult] = useState(null);

  useEffect(() => {
    if (user && user.role && user.role.includes('observer')) {
      setCurrentView('observer');
    } else {
      setCurrentView('assessment');
    }
  }, [user]);

  return (
    <>
      <Navbar currentView={currentView} onToggleView={setCurrentView} />

      <main className="main-content">
        {currentView === 'observer' ? (
          <ObserverDashboard />
        ) : currentView === 'pipeline' ? (
          <PipelineVisualizer
            onNavigateToIntake={() => setCurrentView('assessment')}
            onNavigateToDashboard={() => setCurrentView('observer')}
          />
        ) : (
          <AssessmentForm onAssessmentComplete={setAssessmentResult} />
        )}
      </main>

      {/* Persistent Modals */}
      <AuthModal />
      <ResultModal result={assessmentResult} onClose={() => setAssessmentResult(null)} />
    </>
  );
}

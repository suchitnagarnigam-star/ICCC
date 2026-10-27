import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterComplaintPage } from './pages/RegisterComplaintPage';
import { TrackComplaintsPage } from './pages/TrackComplaintsPage';
import { OfficersPage } from './pages/OfficersPage';
import { AlertsPage } from './pages/AlertsPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  const handleViewComplaint = (id: string) => {
    setSelectedComplaintId(id);
    setCurrentTab('track');
  };

  const handleQuickTrack = () => {
    setCurrentTab('track');
  };

  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="main-content">
          {currentTab === 'home' && (
            <HomePage
              setCurrentTab={setCurrentTab}
              onQuickTrack={handleQuickTrack}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardPage
              onSelectComplaint={handleViewComplaint}
              onNavigateToRegistry={() => setCurrentTab('track')}
            />
          )}

          {currentTab === 'register' && (
            <RegisterComplaintPage onViewComplaint={handleViewComplaint} />
          )}

          {currentTab === 'track' && (
            <TrackComplaintsPage
              initialComplaintId={selectedComplaintId}
              onClearInitialId={() => setSelectedComplaintId(null)}
              onNavigateToLogin={() => setCurrentTab('login')}
            />
          )}

          {currentTab === 'officers' && <OfficersPage />}

          {currentTab === 'alerts' && (
            <AlertsPage
              onSelectComplaint={handleViewComplaint}
              onNavigateToLogin={() => setCurrentTab('login')}
            />
          )}

          {currentTab === 'login' && <LoginPage setCurrentTab={setCurrentTab} />}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useBreakpoint } from './hooks/useBreakpoint';
import { Sidebar } from './layout/Sidebar';
import { Topbar } from './layout/Topbar';
import { MobileHeader } from './layout/MobileHeader';
import { MobileBottomNav } from './layout/MobileBottomNav';
import { MobileNavDrawer } from './layout/MobileNavDrawer';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { RegisterComplaintPage } from './pages/RegisterComplaintPage';
import { TrackComplaintsPage } from './pages/TrackComplaintsPage';
import { OfficersPage } from './pages/OfficersPage';
import { AlertsPage } from './pages/AlertsPage';
import { LoginPage } from './pages/LoginPage';

const AppContent: React.FC = () => {
  const { isMobile } = useBreakpoint();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const handleViewComplaint = (id: string) => {
    setSelectedComplaintId(id);
    setCurrentTab('track');
  };

  const handleQuickTrack = () => {
    setCurrentTab('track');
  };

  return (
    <div className="min-h-screen bg-canvas text-on-surface flex flex-col antialiased">
      {isMobile ? (
        // Mobile App View (< 768px)
        <div className="flex flex-col min-h-screen">
          <MobileHeader
            onOpenDrawer={() => setIsDrawerOpen(true)}
            setCurrentTab={setCurrentTab}
          />

          <main className="flex-1 pb-20 overflow-y-auto">
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

          <MobileBottomNav
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />

          <MobileNavDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        </div>
      ) : (
        // Desktop & Tablet View (>= 768px)
        <div className="flex min-h-screen">
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Topbar
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              selectedZone={selectedZone}
              setSelectedZone={setSelectedZone}
            />

            <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
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
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { RegisterComplaintPage } from './pages/RegisterComplaintPage';
import { TrackComplaintsPage } from './pages/TrackComplaintsPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');

  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="main-content">
          {currentTab === 'home' && <HomePage setCurrentTab={setCurrentTab} />}
          {currentTab === 'register' && <RegisterComplaintPage />}
          {currentTab === 'track' && <TrackComplaintsPage />}
          {currentTab === 'login' && <LoginPage setCurrentTab={setCurrentTab} />}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;


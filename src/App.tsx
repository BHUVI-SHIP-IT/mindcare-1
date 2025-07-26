import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import VoiceAssistant from './components/VoiceAssistant';
import TherapistFinder from './components/TherapistFinder';
import Journal from './components/Journal';
import MoodAnalytics from './components/MoodAnalytics';
import Mindfulness from './components/Mindfulness';
import Settings from './components/Settings';
import Wellness from './components/Wellness';
import FloatingVoiceWidget from './components/FloatingVoiceWidget';
import { User, Session } from './types';
import { storage, initializeUser } from './utils/storage';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState('en');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Simulate premium loading experience
    setTimeout(() => {
      setIsLoading(false);
      
      // Check if user has completed onboarding
      const existingUser = storage.getUser();
      if (!existingUser || existingUser.name === 'User') {
        setShowOnboarding(true);
      }
    }, 2000);
    
    // Initialize user and load data
    const initialUser = initializeUser();
    setUser(initialUser);
    setLanguage(storage.getLanguage());
    setSessions(storage.getSessions());

    // Set up periodic coin updates
    const interval = setInterval(() => {
      const currentUser = storage.getUser();
      if (currentUser && user && currentUser.coins !== user.coins) {
        setUser(currentUser);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.coins]);

  const completeOnboarding = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    const updatedUser = {
      ...user!,
      name: userName.trim()
    };
    
    setUser(updatedUser);
    storage.setUser(updatedUser);
    setShowOnboarding(false);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    storage.setLanguage(newLanguage);
    if (user) {
      const updatedUser = { ...user, language: newLanguage };
      setUser(updatedUser);
      storage.setUser(updatedUser);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return user ? <Dashboard user={user} sessions={sessions} /> : null;
      case 'chatbot':
        return <Chatbot language={language} onLanguageChange={handleLanguageChange} />;
      case 'therapists':
        return <TherapistFinder />;
      case 'journal':
        return <Journal />;
      case 'mood-analytics':
        return <MoodAnalytics />;
      case 'mindfulness':
        return <Mindfulness />;
      case 'wellness':
        return <Wellness />;
      case 'settings':
        return <Settings language={language} onLanguageChange={handleLanguageChange} />;
      default:
        return user ? <Dashboard user={user} sessions={sessions} /> : null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto animate-spin">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <span className="text-3xl">🧠</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">MindCare</h2>
          <p className="text-xl text-purple-200">Initializing AI-Powered Mental Wellness...</p>
          <div className="mt-6 flex justify-center">
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="text-center z-10">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-2xl">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                <span className="text-5xl">🧠</span>
              </div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur opacity-30 animate-ping"></div>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            MindCare
          </h1>
          <p className="text-2xl text-purple-200 mb-8">AI-Powered Mental Wellness Platform</p>
          
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="w-4 h-4 bg-cyan-400 rounded-full mx-auto mb-2 animate-bounce"></div>
              <p className="text-sm text-gray-300">AI Assistant</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-purple-400 rounded-full mx-auto mb-2 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <p className="text-sm text-gray-300">Mood Analytics</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-pink-400 rounded-full mx-auto mb-2 animate-bounce" style={{animationDelay: '0.4s'}}></div>
              <p className="text-sm text-gray-300">Therapist Finder</p>
            </div>
          </div>
          
          <div className="w-80 h-3 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-sm text-gray-400 mt-4">Preparing your personalized wellness experience...</p>
        </div>
      </div>
    );
  }

  // Onboarding Modal
  if (showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 max-w-2xl w-full mx-4 relative z-10">
          <div className="text-center">
            {/* Welcome Icon */}
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <span className="text-4xl">👋</span>
            </div>

            {/* Welcome Text */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Welcome to MindCare!
            </h1>
            <p className="text-xl text-purple-200 mb-8 leading-relaxed">
              Your AI-powered mental wellness companion is ready to support your journey. 
              Let's start by getting to know you better.
            </p>

            {/* Name Input */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-white mb-4">
                What would you like us to call you?
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your preferred name..."
                className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-transparent text-gray-800 placeholder-gray-500 text-lg font-medium shadow-lg"
                onKeyPress={(e) => e.key === 'Enter' && completeOnboarding()}
                autoFocus
              />
            </div>

            {/* Continue Button */}
            <button
              onClick={completeOnboarding}
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={!userName.trim()}
            >
              Start My Wellness Journey ✨
            </button>

            {/* Features Preview */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-white font-semibold mb-2">AI Assistant</h3>
                <p className="text-purple-200 text-sm">24/7 mental health support</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Mood Analytics</h3>
                <p className="text-purple-200 text-sm">Track your emotional journey</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧘</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Mindfulness</h3>
                <p className="text-purple-200 text-sm">Meditation & breathing exercises</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-green-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        userCoins={user.coins}
      />
      <div className="flex-1 overflow-auto relative z-10">
        {renderActiveSection()}
      </div>
      <FloatingVoiceWidget />
    </div>
  );
}

export default App;
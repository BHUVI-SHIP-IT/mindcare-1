import React from 'react';
import { 
  MessageCircle, 
  Heart, 
  Users, 
  BookOpen, 
  Sparkles, 
  Settings,
  Coins,
  Home,
  Mic,
  TrendingUp
} from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userCoins: number;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, onSectionChange, userCoins }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chatbot', label: 'AI Assistant', icon: MessageCircle },
    { id: 'therapists', label: 'Find Therapist', icon: Users },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'mood-analytics', label: 'Mood Analytics', icon: TrendingUp },
    { id: 'mindfulness', label: 'Mindfulness', icon: Heart },
    { id: 'wellness', label: 'Wellness Tools', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-indigo-900 shadow-2xl border-r border-purple-500/20 backdrop-blur-xl relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/10 via-transparent to-cyan-500/10"></div>
        <div className="absolute top-1/4 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-0 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>
      
      {/* Logo */}
      <div className="p-6 border-b border-purple-500/20 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MindCare</h1>
            <p className="text-sm text-purple-300">AI Mental Wellness Platform</p>
          </div>
        </div>
      </div>

      {/* User Coins */}
      <div className="p-4 mx-4 mt-6 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl border border-yellow-400/30 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="text-sm font-medium text-white">MindCoins</span>
          </div>
          <span className="text-xl font-bold text-yellow-400">{userCoins}</span>
        </div>
        <p className="text-xs text-purple-200 mt-1">Earn coins through wellness activities</p>
      </div>

      {/* Navigation Items */}
      <nav className="mt-8 px-4 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl mb-3 transition-all duration-300 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-2xl transform scale-105 shadow-purple-500/25'
                  : 'text-purple-200 hover:bg-white/10 hover:shadow-lg hover:text-white hover:transform hover:scale-105 backdrop-blur-sm'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-purple-300 group-hover:text-white'} transition-colors`} />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center relative z-10">
        <p className="text-xs text-gray-500">
          MindCare is a wellness support tool and does not provide clinical diagnosis.
        </p>
      </div>
    </div>
  );
};

export default Navigation;
import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  BookOpen, 
  Award,
  Target,
  Clock,
  Star
} from 'lucide-react';
import { User, Session } from '../types';
import { format } from 'date-fns';

interface DashboardProps {
  user: User;
  sessions: Session[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, sessions }) => {
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled').length;

  const stats = [
    {
      label: 'Total Sessions',
      value: completedSessions,
      icon: Users,
      color: 'from-blue-400 to-blue-600'
    },
    {
      label: 'Journal Entries',
      value: 12, // Would be dynamic
      icon: BookOpen,
      color: 'from-green-400 to-green-600'
    },
    {
      label: 'Days Active',
      value: 28, // Would be calculated
      icon: Calendar,
      color: 'from-purple-400 to-purple-600'
    },
    {
      label: 'MindCoins Earned',
      value: user.coins,
      icon: Award,
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  const recentActivities = [
    { action: 'Completed mood check-in', time: '2 hours ago', coins: 5 },
    { action: 'Wrote journal entry', time: '1 day ago', coins: 10 },
    { action: 'Completed breathing exercise', time: '2 days ago', coins: 5 },
    { action: 'Booked therapy session', time: '3 days ago', coins: -50 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              Welcome back, {user.name}! ✨
            </h1>
            <p className="text-purple-100 text-lg">
              Your mental wellness journey continues. You're making amazing progress!
            </p>
          </div>
          <div className="text-right relative z-10">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <div className="text-4xl font-bold text-white drop-shadow-lg">{user.coins}</div>
              <div className="text-sm text-purple-100">MindCoins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50 hover:shadow-3xl hover:transform hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-6 h-6 text-green-500 group-hover:text-green-400 transition-colors" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-3 text-blue-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
                <div>
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <div className={`font-bold px-3 py-1 rounded-full text-sm ${activity.coins > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                  {activity.coins > 0 ? '+' : ''}{activity.coins} coins
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="w-6 h-6 mr-3 text-green-500" />
            Today's Goals
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded-full shadow-sm"></div>
                <span className="font-medium">Daily mood check</span>
              </div>
              <span className="text-sm text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">+5 coins</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-400 rounded-full"></div>
                <span className="font-medium">Write journal entry</span>
              </div>
              <span className="text-sm text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded-full">+10 coins</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-purple-400 rounded-full"></div>
                <span className="font-medium">Meditation session</span>
              </div>
              <span className="text-sm text-purple-600 font-bold bg-purple-100 px-2 py-1 rounded-full">+10 coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-purple-500" />
            Upcoming Sessions
          </h3>
          <div className="space-y-4">
            {sessions.filter(s => s.status === 'scheduled').map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all">
                <div>
                  <p className="font-medium text-gray-800">Therapy Session</p>
                  <p className="text-sm text-gray-600">{format(session.date, 'PPP')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-gray-600 bg-yellow-100 px-2 py-1 rounded-full">50 coins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
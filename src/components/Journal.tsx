import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Smile, 
  Meh, 
  Frown, 
  TrendingUp,
  Save,
  Tag
} from 'lucide-react';
import { JournalEntry } from '../types';
import { storage } from '../utils/storage';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);

  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500', value: 5 },
    { id: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-500', value: 3 },
    { id: 'sad', label: 'Sad', icon: Frown, color: 'text-red-500', value: 1 }
  ];

  const tags = [
    'Work', 'Family', 'Relationships', 'Health', 'Exercise', 
    'Sleep', 'Anxiety', 'Gratitude', 'Goals', 'Self-care'
  ];

  useEffect(() => {
    setEntries(storage.getJournalEntries());
  }, []);

  const saveEntry = () => {
    if (!currentEntry.trim() || !selectedMood) {
      alert('Please write something and select your mood');
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      userId: storage.getUser()?.id || 'user',
      date: new Date(),
      content: currentEntry,
      mood: selectedMood,
      tags: selectedTags,
      language: storage.getLanguage()
    };

    storage.addJournalEntry(entry);
    setEntries([entry, ...entries]);
    
    // Award coins
    const user = storage.getUser();
    if (user) {
      storage.updateCoins(user.coins + 10);
    }

    // Reset form
    setCurrentEntry('');
    setSelectedMood('');
    setSelectedTags([]);
    setShowNewEntry(false);
  };

  const getMoodTrend = () => {
    const last7Days = entries.slice(0, 7).reverse();
    return {
      labels: last7Days.map(entry => 
        new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })
      ),
      datasets: [
        {
          label: 'Mood Score',
          data: last7Days.map(entry => {
            const mood = moods.find(m => m.id === entry.mood);
            return mood ? mood.value : 3;
          }),
          borderColor: 'rgba(139, 92, 246, 1)',
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
            gradient.addColorStop(0.3, 'rgba(236, 72, 153, 0.6)');
            gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
            return gradient;
          },
          borderWidth: 4,
          tension: 0.5,
          pointBackgroundColor: (context: any) => {
            const value = context.parsed.y;
            if (value >= 4) return '#10B981'; // Green for happy
            if (value >= 3) return '#F59E0B'; // Yellow for okay
            return '#EF4444'; // Red for sad
          },
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointRadius: 8,
          pointHoverRadius: 12,
          pointHoverBorderWidth: 4,
          pointHoverBackgroundColor: (context: any) => {
            const value = context.parsed.y;
            if (value >= 4) return '#059669';
            if (value >= 3) return '#D97706';
            return '#DC2626';
          },
          fill: true,
          segment: {
            borderColor: (ctx: any) => {
              const value = ctx.p1.parsed.y;
              if (value >= 4) return '#10B981';
              if (value >= 3) return '#F59E0B';
              return '#EF4444';
            },
          },
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(139, 92, 246, 0.8)',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            let mood = 'Neutral';
            let emoji = '😐';
            if (value >= 4) {
              mood = 'Happy';
              emoji = '😊';
            } else if (value >= 3) {
              mood = 'Okay';
              emoji = '😐';
            } else if (value >= 1) {
              mood = 'Sad';
              emoji = '😢';
            }
            return `${emoji} ${mood}: ${value}/5`;
          },
          title: (context: any) => {
            return `${context[0].label} - Journal Entry`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          stepSize: 1,
          color: '#9CA3AF',
          font: {
            size: 12,
            weight: '500',
          },
          callback: (value: any) => {
            const labels = ['', '😢 Sad', '', '😐 Okay', '', '😊 Happy'];
            return labels[value] || value;
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 12,
      },
      line: {
        borderJoinStyle: 'round' as const,
        borderCapStyle: 'round' as const,
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
      delay: (context: any) => context.dataIndex * 100,
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <BookOpen className="w-7 h-7 mr-3 text-purple-600" />
              Personal Journal
            </h2>
            <p className="text-gray-600">Track your thoughts, feelings, and daily experiences</p>
          </div>
          <button
            onClick={() => setShowNewEntry(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Mood Trend Chart */}
      {entries.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-3xl p-8 shadow-2xl border border-purple-500/20 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              7-Day Mood Journey
            </h3>
          </div>
          <div className="h-80 w-full relative z-10">
            <Line data={getMoodTrend()} options={chartOptions} />
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">New Journal Entry</h3>
              
              {/* Mood Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">How are you feeling?</label>
                <div className="flex space-x-4">
                  {moods.map((mood) => {
                    const Icon = mood.icon;
                    return (
                      <button
                        key={mood.id}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                          selectedMood === mood.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-8 h-8 ${mood.color} mb-2`} />
                        <span className="text-sm font-medium">{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Tags (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entry Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Your thoughts</label>
                <textarea
                  value={currentEntry}
                  onChange={(e) => setCurrentEntry(e.target.value)}
                  placeholder="Write about your day, feelings, experiences..."
                  className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={saveEntry}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Entry (+10 coins)</span>
                </button>
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map((entry) => {
          const mood = moods.find(m => m.id === entry.mood);
          const MoodIcon = mood?.icon || Meh;
          
          return (
            <div key={entry.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50 hover:shadow-3xl hover:transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    mood?.id === 'happy' ? 'bg-green-100' :
                    mood?.id === 'okay' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <MoodIcon className={`w-6 h-6 ${mood?.color || 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-base font-semibold text-gray-800 capitalize">
                      Feeling {entry.mood}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <p className="text-gray-800 leading-relaxed mb-4 text-base">{entry.content}</p>
              
              {entry.tags.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full font-medium border border-purple-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No journal entries yet</h3>
          <p className="text-gray-500 mb-4">Start writing to track your mental wellness journey</p>
          <button
            onClick={() => setShowNewEntry(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Write Your First Entry
          </button>
        </div>
      )}
    </div>
  );
};

export default Journal;
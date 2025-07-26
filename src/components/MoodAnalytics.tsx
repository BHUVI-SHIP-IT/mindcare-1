import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity,
  Smile,
  Meh,
  Frown,
  Heart,
  Brain,
  Target,
  Clock,
  Filter
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { storage } from '../utils/storage';
import { JournalEntry } from '../types';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
);

const MoodAnalytics: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedMood, setSelectedMood] = useState<string>('all');

  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: '#10B981', value: 5 },
    { id: 'okay', label: 'Okay', icon: Meh, color: '#F59E0B', value: 3 },
    { id: 'sad', label: 'Sad', icon: Frown, color: '#EF4444', value: 1 }
  ];

  useEffect(() => {
    setEntries(storage.getJournalEntries());
  }, []);

  const getMoodValue = (mood: string): number => {
    const moodObj = moods.find(m => m.id === mood);
    return moodObj ? moodObj.value : 3;
  };

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
          days: 7
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          days: 30
        };
      case 'quarter':
        return {
          start: subDays(now, 90),
          end: now,
          days: 90
        };
      default:
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
          days: 7
        };
    }
  };

  const getFilteredEntries = () => {
    const { start, end } = getDateRange();
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const inRange = entryDate >= start && entryDate <= end;
      const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
      return inRange && matchesMood;
    });
  };

  const getMoodTrendData = () => {
    const filteredEntries = getFilteredEntries();
    const { days } = getDateRange();
    
    const labels = [];
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayEntries = filteredEntries.filter(entry => 
        format(new Date(entry.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      if (dayEntries.length > 0) {
        const avgMood = dayEntries.reduce((sum, entry) => sum + getMoodValue(entry.mood), 0) / dayEntries.length;
        data.push(avgMood);
      } else {
        data.push(null);
      }
      
      labels.push(format(date, timeRange === 'week' ? 'EEE' : 'MMM dd'));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Mood Score',
          data,
          borderColor: 'rgba(139, 92, 246, 1)',
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
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

  const getMoodDistributionData = () => {
    const filteredEntries = getFilteredEntries();
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood.id] = filteredEntries.filter(entry => entry.mood === mood.id).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: moods.map(mood => mood.label),
      datasets: [
        {
          data: moods.map(mood => moodCounts[mood.id]),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)', // Happy - Green
            'rgba(245, 158, 11, 0.8)', // Okay - Yellow
            'rgba(239, 68, 68, 0.8)'   // Sad - Red
          ],
          borderColor: [
            '#10B981',
            '#F59E0B', 
            '#EF4444'
          ],
          borderWidth: 3,
          hoverBackgroundColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 4,
          cutout: '60%',
        },
      ],
    };
  };

  const getWeeklyPatternData = () => {
    const filteredEntries = getFilteredEntries();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const weeklyData = weekdays.map(day => {
      const dayEntries = filteredEntries.filter(entry => {
        const entryDay = format(new Date(entry.date), 'EEEE');
        return entryDay === day;
      });
      
      if (dayEntries.length === 0) return 0;
      return dayEntries.reduce((sum, entry) => sum + getMoodValue(entry.mood), 0) / dayEntries.length;
    });

    return {
      labels: weekdays.map(day => day.slice(0, 3)),
      datasets: [
        {
          label: 'Average Mood',
          data: weeklyData,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx} = chart;
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.4)');
            return gradient;
          },
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 3,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: (context: any) => {
            const chart = context.chart;
            const {ctx} = chart;
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 1)');
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.8)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.6)');
            return gradient;
          },
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 4,
        },
      ],
    };
  };

  const getMoodInsights = () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) return null;

    const avgMood = filteredEntries.reduce((sum, entry) => sum + getMoodValue(entry.mood), 0) / filteredEntries.length;
    const mostCommonMood = moods.reduce((prev, current) => {
      const prevCount = filteredEntries.filter(e => e.mood === prev.id).length;
      const currentCount = filteredEntries.filter(e => e.mood === current.id).length;
      return currentCount > prevCount ? current : prev;
    });

    const recentEntries = filteredEntries.slice(0, 7);
    const recentAvg = recentEntries.length > 0 
      ? recentEntries.reduce((sum, entry) => sum + getMoodValue(entry.mood), 0) / recentEntries.length 
      : avgMood;

    const trend = recentAvg > avgMood ? 'improving' : recentAvg < avgMood ? 'declining' : 'stable';

    return {
      avgMood: avgMood.toFixed(1),
      mostCommonMood,
      trend,
      totalEntries: filteredEntries.length,
      streakDays: calculateStreak(filteredEntries)
    };
  };

  const calculateStreak = (entries: JournalEntry[]): number => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = subDays(today, i);
      const hasEntry = entries.some(entry => 
        format(new Date(entry.date), 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
      );
      
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const insights = getMoodInsights();

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
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
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
            if (value >= 4) mood = 'Happy 😊';
            else if (value >= 3) mood = 'Okay 😐';
            else if (value >= 1) mood = 'Sad 😢';
            return `Mood: ${mood} (${value.toFixed(1)}/5)`;
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
    },
  };

  const barChartOptions = {
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
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
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
            if (value >= 4) mood = 'Great Day! 🌟';
            else if (value >= 3) mood = 'Good Day 👍';
            else if (value >= 1) mood = 'Tough Day 💪';
            return `${context.label}: ${mood} (${value.toFixed(1)}/5)`;
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
          color: '#9CA3AF',
          font: {
            size: 12,
            weight: '500',
          },
          callback: (value: any) => {
            const labels = ['', '😢', '', '😐', '', '😊'];
            return labels[value] || value;
          },
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#374151',
          font: {
            size: 14,
            weight: '600',
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
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
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} entries (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
    elements: {
      arc: {
        borderWidth: 3,
        hoverBorderWidth: 5,
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
              <TrendingUp className="w-7 h-7 mr-3 text-blue-600" />
              Mood Analytics
            </h2>
            <p className="text-gray-600">Track your emotional patterns and wellness journey over time</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex space-x-2">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filter by mood:</span>
          </div>
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Moods</option>
            {moods.map((mood) => (
              <option key={mood.id} value={mood.id}>{mood.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                insights.trend === 'improving' ? 'bg-green-100 text-green-700' :
                insights.trend === 'declining' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {insights.trend}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{insights.avgMood}</div>
            <div className="text-gray-600 text-sm">Average Mood Score</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: insights.mostCommonMood.color }}>
                <insights.mostCommonMood.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{insights.mostCommonMood.label}</div>
            <div className="text-gray-600 text-sm">Most Common Mood</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <Target className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{insights.streakDays}</div>
            <div className="text-gray-600 text-sm">Day Streak</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">{insights.totalEntries}</div>
            <div className="text-gray-600 text-sm">Total Entries</div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Mood Trend Over Time
          </h3>
          <div className="h-64">
            <Line data={getMoodTrendData()} options={chartOptions} />
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-500" />
            Mood Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={getMoodDistributionData()} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Weekly Pattern */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-500" />
          Weekly Mood Pattern
        </h3>
        <div className="h-64">
          <Bar data={getWeeklyPatternData()} options={barChartOptions} />
        </div>
      </div>

      {/* Mood Recommendations */}
      {insights && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            Personalized Insights & Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Based on your patterns:</h4>
              <ul className="space-y-2 text-gray-700">
                {insights.trend === 'improving' && (
                  <li>• Your mood has been improving lately - keep up the great work!</li>
                )}
                {insights.trend === 'declining' && (
                  <li>• Consider reaching out to a therapist for additional support</li>
                )}
                {insights.streakDays >= 7 && (
                  <li>• Excellent consistency with journaling - you're building a healthy habit!</li>
                )}
                {insights.mostCommonMood.id === 'sad' && (
                  <li>• Try incorporating more mindfulness exercises into your routine</li>
                )}
                {insights.avgMood >= 4 && (
                  <li>• Your overall mood is positive - continue your current wellness practices</li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Suggested actions:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Practice daily breathing exercises</li>
                <li>• Maintain regular sleep schedule</li>
                <li>• Connect with friends and family</li>
                <li>• Consider professional support if needed</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {entries.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No mood data available</h3>
          <p className="text-gray-500 mb-4">Start journaling to see your mood analytics</p>
          <button
            onClick={() => window.location.hash = '#journal'}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Start Journaling
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodAnalytics;
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Target, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw,
  X,
  Zap,
  Heart,
  Brain,
  Dumbbell,
  Flame,
  Trophy,
  Star,
  CheckCircle,
  Circle,
  TrendingUp,
  Calendar,
  Award,
  Users,
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Settings,
  Plus,
  Minus,
  BarChart3,
  Clock,
  MapPin,
  Wind,
  Sun,
  Moon,
  Droplets,
  Leaf,
  Mountain,
  Waves
} from 'lucide-react';
import { storage } from '../utils/storage';

interface Exercise {
  id: string;
  name: string;
  duration: number;
  calories: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Cardio' | 'Strength' | 'Flexibility' | 'Mindfulness' | 'HIIT';
  description: string;
  instructions: string[];
  benefits: string[];
  icon: any;
  color: string;
}

interface WorkoutSession {
  id: string;
  exerciseId: string;
  duration: number;
  caloriesBurned: number;
  date: Date;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: 'exercise' | 'mindfulness' | 'sleep' | 'water' | 'steps';
  deadline: Date;
  icon: any;
  color: string;
}

const Wellness: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'exercises' | 'goals' | 'tracker' | 'challenges'>('exercises');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isExercising, setIsExercising] = useState(false);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dailyStats, setDailyStats] = useState({
    steps: 0,
    calories: 0,
    activeMinutes: 0,
    water: 0,
    sleep: 0
  });
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const exercises: Exercise[] = [
    {
      id: '1',
      name: '7-Minute HIIT Workout',
      duration: 7,
      calories: 80,
      difficulty: 'Intermediate',
      category: 'HIIT',
      description: 'High-intensity interval training for maximum calorie burn',
      instructions: [
        'Perform each exercise for 30 seconds',
        'Rest for 10 seconds between exercises',
        'Complete all 12 exercises for one round',
        'Focus on proper form over speed'
      ],
      benefits: ['Burns calories quickly', 'Improves cardiovascular health', 'Boosts metabolism'],
      icon: Zap,
      color: 'from-red-400 to-orange-500'
    },
    {
      id: '2',
      name: 'Morning Yoga Flow',
      duration: 15,
      calories: 45,
      difficulty: 'Beginner',
      category: 'Flexibility',
      description: 'Gentle yoga sequence to start your day with energy',
      instructions: [
        'Find a quiet, comfortable space',
        'Use a yoga mat if available',
        'Move slowly and breathe deeply',
        'Hold each pose for 30-60 seconds'
      ],
      benefits: ['Increases flexibility', 'Reduces stress', 'Improves posture'],
      icon: Leaf,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: '3',
      name: 'Strength Training Circuit',
      duration: 20,
      calories: 120,
      difficulty: 'Advanced',
      category: 'Strength',
      description: 'Full-body strength workout using bodyweight exercises',
      instructions: [
        'Warm up for 2-3 minutes',
        'Perform 3 sets of each exercise',
        '12-15 reps per exercise',
        'Rest 60 seconds between sets'
      ],
      benefits: ['Builds muscle strength', 'Improves bone density', 'Boosts metabolism'],
      icon: Dumbbell,
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: '4',
      name: 'Cardio Dance Party',
      duration: 12,
      calories: 95,
      difficulty: 'Beginner',
      category: 'Cardio',
      description: 'Fun dance workout to your favorite music',
      instructions: [
        'Put on your favorite upbeat music',
        'Start with simple movements',
        'Gradually increase intensity',
        'Have fun and express yourself!'
      ],
      benefits: ['Improves cardiovascular health', 'Boosts mood', 'Burns calories'],
      icon: Heart,
      color: 'from-pink-400 to-rose-500'
    },
    {
      id: '5',
      name: 'Mindful Meditation',
      duration: 10,
      calories: 15,
      difficulty: 'Beginner',
      category: 'Mindfulness',
      description: 'Guided meditation for mental clarity and peace',
      instructions: [
        'Sit comfortably with eyes closed',
        'Focus on your breath',
        'Notice thoughts without judgment',
        'Return attention to breathing'
      ],
      benefits: ['Reduces stress', 'Improves focus', 'Enhances emotional well-being'],
      icon: Brain,
      color: 'from-purple-400 to-indigo-500'
    },
    {
      id: '6',
      name: 'Core Blast Workout',
      duration: 8,
      calories: 60,
      difficulty: 'Intermediate',
      category: 'Strength',
      description: 'Targeted core strengthening exercises',
      instructions: [
        'Lie on your back on a mat',
        'Engage your core throughout',
        'Perform each exercise slowly',
        'Breathe steadily during movements'
      ],
      benefits: ['Strengthens core muscles', 'Improves posture', 'Reduces back pain'],
      icon: Target,
      color: 'from-cyan-400 to-blue-500'
    }
  ];

  const defaultGoals: Goal[] = [
    {
      id: '1',
      title: 'Daily Steps',
      target: 10000,
      current: 0,
      unit: 'steps',
      category: 'steps',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      icon: Activity,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: '2',
      title: 'Exercise Minutes',
      target: 30,
      current: 0,
      unit: 'minutes',
      category: 'exercise',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      icon: Timer,
      color: 'from-blue-400 to-purple-500'
    },
    {
      id: '3',
      title: 'Water Intake',
      target: 8,
      current: 0,
      unit: 'glasses',
      category: 'water',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      icon: Droplets,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      id: '4',
      title: 'Sleep Hours',
      target: 8,
      current: 0,
      unit: 'hours',
      category: 'sleep',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      icon: Moon,
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  const challenges = [
    {
      id: '1',
      title: '30-Day Fitness Challenge',
      description: 'Complete 30 minutes of exercise daily for 30 days',
      progress: 12,
      total: 30,
      reward: 500,
      icon: Trophy,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: '2',
      title: 'Mindfulness Master',
      description: 'Practice meditation for 7 consecutive days',
      progress: 4,
      total: 7,
      reward: 200,
      icon: Brain,
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: '3',
      title: 'Hydration Hero',
      description: 'Drink 8 glasses of water daily for 14 days',
      progress: 8,
      total: 14,
      reward: 300,
      icon: Droplets,
      color: 'from-cyan-400 to-blue-500'
    }
  ];

  useEffect(() => {
    // Initialize goals if not set
    if (goals.length === 0) {
      setGoals(defaultGoals);
    }

    // Load workout sessions from storage
    const sessions = JSON.parse(localStorage.getItem('workoutSessions') || '[]');
    setWorkoutSessions(sessions);

    // Simulate daily stats updates
    const interval = setInterval(() => {
      setDailyStats(prev => ({
        ...prev,
        steps: prev.steps + Math.floor(Math.random() * 50),
        calories: prev.calories + Math.floor(Math.random() * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isExercising && selectedExercise) {
      interval = setInterval(() => {
        setExerciseTimer(prev => {
          if (prev >= selectedExercise.duration * 60) {
            completeExercise();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isExercising, selectedExercise]);

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsExercising(true);
    setExerciseTimer(0);
    
    if (soundEnabled) {
      // Play start sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {});
    }
  };

  const pauseExercise = () => {
    setIsExercising(false);
  };

  const resumeExercise = () => {
    setIsExercising(true);
  };

  const stopExercise = () => {
    setIsExercising(false);
    setExerciseTimer(0);
    setSelectedExercise(null);
  };

  const completeExercise = () => {
    if (!selectedExercise) return;

    const session: WorkoutSession = {
      id: Date.now().toString(),
      exerciseId: selectedExercise.id,
      duration: selectedExercise.duration,
      caloriesBurned: selectedExercise.calories,
      date: new Date(),
      completed: true
    };

    const updatedSessions = [...workoutSessions, session];
    setWorkoutSessions(updatedSessions);
    localStorage.setItem('workoutSessions', JSON.stringify(updatedSessions));

    // Update daily stats
    setDailyStats(prev => ({
      ...prev,
      activeMinutes: prev.activeMinutes + selectedExercise.duration,
      calories: prev.calories + selectedExercise.calories
    }));

    // Update goals
    updateGoalProgress('exercise', selectedExercise.duration);

    // Award coins
    const user = storage.getUser();
    if (user) {
      storage.updateCoins(user.coins + selectedExercise.duration * 2);
    }

    setIsExercising(false);
    setExerciseTimer(0);
    setSelectedExercise(null);

    if (soundEnabled) {
      // Play completion sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {});
    }
  };

  const updateGoalProgress = (category: string, amount: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.category === category as Goal['category']) {
        return { ...goal, current: Math.min(goal.current + amount, goal.target) };
      }
      return goal;
    }));
  };

  const updateDailyStat = (stat: keyof typeof dailyStats, amount: number) => {
    setDailyStats(prev => ({
      ...prev,
      [stat]: prev[stat] + amount
    }));

    // Update corresponding goal
    if (stat === 'water') updateGoalProgress('water', amount);
    if (stat === 'sleep') updateGoalProgress('sleep', amount);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilteredExercises = () => {
    if (selectedCategory === 'All') return exercises;
    return exercises.filter(exercise => exercise.category === selectedCategory);
  };

  const categories = ['All', 'HIIT', 'Cardio', 'Strength', 'Flexibility', 'Mindfulness'];

  const renderExercises = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-full transition-all font-medium ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-white/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredExercises().map(exercise => {
          const Icon = exercise.icon;
          return (
            <div
              key={exercise.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${exercise.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">{exercise.duration} min</div>
                  <div className="text-xs text-gray-500">{exercise.calories} cal</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{exercise.name}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{exercise.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  exercise.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                  exercise.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {exercise.difficulty}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {exercise.category}
                </span>
              </div>
              
              <button
                onClick={() => startExercise(exercise)}
                className={`w-full bg-gradient-to-r ${exercise.color} text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2 group-hover:scale-105`}
              >
                <Play className="w-5 h-5" />
                <span>Start Exercise</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const Icon = goal.icon;
          const progress = (goal.current / goal.target) * 100;
          
          return (
            <div
              key={goal.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{goal.current}</div>
                  <div className="text-sm text-gray-600">of {goal.target} {goal.unit}</div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{goal.title}</h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${goal.color} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              
              {goal.category === 'water' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateDailyStat('water', 1)}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    +1 Glass
                  </button>
                </div>
              )}
              
              {goal.category === 'sleep' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateDailyStat('sleep', 1)}
                    className="flex-1 bg-gradient-to-r from-indigo-400 to-purple-500 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    +1 Hour
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTracker = () => (
    <div className="space-y-6">
      {/* Daily Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 text-center">
          <Activity className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-800">{dailyStats.steps.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Steps</div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 text-center">
          <Flame className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-800">{dailyStats.calories}</div>
          <div className="text-sm text-gray-600">Calories</div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 text-center">
          <Timer className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-800">{dailyStats.activeMinutes}</div>
          <div className="text-sm text-gray-600">Active Min</div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 text-center">
          <Droplets className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-800">{dailyStats.water}</div>
          <div className="text-sm text-gray-600">Glasses</div>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-purple-500" />
          Recent Workouts
        </h3>
        
        {workoutSessions.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No workouts completed yet</p>
            <p className="text-sm text-gray-500">Start exercising to see your progress here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutSessions.slice(-5).reverse().map(session => {
              const exercise = exercises.find(e => e.id === session.exerciseId);
              if (!exercise) return null;
              
              return (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${exercise.color} rounded-lg flex items-center justify-center`}>
                      {React.createElement(exercise.icon, { className: "w-5 h-5 text-white" })}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{exercise.name}</div>
                      <div className="text-sm text-gray-600">
                        {session.duration} min • {session.caloriesBurned} cal
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map(challenge => {
          const Icon = challenge.icon;
          const progress = (challenge.progress / challenge.total) * 100;
          
          return (
            <div
              key={challenge.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${challenge.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-yellow-600 flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    {challenge.reward} coins
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">{challenge.title}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{challenge.description}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{challenge.progress}/{challenge.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${challenge.color} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              
              {progress >= 100 ? (
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Completed!</span>
                </button>
              ) : (
                <div className="text-center text-sm text-gray-600">
                  {Math.round(progress)}% Complete
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                Wellness Center
              </h1>
              <p className="text-xl text-purple-200">Your complete fitness and wellness companion</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-sm"
              >
                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'exercises', label: 'Exercises', icon: Dumbbell },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'tracker', label: 'Tracker', icon: BarChart3 },
            { id: 'challenges', label: 'Challenges', icon: Trophy }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all font-semibold ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-2xl transform scale-105 shadow-purple-500/25'
                    : 'bg-white/10 backdrop-blur-sm text-purple-200 hover:bg-white/20 hover:text-white border border-white/20'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeTab === 'exercises' && renderExercises()}
          {activeTab === 'goals' && renderGoals()}
          {activeTab === 'tracker' && renderTracker()}
          {activeTab === 'challenges' && renderChallenges()}
        </div>

        {/* Exercise Modal */}
        {selectedExercise && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${selectedExercise.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      {React.createElement(selectedExercise.icon, { className: "w-8 h-8 text-white" })}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedExercise.name}</h2>
                      <p className="text-gray-600">{selectedExercise.duration} minutes • {selectedExercise.calories} calories</p>
                    </div>
                  </div>
                  <button
                    onClick={stopExercise}
                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Timer */}
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-gray-800 mb-4">
                    {formatTime(exerciseTimer)}
                  </div>
                  <div className="text-lg text-gray-600 mb-6">
                    {formatTime(selectedExercise.duration * 60 - exerciseTimer)} remaining
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${selectedExercise.color} transition-all duration-1000 rounded-full`}
                      style={{ width: `${(exerciseTimer / (selectedExercise.duration * 60)) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-center space-x-4">
                    {!isExercising ? (
                      <button
                        onClick={resumeExercise}
                        className={`bg-gradient-to-r ${selectedExercise.color} text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center space-x-3 text-lg`}
                      >
                        <Play className="w-6 h-6" />
                        <span>Resume</span>
                      </button>
                    ) : (
                      <button
                        onClick={pauseExercise}
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center space-x-3 text-lg"
                      >
                        <Pause className="w-6 h-6" />
                        <span>Pause</span>
                      </button>
                    )}
                    
                    <button
                      onClick={stopExercise}
                      className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center space-x-3 text-lg"
                    >
                      <X className="w-6 h-6" />
                      <span>Stop</span>
                    </button>
                  </div>
                </div>

                {/* Exercise Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
                    <ul className="space-y-2">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-2 text-gray-700">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Benefits</h3>
                    <ul className="space-y-2">
                      {selectedExercise.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wellness;
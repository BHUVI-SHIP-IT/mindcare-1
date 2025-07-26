import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Play, 
  Pause, 
  RotateCcw, 
  Quote, 
  Moon, 
  Sun,
  Timer,
  Volume2,
  VolumeX,
  Wind,
  Leaf,
  Mountain,
  Waves,
  Star,
  Sparkles,
  Brain,
  Target,
  Award,
  CheckCircle,
  Circle,
  Zap,
  CloudRain,
  Sunrise,
  Sunset
} from 'lucide-react';

const Mindfulness: React.FC = () => {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [meditationTimer, setMeditationTimer] = useState(5 * 60); // 5 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAmbient, setSelectedAmbient] = useState('nature');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const quotes = [
    { text: "Peace comes from within. Do not seek it without.", author: "Buddha", category: "wisdom" },
    { text: "The present moment is the only time over which we have dominion.", author: "Thich Nhat Hanh", category: "presence" },
    { text: "Wherever you are, be there totally.", author: "Eckhart Tolle", category: "mindfulness" },
    { text: "Breathe in peace, breathe out stress.", author: "Anonymous", category: "breathing" },
    { text: "You are exactly where you need to be right now.", author: "Anonymous", category: "acceptance" },
    { text: "Progress, not perfection, is the goal.", author: "Anonymous", category: "growth" },
    { text: "Every moment is a fresh beginning.", author: "T.S. Eliot", category: "renewal" },
    { text: "Be kind to yourself. You're doing the best you can.", author: "Anonymous", category: "self-compassion" },
    { text: "The mind is everything. What you think you become.", author: "Buddha", category: "mindset" },
    { text: "In the midst of winter, I found there was, within me, an invincible summer.", author: "Albert Camus", category: "resilience" }
  ];

  const ambientSounds = [
    { 
      id: 'nature', 
      name: 'Forest Sounds', 
      icon: Leaf, 
      color: 'from-green-400 to-emerald-500', 
      description: 'Gentle forest ambiance',
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder - replace with actual forest sounds
    },
    { 
      id: 'ocean', 
      name: 'Ocean Waves', 
      icon: Waves, 
      color: 'from-blue-400 to-cyan-500', 
      description: 'Calming ocean sounds',
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder - replace with actual ocean sounds
    },
    { 
      id: 'rain', 
      name: 'Gentle Rain', 
      icon: CloudRain, 
      color: 'from-gray-400 to-blue-500', 
      description: 'Peaceful rainfall',
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder - replace with actual rain sounds
    },
    { 
      id: 'mountain', 
      name: 'Mountain Wind', 
      icon: Mountain, 
      color: 'from-purple-400 to-indigo-500', 
      description: 'Serene mountain breeze',
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Placeholder - replace with actual wind sounds
    }
  ];

  const breathingTechniques = [
    { 
      id: '478', 
      name: '4-7-8 Breathing', 
      description: 'Inhale 4, Hold 7, Exhale 8', 
      icon: Wind,
      color: 'from-blue-400 to-purple-500',
      inhale: 4, hold: 7, exhale: 8,
      benefits: ['Reduces anxiety', 'Improves sleep', 'Calms nervous system']
    },
    { 
      id: 'box', 
      name: 'Box Breathing', 
      description: 'Equal counts for all phases', 
      icon: Target,
      color: 'from-green-400 to-teal-500',
      inhale: 4, hold: 4, exhale: 4,
      benefits: ['Enhances focus', 'Reduces stress', 'Improves concentration']
    },
    { 
      id: 'triangle', 
      name: 'Triangle Breathing', 
      description: 'Simple 3-phase breathing', 
      icon: Mountain,
      color: 'from-orange-400 to-red-500',
      inhale: 4, hold: 0, exhale: 4,
      benefits: ['Quick relaxation', 'Easy to learn', 'Instant calm']
    }
  ];

  const meditationTypes = [
    { 
      id: 'mindfulness', 
      name: 'Mindfulness', 
      icon: Brain, 
      color: 'from-purple-400 to-pink-500',
      description: 'Present moment awareness'
    },
    { 
      id: 'loving-kindness', 
      name: 'Loving Kindness', 
      icon: Heart, 
      color: 'from-pink-400 to-rose-500',
      description: 'Cultivate compassion'
    },
    { 
      id: 'body-scan', 
      name: 'Body Scan', 
      icon: Sparkles, 
      color: 'from-cyan-400 to-blue-500',
      description: 'Progressive relaxation'
    },
    { 
      id: 'visualization', 
      name: 'Visualization', 
      icon: Star, 
      color: 'from-yellow-400 to-orange-500',
      description: 'Guided imagery'
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [selectedTechnique, setSelectedTechnique] = useState(breathingTechniques[0]);
  const [selectedMeditationType, setSelectedMeditationType] = useState(meditationTypes[0]);

  // Ambient sound management
  const playAmbientSound = async (soundId: string) => {
    try {
      // Stop current ambient sound
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.currentTime = 0;
      }

      // Find the selected sound
      const sound = ambientSounds.find(s => s.id === soundId);
      if (!sound || !soundEnabled) return;

      // Create new audio element
      const audio = new Audio(sound.audioUrl);
      audio.loop = true;
      audio.volume = ambientVolume;
      
      // Set up event listeners
      audio.addEventListener('loadstart', () => {
        console.log(`Loading ${sound.name}...`);
      });
      
      audio.addEventListener('canplay', () => {
        console.log(`${sound.name} ready to play`);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Error loading ${sound.name}:`, e);
        setAmbientPlaying(false);
      });

      // Store reference and play
      ambientAudioRef.current = audio;
      await audio.play();
      setAmbientPlaying(true);
      
    } catch (error) {
      console.error('Error playing ambient sound:', error);
      setAmbientPlaying(false);
      
      // Fallback: Create a simple tone generator for demo purposes
      if (soundEnabled) {
        createSyntheticAmbientSound(soundId);
      }
    }
  };

  const stopAmbientSound = () => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
      ambientAudioRef.current = null;
    }
    setAmbientPlaying(false);
  };

  const createSyntheticAmbientSound = (soundId: string) => {
    // Create a simple synthetic ambient sound using Web Audio API as fallback
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Different frequencies for different ambient sounds
      const frequencies = {
        nature: 200,
        ocean: 150,
        rain: 300,
        mountain: 100
      };
      
      oscillator.frequency.setValueAtTime(frequencies[soundId as keyof typeof frequencies] || 200, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(ambientVolume * 0.1, audioContext.currentTime); // Very low volume
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      setAmbientPlaying(true);
      
      // Store cleanup function
      const cleanup = () => {
        oscillator.stop();
        audioContext.close();
        setAmbientPlaying(false);
      };
      
      // Auto-stop after 30 seconds for demo
      setTimeout(cleanup, 30000);
      
    } catch (error) {
      console.error('Error creating synthetic ambient sound:', error);
    }
  };

  const toggleAmbientSound = () => {
    if (ambientPlaying) {
      stopAmbientSound();
    } else {
      playAmbientSound(selectedAmbient);
    }
  };

  const changeAmbientVolume = (volume: number) => {
    setAmbientVolume(volume);
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = volume;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingCount(prev => {
          const technique = selectedTechnique;
          const totalCycle = technique.inhale + technique.hold + technique.exhale;
          const newCount = (prev + 1) % totalCycle;
          
          if (newCount < technique.inhale) {
            setBreathingPhase('inhale');
          } else if (newCount < technique.inhale + technique.hold) {
            setBreathingPhase('hold');
          } else {
            setBreathingPhase('exhale');
          }
          
          return newCount;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [breathingActive, selectedTechnique]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && meditationTimer > 0) {
      interval = setInterval(() => {
        setMeditationTimer(prev => prev - 1);
      }, 1000);
    } else if (meditationTimer === 0 && timerActive) {
      setTimerActive(false);
      setCompletedSessions(prev => prev + 1);
      setCurrentStreak(prev => prev + 1);
      
      if (soundEnabled) {
        // Play completion sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.play().catch(() => {});
      }
    }

    return () => clearInterval(interval);
  }, [timerActive, meditationTimer, soundEnabled]);

  // Handle ambient sound changes
  useEffect(() => {
    if (ambientPlaying && soundEnabled) {
      playAmbientSound(selectedAmbient);
    } else if (!soundEnabled) {
      stopAmbientSound();
    }
  }, [selectedAmbient, soundEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingCount(0);
    setBreathingPhase('inhale');
  };

  const stopBreathing = () => {
    setBreathingActive(false);
    setBreathingCount(0);
    setBreathingPhase('inhale');
  };

  const startMeditation = (duration: number) => {
    setSelectedDuration(duration);
    setMeditationTimer(duration * 60);
    setTimerActive(true);
  };

  const stopMeditation = () => {
    setTimerActive(false);
  };

  const resetMeditation = () => {
    setMeditationTimer(selectedDuration * 60);
    setTimerActive(false);
  };

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingInstruction = () => {
    const technique = selectedTechnique;
    const currentInCycle = breathingCount % (technique.inhale + technique.hold + technique.exhale);
    
    if (currentInCycle < technique.inhale) {
      const remaining = technique.inhale - currentInCycle;
      return { text: 'Breathe In', count: remaining, phase: 'inhale' };
    } else if (currentInCycle < technique.inhale + technique.hold) {
      const remaining = technique.hold - (currentInCycle - technique.inhale);
      return { text: 'Hold', count: remaining, phase: 'hold' };
    } else {
      const remaining = technique.exhale - (currentInCycle - technique.inhale - technique.hold);
      return { text: 'Breathe Out', count: remaining, phase: 'exhale' };
    }
  };

  const getBreathingCircleSize = () => {
    const instruction = getBreathingInstruction();
    switch (instruction.phase) {
      case 'inhale':
        return 'scale-150 shadow-2xl';
      case 'hold':
        return 'scale-150 shadow-2xl';
      case 'exhale':
        return 'scale-75 shadow-lg';
      default:
        return 'scale-100 shadow-xl';
    }
  };

  const instruction = breathingActive ? getBreathingInstruction() : { text: 'Ready to Begin', count: 0, phase: 'ready' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                Mindfulness Sanctuary
              </h1>
              <p className="text-xl text-purple-200">Find your inner peace and cultivate mindful awareness</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{completedSessions}</div>
                <div className="text-sm text-purple-200">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">{currentStreak}</div>
                <div className="text-sm text-purple-200">Day Streak</div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-sm"
              >
                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Daily Inspiration */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Quote className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Daily Inspiration</h3>
            </div>
            <button
              onClick={getRandomQuote}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              New Quote
            </button>
          </div>
          
          <div className="text-center">
            <blockquote className="text-2xl text-white font-medium leading-relaxed mb-4 italic">
              "{currentQuote.text}"
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <cite className="text-lg text-purple-200 font-semibold">— {currentQuote.author}</cite>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-purple-200 rounded-full text-sm font-medium">
                {currentQuote.category}
              </span>
            </div>
          </div>
        </div>

        {/* Breathing Exercise */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-6 flex items-center justify-center">
              <Wind className="w-8 h-8 mr-3 text-cyan-400" />
              Breathing Techniques
            </h3>
            
            {/* Technique Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
              {breathingTechniques.map((technique) => {
                const Icon = technique.icon;
                return (
                  <button
                    key={technique.id}
                    onClick={() => setSelectedTechnique(technique)}
                    className={`flex flex-col items-center space-y-3 px-6 py-6 rounded-2xl transition-all font-semibold ${
                      selectedTechnique.id === technique.id
                        ? `bg-gradient-to-r ${technique.color} text-white shadow-2xl transform scale-105`
                        : 'bg-white/10 backdrop-blur-sm text-purple-200 hover:bg-white/20 hover:text-white border border-white/20'
                    }`}
                  >
                    <Icon className="w-8 h-8" />
                    <div className="text-center">
                      <div className="font-bold text-lg">{technique.name}</div>
                      <div className="text-sm opacity-80 mt-1">{technique.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Breathing Circle */}
            <div className="flex justify-center items-center mb-12 mt-12">
              <div 
                className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${selectedTechnique.color} flex items-center justify-center transition-all duration-1000 ease-in-out ${getBreathingCircleSize()} shadow-2xl mx-auto`}
              >
                <div className="text-white text-center">
                  <div className="text-xl font-bold mb-2">{instruction.text}</div>
                  {breathingActive && (
                    <div className="text-4xl font-bold opacity-90">
                      {instruction.count}
                    </div>
                  )}
                  {!breathingActive && (
                    <div className="text-sm opacity-80">
                      {selectedTechnique.description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breathing Controls */}
            <div className="flex justify-center space-x-6 mb-10 mt-12">
              {!breathingActive ? (
                <button
                  onClick={startBreathing}
                  className={`bg-gradient-to-r ${selectedTechnique.color} text-white px-12 py-5 rounded-2xl hover:shadow-2xl transition-all flex items-center space-x-3 text-xl font-semibold transform hover:scale-105`}
                >
                  <Play className="w-7 h-7" />
                  <span>Start Breathing</span>
                </button>
              ) : (
                <button
                  onClick={stopBreathing}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-12 py-5 rounded-2xl hover:shadow-2xl transition-all flex items-center space-x-3 text-xl font-semibold transform hover:scale-105"
                >
                  <Pause className="w-7 h-7" />
                  <span>Stop</span>
                </button>
              )}
            </div>

            {/* Benefits */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-3xl mx-auto mt-8">
              <h4 className="text-xl font-semibold text-white mb-6 text-center">Benefits of {selectedTechnique.name}:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedTechnique.benefits.map((benefit, index) => (
                  <div key={index} className="px-6 py-4 bg-white/10 backdrop-blur-sm text-purple-200 rounded-xl text-center font-medium border border-white/20 hover:bg-white/20 transition-all">
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Meditation Timer */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center">
              <Timer className="w-8 h-8 mr-3 text-green-400" />
              Meditation Timer
            </h3>
            
            {/* Meditation Type Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {meditationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedMeditationType(type)}
                    className={`p-8 rounded-2xl transition-all ${
                      selectedMeditationType.id === type.id
                        ? `bg-gradient-to-br ${type.color} text-white shadow-2xl transform scale-105`
                        : 'bg-white/10 backdrop-blur-sm text-purple-200 hover:bg-white/20 hover:text-white border border-white/20'
                    }`}
                  >
                    <Icon className="w-10 h-10 mx-auto mb-4" />
                    <div className="font-bold text-lg">{type.name}</div>
                    <div className="text-sm opacity-80 mt-2">{type.description}</div>
                  </button>
                );
              })}
            </div>
            
            {/* Timer Display */}
            <div className="mb-10">
              <div className="text-9xl font-bold text-white mb-6 font-mono tracking-wider">
                {formatTime(meditationTimer)}
              </div>
              {timerActive && (
                <div className="flex items-center justify-center space-x-3 text-green-400 font-medium text-xl">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Meditation in progress...</span>
                </div>
              )}
              {!timerActive && (
                <div className="text-purple-200 text-xl">
                  {selectedMeditationType.name} • Ready to begin
                </div>
              )}
            </div>

            {/* Duration Selection */}
            {!timerActive && (
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {[5, 10, 15, 20, 30].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setMeditationTimer(duration * 60)}
                    className={`px-8 py-4 rounded-xl transition-all font-semibold text-lg ${
                      meditationTimer === duration * 60
                        ? `bg-gradient-to-r ${selectedMeditationType.color} text-white shadow-lg transform scale-105`
                        : 'bg-white/10 backdrop-blur-sm text-purple-200 hover:bg-white/20 hover:text-white border border-white/20'
                    }`}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
            )}

            {/* Timer Controls */}
            <div className="flex justify-center space-x-6">
              {!timerActive ? (
                <button
                  onClick={() => startMeditation(Math.floor(meditationTimer / 60))}
                  className={`bg-gradient-to-r ${selectedMeditationType.color} text-white px-12 py-5 rounded-2xl hover:shadow-2xl transition-all flex items-center space-x-3 text-xl font-semibold transform hover:scale-105`}
                >
                  <Play className="w-7 h-7" />
                  <span>Start Meditation</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={stopMeditation}
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl transition-all flex items-center space-x-3 text-lg font-semibold transform hover:scale-105"
                  >
                    <Pause className="w-6 h-6" />
                    <span>Pause</span>
                  </button>
                  <button
                    onClick={resetMeditation}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl transition-all flex items-center space-x-3 text-lg font-semibold transform hover:scale-105"
                  >
                    <RotateCcw className="w-6 h-6" />
                    <span>Reset</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ambient Sounds */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-white flex items-center">
              <Waves className="w-7 h-7 mr-3 text-blue-400" />
              Ambient Sounds
            </h3>
            
            <div className="flex items-center space-x-4">
              {/* Volume Control */}
              <div className="flex items-center space-x-3">
                <VolumeX className="w-5 h-5 text-purple-200" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={ambientVolume}
                  onChange={(e) => changeAmbientVolume(parseFloat(e.target.value))}
                  className="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <Volume2 className="w-5 h-5 text-purple-200" />
              </div>
              
              {/* Play/Stop Button */}
              <button
                onClick={toggleAmbientSound}
                disabled={!soundEnabled}
                className={`px-6 py-3 rounded-xl transition-all font-semibold flex items-center space-x-2 ${
                  ambientPlaying
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {ambientPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Play</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {ambientSounds.map((sound) => {
              const Icon = sound.icon;
              return (
                <button
                  key={sound.id}
                  onClick={() => setSelectedAmbient(sound.id)}
                  className={`p-8 rounded-2xl transition-all group ${
                    selectedAmbient === sound.id
                      ? `bg-gradient-to-br ${sound.color} text-white shadow-2xl transform scale-105`
                      : 'bg-white/10 backdrop-blur-sm text-purple-200 hover:bg-white/20 hover:text-white border border-white/20 hover:transform hover:scale-105'
                  }`}
                >
                  {/* Playing Indicator */}
                  {selectedAmbient === sound.id && ambientPlaying && (
                    <div className="absolute top-3 right-3">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                  
                  <Icon className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-xl mb-3">{sound.name}</div>
                  <div className="text-sm opacity-80 leading-relaxed">{sound.description}</div>
                </button>
              );
            })}
          </div>
          
          {/* Status Display */}
          <div className="mt-8 text-center">
            {ambientPlaying ? (
              <div className="flex items-center justify-center space-x-3 text-green-400 font-medium text-lg">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                <span>Playing: {ambientSounds.find(s => s.id === selectedAmbient)?.name}</span>
              </div>
            ) : (
              <div className="text-purple-200 font-medium">
                {soundEnabled ? 'Select an ambient sound and click Play' : 'Enable sound to play ambient sounds'}
              </div>
            )}
          </div>
        </div>

        {/* Wellness Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl rounded-3xl p-8 border border-orange-400/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sunrise className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Morning Ritual</h3>
            </div>
            <ul className="space-y-5 text-purple-100 text-lg">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <span>Start with 5 minutes of gratitude meditation</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <span>Practice mindful breathing while drinking water</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <span>Set three positive intentions for the day</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <span>Gentle stretching with mindful awareness</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-8 border border-indigo-400/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sunset className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Evening Wind-Down</h3>
            </div>
            <ul className="space-y-5 text-purple-100 text-lg">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <span>Reflect on three highlights from your day</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <span>Practice progressive muscle relaxation</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <span>Digital sunset - limit screen time</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <span>Guided sleep meditation or gentle music</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center">
            <Award className="w-7 h-7 mr-3 text-yellow-400" />
            Mindfulness Achievements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl p-8 border border-yellow-400/30 text-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-3">{completedSessions}</div>
                <div className="text-yellow-200 font-medium text-lg">Sessions Completed</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-2xl p-8 border border-green-400/30 text-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-3">{currentStreak}</div>
                <div className="text-green-200 font-medium text-lg">Day Streak</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-2xl p-8 border border-purple-400/30 text-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-3">{Math.floor(completedSessions * 8.5)}</div>
                <div className="text-purple-200 font-medium text-lg">Minutes Practiced</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mindfulness;
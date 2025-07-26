import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings,
  RefreshCw,
  MessageCircle,
  Heart,
  Brain,
  Lightbulb,
  Shield,
  Clock,
  Maximize2
} from 'lucide-react';
import { sendChatMessage, analyzeEmotion, speakTextWithEmotion } from '../utils/api';
import { ChatMessage, EmotionAnalysis } from '../types';
import { storage } from '../utils/storage';

interface ChatbotProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ language, onLanguageChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const [useBuiltInChat, setUseBuiltInChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Quick action buttons for common mental health topics
  const quickActions = [
    { label: 'Feeling Anxious', icon: Brain, message: "I'm feeling anxious and need some help managing it" },
    { label: 'Need Support', icon: Heart, message: "I'm going through a tough time and could use some emotional support" },
    { label: 'Stress Management', icon: Shield, message: "I'm feeling overwhelmed with stress. Can you help me?" },
    { label: 'Sleep Issues', icon: Clock, message: "I'm having trouble sleeping and it's affecting my mental health" },
    { label: 'Motivation', icon: Lightbulb, message: "I'm feeling unmotivated and need some encouragement" },
    { label: 'Coping Strategies', icon: Bot, message: "Can you teach me some healthy coping strategies?" }
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: `Hello! I'm your AI mental wellness companion. I'm here to provide support, listen to your concerns, and help you develop healthy coping strategies. How are you feeling today?`,
      sender: 'bot',
      timestamp: new Date(),
      language
    };
    setMessages([welcomeMessage]);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    // Check iframe connectivity
    checkIframeConnectivity();
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkIframeConnectivity = () => {
    // Try to load the iframe and check for errors
    const testFrame = document.createElement('iframe');
    testFrame.src = 'https://v0-mind-care-assistant.vercel.app/chat';
    testFrame.style.display = 'none';
    
    testFrame.onload = () => {
      setIframeError(false);
      document.body.removeChild(testFrame);
    };
    
    testFrame.onerror = () => {
      setIframeError(true);
      setUseBuiltInChat(true);
      document.body.removeChild(testFrame);
    };
    
    // Timeout fallback
    setTimeout(() => {
      if (document.body.contains(testFrame)) {
        setIframeError(true);
        setUseBuiltInChat(true);
        document.body.removeChild(testFrame);
      }
    }, 5000);
    
    document.body.appendChild(testFrame);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
      language
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Analyze emotion
      const emotion = analyzeEmotion(text);
      setCurrentEmotion(emotion);

      // Get AI response
      const response = await sendChatMessage(text, language, emotion.emotion);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
        emotion: emotion.emotion,
        language
      };

      setMessages(prev => [...prev, botMessage]);

      // Auto-speak if enabled
      if (autoSpeak) {
        setIsSpeaking(true);
        await speakTextWithEmotion(response, emotion.emotion, language);
        setIsSpeaking(false);
      }

      // Award coins for interaction
      const user = storage.getUser();
      if (user) {
        storage.updateCoins(user.coins + 5);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now, but I'm still here to help. Could you try rephrasing your message?",
        sender: 'bot',
        timestamp: new Date(),
        language
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const getEmotionColor = (emotion?: string) => {
    const colors = {
      happy: 'text-green-500',
      sad: 'text-blue-500',
      angry: 'text-red-500',
      anxious: 'text-yellow-500',
      calm: 'text-purple-500',
      confused: 'text-gray-500',
      hopeful: 'text-teal-500',
      lonely: 'text-indigo-500'
    };
    return colors[emotion as keyof typeof colors] || 'text-gray-400';
  };

  const retryIframe = () => {
    setIframeError(false);
    setUseBuiltInChat(false);
    checkIframeConnectivity();
  };

  // If iframe works and we're not using built-in chat, show iframe
  if (!iframeError && !useBuiltInChat) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-lg p-4 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">AI Mental Wellness Assistant</h2>
                <p className="text-sm text-gray-600">Advanced AI-powered mental health support</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setUseBuiltInChat(true)}
                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
              >
                Use Built-in Chat
              </button>
              <a
                href="https://v0-mind-care-assistant.vercel.app/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="font-medium">Open in New Tab</span>
              </a>
            </div>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 relative overflow-hidden">
          <iframe
            src="https://mindcare-voice-helper.lovable.app"
            className="w-full h-full border-0 bg-white"
            title="MindCare Voice Helper"
            allow="microphone; camera; autoplay; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-microphone allow-downloads"
            loading="lazy"
            onError={() => {
              setIframeError(true);
              setUseBuiltInChat(true);
            }}
          />
        </div>

        {/* Info Section */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Bot className="w-5 h-5" />
              <span className="text-sm font-medium">AI-Powered Chat</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-purple-600">
              <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">Mental Health Focus</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <div className="w-5 h-5 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">24/7 Available</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Built-in chat interface
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl shadow-2xl p-6 border-b border-white/20 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Mental Wellness Assistant</h2>
              <p className="text-sm text-purple-200">Your personal AI mental health companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {iframeError && (
              <button
                onClick={retryIframe}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 rounded-xl transition-colors text-sm backdrop-blur-sm border border-yellow-400/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry External Chat</span>
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-sm"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Auto-speak responses</span>
                <button
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSpeak ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoSpeak ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">Language:</span>
                <select
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>

              {currentEmotion && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-white">Detected mood:</span>
                  <span className={`text-sm font-medium capitalize ${getEmotionColor(currentEmotion.emotion)}`}>
                    {currentEmotion.emotion} ({currentEmotion.intensity})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 relative z-10">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleSendMessage(action.message)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 hover:from-cyan-400/30 hover:to-purple-400/30 text-white rounded-full transition-all text-sm border border-cyan-400/30 backdrop-blur-sm hover:scale-105"
                disabled={isLoading}
              >
                <Icon className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-sm ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-purple-500/25'
                  : 'bg-white/90 text-gray-800 border border-white/50'
              }`}
            >
              {message.sender === 'bot' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-500">AI Assistant</span>
                  {message.emotion && (
                    <span className={`text-xs capitalize ${getEmotionColor(message.emotion)}`}>
                      • {message.emotion}
                    </span>
                  )}
                </div>
              )}
              
              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
              
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${
                  message.sender === 'user' ? 'text-purple-100' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {message.sender === 'bot' && (
                  <button
                    onClick={() => speakTextWithEmotion(message.content, message.emotion || 'neutral', language)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/90 backdrop-blur-sm text-gray-800 border border-white/50 px-6 py-4 rounded-2xl shadow-2xl">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-purple-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600 font-medium">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share what's on your mind..."
              className="w-full px-6 py-4 pr-14 bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-500 shadow-lg"
              disabled={isLoading}
            />
            
            {/* Voice Input Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                  : 'bg-white/20 hover:bg-white/30 text-gray-600 backdrop-blur-sm'
              }`}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white p-4 rounded-2xl transition-all shadow-2xl disabled:shadow-none hover:scale-105 disabled:scale-100"
          >
            <Send className="w-6 h-6" />
          </button>

          {/* Speaking Control */}
          {isSpeaking && (
            <button
              onClick={toggleSpeaking}
              className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white p-4 rounded-2xl transition-all shadow-2xl hover:scale-105"
            >
              <VolumeX className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between mt-4 text-sm text-purple-200">
          <div className="flex items-center space-x-4">
            {isListening && (
              <span className="flex items-center space-x-2 text-red-400 font-medium">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <span>Listening...</span>
              </span>
            )}
            {isSpeaking && (
              <span className="flex items-center space-x-2 text-green-400 font-medium">
                <Volume2 className="w-4 h-4" />
                <span>Speaking...</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">AI-powered mental wellness support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
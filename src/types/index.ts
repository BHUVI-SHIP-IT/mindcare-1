export interface User {
  id: string;
  name: string;
  email: string;
  language: string;
  coins: number;
  joinDate: Date;
}

export interface Therapist {
  id: string;
  name: string;
  languages: string[];
  specialties: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  reviewCount: number;
  verified: boolean;
  availability: string[];
  profileImage?: string;
}

export interface Session {
  id: string;
  userId: string;
  therapistId: string;
  date: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  cost: number;
}

export interface Review {
  id: string;
  userId: string;
  therapistId: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: Date;
  content: string;
  mood: string;
  tags: string[];
  language: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  emotion?: string;
  language: string;
  hasAudio?: boolean;
}

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  intensity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },  
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
  { code: 'as', name: 'Assamese', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵' },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'de', name: 'German', flag: '🇩🇪' }
];
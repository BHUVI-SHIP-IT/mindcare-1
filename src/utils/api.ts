import axios from 'axios';
import { Therapist, EmotionAnalysis, ChatMessage } from '../types';

const OPENROUTER_API_KEY = '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';
const GOOGLE_PLACES_API_KEY = 'AIzaSyC65iGk_fISXQxdYla1yZF8Eyd35sBqhto';

// Enhanced conversation context
interface ConversationContext {
  previousMessages: ChatMessage[];
  userMood: string;
  sessionStartTime: Date;
  topicsDiscussed: string[];
  userPreferences: {
    responseStyle: 'supportive' | 'analytical' | 'motivational';
    preferredLength: 'short' | 'medium' | 'detailed';
  };
}

let conversationContext: ConversationContext = {
  previousMessages: [],
  userMood: 'neutral',
  sessionStartTime: new Date(),
  topicsDiscussed: [],
  userPreferences: {
    responseStyle: 'supportive',
    preferredLength: 'medium'
  }
};

// Enhanced mental health knowledge base
const mentalHealthKnowledge = {
  copingStrategies: {
    anxiety: [
      'Practice the 4-7-8 breathing technique',
      'Try progressive muscle relaxation',
      'Use grounding techniques (5-4-3-2-1 method)',
      'Challenge negative thoughts with evidence',
      'Engage in physical activity or movement'
    ],
    depression: [
      'Maintain a daily routine',
      'Practice gratitude journaling',
      'Engage in social connections',
      'Set small, achievable goals',
      'Spend time in nature or sunlight'
    ],
    stress: [
      'Practice mindfulness meditation',
      'Break tasks into smaller steps',
      'Use time management techniques',
      'Engage in relaxing activities',
      'Maintain work-life boundaries'
    ]
  },
  crisisResources: {
    us: 'National Suicide Prevention Lifeline: 988',
    uk: 'Samaritans: 116 123',
    canada: 'Talk Suicide Canada: 1-833-456-4566',
    australia: 'Lifeline: 13 11 14',
    international: 'International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/'
  }
};

// OpenRouter API for chatbot
export const sendChatMessage = async (
  message: string, 
  language: string, 
  emotion?: string,
  context?: Partial<ConversationContext>
): Promise<string> => {
  try {
    // Update conversation context
    if (context) {
      conversationContext = { ...conversationContext, ...context };
    }
    
    // Detect crisis keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'hurt myself', 'self harm'];
    const isCrisis = crisisKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    if (isCrisis) {
      return getCrisisResponse(language);
    }
    
    // Enhanced system prompt with context
    const systemPrompt = buildEnhancedSystemPrompt(language, emotion, conversationContext);
    
    // Build conversation history for context
    const conversationHistory = buildConversationHistory(message, conversationContext);
    
    console.log('Sending enhanced message to OpenRouter');

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: conversationHistory,
      temperature: 0.8,
      max_tokens: 800,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MindCare Mental Wellness App',
        'User-Agent': 'MindCare/1.0'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    
    // Update conversation context with new message
    updateConversationContext(message, aiResponse, emotion);
    
    return enhanceResponse(aiResponse, emotion, language);
    
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return getIntelligentFallbackResponse(message, emotion, language);
  }
};

// Build enhanced system prompt with context
const buildEnhancedSystemPrompt = (language: string, emotion?: string, context?: ConversationContext): string => {
  const basePrompt = `You are MindCare, an advanced AI mental wellness companion with deep expertise in psychology, mindfulness, and emotional support. 

CORE PRINCIPLES:
- Respond in ${language} language exclusively
- Be empathetic, non-judgmental, and genuinely caring
- Use evidence-based therapeutic techniques (CBT, DBT, mindfulness)
- Provide personalized, actionable advice
- Remember conversation context and build upon it
- Never diagnose or replace professional therapy

CURRENT CONTEXT:
${emotion ? `- User's current emotion: ${emotion}` : ''}
${context?.userMood ? `- Overall mood pattern: ${context.userMood}` : ''}
${context?.topicsDiscussed.length ? `- Topics discussed: ${context.topicsDiscussed.join(', ')}` : ''}

RESPONSE STYLE: ${context?.userPreferences.responseStyle || 'supportive'}
RESPONSE LENGTH: ${context?.userPreferences.preferredLength || 'medium'}

GUIDELINES:
- Ask thoughtful follow-up questions
- Provide specific coping strategies when appropriate
- Validate emotions while encouraging growth
- Use metaphors and analogies to explain concepts
- Suggest practical exercises or techniques
- Be warm but professional`;

  return basePrompt;
};

// Build conversation history for context
const buildConversationHistory = (currentMessage: string, context: ConversationContext) => {
  const systemPrompt = buildEnhancedSystemPrompt('en', context.userMood, context);
  
  const messages = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Add recent conversation history (last 6 messages for context)
  const recentMessages = context.previousMessages.slice(-6);
  recentMessages.forEach(msg => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });
  
  // Add current message
  messages.push({ role: 'user', content: currentMessage });
  
  return messages;
};

// Update conversation context
const updateConversationContext = (userMessage: string, aiResponse: string, emotion?: string) => {
  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    content: userMessage,
    sender: 'user',
    timestamp: new Date(),
    emotion,
    language: 'en'
  };
  
  const aiMsg: ChatMessage = {
    id: (Date.now() + 1).toString(),
    content: aiResponse,
    sender: 'bot',
    timestamp: new Date(),
    language: 'en'
  };
  
  conversationContext.previousMessages.push(userMsg, aiMsg);
  
  // Keep only last 20 messages for performance
  if (conversationContext.previousMessages.length > 20) {
    conversationContext.previousMessages = conversationContext.previousMessages.slice(-20);
  }
  
  // Update mood if emotion detected
  if (emotion && emotion !== 'neutral') {
    conversationContext.userMood = emotion;
  }
  
  // Extract topics discussed
  const topics = extractTopics(userMessage);
  topics.forEach(topic => {
    if (!conversationContext.topicsDiscussed.includes(topic)) {
      conversationContext.topicsDiscussed.push(topic);
    }
  });
};

// Extract topics from message
const extractTopics = (message: string): string[] => {
  const topicKeywords = {
    'work': ['work', 'job', 'career', 'boss', 'colleague', 'office'],
    'relationships': ['relationship', 'partner', 'boyfriend', 'girlfriend', 'marriage', 'dating'],
    'family': ['family', 'parents', 'mother', 'father', 'siblings', 'children'],
    'health': ['health', 'sick', 'illness', 'medical', 'doctor', 'hospital'],
    'anxiety': ['anxiety', 'anxious', 'worried', 'nervous', 'panic', 'fear'],
    'depression': ['depression', 'depressed', 'sad', 'hopeless', 'empty'],
    'sleep': ['sleep', 'insomnia', 'tired', 'exhausted', 'rest'],
    'stress': ['stress', 'stressed', 'overwhelmed', 'pressure', 'burden']
  };
  
  const lowerMessage = message.toLowerCase();
  const detectedTopics: string[] = [];
  
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedTopics.push(topic);
    }
  });
  
  return detectedTopics;
};

// Get crisis response
const getCrisisResponse = (language: string): string => {
  const crisisResponses = {
    en: `I'm very concerned about what you're sharing with me. Your life has value and meaning, and there are people who want to help you through this difficult time.

🆘 IMMEDIATE HELP:
• US: National Suicide Prevention Lifeline - 988
• Crisis Text Line - Text HOME to 741741
• Emergency Services - 911

Please reach out to one of these resources right now. You don't have to go through this alone. There are trained professionals available 24/7 who care about you and want to help.

Would you like me to help you find local mental health resources or talk about what's making you feel this way?`,
    
    hi: `मैं आपकी बात सुनकर बहुत चिंतित हूं। आपका जीवन मूल्यवान है और ऐसे लोग हैं जो आपकी मदद करना चाहते हैं।

🆘 तत्काल सहायता:
• भारत: आसरा हेल्पलाइन - 9820466726
• वंदरेवाला फाउंडेशन - 9999666555
• आपातकालीन सेवाएं - 102

कृपया अभी इनमें से किसी संसाधन से संपर्क करें। आप अकेले नहीं हैं।`,
    
    es: `Estoy muy preocupado por lo que me estás compartiendo. Tu vida tiene valor y hay personas que quieren ayudarte.

🆘 AYUDA INMEDIATA:
• España: Teléfono de la Esperanza - 717 003 717
• Servicios de Emergencia - 112

Por favor, contacta con uno de estos recursos ahora mismo. No tienes que pasar por esto solo.`
  };
  
  return crisisResponses[language as keyof typeof crisisResponses] || crisisResponses.en;
};

// Get intelligent fallback response
const getIntelligentFallbackResponse = (message: string, emotion?: string, language: string = 'en'): string => {
  const messageAnalysis = analyzeEmotion(message);
  const detectedEmotion = emotion || messageAnalysis.emotion;
  
  const contextualResponses = {
    en: {
      anxious: "I can sense you're feeling anxious right now. While I'm having a technical issue, I want you to know that anxiety is temporary and manageable. Try taking three deep breaths with me: breathe in for 4 counts, hold for 4, and exhale for 6. What's one small thing that usually helps you feel calmer?",
      
      sad: "I hear that you're going through a difficult time, and I want you to know that your feelings are completely valid. Even though I'm experiencing a connection issue, please remember that sadness, while painful, is a natural human emotion that will pass. You're stronger than you know. What's one thing you're grateful for today, even if it's small?",
      
      angry: "I can feel the frustration in your message, and it's completely understandable to feel angry sometimes. While I'm having technical difficulties, I want to remind you that anger often signals that something important to you needs attention. Take a moment to breathe deeply. What's really bothering you underneath this anger?",
      
      happy: "I love hearing the positive energy in your message! Even though I'm having a connection issue right now, your happiness is contagious. What's bringing you joy today? I'd love to celebrate with you once I'm back online properly.",
      
      neutral: "I'm here to support you, and while I'm experiencing some technical difficulties, I want you to know that reaching out shows real strength. Your thoughts and feelings matter. What's on your mind today? I'm listening, even if my responses might be delayed."
    }
  };
  
  const responses = contextualResponses[language as keyof typeof contextualResponses] || contextualResponses.en;
  return responses[detectedEmotion as keyof typeof responses] || responses.neutral;
};

// Enhance response with additional context
const enhanceResponse = (response: string, emotion?: string, language: string = 'en'): string => {
  // Add relevant coping strategies if emotion detected
  if (emotion && mentalHealthKnowledge.copingStrategies[emotion as keyof typeof mentalHealthKnowledge.copingStrategies]) {
    const strategies = mentalHealthKnowledge.copingStrategies[emotion as keyof typeof mentalHealthKnowledge.copingStrategies];
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    
    const enhancementSuffix = {
      en: `\n\n💡 Quick tip: ${randomStrategy}`,
      hi: `\n\n💡 सुझाव: ${randomStrategy}`,
      es: `\n\n💡 Consejo rápido: ${randomStrategy}`
    };
    
    const suffix = enhancementSuffix[language as keyof typeof enhancementSuffix] || enhancementSuffix.en;
    return response + suffix;
  }
  
  return response;
};

// Emotion detection from text
export const analyzeEmotion = (text: string): EmotionAnalysis => {
  const emotionKeywords = {
    happy: ['happy', 'joy', 'excited', 'good', 'great', 'wonderful', 'amazing', 'fantastic', 'awesome', 'love', 'grateful', 'blessed', 'thrilled', 'delighted', 'cheerful', 'optimistic', 'positive'],
    sad: ['sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'lonely', 'heartbroken', 'miserable', 'gloomy', 'melancholy', 'sorrowful', 'dejected', 'despondent', 'grief', 'mourning'],
    angry: ['angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'frustrated', 'irritated', 'livid', 'outraged', 'resentful', 'bitter', 'hostile', 'aggravated', 'infuriated'],
    anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panic', 'stress', 'overwhelmed', 'tense', 'uneasy', 'apprehensive', 'fearful', 'restless', 'jittery', 'on edge'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'zen', 'centered', 'balanced', 'composed', 'content', 'at ease', 'mindful', 'present'],
    confused: ['confused', 'lost', 'uncertain', 'unclear', 'puzzled', 'bewildered', 'perplexed', 'mixed up', 'unsure', 'conflicted'],
    hopeful: ['hopeful', 'optimistic', 'encouraged', 'motivated', 'inspired', 'determined', 'confident', 'positive', 'uplifted'],
    lonely: ['lonely', 'isolated', 'alone', 'disconnected', 'abandoned', 'rejected', 'excluded', 'solitary', 'friendless']
  };

  const lowerText = text.toLowerCase();
  let dominantEmotion = 'neutral';
  let maxScore = 0;
  let totalWords = lowerText.split(' ').length;

  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    
    // Weight score by message length
    const weightedScore = totalWords > 10 ? score / Math.log(totalWords) : score;
    
    if (weightedScore > maxScore) {
      maxScore = weightedScore;
      dominantEmotion = emotion;
    }
  });

  // Enhanced intensity calculation
  let intensity: 'low' | 'medium' | 'high' = 'low';
  if (maxScore >= 3) intensity = 'high';
  else if (maxScore >= 1.5) intensity = 'medium';
  
  // Check for emotional intensifiers
  const intensifiers = ['very', 'extremely', 'really', 'so', 'incredibly', 'absolutely', 'completely', 'totally'];
  const hasIntensifiers = intensifiers.some(word => lowerText.includes(word));
  if (hasIntensifiers && intensity !== 'low') {
    intensity = 'high';
  }
  
  return {
    emotion: dominantEmotion,
    confidence: Math.min(maxScore * 0.4, 1),
    intensity,
    suggestions: getEnhancedSuggestions(dominantEmotion, intensity)
  };
};

// Enhanced suggestions based on emotion and intensity
const getEnhancedSuggestions = (emotion: string, intensity: string): string[] => {
  const suggestions = {
    sad: {
      low: ['Take a gentle walk outside', 'Listen to uplifting music', 'Call a friend or family member'],
      medium: ['Practice gratitude journaling', 'Engage in a creative activity', 'Watch something that makes you laugh', 'Do some light exercise'],
      high: ['Reach out to a mental health professional', 'Contact a trusted friend immediately', 'Practice grounding techniques', 'Consider joining a support group']
    },
    anxious: {
      low: ['Try the 4-7-8 breathing technique', 'Take a short mindful walk', 'Listen to calming music'],
      medium: ['Practice progressive muscle relaxation', 'Use the 5-4-3-2-1 grounding technique', 'Write down your worries', 'Try gentle yoga or stretching'],
      high: ['Speak with a counselor or therapist', 'Use crisis helpline if needed', 'Practice intensive grounding', 'Remove yourself from stressful environment']
    },
    angry: {
      low: ['Take 10 deep breaths', 'Step away from the situation', 'Count to 10 slowly'],
      medium: ['Go for a vigorous walk or run', 'Write in a journal', 'Talk to someone you trust', 'Practice mindful breathing'],
      high: ['Remove yourself from the situation', 'Call a friend or counselor', 'Use physical exercise to release energy', 'Practice anger management techniques']
    },
    happy: {
      low: ['Share your joy with someone', 'Write about what made you happy'],
      medium: ['Plan something fun for later', 'Express gratitude', 'Spread positivity to others'],
      high: ['Celebrate your achievement', 'Share your happiness with loved ones', 'Use this energy for something productive']
    },
    lonely: {
      low: ['Reach out to an old friend', 'Join an online community', 'Go to a public place like a café'],
      medium: ['Volunteer for a cause you care about', 'Join a club or group activity', 'Call a family member'],
      high: ['Consider professional support', 'Join a support group', 'Reach out to multiple people', 'Consider therapy for social skills']
    },
    confused: {
      low: ['Write down your thoughts', 'Talk through the situation with someone', 'Take a break and come back to it'],
      medium: ['Make a pros and cons list', 'Seek advice from trusted friends', 'Research your options thoroughly'],
      high: ['Consult with a professional or expert', 'Take time for major decisions', 'Seek multiple perspectives']
    }
  };

  const emotionSuggestions = suggestions[emotion as keyof typeof suggestions];
  if (emotionSuggestions) {
    return emotionSuggestions[intensity as keyof typeof emotionSuggestions] || [
      'Take care of yourself',
      'Remember that you matter',
      'Consider talking to someone you trust'
    ];
  }

  return [
    'Practice self-compassion',
    'Take things one step at a time',
    'Remember that feelings are temporary',
    'Focus on what you can control'
  ];
};

// Reset conversation context (useful for new sessions)
export const resetConversationContext = () => {
  conversationContext = {
    previousMessages: [],
    userMood: 'neutral',
    sessionStartTime: new Date(),
    topicsDiscussed: [],
    userPreferences: {
      responseStyle: 'supportive',
      preferredLength: 'medium'
    }
  };
};

// Update user preferences
export const updateUserPreferences = (preferences: Partial<ConversationContext['userPreferences']>) => {
  conversationContext.userPreferences = {
    ...conversationContext.userPreferences,
    ...preferences
  };
};

// Get conversation insights
export const getConversationInsights = () => {
  const sessionDuration = Date.now() - conversationContext.sessionStartTime.getTime();
  const messageCount = conversationContext.previousMessages.length;
  
  return {
    sessionDuration: Math.round(sessionDuration / 1000 / 60), // in minutes
    messageCount,
    topicsDiscussed: conversationContext.topicsDiscussed,
    dominantMood: conversationContext.userMood,
    engagementLevel: messageCount > 10 ? 'high' : messageCount > 5 ? 'medium' : 'low'
  };
};

// Enhanced text preprocessing
const preprocessText = (text: string): string => {
  // Remove excessive punctuation and normalize
  return text
    .replace(/[!]{2,}/g, '!')
    .replace(/[?]{2,}/g, '?')
    .replace(/\.{3,}/g, '...')
    .trim();
};

// Detect if user needs immediate professional help
export const detectUrgentCare = (message: string): boolean => {
  const urgentKeywords = [
    'suicide', 'kill myself', 'end it all', 'want to die', 'hurt myself', 
    'self harm', 'cutting', 'overdose', 'jump off', 'hang myself',
    'not worth living', 'better off dead', 'can\'t go on'
  ];
  
  const lowerMessage = message.toLowerCase();
  return urgentKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Get personalized wellness tips
export const getPersonalizedTips = (userMood: string, topicsDiscussed: string[]): string[] => {
  const tips = [];
  
  if (topicsDiscussed.includes('work')) {
    tips.push('Consider setting boundaries between work and personal time');
  }
  
  if (topicsDiscussed.includes('sleep')) {
    tips.push('Try establishing a consistent bedtime routine');
  }
  
  if (userMood === 'anxious') {
    tips.push('Practice the 4-7-8 breathing technique daily');
  }
  
  if (userMood === 'sad') {
    tips.push('Engage in one small act of self-care today');
  }
  
  // Default tips
  tips.push('Remember to stay hydrated and take breaks');
  tips.push('Consider spending a few minutes in nature');
  
  return tips.slice(0, 3); // Return top 3 tips
};

const getSuggestions = (emotion: string, intensity: string): string[] => {
  return getEnhancedSuggestions(emotion, intensity);
};

// Google Places API for therapist search
export const findNearbyTherapists = async (lat: number, lng: number): Promise<Therapist[]> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=health&keyword=therapist+psychologist+counselor&key=${GOOGLE_PLACES_API_KEY}`
    );

    return response.data.results.map((place: any, index: number) => ({
      id: place.place_id,
      name: place.name,
      languages: ['English'], // Default, would be enhanced with real data
      specialties: ['General Counseling', 'Anxiety', 'Depression'],
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        address: place.vicinity
      },
      rating: place.rating || 4.0,
      reviewCount: place.user_ratings_total || 0,
      verified: Math.random() > 0.3, // Simulated
      availability: ['Mon-Fri 9AM-5PM'],
      profileImage: place.photos?.[0] ? 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}` 
        : undefined
    }));
  } catch (error) {
    console.error('Google Places API error:', error);
    // Return mock data as fallback
    return [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        languages: ['English', 'Spanish'],
        specialties: ['Anxiety', 'Depression', 'PTSD'],
        location: { lat, lng, address: 'Downtown Medical Center' },
        rating: 4.8,
        reviewCount: 127,
        verified: true,
        availability: ['Mon-Fri 9AM-6PM']
      },
      {
        id: '2', 
        name: 'Dr. Michael Chen',
        languages: ['English', 'Chinese'],
        specialties: ['Family Therapy', 'Relationships'],
        location: { lat: lat + 0.01, lng: lng + 0.01, address: 'Wellness Center' },
        rating: 4.6,
        reviewCount: 89,
        verified: true,
        availability: ['Tue-Sat 10AM-7PM']
      }
    ];
  }
};

// Enhanced Text-to-Speech function
export const speakText = async (text: string, language: string = 'en'): Promise<void> => {
  return new Promise((resolve) => {
    try {
    if ('speechSynthesis' in window) {
      // Stop any currently speaking utterances
      window.speechSynthesis.cancel();
      
      // Clean text for better speech
      const cleanText = text
        .replace(/[*_~`]/g, '') // Remove markdown formatting
        .replace(/https?:\/\/[^\s]+/g, 'link') // Replace URLs
        .replace(/\n+/g, '. ') // Replace line breaks with pauses
        .replace(/[🆘💡]/g, '') // Remove emojis
        .trim();
      
      // Map language codes to speech synthesis language codes
      const languageMap: { [key: string]: string } = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
        'mr': 'mr-IN',
        'bn': 'bn-IN',
        'gu': 'gu-IN',
        'pa': 'pa-IN',
        'ur': 'ur-PK',
        'as': 'as-IN',
        'or': 'or-IN',
        'ne': 'ne-NP',
        'si': 'si-LK',
        'ar': 'ar-SA',
        'fr': 'fr-FR',
        'es': 'es-ES',
        'id': 'id-ID',
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'de': 'de-DE'
      };
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = languageMap[language] || 'en-US';
      utterance.rate = 0.85; // Slightly slower for better comprehension
      utterance.pitch = 1.1; // Slightly higher pitch for warmth
      utterance.volume = 0.8;
      
      // Handle speech events
      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.warn('Speech synthesis error:', error);
        resolve();
      };
      
      // Wait for voices to load if needed
      const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find the best voice for the language
        const preferredVoice = voices.find(voice => 
          voice.lang === utterance.lang && voice.name.includes('Google')
        ) || voices.find(voice => 
          voice.lang === utterance.lang
        ) || voices.find(voice => 
          voice.lang.startsWith(utterance.lang.split('-')[0])
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      };
      
      // Check if voices are already loaded
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak();
      } else {
        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
          setVoiceAndSpeak();
        };
      }
      
    } else {
      console.warn('Speech synthesis not supported');
      resolve();
    }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      resolve();
    }
  });
};

// Enhanced speech with emotion
export const speakTextWithEmotion = async (text: string, emotion: string, language: string = 'en'): Promise<void> => {
  return new Promise((resolve) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const cleanText = text
          .replace(/[*_~`]/g, '')
          .replace(/https?:\/\/[^\s]+/g, 'link')
          .replace(/\n+/g, '. ')
          .replace(/[🆘💡]/g, '')
          .trim();
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Adjust speech parameters based on emotion
        switch (emotion) {
          case 'sad':
            utterance.rate = 0.7;
            utterance.pitch = 0.8;
            utterance.volume = 0.7;
            break;
          case 'anxious':
            utterance.rate = 0.8;
            utterance.pitch = 1.2;
            utterance.volume = 0.6;
            break;
          case 'happy':
            utterance.rate = 1.0;
            utterance.pitch = 1.3;
            utterance.volume = 0.9;
            break;
          case 'angry':
            utterance.rate = 0.9;
            utterance.pitch = 0.9;
            utterance.volume = 0.8;
            break;
          default:
            utterance.rate = 0.85;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;
        }
        
        const languageMap: { [key: string]: string } = {
          'en': 'en-US', 'hi': 'hi-IN', 'ta': 'ta-IN', 'te': 'te-IN',
          'kn': 'kn-IN', 'ml': 'ml-IN', 'mr': 'mr-IN', 'bn': 'bn-IN',
          'gu': 'gu-IN', 'pa': 'pa-IN', 'ur': 'ur-PK', 'as': 'as-IN',
          'or': 'or-IN', 'ne': 'ne-NP', 'si': 'si-LK', 'ar': 'ar-SA',
          'fr': 'fr-FR', 'es': 'es-ES', 'id': 'id-ID', 'zh': 'zh-CN',
          'ja': 'ja-JP', 'de': 'de-DE'
        };
        
        utterance.lang = languageMap[language] || 'en-US';
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        
        const setVoiceAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.lang === utterance.lang && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
          ) || voices.find(voice => voice.lang === utterance.lang);
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          
          window.speechSynthesis.speak(utterance);
        };
        
        if (window.speechSynthesis.getVoices().length > 0) {
          setVoiceAndSpeak();
        } else {
          window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
        }
      } else {
        resolve();
      }
    } catch (error) {
      console.error('Emotional speech synthesis error:', error);
      resolve();
    }
  });
};

// Get user location
export const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};
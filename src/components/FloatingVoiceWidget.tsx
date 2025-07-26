import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Maximize2, Minimize2, MicOff, Volume2, VolumeX, RefreshCw, MessageCircle } from 'lucide-react';
import { sendChatMessage, analyzeEmotion, speakTextWithEmotion } from '../utils/api';
import { storage } from '../utils/storage';

const FloatingVoiceWidget: React.FC = () => {
  const openVoiceAssistant = () => {
    window.open('https://elevenlabs.io/app/talk-to?agent_id=agent_4301k108mmabfcrb75scyrmjrsry', '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={openVoiceAssistant}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 group hover:scale-110"
        title="Open Voice Assistant in New Tab"
      >
        <div className="relative">
          <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <div className="absolute -inset-2 bg-white/20 rounded-full animate-ping"></div>
        </div>
      </button>
      
      {/* Floating Label */}
      <div className="fixed bottom-8 right-28 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-40">
        🎤 Voice Assistant
      </div>
    </>
  );
};

export default FloatingVoiceWidget;
import React from 'react';
import { Mic, Maximize2 } from 'lucide-react';

const VoiceAssistant: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">ElevenLabs Voice Assistant</h2>
              <p className="text-sm text-gray-600">AI-powered conversational voice support</p>
            </div>
          </div>
          
          <a
            href="https://elevenlabs.io/app/talk-to?agent_id=agent_4301k108mmabfcrb75scyrmjrsry"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="font-medium">Fullscreen</span>
          </a>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          src="https://elevenlabs.io/app/talk-to?agent_id=agent_4301k108mmabfcrb75scyrmjrsry"
          className="w-full h-full border-0 bg-white"
          title="ElevenLabs Voice Assistant"
          allow="microphone; camera; autoplay; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-microphone"
          loading="lazy"
        />
      </div>

      {/* Info Section */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <Mic className="w-5 h-5" />
            <span className="text-sm font-medium">Natural Conversation</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">ElevenLabs AI</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">24/7 Available</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium">Voice Enabled</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Click the microphone icon in the voice assistant to start speaking. Allow microphone access when prompted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
import React from 'react';
import { Users, Maximize2 } from 'lucide-react';

const TherapistFinder: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Find Your Perfect Therapist</h2>
              <p className="text-sm text-gray-600">AI-powered therapist matching and booking</p>
            </div>
          </div>
          
          <a
            href="https://v0-mind-care-assistant.vercel.app/therapist-finder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="font-medium">Open in New Tab</span>
          </a>
        </div>
      </div>

      {/* Iframe Container */}
      <div className="flex-1 relative overflow-hidden">
        <iframe
          src="https://v0-mind-care-assistant.vercel.app/therapist-finder"
          className="w-full h-full border-0 bg-white"
          title="Therapist Finder"
          allow="geolocation; microphone; camera; autoplay; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
          loading="lazy"
        />
      </div>

      {/* Info Section */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">AI-Powered Matching</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="w-5 h-5 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Verified Therapists</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-purple-600">
            <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
            <span className="text-sm font-medium">Instant Booking</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
            <span className="text-sm font-medium">Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistFinder;
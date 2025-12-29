
import React, { useEffect, useRef } from 'react';
import { TranscriptionEntry } from '../types';

interface ConversationDisplayProps {
  transcriptions: TranscriptionEntry[];
  isActive: boolean;
  isAiSpeaking: boolean;
  isUserSpeaking: boolean;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ 
  transcriptions, 
  isActive, 
  isAiSpeaking, 
  isUserSpeaking 
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!isActive && transcriptions.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-600">Ready to start?</h3>
            <p className="mt-2">Choose your settings on the left and click "Start Session" to begin your practice conversation.</p>
          </div>
        )}

        {transcriptions.map((entry, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${entry.speaker === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`text-xs font-bold mb-1 uppercase tracking-wider ${entry.speaker === 'user' ? 'text-blue-500' : 'text-slate-400'}`}>
              {entry.speaker === 'user' ? 'You' : 'Gemini AI'}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
              entry.speaker === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
            }`}>
              {entry.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {isActive && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-12">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
              {isUserSpeaking && <div className="pulse-ring"></div>}
              <svg className={`w-6 h-6 transition-colors ${isUserSpeaking ? 'text-blue-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-500">You</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="relative w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-full">
              {isAiSpeaking && <div className="pulse-ring bg-indigo-500/40"></div>}
              <svg className={`w-6 h-6 transition-colors ${isAiSpeaking ? 'text-indigo-600' : 'text-slate-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.59.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-500">AI Tutor</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationDisplay;

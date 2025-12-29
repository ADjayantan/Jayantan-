
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Language, Proficiency, Scenario, TranscriptionEntry, GeminiVoice } from './types';
import { SCENARIOS } from './constants';
import SettingsSidebar from './components/SettingsSidebar';
import ConversationDisplay from './components/ConversationDisplay';
import { decode, decodeAudioData, createPcmBlob } from './services/audioUtils';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [proficiency, setProficiency] = useState<Proficiency>(Proficiency.INTERMEDIATE);
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [voice, setVoice] = useState<GeminiVoice>(GeminiVoice.ZEPHYR);
  const [isActive, setIsActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<any>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  
  // Transcription accumulators
  const userTextRef = useRef<string>('');
  const aiTextRef = useRef<string>('');

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    
    setIsActive(false);
    setIsAiSpeaking(false);
    setIsUserSpeaking(false);
  }, []);

  const startSession = async () => {
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      const sysInstruction = `You are a professional, patient, and culturally aware language tutor. 
      Help the student practice ${language} at a ${proficiency} proficiency level. 
      The current conversation module is: "${scenario.name}".
      Context: ${scenario.description}.
      
      Operational Guidelines:
      1. Primary Language: Conduct at least 90% of the conversation in ${language}.
      2. If the user is ${Proficiency.BEGINNER}, use slow, clear speech and provide immediate short English translations or corrections when they struggle.
      3. For ${Proficiency.INTERMEDIATE}, focus on expanding their vocabulary and correcting grammatical errors gently while maintaining conversation flow.
      4. For ${Proficiency.ADVANCED}, engage in complex debate or detailed storytelling relevant to the scenario.
      5. Cultural Context: If the language is an Indian language (like Tamil, Hindi, etc.) and the scenario is "Festivals" or "Market", use appropriate local terms and social etiquette (e.g., using polite forms of address like 'Aap' in Hindi or 'Neenga' in Tamil).
      6. Goal: Encourage the user to speak as much as possible. Keep your responses concise to give them room.
      7. Start the conversation immediately in ${language} once the session begins.`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } }
          },
          systemInstruction: sysInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const volume = inputData.reduce((acc, val) => acc + Math.abs(val), 0) / inputData.length;
              setIsUserSpeaking(volume > 0.012); // Slightly higher threshold for noise

              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
            setIsActive(true);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioCtxRef.current) {
              setIsAiSpeaking(true);
              const ctx = outputAudioCtxRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                  setIsAiSpeaking(false);
                }
              };
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.inputTranscription) {
              userTextRef.current += msg.serverContent.inputTranscription.text;
            }
            if (msg.serverContent?.outputTranscription) {
              aiTextRef.current += msg.serverContent.outputTranscription.text;
            }

            if (msg.serverContent?.turnComplete) {
              if (userTextRef.current) {
                setTranscriptions(prev => [...prev, { speaker: 'user', text: userTextRef.current, timestamp: Date.now() }]);
                userTextRef.current = '';
              }
              if (aiTextRef.current) {
                setTranscriptions(prev => [...prev, { speaker: 'ai', text: aiTextRef.current, timestamp: Date.now() }]);
                aiTextRef.current = '';
              }
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error('Gemini Live error:', e);
            setError("Connection interrupted. Please restart.");
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not connect to the AI tutor.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">LinguistLive AI</h1>
            <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">Global & Indian Language Practice</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {error && <span className="text-xs text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full border border-red-100">{error}</span>}
          <button 
            onClick={isActive ? stopSession : startSession}
            className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all transform active:scale-95 shadow-md ${
              isActive 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-100' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {isActive ? 'Stop Practice' : 'Start Practice'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <SettingsSidebar 
          language={language}
          setLanguage={setLanguage}
          proficiency={proficiency}
          setProficiency={setProficiency}
          scenario={scenario}
          setScenario={setScenario}
          voice={voice}
          setVoice={setVoice}
          disabled={isActive}
        />

        <main className="flex-1 flex flex-col min-h-0 bg-[#fdfdff]">
          <ConversationDisplay 
            transcriptions={transcriptions}
            isActive={isActive}
            isAiSpeaking={isAiSpeaking}
            isUserSpeaking={isUserSpeaking}
          />
        </main>
      </div>

      <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[11px] font-medium text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
            {isActive ? 'Session Live' : 'Not Connected'}
          </div>
          <div className="w-px h-3 bg-slate-200"></div>
          <div>Target: <span className="text-slate-900 font-semibold">{language}</span> • <span className="text-slate-900 font-semibold">{proficiency}</span></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current Module:</span>
          <span className="text-indigo-600 font-bold">{scenario.name}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;


import React from 'react';
import { Language, Proficiency, Scenario, GeminiVoice } from '../types';
import { SUPPORTED_LANGUAGES, SCENARIOS, VOICES } from '../constants';

interface SettingsSidebarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  proficiency: Proficiency;
  setProficiency: (level: Proficiency) => void;
  scenario: Scenario;
  setScenario: (scen: Scenario) => void;
  voice: GeminiVoice;
  setVoice: (v: GeminiVoice) => void;
  disabled: boolean;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  language,
  setLanguage,
  proficiency,
  setProficiency,
  scenario,
  setScenario,
  voice,
  setVoice,
  disabled
}) => {
  return (
    <div className="flex flex-col gap-6 p-6 bg-white border-r border-slate-200 h-full w-full max-w-xs shrink-0 overflow-y-auto">
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Configuration</h2>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Target Language</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            disabled={disabled}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Proficiency Level</label>
          <div className="grid grid-cols-1 gap-2">
            {[Proficiency.BEGINNER, Proficiency.INTERMEDIATE, Proficiency.ADVANCED].map(level => (
              <button
                key={level}
                onClick={() => setProficiency(level)}
                disabled={disabled}
                className={`p-2 text-sm rounded-lg border transition-all ${
                  proficiency === level 
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">AI Voice</label>
          <select 
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
            value={voice}
            onChange={(e) => setVoice(e.target.value as GeminiVoice)}
            disabled={disabled}
          >
            {VOICES.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Scenario</label>
          <div className="space-y-2">
            {SCENARIOS.map(sc => (
              <button
                key={sc.id}
                onClick={() => setScenario(sc)}
                disabled={disabled}
                className={`w-full p-3 flex items-start gap-3 rounded-xl border text-left transition-all ${
                  scenario.id === sc.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                <span className="text-2xl">{sc.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{sc.name}</div>
                  <div className="text-xs opacity-80 line-clamp-1">{sc.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;


import { Language, Scenario, GeminiVoice } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  Language.ENGLISH,
  Language.HINDI,
  Language.TAMIL,
  Language.TELUGU,
  Language.BENGALI,
  Language.MARATHI,
  Language.GUJARATI,
  Language.KANNADA,
  Language.MALAYALAM,
  Language.PUNJABI,
  Language.URDU,
  Language.SPANISH,
  Language.FRENCH,
  Language.GERMAN,
  Language.JAPANESE,
  Language.CHINESE,
  Language.ITALIAN,
  Language.PORTUGUESE,
];

export const SCENARIOS: Scenario[] = [
  { id: 'casual', name: 'Casual Chat', description: 'Just a friendly conversation about your day.', icon: '💬' },
  { id: 'restaurant', name: 'At a Restaurant', description: 'Practice ordering food and talking to a waiter.', icon: '🍽️' },
  { id: 'travel', name: 'Travel & Booking', description: 'Booking a hotel or asking for directions.', icon: '✈️' },
  { id: 'market', name: 'Local Market', description: 'Practice shopping and bargaining in a local market setting.', icon: '🛍️' },
  { id: 'directions', name: 'Asking Directions', description: 'Find your way around a new city or landmark.', icon: '🗺️' },
  { id: 'festivals', name: 'Festivals & Culture', description: 'Discuss local traditions, food, and upcoming celebrations.', icon: '🪔' },
  { id: 'job_interview', name: 'Job Interview', description: 'Professional conversation for career prep.', icon: '💼' },
  { id: 'medical', name: 'Doctor Visit', description: 'Describing symptoms and health issues.', icon: '🏥' },
];

export const VOICES: GeminiVoice[] = [
  GeminiVoice.ZEPHYR,
  GeminiVoice.PUCK,
  GeminiVoice.CHARON,
  GeminiVoice.KORE,
  GeminiVoice.FENRIR,
];

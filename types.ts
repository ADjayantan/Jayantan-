
export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  TAMIL = 'Tamil',
  TELUGU = 'Telugu',
  BENGALI = 'Bengali',
  MARATHI = 'Marathi',
  GUJARATI = 'Gujarati',
  KANNADA = 'Kannada',
  MALAYALAM = 'Malayalam',
  PUNJABI = 'Punjabi',
  URDU = 'Urdu',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  JAPANESE = 'Japanese',
  CHINESE = 'Chinese',
  ITALIAN = 'Italian',
  PORTUGUESE = 'Portuguese',
}

export enum Proficiency {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface TranscriptionEntry {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export enum GeminiVoice {
  ZEPHYR = 'Zephyr',
  PUCK = 'Puck',
  CHARON = 'Charon',
  KORE = 'Kore',
  FENRIR = 'Fenrir',
}

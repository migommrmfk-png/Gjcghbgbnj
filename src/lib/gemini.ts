import { GoogleGenAI } from '@google/genai';

export function getGeminiKey(): string {
  // 1. Give priority to environment variable
  let envKey = '';
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    envKey = process.env.GEMINI_API_KEY;
  }
  if (!envKey && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    envKey = import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  if (envKey && envKey.trim() !== '') {
    return envKey;
  }

  // 2. Fallback to localStorage if the user set it manually
  const localKey = localStorage.getItem('userGeminiApiKey');
  if (localKey && localKey.trim() !== '') {
    return localKey;
  }
  
  return '';
}

export function getGeminiClient() {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('API key is missing. Please add it in the settings, or ensure GEMINI_API_KEY is available.');
  }
  return new GoogleGenAI({ apiKey });
}

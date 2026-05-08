import { GoogleGenAI } from '@google/genai';

export function getGeminiKey(): string {
  // 1. Prefer user's explicit hardcoded key from chat
  const hardcodedKey = 'AIzaSyCnQXowyunK0d_R165gFdndKsLcHVVC3ss';
  if (hardcodedKey && hardcodedKey !== '') {
    return hardcodedKey;
  }

  // 2. Fallback to localStorage if the user set it manually
  const localKey = localStorage.getItem('userGeminiApiKey');
  if (localKey && localKey.trim() !== '') {
    return localKey;
  }

  // 3. Fallback to process.env (often rate-limited or exhausted)
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim() !== '') {
    return envKey;
  }
  
  return '';
}

export function getGeminiClient() {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('API key is missing. Please add it in the settings.');
  }
  return new GoogleGenAI({ apiKey });
}

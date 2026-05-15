import { GoogleGenAI } from '@google/genai';

export function getGeminiKey(): string {
  return process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('userGeminiApiKey') || '';
}

export function getGeminiClient() {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('API key is missing.');
  }
  return new GoogleGenAI({ apiKey });
}

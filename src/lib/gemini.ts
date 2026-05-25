import { GoogleGenAI } from '@google/genai';

export function getGeminiKey(): string {
  const processKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
  return processKey || (import.meta.env.VITE_GEMINI_API_KEY as string) || localStorage.getItem('userGeminiApiKey') || '';
}

export function getGeminiClient() {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('API key is missing.');
  }
  return new GoogleGenAI({ apiKey });
}

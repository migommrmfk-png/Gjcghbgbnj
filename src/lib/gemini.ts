export enum Type {
  TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED",
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
  NULL = "NULL",
}

export function getGeminiClient() {
  const customApiKey = localStorage.getItem('user_custom_gemini_key') || undefined;
  
  return {
    models: {
      generateContent: async ({ model, contents, config }: { model: string; contents: any; config?: any }) => {
        const response = await fetch('/api/gemini/generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model, contents, config, customApiKey }),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.');
        }
        const data = await response.json();
        return {
          text: data.text,
        };
      }
    }
  };
}

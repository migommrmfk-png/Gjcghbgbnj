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
      },
      generateContentStream: async ({ model, contents, config, onChunk }: { model: string; contents: any; config?: any; onChunk: (text: string) => void }) => {
        const response = await fetch('/api/gemini/generateContentStream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model, contents, config, customApiKey }),
        });
        if (!response.ok) {
          throw new Error('عذراً، حدث خطأ أثناء الاتصال بالبث المباشر للذكاء الاصطناعي.');
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('بث الاستجابة غير مدعوم في متصفحك.');
        
        let done = false;
        let buffer = '';
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine === 'data: [DONE]') {
              continue;
            }
            if (cleanLine.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(cleanLine.substring(6));
                if (parsed.text) {
                  onChunk(parsed.text);
                }
              } catch (e) {}
            }
          }
        }
      }
    }
  };
}

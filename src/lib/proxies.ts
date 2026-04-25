export const AUDIO_PROXIES = [
  (url: string) => url, // Direct
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

export const fetchWithProxy = async (originalUrl: string): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (const getProxyUrl of AUDIO_PROXIES) {
    try {
      const proxyUrl = getProxyUrl(originalUrl);
      const tempResponse = await fetch(proxyUrl);
      
      if (tempResponse.ok) {
        // Double check it's audio when possible (some proxies return HTML on error)
        const contentType = tempResponse.headers.get('content-type');
        if (contentType && (contentType.includes('text/html') || contentType.includes('application/json'))) {
          throw new Error('Proxy returned non-audio content');
        }
        return tempResponse;
      } else {
        throw new Error(`HTTP Error: ${tempResponse.status}`);
      }
    } catch (e) {
      lastError = e as Error;
      console.warn(`Proxy failed:`, e);
      continue; // Try next proxy
    }
  }
  
  throw lastError || new Error("All proxies failed");
}
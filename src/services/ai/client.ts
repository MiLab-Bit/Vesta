const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
export const DEFAULT_MODEL = 'gemini-2.0-flash';

interface GeminiReply {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

export async function geminiFetch(
  prompt: string,
  apiKey: string,
  model: string,
  maxRetries = 5
): Promise<Record<string, unknown>> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
  let delay = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Gemini API ${response.status}: ${errBody}`);
      }

      const data = await response.json() as GeminiReply;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini returned empty text');

      return JSON.parse(text) as Record<string, unknown>;
    } catch (e) {
      console.warn(`Gemini attempt ${attempt + 1}/${maxRetries} failed:`, e);
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      } else {
        throw e;
      }
    }
  }
  throw new Error('Gemini analysis failed after all retries');
}

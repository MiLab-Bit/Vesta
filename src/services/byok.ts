
const KEY_STORE = 'vesta_gemini_key';
const MODEL_STORE = 'vesta_gemini_model';

export function getGeminiKey(store: Storage = localStorage): string {
  try {
    return store.getItem(KEY_STORE)?.trim() || '';
  } catch {
    return '';
  }
}

export function setGeminiKey(key: string, store: Storage = localStorage): void {
  try {
    store.setItem(KEY_STORE, key.trim());
  } catch {
  }
}

export function clearGeminiKey(store: Storage = localStorage): void {
  try {
    store.removeItem(KEY_STORE);
  } catch {
  }
}

export function hasGeminiKey(store: Storage = localStorage): boolean {
  return getGeminiKey(store).length > 0;
}

export function getGeminiModel(store: Storage = localStorage): string {
  try {
    return store.getItem(MODEL_STORE)?.trim() || 'gemini-2.0-flash';
  } catch {
    return 'gemini-2.0-flash';
  }
}

export function setGeminiModel(model: string, store: Storage = localStorage): void {
  try {
    store.setItem(MODEL_STORE, model.trim() || 'gemini-2.0-flash');
  } catch {
  }
}

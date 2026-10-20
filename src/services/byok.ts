/**
 * Vesta BYOK（Bring Your Own Key）—— 用户自持 Gemini Key。
 *
 * 设计目标：消除「为藏 LLM key 而硬加 BFF + /api 端点」的反模式。
 * - Key 仅存浏览器 localStorage，从不进入构建产物，也绝不上传服务端；
 * - 浏览器直连 Gemini（配合 gemini.ts 的 analyzeWithKey）；
 * - 平台侧零 LLM key、零代理端点，故无需 /api/analyze 这类 BFF 后端。
 */

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
    /* 隐私模式 / 存储已满 -> 静默失败 */
  }
}

export function clearGeminiKey(store: Storage = localStorage): void {
  try {
    store.removeItem(KEY_STORE);
  } catch {
    /* ignore */
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
    /* ignore */
  }
}

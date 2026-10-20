import { useEffect, useState } from 'react';
import { getGeminiKey, setGeminiKey, clearGeminiKey, hasGeminiKey, getGeminiModel, setGeminiModel } from '../services/byok';
import { remaining, QUOTA_LIMIT } from '../services/quota';

/**
 * 浏览器端 BYOK 设置面板：用户输入自己的 Gemini Key（存 localStorage），
 * Key 仅留本地、直连 Google，平台不持有任何 LLM key，也无需服务端代理。
 */
export function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [hasKey, setHasKey] = useState(false);
  const [quotaLeft, setQuotaLeft] = useState(QUOTA_LIMIT);

  useEffect(() => {
    if (!open) return;
    setHasKey(hasGeminiKey());
    setKey(getGeminiKey());
    setModel(getGeminiModel());
    setQuotaLeft(remaining());
  }, [open]);

  const save = () => {
    if (key.trim()) setGeminiKey(key.trim());
    setGeminiModel(model.trim() || 'gemini-2.0-flash');
    setHasKey(true);
    setOpen(false);
  };

  const clear = () => {
    clearGeminiKey();
    setHasKey(false);
    setKey('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title="配置 Gemini Key (BYOK)"
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 text-sm"
      >
        <i className="fa-solid fa-key" />
        <span className="hidden sm:inline">AI Key</span>
        {hasKey
          ? <i className="fa-solid fa-circle-check text-green-600" />
          : <i className="fa-solid fa-circle-exclamation text-amber-500" />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-neutral-200 p-4 z-50 text-left">
          <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
            Vesta 在浏览器端用你自己的 Gemini Key 直连 Google（每浏览器每日 3 次 AI 配额）。Key 仅存本地浏览器，不会上传服务器。
          </p>
          <label className="block text-xs text-neutral-500 mb-1">Gemini API Key</label>
          <input
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="AIza..."
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-2 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <label className="block text-xs text-neutral-500 mb-1">模型（可选）</label>
          <input
            type="text"
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">剩余配额 {quotaLeft}/{QUOTA_LIMIT}</span>
            <div className="flex gap-2">
              <button type="button" onClick={clear} className="text-xs text-red-500 hover:text-red-700 px-2 py-1">清除</button>
              <button type="button" onClick={save} className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded-lg">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

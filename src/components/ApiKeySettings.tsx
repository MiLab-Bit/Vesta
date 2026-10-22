import { useEffect, useState } from 'react';
import { getGeminiKey, setGeminiKey, clearGeminiKey, hasGeminiKey, getGeminiModel, setGeminiModel } from '../services/byok';
import { remaining, QUOTA_LIMIT } from '../services/quota';

export function ApiKeySettings() {
  const [key, setKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [hasKey, setHasKey] = useState(false);
  const [quotaLeft, setQuotaLeft] = useState(QUOTA_LIMIT);

  useEffect(() => {
    setHasKey(hasGeminiKey());
    setKey(getGeminiKey());
    setModel(getGeminiModel());
    setQuotaLeft(remaining());
  }, []);

  const save = () => {
    if (key.trim()) setGeminiKey(key.trim());
    setGeminiModel(model.trim() || 'gemini-2.0-flash');
    setHasKey(true);
    setQuotaLeft(remaining());
  };

  const clear = () => {
    clearGeminiKey();
    setHasKey(false);
    setKey('');
    setQuotaLeft(remaining());
  };

  return (
    <div className="max-w-xl bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
      <h2 className="text-lg font-bold text-neutral-800 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-key text-gold-500" />
        AI Key 设置（BYOK）
      </h2>
      <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
        Vesta 在浏览器端用你自己的 Gemini Key 直连 Google（每浏览器每日 3 次 AI 配额）。Key 仅存本地浏览器，不会上传服务器。
      </p>
      <div className="mb-4 flex items-center gap-2 text-sm">
        {hasKey
          ? <><i className="fa-solid fa-circle-check text-green-600" /><span className="text-neutral-600">已配置 Key</span></>
          : <><i className="fa-solid fa-circle-exclamation text-amber-500" /><span className="text-neutral-500">未配置 Key（将使用内置启发式分析）</span></>}
      </div>
      <label className="block text-xs text-neutral-500 mb-1">Gemini API Key</label>
      <input
        type="password"
        value={key}
        onChange={e => setKey(e.target.value)}
        placeholder="AIza..."
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-neutral-400"
      />
      <label className="block text-xs text-neutral-500 mb-1">模型（可选）</label>
      <input
        type="text"
        value={model}
        onChange={e => setModel(e.target.value)}
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-neutral-400"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">剩余配额 {quotaLeft}/{QUOTA_LIMIT}</span>
        <div className="flex gap-2">
          <button type="button" onClick={clear} className="text-xs text-red-500 hover:text-red-700 px-2 py-1">清除</button>
          <button type="button" onClick={save} className="text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded-lg">保存</button>
        </div>
      </div>
    </div>
  );
}

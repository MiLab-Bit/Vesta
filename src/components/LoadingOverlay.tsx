import type { LoadingProgress } from '../types';
import { cn } from '../utils/helpers';

interface LoadingOverlayProps {
  progress: LoadingProgress;
  visible: boolean;
}

export function LoadingOverlay({ progress, visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-white/90 z-[100] flex flex-col items-center justify-center',
        'backdrop-blur-sm transition-opacity duration-300'
      )}
    >
      <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
        {/* Outer slow spin */}
        <i
          className="fa-brands fa-google text-blue-500 text-3xl absolute animate-spin"
          style={{ animationDuration: '3s' }}
        />
        {/* Inner brain */}
        <i className="fa-solid fa-brain text-brand-600 text-5xl absolute" />
      </div>

      <h2 className="text-2xl font-bold text-neutral-800 mb-2">Gemini 正在分析开发者画像</h2>

      <p className="text-brand-600 mt-2 text-sm font-medium animate-pulse">
        {progress.text}
      </p>

      <div className="w-64 bg-neutral-200 rounded-full h-1.5 mt-4 overflow-hidden">
        <div
          className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
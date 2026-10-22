import type { ReactNode } from 'react';

export function Dim({ label, v }: { label: string; v: number }) {
  const color = v >= 70 ? '#16a34a' : v >= 40 ? '#C9A24B' : '#94a3b8';
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold" style={{ color }}>{v}</span>
    </div>
  );
}

export function StatCard({ title, value, description, icon }: {
  title: string; value: string | number; description: string; icon: ReactNode;
}) {
  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
      <h4 className="font-bold text-sm text-neutral-800 mb-1 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <p className="text-2xl font-bold text-neutral-700">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{description}</p>
    </div>
  );
}

export function HealthStat({ title, value, desc }: { title: string; value: number | string; desc: string }) {
  return (
    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100">
      <h4 className="font-bold text-sm text-neutral-800 mb-1">{title}</h4>
      <p className="text-2xl font-bold text-indigo-600">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{desc}</p>
    </div>
  );
}

export function RepoContributorBars({ items }: { items: { name: string; contributors: number; isFork: boolean; stars: number }[] }) {
  const data = items.filter(r => r.contributors > 0);
  if (data.length === 0) return <p className="text-sm text-neutral-400">头部仓库贡献者数据不足</p>;
  const max = Math.max(1, ...data.map(r => r.contributors));
  return (
    <div className="space-y-2">
      {data.map(r => (
        <div key={r.name} className="flex items-center gap-2 text-xs">
          <span className="w-36 truncate text-neutral-600" title={r.name}>{r.name}</span>
          <div className="flex-1 h-3 bg-neutral-100 rounded overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded"
              style={{ width: `${(r.contributors / max) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right text-neutral-500">{r.contributors}</span>
        </div>
      ))}
    </div>
  );
}

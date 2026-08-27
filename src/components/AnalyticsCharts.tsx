
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Radar, Doughnut } from 'react-chartjs-2';
import type { RadarScores, LanguageStat } from '../types';
import { cn } from '../utils/helpers';

// Register Chart.js components once
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale
);

// ==================== Radar Chart ====================

interface AbilityRadarProps {
  scores: RadarScores;
}

const RADAR_LABELS = ['代码深度', '技术广度', '影响力·触达', '协作', '持续度'];

export function AbilityRadar({ scores }: AbilityRadarProps) {
  const data = {
    labels: RADAR_LABELS,
    datasets: [{
      label: '能力五维分值',
      data: [
        scores.depth,
        scores.breadth,
        scores.influence,
        scores.collaboration,
        scores.sustainability,
      ],
      backgroundColor: 'rgba(201, 162, 75, 0.18)',
      borderColor: '#C9A24B',
      pointBackgroundColor: '#C9A24B',
      pointBorderColor: '#fff',
      borderWidth: 2,
      pointRadius: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(0,0,0,0.06)' },
        grid: { color: 'rgba(0,0,0,0.06)' },
        pointLabels: {
          font: { size: 12, weight: 600 },
          color: '#475569',
        },
        ticks: { display: false, min: 0, max: 100, stepSize: 20 },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    plugins: { legend: { display: false } },
  } as const;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 320 }}>
      <Radar data={data} options={options} />
    </div>
  );
}

// ==================== Language Doughnut Chart ====================

const LANG_COLORS = ['#3b82f6', '#eab308', '#06b6d4', '#f97316', '#8b5cf6', '#ec4899'];

interface LanguageDoughnutProps {
  langs: LanguageStat[];
}

export function LanguageDoughnut({ langs }: LanguageDoughnutProps) {
  const topLangs = langs.slice(0, 5);
  const hasData = topLangs.length > 0;

  const data = {
    labels: hasData ? topLangs.map(l => l.name) : ['无数据'],
    datasets: [{
      data: hasData ? topLangs.map(l => l.count) : [1],
      backgroundColor: hasData ? LANG_COLORS : ['#e2e8f0'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          font: { size: 12 },
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} 库`,
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 220 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

// ==================== Skill Tags ====================

interface SkillTagsProps {
  langs: LanguageStat[];
  limit?: number;
}

export function SkillTags({ langs, limit = 12 }: SkillTagsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {langs.slice(0, limit).map((lang, i) => (
        <span
          key={lang.name}
          className={cn(
            'px-3 py-1.5 text-sm rounded-full font-medium shadow-sm transition-transform hover:scale-105',
            i < 2
              ? 'bg-neutral-800 text-white'
              : i < 5
              ? 'bg-brand-50 text-brand-700 border border-brand-200'
              : 'bg-neutral-50 border border-neutral-200 text-neutral-600'
          )}
        >
          {lang.name}
          {i < 3 && (
            <span className="ml-1 text-xs opacity-70">{lang.percentage}%</span>
          )}
        </span>
      ))}
      {langs.length === 0 && (
        <span className="text-sm text-neutral-400">数据不足</span>
      )}
    </div>
  );
}

// ==================== Score Ring (heat / capability) ====================

interface ScoreRingProps {
  label: string;
  score: number;
  sub?: string;
  color?: string;
}

export function ScoreRing({ label, score, sub, color = '#C9A24B' }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" className="-rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#eef2f7" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-neutral-800">{clamped}</span>
          <span className="text-xs text-neutral-400">/ 100</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-neutral-700 text-center">{label}</p>
      {sub && <p className="text-xs text-neutral-500 text-center mt-0.5">{sub}</p>}
    </div>
  );
}

// ==================== Language Bytes Bar ====================

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let i = -1;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

interface LanguageBytesBarProps {
  langs: LanguageStat[];
}

export function LanguageBytesBar({ langs }: LanguageBytesBarProps) {
  const top = langs.slice(0, 8);
  if (top.length === 0) {
    return <p className="text-sm text-neutral-400">数据不足（可能需要 VITE_GITHUB_TOKEN 提升限额）</p>;
  }
  return (
    <div className="space-y-2.5">
      {top.map((l, i) => (
        <div key={l.name}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-600 font-medium">{l.name}</span>
            <span className="text-neutral-400">{l.percentage}% · {formatBytes(l.count)}</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${l.percentage}%`, background: LANG_COLORS[i % LANG_COLORS.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
import type { GitHubUser, RepoStats, AcademicProfile, OrgInfo } from '../types';
import { formatAccountAge, normalizeBlogUrl } from '../utils/formatters';
import { formatNumber } from '../utils/helpers';

interface UserCardProps {
  user: GitHubUser;
  stats: RepoStats;
  academic?: AcademicProfile;
  orgs?: OrgInfo[];
  onSearch?: (username: string) => void;
}

export function UserCard({ user, stats, academic, orgs = [] }: UserCardProps) {
  const ageYears = formatAccountAge(user.created_at).replace(' 年', '');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-500 to-indigo-500 opacity-10" />

      <div className="relative z-10">
        <div className="w-24 h-24 mx-auto rounded-full border-4 border-white shadow-md overflow-hidden mb-4 bg-white">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 line-clamp-1">
          {user.name || user.login}
        </h2>
        <p className="text-brand-600 font-medium text-sm mb-2">@{user.login}</p>
        <p className="text-neutral-500 text-xs mb-4 min-h-[40px] line-clamp-3">
          {user.bio || 'No bio provided.'}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {user.location && (
            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md">
              <i className="fa-solid fa-location-dot mr-1"></i>
              {user.location}
            </span>
          )}
          {user.company && (
            <span className="px-2 py-1 bg-brand-50 text-brand-600 text-xs rounded-md border border-brand-100">
              <i className="fa-solid fa-building mr-1"></i>
              {user.company}
            </span>
          )}
          {academic?.isAcademic && (
            <span className="px-2 py-1 bg-gold-50 text-gold-700 text-xs rounded-md border border-gold-200" title={academic.institution || '学术背景'}>
              <i className="fa-solid fa-graduation-cap mr-1"></i>
              学术背景
            </span>
          )}
        </div>

        {orgs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {orgs.slice(0, 4).map(o => (
              <a
                key={o.login}
                href={o.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 bg-neutral-50 text-neutral-600 text-xs rounded-md border border-neutral-200 hover:border-brand-300 hover:text-brand-600 transition-colors"
                title={o.description || o.login}
              >
                <i className="fa-solid fa-people-group mr-1 text-neutral-400"></i>
                {o.login}
              </a>
            ))}
            {orgs.length > 4 && (
              <span className="px-2 py-0.5 text-neutral-400 text-xs">+{orgs.length - 4}</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-left border-t border-neutral-100 pt-4">
          <StatItem
            label="Total Stars"
            value={formatNumber(stats.totalStars)}
            icon={<i className="fa-solid fa-star text-yellow-400 text-sm"></i>}
          />
          <StatItem label="Followers" value={formatNumber(user.followers)} />
          <StatItem label="Public Repos" value={user.public_repos} />
          <StatItem label="Acct Age" value={`${ageYears} Y`} />
        </div>

        <div className="border-t border-neutral-100 pt-4 mt-4">
          <div className="space-y-2 text-left">
            <SocialLink
              icon="fa-brands fa-github"
              label={`github.com/${user.login}`}
              href={user.html_url}
            />
            {user.blog && (
              <SocialLink
                icon="fa-solid fa-link"
                label={user.blog.replace(/^https?:\/\//, '')}
                href={normalizeBlogUrl(user.blog)}
              />
            )}
            {user.twitter_username && (
              <SocialLink
                icon="fa-brands fa-twitter"
                label={`@${user.twitter_username}`}
                href={`https://twitter.com/${user.twitter_username}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-neutral-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-neutral-800 flex items-center gap-1">
        {value}
        {icon}
      </p>
    </div>
  );
}

function SocialLink({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-sm text-neutral-600 hover:text-brand-600 transition-colors"
    >
      <i className={`${icon} w-5 text-center text-base`}></i>
      <span className="truncate">{label}</span>
    </a>
  );
}
import type { GitHubRepo } from '../types';

interface RepoListProps {
  repos: GitHubRepo[];
  limit?: number;
}

export function RepoList({ repos, limit }: RepoListProps) {
  const display = limit ? repos.slice(0, limit) : repos;
  if (display.length === 0) {
    return <p className="text-sm text-neutral-500">无代表性公开项目。</p>;
  }

  return (
    <div className="space-y-5">
      {display.map((repo, index) => (
        <RepoItem key={repo.name} repo={repo} rank={index + 1} />
      ))}
    </div>
  );
}

export function RepoItem({ repo, rank }: { repo: GitHubRepo; rank: number }) {
  const isTop = rank <= 2;
  const dotColor = isTop ? 'bg-brand-500' : 'bg-neutral-400';

  return (
    <div className="relative pl-5 border-l-2 border-neutral-200">
      <div className={`absolute w-3 h-3 ${dotColor} rounded-full -left-[7px] top-1`} />

      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-md font-bold text-neutral-800">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-600 transition-colors"
          >
            {repo.name}
          </a>
        </h3>
      </div>

      <p className="text-sm font-medium text-neutral-600 mb-2">
        {repo.language && (
          <span className="px-1.5 py-0.5 bg-neutral-100 text-xs rounded mr-2 border border-neutral-200">
            {repo.language}
          </span>
        )}
        <span className="text-yellow-600 text-xs">
          <i className="fa-solid fa-star text-yellow-500 mr-0.5" />
          {repo.stargazers_count}
        </span>
        <span className="text-neutral-400 text-xs ml-2">
          <i className="fa-solid fa-code-fork text-neutral-400 mr-0.5" />
          {repo.forks_count}
        </span>
      </p>

      {repo.description && (
        <p className="text-sm text-neutral-600 leading-snug">{repo.description}</p>
      )}
    </div>
  );
}
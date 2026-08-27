export function computeAccountAge(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

export function formatAccountAge(createdAt: string): string {
  const years = computeAccountAge(createdAt);
  return `${years.toFixed(1)} 年`;
}

export function normalizeBlogUrl(blog: string): string {
  if (!blog) return '';
  return blog.startsWith('http') ? blog : `https://${blog}`;
}

export function getInitials(name: string | null, login: string): string {
  if (!name) return login.slice(0, 2).toUpperCase();
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return name.slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
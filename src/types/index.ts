
export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
  twitter_username: string | null;
  hireable: boolean | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  fork: boolean;
  pushed_at: string;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
}


export interface RepoStats {
  totalStars: number;
  totalForks: number;
  totalIssues: number;
  originalRatio: number;   
  licenseRatio: number;    
}

export interface LanguageStat {
  name: string;
  count: number;
  percentage: number;
}

export interface RadarScores {
  depth: number;           
  breadth: number;         
  influence: number;       
  collaboration: number;   
  sustainability: number;  
}

export interface AiAnalysisResult {
  radarScores: RadarScores;
  aiInfluenceLevel: string;
  aiInfluenceDesc: string;
  aiTechLevel: string;
  aiTechDesc: string;
  aiRecommendation: string;
  resumeSummary: string;
  directions: string[];             
  codeCapabilityScore: number;      
  heatScore: number;                
  aiCodeCapabilityNote: string;     
  aiHeatNote: string;               
  aiAcademicNote: string;           
  aiStarNote: string;               
  aiOrgNote: string;                
  aiHealthNote: string;            
  degraded?: boolean;
  byok?: boolean;                  
}


export interface OrgInfo {
  login: string;
  description: string | null;
  avatar_url: string;
  html_url: string;
}

export interface ActivityHeat {
  lastActiveAt: string | null;       
  commits90d: number;                
  pushes90d: number;                 
  recentLangBytes: Record<string, number>; 
  recencyDays: number | null;        
  heatScore: number;                 
  heatLevel: string;                 
}

export interface AcademicProfile {
  orcid: string | null;
  scholar: string | null;            
  semanticScholar: string | null;    
  eduEmail: string | null;
  institution: string | null;        
  isAcademic: boolean;
  links: { label: string; url: string }[];
}

export interface StarAnalysis {
  totalStars: number;
  maxStars: number;
  medianStars: number;
  velocityPerYear: number;           
  topRepoShare: number;              
  tier: string;                      
}

export interface DomainCluster {
  name: string;                      
  weight: number;                    
  repos: number;                     
}

export interface CodeCapability {
  depth: number;            
  breadth: number;         
  influence: number;       
  collaboration: number;   
  sustainability: number;  
  overall: number;         
}

export interface ContributionSignals {
  commits: number;         
  prsAuthored: number;     
  prsMerged: number;       
  issuesAuthored: number;  
  comments: number;        
  reviews: number;         
  orgMemberships: number;  
  window: string;          
}

export interface GraphContributions {
  totalCommits: number;       
  totalPRs: number;           
  totalReviews: number;       
  totalIssues: number;        
  restrictedContributions: number; 
  perRepoCommits: { name: string; commits: number; stars: number; isFork: boolean }[];
  from: string;               
  to: string;                 
  available: boolean;         
}

export interface ContributionHealth {
  elephantFactor: number;     
  concentration: number;      
  busFactor: number;          
  soloRatio: number;          
  repoContributors: { name: string; contributors: number; isFork: boolean; stars: number }[];
  concentrated: boolean;      
  note: string;               
  available: boolean;         
}

export interface HunterData {
  user: GitHubUser;
  repos: GitHubRepo[];
  topRepos: GitHubRepo[];
  bestRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
  aiResult: AiAnalysisResult | null;
  orgs: OrgInfo[];
  academic: AcademicProfile;
  activity: ActivityHeat;
  starAnalysis: StarAnalysis;
  domains: DomainCluster[];
  langBytes: LanguageStat[];         
  codeCapability: CodeCapability;
  graph: GraphContributions;         
  contributionHealth: ContributionHealth; 
  apiStatus: ApiStatus;
}


export type ApiStatus = 'idle' | 'loading' | 'analyzing' | 'success' | 'error' | 'rate_limited' | 'not_found';

export type HunterState = {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  topRepos: GitHubRepo[];
  bestRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
  aiResult: AiAnalysisResult | null;
  orgs: OrgInfo[];
  academic: AcademicProfile;
  activity: ActivityHeat;
  starAnalysis: StarAnalysis;
  domains: DomainCluster[];
  langBytes: LanguageStat[];
  codeCapability: CodeCapability;
  graph: GraphContributions;
  contributionHealth: ContributionHealth;
  status: ApiStatus;
  errorMessage: string | null;
};

export type ActiveTab = 'overview' | 'tech' | 'resume';

export interface LoadingProgress {
  stage: 'fetching' | 'extracting' | 'analyzing';
  text: string;
  percent: number;
}


export interface RadarChartProps {
  scores: RadarScores;
}

export interface LanguageChartProps {
  langs: LanguageStat[];
}

export interface UserCardProps {
  user: GitHubUser;
  stats: RepoStats;
  ageYears: number;
}

export interface RepoListProps {
  repos: GitHubRepo[];
  variant: 'overview' | 'resume';
  limit?: number;
}

export interface SkillTagsProps {
  langs: LanguageStat[];
}

export interface LoadingOverlayProps {
  progress: LoadingProgress;
}


export interface FetchUserResult {
  user: GitHubUser | null;
  status: ApiStatus;
  error?: string;
}

export interface FetchReposResult {
  repos: GitHubRepo[];
  status: ApiStatus;
  error?: string;
}

export interface GeminiAnalysisPayload {
  user: GitHubUser;
  topRepos: GitHubRepo[];
  stats: RepoStats;
  langs: LanguageStat[];
  orgs: OrgInfo[];
  academic: AcademicProfile;
  activity: ActivityHeat;
  starAnalysis: StarAnalysis;
  domains: DomainCluster[];
  langBytes: LanguageStat[];
  codeCapability: CodeCapability;
  graph: GraphContributions;
  contributionHealth: ContributionHealth;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxRetries: number;
}
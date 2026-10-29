/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ReviewType = 'clean-code' | 'security' | 'performance';

export type ProgrammingLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'go'
  | 'php'
  | 'rust'
  | 'ruby'
  | 'cpp'
  | 'sql'
  | 'html-css';

export interface LanguageInfo {
  id: ProgrammingLanguage;
  name: string;
  extension: string;
  color: string; // GitHub official color
}

export interface ReviewIssue {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  line?: number;
  rule: string;
  impact: string;
}

export interface Explanation {
  id: string;
  change: string;
  reason: string;
  principleOrConcept: string;
}

export interface StudyResource {
  id: string;
  title: string;
  url: string;
  description: string;
  tag: string;
}

export interface ScoreCategory {
  category: string;
  score: number;
  weight: number;
  feedback: string;
}

export interface ReviewResult {
  id: string;
  timestamp: number;
  score: number; // 0 to 10
  scoreBreakdown: ScoreCategory[];
  issues: ReviewIssue[]; // Top 3 critical issues
  refactoredCode: string;
  explanations: Explanation[];
  studyResources: StudyResource[];
  summary: string;
  reviewType: ReviewType;
  language: ProgrammingLanguage;
  metrics: {
    linesOfCode: number;
    characterCount: number;
    analysisDurationMs: number;
  };
}

export interface CodeFile {
  id: string;
  projectId: string;
  name: string;
  path?: string;
  language: ProgrammingLanguage;
  originalCode: string;
  lastAnalysis?: ReviewResult;
  createdAt: number;
  updatedAt: number;
}

export interface GitHubRepoMeta {
  owner: string;
  repo: string;
  branch: string;
  url: string;
  stars?: number;
  description?: string;
  isPrivate?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  githubMeta?: GitHubRepoMeta;
  createdAt: number;
  updatedAt: number;
}

export interface LanguageDistribution {
  language: ProgrammingLanguage;
  label: string;
  count: number;
  percentage: number;
  color: string;
  lines: number;
}

export type ThemeMode = 'light' | 'dark';

export interface StorageDataExport {
  version: string;
  exportedAt: string;
  projects: Project[];
  files: CodeFile[];
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
  language?: ProgrammingLanguage;
}

export interface GitHubRepoDetails {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  avatarUrl: string;
  htmlUrl: string;
}

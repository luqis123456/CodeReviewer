/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GitHubRepoDetails, GitHubTreeItem, ProgrammingLanguage } from '../types';

const GITHUB_TOKEN_KEY = 'codereviewer_github_token_v1';

export class GitHubService {
  getToken(): string {
    try {
      return localStorage.getItem(GITHUB_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  }

  setToken(token: string): void {
    try {
      if (token.trim()) {
        localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
      } else {
        localStorage.removeItem(GITHUB_TOKEN_KEY);
      }
    } catch {}
  }

  // Parse GitHub URLs in multiple formats:
  // - https://github.com/owner/repo
  // - https://github.com/owner/repo.git
  // - git@github.com:owner/repo.git
  // - owner/repo
  parseGitHubUrl(input: string): { owner: string; repo: string; branch?: string } | null {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();

    // Format: git@github.com:owner/repo.git
    const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/);
    if (sshMatch) {
      return { owner: sshMatch[1], repo: sshMatch[2] };
    }

    // Format: https://github.com/owner/repo/tree/branch
    const branchMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)/);
    if (branchMatch) {
      return {
        owner: branchMatch[1],
        repo: branchMatch[2].replace(/\.git$/, ''),
        branch: branchMatch[3],
      };
    }

    // Format: https://github.com/owner/repo or http://...
    const httpMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+?)(\.git|\/)?$/);
    if (httpMatch) {
      return {
        owner: httpMatch[1],
        repo: httpMatch[2].replace(/\.git$/, ''),
      };
    }

    // Short format: owner/repo
    const shortMatch = trimmed.match(/^([a-zA-Z0-9_\-.]+)\/([a-zA-Z0-9_\-.]+)$/);
    if (shortMatch) {
      return {
        owner: shortMatch[1],
        repo: shortMatch[2].replace(/\.git$/, ''),
      };
    }

    return null;
  }

  private getHeaders(token?: string): HeadersInit {
    const activeToken = token || this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (activeToken) {
      headers['Authorization'] = `token ${activeToken}`;
    }
    return headers;
  }

  // Fetch repository metadata (stars, description, default branch, owner info)
  async fetchRepoDetails(
    owner: string,
    repo: string,
    customToken?: string
  ): Promise<GitHubRepoDetails> {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await fetch(url, {
      headers: this.getHeaders(customToken),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          'Repositório não encontrado. Verifique se a URL está correta ou se o repositório é privado (neste caso, adicione um Token de Acesso).'
        );
      }
      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        if (rateLimitRemaining === '0') {
          throw new Error(
            'Limite de requisições públicas da API do GitHub atingido (60/hora). Adicione um Personal Access Token (PAT) nas opções para ter 5.000 requisições/hora.'
          );
        }
      }
      throw new Error(`Falha ao acessar repositório do GitHub (HTTP ${response.status})`);
    }

    const data = await response.json();
    return {
      owner: data.owner?.login || owner,
      repo: data.name || repo,
      fullName: data.full_name || `${owner}/${repo}`,
      description: data.description || 'Repositório clonado do GitHub.',
      defaultBranch: data.default_branch || 'main',
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      isPrivate: data.private || false,
      avatarUrl: data.owner?.avatar_url || '',
      htmlUrl: data.html_url || `https://github.com/${owner}/${repo}`,
    };
  }

  // Fetch complete tree of source files recursively
  async fetchRepoTree(
    owner: string,
    repo: string,
    branch: string,
    customToken?: string
  ): Promise<GitHubTreeItem[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const response = await fetch(url, {
      headers: this.getHeaders(customToken),
    });

    if (!response.ok) {
      throw new Error(`Falha ao listar árvore de arquivos da branch '${branch}' (HTTP ${response.status})`);
    }

    const data = await response.json();
    if (!data.tree || !Array.isArray(data.tree)) {
      return [];
    }

    // Filter only source code blobs, exclude binaries, lock files, node_modules, etc.
    const filteredTree: GitHubTreeItem[] = [];
    for (const item of data.tree) {
      if (item.type === 'blob' && !this.isIgnoredPath(item.path)) {
        const lang = this.detectLanguageFromPath(item.path);
        if (lang) {
          filteredTree.push({
            ...item,
            language: lang,
          });
        }
      }
    }

    return filteredTree;
  }

  // Fetch raw content of a specific file
  async fetchFileContent(
    owner: string,
    repo: string,
    branch: string,
    path: string,
    customToken?: string
  ): Promise<string> {
    const token = customToken || this.getToken();

    // If token exists or for maximum reliability, try GitHub API contents first
    if (token) {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await fetch(apiUrl, {
        headers: this.getHeaders(token),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.content && data.encoding === 'base64') {
          // Decode utf8 base64
          try {
            return decodeURIComponent(
              atob(data.content.replace(/\n/g, ''))
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
          } catch {
            return atob(data.content.replace(/\n/g, ''));
          }
        }
      }
    }

    // Direct raw.githubusercontent.com fallback (fast and unauthenticated CORS-friendly)
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const rawResponse = await fetch(rawUrl, {
      headers: token ? { Authorization: `token ${token}` } : undefined,
    });

    if (!rawResponse.ok) {
      throw new Error(`Não foi possível baixar o conteúdo do arquivo '${path}'`);
    }

    return await rawResponse.text();
  }

  // Detect supported programming language from file path extension
  detectLanguageFromPath(path: string): ProgrammingLanguage | null {
    const lower = path.toLowerCase();
    const filename = lower.split('/').pop() || lower;

    // TypeScript / TSX
    if (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.mts')) {
      return 'typescript';
    }
    // JavaScript / JSX / MJS
    if (
      filename.endsWith('.js') ||
      filename.endsWith('.jsx') ||
      filename.endsWith('.mjs') ||
      filename.endsWith('.cjs')
    ) {
      return 'javascript';
    }
    // Python
    if (filename.endsWith('.py') || filename.endsWith('.pyw')) {
      return 'python';
    }
    // Go
    if (filename.endsWith('.go')) {
      return 'go';
    }
    // Rust
    if (filename.endsWith('.rs')) {
      return 'rust';
    }
    // Java
    if (filename.endsWith('.java')) {
      return 'java';
    }
    // C#
    if (filename.endsWith('.cs')) {
      return 'csharp';
    }
    // PHP
    if (filename.endsWith('.php')) {
      return 'php';
    }
    // Ruby
    if (filename.endsWith('.rb')) {
      return 'ruby';
    }
    // C++
    if (
      filename.endsWith('.cpp') ||
      filename.endsWith('.cc') ||
      filename.endsWith('.cxx') ||
      filename.endsWith('.hpp') ||
      filename.endsWith('.c') ||
      filename.endsWith('.h')
    ) {
      return 'cpp';
    }
    // SQL
    if (filename.endsWith('.sql')) {
      return 'sql';
    }
    // HTML / CSS
    if (filename.endsWith('.html') || filename.endsWith('.htm') || filename.endsWith('.css')) {
      return 'html-css';
    }

    return null;
  }

  // Filter out noise, vendor libs, minified bundles, lockfiles
  private isIgnoredPath(path: string): boolean {
    const lower = path.toLowerCase();
    const ignoredPatterns = [
      'node_modules/',
      'dist/',
      'build/',
      'out/',
      '.next/',
      '.git/',
      '.github/',
      'vendor/',
      'target/',
      'coverage/',
      '.vscode/',
      '.idea/',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'bun.lock',
      'composer.lock',
      'gemfile.lock',
      '.min.js',
      '.min.css',
      '.map',
      '.d.ts',
      '.svg',
      '.png',
      '.jpg',
      '.jpeg',
      '.ico',
      '.gif',
      '.pdf',
      '.zip',
      '.tar',
    ];

    return ignoredPatterns.some((pattern) => lower.includes(pattern));
  }
}

export const githubService = new GitHubService();

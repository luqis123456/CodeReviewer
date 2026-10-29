/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CodeFile,
  GitHubRepoMeta,
  LanguageDistribution,
  ProgrammingLanguage,
  Project,
  ReviewResult,
  StorageDataExport,
  ThemeMode,
} from '../types';
import { getLanguageInfo } from '../utils/languages';

const STORAGE_KEYS = {
  PROJECTS: 'codereviewer_projects_v1',
  FILES: 'codereviewer_files_v1',
  THEME: 'codereviewer_theme_v1',
  ACTIVE_PROJECT_ID: 'codereviewer_active_project_id_v1',
  ACTIVE_FILE_ID: 'codereviewer_active_file_id_v1',
};

// Initial sample seed projects to give a great first-time onboarding experience
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'project-default-1',
    name: 'Backend API & Microsserviços',
    description: 'Endpoints de autenticação, catálogo e queries de banco de dados.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'project-default-2',
    name: 'Algoritmos & Processamento de Dados',
    description: 'Rotinas de agregação, filtros de alta volumetria e ETL.',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000 * 12,
  },
];

const INITIAL_FILES: CodeFile[] = [
  {
    id: 'file-sample-sql',
    projectId: 'project-default-1',
    name: 'authController.ts',
    language: 'typescript',
    originalCode: `import { Request, Response } from 'express';
import db from '../db';

// Busca dados de usuário para autenticação
export async function loginUser(req: Request, res: Response) {
  const { username, password } = req.body;
  
  // Vulnerabilidade crítica: Concatenação direta de parâmetros na query SQL
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  
  try {
    const user = await db.query(query);
    if (user.length > 0) {
      return res.json({ token: "fake_token_jwt_12345", user: user[0] });
    }
    return res.status(401).json({ error: "Credenciais inválidas" });
  } catch (err: any) {
    // Vazamento de detalhes internos de infraestrutura
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}`,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'file-sample-perf',
    projectId: 'project-default-2',
    name: 'duplicate_finder.py',
    language: 'python',
    originalCode: `def find_common_transactions(list_a, list_b):
    # Loop aninhado gerando complexidade O(N * M)
    common_items = []
    
    for item_a in list_a:
        for item_b in list_b:
            if item_a['id'] == item_b['id']:
                # Operação ineficiente repetida
                if item_a not in common_items:
                    common_items.append(item_a)
                    
    return common_items`,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'file-sample-clean',
    projectId: 'project-default-1',
    name: 'orderProcessor.js',
    language: 'javascript',
    originalCode: `// Processa pedidos e envia notificações
function p(d, u) {
  let t = 0;
  // números mágicos e variáveis sem semântica
  for (let i = 0; i < d.items.length; i++) {
    t += d.items[i].v * 1.15;
  }
  
  if (t > 500) {
    t = t * 0.90; // desconto arbitrário
  }
  
  console.log("Processado com sucesso para o user: " + u);
  return t;
}`,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 3600000 * 2,
  },
];

class StorageService {
  // Theme Management
  getTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Check system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'dark';
    }
  }

  setTheme(mode: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, mode);
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignored in restricted environments
    }
  }

  // Active Context
  getActiveProjectId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    } catch {
      return null;
    }
  }

  setActiveProjectId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
      }
    } catch {}
  }

  getActiveFileId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_FILE_ID);
    } catch {
      return null;
    }
  }

  setActiveFileId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_FILE_ID);
      }
    } catch {}
  }

  // Projects CRUD (RF10 & RF13)
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        this.saveProjects(INITIAL_PROJECTS);
        return INITIAL_PROJECTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PROJECTS;
    }
  }

  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Falha ao salvar projetos no LocalStorage:', e);
    }
  }

  createProject(name: string, description?: string, githubMeta?: GitHubRepoMeta): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: name.trim() || 'Novo Projeto',
      description: description?.trim() || '',
      githubMeta,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newProject, ...projects];
    this.saveProjects(updated);
    this.setActiveProjectId(newProject.id);
    return newProject;
  }

  createProjectFromGitHub(
    meta: GitHubRepoMeta,
    importedFiles: { name: string; path: string; language: ProgrammingLanguage; content: string }[]
  ): { project: Project; files: CodeFile[] } {
    const projectName = `${meta.owner}/${meta.repo}`;
    const description = meta.description || `Repositório clonado do GitHub (${meta.branch})`;
    const project = this.createProject(projectName, description, meta);

    const now = Date.now();
    const createdFiles: CodeFile[] = importedFiles.map((file, idx) => ({
      id: 'file-gh-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 7),
      projectId: project.id,
      name: file.name,
      path: file.path,
      language: file.language,
      originalCode: file.content,
      createdAt: now,
      updatedAt: now,
    }));

    const existingFiles = this.getFiles();
    const allFiles = [...createdFiles, ...existingFiles];
    this.saveFiles(allFiles);

    if (createdFiles.length > 0) {
      this.setActiveFileId(createdFiles[0].id);
    }

    return { project, files: createdFiles };
  }

  updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description'>>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updatedProject: Project = {
      ...projects[index],
      ...updates,
      updatedAt: Date.now(),
    };
    projects[index] = updatedProject;
    this.saveProjects(projects);
    return updatedProject;
  }

  deleteProject(id: string): void {
    // Remove project
    const projects = this.getProjects().filter((p) => p.id !== id);
    this.saveProjects(projects);

    // Cascading delete: Remove all files associated with this project (RF13)
    const files = this.getFiles().filter((f) => f.projectId !== id);
    this.saveFiles(files);

    // Reset active project if deleted
    if (this.getActiveProjectId() === id) {
      this.setActiveProjectId(projects.length > 0 ? projects[0].id : null);
      this.setActiveFileId(null);
    }
  }

  // Files CRUD (RF01, RF10 & RF13)
  getFiles(projectId?: string): CodeFile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FILES);
      let files: CodeFile[] = [];
      if (!data) {
        this.saveFiles(INITIAL_FILES);
        files = INITIAL_FILES;
      } else {
        files = JSON.parse(data);
      }
      if (projectId) {
        return files.filter((f) => f.projectId === projectId);
      }
      return files;
    } catch {
      return INITIAL_FILES;
    }
  }

  getFileById(id: string): CodeFile | null {
    const files = this.getFiles();
    return files.find((f) => f.id === id) || null;
  }

  saveFiles(files: CodeFile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    } catch (e) {
      console.error('Falha ao salvar arquivos no LocalStorage:', e);
    }
  }

  createOrUpdateFile(fileData: {
    id?: string;
    projectId: string;
    name: string;
    language: ProgrammingLanguage;
    originalCode: string;
  }): CodeFile {
    const files = this.getFiles();
    const now = Date.now();

    if (fileData.id) {
      const existingIndex = files.findIndex((f) => f.id === fileData.id);
      if (existingIndex !== -1) {
        const updated: CodeFile = {
          ...files[existingIndex],
          name: fileData.name.trim() || files[existingIndex].name,
          language: fileData.language,
          originalCode: fileData.originalCode,
          projectId: fileData.projectId,
          updatedAt: now,
        };
        files[existingIndex] = updated;
        this.saveFiles(files);
        return updated;
      }
    }

    // Create new file
    const newFile: CodeFile = {
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      projectId: fileData.projectId,
      name: fileData.name.trim() || `snippet.${getLanguageInfo(fileData.language).extension.replace('.', '')}`,
      language: fileData.language,
      originalCode: fileData.originalCode,
      createdAt: now,
      updatedAt: now,
    };
    const updatedList = [newFile, ...files];
    this.saveFiles(updatedList);
    this.setActiveFileId(newFile.id);
    return newFile;
  }

  saveAnalysisResult(fileId: string, result: ReviewResult): CodeFile | null {
    const files = this.getFiles();
    const index = files.findIndex((f) => f.id === fileId);
    if (index === -1) return null;

    const updated: CodeFile = {
      ...files[index],
      lastAnalysis: result,
      updatedAt: Date.now(),
    };
    files[index] = updated;
    this.saveFiles(files);
    return updated;
  }

  deleteFile(id: string): void {
    const files = this.getFiles().filter((f) => f.id !== id);
    this.saveFiles(files);

    if (this.getActiveFileId() === id) {
      this.setActiveFileId(null);
    }
  }

  // Language Distribution (RF11 - GitHub Style Bar)
  getLanguageStats(projectId?: string): LanguageDistribution[] {
    const files = this.getFiles(projectId);
    if (files.length === 0) return [];

    const statsMap: Record<string, { count: number; lines: number }> = {};
    let totalLines = 0;

    files.forEach((file) => {
      const lines = Math.max(1, (file.originalCode || '').split('\n').length);
      totalLines += lines;
      if (!statsMap[file.language]) {
        statsMap[file.language] = { count: 0, lines: 0 };
      }
      statsMap[file.language].count += 1;
      statsMap[file.language].lines += lines;
    });

    if (totalLines === 0) return [];

    const distributions: LanguageDistribution[] = Object.keys(statsMap).map((langKey) => {
      const lang = langKey as ProgrammingLanguage;
      const info = getLanguageInfo(lang);
      const lines = statsMap[lang].lines;
      const percentage = Math.round((lines / totalLines) * 1000) / 10; // 1 decimal place

      return {
        language: lang,
        label: info.name,
        count: statsMap[lang].count,
        lines,
        percentage,
        color: info.color,
      };
    });

    // Sort by percentage descending (standard GitHub behavior)
    return distributions.sort((a, b) => b.percentage - a.percentage);
  }

  // Import / Export & Reset (RF12)
  exportData(): string {
    const exportObject: StorageDataExport = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects: this.getProjects(),
      files: this.getFiles(),
    };
    return JSON.stringify(exportObject, null, 2);
  }

  importData(jsonString: string): {
    success: boolean;
    error?: string;
    projectsCount?: number;
    filesCount?: number;
  } {
    try {
      const parsed = JSON.parse(jsonString) as Partial<StorageDataExport>;
      if (!parsed.projects || !Array.isArray(parsed.projects) || !parsed.files || !Array.isArray(parsed.files)) {
        return {
          success: false,
          error: 'Formato de arquivo JSON inválido. Verifique se o arquivo foi exportado pelo CodeReviewer.',
        };
      }

      this.saveProjects(parsed.projects);
      this.saveFiles(parsed.files);

      if (parsed.projects.length > 0) {
        this.setActiveProjectId(parsed.projects[0].id);
      }
      if (parsed.files.length > 0) {
        this.setActiveFileId(parsed.files[0].id);
      }

      return {
        success: true,
        projectsCount: parsed.projects.length,
        filesCount: parsed.files.length,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Erro ao processar JSON: ${err.message || 'arquivo corrompido'}`,
      };
    }
  }

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.FILES);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_FILE_ID);
      // Re-initialize sample data so user isn't stranded
      this.saveProjects(INITIAL_PROJECTS);
      this.saveFiles(INITIAL_FILES);
      this.setActiveProjectId(INITIAL_PROJECTS[0].id);
      this.setActiveFileId(INITIAL_FILES[0].id);
    } catch (e) {
      console.error('Falha ao resetar dados:', e);
    }
  }
}

export const storageService = new StorageService();

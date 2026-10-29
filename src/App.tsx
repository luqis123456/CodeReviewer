/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { ProjectSidebar } from './components/ProjectSidebar';
import { FileNavigation } from './components/FileNavigation';
import { CodeEditor } from './components/CodeEditor';
import { AnalysisResults } from './components/AnalysisResults';
import { HistoryDashboard } from './components/HistoryDashboard';
import { ConfirmModal } from './components/ConfirmModal';
import { BackupModal } from './components/BackupModal';
import { GitHubImportModal } from './components/GitHubImportModal';
import {
  CodeFile,
  LanguageDistribution,
  ProgrammingLanguage,
  Project,
  ReviewResult,
  ReviewType,
  ThemeMode,
} from './types';
import { storageService } from './services/storageService';
import { reviewEngine, CodePreset } from './services/reviewEngine';
import { getLanguageInfo } from './utils/languages';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'editor' | 'dashboard'>('editor');

  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => storageService.getTheme());

  // Projects & Files State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Editor State
  const [currentCode, setCurrentCode] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<ProgrammingLanguage>('typescript');
  const [currentReviewType, setCurrentReviewType] = useState<ReviewType>('clean-code');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ReviewResult | null>(null);

  // Modals State
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    type: 'project' | 'file';
    item: Project | CodeFile | null;
  }>({
    isOpen: false,
    type: 'file',
    item: null,
  });

  // Apply theme class on body / document
  useEffect(() => {
    storageService.setTheme(theme);
  }, [theme]);

  // Initial Data Load from LocalStorage (RF12)
  const refreshStorageData = () => {
    const loadedProjects = storageService.getProjects();
    const loadedFiles = storageService.getFiles();

    setProjects(loadedProjects);
    setFiles(loadedFiles);

    // Determine active project
    let activeProjId = storageService.getActiveProjectId();
    if (!activeProjId || !loadedProjects.some((p) => p.id === activeProjId)) {
      activeProjId = loadedProjects.length > 0 ? loadedProjects[0].id : null;
      storageService.setActiveProjectId(activeProjId);
    }
    setActiveProjectId(activeProjId);

    // Determine active file for active project
    let activeFId = storageService.getActiveFileId();
    const projectFiles = loadedFiles.filter((f) => f.projectId === activeProjId);
    if (!activeFId || !projectFiles.some((f) => f.id === activeFId)) {
      activeFId = projectFiles.length > 0 ? projectFiles[0].id : null;
      storageService.setActiveFileId(activeFId);
    }
    setActiveFileId(activeFId);

    // Set editor code from active file
    if (activeFId) {
      const activeFile = loadedFiles.find((f) => f.id === activeFId);
      if (activeFile) {
        setCurrentCode(activeFile.originalCode);
        setCurrentLanguage(activeFile.language);
        setCurrentAnalysis(activeFile.lastAnalysis || null);
      }
    } else {
      setCurrentCode('');
      setCurrentAnalysis(null);
    }
  };

  useEffect(() => {
    refreshStorageData();
  }, []);

  // When active file changes
  const handleSelectFile = (fileId: string) => {
    setActiveFileId(fileId);
    storageService.setActiveFileId(fileId);
    const file = files.find((f) => f.id === fileId);
    if (file) {
      setCurrentCode(file.originalCode);
      setCurrentLanguage(file.language);
      setCurrentAnalysis(file.lastAnalysis || null);
    }
  };

  // When active project changes
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    storageService.setActiveProjectId(projectId);
    const projectFiles = files.filter((f) => f.projectId === projectId);
    const firstFileId = projectFiles.length > 0 ? projectFiles[0].id : null;
    setActiveFileId(firstFileId);
    storageService.setActiveFileId(firstFileId);

    if (firstFileId) {
      const activeFile = projectFiles[0];
      setCurrentCode(activeFile.originalCode);
      setCurrentLanguage(activeFile.language);
      setCurrentAnalysis(activeFile.lastAnalysis || null);
    } else {
      setCurrentCode('');
      setCurrentAnalysis(null);
    }
  };

  // Code change in editor (auto-sync to current active file if exists)
  const handleChangeCode = (newCode: string) => {
    setCurrentCode(newCode);
    if (activeFileId && activeProjectId) {
      storageService.createOrUpdateFile({
        id: activeFileId,
        projectId: activeProjectId,
        name: files.find((f) => f.id === activeFileId)?.name || 'snippet.ts',
        language: currentLanguage,
        originalCode: newCode,
      });
      // Update in memory
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFileId ? { ...f, originalCode: newCode } : f))
      );
    }
  };

  // Language change
  const handleChangeLanguage = (newLang: ProgrammingLanguage) => {
    setCurrentLanguage(newLang);
    if (activeFileId && activeProjectId) {
      storageService.createOrUpdateFile({
        id: activeFileId,
        projectId: activeProjectId,
        name: files.find((f) => f.id === activeFileId)?.name || 'snippet.ts',
        language: newLang,
        originalCode: currentCode,
      });
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFileId ? { ...f, language: newLang } : f))
      );
    }
  };

  // Run Code Review (RF01 - RF08)
  const handleAnalyze = async () => {
    if (!currentCode.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await reviewEngine.analyzeCode(
        currentCode,
        currentLanguage,
        currentReviewType
      );

      setCurrentAnalysis(result);

      // If active file exists, save analysis to LocalStorage (RF12)
      if (activeFileId) {
        storageService.saveAnalysisResult(activeFileId, result);
        setFiles((prev) =>
          prev.map((f) => (f.id === activeFileId ? { ...f, lastAnalysis: result } : f))
        );
      } else if (activeProjectId) {
        // If no file was active, create one to persist analysis
        const newFile = storageService.createOrUpdateFile({
          projectId: activeProjectId,
          name: `analise_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}${
            getLanguageInfo(currentLanguage).extension
          }`,
          language: currentLanguage,
          originalCode: currentCode,
        });
        storageService.saveAnalysisResult(newFile.id, result);
        setFiles(storageService.getFiles());
        setActiveFileId(newFile.id);
      }
    } catch (error) {
      console.error('Erro ao analisar código:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load Preset
  const handleLoadPreset = (preset: CodePreset) => {
    setCurrentCode(preset.code);
    setCurrentLanguage(preset.language);
    setCurrentReviewType(preset.reviewType);

    if (activeFileId && activeProjectId) {
      storageService.createOrUpdateFile({
        id: activeFileId,
        projectId: activeProjectId,
        name: files.find((f) => f.id === activeFileId)?.name || 'snippet.ts',
        language: preset.language,
        originalCode: preset.code,
      });
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? { ...f, originalCode: preset.code, language: preset.language }
            : f
        )
      );
    }
  };

  // Project CRUD
  const handleCreateProject = (name: string, description?: string) => {
    const newProj = storageService.createProject(name, description);
    // Create an initial file for this project
    const initialFile = storageService.createOrUpdateFile({
      projectId: newProj.id,
      name: `index.ts`,
      language: 'typescript',
      originalCode: `// Código do projeto: ${name}\n\nexport function example() {\n  return "Hello CodeReviewer";\n}`,
    });

    setProjects(storageService.getProjects());
    setFiles(storageService.getFiles());
    setActiveProjectId(newProj.id);
    setActiveFileId(initialFile.id);
    setCurrentCode(initialFile.originalCode);
    setCurrentLanguage(initialFile.language);
    setCurrentAnalysis(null);
  };

  const handleUpdateProject = (id: string, name: string) => {
    storageService.updateProject(id, { name });
    setProjects(storageService.getProjects());
  };

  // File CRUD
  const handleCreateFile = (name: string, language: ProgrammingLanguage) => {
    if (!activeProjectId) return;
    const newFile = storageService.createOrUpdateFile({
      projectId: activeProjectId,
      name,
      language,
      originalCode: `// Arquivo: ${name}\n\n`,
    });

    setFiles(storageService.getFiles());
    setActiveFileId(newFile.id);
    setCurrentCode(newFile.originalCode);
    setCurrentLanguage(newFile.language);
    setCurrentAnalysis(null);
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    storageService.createOrUpdateFile({
      id: fileId,
      projectId: file.projectId,
      name: newName,
      language: file.language,
      originalCode: file.originalCode,
    });
    setFiles(storageService.getFiles());
  };

  // Granular Delete (RF13)
  const handleRequestDeleteProject = (project: Project) => {
    setDeleteModalConfig({
      isOpen: true,
      type: 'project',
      item: project,
    });
  };

  const handleRequestDeleteFile = (file: CodeFile) => {
    setDeleteModalConfig({
      isOpen: true,
      type: 'file',
      item: file,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteModalConfig.type === 'project' && deleteModalConfig.item) {
      storageService.deleteProject(deleteModalConfig.item.id);
      refreshStorageData();
    } else if (deleteModalConfig.type === 'file' && deleteModalConfig.item) {
      storageService.deleteFile(deleteModalConfig.item.id);
      refreshStorageData();
    }
    setDeleteModalConfig({ isOpen: false, type: 'file', item: null });
  };

  // Open file in editor from Dashboard
  const handleOpenInEditor = (fileId: string, projectId: string) => {
    setActiveProjectId(projectId);
    storageService.setActiveProjectId(projectId);
    setActiveFileId(fileId);
    storageService.setActiveFileId(fileId);

    const file = files.find((f) => f.id === fileId);
    if (file) {
      setCurrentCode(file.originalCode);
      setCurrentLanguage(file.language);
      setCurrentAnalysis(file.lastAnalysis || null);
    }
    setCurrentTab('editor');
  };

  // GitHub Import Completion
  const handleGitHubImportComplete = (projectId: string, firstFileId?: string) => {
    refreshStorageData();
    handleSelectProject(projectId);
    if (firstFileId) {
      handleSelectFile(firstFileId);
    }
    setCurrentTab('editor');
  };

  // Active Project & Statistics
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeProjectFiles = files.filter((f) => f.projectId === activeProjectId);
  const activeProjectStats = storageService.getLanguageStats(activeProjectId || undefined);
  const globalLanguageStats = storageService.getLanguageStats();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        totalProjects={projects.length}
        totalFiles={files.length}
      />

      {/* Main Content Area */}
      {currentTab === 'dashboard' ? (
        <main className="flex-1 overflow-y-auto">
          <HistoryDashboard
            projects={projects}
            files={files}
            globalLanguageStats={globalLanguageStats}
            onOpenInEditor={handleOpenInEditor}
            onRequestDeleteFile={handleRequestDeleteFile}
          />
        </main>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Projects Sidebar (RF10, RF11, RF13) */}
          <ProjectSidebar
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onRequestDeleteProject={handleRequestDeleteProject}
            onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
            activeProjectStats={activeProjectStats}
            filesCountForProject={(pId) => files.filter((f) => f.projectId === pId).length}
          />

          {/* Editor Workspace & Results Split */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* File Navigation Strip */}
            <FileNavigation
              files={activeProjectFiles}
              activeFileId={activeFileId}
              onSelectFile={handleSelectFile}
              onCreateFile={handleCreateFile}
              onRenameFile={handleRenameFile}
              onRequestDeleteFile={handleRequestDeleteFile}
              projectName={activeProject?.name || 'Projeto'}
            />

            {/* Split Grid: Editor (Left) & Analysis (Right) */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 p-4 overflow-y-auto">
              {/* Left Column: Code Editor */}
              <div className="h-full min-h-[480px]">
                <CodeEditor
                  code={currentCode}
                  onChangeCode={handleChangeCode}
                  language={currentLanguage}
                  onChangeLanguage={handleChangeLanguage}
                  reviewType={currentReviewType}
                  onChangeReviewType={setCurrentReviewType}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  onLoadPreset={handleLoadPreset}
                />
              </div>

              {/* Right Column: Instant Review Results */}
              <div className="h-full min-h-[480px]">
                <AnalysisResults
                  result={currentAnalysis}
                  originalCode={currentCode}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete (RF13) */}
      <ConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={
          deleteModalConfig.type === 'project'
            ? `Excluir Projeto "${(deleteModalConfig.item as Project)?.name}"?`
            : `Excluir Arquivo "${(deleteModalConfig.item as CodeFile)?.name}"?`
        }
        message={
          deleteModalConfig.type === 'project'
            ? 'Esta operação excluirá o projeto e todos os arquivos e históricos associados a ele. O armazenamento local será recalculado instantaneamente.'
            : 'Este arquivo e suas análises associadas serão permanentemente removidos do painel e do armazenamento local.'
        }
        confirmLabel="Excluir Agora"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalConfig({ isOpen: false, type: 'file', item: null })}
      />

      {/* LocalStorage Backup / Import / Export Modal (RF12) */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={refreshStorageData}
      />

      {/* GitHub Clone & Import Modal */}
      <GitHubImportModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onImportComplete={handleGitHubImportComplete}
      />
    </div>
  );
}

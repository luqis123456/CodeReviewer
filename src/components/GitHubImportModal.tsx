/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Github,
  Search,
  Check,
  AlertCircle,
  X,
  FileCode2,
  Star,
  GitBranch,
  Key,
  ChevronDown,
  ChevronUp,
  DownloadCloud,
  CheckSquare,
  Square,
  ExternalLink,
} from 'lucide-react';
import { GitHubRepoDetails, GitHubTreeItem, ProgrammingLanguage } from '../types';
import { githubService } from '../services/githubService';
import { storageService } from '../services/storageService';
import { getLanguageInfo } from '../utils/languages';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (projectId: string, firstFileId?: string) => void;
}

const POPULAR_REPOS = [
  { label: 'Express (JS)', url: 'https://github.com/expressjs/express' },
  { label: 'FastAPI (Python)', url: 'https://github.com/tiangolo/fastapi' },
  { label: 'Zod (TypeScript)', url: 'https://github.com/colinhacks/zod' },
  { label: 'Gin (Go)', url: 'https://github.com/gin-gonic/gin' },
];

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState(() => githubService.getToken());
  const [showTokenConfig, setShowTokenConfig] = useState(false);

  // States
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [repoDetails, setRepoDetails] = useState<GitHubRepoDetails | null>(null);
  const [discoveredFiles, setDiscoveredFiles] = useState<GitHubTreeItem[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [fileSearch, setFileSearch] = useState('');

  // Downloading state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number; currentFile: string }>({
    current: 0,
    total: 0,
    currentFile: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchRepository = async (urlToFetch?: string) => {
    const targetUrl = urlToFetch || repoUrl;
    setErrorMessage(null);
    setRepoDetails(null);
    setDiscoveredFiles([]);
    setSelectedPaths(new Set());

    const parsed = githubService.parseGitHubUrl(targetUrl);
    if (!parsed) {
      setErrorMessage('Por favor, informe uma URL válida do GitHub (ex: https://github.com/owner/repo ou owner/repo).');
      return;
    }

    setIsFetchingInfo(true);
    try {
      // 1. Fetch repo metadata
      const details = await githubService.fetchRepoDetails(parsed.owner, parsed.repo, token);
      const branch = parsed.branch || details.defaultBranch;

      // 2. Fetch repo tree
      const tree = await githubService.fetchRepoTree(parsed.owner, parsed.repo, branch, token);

      setRepoDetails(details);
      setDiscoveredFiles(tree);

      // Pre-select top 8 files or files in root/src
      const topSelected = new Set<string>();
      const priorityFiles = tree
        .sort((a, b) => {
          const aPriority = a.path.includes('src/') || a.path.includes('app/') ? 1 : 0;
          const bPriority = b.path.includes('src/') || b.path.includes('app/') ? 1 : 0;
          return bPriority - aPriority;
        })
        .slice(0, 8);

      priorityFiles.forEach((f) => topSelected.add(f.path));
      setSelectedPaths(topSelected);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao buscar repositório.');
    } finally {
      setIsFetchingInfo(false);
    }
  };

  const handleToggleSelect = (path: string) => {
    const next = new Set(selectedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setSelectedPaths(next);
  };

  const handleSelectAll = () => {
    const next = new Set<string>();
    filteredDiscoveredFiles.forEach((f) => next.add(f.path));
    setSelectedPaths(next);
  };

  const handleDeselectAll = () => {
    setSelectedPaths(new Set());
  };

  const handleSaveToken = () => {
    githubService.setToken(token);
    alert('Token de Acesso do GitHub salvo localmente!');
  };

  const handleStartImport = async () => {
    if (!repoDetails || selectedPaths.size === 0) return;

    setIsDownloading(true);
    setErrorMessage(null);

    const pathsToDownload = Array.from(selectedPaths);
    setDownloadProgress({
      current: 0,
      total: pathsToDownload.length,
      currentFile: pathsToDownload[0] || '',
    });

    try {
      const downloadedFiles: {
        name: string;
        path: string;
        language: ProgrammingLanguage;
        content: string;
      }[] = [];

      for (let i = 0; i < pathsToDownload.length; i++) {
        const filePath = pathsToDownload[i];
        setDownloadProgress({
          current: i + 1,
          total: pathsToDownload.length,
          currentFile: filePath,
        });

        const treeItem = discoveredFiles.find((f) => f.path === filePath);
        const language = treeItem?.language || 'typescript';

        try {
          const content = await githubService.fetchFileContent(
            repoDetails.owner,
            repoDetails.repo,
            repoDetails.defaultBranch,
            filePath,
            token
          );

          const fileName = filePath.split('/').pop() || filePath;
          downloadedFiles.push({
            name: fileName,
            path: filePath,
            language,
            content,
          });
        } catch (fileErr) {
          console.warn(`Falha ao baixar ${filePath}:`, fileErr);
        }
      }

      if (downloadedFiles.length === 0) {
        throw new Error('Não foi possível baixar nenhum dos arquivos selecionados.');
      }

      // Create project in LocalStorage
      const { project, files } = storageService.createProjectFromGitHub(
        {
          owner: repoDetails.owner,
          repo: repoDetails.repo,
          branch: repoDetails.defaultBranch,
          url: repoDetails.htmlUrl,
          stars: repoDetails.stars,
          description: repoDetails.description,
          isPrivate: repoDetails.isPrivate,
        },
        downloadedFiles
      );

      // Complete and close
      onImportComplete(project.id, files[0]?.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro durante o download dos arquivos do repositório.');
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredDiscoveredFiles = discoveredFiles.filter((f) =>
    f.path.toLowerCase().includes(fileSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Clonar & Analisar Repositório do GitHub
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Insira a URL de qualquer repositório público ou privado para inspecionar os arquivos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* URL Input Form */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              URL do Repositório GitHub
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Github className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository ou owner/repository"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 text-neutral-900 dark:text-neutral-100"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFetchRepository();
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleFetchRepository()}
                disabled={isFetchingInfo || !repoUrl.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isFetchingInfo ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Inspecionar</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-neutral-500">
              <span className="shrink-0">Exemplos rápidos:</span>
              {POPULAR_REPOS.map((pop) => (
                <button
                  key={pop.label}
                  type="button"
                  onClick={() => {
                    setRepoUrl(pop.url);
                    handleFetchRepository(pop.url);
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  {pop.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional GitHub Token Collapsible */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTokenConfig(!showTokenConfig)}
              className="w-full flex items-center justify-between p-2.5 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-neutral-400" />
                <span>Configurar Token de Acesso (PAT - Opcional)</span>
                {token && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
                    Ativo
                  </span>
                )}
              </div>
              {showTokenConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTokenConfig && (
              <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Um Personal Access Token (classic ou fine-grained) permite acessar <strong>repositórios privados</strong> e eleva o limite da API do GitHub de 60 para 5.000 requisições/hora. O token fica salvo apenas no seu navegador.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSaveToken}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    Salvar Token
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Download Progress */}
          {isDownloading && (
            <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-sky-500 animate-pulse" />
                  Baixando arquivos do repositório...
                </span>
                <span className="font-mono tabular-nums text-sky-700 dark:text-sky-300 text-xs">
                  {downloadProgress.current} de {downloadProgress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-sky-200 dark:bg-sky-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-200"
                  style={{
                    width: `${(downloadProgress.current / (downloadProgress.total || 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate">
                {downloadProgress.currentFile}
              </div>
            </div>
          )}

          {/* Repository Preview & File Selector */}
          {repoDetails && !isDownloading && (
            <div className="space-y-3 pt-2">
              {/* Repo Summary Card */}
              <div className="p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/70 dark:bg-neutral-950/40 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {repoDetails.avatarUrl && (
                    <img
                      src={repoDetails.avatarUrl}
                      alt={repoDetails.owner}
                      className="w-10 h-10 rounded-lg shrink-0 object-cover border border-neutral-200 dark:border-neutral-700"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {repoDetails.fullName}
                      </span>
                      {repoDetails.isPrivate && (
                        <span className="px-1.5 py-0.2 text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded font-semibold">
                          Privado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-2">
                      {repoDetails.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-500 font-mono">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {repoDetails.defaultBranch}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {repoDetails.stars.toLocaleString()}
                      </span>
                      <a
                        href={repoDetails.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-0.5 text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        GitHub <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Files Selection Header & Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Arquivos de Código ({discoveredFiles.length} encontrados)
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-500">
                    · {selectedPaths.size} selecionados
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-medium"
                  >
                    Marcar Todos
                  </button>
                  <span className="text-neutral-300 dark:text-neutral-700">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    Desmarcar
                  </button>
                </div>
              </div>

              {/* File Filter Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  placeholder="Filtrar arquivos por caminho ou extensão..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none"
                />
              </div>

              {/* Files List Checklist */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg max-h-56 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                {filteredDiscoveredFiles.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-400">
                    Nenhum arquivo de código correspondente ao filtro.
                  </div>
                ) : (
                  filteredDiscoveredFiles.map((file) => {
                    const isSelected = selectedPaths.has(file.path);
                    const langInfo = getLanguageInfo(file.language || 'typescript');

                    return (
                      <div
                        key={file.path}
                        onClick={() => handleToggleSelect(file.path)}
                        className={`flex items-center justify-between p-2 text-xs cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors ${
                          isSelected ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-neutral-400 shrink-0" />
                          )}
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: langInfo.color }}
                          />
                          <span className="font-mono text-neutral-800 dark:text-neutral-200 truncate">
                            {file.path}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                            {langInfo.name}
                          </span>
                          {file.size && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>

          {repoDetails && (
            <button
              type="button"
              onClick={handleStartImport}
              disabled={isDownloading || selectedPaths.size === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Importar {selectedPaths.size} {selectedPaths.size === 1 ? 'arquivo' : 'arquivos'} para Análise</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

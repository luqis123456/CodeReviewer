/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileCode,
  Trash2,
  ExternalLink,
  Award,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Folder,
  Layers,
  Github,
} from 'lucide-react';
import { CodeFile, LanguageDistribution, Project, ReviewType } from '../types';
import { getLanguageInfo } from '../utils/languages';
import { LanguageDistributionBar } from './LanguageDistributionBar';

interface HistoryDashboardProps {
  projects: Project[];
  files: CodeFile[];
  globalLanguageStats: LanguageDistribution[];
  onOpenInEditor: (fileId: string, projectId: string) => void;
  onRequestDeleteFile: (file: CodeFile) => void;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
  projects,
  files,
  globalLanguageStats,
  onOpenInEditor,
  onRequestDeleteFile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [selectedReviewFilter, setSelectedReviewFilter] = useState<string>('all');

  // Filtered files
  const filteredFiles = files.filter((file) => {
    // Project filter
    if (selectedProjectFilter !== 'all' && file.projectId !== selectedProjectFilter) {
      return false;
    }
    // Review type filter
    if (
      selectedReviewFilter !== 'all' &&
      file.lastAnalysis?.reviewType !== selectedReviewFilter
    ) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = file.name.toLowerCase().includes(q);
      const matchCode = file.originalCode.toLowerCase().includes(q);
      const matchLang = file.language.toLowerCase().includes(q);
      const matchSummary = file.lastAnalysis?.summary.toLowerCase().includes(q) || false;
      return matchName || matchCode || matchLang || matchSummary;
    }
    return true;
  });

  // Calculate high-level stats
  const analyzedFiles = files.filter((f) => f.lastAnalysis);
  const totalAnalyzed = analyzedFiles.length;
  const averageScore =
    totalAnalyzed > 0
      ? (
          analyzedFiles.reduce((acc, f) => acc + (f.lastAnalysis?.score || 0), 0) /
          totalAnalyzed
        ).toFixed(1)
      : '0.0';

  const criticalIssuesTotal = analyzedFiles.reduce(
    (acc, f) =>
      acc + (f.lastAnalysis?.issues.filter((i) => i.severity === 'high').length || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Welcome & KPI Summary Bar */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Painel de Controle & Histórico
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Gerencie e audite todos os códigos analisados, distribuições por linguagem e métricas de qualidade.
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Projetos Ativos</span>
            <Folder className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {projects.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {files.length} arquivos totais
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Revisões Realizadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {totalAnalyzed}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Salvas em LocalStorage
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Score Médio Geral</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {averageScore}
            <span className="text-xs font-normal text-neutral-400 ml-1">/ 10</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Qualidade consolidada
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Riscos Críticos</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
            {criticalIssuesTotal}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">
            Necessitam de refatoração
          </div>
        </div>
      </div>

      {/* Global GitHub-style Language Distribution (RF11) */}
      <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-neutral-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Distribuição Global de Linguagens (Estilo GitHub)
            </h3>
          </div>
          <span className="text-xs text-neutral-400">
            Baseado no volume de código armazenado
          </span>
        </div>
        <LanguageDistributionBar stats={globalLanguageStats} />
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por arquivo, código ou regra..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Project Filter */}
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="all">Todos os Projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Review Type Filter */}
          <select
            value={selectedReviewFilter}
            onChange={(e) => setSelectedReviewFilter(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="all">Todos os Focos</option>
            <option value="clean-code">Clean Code</option>
            <option value="security">Segurança</option>
            <option value="performance">Performance</option>
          </select>
        </div>
      </div>

      {/* History Files List */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <span>Arquivos & Análises ({filteredFiles.length})</span>
          <span className="hidden sm:inline">Ações</span>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <FileCode className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Nenhum arquivo encontrado para os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredFiles.map((file) => {
              const langInfo = getLanguageInfo(file.language);
              const project = projects.find((p) => p.id === file.projectId);
              const analysis = file.lastAnalysis;

              return (
                <div
                  key={file.id}
                  className="p-4 hover:bg-neutral-50/60 dark:hover:bg-neutral-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs"
                      style={{
                        backgroundColor: `${langInfo.color}1A`,
                        color: langInfo.color,
                        border: `1px solid ${langInfo.color}40`,
                      }}
                    >
                      {langInfo.extension.replace('.', '').toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {file.name}
                        </span>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1">
                          {project?.githubMeta && <Github className="w-3 h-3 text-sky-500" />}
                          {project?.name || 'Projeto Desconhecido'}
                        </span>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {new Date(file.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {analysis ? (
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              analysis.score >= 8
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : analysis.score >= 6
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            }`}
                          >
                            Score: {analysis.score.toFixed(1)}/10
                          </span>

                          <span className="text-xs text-neutral-600 dark:text-neutral-300 truncate max-w-md">
                            {analysis.summary}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-400 mt-1 italic">
                          Ainda não analisado. Abra no editor para revisar.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onOpenInEditor(file.id, file.projectId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir no Editor</span>
                    </button>

                    <button
                      onClick={() => onRequestDeleteFile(file)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Excluir arquivo (RF13)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

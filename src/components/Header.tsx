/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon, Database, Sparkles, Code2, LayoutDashboard, Github } from 'lucide-react';
import { ThemeMode } from '../types';

interface HeaderProps {
  currentTab: 'editor' | 'dashboard';
  onTabChange: (tab: 'editor' | 'dashboard') => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenBackupModal: () => void;
  onOpenGitHubModal: () => void;
  totalProjects: number;
  totalFiles: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  theme,
  onToggleTheme,
  onOpenBackupModal,
  onOpenGitHubModal,
  totalProjects,
  totalFiles,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-8">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 shadow-xs">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
            CodeReviewer
          </span>
          <span className="hidden sm:inline-block text-xs text-neutral-400 dark:text-neutral-500 font-normal">
            · IA & Boas Práticas
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onTabChange('editor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'editor'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Editor & Análise</span>
          </button>

          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'dashboard'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
            <span>Painel & Histórico</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (GitHub Clone, Theme & LocalStorage Data) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenGitHubModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            title="Clonar repositório do GitHub por URL"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Clonar GitHub</span>
          </button>

          <button
            onClick={onOpenBackupModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors whitespace-nowrap"
            title="Gerenciar dados no LocalStorage (Backup e Restauração)"
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Dados Locais</span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            aria-label="Alternar tema de cores"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

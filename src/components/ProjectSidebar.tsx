/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileCode2,
  Layers,
  Github,
} from 'lucide-react';
import { Project, LanguageDistribution } from '../types';
import { LanguageDistributionBar } from './LanguageDistributionBar';

interface ProjectSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, description?: string) => void;
  onUpdateProject: (id: string, name: string) => void;
  onRequestDeleteProject: (project: Project) => void;
  onOpenGitHubModal?: () => void;
  activeProjectStats: LanguageDistribution[];
  filesCountForProject: (projectId: string) => number;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onRequestDeleteProject,
  onOpenGitHubModal,
  activeProjectStats,
  filesCountForProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const handleStartEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditingName(project.name);
  };

  const handleSaveEdit = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingName.trim()) {
      onUpdateProject(projectId, editingName.trim());
    }
    setEditingProjectId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(null);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <aside className="w-full lg:w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col shrink-0">
      {/* Header and Project Count */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Projetos ({projects.length})
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenGitHubModal && (
            <button
              onClick={onOpenGitHubModal}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md transition-colors"
              title="Clonar do GitHub"
            >
              <Github className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>Clonar</span>
            </button>
          )}
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md transition-colors"
            title="Criar novo projeto vazio"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo</span>
          </button>
        </div>
      </div>

      {/* Creation form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
          <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Nome do novo projeto
          </label>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Ex: API Gateway, Microserviço"
            autoFocus
            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 mb-2 text-neutral-900 dark:text-neutral-100"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-2 py-1 text-[11px] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newProjectName.trim()}
              className="px-2.5 py-1 text-[11px] font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded disabled:opacity-50 transition-colors"
            >
              Criar Projeto
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {projects.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Folder className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Nenhum projeto cadastrado.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-2 text-xs text-sky-600 dark:text-sky-400 font-medium hover:underline"
            >
              Criar o primeiro
            </button>
          </div>
        ) : (
          projects.map((project) => {
            const isActive = project.id === activeProjectId;
            const fileCount = filesCountForProject(project.id);
            const isEditing = editingProjectId === project.id;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white font-medium shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {project.githubMeta ? (
                    <Github
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-sky-500' : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    />
                  ) : (
                    <Folder
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-amber-500' : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    />
                  )}
                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                        className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(project.id, e as any);
                          if (e.key === 'Escape') handleCancelEdit(e as any);
                        }}
                      />
                      <button
                        onClick={(e) => handleSaveEdit(project.id, e)}
                        className="p-1 hover:text-emerald-500"
                        title="Salvar"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:text-red-500"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="truncate">
                      <div className="truncate font-medium">{project.name}</div>
                      <div className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                        <FileCode2 className="w-3 h-3" />
                        <span>{fileCount} {fileCount === 1 ? 'arquivo' : 'arquivos'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions (Rename, Delete) */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button
                      onClick={(e) => handleStartEdit(project, e)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
                      title="Renomear projeto"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDeleteProject(project);
                      }}
                      className="p-1 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
                      title="Excluir projeto e arquivos associados (RF13)"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* GitHub Language Distribution Bar for Active Project */}
      {activeProject && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Linguagens no Projeto
            </h3>
            <span className="text-[10px] text-neutral-400 font-mono">
              GitHub style
            </span>
          </div>
          <LanguageDistributionBar stats={activeProjectStats} />
        </div>
      )}
    </aside>
  );
};

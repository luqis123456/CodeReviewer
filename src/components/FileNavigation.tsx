/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, FileCode2, Edit3, Check, X } from 'lucide-react';
import { CodeFile, ProgrammingLanguage } from '../types';
import { getLanguageInfo, SUPPORTED_LANGUAGES } from '../utils/languages';

interface FileNavigationProps {
  files: CodeFile[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (name: string, language: ProgrammingLanguage) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onRequestDeleteFile: (file: CodeFile) => void;
  projectName: string;
}

export const FileNavigation: React.FC<FileNavigationProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onRequestDeleteFile,
  projectName,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState<ProgrammingLanguage>('typescript');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim(), newFileLang);
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const handleStartRename = (file: CodeFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const handleSaveRename = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingName.trim()) {
      onRenameFile(fileId, editingName.trim());
    }
    setEditingFileId(null);
  };

  return (
    <div className="w-full bg-neutral-50/70 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Breadcrumb info */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 shrink-0">
          {projectName} /
        </span>

        {/* File Tabs */}
        <div className="flex items-center gap-1.5 flex-nowrap">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const langInfo = getLanguageInfo(file.language);
            const isEditing = editingFileId === file.id;

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all border shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 shadow-2xs'
                    : 'bg-neutral-100/60 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-transparent hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: langInfo.color }}
                />

                {isEditing ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      className="px-1 py-0.5 text-xs bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(file.id, e as any);
                        if (e.key === 'Escape') setEditingFileId(null);
                      }}
                    />
                    <button onClick={(e) => handleSaveRename(file.id, e)} className="hover:text-emerald-500">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditingFileId(null)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="truncate max-w-[140px]">{file.name}</span>
                )}

                {/* Score badge if analyzed */}
                {file.lastAnalysis && (
                  <span
                    className={`px-1 py-0.2 text-[10px] rounded font-mono font-bold ${
                      file.lastAnalysis.score >= 8
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : file.lastAnalysis.score >= 6
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    }`}
                  >
                    {file.lastAnalysis.score.toFixed(1)}
                  </span>
                )}

                {/* Actions: Rename & Delete */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    <button
                      onClick={(e) => handleStartRename(file, e)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      title="Renomear arquivo"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestDeleteFile(file);
                      }}
                      className="text-neutral-400 hover:text-red-500"
                      title="Excluir arquivo (RF13)"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* New File Trigger */}
      <div className="flex items-center gap-2 shrink-0">
        {!isCreating ? (
          <button
            onClick={() => {
              setIsCreating(true);
              setNewFileName(`snippet_${files.length + 1}.ts`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-md transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-sky-500" />
            <span>Novo Arquivo</span>
          </button>
        ) : (
          <form onSubmit={handleCreateSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="ex: app.py"
              autoFocus
              className="px-2 py-1 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100 w-32"
            />
            <select
              value={newFileLang}
              onChange={(e) => {
                const lang = e.target.value as ProgrammingLanguage;
                setNewFileLang(lang);
                const info = getLanguageInfo(lang);
                if (!newFileName || newFileName.includes('.')) {
                  const base = newFileName.split('.')[0] || 'snippet';
                  setNewFileName(`${base}${info.extension}`);
                }
              }}
              className="px-2 py-1 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded text-neutral-900 dark:text-neutral-100"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-2 py-1 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded"
            >
              Criar
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

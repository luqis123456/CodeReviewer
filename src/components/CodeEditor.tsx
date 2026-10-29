/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  Play,
  RotateCcw,
  Clipboard,
  Sparkles,
  ShieldAlert,
  Zap,
  Code2,
  BookOpen,
} from 'lucide-react';
import { ProgrammingLanguage, ReviewType } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageInfo } from '../utils/languages';
import { CODE_PRESETS, CodePreset } from '../services/reviewEngine';

interface CodeEditorProps {
  code: string;
  onChangeCode: (newCode: string) => void;
  language: ProgrammingLanguage;
  onChangeLanguage: (newLang: ProgrammingLanguage) => void;
  reviewType: ReviewType;
  onChangeReviewType: (newType: ReviewType) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onLoadPreset: (preset: CodePreset) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChangeCode,
  language,
  onChangeLanguage,
  reviewType,
  onChangeReviewType,
  onAnalyze,
  isAnalyzing,
  onLoadPreset,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = code.split('\n');
  const lineCount = Math.max(1, lines.length);
  const characterCount = code.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      onChangeCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
    // Ctrl + Enter or Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isAnalyzing && code.trim()) {
        onAnalyze();
      }
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeCode(text);
      }
    } catch {
      // Fallback: focus textarea
      textareaRef.current?.focus();
    }
  };

  const handleClear = () => {
    if (code.trim() && window.confirm('Deseja limpar todo o código do editor?')) {
      onChangeCode('');
      textareaRef.current?.focus();
    }
  };

  const langInfo = getLanguageInfo(language);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
      {/* Editor Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/40">
        {/* Left: Language & Review Type Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* RF02: Language Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1 shadow-2xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: langInfo.color }}
            />
            <select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as ProgrammingLanguage)}
              className="bg-transparent text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer pr-1"
              aria-label="Selecionar linguagem"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-white dark:bg-neutral-900">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* RF03: Review Type Segmented Selector */}
          <div className="flex items-center p-0.5 bg-neutral-200/80 dark:bg-neutral-800 rounded-lg border border-neutral-300/60 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => onChangeReviewType('clean-code')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                reviewType === 'clean-code'
                  ? 'bg-white dark:bg-neutral-900 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Foco em Legibilidade, Nomenclatura, Coesão e SOLID"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Clean Code</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeReviewType('security')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                reviewType === 'security'
                  ? 'bg-white dark:bg-neutral-900 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Foco em Vulnerabilidades OWASP, Injeções e Vazamento de Dados"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Segurança</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeReviewType('performance')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                reviewType === 'performance'
                  ? 'bg-white dark:bg-neutral-900 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Foco em Complexidade Assintótica, Otimização de Loops e Memória"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Performance</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Tools (Paste, Presets, Clear, Analyze) */}
        <div className="flex items-center gap-2">
          {/* Quick Presets Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Exemplos Prontos</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-64 p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl hidden group-hover:block group-focus-within:block z-40">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Carregar caso de teste
              </div>
              {CODE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onLoadPreset(preset)}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-neutral-500 line-clamp-1">
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePasteClipboard}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="Colar código da área de transferência"
          >
            <Clipboard className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-red-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="Limpar editor"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Analyze Button */}
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin" />
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Revisar Código</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body: Line numbers + Textarea */}
      <div className="relative flex-1 flex overflow-hidden min-h-[360px] bg-neutral-950 font-mono text-sm leading-relaxed text-neutral-200">
        {/* Line Numbers Gutter */}
        <div
          aria-hidden="true"
          className="select-none py-4 px-3 bg-neutral-900/90 text-neutral-600 text-right font-mono text-xs tabular-nums border-r border-neutral-800"
          style={{ width: `${Math.max(3, String(lineCount).length + 1)}ch` }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Code Input */}
        <div className="relative flex-1 h-full overflow-auto">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`// Cole ou digite seu código aqui para análise...
// Pressione Ctrl+Enter para disparar a revisão instantânea.`}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full h-full p-4 bg-transparent text-neutral-100 font-mono text-xs md:text-sm leading-relaxed resize-none focus:outline-none selection:bg-sky-500/30"
          />
        </div>
      </div>

      {/* Editor Footer: Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 text-[11px] text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-3 font-mono">
          <span>{lineCount} {lineCount === 1 ? 'linha' : 'linhas'}</span>
          <span>·</span>
          <span>{characterCount} caracteres</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-neutral-400">Atalho:</span>
          <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded font-mono text-[10px] text-neutral-700 dark:text-neutral-300">
            Ctrl + Enter
          </kbd>
        </div>
      </div>
    </div>
  );
};

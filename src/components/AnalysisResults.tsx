/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Check,
  Copy,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Zap,
  BookOpen,
  ArrowRight,
  Code2,
  FileCheck2,
} from 'lucide-react';
import { ReviewResult } from '../types';

interface AnalysisResultsProps {
  result: ReviewResult | null;
  originalCode: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  result,
  originalCode,
}) => {
  const [activeTab, setActiveTab] = useState<'refactored' | 'diff' | 'explanations'>('refactored');
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-3">
          <Sparkles className="w-6 h-6 text-sky-500" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          Pronto para revisar seu código
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-4 leading-relaxed">
          Selecione a linguagem, escolha o foco de revisão (Clean Code, Segurança ou Performance) e clique em{' '}
          <strong className="text-neutral-700 dark:text-neutral-300">Revisar Código</strong> para obter score instantâneo, correção e recomendações.
        </p>
      </div>
    );
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(result.refactoredCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Color & status based on score (0 to 10)
  const getScoreColor = (score: number) => {
    if (score >= 8.0) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500';
    if (score >= 6.0) return 'text-amber-600 dark:text-amber-400 border-amber-500';
    return 'text-rose-600 dark:text-rose-400 border-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8.0) return 'bg-emerald-500';
    if (score >= 6.0) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/60">
            Crítico / Alta
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            Atenção / Média
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-900/60">
            Melhoria / Baixa
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto pr-1">
      {/* RF04: Score Gauge & Executive Summary */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Score Ring Display */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 shrink-0 bg-neutral-50 dark:bg-neutral-850 shadow-inner">
              <span className={`text-xl font-bold font-mono tabular-nums ${getScoreColor(result.score)}`}>
                {result.score.toFixed(1)}
              </span>
              <span className="absolute -bottom-1.5 px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider bg-white dark:bg-neutral-800 text-neutral-500 rounded border border-neutral-200 dark:border-neutral-700">
                / 10
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Pontuação de Qualidade
                </h3>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                  {result.reviewType.replace('-', ' ')}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-neutral-200 dark:border-neutral-800 pt-2 sm:pt-0 sm:pl-4 text-right">
            <div>
              <div className="text-[10px] uppercase font-semibold text-neutral-400">Tempo Análise</div>
              <div className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 tabular-nums">
                {result.metrics.analysisDurationMs}ms
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-neutral-400">Problemas</div>
              <div className="text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 tabular-nums">
                {result.issues.length} detectados
              </div>
            </div>
          </div>
        </div>

        {/* Score Category Breakdown */}
        {result.scoreBreakdown && result.scoreBreakdown.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
            {result.scoreBreakdown.map((cat, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {cat.category}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                    {cat.score.toFixed(1)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(cat.score)}`}
                    style={{ width: `${Math.min(100, (cat.score / 10) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RF05: Up to 3 Critical Issues Detected */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Problemas Críticos Identificados ({result.issues.length}/3)
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">Foco Prioritário</span>
        </div>

        {result.issues.length === 0 ? (
          <div className="flex items-center gap-2 py-3 px-3 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Check className="w-4 h-4 shrink-0" />
            <span>Nenhum problema crítico detectado neste trecho! Código muito bem estruturado.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {result.issues.map((issue, index) => (
              <div
                key={issue.id || index}
                className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-950/30 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {index + 1}. {issue.title}
                    </span>
                    {issue.line && (
                      <span className="px-1.5 py-0.2 text-[10px] font-mono bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded">
                        Linha {issue.line}
                      </span>
                    )}
                  </div>
                  <div>{getSeverityBadge(issue.severity)}</div>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-2 leading-relaxed">
                  {issue.description}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-200/80 dark:border-neutral-800">
                  <strong className="text-neutral-700 dark:text-neutral-300 font-semibold shrink-0">
                    Impacto:
                  </strong>
                  <span className="truncate">{issue.impact}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RF06 & RF07: Refactored Code with Diff Viewer & Explanations */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs flex flex-col">
        {/* Navigation Tabs for Results */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-3 py-2 bg-neutral-50 dark:bg-neutral-950/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('refactored')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'refactored'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Código Corrigido</span>
            </button>

            <button
              onClick={() => setActiveTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'diff'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-sky-500" />
              <span>Comparador (Diff)</span>
            </button>

            <button
              onClick={() => setActiveTab('explanations')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'explanations'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              <span>Por que alteramos? ({result.explanations.length})</span>
            </button>
          </div>

          {/* 1-Click Copy Action */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-md transition-colors shadow-2xs"
            title="Copiar código refatorado para a área de transferência"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>

        {/* Tab 1: Refactored Code */}
        {activeTab === 'refactored' && (
          <div className="relative p-4 bg-neutral-950 text-neutral-100 font-mono text-xs md:text-sm overflow-x-auto min-h-[280px]">
            <pre className="leading-relaxed">
              <code>{result.refactoredCode}</code>
            </pre>
          </div>
        )}

        {/* Tab 2: Diff View (Before vs After) */}
        {activeTab === 'diff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 bg-neutral-950 font-mono text-xs overflow-x-auto min-h-[300px]">
            {/* Original */}
            <div className="p-3">
              <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Original (Antes)
              </div>
              <pre className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                <code>{originalCode}</code>
              </pre>
            </div>

            {/* Refactored */}
            <div className="p-3 bg-neutral-900/40">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Otimizado & Limpo (Depois)
              </div>
              <pre className="text-emerald-300 leading-relaxed whitespace-pre-wrap">
                <code>{result.refactoredCode}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: RF07 Explanations */}
        {activeTab === 'explanations' && (
          <div className="p-4 space-y-3 bg-white dark:bg-neutral-900">
            {result.explanations.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRight className="w-4 h-4 text-sky-500 shrink-0" />
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {exp.change}
                  </h4>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-2 pl-6 leading-relaxed">
                  {exp.reason}
                </p>
                <div className="pl-6">
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                    Princípio: {exp.principleOrConcept}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RF08: Study Resources & Official Documentation */}
      {result.studyResources && result.studyResources.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Recomendações de Estudo & Documentação Oficial
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {result.studyResources.map((res) => (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex flex-col justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-sky-300 dark:hover:border-sky-700 bg-neutral-50/40 dark:bg-neutral-950/20 hover:bg-white dark:hover:bg-neutral-900 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {res.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-sky-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                  {res.tag}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

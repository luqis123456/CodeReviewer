/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LanguageDistribution } from '../types';

interface LanguageDistributionBarProps {
  stats: LanguageDistribution[];
  compact?: boolean;
}

export const LanguageDistributionBar: React.FC<LanguageDistributionBarProps> = ({
  stats,
  compact = false,
}) => {
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);

  if (!stats || stats.length === 0) {
    return (
      <div className="py-2 text-xs text-neutral-400 dark:text-neutral-500 italic">
        Nenhum arquivo adicionado neste escopo.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* GitHub-style progress bar */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 transition-all duration-300">
        {stats.map((item) => (
          <div
            key={item.language}
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
            onMouseEnter={() => setHoveredLang(item.language)}
            onMouseLeave={() => setHoveredLang(null)}
            className="h-full transition-all duration-200 hover:brightness-110 relative cursor-pointer"
            title={`${item.label}: ${item.percentage}% (${item.lines} linhas)`}
          />
        ))}
      </div>

      {/* Language Breakdown Legend */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-neutral-600 dark:text-neutral-300">
          {stats.map((item) => {
            const isHovered = hoveredLang === item.language;
            return (
              <div
                key={item.language}
                onMouseEnter={() => setHoveredLang(item.language)}
                onMouseLeave={() => setHoveredLang(null)}
                className={`flex items-center gap-1.5 transition-colors cursor-default ${
                  isHovered ? 'text-neutral-900 dark:text-white font-medium' : ''
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {item.label}
                </span>
                <span className="font-mono tabular-nums text-neutral-400 dark:text-neutral-500 text-[11px]">
                  {item.percentage}%
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  ({item.lines} {item.lines === 1 ? 'linha' : 'linhas'})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageInfo, ProgrammingLanguage } from '../types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { id: 'typescript', name: 'TypeScript', extension: '.ts', color: '#3178C6' },
  { id: 'javascript', name: 'JavaScript', extension: '.js', color: '#F7DF1E' },
  { id: 'python', name: 'Python', extension: '.py', color: '#3572A5' },
  { id: 'java', name: 'Java', extension: '.java', color: '#B07219' },
  { id: 'csharp', name: 'C#', extension: '.cs', color: '#178600' },
  { id: 'go', name: 'Go', extension: '.go', color: '#00ADD8' },
  { id: 'php', name: 'PHP', extension: '.php', color: '#4F5D95' },
  { id: 'rust', name: 'Rust', extension: '.rs', color: '#DEA584' },
  { id: 'ruby', name: 'Ruby', extension: '.rb', color: '#701516' },
  { id: 'cpp', name: 'C++', extension: '.cpp', color: '#F34B7D' },
  { id: 'sql', name: 'SQL', extension: '.sql', color: '#E38C00' },
  { id: 'html-css', name: 'HTML / CSS', extension: '.html', color: '#E34C26' },
];

export function getLanguageInfo(id: ProgrammingLanguage): LanguageInfo {
  const found = SUPPORTED_LANGUAGES.find((lang) => lang.id === id);
  return (
    found || {
      id,
      name: id,
      extension: '.txt',
      color: '#6E7681',
    }
  );
}

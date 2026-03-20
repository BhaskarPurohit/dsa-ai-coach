// components/HintPanel.tsx
'use client';

import React from 'react';
import { Lightbulb, HelpCircle, Code2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface Hint {
  content: string;
  level: number;
}

interface HintPanelProps {
  hints: Hint[];
  currentHintLevel: number;
  attemptCount: number;
  onRequestHint: () => void;
  loading?: boolean;
}

// CodeSignal-style hint type config
const HINT_TYPE = {
  socratic: {
    label: 'Think About It',
    icon: HelpCircle,
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    iconColor: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-700',
    description: 'A guiding question to nudge your thinking',
  },
  pseudocode: {
    label: 'Pseudocode Guide',
    icon: Code2,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    description: 'Algorithm skeleton — you fill in the key logic',
  },
  approach: {
    label: 'Solution Approach',
    icon: BookOpen,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    description: 'Full walkthrough of the optimal approach',
  },
};

function getHintType(content: string): keyof typeof HINT_TYPE {
  if (content.startsWith('[HINT:pseudocode]')) return 'pseudocode';
  if (content.startsWith('[HINT:approach]')) return 'approach';
  return 'socratic'; // default / [HINT:socratic]
}

function stripPrefix(content: string): string {
  return content
    .replace(/^\[HINT:(socratic|pseudocode|approach)\]\s*[^\n]*\n\n?/, '')
    .trim();
}

function HintCard({ hint, index }: { hint: Hint; index: number }) {
  const [expanded, setExpanded] = React.useState(true);
  const type = getHintType(hint.content);
  const cfg = HINT_TYPE[type];
  const Icon = cfg.icon;
  const body = stripPrefix(hint.content);

  return (
    <div className={`rounded-xl border ${cfg.bg} ${cfg.border} overflow-hidden`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div className={`p-1.5 rounded-lg bg-white/60`}>
          <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-gray-400">Hint {index + 1}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{cfg.description}</p>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <div className="h-px bg-white/60 mb-3" />
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{body}</p>
        </div>
      )}
    </div>
  );
}

export default function HintPanel({
  hints,
  currentHintLevel,
  attemptCount,
  onRequestHint,
  loading = false,
}: HintPanelProps) {
  const canRequestHint = attemptCount >= 1;
  const allLevelsUsed = currentHintLevel >= 3;

  const nextHintLabel = currentHintLevel === 0
    ? 'Get a Guiding Question'
    : currentHintLevel === 1
    ? 'Get Pseudocode Guide'
    : 'Get Full Approach';

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          AI Coach Hints
        </h3>
        {!allLevelsUsed && (
          <button
            onClick={onRequestHint}
            disabled={!canRequestHint || loading}
            className={`btn-primary text-sm py-1.5 px-3 ${!canRequestHint || loading ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Thinking...' : nextHintLabel}
          </button>
        )}
      </div>

      {/* Prompt to attempt first — framed positively */}
      {!canRequestHint && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
          <p className="text-sm text-amber-800">
            Make your first attempt — even a rough start gives the coach something to work with.
          </p>
        </div>
      )}

      {/* Hint progression indicator */}
      {canRequestHint && hints.length === 0 && (
        <div className="mb-4 space-y-2">
          {Object.entries(HINT_TYPE).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="flex items-center gap-2 text-sm text-gray-400">
                <Icon className="w-4 h-4" />
                <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500`}>{cfg.label}</span>
                <span className="text-xs">{cfg.description}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Hint cards */}
      <div className="space-y-3">
        {hints.map((hint, i) => (
          <HintCard key={i} hint={hint} index={i} />
        ))}
      </div>

      {allLevelsUsed && (
        <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3">
          <p className="text-sm text-gray-600">
            You have all available hints. Trust the approach and give it another shot — you have it!
          </p>
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function Badge({ color, children }) {
  const colorMap = {
    red: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800/40',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/40',
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800/40',
  };

  return (
    <span
      className={`
        inline-block
        px-2 py-1 sm:px-3 sm:py-1.5
        rounded-full
        text-[10px] sm:text-xs md:text-sm
        font-semibold
        truncate
        border
        ${colorMap[color] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-200 dark:border-slate-700/40'}
      `}
    >
      {children}
    </span>
  );
}

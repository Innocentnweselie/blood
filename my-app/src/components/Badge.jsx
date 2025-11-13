import React from 'react';

export default function Badge({ color, children }) {
  const colorMap = {
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
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
        ${colorMap[color] || 'bg-gray-100 text-gray-800'}
      `}
    >
      {children}
    </span>
  );
}

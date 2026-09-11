import React from 'react';

export function AIIcon({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M16.2 8.1C16.2 8.1 17.1 4.95 19.8 4.95C17.1 4.95 16.2 1.8 16.2 1.8C16.2 1.8 15.3 4.95 12.6 4.95C15.3 4.95 16.2 8.1 16.2 8.1Z"
        fill="url(#ai-grad-small)"
      />
      <path
        d="M10.8 17.1C10.8 17.1 12.6 10.8 17.1 10.8C12.6 10.8 10.8 4.5 10.8 4.5C10.8 4.5 9 10.8 4.5 10.8C9 10.8 10.8 17.1 10.8 17.1Z"
        fill="url(#ai-grad-large)"
      />
      <defs>
        <linearGradient id="ai-grad-small" x1="16.2" y1="1.8" x2="16.2" y2="8.1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9AB9F" />
          <stop offset="1" stopColor="#9C77F5" />
        </linearGradient>
        <linearGradient id="ai-grad-large" x1="10.8" y1="4.5" x2="10.8" y2="17.1" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4189E8" />
          <stop offset="0.4" stopColor="#9C77F5" />
          <stop offset="1" stopColor="#F9AB9F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

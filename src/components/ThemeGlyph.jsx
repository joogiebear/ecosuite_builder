import { memo } from 'react';

function ThemeGlyph({ kind }) {
  if (kind === 'moon') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14.5 2.5a8.9 8.9 0 0 0 0 17.8 9.2 9.2 0 0 0 5.3-1.7 9.8 9.8 0 0 1-4.6 1.1A9.7 9.7 0 0 1 5.5 10c0-3.3 1.6-6.3 4.2-8.1a9 9 0 0 0 4.8.6Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <path
        d="M12 1.8v3.1M12 19.1v3.1M22.2 12h-3.1M4.9 12H1.8M19.2 4.8l-2.2 2.2M7 17l-2.2 2.2M19.2 19.2 17 17M7 7 4.8 4.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default memo(ThemeGlyph);

'use client';

import { useId, type SVGProps } from 'react';

/** Original Signal icons. 24-unit grid, 1.6-unit stroke; no external icon dependency. */
export const iconPaths = {
  "compass": "M12 2.8a9.2 9.2 0 1 0 0 18.4 9.2 9.2 0 0 0 0-18.4ZM15.8 8.2l-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4Z",
  "orbit": "M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8ZM5 6.7c-3.6 3.4-2.8 9.9 2.3 12.8 5 2.8 11.8.7 13.1-4.6M19 5.1v4.6h-4.6M19 9.7C17 4.3 10.4 2.1 5 6.7",
  "signal": "M3 17v-3M7.5 17V9.5M12 17V5M16.5 17V9.5M21 17v-3",
  "layers": "M12 3 2.8 8 12 13l9.2-5L12 3ZM3.5 12.1 12 17l8.5-4.9M3.5 16.2 12 21l8.5-4.8",
  "check": "M4.7 12.4 9.5 17l9.8-10",
  "arrowRight": "M3.5 12h16.8M14 5.7l6.3 6.3-6.3 6.3",
  "search": "M10.5 3.2a7.3 7.3 0 1 0 0 14.6 7.3 7.3 0 0 0 0-14.6ZM16 16l4.8 4.8",
  "close": "M5.5 5.5l13 13M18.5 5.5l-13 13",
  "warning": "M10.3 4.4 2.8 17.9a1.9 1.9 0 0 0 1.7 2.8h15a1.9 1.9 0 0 0 1.7-2.8L13.7 4.4a1.9 1.9 0 0 0-3.4 0ZM12 9v5M12 17.1v.1",
  "sun": "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 1.8v2.5M12 19.7v2.5M1.8 12h2.5M19.7 12h2.5M4.8 4.8l1.8 1.8M17.4 17.4l1.8 1.8M4.8 19.2l1.8-1.8M17.4 6.6l1.8-1.8",
  "moon": "M20.3 14.1A8.7 8.7 0 0 1 9.9 3.7 8.7 8.7 0 1 0 20.3 14.1Z",
  "code": "M7.5 6.2 2.3 12l5.2 5.8M16.5 6.2l5.2 5.8-5.2 5.8M14.2 3.8l-4.4 16.4",
  "grid": "M3.5 3.5h6.7v6.7H3.5V3.5ZM13.8 3.5h6.7v6.7h-6.7V3.5ZM3.5 13.8h6.7v6.7H3.5v-6.7ZM13.8 13.8h6.7v6.7h-6.7v-6.7Z",
  "spark": "M12 2.3 14.7 9.3 21.7 12 14.7 14.7 12 21.7 9.3 14.7 2.3 12 9.3 9.3 12 2.3Z",
  "arrowUpRight": "M5 19 19 5M6.5 5H19v12.5",
  "play": "M7 3.8v16.4L20 12 7 3.8Z",
  "pause": "M6.3 4.5v15M17.7 4.5v15",
  "shield": "M12 2.7 3.5 6v6.1c0 4.2 4.1 7.8 8.5 9.2 4.4-1.4 8.5-5 8.5-9.2V6L12 2.7ZM8.2 12l2.6 2.6 5.2-5.3",
  "link": "M9.7 7.6l2.8-2.8a4.7 4.7 0 0 1 6.7 6.7l-2.8 2.8M14.3 16.4l-2.8 2.8a4.7 4.7 0 0 1-6.7-6.7l2.8-2.8M8.6 15.4l6.8-6.8",
  "branch": "M6 2.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM6 16.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM18 2.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM6 7.2v9.6M18 7.2v.8c0 4.3-4.1 5.2-7.8 5.2H6",
  "archive": "M3 3.8h18v4.5H3V3.8ZM4.4 8.3v11.9h15.2V8.3M9 12h6",
  "eye": "M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  "settings": "M5.5 3v18M12 3v18M18.5 3v18M3.3 7h4.4M9.8 16h4.4M16.3 10h4.4",
  "download": "M12 2.5v12.7M7.5 10.7l4.5 4.5 4.5-4.5M3.5 16.5v4h17v-4"
} as const;
export type IconName = keyof typeof iconPaths;
export const iconNames = Object.keys(iconPaths) as IconName[];
export type IconProps = Omit<SVGProps<SVGSVGElement>, 'name' | 'children'> & {
  name: IconName;
  size?: number | string;
  /** Omit for decorative icons; label the containing control instead. */
  title?: string;
};
export function Icon({ name, size = 24, title, ...props }: IconProps) {
  const id = useId();
  const labelled = Boolean(title || props['aria-label'] || props['aria-labelledby']);
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round" focusable="false"
      role={labelled ? 'img' : undefined} aria-hidden={labelled ? undefined : true}
      aria-labelledby={title ? id : props['aria-labelledby']}>
      {title && <title id={id}>{title}</title>}
      <path d={iconPaths[name]} />
    </svg>
  );
}

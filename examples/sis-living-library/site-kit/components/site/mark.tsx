import { themeColor } from '@/lib/site.config';

// Brand mark for generated icons (ImageResponse supports inline SVG and flexbox).
export function Mark({ size, padding = 0.1 }: { size: number; padding?: number }) {
  const inner = Math.round(size * (1 - padding * 2));
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: themeColor }}>
      <svg width={inner} height={inner} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.2" fill="#9bd8cd" />
        <circle cx="12" cy="12" r="8.6" fill="none" stroke="#9bd8cd" strokeWidth="1.3" strokeOpacity="0.6" />
        <circle cx="20.6" cy="12" r="1.8" fill="#f0f4f4" />
      </svg>
    </div>
  );
}

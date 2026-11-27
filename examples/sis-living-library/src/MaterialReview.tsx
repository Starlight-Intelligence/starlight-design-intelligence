import { useEffect, useRef, useState } from 'react';
import { GlassSurface, StarlightButton, Toggle, type SurfaceMaterial } from './components';
import { Icon } from './icons';
import './material-review.css';

const sourceRevision = '592874f89e54338d7122f319f0f5b9e3d51acb78';
const sourceRoot = `https://github.com/Starlight-Intelligence/starlight-design-intelligence/blob/${sourceRevision}/examples/sis-living-library`;
const sources = [
  { label: 'Material rules', url: `${sourceRoot}/docs/FOUNDATIONS.md#material-and-color` },
  { label: 'Token definitions', url: `${sourceRoot}/src/tokens.css` },
  { label: 'Component styles', url: `${sourceRoot}/src/components.css` },
];

const materials = {
  solid: { name: 'Obsidian', use: 'Sustained reading and focused work' },
  glass: { name: 'Liquid', use: 'Transient navigation over a visible backdrop' },
  inset: { name: 'Recess', use: 'Inputs and evidence within a working surface' },
} satisfies Record<SurfaceMaterial, { name: string; use: string }>;

const measurements = [
  ['Background', 'background-color'],
  ['Text', 'color'],
  ['Border', 'border-top-color'],
  ['Backdrop filter', 'backdrop-filter'],
] as const;

function readStyles(element: HTMLElement) {
  const styles = getComputedStyle(element);
  return Object.fromEntries(measurements.map(([, property]) => [property, styles.getPropertyValue(property)]));
}

interface MaterialReviewProps {
  theme: string;
  glass: boolean;
  onGlassChange: (enabled: boolean) => void;
  announce: (message: string) => void;
}

export function MaterialReview({ theme, glass, onGlassChange, announce }: MaterialReviewProps) {
  const [material, setMaterial] = useState<SurfaceMaterial>('glass');
  const [values, setValues] = useState<Record<string, string>>({});
  const sample = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preferences = [
      matchMedia('(prefers-reduced-transparency: reduce)'),
      matchMedia('(forced-colors: active)'),
    ];
    let frame = 0;
    function measure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (sample.current) setValues(readStyles(sample.current));
      });
    }
    measure();
    preferences.forEach(preference => preference.addEventListener('change', measure));
    return () => {
      cancelAnimationFrame(frame);
      preferences.forEach(preference => preference.removeEventListener('change', measure));
    };
  }, [material, theme, glass]);

  function exportObservation() {
    if (!sample.current) return;
    const observation = {
      type: 'starlight.material_observation.v1',
      scope: 'local-browser-observation',
      observedAt: new Date().toISOString(),
      sourceRevision,
      sources: sources.map(source => source.url),
      material,
      theme,
      glassPreference: glass,
      reducedTransparency: matchMedia('(prefers-reduced-transparency: reduce)').matches,
      forcedColors: matchMedia('(forced-colors: active)').matches,
      viewport: { width: innerWidth, height: innerHeight },
      computedStyle: readStyles(sample.current),
    };
    const file = new Blob([JSON.stringify(observation, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `starlight-material-${material}-${theme}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    announce('Browser observation exported.');
  }

  return (
    <section className="material-review" aria-labelledby="material-review-title">
      <header className="material-review__header">
        <h2 id="material-review-title">Inspect a material</h2>
        <div className="material-review__selector">
          <label htmlFor="review-material">Surface</label>
          <select id="review-material" value={material} onChange={event => setMaterial(event.target.value as SurfaceMaterial)}>
            {Object.entries(materials).map(([id, option]) => <option key={id} value={id}>{option.name}</option>)}
          </select>
        </div>
      </header>
      <div className="material-review__stage">
        <GlassSurface ref={sample} material={material} className="material-review__sample">
          <span>{materials[material].name}</span>
          <p>{materials[material].use}</p>
        </GlassSurface>
      </div>
      <div className="material-review__details">
        <div className="material-review__measurement-heading">
          <h3>Rendered style</h3>
          <Toggle pressed={glass} onPressedChange={onGlassChange}>Preview glass</Toggle>
        </div>
        <dl aria-label="Computed material styles">
          {measurements.map(([label, property]) => (
            <div key={property}>
              <dt>{label}</dt>
              <dd data-testid={property}>{values[property] || 'Unavailable'}</dd>
            </div>
          ))}
        </dl>
      </div>
      <footer className="material-review__footer">
        <ul aria-label="Material sources">
          {sources.map(source => <li key={source.url}><a href={source.url}>{source.label}</a></li>)}
        </ul>
        <StarlightButton size="sm" variant="secondary" onClick={exportObservation}>
          <Icon name="download" /> Export observation
        </StarlightButton>
        <p>Browser observation only. Release review remains separate.</p>
      </footer>
    </section>
  );
}

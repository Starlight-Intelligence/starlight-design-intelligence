'use client';

import { GlassSurface, StarlightButton } from '@starlight/living-design';
import { useState } from 'react';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/instrument-sans/latin-400.css';
import '@fontsource/instrument-sans/latin-500.css';
import '@fontsource/instrument-sans/latin-600.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import styles from './orbital-glass.module.css';

export default function OrbitalGlassPage() {
  const [replay, setReplay] = useState(0);

  return (
    <main className={styles.page} data-theme="midnight">
      <div className={styles.layout}>
        <header className={styles.intro}>
          <p className={styles.kicker}>Starlight Design Intelligence</p>
          <h1>Orbital <em>Glass</em></h1>
          <p className={styles.lede}>
            A material study in how glass catches light, holds depth, and frames an interface.
          </p>
        </header>

        <div className={styles.stage} aria-hidden="true">
          <div className={styles.axis} />
          <div className={styles.orbit} />
          <div className={styles.lens} />
          <div
            key={replay}
            className={styles.light}
            data-replay={replay > 0 ? 'active' : undefined}
          />
          <div className={styles.companion} />
        </div>

        <GlassSurface className={styles.card}>
          <div>
            <h2>Edge light</h2>
            <p>The warm inner rim and cool outer edge give the lens its depth.</p>
          </div>
          <StarlightButton
            className={styles.replay}
            variant="secondary"
            onClick={() => setReplay(count => count + 1)}
          >
            Replay light
          </StarlightButton>
        </GlassSurface>
      </div>
    </main>
  );
}

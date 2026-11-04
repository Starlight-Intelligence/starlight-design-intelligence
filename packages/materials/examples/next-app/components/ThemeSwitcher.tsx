'use client';

import { useState, useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function ThemeSwitcher() {
  const [profile, setProfile] = useState('ink');
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);

  return (
    <label className="flex items-center gap-2 text-label-md">
      Theme
      <select
        className="theme-select min-h-11 rounded-sm border border-hairline bg-surface px-3 text-on-surface focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-focus"
        value={profile}
        disabled={!ready}
        onChange={(event) => {
          const value = event.target.value;
          const root = document.documentElement;
          root.dataset.theme = value === 'paper' ? 'paper' : 'ink';
          if (value === 'operator') root.dataset.mode = 'operator';
          else delete root.dataset.mode;
          setProfile(value);
        }}
      >
        <option value="ink">Ink</option>
        <option value="paper">Paper</option>
        <option value="operator">Operator</option>
      </select>
    </label>
  );
}

'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import './components.css';

const classes = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(' ');

export type SurfaceMaterial = 'solid' | 'glass' | 'inset';
export interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  material?: SurfaceMaterial;
}

/** Glass is a presentation choice; it never implies a connected or running system. */
export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  function GlassSurface({ material = 'solid', className, ...props }, ref) {
    return <div {...props} ref={ref} className={classes('sl-surface', `sl-surface--${material}`, className)} />;
  },
);

export interface StarlightButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
}

export const StarlightButton = forwardRef<HTMLButtonElement, StarlightButtonProps>(
  function StarlightButton({ variant = 'primary', size = 'md', loading = false, disabled, className, children, type = 'button', ...props }, ref) {
    return (
      <button {...props} ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
        className={classes('sl-button', `sl-button--${variant}`, `sl-button--${size}`, className)}>
        {loading && <span className="sl-button__spinner" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

export type AgentStatus = 'unknown' | 'idle' | 'running' | 'blocked' | 'complete';
const statusLabels: Record<AgentStatus, string> = {
  unknown: 'Unknown', idle: 'Idle', running: 'Running', blocked: 'Blocked', complete: 'Complete',
};

export function StatusBadge({ status = 'unknown', className, ...props }: HTMLAttributes<HTMLSpanElement> & { status?: AgentStatus }) {
  const safeStatus = Object.hasOwn(statusLabels, status) ? status : 'unknown';
  return (
    <span {...props} className={classes('sl-status', `sl-status--${safeStatus}`, className)}>
      <span className="sl-status__dot" aria-hidden="true" />{statusLabels[safeStatus]}
    </span>
  );
}

export interface AgentPresenceProps extends HTMLAttributes<HTMLDivElement> {
  roleId: string;
  name: string;
  role: string;
  status?: AgentStatus;
  description?: string;
}

/** The role ID is stable. A display name is presentation, never a runtime identifier. */
export function AgentPresence({ roleId, name, role, status = 'unknown', description, className, ...props }: AgentPresenceProps) {
  return (
    <div {...props} className={classes('sl-presence', className)}>
      <span className="sl-presence__avatar" aria-hidden="true"><span /><i /></span>
      <div className="sl-presence__body">
        <div className="sl-presence__heading"><strong>{name}</strong><StatusBadge status={status} /></div>
        <span className="sl-presence__role">{role}</span>
        <code className="sl-presence__id">{roleId}</code>
        {description && <p className="sl-presence__description">{description}</p>}
      </div>
    </div>
  );
}

export interface EvidenceDisclosureProps extends Omit<HTMLAttributes<HTMLDetailsElement>, 'title'> {
  summary: ReactNode;
  open?: boolean;
}

export function EvidenceDisclosure({ summary, children, className, ...props }: EvidenceDisclosureProps) {
  return (
    <details {...props} className={classes('sl-evidence', className)}>
      <summary><span>{summary}</span><span className="sl-evidence__marker" aria-hidden="true">+</span></summary>
      <div className="sl-evidence__content">{children}</div>
    </details>
  );
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, hint, error, id: providedId, className, 'aria-describedby': describedBy, ...props }, ref) {
    const generatedId = useId();
    const id = providedId || generatedId;
    const description = [describedBy, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
    return (
      <div className="sl-field">
        <label className="sl-field__label" htmlFor={id}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
        <input {...props} ref={ref} id={id} className={classes('sl-input', className)} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={description} />
        {hint && <p className="sl-field__hint" id={`${id}-hint`}>{hint}</p>}
        {error && <p className="sl-field__error" role="alert" id={`${id}-error`}>{error}</p>}
      </div>
    );
  },
);

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'aria-pressed'> {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle({ pressed, onPressedChange, onClick, children, className, type = 'button', ...props }, ref) {
    return (
      <button {...props} ref={ref} type={type} className={classes('sl-toggle', className)} aria-pressed={pressed}
        onClick={event => { onClick?.(event); if (!event.defaultPrevented) onPressedChange(!pressed); }}>
        <span className="sl-toggle__track" aria-hidden="true"><span /></span>{children}
      </button>
    );
  },
);

export interface TabItem { id: string; label: string; content: ReactNode }
export interface TabsProps {
  items: TabItem[];
  label: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/** Automatic activation: ArrowLeft/Right, Home and End move focus and selection. */
export function Tabs({ items, label, defaultValue, value, onValueChange, className }: TabsProps) {
  const id = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.id);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const requestedValue = value ?? internalValue;
  const selected = items.some(item => item.id === requestedValue) ? requestedValue : items[0]?.id;
  function select(next: string) {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const next = event.key === 'ArrowRight' ? (index + 1) % items.length
      : event.key === 'ArrowLeft' ? (index + last) % items.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? last : undefined;
    if (next === undefined) return;
    event.preventDefault();
    select(items[next].id);
    buttons.current[next]?.focus();
  }
  if (!items.length) return null;
  return (
    <div className={classes('sl-tabs', className)}>
      <div className="sl-tabs__list" role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button key={item.id} ref={element => { buttons.current[index] = element; }} className="sl-tabs__tab" type="button"
            id={`${id}-tab-${index}`} role="tab" aria-selected={selected === item.id} aria-controls={`${id}-panel-${index}`}
            tabIndex={selected === item.id ? 0 : -1} onClick={() => select(item.id)} onKeyDown={event => navigate(event, index)}>{item.label}</button>
        ))}
      </div>
      {items.map((item, index) => (
        <div key={item.id} className="sl-tabs__panel" id={`${id}-panel-${index}`} role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`} tabIndex={0} hidden={selected !== item.id}>{item.content}</div>
      ))}
    </div>
  );
}

export interface CommandItem { id: string; label: string; description?: string; onSelect: () => void }
export interface CommandPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  items: CommandItem[];
}

/** Native dialog supplies modal semantics and focus containment; actions remain explicit. */
export function CommandPanel({ open, onOpenChange, title = 'Find a component', items }: CommandPanelProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setQuery('');
      element.showModal();
      search.current?.focus();
    } else if (!open && element.open) {
      element.close();
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
      else document.querySelector<HTMLElement>('main[tabindex]')?.focus();
    }
  }, [open]);
  useEffect(() => {
    const element = dialog.current;
    return () => {
      // The native dialog leaves the top layer when removed. Deferring the
      // focus check avoids moving focus during React's development replay.
      queueMicrotask(() => {
        if (element && !element.isConnected) previousFocus.current?.focus();
      });
    };
  }, []);
  const filtered = items.filter(item => `${item.label} ${item.description || ''}`.toLowerCase().includes(query.toLowerCase().trim()));
  function handleKeyboard(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const actions = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('[data-command-item]') ?? []);
    if (!actions.length) return;
    const active = actions.indexOf(document.activeElement as HTMLButtonElement);
    const next = active === -1 ? (event.key === 'ArrowDown' ? 0 : actions.length - 1)
      : (active + (event.key === 'ArrowDown' ? 1 : actions.length - 1)) % actions.length;
    event.preventDefault();
    actions[next].focus();
  }
  return (
    <dialog ref={dialog} className="sl-command" aria-labelledby={`${id}-title`} onKeyDown={handleKeyboard}
      onCancel={event => { event.preventDefault(); onOpenChange(false); }}
      onClose={() => onOpenChangeRef.current(false)}
      onClick={event => { if (event.target === dialog.current) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onOpenChange(false); } }}>
      <div className="sl-command__heading"><h2 id={`${id}-title`}>{title}</h2><StarlightButton variant="ghost" size="sm" onClick={() => onOpenChange(false)} aria-label="Close command panel">Esc</StarlightButton></div>
      <TextField ref={search} label="Search components" type="search" value={query} onChange={event => setQuery(event.target.value)} autoComplete="off" placeholder="Search by name or purpose…" />
      <p className="sl-sr-only" role="status">{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</p>
      <ul className="sl-command__results">
        {filtered.map(item => <li key={item.id}><button type="button" data-command-item onClick={() => { onOpenChange(false); item.onSelect(); }}><span>{item.label}</span>{item.description && <small>{item.description}</small>}</button></li>)}
      </ul>
      {!filtered.length && <p className="sl-command__empty">No matching components. Try another name.</p>}
      <p className="sl-command__footer">Use ↑ ↓ to browse, Enter to select, Esc to close.</p>
    </dialog>
  );
}

export function EmptyState({ title, description, action, className, ...props }: HTMLAttributes<HTMLDivElement> & { title: string; description: string; action?: ReactNode }) {
  return <div {...props} className={classes('sl-empty', className)}><span className="sl-empty__mark" aria-hidden="true">∅</span><h3>{title}</h3><p>{description}</p>{action && <div className="sl-empty__action">{action}</div>}</div>;
}

export function Skeleton({ label = 'Loading content', className, style, ...props }: HTMLAttributes<HTMLDivElement> & { label?: string }) {
  return <div {...props} className={classes('sl-skeleton', className)} style={style} role="status"><span className="sl-sr-only">{label}</span></div>;
}

export interface ProgressMeterProps { value: number | null; max?: number; label: string; className?: string }
export function ProgressMeter({ value, max = 100, label, className }: ProgressMeterProps) {
  const id = useId();
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = value !== null && Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : undefined;
  const percent = safeValue === undefined ? null : Math.round(safeValue / safeMax * 100);
  return (
    <div className={classes('sl-progress', className)} style={{ '--sl-progress-value': `${percent ?? 0}%` } as CSSProperties}>
      <div className="sl-progress__heading"><label htmlFor={id}>{label}</label><span aria-hidden="true">{percent === null ? 'In progress' : `${percent}%`}</span></div>
      <progress id={id} value={safeValue} max={safeMax} />
    </div>
  );
}

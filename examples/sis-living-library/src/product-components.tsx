'use client';

import { useId, useState, type Key, type ReactNode } from 'react';
import { GlassSurface, StarlightButton } from './components';
import { Icon } from './icons';
import './product-components.css';

const countFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
const knownNumber = (value: number | null | undefined): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const tokenCount = (value: number | null | undefined) => knownNumber(value) ? Math.floor(value) : null;
const showCount = (value: number | null | undefined) => knownNumber(value) ? countFormat.format(value) : 'Unknown';

function showMoney(amount: number | null | undefined, currency: string) {
  if (!knownNumber(amount)) return 'Unknown';
  try { return new Intl.NumberFormat('en-IE', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount); }
  catch { return `${countFormat.format(amount)} ${currency}`; }
}

export interface ModelOption { id: string; name: string; detail?: string }
export interface ModelSelectorProps {
  models: readonly ModelOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

/** Native selection only. Selecting a model never starts a request. */
export function ModelSelector({ models, value, onChange, label = 'Model', disabled }: ModelSelectorProps) {
  const id = useId();
  const selected = models.find(model => model.id === value);
  const selectedValue = selected ? value : '';
  return <div className="sl-model-selector sl-field">
    <label className="sl-field__label" htmlFor={id}>{label}</label>
    <select id={id} className="sl-input" value={selectedValue} onChange={event => onChange(event.target.value)} disabled={disabled || models.length === 0} aria-describedby={`${id}-detail`}>
      {!selected && <option value="" disabled>{models.length ? 'Choose a model' : 'No models available'}</option>}
      {models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
    </select>
    <p id={`${id}-detail`} className="sl-field__hint">{selected?.detail || 'Selection applies to the next request.'}</p>
  </div>;
}

export interface UsageDisplayProps {
  inputTokens: number | null;
  outputTokens: number | null;
  limit: number | null;
  label?: string;
}

/** Unknown, negative and non-finite measurements remain unknown. No inferred billing. */
export function UsageDisplay({ inputTokens, outputTokens, limit, label = 'Token usage' }: UsageDisplayProps) {
  const id = useId();
  const input = tokenCount(inputTokens);
  const output = tokenCount(outputTokens);
  const cap = tokenCount(limit);
  const sum = input !== null && output !== null ? input + output : null;
  const total = sum !== null && Number.isFinite(sum) ? sum : null;
  const canMeasure = total !== null && cap !== null && cap > 0;
  return <section className="sl-usage" aria-labelledby={id}>
    <div className="sl-product-heading"><h3 id={id}>{label}</h3><span className="sl-product-kicker">TOKENS</span></div>
    <div className="sl-usage__total"><strong>{showCount(total)}</strong><span> / {showCount(cap)} limit</span></div>
    {canMeasure ? <meter min={0} max={cap} value={Math.min(total, cap)} aria-label={`${label}: ${showCount(total)} of ${showCount(cap)} tokens`} /> : <p className="sl-product-note">{cap === 0 ? 'This limit has no token allowance.' : 'A complete usage measurement is unavailable.'}</p>}
    {canMeasure && total > cap && <p className="sl-product-note sl-product-warning">{showCount(total - cap)} tokens above the supplied limit.</p>}
    <dl className="sl-usage__breakdown"><div><dt>Input</dt><dd>{showCount(input)}</dd></div><div><dt>Output</dt><dd>{showCount(output)}</dd></div></dl>
  </section>;
}

export type ApprovalDecision = 'approved' | 'rejected';
export interface ApprovalCardProps {
  action: string;
  scope: string;
  summary: string;
  status?: 'pending' | ApprovalDecision;
  onDecision: (decision: ApprovalDecision) => void;
  receiptLabel?: string;
  disabled?: boolean;
}

/** The host owns authority and execution. This component emits a review decision. */
export function ApprovalCard({ action, scope, summary, status = 'pending', onDecision, receiptLabel, disabled }: ApprovalCardProps) {
  const id = useId();
  const state = ['pending', 'approved', 'rejected'].includes(status) ? status : 'pending';
  return <GlassSurface className="sl-approval" aria-labelledby={id}>
    <div className="sl-product-heading"><span className="sl-product-kicker"><Icon name="shield" size={15}/> DECISION REQUIRED</span><span className={`sl-approval__state sl-approval__state--${state}`} role="status">{state === 'pending' ? 'Awaiting review' : state === 'approved' ? 'Approved' : 'Rejected'}</span></div>
    <h3 id={id}>{action}</h3><p className="sl-product-copy">{summary}</p>
    <dl className="sl-approval__scope"><dt>Permission scope</dt><dd>{scope}</dd></dl>
    {receiptLabel && <p className="sl-product-note">{receiptLabel}</p>}
    {state === 'pending' ? <div className="sl-approval__actions"><StarlightButton disabled={disabled} onClick={() => onDecision('approved')}><Icon name="check"/> Approve action</StarlightButton><StarlightButton variant="secondary" disabled={disabled} onClick={() => onDecision('rejected')}>Reject</StarlightButton></div> : <p className="sl-product-note">Decision recorded in this view. Execution status is supplied separately.</p>}
  </GlassSurface>;
}

export interface DataColumn<Row> { key: string; header: ReactNode; render: (row: Row) => ReactNode; align?: 'start' | 'end' }
export interface DataTableProps<Row> {
  rows: readonly Row[];
  columns: readonly DataColumn<Row>[];
  caption: string;
  empty?: ReactNode;
  rowKey?: (row: Row, index: number) => Key;
}

/** Horizontal scrolling preserves the relationships of comparison data on phones. */
export function DataTable<Row>({ rows, columns, caption, empty = 'No records to display.', rowKey }: DataTableProps<Row>) {
  return <div className="sl-table-scroll" tabIndex={0} role="region" aria-label={`${caption}. Scroll horizontally when needed.`}>
    <table className="sl-data-table"><caption>{caption}</caption><thead><tr>{columns.map(column => <th key={column.key} scope="col" data-align={column.align}>{column.header}</th>)}</tr></thead>
      <tbody>{rows.length ? rows.map((row, index) => <tr key={rowKey ? rowKey(row, index) : index}>{columns.map(column => <td key={column.key} data-align={column.align}>{column.render(row)}</td>)}</tr>) : <tr><td className="sl-data-table__empty" colSpan={Math.max(1, columns.length)}>{empty}</td></tr>}</tbody>
    </table>
  </div>;
}

export interface PortfolioAsset { symbol: string; name: string; network: string; quantity: number | string; value: number | null }
export interface WalletPortfolioProps {
  assets: readonly PortfolioAsset[];
  currency?: string;
  updatedAt?: string;
  sourceLabel?: string;
}

/** Read-only presentation. It performs no wallet connection, signing or valuation. */
export function WalletPortfolio({ assets, currency = 'EUR', updatedAt, sourceLabel = 'Illustrative portfolio · read only' }: WalletPortfolioProps) {
  const id = useId();
  const valued = assets.filter(asset => knownNumber(asset.value));
  const unknown = assets.length - valued.length;
  const total = valued.reduce((sum, asset) => sum + (asset.value ?? 0), 0);
  const date = updatedAt ? new Date(updatedAt) : null;
  const hasDate = date !== null && Number.isFinite(date.getTime());
  return <section className="sl-portfolio" aria-labelledby={id}>
    <div className="sl-product-heading"><h3 id={id}>Portfolio</h3><span className="sl-product-kicker"><Icon name="eye" size={15}/> READ ONLY</span></div>
    <p className="sl-product-note">{sourceLabel}</p>
    <div className="sl-portfolio__valuation"><strong>{assets.length && valued.length ? showMoney(total, currency) : 'Unknown'}</strong><span>{unknown ? `Known subtotal · ${unknown} ${unknown === 1 ? 'valuation' : 'valuations'} unknown` : assets.length ? 'Supplied asset values' : 'No asset values supplied'}</span></div>
    <DataTable rows={assets} caption="Assets by network" rowKey={(asset, index) => `${asset.network}:${asset.symbol}:${index}`} empty="No assets supplied. Connect a read-only data source in your application." columns={[
      { key: 'asset', header: 'Asset', render: asset => <span className="sl-asset"><span className="sl-asset__symbol" aria-hidden="true">{asset.symbol.slice(0, 2)}</span><span><strong>{asset.symbol}</strong><small>{asset.name}</small></span></span> },
      { key: 'network', header: 'Network', render: asset => <span className="sl-network">{asset.network || 'Unknown'}</span> },
      { key: 'quantity', header: 'Quantity', align: 'end', render: asset => typeof asset.quantity === 'number' ? knownNumber(asset.quantity) ? new Intl.NumberFormat('en-GB', { maximumFractionDigits: 8 }).format(asset.quantity) : 'Unknown' : asset.quantity || 'Unknown' },
      { key: 'value', header: `Value (${currency})`, align: 'end', render: asset => showMoney(asset.value, currency) },
    ]}/>
    <p className="sl-product-note">{hasDate ? <>Updated <time dateTime={date.toISOString()}>{date.toISOString().replace('T', ' ').replace('.000Z', ' UTC')}</time></> : 'Freshness unknown.'}</p>
  </section>;
}

export interface PricingCardProps {
  name: string;
  description: string;
  amount: number;
  currency?: string;
  features: readonly string[];
  action: ReactNode;
  selected?: boolean;
  eyebrow?: string;
}

export function PricingCard({ name, description, amount, currency = 'EUR', features, action, selected = false, eyebrow = 'SOURCE PRODUCT' }: PricingCardProps) {
  const id = useId();
  return <GlassSurface className={`sl-pricing${selected ? ' sl-pricing--selected' : ''}`} aria-labelledby={id}>
    <div className="sl-product-heading"><span className="sl-product-kicker">{eyebrow}</span>{selected && <span className="sl-pricing__selection">Selected</span>}</div>
    <h3 id={id}>{name}</h3><p className="sl-product-copy">{description}</p><div className="sl-pricing__amount">{showMoney(amount, currency)}<small>one-time target price</small></div>
    <ul>{features.map(feature => <li key={feature}><Icon name="check" size={16}/><span>{feature}</span></li>)}</ul><div className="sl-pricing__action">{action}</div>
  </GlassSurface>;
}

export interface CheckoutSummaryProps {
  productName: string;
  amount: number;
  currency?: string;
  mode?: 'preview';
  children?: ReactNode;
  onConfirm?: () => void;
}

/** A local order-review specimen. No payment fields, provider calls or fulfillment. */
export function CheckoutSummary({ productName, amount, currency = 'EUR', mode = 'preview', children, onConfirm }: CheckoutSummaryProps) {
  const id = useId();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(false);
  function confirmPreview() {
    setError(false);
    try { onConfirm?.(); setConfirmed(true); }
    catch { setError(true); }
  }
  return <GlassSurface className="sl-checkout" aria-labelledby={id} data-mode={mode}>
    <span className="sl-product-kicker"><Icon name="shield" size={15}/> ORDER PREVIEW</span><h3 id={id}>Review your selection.</h3>
    <dl className="sl-checkout__lines"><div><dt>Product</dt><dd>{productName}</dd></div><div><dt>Target price</dt><dd>{showMoney(amount, currency)}</dd></div></dl>
    {children}<p className="sl-product-note">This local preview takes no payment and creates no order. Taxes, license and delivery are confirmed by the seller before purchase.</p>
    <StarlightButton onClick={confirmPreview} disabled={!knownNumber(amount) || confirmed}>{confirmed ? <><Icon name="check"/> Preview reviewed</> : <>Confirm preview <Icon name="arrowRight"/></>}</StarlightButton>
    <div className="sl-checkout__result" role="status">{error ? 'The preview could not be confirmed. Try again.' : confirmed ? 'Selection reviewed locally. No payment taken.' : ''}</div>
  </GlassSurface>;
}

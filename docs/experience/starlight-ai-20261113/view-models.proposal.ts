/** Proposal only. No endpoint, persistence, authorization or runtime compatibility is asserted.
 * Extend owning packages/platform-contract and agent-client through reviewed adapters.
 * Keep raw credentials, signed URLs and tokens out of serialized view models.
 */
export type CapabilityAvailability = 'live' | 'preview' | 'recorded' | 'blueprint' | 'unavailable';
export type Measurement<T> = { state: 'known'; value: T; measuredAt: string; provenance: string }
  | { state: 'unreported' | 'stale'; reason: string };
export interface ModelIdentityView {
  requestedRoute: string | null;
  actual: Measurement<{provider: string; modelId: string; displayName: string}>;
  fallback: { occurred: boolean; policyRef: string; explanation: string } | null;
}
export interface SourceView {
  sourceId: string; title: string; safeOrigin: string;
  locator: string | null; excerpt: string | null;
  publishedAt: string | null; retrievedAt: string | null; version: string | null;
  access: 'available' | 'denied' | 'removed' | 'unreported';
  claimIds: readonly string[]; support: 'supports' | 'contradicts' | 'context' | 'unassessed';
}
export interface RunView {
  workspaceId: string; projectId: string; runId: string; sequence: number;
  execution: 'idle' | 'queued' | 'running' | 'waiting_for_approval' | 'stop_requested'
    | 'stopped' | 'completed' | 'failed' | 'outcome_unknown';
  connection: 'connected' | 'reconnecting' | 'offline'; lastEventAt: string | null;
  invocations: readonly {invocationId: string; stepId: string; messageIds: readonly string[]; model: ModelIdentityView}[];
  sourceIds: readonly string[]; artifactIds: readonly string[];
  budget: Measurement<{currency: string; reservedMinor: number; settledMinor: number; capMinor: number}>;
}
export interface ApprovalView {
  workspaceId: string; projectId: string; runId: string; approvalId: string;
  requestRevision: string; scopeHash: string; actorLabel: string;
  action: string; destination: string; fullScope: readonly string[];
  expiresAt: string; status: 'loading' | 'pending' | 'submitting' | 'approved'
    | 'rejected' | 'expired' | 'scope_changed' | 'outcome_unknown';
  receiptId: string | null; execution: 'not_started' | 'pending' | 'succeeded' | 'failed' | 'outcome_unknown';
  executionReceiptId: string | null;
}
/** Server still authenticates actor and tenant, validates current revision/hash/expiry,
 * and enforces one idempotent decision. Client fields grant no authority. */
export interface ApprovalIntent {
  approvalId: string; requestRevision: string; scopeHash: string;
  decision: 'approve' | 'reject'; idempotencyKey: string;
}
export interface CaptureView {
  captureId: string; workspaceId: string; projectId: string;
  kind: 'selection' | 'page' | 'text' | 'voice';
  saveState: 'draft_local' | 'queued' | 'syncing' | 'saved' | 'failed' | 'conflict';
  receiptId: string | null; payloadPreview: string;
  originLabel: string | null; localCreatedAt: string; serverSavedAt: string | null;
}
export interface SubscriptionView {
  entitlementState: 'active' | 'pending' | 'denied' | 'unreported';
  planId: string | null; billingPeriod: {start: string; end: string} | null;
  settledUse: Measurement<{unit: string; amount: number}>;
  reservedUse: Measurement<{unit: string; amount: number}>;
  changePreview: {previewId: string; currency: string; totalMinor: number;
    taxMinor: number | null; effectiveAt: string; expiresAt: string} | null;
}

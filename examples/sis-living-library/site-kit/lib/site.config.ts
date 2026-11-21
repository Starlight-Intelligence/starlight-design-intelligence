// Single source of truth for the site kit. Pages, JSON-LD, llms.txt,
// /.well-known/starlight.json and the MCP stub all read from here.
// Everything below is fictional demo content. Replace it before launch.

export type Plan = {
  id: string;
  name: string;
  /** Monthly price in whole currency units. null means "talk to us". */
  monthly: number | null;
  /** Price per month when billed yearly. */
  yearly: number | null;
  steps: string;
  summary: string;
  includes: string[];
  action: { label: string; href: string };
  recommended?: boolean;
};

export type LedgerStep = {
  id: string;
  tool: string;
  detail: string;
  /** The step that changed the outcome. Exactly one should be true. */
  flagged?: boolean;
};

export const site = {
  name: 'Orrery',
  url: 'https://orrery.example',
  locale: 'en',
  currency: 'EUR',
  tagline: 'Replay and evaluation for production agents.',
  description:
    'Orrery replays every agent run and flags the steps that changed an outcome, so you can ship prompt and model changes with a clean diff.',
  /** Glass Core theme: 'midnight' or 'ember' (both dark; the shader field follows). */
  theme: 'midnight' as 'midnight' | 'ember',
  themes: {
    midnight: { themeColor: '#101820', field: ['#101820', '#22474b', '#9bd8cd'] },
    ember: { themeColor: '#211a18', field: ['#211a18', '#4a2f26', '#e2ad8a'] },
  } as const,
  nav: [
    { label: 'Docs', href: '/docs' },
    { label: 'Pricing', href: '/pricing' },
  ],
  primaryAction: { label: 'Start free', href: '/signup?plan=free' },

  home: {
    claim: 'Know what your agents did last night.',
    lede: 'Orrery replays every run and flags the steps that changed an outcome.',
    ledger: {
      label: 'Run 4812, overnight',
      claim: 'One step changed the outcome. Orrery finds it.',
      action: { label: 'See how replay works', href: '/docs/replay' },
      steps: [
        { id: 's1', tool: 'read_ticket', detail: 'ticket #20931, 412 tokens' },
        { id: 's2', tool: 'search_kb', detail: '6 articles, top score 0.82' },
        { id: 's3', tool: 'classify', detail: 'billing, confidence 0.91' },
        { id: 's4', tool: 'fetch_invoice', detail: 'stale cache, 31 days old', flagged: true },
        { id: 's5', tool: 'draft_reply', detail: 'refund offered, 188 tokens' },
        { id: 's6', tool: 'send', detail: 'queued for human review' },
      ] satisfies LedgerStep[],
      verdict: 'Step 4 read a stale invoice. The refund was wrong.',
    },
    method: {
      title: 'Connect, replay, ship.',
      steps: [
        'Point your trace exporter at Orrery.',
        'Replay any run against a new prompt or model.',
        'Ship when the diff is clean.',
      ],
      action: { label: 'Read the quickstart', href: '/docs/quickstart' },
    },
    price: {
      claim: 'Free for the first 10,000 steps a month.',
      action: { label: 'Compare plans', href: '/pricing' },
    },
  },

  pricing: {
    claim: 'Pay for the steps you replay.',
    lede: 'Every plan includes replay, diffs and receipts.',
    plans: [
      {
        id: 'free',
        name: 'Free',
        monthly: 0,
        yearly: 0,
        steps: '10,000 steps a month',
        summary: 'For one agent in development.',
        includes: ['7 day retention', 'Replay and diff', 'Community support'],
        action: { label: 'Start free', href: '/signup?plan=free' },
      },
      {
        id: 'team',
        name: 'Team',
        monthly: 49,
        yearly: 39,
        steps: '1,000,000 steps a month',
        summary: 'For agents in production with a small team.',
        includes: ['90 day retention', 'Evaluation suites', 'Slack alerts on flagged steps', 'Email support'],
        action: { label: 'Start a 14 day trial', href: '/signup?plan=team' },
        recommended: true,
      },
      {
        id: 'scale',
        name: 'Scale',
        monthly: null,
        yearly: null,
        steps: 'Volume pricing',
        summary: 'For regulated teams and on-premise traces.',
        includes: ['Custom retention', 'Single sign-on', 'Private deployment', 'Named engineer'],
        action: { label: 'Talk to us', href: 'mailto:hello@orrery.example' },
      },
    ] satisfies Plan[],
    faq: [
      { q: 'What counts as a step?', a: 'One tool call or one model call inside a run. Replays count the steps they execute.' },
            { q: 'Where are traces stored?', a: 'In the EU by default. Scale plans can keep traces in your own cloud account.' },
    ],
  },

  agents: {
    /** Read-only contact points for agents. None of them can buy, write or sign in. */
    llms: '/llms.txt',
    wellKnown: '/.well-known/starlight.json',
    mcp: '/api/mcp',
  },
} as const;

export const themeColor = site.themes[site.theme].themeColor;
export const fieldColors = site.themes[site.theme].field;

export function formatPrice(amount: number | null, currency: string = site.currency) {
  if (amount === null) return 'Custom';
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString();
}

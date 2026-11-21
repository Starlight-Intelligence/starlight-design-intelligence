// Docs shell content. Each page is plain data so the shell, llms.txt and the
// MCP stub can list it. Replace with MDX or a CMS when the content grows.

export type DocBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; id: string; text: string }
  | { kind: 'code'; lang: string; text: string };

export type DocPage = {
  slug: string;
  title: string;
  summary: string;
  section: 'Start' | 'Concepts' | 'Reference';
  blocks: DocBlock[];
};

export const docs: DocPage[] = [
  {
    slug: 'introduction',
    title: 'Introduction',
    summary: 'What Orrery records, and what it does not.',
    section: 'Start',
    blocks: [
      { kind: 'p', text: 'Orrery records each run of your agent as an ordered list of steps. A step is one tool call or one model call, with its inputs, outputs, tokens and timing.' },
      { kind: 'h2', id: 'what-you-get', text: 'What you get' },
      { kind: 'p', text: 'A replay of any run against a new prompt or model, a step by step diff between the two, and a receipt you can attach to a change request.' },
      { kind: 'h2', id: 'what-it-does-not-do', text: 'What it does not do' },
      { kind: 'p', text: 'Orrery does not run your agent in production and never calls your tools with write access during a replay. Replays use recorded tool outputs unless you opt in per tool.' },
    ],
  },
  {
    slug: 'quickstart',
    title: 'Quickstart',
    summary: 'Send your first run in five minutes.',
    section: 'Start',
    blocks: [
      { kind: 'p', text: 'Install the exporter, set one environment variable and run your agent once.' },
      { kind: 'h2', id: 'install', text: 'Install' },
      { kind: 'code', lang: 'sh', text: 'npm install @orrery/exporter' },
      { kind: 'h2', id: 'configure', text: 'Configure' },
      { kind: 'code', lang: 'ts', text: "import { orrery } from '@orrery/exporter';\n\norrery.init({ project: 'support-triage' });" },
      { kind: 'p', text: 'The exporter reads ORRERY_TOKEN from the environment. Runs appear in the dashboard within a few seconds.' },
    ],
  },
  {
    slug: 'replay',
    title: 'Replay',
    summary: 'Re-run a recorded run against a new prompt or model.',
    section: 'Concepts',
    blocks: [
      { kind: 'p', text: 'A replay takes a recorded run, swaps one variable, and executes the same steps again. Orrery then lines up the two runs step by step.' },
      { kind: 'h2', id: 'flagged-steps', text: 'Flagged steps' },
      { kind: 'p', text: 'A step is flagged when its output differs and a later step depends on it. Flagged steps are the ones worth reading first.' },
      { kind: 'h2', id: 'receipts', text: 'Receipts' },
      { kind: 'p', text: 'Every replay produces a receipt: the two runs, the diff and the variable that changed. Receipts are immutable and linkable.' },
    ],
  },
  {
    slug: 'agents',
    title: 'For agents',
    summary: 'Read-only endpoints for language models and agent clients.',
    section: 'Reference',
    blocks: [
      { kind: 'p', text: 'This site publishes three read-only entry points for agents. None of them can create accounts, take payments or change data.' },
      { kind: 'h2', id: 'llms-txt', text: 'llms.txt' },
      { kind: 'code', lang: 'sh', text: 'curl https://orrery.example/llms.txt' },
      { kind: 'h2', id: 'well-known', text: 'Site manifest' },
      { kind: 'code', lang: 'sh', text: 'curl https://orrery.example/.well-known/starlight.json' },
      { kind: 'h2', id: 'mcp', text: 'MCP endpoint' },
      { kind: 'p', text: 'A stateless Model Context Protocol endpoint over Streamable HTTP. It answers server/discover (revision 2026-07-28), initialize for older clients, tools/list and tools/call for two read-only tools: get_pricing and list_docs.' },
      { kind: 'code', lang: 'sh', text: "curl -X POST https://orrery.example/api/mcp \\\n  -H 'content-type: application/json' \\\n  -H 'accept: application/json, text/event-stream' \\\n  -H 'mcp-protocol-version: 2026-07-28' \\\n  -H 'mcp-method: tools/list' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'" },
    ],
  },
];

export function getDoc(slug: string) {
  return docs.find((d) => d.slug === slug);
}

export const docSections = ['Start', 'Concepts', 'Reference'] as const;

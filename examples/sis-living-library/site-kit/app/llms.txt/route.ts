import { site, absoluteUrl, formatPrice } from '@/lib/site.config';
import { docs } from '@/lib/docs';

// llms.txt (llmstxt.org): H1, blockquote summary, then H2 sections of links.

export function GET() {
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    'This site is read-only for agents. No endpoint here can create accounts, take payments or change data.',
    '',
    '## Docs',
    '',
    ...docs.map((d) => `- [${d.title}](${absoluteUrl(`/docs/${d.slug}`)}): ${d.summary}`),
    '',
    '## Pricing',
    '',
    ...site.pricing.plans.map(
      (p) => `- [${p.name}](${absoluteUrl(`/pricing#${p.id}`)}): ${formatPrice(p.monthly)} per month, ${p.steps}. ${p.summary}`,
    ),
    '',
    '## Optional',
    '',
    `- [Site manifest](${absoluteUrl(site.agents.wellKnown)}): pages, endpoints and authority as JSON`,
    `- [MCP endpoint](${absoluteUrl('/docs/agents')}): stateless Streamable HTTP, read-only tools`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

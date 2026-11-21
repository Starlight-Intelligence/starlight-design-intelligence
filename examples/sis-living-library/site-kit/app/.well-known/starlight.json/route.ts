import { site, absoluteUrl } from '@/lib/site.config';
import { docs } from '@/lib/docs';

// Machine-readable site description for agents. Read-only by contract.

export function GET() {
  return Response.json({
    schema: 'starlight.site.v1',
    name: site.name,
    url: site.url,
    description: site.description,
    pages: [
      { path: '/', title: site.home.claim },
      { path: '/pricing', title: site.pricing.claim },
      ...docs.map((d) => ({ path: `/docs/${d.slug}`, title: d.title })),
    ],
    endpoints: {
      llms: absoluteUrl(site.agents.llms),
      mcp: { url: absoluteUrl(site.agents.mcp), transport: 'streamable-http', tools: ['get_pricing', 'list_docs'] },
    },
    authority: { read: true, write: false, payments: false, accounts: false },
    generator: 'starlight-glass-core-site-kit',
  });
}

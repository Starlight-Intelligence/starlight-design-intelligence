import { site, formatPrice } from '@/lib/site.config';
import { docs } from '@/lib/docs';

// Stateless Model Context Protocol stub over Streamable HTTP, JSON responses only.
// Targets revision 2026-07-28 (stateless: server/discover, resultType, ttlMs,
// cacheScope) and still answers `initialize` for 2025-11-25 clients.
// Read-only: two tools over public site data. No sessions, no writes, no auth.
// Spec read 2026-11-21: research/craft/glass-core-docs-read-2026-11-21.md (section 4).

const CURRENT = '2026-07-28';
const SUPPORTED = [CURRENT, '2025-11-25', '2025-06-18', '2025-03-26'];
const TTL = { ttlMs: 300_000, cacheScope: 'public' as const };
const serverInfo = { name: `${site.name.toLowerCase()}-site`, version: '0.1.0' };
const instructions = 'Read-only public site data. No account, payment or write operations exist on this server.';

const tools = [
  {
    name: 'get_pricing',
    description: `Current public plans and prices for ${site.name}.`,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'list_docs',
    description: `Documentation pages for ${site.name}, with URLs and summaries.`,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

type Id = string | number | null | undefined;
type RpcRequest = { jsonrpc: '2.0'; id?: Id; method: string; params?: Record<string, unknown> };
type Reply = { status: number; body: unknown };

const ok = (id: Id, result: Record<string, unknown>): Reply => ({
  status: 200,
  body: { jsonrpc: '2.0', id: id ?? null, result: { resultType: 'complete', ...result, _meta: { 'io.modelcontextprotocol/serverInfo': serverInfo } } },
});
const fail = (id: Id, status: number, code: number, message: string): Reply => ({
  status,
  body: { jsonrpc: '2.0', id: id ?? null, error: { code, message } },
});
const text = (value: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], structuredContent: value, isError: false });

function handle(req: RpcRequest): Reply {
  switch (req.method) {
    case 'server/discover':
      return ok(req.id, { supportedVersions: SUPPORTED, capabilities: { tools: {} }, instructions, ...TTL });
    case 'initialize': // 2025-11-25 and earlier clients
      return {
        status: 200,
        body: { jsonrpc: '2.0', id: req.id ?? null, result: { protocolVersion: '2025-11-25', capabilities: { tools: { listChanged: false } }, serverInfo, instructions } },
      };
    case 'tools/list':
      return ok(req.id, { tools, ...TTL });
    case 'tools/call': {
      const name = req.params?.name;
      if (name === 'get_pricing')
        return ok(
          req.id,
          text({
            currency: site.currency,
            plans: site.pricing.plans.map((p) => ({ id: p.id, name: p.name, monthly: formatPrice(p.monthly), yearly: formatPrice(p.yearly), steps: p.steps })),
          }),
        );
      if (name === 'list_docs')
        return ok(req.id, text({ docs: docs.map((d) => ({ title: d.title, url: `${site.url}/docs/${d.slug}`, summary: d.summary })) }));
      return fail(req.id, 200, -32602, `Unknown tool: ${String(name)}`);
    }
    default:
      return fail(req.id, 404, -32601, `Method not found: ${req.method}`);
  }
}

export async function POST(request: Request) {
  const header = request.headers.get('mcp-protocol-version');
  if (header && !SUPPORTED.includes(header))
    return Response.json(fail(null, 400, -32022, `Unsupported protocol version: ${header}`).body, { status: 400 });
  let body: RpcRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json(fail(null, 400, -32700, 'Parse error').body, { status: 400 });
  }
  if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string')
    return Response.json(fail(null, 400, -32600, 'Invalid request').body, { status: 400 });
  const metaVersion = (body.params?._meta as Record<string, unknown> | undefined)?.['io.modelcontextprotocol/protocolVersion'];
  if (header && typeof metaVersion === 'string' && metaVersion !== header)
    return Response.json(fail(body.id, 400, -32020, 'MCP-Protocol-Version header does not match _meta').body, { status: 400 });
  if (body.id === undefined) return new Response(null, { status: 202 }); // notification
  const reply = handle(body);
  return Response.json(reply.body, { status: reply.status, headers: { 'MCP-Protocol-Version': header ?? CURRENT } });
}

// Stateless server: no GET stream, no session to delete.
const notAllowed = () => new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
export const GET = notAllowed;
export const DELETE = notAllowed;

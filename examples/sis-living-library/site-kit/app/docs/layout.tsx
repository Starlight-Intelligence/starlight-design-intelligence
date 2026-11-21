import type { ReactNode } from 'react';
import { DocsNav } from '@/components/site/docs-nav';
import { AgentSlot } from '@/components/site/agent-slot';

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ks-docs">
      <DocsNav />
      <div className="ks-docs__main">{children}</div>
      <aside className="ks-docs__aside">
        <AgentSlot title="Ask about these docs" />
      </aside>
    </div>
  );
}

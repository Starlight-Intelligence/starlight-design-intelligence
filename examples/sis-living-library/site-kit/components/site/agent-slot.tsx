import type { ReactNode } from 'react';

// Mount point for an agent surface such as the AG-UI / CopilotKit provider and
// tools from Living Agent UI (@starlight/living-agent-ui/copilotkit).
// The kit ships no agent runtime, model key or subscription. Until a host
// passes children, the slot renders an honest empty state.
//
//   <AgentSlot title="Ask about these docs">
//     <StarlightCopilotProvider runtimeUrl="/api/copilotkit">
//       <YourChatSurface />
//     </StarlightCopilotProvider>
//   </AgentSlot>

export type AgentSlotProps = {
  title: string;
  children?: ReactNode;
};

export function AgentSlot({ title, children }: AgentSlotProps) {
  return (
    <section className="ks-agent-slot" aria-label={title} data-connected={children ? 'true' : 'false'}>
      <h2 className="ks-label">{title}</h2>
      {children ?? (
        <p className="ks-agent-slot__empty">
          No assistant is connected to this site yet. The docs on the left are the complete answer.
        </p>
      )}
    </section>
  );
}

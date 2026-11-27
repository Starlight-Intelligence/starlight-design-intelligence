import { Button } from '@starlight/materials/primitives';
import {
  Answer,
  AnswerBody,
  AnswerMeta,
  AnswerSources,
  ApprovalGate,
  CitationMark,
  Composer,
  MemoryChip,
  ModelRoute,
  RunStep,
  RunTimeline,
  SourceChip,
  ToolCall,
  summarizeRun,
} from '@starlight/materials/agent';
import type { RunState } from '@starlight/materials/agent';

// One agent run on ink, as a Server Component: nothing here hydrates. The content is
// illustrative; the repository, the sources and the timings are made up to show the
// shape of a run, not to report one.
const steps: { state: RunState; title: string; detail: string; meta?: string }[] = [
  { state: 'done', title: 'Read the repository', detail: 'Research · 14 files', meta: '3.1 s' },
  { state: 'done', title: 'Draft the plan', detail: 'Coordinate', meta: '1.4 s' },
  { state: 'working', title: 'Write the patch', detail: 'Build · 2 of 3 files' },
  { state: 'waiting', title: 'Open a pull request', detail: 'Build · needs repo.write' },
  { state: 'idle', title: 'Review against the brief', detail: 'Review' },
];

const SOURCES = 'run-sources';

export default function Page() {
  const summary = summarizeRun(steps.map((s) => s.state));
  return (
    <main className="mx-auto grid max-w-[1120px] gap-8 px-4 py-10 md:px-8">
      <header className="grid gap-3">
        <p className="font-mono text-code opacity-70">Agent run · illustrative</p>
        <h1 className="text-headline-lg font-semibold tracking-headline-lg text-balance md:text-display md:tracking-display">
          Work you can <em className="font-serif font-normal text-accent-bright">watch.</em>
        </h1>
        <p className="max-w-[52ch] text-body-lg opacity-80">
          Every action is a step. Writes stop at a gate. Every claim points at its source.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section aria-label="Conversation" className="grid content-start gap-4">
          <p className="rounded-lg border border-hairline bg-glass-opaque p-4 text-body-md">
            Find why structured fields go missing in example-org/logger and propose a fix.
          </p>

          <Answer>
            <AnswerMeta>
              <ModelRoute route="Auto" detail="answered by route 2" />
              <MemoryChip>Used 3 notes from memory</MemoryChip>
            </AnswerMeta>
            <AnswerBody>
              <p>
                Structured fields are dropped when a reporter is swapped at runtime
                <CitationMark index={1} sourcesId={SOURCES} />. The fix carries the fields through the reporter interface
                <CitationMark index={2} sourcesId={SOURCES} />; the patch touches three files and adds one test
                <CitationMark index={3} sourcesId={SOURCES} />.
              </p>
            </AnswerBody>
            <AnswerSources id={SOURCES}>
              <SourceChip index={1} sourcesId={SOURCES} title="Issue thread" domain="example.com" href="https://example.com/issues/1" />
              <SourceChip index={2} sourcesId={SOURCES} title="Reporter interface" domain="example.com" href="https://example.com/src/reporter" />
              <SourceChip index={3} sourcesId={SOURCES} title="Proposed patch" domain="saved run" href="#run" />
            </AnswerSources>
          </Answer>

          <Composer
            route={<ModelRoute route="Auto" detail="per step" />}
            tools={<span className="rounded-full border border-hairline bg-primary px-3 py-1.5 text-label-sm">Tools · none</span>}
          />
        </section>

        <aside id="run" aria-label="Run" className="grid content-start gap-3">
          <p role="status" className="font-mono text-code opacity-70">
            {summary.label}
          </p>
          <RunTimeline label={`Run, ${summary.total} steps`}>
            {steps.map((s) => (
              <RunStep key={s.title} state={s.state} title={s.title} detail={s.detail} meta={s.meta} />
            ))}
          </RunTimeline>

          <ApprovalGate
            request="Build wants to open a pull request with 3 changed files."
            scope="repo.write · example-org/logger"
            note="Nothing is written until you choose."
          >
            <Button material="paper" size="sm" type="button">
              Approve once
            </Button>
            <Button material="ink" size="sm" type="button">
              Deny
            </Button>
          </ApprovalGate>

          <ToolCall
            name="repo.read_files"
            scope="read-only"
            args={'{ "repo": "example-org/logger",\n  "ref": "main" }'}
            note="Scope granted for this run only."
          />
        </aside>
      </div>
    </main>
  );
}

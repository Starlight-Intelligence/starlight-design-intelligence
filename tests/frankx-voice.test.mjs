import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { lintFrankxVoice, main } from "../scripts/check-frankx-voice.mjs";

const errorsOf = (text, options) =>
  lintFrankxVoice(text, options).filter((finding) => finding.severity === "error").map((finding) => finding.rule);
const warningsOf = (text) =>
  lintFrankxVoice(text).filter((finding) => finding.severity === "warn").map((finding) => finding.rule);

const FAILING = [
  ["em-dash", "The agent shipped the fix — then it broke."],
  ["unattributed-forecast", "AGI is coming in 2027. Are you ready?"],
  ["unattributed-forecast", "Superintelligence arrives in two years."],
  ["income-claim", "Build passive income with three agents."],
  ["income-claim", "I make $12k/month from this workflow."],
  ["inevitability", "Those who don't adapt will be left behind."],
  ["unpopular-opinion", "Unpopular opinion: prompts are dead."],
  ["arcanea-diction", "The Luminors would approve of this deployment."],
  ["unattributed-forecast", "AGI is forecast by 2027."],
  ["unattributed-forecast", "AGI arrives on 2027-01-01."],
  ["income-claim", "Students earn $3,000 in their first month."],
  ["unfilled-slot", "Read the [release](https://example.com), then fill [task]."],
  ["unfilled-slot", "One pipeline did [task] in [time] for [cost]."],
  ["numbered-opener", "# Draft\n\n7 lessons from shipping agents\n\nBody."],
  ["numbered-opener", "1/ \u{1F9F5}\nHere is how I ship."],
  ["golden-age-repeat", "A golden age is near.\nThis golden age needs receipts."]
];

for (const [rule, text] of FAILING) {
  test(`flags ${rule}: ${text.split("\n").find((line) => line && !line.startsWith("#"))}`, () => {
    assert.ok(errorsOf(text).includes(rule), `expected ${rule}, got ${JSON.stringify(errorsOf(text))}`);
  });
}

test("passes copy that follows the FrankX rules", () => {
  const text = [
    "# Week 43 build note",
    "",
    "On 21 October the required design check started failing with zero jobs on every pull request.",
    "The kernel had moved organisations. I repinned the workflow, ran the kernel's own validator locally,",
    "and the check went green on the next run. Start with the check that failed silently; that is where the risk sat.",
    "",
    "Dario Amodei wrote in January 2026 that he expects powerful AI within a few years; here is what it still needs.",
    "Read the [kernel pull request](https://github.com/Starlight-Intelligence/starlight-design-intelligence/pull/55).",
    "We may be at the start of a golden age of intelligence, if the work is verified."
  ].join("\n");
  assert.deepEqual(errorsOf(text), []);
});

test("attributed or slotted forecasts are not flagged", () => {
  assert.deepEqual(errorsOf("Hassabis said in January 2026 that AGI could arrive by 2030."), []);
  assert.deepEqual(errorsOf("[Lab leader] expects AGI by [year].", { template: true }), []);
});

test("ISO dates are records, not forecasts", () => {
  assert.deepEqual(errorsOf("AGI claim rules from the research pass 2026-10-23."), []);
});

test("template mode allows bracket slots but keeps every other rule", () => {
  assert.deepEqual(errorsOf("One pipeline did [task] in [time].", { template: true }), []);
  assert.ok(errorsOf("Do [task] — now.", { template: true }).includes("em-dash"));
});

test("code fences are skipped", () => {
  assert.deepEqual(errorsOf("Run this:\n```\necho \"left behind — [x]\"\n```\nDone."), []);
});

test("warnings do not count as errors", () => {
  const text = "This is not a demo, but a working tool. It will unlock nothing by itself.";
  assert.deepEqual(errorsOf(text), []);
  assert.deepEqual(warningsOf(text).sort(), ["contrast-formula", "hype-verb"]);
});

test("findings carry line numbers", () => {
  const [finding] = lintFrankxVoice("Fine line.\nSecond line — broken.");
  assert.equal(finding.line, 2);
  assert.equal(finding.rule, "em-dash");
});

test("CLI exits 1 on errors and 0 on clean copy", () => {
  const directory = mkdtempSync(join(tmpdir(), "frankx-voice-"));
  const bad = join(directory, "bad.md");
  const good = join(directory, "good.md");
  writeFileSync(bad, "AGI is coming in 2027.");
  writeFileSync(good, "I repinned the check and it passed on the next run.");
  const run = (file) => spawnSync(process.execPath, ["scripts/check-frankx-voice.mjs", file], { encoding: "utf8" });
  assert.equal(run(bad).status, 1);
  assert.equal(run(good).status, 0);
});

test("prices are not income claims", () => {
  assert.deepEqual(errorsOf("The product costs $20/month and the audit is $490."), []);
});

test("negated inevitability passes", () => {
  assert.deepEqual(errorsOf("AGI is not inevitable, and neither is the timeline."), []);
  assert.deepEqual(errorsOf("Nothing about this is inevitable."), ["inevitability"]);
});

test("common-word Arcanea names warn instead of failing", () => {
  const text = "We benchmarked the Nero burner and the Lumina lamp.";
  assert.deepEqual(errorsOf(text), []);
  assert.ok(warningsOf(text).includes("arcanea-name-check"));
});

test("reference links, definitions and checkboxes are not slots", () => {
  assert.deepEqual(errorsOf("See the [kernel notes][kernel] for details."), []);
  assert.deepEqual(errorsOf("[kernel]: https://example.com/kernel"), []);
  assert.deepEqual(errorsOf("- [ ] write the receipt\n- [x] run the check"), []);
});

test("tilde fences and longer fences mask their contents", () => {
  assert.deepEqual(errorsOf("~~~\nleft behind — [x]\n~~~\nDone."), []);
  assert.deepEqual(errorsOf("````\n```\nleft behind\n```\n````\nDone."), []);
});

test("fenced content does not trigger document rules", () => {
  assert.deepEqual(errorsOf("```\n7 lessons from agents\ngolden age golden age\n```\nReal opener."), []);
});

test("historical mentions of AGI are not forecasts", () => {
  assert.deepEqual(errorsOf("In 2026, I reviewed AGI safety papers."), []);
});

test("bare X-not-Y lines warn", () => {
  assert.ok(warningsOf("Evidence, not hype.").includes("contrast-formula"));
});

test("CLI rejects unknown options and unreadable files with exit 2", () => {
  const quiet = { log: () => {}, error: () => {} };
  assert.equal(main(["--templat", "package.json"], quiet), 2);
  assert.equal(main([], quiet), 2);
  assert.equal(main(["missing.md"], { ...quiet, read: () => { const e = new Error("nope"); e.code = "ENOENT"; throw e; } }), 2);
  assert.equal(main(["warn.md"], { ...quiet, read: () => "It will unlock nothing." }), 0);
});

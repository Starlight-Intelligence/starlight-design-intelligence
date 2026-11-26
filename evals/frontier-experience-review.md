# Frontier Experience Review

Use this pre-release review with the [constitution](../portfolio/frontier-experience-constitution.md) and the owning product's release checks. Existing release and production approval procedures still apply.

| Dimension | Points | Assigned reviewer |
| --- | ---: | --- |
| Professional workflow depth | 25 | Design |
| Visual art direction and originality | 20 | Design |
| Media and spatial experience | 15 | Design |
| Functional completeness | 15 | Technical |
| Identity and provenance | 10 | Identity |
| Performance and accessibility | 10 | Technical |
| Continuity and documentation | 5 | Technical |

Score whole points using actual artifacts. Media and spatial design earns points for fitness to the job, including well-judged restraint. Record why points were awarded and what was observed. An 85/100 minimum is required. Any missing or failing critical check blocks the review.

## Evidence and reviewer contract

Attach a short walkthrough and evidence for the exact candidate. For a rendered surface, include the baseline and candidate at phone, tablet and desktop widths, an inspected visual diff, keyboard and accessibility results, and observed loading and interaction behavior. For media, inspect format, crops, caption and playback equivalents where relevant. Record the underlying evidence links, owning surface, release intent, asset ID/version/hash receipts and the publication authority when publication is requested. An unresolved source cannot appear as an approved asset.

Each reviewer posts an **Approve** review on the current PR head with their commentary and exactly one fenced `frontier-review` JSON block. Use the appropriate shape below and replace the example URL and scores with real evidence and judgment. Use the same candidate URL in all three reviews. The URL identifies an immutable build or evidence record with a binding to the reviewed commit. The reviewers verify that binding before signing. For a hosted web preview, use the existing preview-binding verifier where available.

```frontier-review
{"role":"design","candidate":"https://example.com/build","evidence":["https://example.com/design-evidence"],"scores":{"workflow":24,"art_direction":18,"media_spatial":13}}
```

```frontier-review
{"role":"technical","candidate":"https://example.com/build","evidence":["https://example.com/technical-evidence"],"scores":{"functionality":14,"performance_accessibility":9,"continuity":5},"critical":{"functionality":"pass","accessibility":"pass"}}
```

```frontier-review
{"role":"identity","candidate":"https://example.com/build","evidence":["https://example.com/source-receipt"],"scores":{"identity_provenance":10},"critical":{"identity":"pass","provenance":"pass","publication_authorization":"not-requested"}}
```

For a publication PR use `publication_authorization: "pass"` only after verifying the named owner's approval for the exact artifact, channel and release. For preview-only work use `"not-requested"`; the caller sets the publication scope in the workflow. For work without owned assets, the identity reviewer verifies that the candidate introduces no unresolved identity use. Review comments and approvals for older commits do not count.

## Enable in an owning repository

Call `.github/workflows/frontier-review.yml` from this repository at an immutable kernel commit. Call it from `pull_request` (including synchronize and ready-for-review) and `pull_request_review` (submitted, edited and dismissed), with `pull-requests: read`. Put public publication and preview-only changes in workflows or scopes with the correct publication setting. Set the repository variable `FRONTIER_REVIEWERS` to a JSON object with the exact GitHub logins for `design`, `technical` and `identity`. Assign three distinct people with repository access and keep the PR author out of that roster for the change. The gate checks the designated logins and GitHub review metadata. Configure GitHub rules to require the emitted check for the covered scope, retain stale-review dismissal and protect workflow and scope edits with code owners. Verify a passing run and failing run in a real repository before claiming enforcement. The gate tests authenticated GitHub review metadata and receipt consistency. Reviewers inspect the linked evidence, and the product's tests and promotion controls still run separately.

## Machine-checked browser evidence

For web pilots with authorized evidence bytes, set `require-artifacts: true` on
the same reusable workflow. Keep raw private captures and source artwork in
their governed stores. Enable this option only when the owning repository is an
authorized evidence location.

Place `artifacts.json` and its files in `.starlight/frontier-review/`. Compute
`candidate_sha256` using `node scripts/validate-frontier-artifacts.mjs
<candidate-repo> <base-sha> <head-sha> --digest`. The digest covers the diff
from merge base to head excluding this evidence directory. Commit evidence before
requesting exact-head reviews. Verify preview bindings and repeat affected checks
when integration changes behavior.

The receipt uses `schema_version: "starlight.frontier_artifacts.v1"` and includes
`candidate_sha256`, `preview_url`, `task`, `outcome`, `limitations`, a
`screenshots` map (375, 768 and 1440 pixel PNGs, before and after), and a
`reports` map (interaction, visual_regression, accessibility, performance,
provenance and continuation). Map entries reference a plain file name and
SHA-256. Each JSON report carries its `kind`, `candidate_sha256`,
`result: "pass"`, `method` and `observation`. Record verified parity when
a change preserves visual appearance. Preserve stricter viewport requirements
from the owning product. See the [synthetic fixture](../tests/frontier-artifacts.test.mjs)
for an example.

This step checks the candidate binding, artifact integrity, screenshot dimensions
and report structure. Authenticated reviewers inspect claims, substantive test
adequacy and source authorization.

## Scoped caller for product repositories

Use the sibling reusable workflow `.github/workflows/frontier-scoped-review.yml` at a full reviewed commit. It calls the existing review at the same revision. The owning caller subscribes to PR open, synchronize, reopen, edit, ready-for-review and label changes, plus review submission, edit and dismissal. Give it read-only contents and pull-request permissions. Use one concurrency group per PR and cancel older runs. Supply these inputs:

| Input | Contract |
| --- | --- |
| `surface-paths` | One literal file or directory ending in `/` per line. Include the owning UI plus any separate content, layout or media paths whose edits must trigger review. The trusted snapshot covers both sides of moves. |
| `evidence-location` | Default `external` leaves evidence in the approved viewer. Reviewers sign authenticated evidence links. Public receipts must be safe to disclose and contain no access tokens. The workflow rejects new artifacts in the in-repository Frontier evidence directory in this mode. Select `repository` only for authorized private evidence. It requires private visibility and validates committed screenshots and reports. |
| `preview-base` | Optional exact branch for a private candidate review. The default branch and every other destination require publication review when covered. |

A label can add a review. Removing it cannot exempt a covered path. Protect the caller and its declared paths independently of the candidate before making its emitted Frontier surface verdict a required check. An unconfigured or unavailable runner cannot produce a passing verdict. Keep existing product release and merge-queue policies. Confirm behavior on a real eligible review and dismissal before enabling branch requirements.

## Instruction coverage

Run the audit from a trusted design-kernel checkout. Supply the full constitution commit selected by the owning maintainer and the candidate checkout. The input pin identifies the selected policy. The audit compares references to that pin. Resolve the policy itself from the authority before choosing the pin.

```sh
node scripts/audit-frontier-instructions.mjs --repo ../product --ref HEAD --pin "$CONSTITUTION_SHA" --check
```

The JSON report records the Git revision, paths, import chains, source references and gaps. It reads the committed tree, including nested rules. An exact GitHub blob or raw URL can establish a direct pin. Bare native import lines in Claude and Gemini instructions and explicit local paths in OpenCode JSON can establish transitive pins. Cycle, external path, symlink, unsupported configuration, missing root, competing authority, mutable ref or stale pin needs resolution. Code samples, blockquotes and HTML comments cannot establish pins. For the authority's own checkout, use `--authority` at the scanned revision to resolve the local constitution.

Skill and agent-rule rows identify explicit references when present. MCP and workflow rows record inventory only. A scoped instruction without an explicit path is a coverage gap even where a host might inherit an ancestor. Markdown semantics, host defaults, user overrides, remote MCP prompts and installed runtime behavior still require a fresh loading receipt in the relevant host.

The included composite action checks the consumer's existing checkout. Call it from the owning read-only PR workflow after checkout and Node setup. Pin the action to a reviewed 40-character design-kernel commit, and pass the selected constitution commit in the `pin` input. Keep the consumer checkout step on the candidate under review. The action prints JSON, exits 1 on coverage failures and exits 2 on an invalid input or unreadable revision. Omit `--check` for a report-only discovery run. Keep downstream coverage reports in their owning visibility boundary.

## Route SEO evidence

Run `python3 -B scripts/audit-route-seo.py --manifest routes.json --origin "$CANDIDATE_ORIGIN" --mode public` against an explicitly selected indexable surface. Use `--mode preview` for a preview that should remain excluded from indexing. Bind the resulting JSON to the actual deployment revision in the owning receipt. The audit sends anonymous GET requests to the named candidate origin, never follows redirects and never discovers additional hosts from responses.

```json
{
  "public_origin": "https://studio.example",
  "sitemaps": ["/sitemap.xml", "/sitemap-pages.xml"],
  "routes": [
    {"path": "/edition", "visibility": "public", "canonical": "/edition", "structured_data": {"Article": ["headline"]}},
    {"path": "/desk", "visibility": "private"}
  ],
  "redirects": [{"from": "/old-edition", "to": "/edition", "status": 308}]
}
```

The first sitemap is the entry point. Declare each shard needed to cover the selected pages. For each public route the probe requires an HTML 200, one absolute canonical matching the declared public origin and path, a title, a description, syntactically valid JSON-LD and the declared schema.org types and nonempty fields. Use an empty structured-data map where the route has no required type. These assertions cover the supplied shape. Search-engine indexing, robots.txt crawl eligibility and rich-result eligibility require separate observations. Redirect checks compare the actual status and Location in a single response. Private paths must stay outside the declared sitemap and require authentication or a universal noindex directive. Public pages must be indexable in public mode and must carry universal noindex in preview mode. A protected preview whose page content cannot be inspected reports that coverage gap. Preview-only fixtures may supply an empty sitemap list. The probe does not grant access, change robots directives or represent a whole-site crawl.

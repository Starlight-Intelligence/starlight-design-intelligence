import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const axe = readFileSync(
  new URL("../../node_modules/axe-core/axe.min.js", import.meta.url),
  "utf8",
);
test("all five journeys plus native A2UI, offline state and export", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Run the sample analysis" }).click();
  await expect(
    page.getByRole("heading", { name: "Choose what you want to own." }),
  ).toBeVisible();
  const slider = page.getByRole("slider", { name: "Quality weight: 70%" });
  await slider.focus();
  await slider.press("Home");
  await expect(
    page.getByRole("slider", { name: "Quality weight: 0%" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Approval", exact: true }).click();
  await page.getByText("Exact action arguments").click();
  await expect(
    page.getByText('"includeCookies": false', { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Reject/ }).click();
  await expect(
    page.getByText("Rejected. No capture was performed.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Request a new proposal" }).click();
  await page.getByRole("button", { name: /Approve action/ }).click();
  await expect(
    page.getByText("Displayed fixture captured locally.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mission", exact: true }).click();
  for (let step = 0; step < 3; step++)
    await page
      .getByRole("button", { name: "Advance one fixture contribution" })
      .click();
  await expect(
    page.getByRole("button", { name: "Mission complete" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Browser", exact: true }).click();
  await expect(
    page.getByText("https://example.com/architecture", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Research", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export cited report" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "starlight-research-demo.md",
  );
  await page.getByRole("button", { name: "A2UI", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A declared surface. Your components." }),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "Simulate offline state" }).check();
  await page.getByRole("button", { name: "Conversation", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Send request" }),
  ).toBeDisabled();
  expect(errors).toEqual([]);
});
for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
])
  for (const theme of ["midnight", "daylight", "ember"]) {
    test(`${viewport.width}/${theme}: six surfaces, reflow, axe, reduced motion`, async ({
      page,
    }, info) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.getByLabel("Theme", { exact: true }).selectOption(theme);
      await page
        .getByRole("button", { name: "Run the sample analysis" })
        .click();
      for (const name of [
        "Conversation",
        "Approval",
        "Mission",
        "Browser",
        "Research",
        "A2UI",
      ]) {
        await page.getByRole("button", { name, exact: true }).click();
        if (name === "A2UI")
          await expect(
            page.getByRole("heading", {
              name: "A declared surface. Your components.",
            }),
          ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.addScriptTag({ content: axe });
        const violations = await page.evaluate(async () => {
          const result = await (
            window as unknown as {
              axe: {
                run: (
                  node: Document,
                  options: unknown,
                ) => Promise<{ violations: { id: string; impact: string }[] }>;
              };
            }
          ).axe.run(document, {
            runOnly: {
              type: "tag",
              values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
            },
          });
          return result.violations;
        });
        expect(violations).toEqual([]);
        await info.attach(`${viewport.width}-${theme}-${name}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
      }
    });
  }

/** URL parsing, not prefix matching, defines the same-origin transport boundary. */
export function sameOriginEndpoint(input: string): string {
  const base = "https://starlight.invalid";
  if (!input.startsWith("/") || /[\u0000-\u0020\u007f\\#]/.test(input))
    throw new Error(
      "Use a same-origin host endpoint without whitespace, controls or a fragment.",
    );
  const parsed = new URL(input, base);
  if (parsed.origin !== base || parsed.pathname.startsWith("//"))
    throw new Error("Use a same-origin host endpoint.");
  return parsed.pathname + parsed.search;
}

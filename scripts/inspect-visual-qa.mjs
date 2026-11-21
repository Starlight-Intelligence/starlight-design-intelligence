// Pass this function directly to Playwright page.evaluate(fn, brand). Keep it self-contained:
// Playwright serialises the source, so no imports, closures or module-level helpers.
//
// brand = { palette: { name: "#rrggbb" }, canvasRole, textRole, readingFamily, limits }
// It measures three observable things at the current viewport:
//   1. horizontal overflow, with the widest offending elements named;
//   2. WCAG 2.x AA contrast of every visible text run against its composited ancestor background;
//   3. conformance with the declared brand pack (canvas, body text, reading family, backdrop limits).
// Text painted over an image or gradient cannot be resolved from computed style; it is reported as
// unresolved for human review rather than silently passed or failed.
export function inspectVisualQa(brand) {
  const failures = [];
  const unresolved = [];
  const seen = new Set();
  const MAX_ELEMENTS = 20000;
  const parse = (value) => {
    const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/u.exec(value ?? "");
    if (!m) return null;
    let a = m[4] === undefined ? 1 : m[4].endsWith("%") ? Number.parseFloat(m[4]) / 100 : Number(m[4]);
    if (!Number.isFinite(a)) a = 1;
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a };
  };
  const hexToRgb = (hex) => {
    let h = hex.replace("#", "");
    if (h.length === 3) h = [...h].map((c) => c + c).join("");
    return { r: Number.parseInt(h.slice(0, 2), 16), g: Number.parseInt(h.slice(2, 4), 16), b: Number.parseInt(h.slice(4, 6), 16), a: 1 };
  };
  const over = (top, bottom) => {
    const a = top.a + bottom.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const mix = (k) => (top[k] * top.a + bottom[k] * bottom.a * (1 - top.a)) / a;
    return { r: mix("r"), g: mix("g"), b: mix("b"), a };
  };
  const channel = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const luminance = (c) => 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
  const ratio = (x, y) => { const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
  const hex = (c) => `#${[c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  const palette = Object.entries(brand?.palette ?? {}).map(([name, value]) => ({ name, rgb: hexToRgb(value) }));
  // A token match tolerates sub-pixel rounding only (max channel delta 2), never a different colour.
  const token = (c) => palette.find((p) => Math.max(Math.abs(p.rgb.r - c.r), Math.abs(p.rgb.g - c.g), Math.abs(p.rgb.b - c.b)) <= 2)?.name ?? null;
  const location = (element) => {
    const parts = [];
    for (let current = element; current && current !== document.documentElement && parts.length < 6; current = current.parentElement) {
      if (current.id) { parts.unshift(`#${CSS.escape(current.id)}`); break; }
      const siblings = current.parentElement ? [...current.parentElement.children].filter((s) => s.localName === current.localName) : [current];
      parts.unshift(`${current.localName}:nth-of-type(${siblings.indexOf(current) + 1})`);
    }
    return parts.join(" > ");
  };
  const fail = (code, element, message, detail = {}) => {
    const selector = element ? location(element) : "document";
    const key = `${code}:${selector}`;
    if (seen.has(key)) return;
    seen.add(key);
    failures.push({ code, selector, message, ...detail });
  };
  const visible = (element) => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && element.getClientRects().length > 0;

  // Composite ancestor backgrounds bottom-up over the white initial canvas.
  const background = (element) => {
    const layers = [];
    for (let current = element; current; current = current.parentElement) {
      const style = getComputedStyle(current);
      if (style.backgroundImage !== "none") return { color: null, reason: `background-image on ${location(current) || current.localName}` };
      const color = parse(style.backgroundColor);
      if (color && color.a > 0) { layers.push(color); if (color.a >= 1) break; }
    }
    let result = { r: 255, g: 255, b: 255, a: 1 };
    for (const layer of layers.reverse()) result = over(layer, result);
    return { color: result };
  };

  const elements = [...document.body.querySelectorAll("*")];
  if (elements.length > MAX_ELEMENTS) {
    fail("inspection-limit", null, `Surface exceeds the bounded ${MAX_ELEMENTS}-element inspection limit.`);
    return { failures, unresolved, complete: false };
  }

  // 1. Horizontal overflow.
  const viewport = document.documentElement.clientWidth;
  const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  if (scrollWidth > window.innerWidth + 1) {
    const offenders = elements.filter(visible)
      .map((element) => ({ element, right: element.getBoundingClientRect().right + window.scrollX }))
      .filter((item) => item.right > viewport + 1)
      .sort((a, b) => b.right - a.right).slice(0, 5)
      .map((item) => ({ selector: location(item.element), right_px: Math.round(item.right) }));
    fail("horizontal-overflow", null, `Document is ${scrollWidth}px wide in a ${window.innerWidth}px viewport.`, { scroll_width: scrollWidth, offenders });
  }

  // 2. Text contrast, one measurement per element that directly owns visible text.
  let measured = 0;
  const textColors = new Map();
  for (const element of [document.body, ...elements]) {
    if (element.closest("script,style,template,noscript,svg") || !visible(element)) continue;
    const ownText = [...element.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    const isControlText = element.matches("input:not([type=hidden]),textarea,select") && (element.value || element.placeholder);
    if (!ownText && !isControlText) continue;
    const style = getComputedStyle(element);
    const bg = background(element);
    const fgRaw = parse(style.color);
    if (!fgRaw) continue;
    if (!bg.color) { unresolved.push({ selector: location(element), reason: bg.reason }); continue; }
    const fg = over(fgRaw, bg.color);
    const size = Number.parseFloat(style.fontSize);
    const weight = Number.parseInt(style.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const required = large ? 3 : 4.5;
    const value = ratio(fg, bg.color);
    measured += 1;
    textColors.set(hex(fg), (textColors.get(hex(fg)) ?? 0) + 1);
    if (value + 1e-9 < required) {
      fail("text-contrast", element, `Contrast ${value.toFixed(2)}:1 is below WCAG AA ${required}:1 for ${large ? "large" : "normal"} text.`, {
        ratio: Number(value.toFixed(2)), required, foreground: hex(fg), background: hex(bg.color),
        foreground_token: token(fg), background_token: token(bg.color)
      });
    }
  }

  // 3. Brand-pack conformance.
  const brandChecks = {};
  if (palette.length) {
    const canvas = background(document.body).color;
    const bodyColor = parse(getComputedStyle(document.body).color);
    brandChecks.canvas = canvas ? { value: hex(canvas), token: token(canvas) } : { value: null, token: null };
    brandChecks.body_text = bodyColor ? { value: hex(over(bodyColor, canvas ?? { r: 255, g: 255, b: 255, a: 1 })), token: null } : null;
    if (brandChecks.body_text) brandChecks.body_text.token = token(hexToRgb(brandChecks.body_text.value));
    const expect = (role, observed, label) => {
      if (!observed?.token) fail("brand-off-palette", document.body, `${label} ${observed?.value ?? "unresolved"} is not a token of the declared brand pack.`, { expected_role: role });
      else if (role && observed.token !== role) fail("brand-role-mismatch", document.body, `${label} uses token "${observed.token}"; the brand pack assigns "${role}".`, { expected_role: role, observed_token: observed.token });
    };
    expect(brand.canvasRole, brandChecks.canvas, "Page canvas");
    expect(brand.textRole, brandChecks.body_text, "Body text colour");
  }
  if (brand?.readingFamily) {
    const declared = getComputedStyle(document.body).fontFamily;
    brandChecks.reading_family = declared;
    if (!declared.toLowerCase().includes(brand.readingFamily.toLowerCase())) {
      fail("brand-reading-family", document.body, `Body font-family "${declared}" does not declare the brand reading family "${brand.readingFamily}".`);
    }
  }
  if (brand?.limits) {
    const backdrops = elements.filter((element) => visible(element) && getComputedStyle(element).backdropFilter !== "none");
    brandChecks.backdrop_surfaces = backdrops.length;
    if (Number.isInteger(brand.limits.maxVisibleBackdropSurfaces) && backdrops.length > brand.limits.maxVisibleBackdropSurfaces) {
      fail("brand-backdrop-limit", backdrops[brand.limits.maxVisibleBackdropSurfaces], `${backdrops.length} visible backdrop surfaces exceed the brand limit of ${brand.limits.maxVisibleBackdropSurfaces}.`);
    }
    if (brand.limits.allowNestedBackdrop === false) {
      for (const element of backdrops) {
        if (backdrops.some((other) => other !== element && other.contains(element))) fail("brand-nested-backdrop", element, "The brand pack forbids nested backdrop surfaces.");
      }
    }
  }
  return {
    failures, unresolved, complete: true,
    measured_text_elements: measured, viewport_width: window.innerWidth, scroll_width: scrollWidth,
    text_colors: Object.fromEntries(textColors), brand: brandChecks
  };
}

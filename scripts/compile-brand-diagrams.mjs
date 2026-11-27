#!/usr/bin/env node
/**
 * Deterministic Multi-Brand SVG Diagram & HUD Compiler
 *
 * Zero-dependency compiler (node:fs, node:path, node:crypto, node:url) that
 * loads brand tokens from brand-packs/{frankx,sis,arcanea,gencreator,agentic-income,ai-coe},
 * compiles 6 visual archetypes into crisp dark + light SVGs, enforces WCAG AA
 * (>= 4.5:1) contrast linting and glyph-width overflow bounds, and emits a
 * content-addressed registry.json manifest.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ROOT = resolve(MODULE_DIR, "..");

export const SUPPORTED_BRANDS = Object.freeze([
  "frankx",
  "sis",
  "arcanea",
  "gencreator",
  "agentic-income",
  "ai-coe"
]);

export const SUPPORTED_ARCHETYPES = Object.freeze([
  "stack-tiers",
  "curriculum-roadmap",
  "comparison-matrix",
  "layered-architecture",
  "hub-spoke",
  "hud-blueprint"
]);

export const SUPPORTED_THEMES = Object.freeze(["dark", "light"]);

export const WCAG_AA_MIN_CONTRAST = 4.5;

const BRAND_THEME_TOKENS = Object.freeze({
  frankx: {
    fonts: {
      display: "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif",
      body: "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace"
    },
    dark: {
      canvas: "#0A0A0B",
      canvasAlt: "#0F141C",
      surface: "#11161F",
      elevated: "#171F2C",
      border: "#28364A",
      borderStrong: "#3B4F6B",
      textPrimary: "#F8FAFC",
      textSecondary: "#D4DEE9",
      textMuted: "#9FB0C4",
      accent: "#34D399",
      accentSecondary: "#38BDF8",
      signal: "#FBBF24",
      badgeBg: "#0D2922",
      badgeBorder: "#1D5B4B",
      badgeText: "#6EE7B7",
      signalBg: "#2B1F0B",
      signalBorder: "#6B4C16",
      signalText: "#FCD34D",
      connector: "#38BDF8",
      gridLine: "#182230",
      hudTint: "#101B2D",
      hudTintOpacity: 0.88
    },
    light: {
      canvas: "#FBF9F5",
      canvasAlt: "#F3EFE7",
      surface: "#FFFFFF",
      elevated: "#F4F0E8",
      border: "#D5CFC3",
      borderStrong: "#B5ADA0",
      textPrimary: "#141413",
      textSecondary: "#2F2D2A",
      textMuted: "#524E48",
      accent: "#065F46",
      accentSecondary: "#0369A1",
      signal: "#92400E",
      badgeBg: "#ECFDF5",
      badgeBorder: "#A7F3D0",
      badgeText: "#065F46",
      signalBg: "#FEF3C7",
      signalBorder: "#FCD34D",
      signalText: "#78350F",
      connector: "#047857",
      gridLine: "#EAE4D9",
      hudTint: "#F5F8FC",
      hudTintOpacity: 0.92
    }
  },
  sis: {
    fonts: {
      display: "'Instrument Sans', Inter, system-ui, -apple-system, sans-serif",
      body: "'Instrument Sans', Inter, system-ui, -apple-system, sans-serif",
      mono: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace"
    },
    dark: {
      canvas: "#070A10",
      canvasAlt: "#0C121E",
      surface: "#0F1624",
      elevated: "#162033",
      border: "#283959",
      borderStrong: "#3E5682",
      textPrimary: "#F5F2EB",
      textSecondary: "#D6DEEC",
      textMuted: "#A2B0C8",
      accent: "#7DD3FC",
      accentSecondary: "#A5B4FC",
      signal: "#F0C87E",
      badgeBg: "#112438",
      badgeBorder: "#244B70",
      badgeText: "#BAE6FD",
      signalBg: "#2A2010",
      signalBorder: "#684F24",
      signalText: "#F6D89E",
      connector: "#82D8E6",
      gridLine: "#141E30",
      hudTint: "#0D172B",
      hudTintOpacity: 0.88
    },
    light: {
      canvas: "#EFEDE7",
      canvasAlt: "#E6E2D8",
      surface: "#FAF8F3",
      elevated: "#EAE6DC",
      border: "#C9C3B5",
      borderStrong: "#9E9788",
      textPrimary: "#0B101B",
      textSecondary: "#232D40",
      textMuted: "#455166",
      accent: "#0C5472",
      accentSecondary: "#3730A3",
      signal: "#7A5010",
      badgeBg: "#E0F2FE",
      badgeBorder: "#93C5FD",
      badgeText: "#0C4A6E",
      signalBg: "#FEF3C7",
      signalBorder: "#E5B869",
      signalText: "#6B440B",
      connector: "#0E5A7A",
      gridLine: "#DFDBD0",
      hudTint: "#F5F7FC",
      hudTintOpacity: 0.92
    }
  },
  arcanea: {
    fonts: {
      display: "Geist, 'Instrument Sans', Inter, system-ui, sans-serif",
      body: "Geist, Inter, system-ui, sans-serif",
      mono: "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace"
    },
    dark: {
      canvas: "#090B10",
      canvasAlt: "#0E1422",
      surface: "#111828",
      elevated: "#182238",
      border: "#293A5C",
      borderStrong: "#415B8C",
      textPrimary: "#F5F3EE",
      textSecondary: "#D4DFEE",
      textMuted: "#A1B0C8",
      accent: "#22D3EE",
      accentSecondary: "#7FFFD4",
      signal: "#FDE047",
      badgeBg: "#0E2A38",
      badgeBorder: "#1D5770",
      badgeText: "#67E8F9",
      signalBg: "#2B240D",
      signalBorder: "#6E5B1C",
      signalText: "#FEF08A",
      connector: "#22D3EE",
      gridLine: "#162034",
      hudTint: "#10192E",
      hudTintOpacity: 0.88
    },
    light: {
      canvas: "#F6F4EE",
      canvasAlt: "#ECE8DD",
      surface: "#FFFFFF",
      elevated: "#EFECE2",
      border: "#CFC9B8",
      borderStrong: "#A59E8C",
      textPrimary: "#0E131F",
      textSecondary: "#263147",
      textMuted: "#47536B",
      accent: "#0B5D70",
      accentSecondary: "#0D47A1",
      signal: "#755200",
      badgeBg: "#E6F7FA",
      badgeBorder: "#8CD7E5",
      badgeText: "#094A59",
      signalBg: "#FEF9C3",
      signalBorder: "#EAB308",
      signalText: "#664600",
      connector: "#0E6478",
      gridLine: "#E5E0D3",
      hudTint: "#F4F7FC",
      hudTintOpacity: 0.92
    }
  },
  gencreator: {
    fonts: {
      display: "'Instrument Serif', Georgia, Cambria, serif",
      body: "'Instrument Sans', Inter, system-ui, sans-serif",
      mono: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace"
    },
    dark: {
      canvas: "#12100E",
      canvasAlt: "#191613",
      surface: "#1C1916",
      elevated: "#26221E",
      border: "#3F3831",
      borderStrong: "#5C5248",
      textPrimary: "#FBF9F5",
      textSecondary: "#E2DDD3",
      textMuted: "#B2A99B",
      accent: "#F87171",
      accentSecondary: "#FBBF24",
      signal: "#FCA5A5",
      badgeBg: "#361917",
      badgeBorder: "#6E2E2A",
      badgeText: "#FECACA",
      signalBg: "#2E2212",
      signalBorder: "#6B4E24",
      signalText: "#FDE68A",
      connector: "#F87171",
      gridLine: "#24201C",
      hudTint: "#1E1A18",
      hudTintOpacity: 0.9
    },
    light: {
      canvas: "#FBF9F5",
      canvasAlt: "#F3EFE8",
      surface: "#FFFFFF",
      elevated: "#F2EFE9",
      border: "#D8D2C7",
      borderStrong: "#ADA597",
      textPrimary: "#221F1B",
      textSecondary: "#3B3630",
      textMuted: "#575048",
      accent: "#A6241D",
      accentSecondary: "#221F1B",
      signal: "#8C3D0F",
      badgeBg: "#FDECEC",
      badgeBorder: "#F3B4B0",
      badgeText: "#881B15",
      signalBg: "#FEF3C7",
      signalBorder: "#E5B869",
      signalText: "#78350F",
      connector: "#A6241D",
      gridLine: "#EAE5DC",
      hudTint: "#FAF7F2",
      hudTintOpacity: 0.94
    }
  },
  "agentic-income": {
    fonts: {
      display: "Inter, 'Segoe UI', system-ui, sans-serif",
      body: "Inter, 'Segoe UI', system-ui, sans-serif",
      mono: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace"
    },
    dark: {
      canvas: "#101213",
      canvasAlt: "#15191B",
      surface: "#181C1F",
      elevated: "#21272B",
      border: "#353F45",
      borderStrong: "#4E5C64",
      textPrimary: "#F4F0E7",
      textSecondary: "#D9D4C9",
      textMuted: "#A8A397",
      accent: "#FBBF24",
      accentSecondary: "#4ADE80",
      signal: "#F59E0B",
      badgeBg: "#132D1F",
      badgeBorder: "#235A3C",
      badgeText: "#86EFAC",
      signalBg: "#2E200B",
      signalBorder: "#6E4B16",
      signalText: "#FDE68A",
      connector: "#FBBF24",
      gridLine: "#1E2428",
      hudTint: "#161D22",
      hudTintOpacity: 0.9
    },
    light: {
      canvas: "#F4F0E7",
      canvasAlt: "#ECE6D9",
      surface: "#FCFBF7",
      elevated: "#EAE4D7",
      border: "#CBC3B2",
      borderStrong: "#9E9685",
      textPrimary: "#101213",
      textSecondary: "#292E31",
      textMuted: "#495055",
      accent: "#8F4900",
      accentSecondary: "#166534",
      signal: "#7C3F00",
      badgeBg: "#DCFCE7",
      badgeBorder: "#86EFAC",
      badgeText: "#14532D",
      signalBg: "#FEF3C7",
      signalBorder: "#F59E0B",
      signalText: "#713F12",
      connector: "#8F4900",
      gridLine: "#E2DCCE",
      hudTint: "#F7F5EE",
      hudTintOpacity: 0.94
    }
  },
  "ai-coe": {
    fonts: {
      display: "Inter, 'Segoe UI', system-ui, sans-serif",
      body: "Inter, 'Segoe UI', system-ui, sans-serif",
      mono: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace"
    },
    dark: {
      canvas: "#0A0D14",
      canvasAlt: "#0F1522",
      surface: "#121928",
      elevated: "#1A2438",
      border: "#2C3C59",
      borderStrong: "#435B85",
      textPrimary: "#F8FAFC",
      textSecondary: "#D4DFEE",
      textMuted: "#A2B2C8",
      accent: "#60A5FA",
      accentSecondary: "#38BDF8",
      signal: "#FBBF24",
      badgeBg: "#132746",
      badgeBorder: "#264E86",
      badgeText: "#93C5FD",
      signalBg: "#2B200D",
      signalBorder: "#684E1D",
      signalText: "#FDE68A",
      connector: "#60A5FA",
      gridLine: "#172033",
      hudTint: "#101A2E",
      hudTintOpacity: 0.89
    },
    light: {
      canvas: "#F8FAFC",
      canvasAlt: "#F1F5F9",
      surface: "#FFFFFF",
      elevated: "#EEF2F6",
      border: "#CBD5E1",
      borderStrong: "#94A3B8",
      textPrimary: "#0F172A",
      textSecondary: "#283548",
      textMuted: "#475569",
      accent: "#1D4ED8",
      accentSecondary: "#0369A1",
      signal: "#92400E",
      badgeBg: "#DBEAFE",
      badgeBorder: "#93C5FD",
      badgeText: "#1E40AF",
      signalBg: "#FEF3C7",
      signalBorder: "#FCD34D",
      signalText: "#78350F",
      connector: "#1D4ED8",
      gridLine: "#E2E8F0",
      hudTint: "#F4F8FD",
      hudTintOpacity: 0.93
    }
  }
});

export function parseHexColor(hex) {
  const clean = String(hex || "").trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(clean)) {
    throw new Error(`Invalid hex color "${hex}"`);
  }
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : clean;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16)
  };
}

export function rgbToHex({ r, g, b }) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

export function blendHex(fgHex, bgHex, alpha = 1) {
  const a = Math.max(0, Math.min(1, Number(alpha)));
  if (a >= 1) return rgbToHex(parseHexColor(fgHex));
  if (a <= 0) return rgbToHex(parseHexColor(bgHex));
  const fg = parseHexColor(fgHex);
  const bg = parseHexColor(bgHex);
  return rgbToHex({
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a)
  });
}

export function relativeLuminance(hex) {
  const { r, g, b } = parseHexColor(hex);
  const linearize = (channel) => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(fgHex, bgHex) {
  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function estimateTextWidth(text, fontSize, { mono = false, bold = false, letterSpacing = 0 } = {}) {
  const str = String(text ?? "");
  if (!str.length) return 0;
  let units = 0;
  for (const ch of str) {
    if (mono) {
      units += 0.61;
    } else if ("ijlI1|.,:;!'` ".includes(ch)) {
      units += ch === " " ? 0.31 : 0.29;
    } else if ("mwMW@#%&QGO0".includes(ch)) {
      units += 0.82;
    } else if (ch >= "A" && ch <= "Z") {
      units += 0.67;
    } else if (ch >= "0" && ch <= "9") {
      units += 0.58;
    } else if ("-_+=/\\()[]{}".includes(ch)) {
      units += 0.44;
    } else if (ch.charCodeAt(0) > 0x024f) {
      units += 0.88;
    } else {
      units += 0.55;
    }
  }
  const weightFactor = bold ? 1.05 : 1.0;
  const raw = units * fontSize * weightFactor + Math.max(0, str.length - 1) * letterSpacing;
  return Number(raw.toFixed(2));
}

export function wrapTextToWidth(text, maxWidthPx, fontSize, options = {}) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const words = clean.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || estimateTextWidth(candidate, fontSize, options) <= maxWidthPx) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function loadBrandPackMetadata(brandId, { rootDir = DEFAULT_ROOT } = {}) {
  if (!SUPPORTED_BRANDS.includes(brandId)) {
    throw new Error(
      `Unsupported brand "${brandId}". Supported brands: ${SUPPORTED_BRANDS.join(", ")}`
    );
  }
  const humanPackDir = join(rootDir, "brand-packs", brandId);
  const designDocPath = join(humanPackDir, "DESIGN.md");
  const runtimePackPath = join(
    rootDir,
    "brand-image-system",
    "runtime",
    "brands",
    brandId,
    "brand-pack.json"
  );
  if (!existsSync(designDocPath)) {
    throw new Error(`Missing canonical brand DESIGN.md for "${brandId}": ${designDocPath}`);
  }
  if (!existsSync(runtimePackPath)) {
    throw new Error(`Missing runtime brand-pack.json for "${brandId}": ${runtimePackPath}`);
  }
  const runtimePack = JSON.parse(readFileSync(runtimePackPath, "utf8"));
  const extraTokenSources = [];
  const frankxTokensPath = join(humanPackDir, "TOKENS.md");
  if (existsSync(frankxTokensPath)) extraTokenSources.push("brand-packs/frankx/TOKENS.md");
  const sisFoundationsPath = join(humanPackDir, "foundations", "tokens.json");
  if (existsSync(sisFoundationsPath)) extraTokenSources.push("brand-packs/sis/foundations/tokens.json");
  const sisRefLocksPath = join(humanPackDir, "REFERENCE-LOCKS.md");
  if (existsSync(sisRefLocksPath)) extraTokenSources.push("brand-packs/sis/REFERENCE-LOCKS.md");

  return {
    brandId,
    displayName: runtimePack.displayName || brandId,
    operatingUnit: runtimePack.operatingUnit || brandId,
    sourceDocs: [...(runtimePack.sourceDocs || []), ...extraTokenSources],
    bannedPhrases: runtimePack.voice?.bannedPhrases || [],
    doNotUse: runtimePack.doNotUse || [],
    sourceColors: runtimePack.visual?.colors || {}
  };
}

export function verifyPaletteContrast(palette, brandId = "unknown", theme = "dark") {
  const hudComposite = blendHex(palette.hudTint, palette.canvas, palette.hudTintOpacity);
  const checks = [
    { pair: "textPrimary/canvas", fg: palette.textPrimary, bg: palette.canvas },
    { pair: "textPrimary/surface", fg: palette.textPrimary, bg: palette.surface },
    { pair: "textPrimary/elevated", fg: palette.textPrimary, bg: palette.elevated },
    { pair: "textPrimary/hudComposite", fg: palette.textPrimary, bg: hudComposite },
    { pair: "textSecondary/canvas", fg: palette.textSecondary, bg: palette.canvas },
    { pair: "textSecondary/surface", fg: palette.textSecondary, bg: palette.surface },
    { pair: "textSecondary/elevated", fg: palette.textSecondary, bg: palette.elevated },
    { pair: "textSecondary/hudComposite", fg: palette.textSecondary, bg: hudComposite },
    { pair: "textMuted/canvas", fg: palette.textMuted, bg: palette.canvas },
    { pair: "textMuted/surface", fg: palette.textMuted, bg: palette.surface },
    { pair: "textMuted/elevated", fg: palette.textMuted, bg: palette.elevated },
    { pair: "textMuted/hudComposite", fg: palette.textMuted, bg: hudComposite },
    { pair: "accent/canvas", fg: palette.accent, bg: palette.canvas },
    { pair: "accent/surface", fg: palette.accent, bg: palette.surface },
    { pair: "accent/elevated", fg: palette.accent, bg: palette.elevated },
    { pair: "accent/hudComposite", fg: palette.accent, bg: hudComposite },
    { pair: "badgeText/badgeBg", fg: palette.badgeText, bg: palette.badgeBg },
    { pair: "signalText/signalBg", fg: palette.signalText, bg: palette.signalBg }
  ].map((entry) => {
    const ratio = contrastRatio(entry.fg, entry.bg);
    return {
      ...entry,
      ratio,
      passed: ratio >= WCAG_AA_MIN_CONTRAST
    };
  });

  const failures = checks.filter((c) => !c.passed);
  if (failures.length) {
    const detail = failures
      .map((f) => `${brandId}.${theme} ${f.pair} (${f.fg} on ${f.bg}) = ${f.ratio}:1 < 4.5:1`)
      .join("; ");
    throw new Error(`WCAG AA palette contrast check failed: ${detail}`);
  }
  return { hudComposite, checks };
}

export function loadBrandPalette(brandId, theme = "dark", options = {}) {
  if (!SUPPORTED_THEMES.includes(theme)) {
    throw new Error(`Unsupported theme "${theme}". Expected one of: ${SUPPORTED_THEMES.join(", ")}`);
  }
  const meta = loadBrandPackMetadata(brandId, options);
  const brandDef = BRAND_THEME_TOKENS[brandId];
  const basePalette = structuredClone(brandDef[theme]);
  if (options.paletteOverrides) {
    Object.assign(basePalette, options.paletteOverrides);
  }
  const { hudComposite, checks } = verifyPaletteContrast(basePalette, brandId, theme);
  return {
    ...meta,
    theme,
    fonts: structuredClone(brandDef.fonts),
    colors: {
      ...basePalette,
      hudComposite
    },
    paletteChecks: checks
  };
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function n(value) {
  return Number(Number(value).toFixed(2));
}

function renderIcon(iconName, x, y, size, strokeHex) {
  const s = n(size);
  const scale = n(size / 24);
  const stroke = escapeXml(strokeHex);
  const paths = {
    terminal: `<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7.5 9.5L11 12l-3.5 2.5"/><path d="M13 14.5h4"/>`,
    gateway: `<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="7" r="2.2"/><circle cx="18" cy="17" r="2.2"/><path d="M8.2 11.2L15.8 7.8"/><path d="M8.2 12.8l7.6 3.4"/>`,
    cpu: `<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>`,
    shield: `<path d="M12 3l7 3v5.5c0 4.6-3 8.4-7 9.5-4-1.1-7-4.9-7-9.5V6l7-3z"/><path d="M9 12.2l2 2 4-4.2"/>`,
    vault: `<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5v-2M12 17.5v-2M8.5 12h-2M17.5 12h-2"/>`,
    "queen-star": `<path d="M12 2.8L14.3 9.7L21.2 12L14.3 14.3L12 21.2L9.7 14.3L2.8 12L9.7 9.7Z"/><circle cx="18.2" cy="5.8" r="1.5" fill="${stroke}" stroke="none"/>`,
    layers: `<path d="M12 3.5L20.5 8L12 12.5L3.5 8L12 3.5Z"/><path d="M3.5 12L12 16.5L20.5 12"/><path d="M3.5 16L12 20.5L20.5 16"/>`,
    spark: `<path d="M13 3L5.5 13.5H12L11 21L18.5 10.5H12L13 3Z"/>`,
    check: `<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.3l2.3 2.3 4.8-5"/>`,
    compass: `<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2.2 5.2-5.2 2.2 2.2-5.2 5.2-2.2z"/>`,
    book: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16.5H6.5A2.5 2.5 0 0 0 4 22V5.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>`,
    workflow: `<rect x="3" y="4" width="6.5" height="5" rx="1.2"/><rect x="14.5" y="4" width="6.5" height="5" rx="1.2"/><rect x="8.8" y="15" width="6.5" height="5" rx="1.2"/><path d="M9.5 6.5h5M12 9v6"/>`,
    globe: `<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.6 2.4 4 5.4 4 8.5s-1.4 6.1-4 8.5c-2.6-2.4-4-5.4-4-8.5s1.4-6.1 4-8.5z"/>`,
    database: `<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6"/><path d="M4.5 12v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/>`,
    code: `<path d="M8.5 8L4 12l4.5 4M15.5 8L20 12l-4.5 4M13.5 5.5l-3 13"/>`,
    eye: `<path d="M2.5 12S6.2 6 12 6s9.5 6 9.5 6-3.7 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.6"/>`
  };
  const body = paths[iconName] || paths.layers;
  return `<g transform="translate(${n(x)}, ${n(y)}) scale(${scale})" width="${s}" height="${s}" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}

function collectStringsFromSpec(node, bucket = []) {
  if (typeof node === "string") {
    bucket.push(node);
  } else if (Array.isArray(node)) {
    for (const item of node) collectStringsFromSpec(item, bucket);
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (["id", "brand", "archetype", "icon", "fit", "$schema"].includes(key)) continue;
      collectStringsFromSpec(value, bucket);
    }
  }
  return bucket;
}

export function lintDiagramSpec(spec, { rootDir = DEFAULT_ROOT } = {}) {
  const errors = [];
  if (!spec || typeof spec !== "object") {
    return ["Diagram spec must be a JSON object"];
  }
  if (!spec.id || !/^[a-z0-9][a-z0-9-]*$/.test(spec.id)) {
    errors.push("spec.id must match ^[a-z0-9][a-z0-9-]*$");
  }
  if (!SUPPORTED_BRANDS.includes(spec.brand)) {
    errors.push(`spec.brand must be one of: ${SUPPORTED_BRANDS.join(", ")}`);
  }
  if (!SUPPORTED_ARCHETYPES.includes(spec.archetype)) {
    errors.push(`spec.archetype must be one of: ${SUPPORTED_ARCHETYPES.join(", ")}`);
  }
  if (!spec.title || typeof spec.title !== "string") {
    errors.push("spec.title is required");
  }
  if (SUPPORTED_BRANDS.includes(spec.brand)) {
    const meta = loadBrandPackMetadata(spec.brand, { rootDir });
    const allText = collectStringsFromSpec(spec).join(" \n ").toLowerCase();
    for (const banned of meta.bannedPhrases) {
      if (banned && allText.includes(banned.toLowerCase())) {
        errors.push(`spec contains banned brand phrase for ${spec.brand}: "${banned}"`);
      }
    }
  }
  return errors;
}

function createRenderContext(spec, brand, { width, height }) {
  const contrastChecks = [];
  const overflowChecks = [];
  const elements = [];
  const colors = brand.colors;

  function recordTextCheck({
    label,
    text,
    fontSize,
    bold = false,
    mono = false,
    letterSpacing = 0,
    maxWidthPx,
    fgHex,
    bgHex,
    bgAlpha = 1
  }) {
    const effectiveBg = bgAlpha < 1 ? blendHex(bgHex, colors.canvas, bgAlpha) : bgHex;
    const ratio = contrastRatio(fgHex, effectiveBg);
    contrastChecks.push({
      label,
      text: String(text),
      fgHex,
      bgHex: effectiveBg,
      ratio,
      passed: ratio >= WCAG_AA_MIN_CONTRAST
    });
    if (typeof maxWidthPx === "number" && Number.isFinite(maxWidthPx)) {
      const estimatedWidth = estimateTextWidth(text, fontSize, { mono, bold, letterSpacing });
      overflowChecks.push({
        label,
        text: String(text),
        estimatedWidth,
        maxWidthPx: n(maxWidthPx),
        passed: estimatedWidth <= maxWidthPx + 0.5
      });
    }
  }

  function addText({
    label,
    text,
    x,
    y,
    fontSize = 15,
    fontWeight = 500,
    fontFamily = brand.fonts.body,
    mono = false,
    letterSpacing = 0,
    fill = colors.textPrimary,
    bgHex = colors.surface,
    bgAlpha = 1,
    maxWidthPx = null,
    anchor = "start"
  }) {
    const str = String(text ?? "");
    if (!str) return;
    recordTextCheck({
      label,
      text: str,
      fontSize,
      bold: Number(fontWeight) >= 600,
      mono,
      letterSpacing,
      maxWidthPx,
      fgHex: fill,
      bgHex,
      bgAlpha
    });
    const lsAttr = letterSpacing ? ` letter-spacing="${n(letterSpacing)}"` : "";
    const anchorAttr = anchor !== "start" ? ` text-anchor="${anchor}"` : "";
    elements.push(
      `<text x="${n(x)}" y="${n(y)}" fill="${escapeXml(fill)}" font-family="${escapeXml(fontFamily)}" font-size="${n(fontSize)}" font-weight="${fontWeight}"${lsAttr}${anchorAttr}>${escapeXml(str)}</text>`
    );
  }

  function addWrappedText({
    label,
    text,
    x,
    y,
    maxWidthPx,
    maxLines = 3,
    lineHeight = 20,
    fontSize = 14,
    fontWeight = 400,
    fontFamily = brand.fonts.body,
    mono = false,
    letterSpacing = 0,
    fill = colors.textSecondary,
    bgHex = colors.surface,
    bgAlpha = 1,
    anchor = "start"
  }) {
    const lines = wrapTextToWidth(text, maxWidthPx, fontSize, {
      mono,
      bold: Number(fontWeight) >= 600,
      letterSpacing
    });
    if (lines.length > maxLines) {
      overflowChecks.push({
        label: `${label}:line-count`,
        text: String(text),
        estimatedWidth: lines.length,
        maxWidthPx: maxLines,
        passed: false
      });
    }
    const visible = lines.slice(0, maxLines);
    visible.forEach((line, idx) => {
      addText({
        label: `${label}[${idx + 1}]`,
        text: line,
        x,
        y: y + idx * lineHeight,
        fontSize,
        fontWeight,
        fontFamily,
        mono,
        letterSpacing,
        fill,
        bgHex,
        bgAlpha,
        maxWidthPx,
        anchor
      });
    });
    return visible.length;
  }

  function addBadge({
    label,
    text,
    x,
    y,
    height: badgeH = 26,
    padX = 11,
    fontSize = 11.5,
    mono = true,
    variant = "accent"
  }) {
    const bgHex = variant === "signal" ? colors.signalBg : variant === "neutral" ? colors.elevated : colors.badgeBg;
    const borderHex =
      variant === "signal" ? colors.signalBorder : variant === "neutral" ? colors.borderStrong : colors.badgeBorder;
    const fgHex = variant === "signal" ? colors.signalText : variant === "neutral" ? colors.textSecondary : colors.badgeText;
    const textW = estimateTextWidth(text, fontSize, { mono, bold: true, letterSpacing: 0.4 });
    const badgeW = Math.ceil(textW + padX * 2 + 4);
    elements.push(
      `<rect x="${n(x)}" y="${n(y)}" width="${n(badgeW)}" height="${n(badgeH)}" rx="${n(badgeH / 2)}" fill="${escapeXml(bgHex)}" stroke="${escapeXml(borderHex)}" stroke-width="1"/>`
    );
    addText({
      label,
      text,
      x: x + badgeW / 2,
      y: y + badgeH / 2 + fontSize * 0.35,
      fontSize,
      fontWeight: 600,
      fontFamily: mono ? brand.fonts.mono : brand.fonts.body,
      mono,
      letterSpacing: 0.4,
      fill: fgHex,
      bgHex,
      maxWidthPx: badgeW - padX,
      anchor: "middle"
    });
    return badgeW;
  }

  return {
    width,
    height,
    colors,
    elements,
    contrastChecks,
    overflowChecks,
    push: (raw) => elements.push(raw),
    addText,
    addWrappedText,
    addBadge
  };
}

function renderCanvasChrome(ctx, spec, brand) {
  const { width, height, colors } = ctx;
  ctx.push(`<defs>
    <linearGradient id="bg-grad-${escapeXml(spec.id)}-${brand.theme}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${escapeXml(colors.canvas)}"/>
      <stop offset="100%" stop-color="${escapeXml(colors.canvasAlt)}"/>
    </linearGradient>
    <pattern id="grid-${escapeXml(spec.id)}-${brand.theme}" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="${escapeXml(colors.gridLine)}" stroke-width="0.75"/>
    </pattern>
    <marker id="arrow-${escapeXml(spec.id)}-${brand.theme}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="${escapeXml(colors.connector)}"/>
    </marker>
  </defs>`);

  ctx.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="${escapeXml(colors.canvas)}"/>`);
  ctx.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="url(#grid-${escapeXml(spec.id)}-${brand.theme})" opacity="0.55"/>`);
  ctx.push(
    `<rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="20" fill="none" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`
  );

  const padX = 56;
  const eyebrow = spec.eyebrow || `${brand.displayName} · ${spec.archetype.replace(/-/g, " ")}`;
  const badgeW = ctx.addBadge({
    label: "header.eyebrow",
    text: eyebrow.toUpperCase(),
    x: padX,
    y: 42,
    height: 26,
    fontSize: 11,
    variant: "accent"
  });

  if (spec.editionTag) {
    ctx.addBadge({
      label: "header.editionTag",
      text: spec.editionTag,
      x: padX + badgeW + 10,
      y: 42,
      height: 26,
      fontSize: 11,
      variant: "signal"
    });
  }

  const brandBadgeText = `${brand.displayName} · ${brand.theme.toUpperCase()}`;
  const brandBadgeW = Math.ceil(
    estimateTextWidth(brandBadgeText, 11, { mono: true, bold: true, letterSpacing: 0.4 }) + 26
  );
  ctx.addBadge({
    label: "header.brandBadge",
    text: brandBadgeText,
    x: width - padX - brandBadgeW,
    y: 42,
    height: 26,
    fontSize: 11,
    variant: "neutral"
  });

  ctx.addText({
    label: "header.title",
    text: spec.title,
    x: padX,
    y: 104,
    fontSize: 30,
    fontWeight: 700,
    fontFamily: brand.fonts.display,
    fill: colors.textPrimary,
    bgHex: colors.canvas,
    maxWidthPx: width - padX * 2
  });

  if (spec.subtitle) {
    ctx.addWrappedText({
      label: "header.subtitle",
      text: spec.subtitle,
      x: padX,
      y: 132,
      maxWidthPx: width - padX * 2 - 40,
      maxLines: 2,
      lineHeight: 22,
      fontSize: 15,
      fontWeight: 400,
      fill: colors.textSecondary,
      bgHex: colors.canvas
    });
  }

  ctx.push(`<line x1="${padX}" y1="168" x2="${width - padX}" y2="168" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`);

  const footerY = height - 38;
  ctx.push(`<line x1="${padX}" y1="${footerY - 22}" x2="${width - padX}" y2="${footerY - 22}" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`);
  const sourceLine = spec.sourceNote || `Source-backed deterministic SVG · ${brand.displayName} (${spec.id})`;
  ctx.addText({
    label: "footer.source",
    text: sourceLine,
    x: padX,
    y: footerY,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: brand.fonts.mono,
    mono: true,
    fill: colors.textMuted,
    bgHex: colors.canvas,
    maxWidthPx: width - padX * 2 - 284
  });
  ctx.addText({
    label: "footer.contract",
    text: "WCAG AA >= 4.5:1 · ZERO RASTER TEXT",
    x: width - padX,
    y: footerY,
    fontSize: 11.5,
    fontWeight: 600,
    fontFamily: brand.fonts.mono,
    mono: true,
    fill: colors.accent,
    bgHex: colors.canvas,
    maxWidthPx: 272,
    anchor: "end"
  });
}

function renderStackTiers(spec, brand) {
  const tiers = spec.tiers || [];
  if (tiers.length < 2 || tiers.length > 6) {
    throw new Error(`stack-tiers requires 2..6 tiers, got ${tiers.length}`);
  }
  const width = spec.width || 1440;
  const cardH = 122;
  const gapY = 38;
  const startY = 194;
  const height = spec.height || Math.max(760, startY + tiers.length * cardH + (tiers.length - 1) * gapY + 92);
  const ctx = createRenderContext(spec, brand, { width, height });
  renderCanvasChrome(ctx, spec, brand);
  const { colors } = ctx;
  const padX = 88;
  const cardW = width - padX * 2;

  tiers.forEach((tier, index) => {
    const y = startY + index * (cardH + gapY);
    ctx.push(
      `<rect x="${padX}" y="${y}" width="${cardW}" height="${cardH}" rx="16" fill="${escapeXml(colors.surface)}" stroke="${escapeXml(index === 0 ? colors.borderStrong : colors.border)}" stroke-width="1.25"/>`
    );
    ctx.push(
      `<rect x="${padX}" y="${y}" width="6" height="${cardH}" rx="3" fill="${escapeXml(index % 2 === 0 ? colors.accent : colors.accentSecondary)}"/>`
    );

    const iconBoxX = padX + 26;
    const iconBoxY = y + 24;
    ctx.push(
      `<rect x="${iconBoxX}" y="${iconBoxY}" width="48" height="48" rx="12" fill="${escapeXml(colors.elevated)}" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`
    );
    ctx.push(renderIcon(tier.icon || "layers", iconBoxX + 12, iconBoxY + 12, 24, colors.accent));

    ctx.addText({
      label: `tier[${index}].step`,
      text: tier.step || `TIER 0${index + 1}`,
      x: iconBoxX + 24,
      y: iconBoxY + 68,
      fontSize: 10.5,
      fontWeight: 700,
      fontFamily: brand.fonts.mono,
      mono: true,
      fill: colors.textMuted,
      bgHex: colors.surface,
      maxWidthPx: 72,
      anchor: "middle"
    });

    const textX = iconBoxX + 70;
    const rightMetaReserve = tier.role ? 230 : 40;
    const mainMaxW = cardW - (textX - padX) - rightMetaReserve;

    ctx.addText({
      label: `tier[${index}].title`,
      text: tier.title,
      x: textX,
      y: y + 38,
      fontSize: 20,
      fontWeight: 700,
      fontFamily: brand.fonts.display,
      fill: colors.textPrimary,
      bgHex: colors.surface,
      maxWidthPx: mainMaxW
    });

    if (tier.summary) {
      ctx.addText({
        label: `tier[${index}].summary`,
        text: tier.summary,
        x: textX,
        y: y + 64,
        fontSize: 14,
        fontWeight: 400,
        fill: colors.textSecondary,
        bgHex: colors.surface,
        maxWidthPx: mainMaxW
      });
    }

    let badgeX = textX;
    for (const [bIdx, badge] of (tier.badges || []).entries()) {
      const w = ctx.addBadge({
        label: `tier[${index}].badge[${bIdx}]`,
        text: badge,
        x: badgeX,
        y: y + 80,
        height: 24,
        padX: 10,
        fontSize: 11,
        variant: bIdx === 0 ? "accent" : "neutral"
      });
      badgeX += w + 8;
    }

    if (tier.role) {
      const roleW = estimateTextWidth(tier.role, 11.5, { mono: true, bold: true, letterSpacing: 0.4 }) + 26;
      ctx.addBadge({
        label: `tier[${index}].role`,
        text: tier.role,
        x: padX + cardW - roleW - 24,
        y: y + 22,
        height: 26,
        fontSize: 11.5,
        variant: tier.gate ? "signal" : "neutral"
      });
    }

    if (index < tiers.length - 1) {
      const midX = width / 2;
      const lineY1 = y + cardH + 2;
      const lineY2 = y + cardH + gapY - 4;
      ctx.push(
        `<line x1="${n(midX)}" y1="${n(lineY1)}" x2="${n(midX)}" y2="${n(lineY2)}" stroke="${escapeXml(colors.connector)}" stroke-width="1.8" marker-end="url(#arrow-${escapeXml(spec.id)}-${brand.theme})"/>`
      );
      if (tier.connectorLabel) {
        const labelW = estimateTextWidth(tier.connectorLabel, 11, { mono: true, bold: true, letterSpacing: 0.3 }) + 24;
        const pillX = midX + 18;
        const pillY = y + cardH + (gapY - 22) / 2;
        ctx.push(
          `<rect x="${n(pillX)}" y="${n(pillY)}" width="${n(labelW)}" height="22" rx="11" fill="${escapeXml(colors.elevated)}" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`
        );
        ctx.addText({
          label: `tier[${index}].connector`,
          text: tier.connectorLabel,
          x: pillX + labelW / 2,
          y: pillY + 15,
          fontSize: 11,
          fontWeight: 600,
          fontFamily: brand.fonts.mono,
          mono: true,
          fill: colors.textSecondary,
          bgHex: colors.elevated,
          maxWidthPx: labelW - 12,
          anchor: "middle"
        });
      }
    }
  });

  return ctx;
}

function renderCurriculumRoadmap(spec, brand) {
  const stages = spec.stages || [];
  if (stages.length < 2 || stages.length > 5) {
    throw new Error(`curriculum-roadmap requires 2..5 stages, got ${stages.length}`);
  }
  const width = spec.width || 1520;
  const height = spec.height || 860;
  const ctx = createRenderContext(spec, brand, { width, height });
  renderCanvasChrome(ctx, spec, brand);
  const { colors } = ctx;

  const padX = 56;
  const gapX = 24;
  const totalGap = gapX * (stages.length - 1);
  const colW = (width - padX * 2 - totalGap) / stages.length;
  const railY = 204;

  ctx.push(
    `<line x1="${padX + 24}" y1="${railY}" x2="${width - padX - 24}" y2="${railY}" stroke="${escapeXml(colors.borderStrong)}" stroke-width="2" stroke-dasharray="6 5"/>`
  );

  stages.forEach((stage, idx) => {
    const x = padX + idx * (colW + gapX);
    const stepOffset = (stages.length - 1 - idx) * 10;
    const cardY = 236 + stepOffset;
    const cardH = height - cardY - 82;

    ctx.push(
      `<circle cx="${n(x + 28)}" cy="${railY}" r="9" fill="${escapeXml(colors.surface)}" stroke="${escapeXml(colors.accent)}" stroke-width="2.5"/>`
    );
    ctx.push(`<circle cx="${n(x + 28)}" cy="${railY}" r="3.5" fill="${escapeXml(colors.accent)}"/>`);
    if (idx < stages.length - 1) {
      const arrowX1 = x + colW - 6;
      const arrowX2 = x + colW + gapX - 4;
      ctx.push(
        `<line x1="${n(arrowX1)}" y1="${railY}" x2="${n(arrowX2)}" y2="${railY}" stroke="${escapeXml(colors.connector)}" stroke-width="1.8" marker-end="url(#arrow-${escapeXml(spec.id)}-${brand.theme})"/>`
      );
    }

    ctx.push(
      `<rect x="${n(x)}" y="${n(cardY)}" width="${n(colW)}" height="${n(cardH)}" rx="16" fill="${escapeXml(colors.surface)}" stroke="${escapeXml(colors.border)}" stroke-width="1.25"/>`
    );
    ctx.push(
      `<rect x="${n(x)}" y="${n(cardY)}" width="${n(colW)}" height="5" rx="2.5" fill="${escapeXml(idx === stages.length - 1 ? colors.signal : colors.accent)}"/>`
    );

    const innerX = x + 22;
    const innerW = colW - 44;

    ctx.addBadge({
      label: `stage[${idx}].phase`,
      text: stage.phase || `STAGE 0${idx + 1}`,
      x: innerX,
      y: cardY + 22,
      height: 24,
      fontSize: 11,
      variant: idx === stages.length - 1 ? "signal" : "accent"
    });

    ctx.push(renderIcon(stage.icon || "compass", x + colW - 44, cardY + 22, 22, colors.accent));

    const titleLines = ctx.addWrappedText({
      label: `stage[${idx}].title`,
      text: stage.title,
      x: innerX,
      y: cardY + 74,
      maxWidthPx: innerW,
      maxLines: 2,
      lineHeight: 25,
      fontSize: 19,
      fontWeight: 700,
      fontFamily: brand.fonts.display,
      fill: colors.textPrimary,
      bgHex: colors.surface
    });

    const summaryY = cardY + 74 + titleLines * 25 + 8;
    ctx.addWrappedText({
      label: `stage[${idx}].summary`,
      text: stage.summary || "",
      x: innerX,
      y: summaryY,
      maxWidthPx: innerW,
      maxLines: 4,
      lineHeight: 20,
      fontSize: 13.5,
      fontWeight: 400,
      fill: colors.textSecondary,
      bgHex: colors.surface
    });

    const skillsStartY = cardY + 216;
    ctx.addText({
      label: `stage[${idx}].skillsHeader`,
      text: "SKILLS & GATES",
      x: innerX,
      y: skillsStartY,
      fontSize: 10.5,
      fontWeight: 700,
      fontFamily: brand.fonts.mono,
      mono: true,
      letterSpacing: 0.6,
      fill: colors.textMuted,
      bgHex: colors.surface,
      maxWidthPx: innerW
    });

    (stage.skills || []).slice(0, 4).forEach((skill, sIdx) => {
      const pillY = skillsStartY + 14 + sIdx * 32;
      ctx.push(
        `<rect x="${n(innerX)}" y="${n(pillY)}" width="${n(innerW)}" height="26" rx="7" fill="${escapeXml(colors.elevated)}" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`
      );
      ctx.addText({
        label: `stage[${idx}].skill[${sIdx}]`,
        text: skill,
        x: innerX + 10,
        y: pillY + 17,
        fontSize: 12,
        fontWeight: 500,
        fill: colors.textPrimary,
        bgHex: colors.elevated,
        maxWidthPx: innerW - 20
      });
    });

    if (stage.outcome) {
      const outH = 68;
      const outY = cardY + cardH - outH - 18;
      ctx.push(
        `<rect x="${n(innerX)}" y="${n(outY)}" width="${n(innerW)}" height="${outH}" rx="10" fill="${escapeXml(colors.badgeBg)}" stroke="${escapeXml(colors.badgeBorder)}" stroke-width="1"/>`
      );
      ctx.addText({
        label: `stage[${idx}].outcomeLabel`,
        text: "ARTIFACT OUTCOME",
        x: innerX + 12,
        y: outY + 20,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: brand.fonts.mono,
        mono: true,
        letterSpacing: 0.5,
        fill: colors.badgeText,
        bgHex: colors.badgeBg,
        maxWidthPx: innerW - 24
      });
      ctx.addWrappedText({
        label: `stage[${idx}].outcome`,
        text: stage.outcome,
        x: innerX + 12,
        y: outY + 39,
        maxWidthPx: innerW - 24,
        maxLines: 2,
        lineHeight: 16,
        fontSize: 12,
        fontWeight: 600,
        fill: colors.badgeText,
        bgHex: colors.badgeBg
      });
    }
  });

  return ctx;
}

function renderComparisonMatrix(spec, brand) {
  const columns = spec.columns || [];
  const rows = spec.rows || [];
  if (columns.length < 2 || rows.length < 2) {
    throw new Error("comparison-matrix requires >=2 columns and >=2 rows");
  }
  const width = spec.width || 1480;
  const headerH = 68;
  const rowH = 82;
  const tableTop = 196;
  const height = spec.height || Math.max(720, tableTop + headerH + rows.length * rowH + 92);
  const ctx = createRenderContext(spec, brand, { width, height });
  renderCanvasChrome(ctx, spec, brand);
  const { colors } = ctx;

  const padX = 56;
  const tableW = width - padX * 2;
  const dimColW = Math.round(tableW * 0.24);
  const optColW = (tableW - dimColW) / columns.length;
  const tableH = headerH + rows.length * rowH;

  ctx.push(
    `<rect x="${padX}" y="${tableTop}" width="${tableW}" height="${tableH}" rx="16" fill="${escapeXml(colors.surface)}" stroke="${escapeXml(colors.border)}" stroke-width="1.25"/>`
  );
  ctx.push(
    `<rect x="${padX}" y="${tableTop}" width="${tableW}" height="${headerH}" rx="16" fill="${escapeXml(colors.elevated)}" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`
  );

  ctx.addText({
    label: "matrix.dimensionHeader",
    text: spec.dimensionHeader || "CAPABILITY DIMENSION",
    x: padX + 22,
    y: tableTop + 40,
    fontSize: 12,
    fontWeight: 700,
    fontFamily: brand.fonts.mono,
    mono: true,
    letterSpacing: 0.5,
    fill: colors.textMuted,
    bgHex: colors.elevated,
    maxWidthPx: dimColW - 36
  });

  columns.forEach((col, cIdx) => {
    const colX = padX + dimColW + cIdx * optColW;
    ctx.push(
      `<line x1="${n(colX)}" y1="${tableTop}" x2="${n(colX)}" y2="${tableTop + tableH}" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`
    );
    ctx.addText({
      label: `matrix.col[${cIdx}].title`,
      text: col.title,
      x: colX + 20,
      y: tableTop + 31,
      fontSize: 16,
      fontWeight: 700,
      fontFamily: brand.fonts.display,
      fill: colors.textPrimary,
      bgHex: colors.elevated,
      maxWidthPx: optColW - 40
    });
    if (col.subtitle) {
      ctx.addText({
        label: `matrix.col[${cIdx}].subtitle`,
        text: col.subtitle,
        x: colX + 20,
        y: tableTop + 51,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: brand.fonts.mono,
        mono: true,
        fill: colors.accent,
        bgHex: colors.elevated,
        maxWidthPx: optColW - 40
      });
    }
  });

  rows.forEach((row, rIdx) => {
    const rowY = tableTop + headerH + rIdx * rowH;
    const rowBg = rIdx % 2 === 1 ? colors.elevated : colors.surface;
    if (rIdx % 2 === 1) {
      ctx.push(
        `<rect x="${padX + 1}" y="${rowY}" width="${tableW - 2}" height="${rowH}" fill="${escapeXml(colors.elevated)}"/>`
      );
    }
    ctx.push(
      `<line x1="${padX}" y1="${rowY}" x2="${padX + tableW}" y2="${rowY}" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`
    );

    ctx.addText({
      label: `matrix.row[${rIdx}].dimension`,
      text: row.dimension,
      x: padX + 22,
      y: rowY + 34,
      fontSize: 15,
      fontWeight: 600,
      fill: colors.textPrimary,
      bgHex: rowBg,
      maxWidthPx: dimColW - 36
    });
    if (row.note) {
      ctx.addText({
        label: `matrix.row[${rIdx}].note`,
        text: row.note,
        x: padX + 22,
        y: rowY + 56,
        fontSize: 12,
        fontWeight: 400,
        fill: colors.textMuted,
        bgHex: rowBg,
        maxWidthPx: dimColW - 36
      });
    }

    (row.cells || []).slice(0, columns.length).forEach((cell, cIdx) => {
      const colX = padX + dimColW + cIdx * optColW;
      const fit = (cell.fit || "STANDARD").toUpperCase();
      const variant = fit === "OPTIMAL" || fit === "VERIFIED" ? "accent" : fit === "GATE" ? "signal" : "neutral";
      ctx.addBadge({
        label: `matrix.cell[${rIdx},${cIdx}].fit`,
        text: fit,
        x: colX + 20,
        y: rowY + 14,
        height: 22,
        padX: 9,
        fontSize: 10.5,
        variant
      });
      ctx.addText({
        label: `matrix.cell[${rIdx},${cIdx}].text`,
        text: cell.summary || "",
        x: colX + 20,
        y: rowY + 58,
        fontSize: 13.5,
        fontWeight: 500,
        fill: colors.textSecondary,
        bgHex: rowBg,
        maxWidthPx: optColW - 40
      });
    });
  });

  return ctx;
}

function renderLayeredArchitecture(spec, brand) {
  const planes = spec.planes || [];
  if (planes.length < 2 || planes.length > 5) {
    throw new Error(`layered-architecture requires 2..5 planes, got ${planes.length}`);
  }
  const width = spec.width || 1520;
  const planeH = 148;
  const planeGap = 22;
  const startY = 194;
  const height = spec.height || Math.max(820, startY + planes.length * planeH + (planes.length - 1) * planeGap + 88);
  const ctx = createRenderContext(spec, brand, { width, height });
  renderCanvasChrome(ctx, spec, brand);
  const { colors } = ctx;

  const padX = 56;
  const railW = 348;
  const railGap = 22;
  const cardsAreaX = padX + railW + railGap;
  const cardsAreaW = width - padX - cardsAreaX;

  planes.forEach((plane, pIdx) => {
    const y = startY + pIdx * (planeH + planeGap);
    ctx.push(
      `<rect x="${padX}" y="${y}" width="${railW}" height="${planeH}" rx="14" fill="${escapeXml(colors.elevated)}" stroke="${escapeXml(colors.borderStrong)}" stroke-width="1.2"/>`
    );
    ctx.push(
      `<rect x="${padX}" y="${y}" width="5" height="${planeH}" rx="2.5" fill="${escapeXml(plane.humanGate ? colors.signal : colors.accent)}"/>`
    );

    ctx.addBadge({
      label: `plane[${pIdx}].tag`,
      text: plane.tag || `PLANE 0${pIdx + 1}`,
      x: padX + 20,
      y: y + 18,
      height: 23,
      fontSize: 10.5,
      variant: plane.humanGate ? "signal" : "accent"
    });

    ctx.addText({
      label: `plane[${pIdx}].title`,
      text: plane.title,
      x: padX + 20,
      y: y + 66,
      fontSize: 18.5,
      fontWeight: 700,
      fontFamily: brand.fonts.display,
      fill: colors.textPrimary,
      bgHex: colors.elevated,
      maxWidthPx: railW - 36
    });

    ctx.addWrappedText({
      label: `plane[${pIdx}].summary`,
      text: plane.summary || "",
      x: padX + 20,
      y: y + 90,
      maxWidthPx: railW - 36,
      maxLines: 2,
      lineHeight: 19,
      fontSize: 13,
      fill: colors.textSecondary,
      bgHex: colors.elevated
    });

    const nodes = plane.nodes || [];
    const cardGap = 16;
    const cardW = nodes.length ? (cardsAreaW - cardGap * (nodes.length - 1)) / nodes.length : cardsAreaW;

    nodes.forEach((node, nIdx) => {
      const cardX = cardsAreaX + nIdx * (cardW + cardGap);
      ctx.push(
        `<rect x="${n(cardX)}" y="${y}" width="${n(cardW)}" height="${planeH}" rx="14" fill="${escapeXml(colors.surface)}" stroke="${escapeXml(colors.border)}" stroke-width="1.15"/>`
      );
      ctx.push(renderIcon(node.icon || "cpu", cardX + 18, y + 18, 22, colors.accent));

      if (node.badge) {
        const bw = estimateTextWidth(node.badge, 10.5, { mono: true, bold: true, letterSpacing: 0.4 }) + 22;
        ctx.addBadge({
          label: `plane[${pIdx}].node[${nIdx}].badge`,
          text: node.badge,
          x: cardX + cardW - bw - 16,
          y: y + 16,
          height: 22,
          padX: 9,
          fontSize: 10.5,
          variant: "neutral"
        });
      }

      ctx.addText({
        label: `plane[${pIdx}].node[${nIdx}].title`,
        text: node.title,
        x: cardX + 18,
        y: y + 66,
        fontSize: 16,
        fontWeight: 700,
        fontFamily: brand.fonts.display,
        fill: colors.textPrimary,
        bgHex: colors.surface,
        maxWidthPx: cardW - 36
      });

      ctx.addWrappedText({
        label: `plane[${pIdx}].node[${nIdx}].detail`,
        text: node.detail || "",
        x: cardX + 18,
        y: y + 90,
        maxWidthPx: cardW - 36,
        maxLines: 2,
        lineHeight: 19,
        fontSize: 13,
        fill: colors.textSecondary,
        bgHex: colors.surface
      });
    });

    if (pIdx < planes.length - 1) {
      const connX = padX + railW / 2;
      ctx.push(
        `<line x1="${n(connX)}" y1="${y + planeH + 2}" x2="${n(connX)}" y2="${y + planeH + planeGap - 3}" stroke="${escapeXml(colors.connector)}" stroke-width="1.6" marker-end="url(#arrow-${escapeXml(spec.id)}-${brand.theme})"/>`
      );
    }
  });

  return ctx;
}

function renderHubSpoke(spec, brand) {
  const spokes = spec.spokes || [];
  if (spokes.length < 3 || spokes.length > 8) {
    throw new Error(`hub-spoke requires 3..8 spokes, got ${spokes.length}`);
  }
  const width = spec.width || 1480;
  const height = spec.height || 860;
  const ctx = createRenderContext(spec, brand, { width, height });
  renderCanvasChrome(ctx, spec, brand);
  const { colors } = ctx;

  const centerX = width / 2;
  const centerY = 486;
  const hubW = 340;
  const hubH = 196;
  const hubX = centerX - hubW / 2;
  const hubY = centerY - hubH / 2;

  ctx.push(
    `<circle cx="${n(centerX)}" cy="${n(centerY)}" r="184" fill="none" stroke="${escapeXml(colors.border)}" stroke-width="1" stroke-dasharray="5 5"/>`
  );
  ctx.push(
    `<circle cx="${n(centerX)}" cy="${n(centerY)}" r="248" fill="none" stroke="${escapeXml(colors.gridLine)}" stroke-width="1"/>`
  );

  const leftSpokes = spokes.filter((_, i) => i % 2 === 0);
  const rightSpokes = spokes.filter((_, i) => i % 2 === 1);
  const nodeW = 360;
  const nodeH = 112;
  const leftX = 76;
  const rightX = width - 76 - nodeW;

  function drawColumn(items, colX, isLeft) {
    const totalH = items.length * nodeH + (items.length - 1) * 30;
    const topY = centerY - totalH / 2;
    items.forEach((spoke, idx) => {
      const ny = topY + idx * (nodeH + 30);
      const anchorX = isLeft ? colX + nodeW : colX;
      const anchorY = ny + nodeH / 2;
      const hubPortX = isLeft ? hubX : hubX + hubW;
      const hubPortY = centerY + (idx - (items.length - 1) / 2) * 34;
      const midX = (anchorX + hubPortX) / 2;

      ctx.push(
        `<path d="M ${n(hubPortX)} ${n(hubPortY)} C ${n(midX)} ${n(hubPortY)}, ${n(midX)} ${n(anchorY)}, ${n(anchorX)} ${n(anchorY)}" fill="none" stroke="${escapeXml(colors.connector)}" stroke-width="1.75"/>`
      );
      ctx.push(`<circle cx="${n(anchorX)}" cy="${n(anchorY)}" r="4" fill="${escapeXml(colors.accent)}"/>`);

      ctx.push(
        `<rect x="${n(colX)}" y="${n(ny)}" width="${nodeW}" height="${nodeH}" rx="14" fill="${escapeXml(colors.surface)}" stroke="${escapeXml(colors.border)}" stroke-width="1.2"/>`
      );
      ctx.push(renderIcon(spoke.icon || "spark", colX + 18, ny + 18, 22, colors.accent));

      ctx.addBadge({
        label: `spoke[${isLeft ? "L" : "R"}${idx}].role`,
        text: spoke.role || "SPECIALIST",
        x: colX + 50,
        y: ny + 16,
        height: 22,
        padX: 9,
        fontSize: 10.5,
        variant: "neutral"
      });

      ctx.addText({
        label: `spoke[${isLeft ? "L" : "R"}${idx}].title`,
        text: spoke.title,
        x: colX + 18,
        y: ny + 62,
        fontSize: 16.5,
        fontWeight: 700,
        fontFamily: brand.fonts.display,
        fill: colors.textPrimary,
        bgHex: colors.surface,
        maxWidthPx: nodeW - 36
      });

      ctx.addText({
        label: `spoke[${isLeft ? "L" : "R"}${idx}].detail`,
        text: spoke.detail || "",
        x: colX + 18,
        y: ny + 88,
        fontSize: 13,
        fontWeight: 400,
        fill: colors.textSecondary,
        bgHex: colors.surface,
        maxWidthPx: nodeW - 36
      });
    });
  }

  drawColumn(leftSpokes, leftX, true);
  drawColumn(rightSpokes, rightX, false);

  ctx.push(
    `<rect x="${n(hubX)}" y="${n(hubY)}" width="${hubW}" height="${hubH}" rx="20" fill="${escapeXml(colors.elevated)}" stroke="${escapeXml(colors.accent)}" stroke-width="1.8"/>`
  );
  const hubObj = spec.hub || { title: spec.title, subtitle: "Central Orchestrator", badge: "CORE HUB" };
  ctx.push(renderIcon(hubObj.icon || "queen-star", centerX - 14, hubY + 22, 28, colors.accent));

  const hubBadgeW = estimateTextWidth(hubObj.badge || "ORCHESTRATOR", 11, { mono: true, bold: true, letterSpacing: 0.4 }) + 24;
  ctx.addBadge({
    label: "hub.badge",
    text: hubObj.badge || "ORCHESTRATOR",
    x: centerX - hubBadgeW / 2,
    y: hubY + 60,
    height: 24,
    fontSize: 11,
    variant: "accent"
  });

  ctx.addText({
    label: "hub.title",
    text: hubObj.title,
    x: centerX,
    y: hubY + 116,
    fontSize: 21,
    fontWeight: 700,
    fontFamily: brand.fonts.display,
    fill: colors.textPrimary,
    bgHex: colors.elevated,
    maxWidthPx: hubW - 40,
    anchor: "middle"
  });

  ctx.addWrappedText({
    label: "hub.subtitle",
    text: hubObj.subtitle || "",
    x: centerX,
    y: hubY + 144,
    maxWidthPx: hubW - 44,
    maxLines: 2,
    lineHeight: 19,
    fontSize: 13.5,
    fill: colors.textSecondary,
    bgHex: colors.elevated,
    anchor: "middle"
  });

  return ctx;
}

function renderHudBlueprint(spec, brand) {
  const width = spec.width || 1600;
  const height = spec.height || 920;
  const ctx = createRenderContext(spec, brand, { width, height });
  renderCanvasChrome(ctx, spec, brand);
  const { colors } = ctx;

  const padX = 56;
  const bodyTop = 192;
  const bodyH = height - bodyTop - 76;

  // Left: Living-World Character/Studio Scene Reserve Window
  const sceneW = 560;
  const sceneX = padX;
  ctx.push(
    `<rect x="${sceneX}" y="${bodyTop}" width="${sceneW}" height="${bodyH}" rx="18" fill="${escapeXml(colors.surface)}" stroke="${escapeXml(colors.borderStrong)}" stroke-width="1.4" stroke-dasharray="8 4"/>`
  );
  // Reticle L-brackets
  const rLen = 18;
  const corners = [
    `M ${sceneX + 14} ${bodyTop + 14 + rLen} V ${bodyTop + 14} H ${sceneX + 14 + rLen}`,
    `M ${sceneX + sceneW - 14 - rLen} ${bodyTop + 14} H ${sceneX + sceneW - 14} V ${bodyTop + 14 + rLen}`,
    `M ${sceneX + 14} ${bodyTop + bodyH - 14 - rLen} V ${bodyTop + bodyH - 14} H ${sceneX + 14 + rLen}`,
    `M ${sceneX + sceneW - 14 - rLen} ${bodyTop + bodyH - 14} H ${sceneX + sceneW - 14} V ${bodyTop + bodyH - 14 - rLen}`
  ];
  for (const d of corners) {
    ctx.push(`<path d="${d}" fill="none" stroke="${escapeXml(colors.accent)}" stroke-width="2"/>`);
  }

  const scene = spec.sceneSlot || {};
  ctx.addBadge({
    label: "hud.sceneBadge",
    text: scene.badge || "LIVING-WORLD BACKPLATE SLOT",
    x: sceneX + 30,
    y: bodyTop + 30,
    height: 25,
    fontSize: 11,
    variant: "accent"
  });

  ctx.addText({
    label: "hud.sceneTitle",
    text: scene.title || "Shared-Craft Character Action Frame",
    x: sceneX + 30,
    y: bodyTop + 88,
    fontSize: 20,
    fontWeight: 700,
    fontFamily: brand.fonts.display,
    fill: colors.textPrimary,
    bgHex: colors.surface,
    maxWidthPx: sceneW - 60
  });

  ctx.addWrappedText({
    label: "hud.sceneAction",
    text:
      scene.action ||
      "Relational action anchor: approved identities collaborate on one tangible studio artifact. Raster backplate carries zero small UI text.",
    x: sceneX + 30,
    y: bodyTop + 118,
    maxWidthPx: sceneW - 60,
    maxLines: 3,
    lineHeight: 21,
    fontSize: 14,
    fill: colors.textSecondary,
    bgHex: colors.surface
  });

  const materials = scene.materials || [
    "matte ceramic",
    "aged copper",
    "woven cloud hoodie",
    "porcelain whale",
    "indigo lunar moth",
    "translucent sapphire glass"
  ];
  ctx.addText({
    label: "hud.materialsHeader",
    text: "MATERIAL IDENTITY ANCHORS",
    x: sceneX + 30,
    y: bodyTop + 210,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: brand.fonts.mono,
    mono: true,
    letterSpacing: 0.6,
    fill: colors.textMuted,
    bgHex: colors.surface,
    maxWidthPx: sceneW - 60
  });

  materials.slice(0, 6).forEach((mat, mIdx) => {
    const col = mIdx % 2;
    const row = Math.floor(mIdx / 2);
    const mx = sceneX + 30 + col * 252;
    const my = bodyTop + 228 + row * 38;
    ctx.push(
      `<rect x="${mx}" y="${my}" width="238" height="28" rx="8" fill="${escapeXml(colors.elevated)}" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`
    );
    ctx.addText({
      label: `hud.material[${mIdx}]`,
      text: mat,
      x: mx + 12,
      y: my + 18.5,
      fontSize: 12,
      fontWeight: 500,
      fontFamily: brand.fonts.mono,
      mono: true,
      fill: colors.textPrimary,
      bgHex: colors.elevated,
      maxWidthPx: 214
    });
  });

  const provY = bodyTop + bodyH - 134;
  ctx.push(
    `<rect x="${sceneX + 30}" y="${provY}" width="${sceneW - 60}" height="104" rx="12" fill="${escapeXml(colors.elevated)}" stroke="${escapeXml(colors.border)}" stroke-width="1"/>`
  );
  ctx.addText({
    label: "hud.provHeader",
    text: "PROVENANCE SIDECAR LOCK (.vis.provenance.json)",
    x: sceneX + 46,
    y: provY + 26,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: brand.fonts.mono,
    mono: true,
    fill: colors.accent,
    bgHex: colors.elevated,
    maxWidthPx: sceneW - 92
  });
  ctx.addText({
    label: "hud.provFields1",
    text: `identity_id: ${scene.identityId || "verified-retrieve"} · edition: ${scene.edition || "editorial"}`,
    x: sceneX + 46,
    y: provY + 52,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: brand.fonts.mono,
    mono: true,
    fill: colors.textSecondary,
    bgHex: colors.elevated,
    maxWidthPx: sceneW - 92
  });
  ctx.addText({
    label: "hud.provFields2",
    text: `prompt_fidelity: ${scene.promptFidelity || "EXACT"} · rights_state: ${scene.rightsState || "human-gated"}`,
    x: sceneX + 46,
    y: provY + 76,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: brand.fonts.mono,
    mono: true,
    fill: colors.textSecondary,
    bgHex: colors.elevated,
    maxWidthPx: sceneW - 92
  });

  // Right: Translucent Sapphire/Violet Glassmorphic HUD Blueprint Panel
  const hudX = sceneX + sceneW + 28;
  const hudW = width - padX - hudX;
  ctx.push(
    `<rect x="${hudX}" y="${bodyTop}" width="${hudW}" height="${bodyH}" rx="18" fill="${escapeXml(colors.hudTint)}" fill-opacity="${colors.hudTintOpacity}" stroke="${escapeXml(colors.accentSecondary)}" stroke-width="1.4"/>`
  );

  ctx.addBadge({
    label: "hud.panelBadge",
    text: "DETERMINISTIC SVG HUD OVERLAY",
    x: hudX + 28,
    y: bodyTop + 26,
    height: 25,
    fontSize: 11,
    variant: "accent"
  });
  const gateLabel = spec.humanGateLabel || "HUMAN RELEASE GATE";
  const gateBadgeW = Math.ceil(
    estimateTextWidth(gateLabel, 11, { mono: true, bold: true, letterSpacing: 0.4 }) + 26
  );
  ctx.addBadge({
    label: "hud.gateBadge",
    text: gateLabel,
    x: hudX + hudW - 28 - gateBadgeW,
    y: bodyTop + 26,
    height: 25,
    fontSize: 11,
    variant: "signal"
  });

  const modules = spec.modules || [];
  const modStartY = bodyTop + 72;
  const modGap = 16;
  const modH = modules.length
    ? Math.floor((bodyH - 96 - modGap * Math.max(0, modules.length - 1)) / modules.length)
    : 130;

  modules.forEach((mod, idx) => {
    const my = modStartY + idx * (modH + modGap);
    ctx.push(
      `<rect x="${hudX + 28}" y="${my}" width="${hudW - 56}" height="${modH}" rx="12" fill="${escapeXml(colors.hudTint)}" fill-opacity="${colors.hudTintOpacity}" stroke="${escapeXml(colors.borderStrong)}" stroke-width="1"/>`
    );
    ctx.push(renderIcon(mod.icon || "shield", hudX + 46, my + 20, 22, colors.accent));

    ctx.addText({
      label: `hud.module[${idx}].code`,
      text: mod.code || `HUD-0${idx + 1}`,
      x: hudX + 78,
      y: my + 35,
      fontSize: 11.5,
      fontWeight: 700,
      fontFamily: brand.fonts.mono,
      mono: true,
      fill: colors.accent,
      bgHex: colors.hudTint,
      bgAlpha: colors.hudTintOpacity,
      maxWidthPx: 140
    });

    ctx.addText({
      label: `hud.module[${idx}].title`,
      text: mod.title,
      x: hudX + 46,
      y: my + 66,
      fontSize: 17.5,
      fontWeight: 700,
      fontFamily: brand.fonts.display,
      fill: colors.textPrimary,
      bgHex: colors.hudTint,
      bgAlpha: colors.hudTintOpacity,
      maxWidthPx: hudW - 96
    });

    ctx.addWrappedText({
      label: `hud.module[${idx}].detail`,
      text: mod.detail || "",
      x: hudX + 46,
      y: my + 92,
      maxWidthPx: hudW - 96,
      maxLines: 2,
      lineHeight: 19,
      fontSize: 13.5,
      fill: colors.textSecondary,
      bgHex: colors.hudTint,
      bgAlpha: colors.hudTintOpacity
    });
  });

  return ctx;
}

export function compileDiagramSvg(
  spec,
  { theme = "dark", rootDir = DEFAULT_ROOT, paletteOverrides = null, strict = true } = {}
) {
  const specErrors = lintDiagramSpec(spec, { rootDir });
  if (specErrors.length) {
    throw new Error(`Invalid diagram spec "${spec?.id || "unknown"}": ${specErrors.join("; ")}`);
  }

  const brand = loadBrandPalette(spec.brand, theme, { rootDir, paletteOverrides });
  let ctx;
  switch (spec.archetype) {
    case "stack-tiers":
      ctx = renderStackTiers(spec, brand);
      break;
    case "curriculum-roadmap":
      ctx = renderCurriculumRoadmap(spec, brand);
      break;
    case "comparison-matrix":
      ctx = renderComparisonMatrix(spec, brand);
      break;
    case "layered-architecture":
      ctx = renderLayeredArchitecture(spec, brand);
      break;
    case "hub-spoke":
      ctx = renderHubSpoke(spec, brand);
      break;
    case "hud-blueprint":
      ctx = renderHudBlueprint(spec, brand);
      break;
    default:
      throw new Error(`Unhandled archetype: ${spec.archetype}`);
  }

  const failedContrast = ctx.contrastChecks.filter((c) => !c.passed);
  const failedOverflow = ctx.overflowChecks.filter((o) => !o.passed);
  if (strict && (failedContrast.length || failedOverflow.length)) {
    const messages = [
      ...failedContrast.map(
        (c) => `contrast ${c.label} (${c.fgHex} on ${c.bgHex}) = ${c.ratio}:1 < ${WCAG_AA_MIN_CONTRAST}:1`
      ),
      ...failedOverflow.map(
        (o) => `overflow ${o.label} ("${o.text}") width ${o.estimatedWidth}px > max ${o.maxWidthPx}px`
      )
    ];
    throw new Error(`Diagram lint failed for ${spec.id} (${theme}): ${messages.join("; ")}`);
  }

  const minContrastRatio = ctx.contrastChecks.length
    ? Math.min(...ctx.contrastChecks.map((c) => c.ratio))
    : 21;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ctx.width} ${ctx.height}" width="${ctx.width}" height="${ctx.height}" role="img" aria-labelledby="title-${escapeXml(spec.id)}-${theme} desc-${escapeXml(spec.id)}-${theme}" data-brand="${escapeXml(spec.brand)}" data-archetype="${escapeXml(spec.archetype)}" data-theme="${escapeXml(theme)}">`,
    `<title id="title-${escapeXml(spec.id)}-${theme}">${escapeXml(spec.title)}</title>`,
    `<desc id="desc-${escapeXml(spec.id)}-${theme}">${escapeXml(spec.subtitle || spec.title)}</desc>`,
    ...ctx.elements,
    `</svg>`,
    ""
  ].join("\n");

  const sha256 = createHash("sha256").update(svg, "utf8").digest("hex");

  return {
    id: spec.id,
    brand: spec.brand,
    archetype: spec.archetype,
    theme,
    width: ctx.width,
    height: ctx.height,
    svg,
    bytes: Buffer.byteLength(svg, "utf8"),
    sha256,
    minContrastRatio,
    contrastChecks: ctx.contrastChecks,
    overflowChecks: ctx.overflowChecks
  };
}

function sha256Buffer(content) {
  return createHash("sha256").update(content).digest("hex");
}

function toPosixRelative(fromDir, targetPath) {
  return relative(fromDir, targetPath).replace(/\\/g, "/");
}

export function compileSpecDirectory({
  specDir = join(DEFAULT_ROOT, "brand-image-system", "specs", "diagrams"),
  outDir = join(DEFAULT_ROOT, "brand-image-system", "examples", "diagrams"),
  rootDir = DEFAULT_ROOT,
  themes = SUPPORTED_THEMES,
  checkOnly = false
} = {}) {
  const resolvedSpecDir = resolve(specDir);
  const resolvedOutDir = resolve(outDir);
  if (!existsSync(resolvedSpecDir)) {
    throw new Error(`Spec directory does not exist: ${resolvedSpecDir}`);
  }

  const specFiles = readdirSync(resolvedSpecDir)
    .filter((file) => file.endsWith(".diagram.json") || extname(file) === ".json")
    .sort((a, b) => a.localeCompare(b));

  if (!specFiles.length) {
    throw new Error(`No diagram spec JSON files found in ${resolvedSpecDir}`);
  }

  if (!checkOnly) {
    mkdirSync(resolvedOutDir, { recursive: true });
  }

  const entries = [];
  const driftErrors = [];

  for (const fileName of specFiles) {
    const specPath = join(resolvedSpecDir, fileName);
    const rawSpec = readFileSync(specPath, "utf8");
    const spec = JSON.parse(rawSpec);
    const specSha256 = sha256Buffer(Buffer.from(rawSpec, "utf8"));
    const variants = {};

    for (const theme of themes) {
      const compiled = compileDiagramSvg(spec, { theme, rootDir, strict: true });
      const outFile = `${spec.id}.${theme}.svg`;
      const outPath = join(resolvedOutDir, outFile);

      if (checkOnly) {
        if (existsSync(outPath)) {
          const existingSvg = readFileSync(outPath, "utf8");
          if (existingSvg !== compiled.svg) {
            driftErrors.push(`Compiled SVG out of date: ${outFile}`);
          }
        } else {
          driftErrors.push(`Missing compiled SVG: ${outFile}`);
        }
      } else {
        writeFileSync(outPath, compiled.svg, "utf8");
      }

      variants[theme] = {
        file: outFile,
        sha256: compiled.sha256,
        bytes: compiled.bytes,
        width: compiled.width,
        height: compiled.height,
        minContrastRatio: compiled.minContrastRatio,
        wcagAA: compiled.minContrastRatio >= WCAG_AA_MIN_CONTRAST,
        overflowCount: compiled.overflowChecks.filter((o) => !o.passed).length
      };
    }

    entries.push({
      id: spec.id,
      title: spec.title,
      brand: spec.brand,
      archetype: spec.archetype,
      specPath: toPosixRelative(rootDir, specPath),
      specSha256,
      variants
    });
  }

  const registry = {
    schemaVersion: "starlight.diagramRegistry.v1",
    compiler: "scripts/compile-brand-diagrams.mjs",
    wcagMinimumContrast: WCAG_AA_MIN_CONTRAST,
    diagrams: entries
  };
  const registryJson = `${JSON.stringify(registry, null, 2)}\n`;
  const registryPath = join(resolvedOutDir, "registry.json");

  if (checkOnly) {
    if (!existsSync(registryPath)) {
      driftErrors.push(`Missing diagram registry manifest: ${registryPath}`);
    } else {
      const existingRegistry = readFileSync(registryPath, "utf8");
      if (existingRegistry !== registryJson) {
        driftErrors.push(`Diagram registry manifest out of date: ${registryPath}`);
      }
    }
    if (driftErrors.length) {
      throw new Error(`Diagram check failed:\n- ${driftErrors.join("\n- ")}`);
    }
  } else {
    writeFileSync(registryPath, registryJson, "utf8");
  }

  return {
    specDir: resolvedSpecDir,
    outDir: resolvedOutDir,
    registryPath,
    registry,
    count: entries.length
  };
}

function parseCliArgs(argv) {
  const flags = {
    specDir: join(DEFAULT_ROOT, "brand-image-system", "specs", "diagrams"),
    outDir: join(DEFAULT_ROOT, "brand-image-system", "examples", "diagrams"),
    spec: null,
    themes: SUPPORTED_THEMES,
    check: false,
    json: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--check") {
      flags.check = true;
    } else if (arg === "--json") {
      flags.json = true;
    } else if (arg === "--spec-dir" && argv[i + 1]) {
      flags.specDir = argv[++i];
    } else if (arg === "--out-dir" && argv[i + 1]) {
      flags.outDir = argv[++i];
    } else if (arg === "--spec" && argv[i + 1]) {
      flags.spec = argv[++i];
    } else if (arg === "--theme" && argv[i + 1]) {
      const val = argv[++i];
      flags.themes = val === "both" ? SUPPORTED_THEMES : [val];
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: node scripts/compile-brand-diagrams.mjs [--spec-dir <dir>] [--out-dir <dir>] [--spec <file>] [--theme dark|light|both] [--check] [--json]"
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown CLI argument: ${arg}`);
    }
  }
  return flags;
}

export function runCli(argv = process.argv.slice(2)) {
  const flags = parseCliArgs(argv);
  if (flags.spec) {
    const specPath = resolve(flags.spec);
    const spec = JSON.parse(readFileSync(specPath, "utf8"));
    const results = flags.themes.map((theme) => {
      const out = compileDiagramSvg(spec, { theme, strict: true });
      if (!flags.check) {
        mkdirSync(resolve(flags.outDir), { recursive: true });
        writeFileSync(join(resolve(flags.outDir), `${spec.id}.${theme}.svg`), out.svg, "utf8");
      }
      return {
        id: out.id,
        theme: out.theme,
        sha256: out.sha256,
        minContrastRatio: out.minContrastRatio,
        overflowCount: 0
      };
    });
    if (flags.json) console.log(JSON.stringify({ ok: true, results }, null, 2));
    else console.log(`Compiled ${ basename(specPath) } (${results.map((r) => `${r.theme}:${r.minContrastRatio}:1`).join(", ")})`);
    return results;
  }

  const summary = compileSpecDirectory({
    specDir: flags.specDir,
    outDir: flags.outDir,
    themes: flags.themes,
    checkOnly: flags.check
  });

  if (flags.json) {
    console.log(JSON.stringify(summary.registry, null, 2));
  } else {
    const verb = flags.check ? "Verified" : "Compiled";
    console.log(
      `${verb} ${summary.count} diagram specs (${summary.count * flags.themes.length} SVGs) -> ${summary.outDir}`
    );
  }
  return summary;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runCli(process.argv.slice(2));
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

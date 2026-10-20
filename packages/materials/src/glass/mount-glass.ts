// The WebGL tier of the glass material, moved from starlight-web-studio examples/gpu-glass/
// glass.mjs (2026-10-20) and typed. Same shader, same probe, same single teardown.
//
// One full-screen three.js pass over the poster image. Outside the panel it draws the poster
// unchanged, so it can replace the CSS tier pixel for pixel; inside the panel's rounded
// rectangle it refracts at the bevel with a slight channel split, frosts the interior with a
// 13-tap blur, darkens toward ink and adds a rim light. On a mouse, a soft highlight follows
// the pointer. It draws on change only, never on a loop, and stops while off screen or
// while the document is hidden.
//
// three is loaded with a dynamic import so the poster, the gate and the hook never pull it
// into a server or phone bundle.

import type * as ThreeNS from 'three';
import {
  DESKTOP_QUERY,
  PREFERENCE_QUERIES,
  PROBE_FRAMES,
  gpuPlan,
  medianMs,
  readEnv,
  withinBudget,
  type GlassMode,
  type GlassPlan,
} from '../gate/glass-gate.ts';

export interface GlassState {
  mode: GlassMode;
  reason: string;
  // Median of the probe frames in milliseconds, present once the probe has run.
  frameMs?: number;
}

export interface GlassHandle extends GlassState {
  teardown: () => void;
}

export interface MountGlassOptions {
  // The element the pass covers; the poster image and the canvas fill it.
  scene: HTMLElement;
  canvas: HTMLCanvasElement;
  // The glass panel inside the scene; its rect and border radius drive the shader.
  panel: HTMLElement;
  // The poster image URL, also the refraction texture, so the two tiers match.
  poster: string;
  // A plan already read by useGlassPlan(); the gate is re-read before the probe either way.
  plan?: GlassPlan;
  // Abort during the two awaits (three.js load, texture load): the mount tears down and
  // never reports webgl. The caller aborts on unmount or when its inputs change.
  signal?: AbortSignal;
  onChange?: (state: GlassState) => void;
}

const vertex = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uImage;
uniform vec2 uImageSize;
uniform vec2 uRes;
uniform vec2 uBuf;
uniform vec4 uRect;
uniform float uRadius;
uniform vec2 uPointer;
uniform float uLit;
uniform vec3 uInk;

// Matches CSS object-fit: cover; object-position: center.
// A screen wider than the image (sr > ir) crops the image vertically, and vice versa.
vec2 coverUV(vec2 p) {
  vec2 uv = p / uRes;
  float sr = uRes.x / uRes.y;
  float ir = uImageSize.x / uImageSize.y;
  if (sr > ir) { float s = ir / sr; uv.y = uv.y * s + (1.0 - s) * 0.5; }
  else { float s = sr / ir; uv.x = uv.x * s + (1.0 - s) * 0.5; }
  return vec2(uv.x, 1.0 - uv.y);
}

float sdRoundRect(vec2 p, vec2 halfSize, float r) {
  vec2 q = abs(p) - halfSize + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float sd(vec2 p) {
  vec2 c = uRect.xy + uRect.zw * 0.5;
  return sdRoundRect(p - c, uRect.zw * 0.5, uRadius);
}

vec3 frosted(vec2 p) {
  vec3 acc = texture2D(uImage, coverUV(p)).rgb;
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 0.5235988;
    float rad = (i < 6) ? 7.0 : 14.0;
    acc += texture2D(uImage, coverUV(p + vec2(cos(a), sin(a)) * rad)).rgb;
  }
  return acc / 13.0;
}

void main() {
  // The drawing buffer is floored to whole device pixels, so map through its real size.
  vec2 p = vec2(gl_FragCoord.x, uBuf.y - gl_FragCoord.y) * (uRes / uBuf);
  float d = sd(p);
  vec3 base = texture2D(uImage, coverUV(p)).rgb;
  if (d > 1.5) { gl_FragColor = vec4(base, 1.0); return; }

  vec2 e = vec2(1.0, 0.0);
  vec2 n = normalize(vec2(sd(p + e.xy) - sd(p - e.xy), sd(p + e.yx) - sd(p - e.yx)) + 1e-5);
  float edge = smoothstep(-22.0, 0.0, d);
  vec2 shift = -n * edge * edge * 26.0;

  vec3 glass;
  glass.r = frosted(p + shift * 1.06).r;
  glass.g = frosted(p + shift).g;
  glass.b = frosted(p + shift * 0.94).b;
  // With the 0.3 DOM tint on top, total coverage is 1 - 0.5 * 0.7 = 0.65, darker than the CSS tier (0.62).
  glass = mix(glass, uInk, 0.5);

  float rim = pow(edge, 3.0) * max(dot(n, normalize(vec2(-0.6, -0.8))), 0.0);
  glass += vec3(rim * 0.35);
  glass += vec3(uLit * exp(-dot(p - uPointer, p - uPointer) / 39200.0) * 0.10);

  float mask = 1.0 - smoothstep(-0.75, 0.75, d);
  gl_FragColor = vec4(mix(base, glass, mask), 1.0);
}
`;

// The ink the shader darkens toward: the primary token, read from CSS so the shader and
// the DOM tint stay one colour when DESIGN.md changes.
function inkFromTokens(el: HTMLElement): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue('--sl-color-primary').trim();
  const m = /^#([0-9a-f]{6})$/i.exec(raw);
  if (!m) return [0.027, 0.039, 0.063];
  const hex = m[1] as string;
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
}

class Cancelled extends Error {}

export async function mountGlass({ scene, canvas, panel, poster, plan, signal, onChange }: MountGlassOptions): Promise<GlassHandle> {
  const state: GlassState = { mode: 'css', reason: 'server' };
  const record = (mode: GlassMode, reason: string, frameMs?: number) => {
    state.mode = mode;
    state.reason = reason;
    if (frameMs !== undefined) state.frameMs = frameMs;
    scene.dataset.glass = mode;
    scene.dataset.glassReason = reason;
    if (state.frameMs !== undefined) scene.dataset.glassMs = state.frameMs.toFixed(2);
    onChange?.({ ...state });
  };

  const decided = plan ?? gpuPlan(readEnv(window));
  if (decided.mode !== 'webgl') {
    record('css', decided.reason);
    return { ...state, teardown: () => {} };
  }

  // Everything acquired is registered here, so one teardown releases it on every path.
  const releases: Array<() => void> = [];
  let active = true;
  let queued = 0;
  const teardown = (reason?: string) => {
    if (!active) return;
    active = false;
    if (queued) cancelAnimationFrame(queued);
    // Every release runs even if one throws; a disposer that fails must not keep the
    // listeners and the context of the ones behind it alive.
    while (releases.length) {
      try { releases.pop()!(); } catch { /* released as far as it could be */ }
    }
    if (reason) record('css', reason);
  };
  // A resource acquired after teardown ran (a texture that resolved late) is released
  // on the spot instead of being parked on a stack nobody will drain again.
  const acquire = (release: () => void) => {
    if (active) releases.push(release);
    else release();
  };
  const listen = <T extends EventTarget>(target: T, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    acquire(() => target.removeEventListener(type, fn, opts));
  };
  const checkpoint = () => { if (!active) throw new Cancelled(); };

  try {
    // The caller's abort and every change that would refuse WebGL at load refuse it from
    // this point on, including during the two awaits below: a preference turned on while
    // the texture loads tears the mount down before it ever reports webgl.
    const abort = () => teardown('cancelled');
    if (signal?.aborted) { abort(); return { ...state, teardown }; }
    if (signal) listen(signal, 'abort', abort);
    for (const q of PREFERENCE_QUERIES) {
      listen(window.matchMedia(q), 'change', ((ev: MediaQueryListEvent) => { if (ev.matches) teardown('preference changed'); }) as EventListener);
    }
    listen(window.matchMedia(DESKTOP_QUERY), 'change', ((ev: MediaQueryListEvent) => { if (!ev.matches) teardown('phone layout'); }) as EventListener);
    const conn = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    if (conn?.addEventListener) listen(conn, 'change', () => { if (conn.saveData) teardown('data saver on'); });
    listen(canvas, 'webglcontextlost', (ev) => { ev.preventDefault(); teardown('WebGL context lost'); });

    let THREE: typeof ThreeNS;
    try {
      THREE = await import('three');
    } catch (err) {
      teardown(`three failed to load: ${(err as Error).message}`);
      return { ...state, teardown };
    }
    checkpoint();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
    // One release per resource, so a throwing disposer cannot skip the one beside it.
    acquire(() => renderer.forceContextLoss());
    acquire(() => renderer.dispose());
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    let texture: ThreeNS.Texture;
    try {
      texture = await new THREE.TextureLoader().loadAsync(poster);
    } catch {
      teardown('poster failed to load');
      return { ...state, teardown };
    }
    acquire(() => texture.dispose());
    checkpoint();
    texture.colorSpace = THREE.NoColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    // The gate is read again here: the plan the caller passed was true before the awaits.
    const live = gpuPlan(readEnv(window));
    if (live.mode !== 'webgl') { teardown(live.reason); return { ...state, teardown }; }

    const image = texture.image as { width: number; height: number };
    const uniforms = {
      uImage: { value: texture },
      uImageSize: { value: new THREE.Vector2(image.width, image.height) },
      uRes: { value: new THREE.Vector2() },
      uBuf: { value: new THREE.Vector2() },
      uRect: { value: new THREE.Vector4() },
      uRadius: { value: 40 },
      uPointer: { value: new THREE.Vector2(-9999, -9999) },
      uLit: { value: 0 },
      uInk: { value: new THREE.Vector3(...inkFromTokens(scene)) },
    };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment });
    acquire(() => material.dispose());
    acquire(() => geometry.dispose());
    const glScene = new THREE.Scene();
    glScene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.Camera();
    const buffer = new THREE.Vector2();

    const measure = () => {
      const s = scene.getBoundingClientRect();
      const r = panel.getBoundingClientRect();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(s.width, s.height, false);
      renderer.getDrawingBufferSize(buffer);
      uniforms.uRes.value.set(s.width, s.height);
      uniforms.uBuf.value.copy(buffer);
      uniforms.uRect.value.set(r.left - s.left, r.top - s.top, r.width, r.height);
      uniforms.uRadius.value = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 0;
    };
    // Two independent reasons not to draw; either one pauses, both clearing resumes.
    let intersecting = true;
    let hidden = document.hidden;
    const canDraw = () => active && intersecting && !hidden;
    const draw = () => { queued = 0; if (canDraw()) renderer.render(glScene, camera); };
    const request = () => { if (canDraw() && !queued) queued = requestAnimationFrame(draw); };

    // Probe: the frame budget is measured on this device, not assumed. gl.finish() times
    // render plus GPU completion; it excludes page compositing, which the CSS tier also pays.
    measure();
    const gl = renderer.getContext();
    const samples: number[] = [];
    for (let i = 0; i < PROBE_FRAMES; i++) {
      const t = performance.now();
      renderer.render(glScene, camera);
      gl.finish();
      samples.push(performance.now() - t);
    }
    const frameMs = medianMs(samples);
    if (!withinBudget(samples)) {
      state.frameMs = frameMs;
      teardown(`frame budget: ${frameMs.toFixed(2)} ms median`);
      return { ...state, teardown };
    }
    checkpoint();

    const remeasure = () => { measure(); request(); };
    const ro = new ResizeObserver(remeasure);
    ro.observe(scene);
    ro.observe(panel);
    acquire(() => ro.disconnect());
    // Off screen: stop drawing. Back on screen: one frame, then on change only again.
    const io = new IntersectionObserver(([entry]) => { intersecting = !!entry?.isIntersecting; request(); });
    io.observe(scene);
    acquire(() => io.disconnect());
    listen(window, 'scroll', remeasure, { passive: true });
    listen(document, 'visibilitychange', () => { hidden = document.hidden; request(); });

    const dark = () => { uniforms.uLit.value = 0; request(); };
    listen(panel, 'pointermove', ((e: PointerEvent) => {
      if (e.pointerType !== 'mouse') { dark(); return; }
      const s = scene.getBoundingClientRect();
      uniforms.uPointer.value.set(e.clientX - s.left, e.clientY - s.top);
      uniforms.uLit.value = 1;
      request();
    }) as EventListener);
    listen(panel, 'pointerleave', dark);
    listen(panel, 'pointercancel', dark);

    record('webgl', live.reason, frameMs);
    request();
    return { ...state, teardown };
  } catch (err) {
    // Anything thrown after resources were acquired releases them; a cancellation has
    // already recorded its reason, anything else records the error and keeps the CSS tier.
    if (err instanceof Cancelled) return { ...state, teardown };
    teardown(`WebGL failed: ${err instanceof Error ? err.message : String(err)}`);
    return { ...state, teardown };
  }
}

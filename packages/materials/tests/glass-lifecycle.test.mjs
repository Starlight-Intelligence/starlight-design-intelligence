import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('glass mounts reuse one live canvas context and cancel stale async mounts', async (t) => {
  try {
    import.meta.resolve('three');
  } catch (err) {
    const missing = /Cannot find package '([^']+)'/.exec(String(err?.message))?.[1];
    if (err?.code !== 'ERR_MODULE_NOT_FOUND' || missing !== 'three') throw err;
    t.skip('three is not installed here; run pnpm test in packages/materials');
    return;
  }

  if (typeof t.mock.module !== 'function') {
    const child = spawnSync(process.execPath, [
      '--experimental-test-module-mocks',
      '--test-reporter=tap',
      '--test',
      fileURLToPath(import.meta.url),
    ], {
      encoding: 'utf8',
      timeout: 30_000,
      env: Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== 'NODE_TEST_CONTEXT')),
    });
    const output = `${child.stdout}${child.stderr}`;
    assert.equal(child.status, 0, `${child.error ?? ''}\n${output}`);
    assert.match(output, /# pass 1/);
    assert.match(output, /# skipped 0/);
    return;
  }

  const contexts = new WeakMap();
  const lostCanvases = new WeakSet();
  let contextLosses = 0;
  let rendererDisposals = 0;
  let rendererConstructions = 0;
  let stateResets = 0;
  let throwOnReset = false;
  let textureLoad = async () => texture();
  let shaderUniforms;
  let ink = '#070a10';
  const frames = new Map();
  const profileObservers = [];
  let nextFrame = 0;

  function texture() {
    return {
      image: { width: 1200, height: 800 },
      dispose() {},
    };
  }

  class Vector {
    constructor(x = 0, y = 0, z = 0) {
      this.set(x, y, z);
    }

    set(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }

    copy(other) {
      return this.set(other.x, other.y, other.z);
    }
  }

  class Renderer {
    constructor({ canvas }) {
      if (lostCanvases.has(canvas)) throw new Error('canvas context is still lost');
      rendererConstructions += 1;
      this.canvas = canvas;
      this.context = contexts.get(canvas) ?? { finish() {}, unpackFlipY: false, unpackPremultiplyAlpha: false };
      assert.equal(this.context.unpackFlipY, false, 'a new renderer needs default unpack flags for its empty 3D textures');
      assert.equal(this.context.unpackPremultiplyAlpha, false);
      contexts.set(canvas, this.context);
    }

    setPixelRatio() {}
    setSize() {}
    getDrawingBufferSize(target) {
      target.set(1200, 800);
      return target;
    }
    getContext() {
      return this.context;
    }
    render() {
      assert.equal(lostCanvases.has(this.canvas), false);
      this.context.unpackFlipY = true;
      this.context.unpackPremultiplyAlpha = true;
    }
    resetState() {
      stateResets += 1;
      if (throwOnReset) throw new Error('context reset failed');
      this.context.unpackFlipY = false;
      this.context.unpackPremultiplyAlpha = false;
    }
    dispose() {
      rendererDisposals += 1;
    }
    forceContextLoss() {
      contextLosses += 1;
      lostCanvases.add(this.canvas);
    }
  }

  class MockRenderer extends Renderer {
    constructor(options) {
      super(options);
      this.canvas = options.canvas;
    }
  }

  class TextureLoader {
    loadAsync(url) {
      return textureLoad(url);
    }
  }

  class Scene {
    add() {}
  }

  class Mesh {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
    }
  }

  const three = {
    WebGLRenderer: MockRenderer,
    TextureLoader,
    Vector2: Vector,
    Vector3: Vector,
    Vector4: Vector,
    PlaneGeometry: class {
      dispose() {}
    },
    ShaderMaterial: class {
      constructor({ uniforms }) { shaderUniforms = uniforms; }
      dispose() {}
    },
    Scene,
    Mesh,
    Camera: class {},
    LinearSRGBColorSpace: 'linear',
    NoColorSpace: 'none',
    LinearFilter: 'linear',
  };
  t.mock.module('three', { namedExports: three });

  const previousGlobals = new Map();
  const setGlobal = (name, value) => {
    previousGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  };
  t.after(() => {
    for (const [name, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });

  const media = new Map();
  class MediaQuery extends EventTarget {
    matches = false;
  }
  const document = new EventTarget();
  document.hidden = false;
  document.createElement = () => ({
    getContext: () => ({ getExtension: () => ({ loseContext() {} }) }),
  });
  const connection = Object.assign(new EventTarget(), { saveData: false });
  const navigator = { connection, deviceMemory: 8 };
  const window = Object.assign(new EventTarget(), {
    document,
    navigator,
    innerWidth: 1200,
    devicePixelRatio: 1,
    matchMedia(query) {
      if (!media.has(query)) media.set(query, new MediaQuery());
      return media.get(query);
    },
  });
  setGlobal('window', window);
  setGlobal('document', document);
  setGlobal('navigator', navigator);
  setGlobal('requestAnimationFrame', (callback) => { frames.set(++nextFrame, callback); return nextFrame; });
  setGlobal('cancelAnimationFrame', (id) => frames.delete(id));
  setGlobal('MutationObserver', class {
    observed = [];
    disconnected = false;
    constructor(callback) { this.callback = callback; profileObservers.push(this); }
    observe(target, options) { this.observed.push({ target, options }); }
    disconnect() { this.disconnected = true; }
  });
  setGlobal('ResizeObserver', class {
    observe() {}
    disconnect() {}
  });
  setGlobal('IntersectionObserver', class {
    constructor() {}
    observe() {}
    disconnect() {}
  });
  setGlobal('getComputedStyle', () => ({
    borderTopLeftRadius: '40px',
    getPropertyValue: () => ink,
  }));

  const rect = () => ({ left: 0, top: 0, width: 1200, height: 800 });
  const root = { parentElement: null };
  const scene = Object.assign(new EventTarget(), { dataset: {}, parentElement: root, getBoundingClientRect: rect });
  const panel = Object.assign(new EventTarget(), { getBoundingClientRect: rect });
  const canvas = new EventTarget();
  const { mountGlass } = await import('../src/glass/mount-glass.ts');
  const webglPlan = { mode: 'webgl', reason: 'capable' };

  const first = await mountGlass({ scene, canvas, panel, poster: '/poster-a.png', plan: webglPlan });
  assert.equal(first.mode, 'webgl', first.reason);
  const firstContext = contexts.get(canvas);
  const flushFrames = () => {
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback();
  };
  flushFrames();
  const profileObserver = profileObservers.at(-1);
  assert.ok(profileObserver, 'a running shader observes inherited profile changes');
  assert.deepEqual(profileObserver.observed.map(({ target }) => target), [scene, root]);
  for (const { options } of profileObserver.observed) {
    assert.equal(options.attributes, true);
    assert.equal(options.subtree, undefined, 'unrelated descendants do not keep the renderer drawing');
    assert.ok(options.attributeFilter.includes('data-theme'));
    assert.ok(!options.attributeFilter.includes('data-glass'));
  }
  ink = '#efede7';
  profileObserver.callback();
  profileObserver.callback();
  assert.equal(frames.size, 1, 'profile changes coalesce into one requested frame');
  flushFrames();
  assert.deepEqual([shaderUniforms.uInk.value.x, shaderUniforms.uInk.value.y, shaderUniforms.uInk.value.z], [239 / 255, 237 / 255, 231 / 255]);
  first.teardown();
  assert.equal(profileObserver.disconnected, true);
  profileObserver.callback();
  assert.equal(frames.size, 0, 'a late observer callback cannot restart a torn-down mount');
  assert.equal(rendererDisposals, 1);
  assert.equal(stateResets, 1, 'teardown returns the reusable context with default unpack state');
  assert.equal(contextLosses, 0, 'teardown must leave the React-owned canvas context reusable');

  const changedPoster = await mountGlass({ scene, canvas, panel, poster: '/poster-b.png', plan: webglPlan });
  assert.equal(changedPoster.mode, 'webgl', 'a changed poster can mount on the same live canvas');
  assert.equal(contexts.get(canvas), firstContext, 'remount reuses rather than leaks another context');
  changedPoster.teardown();

  const desktopQuery = [...media.entries()].find(([query]) => query.startsWith('(min-width:'))?.[1];
  assert.ok(desktopQuery);
  window.innerWidth = 800;
  desktopQuery.dispatchEvent(Object.assign(new Event('change'), { matches: false }));
  const phonePlan = { mode: 'css', reason: 'phone layout' };
  const phone = await mountGlass({ scene, canvas, panel, poster: '/poster-b.png', plan: phonePlan });
  assert.equal(phone.mode, 'css');
  window.innerWidth = 1200;
  desktopQuery.dispatchEvent(Object.assign(new Event('change'), { matches: true }));
  const returnedToDesktop = await mountGlass({ scene, canvas, panel, poster: '/poster-b.png', plan: webglPlan });
  assert.equal(returnedToDesktop.mode, 'webgl', 'desktop return can reuse the canvas after the phone tier');
  returnedToDesktop.teardown();

  const beforeImportAbort = rendererConstructions;
  const importAbort = new AbortController();
  const staleReports = [];
  const importing = mountGlass({
    scene,
    canvas,
    panel,
    poster: '/poster-c.png',
    plan: webglPlan,
    signal: importAbort.signal,
    onChange: (state) => staleReports.push(state.mode),
  });
  importAbort.abort();
  const abortedImport = await importing;
  assert.equal(abortedImport.reason, 'cancelled');
  assert.equal(rendererConstructions, beforeImportAbort);
  assert.ok(!staleReports.includes('webgl'));

  let beginTextureLoad;
  let resolveTexture;
  const textureStarted = new Promise((resolve) => { beginTextureLoad = resolve; });
  const pendingTexture = new Promise((resolve) => { resolveTexture = resolve; });
  textureLoad = () => {
    beginTextureLoad();
    return pendingTexture;
  };
  const preferenceReports = [];
  const loading = mountGlass({
    scene,
    canvas,
    panel,
    poster: '/poster-d.png',
    plan: webglPlan,
    onChange: (state) => preferenceReports.push(state.mode),
  });
  await textureStarted;
  const reducedMotion = media.get('(prefers-reduced-motion: reduce)');
  reducedMotion.matches = true;
  reducedMotion.dispatchEvent(Object.assign(new Event('change'), { matches: true }));
  const lateTexture = texture();
  resolveTexture(lateTexture);
  const preferenceResult = await loading;
  assert.equal(preferenceResult.reason, 'preference changed');
  assert.ok(!preferenceReports.includes('webgl'), 'a stale async mount never reports WebGL');
  assert.equal(contextLosses, 0);

  reducedMotion.matches = false;
  textureLoad = async () => texture();
  const resetFailure = await mountGlass({ scene, canvas, panel, poster: '/poster-e.png', plan: webglPlan });
  assert.equal(resetFailure.mode, 'webgl');
  const disposalsBeforeResetFailure = rendererDisposals;
  throwOnReset = true;
  assert.doesNotThrow(() => resetFailure.teardown());
  assert.equal(rendererDisposals, disposalsBeforeResetFailure + 1, 'dispose still runs when resetting a lost context fails');
});

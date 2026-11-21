'use client';

import { useEffect, useRef } from 'react';

// The kit's one GPU surface. A CSS poster is always painted underneath; the
// canvas fades in only after its first frame. The loop pauses when the field
// leaves the viewport or the tab is hidden, and resumes on return. Reduced
// motion draws a single still frame. A lost WebGL context falls back to the
// poster and recovers if the browser restores it.

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;
uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.6;
  float s=t*.035;
  vec2 q=vec2(fbm(p+s),fbm(p+vec2(5.2,1.3)-s));
  float f=fbm(p+2.4*q+vec2(1.7,9.2)+s*.6);
  vec3 col=mix(c0,c1,smoothstep(.35,.85,f));
  col=mix(col,c2,smoothstep(.55,.95,f*q.y)*.7*smoothstep(.25,.9,uv.y));
  col*=mix(.72,1.,smoothstep(0.,.9,uv.y));
  gl_FragColor=vec4(col,1.);
}`;

function hex(h: string): [number, number, number] {
  const v = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255) as [number, number, number];
}

export type ShaderFieldProps = {
  /** Base, mid and highlight colours. Defaults follow the Midnight theme. */
  colors?: readonly [string, string, string];
  className?: string;
};

const DEFAULT_COLORS: readonly [string, string, string] = ['#101820', '#22474b', '#9bd8cd'];

export function ShaderField({ colors = DEFAULT_COLORS, className }: ShaderFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const palette = colors.join(',');

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let gl: WebGLRenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let raf = 0;
    let visible = true;
    let lost = false;
    let start = performance.now();
    let last = 0;
    let uR: WebGLUniformLocation | null = null;
    let uT: WebGLUniformLocation | null = null;

    const setup = () => {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
      if (!gl) return false;
      const sh = (type: number, src: string) => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        return s;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uR = gl.getUniformLocation(prog, 'r');
      uT = gl.getUniformLocation(prog, 't');
      const [a, b, c] = palette.split(',').map(hex);
      gl.uniform3fv(gl.getUniformLocation(prog, 'c0'), a);
      gl.uniform3fv(gl.getUniformLocation(prog, 'c1'), b);
      gl.uniform3fv(gl.getUniformLocation(prog, 'c2'), c);
      return true;
    };

    const resize = () => {
      // Render at reduced resolution: the field is soft, pixels are cheap to skip.
      const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.6;
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl?.viewport(0, 0, w, h);
    };

    const draw = (now: number) => {
      if (!gl || lost) return;
      resize();
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.ready = 'true';
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden || reduce.matches || lost) return;
      if (now - last >= 1000 / 30) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      canvas.dataset.state = visible && !document.hidden && !reduce.matches ? 'playing' : 'paused';
      if (reduce.matches) {
        draw(start + 12000);
        return;
      }
      if (!raf && visible && !document.hidden && !lost) raf = requestAnimationFrame(loop);
    };

    if (!setup()) {
      canvas.dataset.state = 'unsupported';
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      play();
    });
    io.observe(canvas);

    const onVisibility = () => play();
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
      canvas.dataset.ready = 'false';
      canvas.dataset.state = 'lost';
    };
    const onRestored = () => {
      lost = false;
      if (setup()) {
        start = performance.now();
        play();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    reduce.addEventListener('change', play);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    play();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduce.removeEventListener('change', play);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [palette]);

  return (
    <div className={['ks-field', className].filter(Boolean).join(' ')} aria-hidden="true">
      <canvas ref={ref} className="ks-field__canvas" data-state="idle" />
    </div>
  );
}

const preference = matchMedia('(prefers-reduced-motion: reduce)');
const replay = document.querySelector('#replay');
const status = document.querySelector('#status');
const specimen = document.querySelector('#specimen');
let timeline;
let dot;

function resetDot() {
  if (!dot) return;
  gsap.set(dot, {clearProps: 'opacity,transform'});
  dot.removeAttribute('transform');
  dot.removeAttribute('data-svg-origin');
}

function updatePreference() {
  timeline?.revert();
  timeline = undefined;
  resetDot();
  replay.hidden = !dot || preference.matches;
  status.textContent = preference.matches ? 'Static mark · reduced motion' : 'Static mark';
}

async function enableProof() {
  if (!window.gsap) return;
  const response = await fetch('./starlight-star.svg');
  if (!response.ok) return;
  const bytes = await response.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('');
  if (hex !== 'a808c62c147e7e9fdeb6af4404e4f3d90884340c9bd6aea641763d2c5e108c23') return;
  const source = new DOMParser().parseFromString(new TextDecoder().decode(bytes), 'image/svg+xml');
  const inline = document.importNode(source.documentElement, true);
  dot = inline.querySelector('circle');
  specimen.replaceChildren(inline);
  updatePreference();
}

replay.addEventListener('click', () => {
  if (!dot || preference.matches) return;
  timeline?.revert();
  status.textContent = 'Playing';
  timeline = gsap.timeline({onComplete: () => {
    resetDot();
    status.textContent = 'Complete · original rest state';
  }}).fromTo(dot, {opacity: .12, y: 3}, {opacity: 1, y: 0, duration: .9, ease: 'power2.out'});
});
preference.addEventListener('change', updatePreference);
updatePreference();
enableProof().catch(updatePreference);

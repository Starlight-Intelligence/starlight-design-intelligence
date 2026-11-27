import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {angle,Transformation,EventProjection,ENTITY_ID} from '../src/runtime.mjs';
const $=id=>document.getElementById(id), controller=new Transformation(), events=new EventProjection();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let gltf, hinges, last=performance.now(), frames=[], error=null, pendingForm=null, lastFreshness=0;
async function boot(){
const scene=new THREE.Scene();scene.background=new THREE.Color('#101b19');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
$('viewport').prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive experimental seed to bloom mechanism. Drag to orbit; use the controls below to transform.');
const camera=new THREE.PerspectiveCamera(36,1,.1,80);camera.position.set(4.9,3.3,6.8);
const orbit=new OrbitControls(camera,renderer.domElement);orbit.target.set(0,1,0);orbit.enableDamping=false;orbit.minDistance=4;orbit.maxDistance=13;orbit.maxPolarAngle=Math.PI*.49;orbit.update();
const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xe1eee1,0x1b271f,2));
for(const [pos,color,intensity] of [[[3,7,4],0xffe0b0,100],[[-4,3,-3],0x8edbcd,80]]){
 const l=new THREE.DirectionalLight(color,intensity/30);l.position.set(...pos);l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.camera.left=-4;l.shadow.camera.right=4;l.shadow.camera.top=4;l.shadow.camera.bottom=-4;scene.add(l);
}
const ground=new THREE.Mesh(new THREE.CylinderGeometry(3,3,.1,96),new THREE.MeshStandardMaterial({color:0x172522,metalness:.3,roughness:.58}));ground.position.y=-.04;ground.receiveShadow=true;scene.add(ground);
const ring=new THREE.Mesh(new THREE.TorusGeometry(2.72,.008,8,128),new THREE.MeshStandardMaterial({color:0x9d7842,metalness:.8,roughness:.36}));ring.rotation.x=Math.PI/2;ring.position.y=.018;scene.add(ring);
function resize(){const r=$('viewport').getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe($('viewport'));resize();
function setPose(){if(!hinges)return;for(let i=0;i<6;i++)hinges[i].rotation.z=-angle(controller.q,i);gltf.scene.updateMatrixWorld(true);}
// Blender Z-up → glTF Y-up maps the hinge's source +Y axis to delivery -Z.
function refresh(){
 $('progress').value=controller.q;$('percent').textContent=Math.round(controller.q*100)+'%';
 $('phase').textContent=controller.state;
 for(const [id,form]of [['toA','seed'],['toB','bloom']])$(id).disabled=!!controller.direction||(controller.q!==0&&controller.q!==1)||(form==='seed'?controller.q===0:controller.q===1);
 $('reset').hidden=controller.state!=='inspection';
 $('inspect').textContent=JSON.stringify({entity_id:ENTITY_ID,configuration:controller.state,q:+controller.q.toFixed(4),canon:'noncanonical',runtime:'synthetic-local',event_state:events.state,pending:pendingForm,hinges:Array.from({length:6},(_,i)=>({id:`hinge_${String(i).padStart(2,'0')}`,degrees:+(angle(controller.q,i)*180/Math.PI).toFixed(3)}))},null,2);
}
function request(form){if(reduced){controller.seek(form==='bloom'?1:0);}else controller.request(form);setPose();refresh();}
$('toA').onclick=()=>request('seed');$('toB').onclick=()=>request('bloom');$('reset').onclick=()=>{controller.seek(0);setPose();refresh();};
$('progress').oninput=e=>{controller.seek(+e.target.value);setPose();refresh();};
$('wire').onchange=e=>gltf?.scene.traverse(o=>{if(o.isMesh){for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.wireframe=e.target.checked;}});
$('event').onchange=e=>{
 const state=e.target.value,now=Date.now();events.apply({entity_id:ENTITY_ID,scope:'synthetic-local',run_id:'demo-run-001',event_id:`evt-${events.seq+1}`,seq:events.seq+1,state,observed_at:now},now);
 $('runtime').textContent='Synthetic event · '+state;$('runtime').dataset.state=state;
 if(state==='running'||state==='idle'){const form=state==='running'?'bloom':'seed';if(controller.direction){pendingForm=form;$('runtime').textContent+=' · '+form+' queued';}else request(form);}refresh();
};
try{
 const raw=Uint8Array.from(atob(window.ASSET_GLB),c=>c.charCodeAt(0));
 gltf=await new GLTFLoader().parseAsync(raw.buffer,'');scene.add(gltf.scene);
 gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 hinges=Array.from({length:6},(_,i)=>gltf.scene.getObjectByName(`hinge_${String(i).padStart(2,'0')}`));
 if(hinges.some(x=>!x))throw Error('missing required hinge');
 $('loading').remove();setPose();refresh();
}catch(e){error=String(e);$('loading').textContent='3D unavailable. The static form and source package remain available below.';console.error(e);}
function loop(now){const dt=Math.min((now-last)/1000,.1);last=now;const t=performance.now();
 if(controller.direction){controller.tick(dt);setPose();refresh();}
 if(!controller.direction&&pendingForm){const form=pendingForm;pendingForm=null;request(form);}
 if(now-lastFreshness>500){lastFreshness=now;const before=events.state;events.refresh(Date.now());if(before!==events.state){$('runtime').textContent='Synthetic event · unknown / stale';$('runtime').dataset.state='unknown';refresh();}}
 renderer.render(scene,camera);frames.push(performance.now()-t);if(frames.length>1200)frames.shift();requestAnimationFrame(loop);
}requestAnimationFrame(loop);
window.lab={controller,events,setPose,refresh,get ready(){return !!hinges},get error(){return error},renderer,gltf,
 metrics(){const sorted=frames.slice().sort((a,b)=>a-b),gl=renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return {samples:frames.length,cpu_frame_p50_ms:sorted[Math.floor(sorted.length*.5)],cpu_frame_p95_ms:sorted[Math.floor(sorted.length*.95)],draw_calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,viewport:[renderer.domElement.width,renderer.domElement.height],renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),reduced_motion:reduced};}};

}
boot().catch(e=>{document.querySelector("canvas")?.remove();$("loading").textContent="3D unavailable. Inspect the static seed form below; download the GLB and source package alongside this demo.";console.error(e);});

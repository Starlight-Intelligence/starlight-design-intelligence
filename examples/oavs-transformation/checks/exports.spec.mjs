import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as THREE from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {angle} from '../src/runtime.mjs';import validator from 'gltf-validator';
const bytes=fs.readFileSync('outputs/seed-bloom.glb');
const model=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
test('GLB passes Khronos validation with no errors or warnings',async()=>{
 const r=await validator.validateBytes(new Uint8Array(bytes));fs.writeFileSync('outputs/gltf-validation.json',JSON.stringify(r,null,2));assert.equal(r.issues.numErrors,0);assert.equal(r.issues.numWarnings,0);
});
test('Python source and JavaScript procedural executor agree',()=>{
 const fixture=JSON.parse(fs.readFileSync('outputs/adapter-fixture.json'));
 for(const s of fixture.samples)for(let i=0;i<6;i++)assert.ok(Math.abs(angle(s.q,i)-s.angles[i])<1e-14);
});
test('all GLB clips agree with exact source at baked frames; dense interpolation error measured',()=>{
 const mixer=new THREE.AnimationMixer(model.scene);for(const clip of model.animations)mixer.clipAction(clip).play();
 let maxBaked=0,maxDense=0,measured=0;const rotations=[];
 for(let k=0;k<=3600;k++){
  const q=k/3600;mixer.setTime(q*6===6?6-1e-9:q*6);model.scene.updateMatrixWorld(true);
  for(let i=0;i<6;i++){
   const node=model.scene.getObjectByName(`hinge_${String(i).padStart(2,'0')}`);
   const expected=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,-1),angle(q,i));const err=node.quaternion.angleTo(expected);
   maxDense=Math.max(maxDense,err);if(k%20===0)maxBaked=Math.max(maxBaked,err);measured++;
   assert.equal(node.scale.x,1);assert.equal(node.scale.y,1);assert.equal(node.scale.z,1);
  }
 }
 fs.writeFileSync('outputs/export-accuracy.json',JSON.stringify({samples:measured,baked_frame_max_angle_error_rad:maxBaked,dense_max_angle_error_rad:maxDense,source:'Python quintic FK',delivery:'Blender GLB quaternion tracks at 30fps; Three.js AnimationMixer evaluation',web:'exact analytic curve; not baked playback'},null,2));
 assert.ok(maxBaked<1e-5,`baked error ${maxBaked}`);assert.ok(maxDense<1e-3,`interpolation error ${maxDense}`);
});
test('component identities, local geometry and attachment tree persist through all configurations',()=>{
 const hash=()=>{const parts=[];model.scene.traverse(o=>parts.push([o.name,o.parent?.name,o.geometry?.uuid,o.material?.uuid,...o.scale.toArray()]));return JSON.stringify(parts);};
 const before=hash();for(let k=0;k<=100;k++){for(let i=0;i<6;i++)model.scene.getObjectByName(`hinge_${String(i).padStart(2,'0')}`).rotation.z=-angle(k/100,i);model.scene.updateMatrixWorld(true);assert.equal(hash(),before);}
});

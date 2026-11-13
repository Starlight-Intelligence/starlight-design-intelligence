/** Deliberately synthetic. No company, model, valuation or execution claim. */
export const modelOptions = [
  {id:'balanced',name:'Balanced',detail:'Demo routing profile'},
  {id:'reasoning',name:'Reasoning',detail:'Demo routing profile'},
  {id:'local',name:'Local',detail:'Demo routing profile'},
];
export const runs = [
  {id:'research-014',name:'Compare inference architectures',role:'Research',status:'blocked' as const,input:42000,output:8000,sources:6},
  {id:'build-008',name:'Prepare the launch workspace',role:'Build',status:'complete' as const,input:28000,output:5000,sources:3},
  {id:'review-006',name:'Inspect component accessibility',role:'Review',status:'complete' as const,input:14000,output:3000,sources:4},
];
export const usage = {input:runs.reduce((n,r)=>n+r.input,0),output:runs.reduce((n,r)=>n+r.output,0),limit:250000};
export const companies = [
  {id:'northstar',name:'Northstar Compute',initial:'NC',sector:'Inference',region:'Netherlands',stage:'Seed',sources:4,claim:'reviewed',description:'Fictional inference infrastructure company used to demonstrate an evidence-led dossier.'},
  {id:'tidal',name:'Tidal Robotics',initial:'TR',sector:'Robotics',region:'Germany',stage:'Pre-seed',sources:2,claim:'hypothesis',description:'Fictional robotics company. Product-market fit and financing remain unknown in this fixture.'},
  {id:'canopy',name:'Canopy Systems',initial:'CS',sector:'Energy',region:'Denmark',stage:'Seed',sources:3,claim:'reviewed',description:'Fictional energy software company used for table, watchlist and comparison states.'},
];
export const products = [
  {id:'glass',name:'Living Glass UI Kit',amount:49,description:'The interface foundation.',features:['19 React components','Three semantic themes','24 original SVG icons','Typed tokens + Tailwind adapter']},
  {id:'launch',name:'AI Startup Launch Kit',amount:149,description:'From interface to a running product.',features:['Everything in Living Glass','Independent Next.js starter','SaaS launch experience','Checkout adapter contract']},
  {id:'bundle',name:'Premium Builder Bundle',amount:249,description:'Four experiences. One coherent system.',features:['Everything in AI Startup','All four reference experiences','Vite workbench + source','Figma-compatible assets + QA suite']},
];
export function exportFixture(name:string, data:unknown) {
  const blob = new Blob([JSON.stringify({schema:'starlight.living_design_fixture.v1',synthetic:true,data},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

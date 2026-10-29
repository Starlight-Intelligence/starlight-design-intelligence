// Pure export helpers shared by Node verification and the offline atlas.
export function profileFiles(catalog,id){
  const character=catalog.characters.find(c=>c.id===id);
  if(!character)throw new Error('Unknown character');
  const ids=new Set(),pending=[id];
  while(pending.length){const next=pending.pop();if(ids.has(next))continue;ids.add(next);for(const e of catalog.edges)if(e.source===next)pending.push(e.target);}
  const docs=catalog.contracts.filter(c=>ids.has(c.id));
  if(docs.length!==ids.size||docs.some(c=>typeof c.markdown!=='string'))throw new Error('Incomplete source contracts');
  const files=docs.map(c=>({path:c.path,text:c.markdown}));
  files.push({path:'profile.json',text:JSON.stringify({schema:'starlight.living-design.profile-export.v1',character,source_digest:catalog.meta.source_digest,status:'candidate',runtime_connected:false,sources:docs.map(({id,path,sha256})=>({id,path,sha256}))},null,2)+'\n'});
  return files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
}

export function zipStore(files){
  if(!Array.isArray(files)||!files.length||files.length>1000)throw new Error('Invalid file count');
  const encoder=new TextEncoder(),seen=new Set(),locals=[],centrals=[];let offset=0,centralSize=0;
  const crc32=bytes=>{let c=0xffffffff;for(const b of bytes){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
  for(const file of files){
    if(typeof file.path!=='string'||!/^[a-zA-Z0-9_./-]+$/.test(file.path)||file.path.startsWith('/')||file.path.split('/').some(s=>!s||s==='.'||s==='..')||seen.has(file.path)||typeof file.text!=='string')throw new Error('Unsafe or duplicate export path');
    seen.add(file.path);const name=encoder.encode(file.path),data=encoder.encode(file.text);
    if(name.length>65535||data.length>16777216||offset+data.length>67108864)throw new Error('Export too large');
    const crc=crc32(data),local=new Uint8Array(30+name.length+data.length),lv=new DataView(local.buffer);
    lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);lv.setUint16(12,33,true);
    lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);local.set(name,30);local.set(data,30+name.length);
    const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,33,true);
    cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);central.set(name,46);
    locals.push(local);centrals.push(central);offset+=local.length;centralSize+=central.length;
  }
  const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);
  const result=new Uint8Array(offset+centralSize+22);let cursor=0;for(const block of [...locals,...centrals,end]){result.set(block,cursor);cursor+=block.length;}return result;
}

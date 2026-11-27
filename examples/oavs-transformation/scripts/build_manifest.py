import os,json,struct,hashlib,sys
from pathlib import Path
import jsonschema
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'src'))
from mechanism import *
out=ROOT/'outputs';raw=(out/'seed-bloom.glb').read_bytes();n=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+n]);data=raw[28+n:]
parents={c:i for i,o in enumerate(g['nodes'])for c in o.get('children',[])}
components=[]
for i,node in enumerate(g['nodes']):
 mesh=node.get('mesh');digest=None
 if mesh is not None:
  h=hashlib.sha256()
  for p in g['meshes'][mesh]['primitives']:
   for k in [*p['attributes'].values(),p['indices']]:
    a=g['accessors'][k];v=g['bufferViews'][a['bufferView']];h.update(data[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])
  digest=h.hexdigest()
 components.append({'id':node['name'],'parent_id':g['nodes'][parents[i]]['name']if i in parents else None,'mesh_ref':mesh,'geometry_sha256':digest,'scale':node.get('scale',[1,1,1])})
deps=[['q',f'phase_{k}']for k in range(3)]+[[f'phase_{i%3}',f'hinge_{i:02d}']for i in range(6)]
paths=['seed-bloom.glb','seed-bloom.usda','seed-bloom.blend','form-a.png','form-b.png','Starlight-Transformation-Lab.html']
manifest={'schema_version':'starlight.transformation.asset.v0.1','entity_id':ENTITY_ID,'version':'0.1.0','canon_status':'noncanonical_experiment','character_id':None,'runtime_agent_id':None,
 'identity_anchors':['core_housing','core_lens','core_stud_0','core_stud_1','core_stud_2'],'units':{'length':'metre','angle':'radian','source_up':'Z','delivery_up':'Y'},'components':components,
 'joints':[{'id':f'hinge_{i:02d}','type':'revolute','source_axis':[0,1,0],'delivery_axis':[0,0,-1],'limits':[CLOSED,OPEN],'phase':[(i%3)*.08,(i%3)*.08+.84]}for i in range(6)],
 'configurations':{'seed':{'q':0},'bloom':{'q':1}},'transition':{'from':'seed','to':'bloom','duration_s':6,'curve':'clamped-quintic','reversal':'settled-endpoints-only','dependencies':deps},
 'artifacts':[{'path':p,'sha256':hashlib.sha256((out/p).read_bytes()).hexdigest(),'bytes':(out/p).stat().st_size}for p in paths],
 'provenance':{'method':'original-procedural-geometry','approval':'experimental-unapproved','owner_repo':'Starlight-Intelligence/starlight-design-intelligence','source_hashes':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()for p in ['src/mechanism.py','src/runtime.mjs','scripts/build_scene.py','src/asset.schema.json']}},
 'scope':'Experimental transformation sidecar; references existing living-design character IDs and VIS asset versions when authorized. Does not create a character, agent, registry, runtime grant or canonical OAVS standard.'}
jsonschema.Draft202012Validator(json.loads((ROOT/'src/asset.schema.json').read_text())).validate(manifest)
# Graph semantics beyond schema.
ids=[x['id']for x in components];assert len(ids)==len(set(ids))
for c in components:
 assert c['parent_id']is None or c['parent_id']in ids
 seen=set();cur=c
 while cur['parent_id']is not None:
  assert cur['id']not in seen;seen.add(cur['id']);cur=components[ids.index(cur['parent_id'])]
for j in manifest['joints']:assert j['id']in ids and j['limits'][0]<j['limits'][1]
graph={}
for a,b in deps:graph.setdefault(a,[]).append(b)
def visit(x,stack):
 assert x not in stack
 for y in graph.get(x,[]):visit(y,stack|{x})
visit('q',set())
(out/'entity.asset.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'schema_valid':True,'components':len(components),'joints':len(manifest['joints']),'attachment_graph_acyclic':True,'motion_graph_acyclic':True}))

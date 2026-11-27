"""Explicit GLB→USD adapter. This fixture uses embedded indexed triangles + PBR."""
import os,json,struct,sys,math,numpy as np
from pxr import Usd,UsdGeom,UsdShade,Gf,Sdf
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'outputs')
b=open(os.path.join(OUT,'seed-bloom.glb'),'rb').read();n=struct.unpack_from('<I',b,12)[0]
g=json.loads(b[20:20+n]);data=b[28+n:]
def accessor(i):
 a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];dtype={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}[a['componentType']]
 size={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
 return np.frombuffer(data,dtype=dtype,count=a['count']*size,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(a['count'],size)
def path(i):
 parents={ch:k for k,node in enumerate(g['nodes']) for ch in node.get('children',[])}
 p=[]
 while True:
  p.append(g['nodes'][i]['name'].replace('-','_'));i=parents.get(i)
  if i is None:break
 return '/Entity/'+'/'.join(reversed(p))
stage=Usd.Stage.CreateNew(os.path.join(OUT,'seed-bloom.usda'));UsdGeom.SetStageUpAxis(stage,UsdGeom.Tokens.y);UsdGeom.SetStageMetersPerUnit(stage,1.)
stage.SetStartTimeCode(1);stage.SetEndTimeCode(181);stage.SetTimeCodesPerSecond(30);stage.SetFramesPerSecond(30)
root=UsdGeom.Xform.Define(stage,'/Entity');stage.SetDefaultPrim(root.GetPrim())
root.GetPrim().SetCustomDataByKey('entity_id','experimental.oavs.seed-bloom.001')
materials=[]
for i,m in enumerate(g['materials']):
 mat=UsdShade.Material.Define(stage,f'/Materials/m_{i}');sh=UsdShade.Shader.Define(stage,f'/Materials/m_{i}/PreviewSurface');sh.CreateIdAttr('UsdPreviewSurface')
 p=m.get('pbrMetallicRoughness',{});c=p.get('baseColorFactor',[1,1,1,1]);sh.CreateInput('diffuseColor',Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(*c[:3]))
 sh.CreateInput('roughness',Sdf.ValueTypeNames.Float).Set(p.get('roughnessFactor',1));sh.CreateInput('metallic',Sdf.ValueTypeNames.Float).Set(p.get('metallicFactor',0))
 sh.CreateInput('emissiveColor',Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(*m.get('emissiveFactor',[0,0,0])))
 mat.CreateSurfaceOutput().ConnectToSource(sh.ConnectableAPI(),'surface');materials.append(mat)
ops={}
for i,node in enumerate(g['nodes']):
 x=UsdGeom.Xform.Define(stage,path(i));x.AddTranslateOp().Set(Gf.Vec3d(*node.get('translation',[0,0,0])))
 r=np.asarray(node.get('rotation',[0,0,0,1]),dtype=float);r/=np.linalg.norm(r)
 if node['name'].startswith('hinge_'):
  assert abs(r[0])+abs(r[1])<1e-6
  op=x.AddRotateZOp(UsdGeom.XformOp.PrecisionDouble);op.Set(math.degrees(2*math.atan2(r[2],r[3])))
 else:
  op=x.AddOrientOp(UsdGeom.XformOp.PrecisionDouble);op.Set(Gf.Quatd(float(r[3]),Gf.Vec3d(*map(float,r[:3]))))
 ops[i]=op
 x.AddScaleOp().Set(Gf.Vec3f(*node.get('scale',[1,1,1])))
 if 'mesh'in node:
  for j,p in enumerate(g['meshes'][node['mesh']]['primitives']):
   mesh=UsdGeom.Mesh.Define(stage,path(i)+f'/mesh_{j}');points=accessor(p['attributes']['POSITION']);indices=accessor(p['indices']).flatten()
   mesh.CreatePointsAttr(points.tolist());mesh.CreateFaceVertexCountsAttr([3]*(len(indices)//3));mesh.CreateFaceVertexIndicesAttr(indices.tolist());mesh.CreateSubdivisionSchemeAttr('none')
   if 'NORMAL'in p['attributes']:mesh.CreateNormalsAttr(accessor(p['attributes']['NORMAL']).tolist());mesh.SetNormalsInterpolation('vertex')
   UsdShade.MaterialBindingAPI.Apply(mesh.GetPrim()).Bind(materials[p.get('material',0)])
for anim in g.get('animations',[]):
 for ch in anim['channels']:
  if ch['target']['path']!='rotation':raise ValueError('fixture adapter only supports rotation tracks')
  s=anim['samplers'][ch['sampler']];ts=accessor(s['input']).flatten();qs=accessor(s['output'])
  for t,q in zip(ts,qs):
   assert abs(q[0])+abs(q[1])<1e-6
   ops[ch['target']['node']].Set(math.degrees(2*math.atan2(float(q[2]),float(q[3]))),Usd.TimeCode(float(t)*30+1))
stage.GetRootLayer().Save()
# Structural roundtrip qualification, not a render-equivalence claim.
reopened=Usd.Stage.Open(os.path.join(OUT,'seed-bloom.usda'))
assert reopened and UsdGeom.GetStageMetersPerUnit(reopened)==1 and UsdGeom.GetStageUpAxis(reopened)=='Y'
json.dump({'sdk':'.'.join(map(str,Usd.GetVersion())),'nodes':len(g['nodes']),'mesh_prims':sum(1 for p in reopened.Traverse()if p.IsA(UsdGeom.Mesh)),'up_axis':'Y','meters_per_unit':1,'reopened':True},open(os.path.join(OUT,'usd-receipt.json'),'w'),indent=2)

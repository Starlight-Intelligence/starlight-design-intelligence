import bpy, math, sys, os, json, time
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,os.path.join(ROOT,'src'))
from mechanism import *
OUT=os.path.join(ROOT,'outputs');os.makedirs(OUT,exist_ok=True)
start=time.monotonic()
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=20
scene.cycles.use_denoising=False;scene.cycles.device='CPU'
scene.render.resolution_x=1280;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.fps=30
scene.world.color=(.08,.08,.08)
scene.view_settings.view_transform='AgX'

def mat(name,color,metal=0,rough=.3,emission=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    if emission:p.inputs['Emission Color'].default_value=(*color,1);p.inputs['Emission Strength'].default_value=emission
    return m
ceramic=mat('Ivory | fired ceramic',(.72,.72,.59),.18,.27)
green=mat('Moss | enamel',(.052,.13,.105),.4,.27)
brass=mat('Brass | machined',(.48,.29,.09),.8,.24)
dark=mat('Graphite | joints',(.025,.038,.039),.65,.3)
amber=mat('Amber | persistent core',(.9,.32,.045),.5,.18,.65)
ink=mat('Ground',(.018,.028,.027),.15,.42)

def parent(o,p):o.parent=p
def sphere(name,loc,scale,material,p=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,location=loc)
    o=bpy.context.object;o.name=name;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    for f in o.data.polygons:f.use_smooth=True
    if p:parent(o,p)
    return o
def cyl(name,loc,r,depth,material,p=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=r,depth=depth,location=loc)
    o=bpy.context.object;o.name=name;o.data.materials.append(material)
    mod=o.modifiers.new('Machined edge','BEVEL');mod.width=.025;mod.segments=3
    o.modifiers.new('Normals','WEIGHTED_NORMAL')
    if p:parent(o,p)
    return o
def tube(name,points,r,material,p=None):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=3
    spl=c.splines.new('POLY');spl.points.add(len(points)-1)
    for a,b in zip(spl.points,points):a.co=(*b,1)
    o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);o.data.materials.append(material)
    if p:parent(o,p)
    return o
def torus(name,loc,major,minor,material,p=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=major,minor_radius=minor,major_segments=80,minor_segments=12,location=loc)
    o=bpy.context.object;o.name=name;o.data.materials.append(material)
    for f in o.data.polygons:f.use_smooth=True
    if p:parent(o,p)
    return o

root=bpy.data.objects.new('entity_root',None);scene.collection.objects.link(root)
root['entity_id']=ENTITY_ID;root['canon_status']='noncanonical_experiment';root['version']='0.1.0'
cyl('base_foot',(0,0,.17),.53,.25,dark,root)
cyl('base_crown',(0,0,.34),.64,.11,brass,root)
cyl('central_mast',(0,0,.77),.13,.8,dark,root)
sphere('core_housing',(0,0,1.22),(.43,.43,.47),green,root)
sphere('core_lens',(0,-.385,1.28),(.24,.10,.22),amber,root)
torus('core_equator',(0,0,1.22),.436,.019,brass,root)
torus('core_collar',(0,0,.93),.31,.035,brass,root)
# Three asymmetric studs preserve a recognisable orientation anchor.
for i in range(3):sphere(f'core_stud_{i}',(-.14+i*.14,-.413,1.05),(.028,.026,.028),brass,root)
hinges=[]
v,f=leaf_mesh();mesh=bpy.data.meshes.new('panel_shared_topology');mesh.from_pydata(v.tolist(),[],f);mesh.update()
for i in range(6):
    a=i*math.tau/6
    station=bpy.data.objects.new(f'station_{i:02d}',None);scene.collection.objects.link(station);parent(station,root)
    station.location=(RADIUS*math.cos(a),RADIUS*math.sin(a),HEIGHT);station.rotation_euler.z=a
    hinge=bpy.data.objects.new(f'hinge_{i:02d}',None);scene.collection.objects.link(hinge);parent(hinge,station);hinges.append(hinge)
    hinge['joint_type']='revolute';hinge['axis']='local +Y';hinge['limits_rad']=[CLOSED,OPEN]
    panel=bpy.data.objects.new(f'panel_{i:02d}',mesh);scene.collection.objects.link(panel);parent(panel,hinge)
    if not mesh.materials:mesh.materials.append(ceramic)
    for face in mesh.polygons:face.use_smooth=True
    # Rigid ornaments belong to the same link and remain fixed in panel space.
    pts=[]
    for j in range(33):
        u=j/32;pts.append((LENGTH*u,0,-.13*math.sin(math.pi*u)+.031))
    tube(f'panel_spine_{i:02d}',pts,.012,brass,hinge)
    for side in [-1,1]:
        pts=[]
        for j in range(33):
            u=j/32;w=.025+.255*math.sin(math.pi*u)**.85
            pts.append((LENGTH*u,side*w,-.085*math.sin(math.pi*u)+.027))
        tube(f'panel_edge_{i:02d}_{side}',pts,.008,brass,hinge)
    bearing=cyl(f'bearing_{i:02d}',(0,0,0),.09,.18,dark,station);bearing.rotation_euler.x=math.pi/2
    axle=cyl(f'axle_{i:02d}',(0,0,0),.055,.21,brass,station);axle.rotation_euler.x=math.pi/2
    tube(f'support_{i:02d}',[(-.32,0,-.18),(0,0,0)],.042,dark,station)

def setq(q):
    for i,o in enumerate(hinges):o.rotation_euler.y=angle(q,i)

# Portable baked clip; exact procedural executor remains authoritative.
for frame in range(181):
    q=frame/180;setq(q)
    for o in hinges:o.keyframe_insert(data_path='rotation_euler',frame=frame+1)
for o in hinges:
    if o.animation_data and o.animation_data.action:
        for fc in o.animation_data.action.fcurves:
            for k in fc.keyframe_points:k.interpolation='LINEAR'
scene.frame_start=1;scene.frame_end=181;scene.frame_set(1)

# Select entity only for exchange exports.
bpy.ops.object.select_all(action='DESELECT')
for o in [root]+list(root.children_recursive):o.select_set(True)
bpy.context.view_layer.objects.active=root
# Curves must become explicit meshes for reliable interchange.
for o in list(root.children_recursive):
    if o.type=='CURVE':
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
bpy.ops.object.select_all(action='DESELECT')
for o in [root]+list(root.children_recursive):o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'seed-bloom.glb'),use_selection=True,export_format='GLB',export_animations=True,export_frame_range=True,export_force_sampling=True,export_animation_mode='SCENE',export_extras=True)
sys.path.insert(0,os.path.join(ROOT,'scripts'))
from normalize_glb import normalize
normalize(os.path.join(OUT,'seed-bloom.glb'))
# Distribution Blender omits USD support; scripts/export_usd.py uses the OpenUSD SDK.

# Photographic studio; all stage objects excluded from exchange assets.
cyl('stage',(0,0,-.03),3.3,.13,ink)
torus('stage_inlay',(0,0,.04),2.9,.006,brass)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.11));bpy.context.object.data.materials.append(ink)
def light(name,loc,power,color,size,target=(0,0,1)):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
light('Key softbox',(1,-4,6),950,(1,.88,.7),5)
light('Cool rim',(-4,2,4),1150,(.55,.83,.78),4)
light('Warm edge',(3,3,2.5),1000,(1,.64,.28),3)
light('Fill',(-2,-5,1.8),220,(.7,.85,1),4)
bpy.ops.object.camera_add(location=(4.8,-7.6,4.1));cam=bpy.context.object;cam.name='cinematic_camera'
cam.rotation_euler=(Vector((0,0,1.0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=53;scene.camera=cam
scene.render.film_transparent=False
scene.frame_set(1);bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'seed-bloom.blend'))
for name,q in [('form-a',0),('midpoint',.5),('form-b',1)]:
    scene.frame_set(round(q*180)+1);scene.render.filepath=os.path.join(OUT,name+'.png');bpy.ops.render.render(write_still=True)
json.dump({'blender':bpy.app.version_string,'build_export_and_stills_seconds':time.monotonic()-start,'entity':ENTITY_ID,'mesh_vertices_per_panel':len(v),'mesh_faces_per_panel':len(f)},open(os.path.join(OUT,'build-receipt.json'),'w'),indent=2)

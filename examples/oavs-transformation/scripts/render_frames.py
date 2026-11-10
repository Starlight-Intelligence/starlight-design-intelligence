import bpy,os,sys,time,json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'outputs')
scene=bpy.context.scene
scene.render.resolution_x=960;scene.render.resolution_y=540;scene.cycles.samples=12
scene.render.fps=24;scene.render.image_settings.file_format='PNG'
start=time.monotonic()
os.makedirs(os.path.join(OUT,'frames'),exist_ok=True)
# 145 frames preserve both exact settled endpoints at 24fps over six seconds.
for i in range(145):
    scene.frame_set(int(1+i*180/144//1), subframe=(i*180/144)%1)
    scene.render.filepath=os.path.join(OUT,'frames',f'{i:04d}.png');bpy.ops.render.render(write_still=True)
json.dump({'renderer':'Blender Cycles CPU','frames':145,'resolution':[960,540],'samples':12,'fps':24,'wall_seconds':time.monotonic()-start},open(os.path.join(OUT,'render-receipt.json'),'w'),indent=2)

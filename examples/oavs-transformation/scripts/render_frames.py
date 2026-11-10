import bpy,os,sys,time,json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'outputs')
scene=bpy.context.scene
scene.render.resolution_x=960;scene.render.resolution_y=540;scene.cycles.samples=12
scene.render.fps=24;scene.render.image_settings.file_format='PNG'
start=time.monotonic();rendered=0;skipped=0
os.makedirs(os.path.join(OUT,'frames'),exist_ok=True)
# 145 frames preserve both exact settled endpoints at 24fps over six seconds.
for i in range(145):
    existing=os.path.join(OUT,'frames',f'{i:04d}.png')
    if os.path.isfile(existing):
        with open(existing,'rb') as check:
            check.seek(-12,2)
            if check.read()==b'\x00\x00\x00\x00IEND\xaeB`\x82':
                skipped+=1
                continue
    scene.frame_set(int(1+i*180/144//1), subframe=(i*180/144)%1)
    scene.render.filepath=os.path.join(OUT,'frames',f'{i:04d}.png');bpy.ops.render.render(write_still=True);rendered+=1
json.dump({'renderer':'Blender Cycles CPU','frames':145,'resolution':[960,540],'samples':12,'fps':24,'invocation_wall_seconds':time.monotonic()-start,'rendered_this_invocation':rendered,'skipped_completed_frames':skipped},open(os.path.join(OUT,'render-receipt.json'),'w'),indent=2)

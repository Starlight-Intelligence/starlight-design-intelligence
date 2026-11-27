"""Encode deterministic source frames and a silent, titled evidence cut."""
from pathlib import Path
import subprocess,json,time
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'outputs';start=time.monotonic()
def run(args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*map(str,args)],check=True)
frames=sorted((OUT/'frames').glob('*.png'));assert len(frames)==145,'Require a complete ordered frame sequence'
run(['-framerate','24','-i',OUT/'frames/%04d.png','-vf','hqdn3d=1.5:1.5:4:4','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',OUT/'transformation.mp4'])
# Exact rendered frame order reversal; no synthesized/interpolated frames.
run(['-framerate','24','-i',OUT/'frames/%04d.png','-vf','reverse,hqdn3d=1.5:1.5:4:4','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',OUT/'reverse-transformation.mp4'])
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
filtergraph=(
 '[0:v]scale=960:540,setsar=1,trim=duration=1.5,setpts=PTS-STARTPTS[a];'
 '[1:v]setsar=1,setpts=PTS-STARTPTS[b];'
 '[2:v]scale=960:540,setsar=1,trim=duration=1.5,setpts=PTS-STARTPTS[c];'
 '[3:v]setsar=1,setpts=PTS-STARTPTS[d];'
 '[4:v]scale=960:540,setsar=1,trim=duration=1.5,setpts=PTS-STARTPTS[e];'
 '[a][b][c][d][e]concat=n=5:v=1:a=0,'
 f"drawtext=fontfile={font}:text='STARLIGHT / TRANSFORMATION STUDY':x=32:y=27:fontsize=15:fontcolor=0xe8e7db,"
 f"drawtext=fontfile={font}:text='E-001   |   RIGID LINK CONTINUITY   |   NONCANONICAL':x=32:y=h-35:fontsize=11:fontcolor=0xdbb477[out]"
)
run(['-loop','1','-framerate','24','-i',OUT/'form-a.png','-i',OUT/'transformation.mp4','-loop','1','-framerate','24','-i',OUT/'form-b.png','-i',OUT/'reverse-transformation.mp4','-loop','1','-framerate','24','-i',OUT/'form-a.png','-filter_complex',filtergraph,'-map','[out]','-an','-r','24','-fps_mode','cfr','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',OUT/'Starlight-Transformation-Cinematic.mp4'])
probes={}
for p in ['transformation.mp4','reverse-transformation.mp4','Starlight-Transformation-Cinematic.mp4']:
 r=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=width,height,avg_frame_rate,nb_frames,codec_name','-of','json',str(OUT/p)])
 probes[p]=json.loads(r)
json.dump({'source_frames':145,'source_fps':24,'postprocess':'HQDN3D spatial/temporal denoise, no optical flow or generated frames','audio':'silent','encode_wall_seconds':time.monotonic()-start,'exports':probes},open(OUT/'video-receipt.json','w'),indent=2)
print(json.dumps(probes,indent=2))

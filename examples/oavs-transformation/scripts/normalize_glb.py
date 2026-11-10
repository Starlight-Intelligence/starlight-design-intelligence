"""Normalize frame-one offset and combine Blender's six hinge clips into one clip."""
import json,struct,sys
def normalize(path):
 b=open(path,'rb').read();n=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+n]);data=bytearray(b[28+n:]);seen=set();samplers=[];channels=[]
 for a in g.get('animations',[]):
  offset=len(samplers)
  for s in a['samplers']:
   k=s['input']
   if k not in seen:
    seen.add(k);ac=g['accessors'][k];v=g['bufferViews'][ac['bufferView']];pos=v.get('byteOffset',0)+ac.get('byteOffset',0)
    times=list(struct.unpack_from('<'+'f'*ac['count'],data,pos));start=times[0];times=[t-start for t in times]
    struct.pack_into('<'+'f'*len(times),data,pos,*times);ac['min']=[times[0]];ac['max']=[times[-1]]
   samplers.append(s)
  for c in a['channels']:channels.append({**c,'sampler':c['sampler']+offset})
 g['animations']=[{'name':'seed_to_bloom','samplers':samplers,'channels':channels}]
 j=json.dumps(g,separators=(',',':')).encode();j+=b' '*((-len(j))%4);data+=b'\0'*((-len(data))%4)
 out=struct.pack('<III',0x46546c67,2,12+8+len(j)+8+len(data))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(data),0x004e4942)+data
 open(path,'wb').write(out)
if __name__=='__main__':normalize(sys.argv[1])

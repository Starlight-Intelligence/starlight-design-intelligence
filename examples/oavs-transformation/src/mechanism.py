"""Deterministic rigid-link seed/bloom fixture. Metres, Z-up, radians."""
import math
import numpy as np

ENTITY_ID = 'experimental.oavs.seed-bloom.001'
RADIUS, HEIGHT, LENGTH = .84, .68, 1.5
CLOSED, OPEN = math.radians(-112), math.radians(4)
DURATION = 6.0

def smooth5(x):
    x = max(0., min(1., float(x)))
    return x*x*x*(10+x*(-15+6*x))

def angle(q, i):
    # Opposite pairs share a phase. No detaching, scaling, morphs or topology edits.
    start = (i % 3)*.08
    return CLOSED+(OPEN-CLOSED)*smooth5((q-start)/.84)

def transform(q, i):
    a, t = i*math.tau/6, angle(q, i)
    ca, sa, ct, st = math.cos(a), math.sin(a), math.cos(t), math.sin(t)
    rz = np.array([[ca,-sa,0],[sa,ca,0],[0,0,1.]])
    ry = np.array([[ct,0,st],[0,1,0],[-st,0,ct]])
    m = np.eye(4); m[:3,:3] = rz@ry
    m[:3,3] = [RADIUS*ca, RADIUS*sa, HEIGHT]
    return m

def leaf_mesh(n=24, m=8):
    # A closed, constant-topology ceramic shell; convex radial silhouette.
    verts=[]; faces=[]
    for side in [-1,1]:
        for i in range(n+1):
            u=i/n
            width=.025+.255*math.sin(math.pi*u)**.85
            for j in range(m+1):
                v=2*j/m-1
                verts.append((LENGTH*u, width*v,
                    -.13*math.sin(math.pi*u)+.045*v*v*math.sin(math.pi*u)+side*.025))
    stride=m+1; count=(n+1)*stride
    for s in range(2):
        for i in range(n):
            for j in range(m):
                a=s*count+i*stride+j; b=a+1; c=b+stride; d=a+stride
                faces.append((a,d,c,b) if s==0 else (a,b,c,d))
    for i in range(n):
        for j in [0,m]:
            a=i*stride+j; b=a+stride
            faces.append((a,b,b+count,a+count))
    for i in [0,n]:
        for j in range(m):
            a=i*stride+j; b=a+1
            faces.append((a,a+count,b+count,b))
    return np.array(verts),faces

def world_vertices(q,i):
    v,_=leaf_mesh(); t=transform(q,i)
    return v@t[:3,:3].T+t[:3,3]

def pose(q):
    if not math.isfinite(q) or not 0<=q<=1: raise ValueError('q must be finite in [0,1]')
    return [{'id':f'hinge_{i:02d}','angle':angle(q,i),'matrix':transform(q,i).tolist()} for i in range(6)]

"""Independent verification of the delivered USD against analytic source FK.
Run with the pinned OpenUSD SDK on PYTHONPATH; writes only JSON to stdout.
"""
import hashlib
import json
import math
from pathlib import Path
import struct
import sys

import numpy as np
from pxr import Usd, UsdGeom
from scipy.spatial.transform import Rotation

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src'))
import mechanism

blob = (ROOT / 'outputs/seed-bloom.glb').read_bytes()
json_bytes = struct.unpack_from('<I', blob, 12)[0]
gltf = json.loads(blob[20:20 + json_bytes])
binary = blob[28 + json_bytes:]
parents = {child: parent for parent, node in enumerate(gltf['nodes']) for child in node.get('children', [])}

def accessor(index):
    a = gltf['accessors'][index]
    view = gltf['bufferViews'][a['bufferView']]
    width = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    dtype = {5126: '<f4', 5125: '<u4', 5123: '<u2', 5121: 'u1'}[a['componentType']]
    return np.frombuffer(binary, dtype=dtype, count=a['count'] * width,
        offset=view.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(-1, width)

def local(node):
    matrix = np.eye(4)
    matrix[:3, :3] = Rotation.from_quat(node.get('rotation', [0, 0, 0, 1])).as_matrix() @ np.diag(node.get('scale', [1, 1, 1]))
    matrix[:3, 3] = node.get('translation', [0, 0, 0])
    return matrix

def world(index):
    matrix = local(gltf['nodes'][index])
    return world(parents[index]) @ matrix if index in parents else matrix

core_vertices = []
for index, node in enumerate(gltf['nodes']):
    if not node['name'].startswith('core_') or 'mesh' not in node:
        continue
    matrix = world(index)
    for primitive in gltf['meshes'][node['mesh']]['primitives']:
        vertices = accessor(primitive['attributes']['POSITION'])
        core_vertices.append(vertices @ matrix[:3, :3].T + matrix[:3, 3])
core_radius = float(np.linalg.norm(np.concatenate(core_vertices) - [0, 1.22, 0], axis=1).max())
assert core_radius < .51, 'claimed core enclosing sphere fails actual delivered vertices'

stage = Usd.Stage.Open(str(ROOT / 'outputs/seed-bloom.usda'))
assert stage and UsdGeom.GetStageUpAxis(stage) == 'Y'
assert UsdGeom.GetStageMetersPerUnit(stage) == 1
assert stage.GetTimeCodesPerSecond() == 30
conversion = np.eye(4)
conversion[:3, :3] = [[1, 0, 0], [0, 0, 1], [0, -1, 0]]
max_dense = 0.
max_baked = 0.
comparisons = 0
for index, node in enumerate(gltf['nodes']):
    if not node['name'].startswith('hinge_'):
        continue
    chain = []
    current = index
    while True:
        chain.append(gltf['nodes'][current]['name'].replace('-', '_'))
        current = parents.get(current)
        if current is None:
            break
    prim = stage.GetPrimAtPath('/Entity/' + '/'.join(reversed(chain)))
    assert prim
    joint = int(node['name'][-2:])
    for sample, q in enumerate(np.linspace(0, 1, 1801)):
        actual = np.array(UsdGeom.XformCache(1 + 180 * q).GetLocalToWorldTransform(prim)).T
        expected = conversion @ mechanism.transform(float(q), joint) @ conversion.T
        error = float(np.abs(actual - expected).max())
        max_dense = max(max_dense, error)
        if sample % 10 == 0:
            max_baked = max(max_baked, error)
        comparisons += 1
assert max_dense < 1e-4, f'USD dense matrix error {max_dense}'
assert max_baked < 2e-6, f'USD baked key matrix error {max_baked}'
report = {
    'status': 'PASS',
    'scope': 'Actual delivered USD world transforms versus independent source FK and actual GLB core bound',
    'usd_sha256': hashlib.sha256((ROOT / 'outputs/seed-bloom.usda').read_bytes()).hexdigest(),
    'glb_sha256': hashlib.sha256(blob).hexdigest(),
    'joint_count': 6,
    'q_samples_per_joint': 1801,
    'comparisons': comparisons,
    'dense_max_world_matrix_error': max_dense,
    'baked_key_max_world_matrix_error': max_baked,
    'actual_core_vertex_radius_m': core_radius,
    'qualified_core_envelope_radius_m': .51,
    'browser_rendering': 'unverified',
    'physical_mechanism': 'not certified',
}
print(json.dumps(report, indent=2))

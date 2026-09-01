"""Build optimized sprout.glb from base.obj for the hero 3D viewer."""
from __future__ import annotations

import os
import sys

import trimesh

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'site', 'assets', 'sprout-model', 'base.obj')
OUT = os.path.join(ROOT, 'site', 'assets', 'sprout-model', 'sprout.glb')
TARGET_FACES = 12000


def main() -> None:
    if not os.path.exists(SRC):
        raise SystemExit(f'Missing source model: {SRC}')

    print('Loading OBJ…')
    mesh = trimesh.load(SRC, force='mesh', process=False)
    print(f'  {len(mesh.vertices):,} vertices, {len(mesh.faces):,} faces')

    if len(mesh.faces) > TARGET_FACES:
        print(f'Simplifying to {TARGET_FACES:,} faces…')
        mesh = mesh.simplify_quadric_decimation(face_count=TARGET_FACES)

    bb = mesh.bounds
    center = (bb[0] + bb[1]) / 2
    mesh.apply_translation([-center[0], -bb[0][1], -center[2]])

    print('Exporting GLB…')
    mesh.export(OUT)
    size_kb = os.path.getsize(OUT) / 1024
    print(f'Done: {OUT} ({size_kb:.0f} KB, {len(mesh.vertices):,} verts, {len(mesh.faces):,} faces)')


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'Error: {exc}', file=sys.stderr)
        raise

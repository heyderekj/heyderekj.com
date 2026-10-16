"""
Renders the 404 game's Connect Four chips (src/client/four.ts) in Blender:
  /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/four-chips/chips.py
Writes public/images/four/chip-orange.png and chip-ink.png (512px, transparent; the site uses
192px WebP copies of them), a checker seen
face-on: a glossy plastic disc with a raised rim and two ridges inside, lit from the top left.
"""
import bpy, math, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'public', 'images', 'four')
os.makedirs(OUT, exist_ok=True)

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1,)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = 512
scene.view_settings.view_transform = 'Standard'

# The chip: a beveled disc, a raised rim and two concentric ridges on its face
def add(op, **kw):
    op(**kw); return bpy.context.active_object
disc = add(bpy.ops.mesh.primitive_cylinder_add, vertices=128, radius=1.0, depth=0.22, location=(0, 0, 0))
bev = disc.modifiers.new('bevel', 'BEVEL'); bev.width = 0.06; bev.segments = 6
bpy.ops.object.shade_smooth()
parts = [disc]
for r, minor, z in [(0.9, 0.075, 0.11), (0.66, 0.03, 0.1), (0.44, 0.025, 0.1)]:
    t = add(bpy.ops.mesh.primitive_torus_add, major_radius=r, minor_radius=minor, major_segments=160, minor_segments=24, location=(0, 0, z))
    bpy.ops.object.shade_smooth(); parts.append(t)
for p in parts: p.select_set(True)
bpy.context.view_layer.objects.active = disc
bpy.ops.object.join()
chip = bpy.context.active_object

mat = bpy.data.materials.new('plastic'); mat.use_nodes = True
bsdf = mat.node_tree.nodes['Principled BSDF']
bsdf.inputs['Roughness'].default_value = 0.28
for name in ('Coat Weight', 'Clearcoat'):
    if name in bsdf.inputs: bsdf.inputs[name].default_value = 0.6
chip.data.materials.append(mat)

# Camera straight on, lights from the top left like the rest of the site
cam = add(bpy.ops.object.camera_add, location=(0, 0, 6), rotation=(0, 0, 0))
cam.data.type = 'ORTHO'; cam.data.ortho_scale = 2.32; scene.camera = cam
key = add(bpy.ops.object.light_add, type='AREA', location=(-3, 3, 5)); key.data.energy = 600; key.data.size = 3
key.rotation_euler = (math.radians(-30), math.radians(-30), 0)
fill = add(bpy.ops.object.light_add, type='AREA', location=(3, -2, 4)); fill.data.energy = 140; fill.data.size = 4
fill.rotation_euler = (math.radians(25), math.radians(30), 0)
world = bpy.data.worlds.new('w'); scene.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.6, 0.6, 0.6, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6

for name, color in (('orange', '#ea580c'), ('ink', '#1c1b19')):
    bsdf.inputs['Base Color'].default_value = srgb(color)
    scene.render.filepath = os.path.join(OUT, f'chip-{name}.png')
    bpy.ops.render.render(write_still=True)
    print('wrote', scene.render.filepath)

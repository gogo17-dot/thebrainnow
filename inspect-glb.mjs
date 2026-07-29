import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const glbDir = path.join(root, 'public', 'brainstem_glb');
const loader = new GLTFLoader();

const files = [
  'Culmen.glb',
  'Dentate_nucleus.glb',
  'Interposed_nucleus.glb',
  'Fastigial_nucleus.glb',
  'Superior_cerebellar_peduncle.glb',
];

function bboxCenter(file) {
  return new Promise((resolve, reject) => {
    loader.load(
      path.join(glbDir, file),
      (gltf) => {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        resolve({ file, center, size, pos: gltf.scene.position.toArray() });
      },
      undefined,
      reject,
    );
  });
}

for (const file of files) {
  const r = await bboxCenter(file);
  console.log(
    `${r.file}: center=(${r.center.x.toFixed(4)}, ${r.center.y.toFixed(4)}, ${r.center.z.toFixed(4)}) size=(${r.size.x.toFixed(4)}, ${r.size.y.toFixed(4)}, ${r.size.z.toFixed(4)})`,
  );
}

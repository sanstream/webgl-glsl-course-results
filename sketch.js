// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");

const settings = {
  // Make the loop animated
  animate: true,
  scaleToView: true,
  // pixelsPerInch: 300,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3()); // the origin of the world

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1, 32, 16);

  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load('earth.jpg')
  const moonTexture = textureLoader.load('moon.jpg')
  // Setup a material
  const material = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.2,
    map: texture,
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const moonGroup = new THREE.Group()
  // Setup a mesh with geometry + material
  const moonMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.7,
    metalness: 0.2,
    map: moonTexture,
  })
  const moonMesh = new THREE.Mesh(geometry, moonMaterial);
  moonMesh.position.set(2, 0, 2)
  moonMesh.scale.setScalar(0.25)
  moonGroup.add(moonMesh);
  scene.add(moonGroup);

  const light = new THREE.PointLight('white', 1)
  light.position.set(3,3,3)
  scene.add(light)


  scene.add(new THREE.PointLightHelper(light, 0.15))
  scene.add(new THREE.GridHelper(5, 15))
  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      mesh.rotation.y = time * 0.5
      moonMesh.rotation.y = time * (0.075 / 2)
      moonGroup.rotation.y = time * 0.075
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);

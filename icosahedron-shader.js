// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

const canvasSketch = require("canvas-sketch");
const glsl = require('glslify')

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor('black', 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  // Setup a geometry
  const geometry = new THREE.SphereGeometry(1,32, 16);

  const baseGeom = new THREE.IcosahedronGeometry(1, 1);

  const circleGeom = new THREE.CircleGeometry(1, 32)

  const positions = baseGeom.attributes["position"].array; // flattened Float32Array
  const ptCout = positions.length / 3;
  const points = []
  for (let i = 0; i < ptCout; i++) {
    points.push(new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]))
  }
  console.log(points)

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main () {
      vUv = uv; // provided by THREE.js
      vPosition = position; // provided by THREE.js
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }
  `;

  const fragmentShader =glsl( /* glsl */ `
    #pragma glslify: noise = require('glsl-noise/simplex/3d');

    varying vec2 vUv;
    varying vec3 vPosition;
    uniform vec3 color;
    uniform float time;

    uniform vec3 points[POINT_COUNT]; // POINT_COUNT is defined in material below

    void main () {
      float dist = 100000.0;
      // figure out the closets point to vPosition:
      for (int i = 0; i < POINT_COUNT; i++) {
        vec3 point = points[i];
        float relativeDistance = distance(vPosition, point);
        // determine which of the parameters is the smallest (minimal) number:
        dist = min(relativeDistance, dist);
      }

      float maskedArea = 1.0 - step(0.15, dist);

      vec3 fragColor = mix(color, vec3(1.0, 0.9, 0.0), maskedArea);

      gl_FragColor = vec4(vec3(fragColor), 1.0);
    }
  `)
  // Setup a material
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: {
      POINT_COUNT: points.length,
    },
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib['lights'],
      {
        points: {value: points },
        color: {
          value: new THREE.Color('aliceblue'),
        },
        time: { value: 0 },
      },
    ]),
    lights: true
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const light = new THREE.PointLight('white', 1)
  light.position.set(3,3,3)
  scene.add(light)
  scene.add(new THREE.PointLightHelper(light, 0.15))


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
      material.uniforms.time.value = time
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

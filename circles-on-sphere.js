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
  renderer.setClearColor("#111", 1);

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
  for (let i = 0; i < ptCout; i++)
  {
      let point = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      const mesh = new THREE.Mesh(
        circleGeom,
        new THREE.MeshBasicMaterial({
          color: 'green',
          wireframe: true,
          side: THREE.DoubleSide,
        })
      )
      mesh.position.copy(point)
      mesh.scale.setScalar(0.1)
      mesh.lookAt(new THREE.Vector3())
      scene.add(mesh)
  }
  // points.forEach(point => {
  //   const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
  //     color: 'green',
  //     wireframe: true,
  //   }))
  //   scene.add(mesh)
  // })

  const vertexShader = /* glsl */ `
    varying vec2 vUv;

    void main () {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xyz, 1.0);
    }
  `;

  const fragmentShader =glsl( /* glsl */ `
    #pragma glslify: noise = require('glsl-noise/simplex/3d');

    varying vec2 vUv;
    uniform vec3 color;
    uniform float time;

    void main () {
      vec2 center = vec2(0.5, 0.5);
      vec2 q = vUv;
      q.x = q.x * 2.2;
      vec2 position = mod(q * 10.0, 1.0); // same as (vUv * 8) % 1
      float d = distance(position, center);
      // float mask = step(0.1 + sin(time + vUv.x * 10.0) * 0.1, d);
      vec2 noiseInput = floor(q * 10.0);
      float offset = noise(vec3(noiseInput.xy * 0.5, time)) * 0.25;
      float mask = step(0.25 + offset, d);
      mask = 1.0 - mask;

      vec3 fragColor = mix(color, vec3(0.9, 0.7, 0.1), mask);
      gl_FragColor = vec4(vec3(fragColor), 1.0);
    }
  `)
  // Setup a material
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      color: {
        value: new THREE.Color('hotpink'),
      },
      time: { value: 0 },
    }
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // const light = new THREE.PointLight('white', 1)
  // light.position.set(3,3,3)
  // scene.add(light)
  // scene.add(new THREE.PointLightHelper(light, 0.15))


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

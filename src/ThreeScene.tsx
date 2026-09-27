import { useEffect, useRef } from "react";
import * as THREE from "three";

const RIM_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const RIM_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  void main() {
    float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0), 2.25);
    float pulse = 0.78 + 0.22 * sin(uTime * 0.8 + vNormal.y * 8.0);
    float alpha = rim * pulse * 0.48;
    gl_FragColor = vec4(uColor * rim * pulse, alpha);
  }
`;

const PARTICLE_VERTEX_SHADER = `
  attribute float aSize;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vTwinkle;
  uniform float uTime;
  uniform float uPixelRatio;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vColor = color;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.15 + aPhase);
    gl_PointSize = clamp(aSize * uPixelRatio * (20.0 / max(1.0, -viewPosition.z)), 1.0, 5.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const PARTICLE_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float glow = 1.0 - smoothstep(0.08, 0.5, distanceToCenter);
    gl_FragColor = vec4(vColor * (0.72 + vTwinkle * 0.8), glow * vTwinkle * 0.78);
  }
`;

type Satellite = {
  mesh?: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  orbit: number;
  tilt: number;
  speed: number;
  phase: number;
};

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0, 7.7);

    const isCompact = window.matchMedia("(max-width: 620px)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isCompact,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      mount.dataset.webgl = "unavailable";
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompact ? 1.25 : 1.7));
    mount.appendChild(renderer.domElement);

    const lime = new THREE.Color("#c1f36b");
    const ice = new THREE.Color("#8bd5de");
    const pale = new THREE.Color("#edf5cf");

    const stage = new THREE.Group();
    stage.position.set(1.55, 0.04, 0);
    scene.add(stage);

    const core = new THREE.Group();
    stage.add(core);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 2),
      new THREE.MeshBasicMaterial({
        color: lime,
        wireframe: true,
        transparent: true,
        opacity: 0.19,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    core.add(shell);

    const innerShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.18, 1),
      new THREE.MeshBasicMaterial({
        color: ice,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    innerShell.rotation.set(0.4, 0.2, 0.7);
    core.add(innerShell);

    const auraMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#a9ee83") },
        uTime: { value: 0 },
      },
      vertexShader: RIM_VERTEX_SHADER,
      fragmentShader: RIM_FRAGMENT_SHADER,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    core.add(new THREE.Mesh(new THREE.SphereGeometry(1.27, 48, 48), auraMaterial));

    const nucleus = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.34, 1),
      new THREE.MeshBasicMaterial({
        color: pale,
        wireframe: true,
        transparent: true,
        opacity: 0.58,
        blending: THREE.AdditiveBlending,
      }),
    );
    core.add(nucleus);
    core.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 20, 20),
        new THREE.MeshBasicMaterial({ color: pale, toneMapped: false }),
      ),
    );

    const orbitalGroup = new THREE.Group();
    stage.add(orbitalGroup);
    const makeOrbit = (radius: number, tube: number, color: THREE.Color, opacity: number) =>
      new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 6, 180),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );

    const orbitA = makeOrbit(2.05, 0.009, lime, 0.55);
    orbitA.rotation.set(1.15, -0.28, 0.18);
    orbitalGroup.add(orbitA);
    const orbitB = makeOrbit(2.42, 0.006, ice, 0.34);
    orbitB.rotation.set(0.46, 0.92, -0.58);
    orbitalGroup.add(orbitB);
    const orbitC = makeOrbit(1.78, 0.004, pale, 0.24);
    orbitC.rotation.set(0.08, -0.85, 1.05);
    orbitalGroup.add(orbitC);

    const tickPositions: number[] = [];
    for (let index = 0; index < 96; index += 1) {
      const angle = (index / 96) * Math.PI * 2;
      const outer = index % 4 === 0 ? 2.59 : 2.53;
      tickPositions.push(
        Math.cos(angle) * 2.45,
        Math.sin(angle) * 2.45,
        0,
        Math.cos(angle) * outer,
        Math.sin(angle) * outer,
        0,
      );
    }
    const tickGeometry = new THREE.BufferGeometry();
    tickGeometry.setAttribute("position", new THREE.Float32BufferAttribute(tickPositions, 3));
    const ticks = new THREE.LineSegments(
      tickGeometry,
      new THREE.LineBasicMaterial({
        color: lime,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      }),
    );
    ticks.rotation.set(1.15, -0.28, 0.18);
    orbitalGroup.add(ticks);

    const satellites: Satellite[] = [
      { orbit: 2.05, tilt: 1.15, speed: 0.36, phase: 0.25 },
      { orbit: 2.42, tilt: 0.46, speed: -0.24, phase: 2.5 },
      { orbit: 1.78, tilt: 0.08, speed: 0.52, phase: 4.2 },
    ];
    satellites.forEach((satellite, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: index === 1 ? ice : lime,
        toneMapped: false,
      });
      const radius = index === 1 ? 0.055 : 0.042;
      satellite.mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), material);
      orbitalGroup.add(satellite.mesh);
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 1.9, 0.005, 4, 28),
        new THREE.MeshBasicMaterial({
          color: material.color,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        }),
      );
      satellite.mesh.add(halo);
    });

    const particleCount = window.matchMedia("(max-width: 620px)").matches ? 620 : 1180;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      const offset = index * 3;
      positions[offset] = (Math.random() - 0.5) * 13;
      positions[offset + 1] = (Math.random() - 0.5) * 9;
      positions[offset + 2] = (Math.random() - 0.5) * 9;

      const color = Math.random() > 0.79 ? ice : Math.random() > 0.48 ? lime : pale;
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
      sizes[index] = 0.6 + Math.random() * 1.8;
      phases[index] = Math.random() * Math.PI * 2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, isCompact ? 1.25 : 1.7) },
      },
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const stars = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(stars);

    const grid = new THREE.GridHelper(16, 32, 0x94bd63, 0x35402c);
    grid.position.set(1.4, -3.15, -1.2);
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.13;
    gridMaterial.depthWrite = false;
    scene.add(grid);

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const startTime = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let isVisible = true;

    const handlePointerMove = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      const ratio = Math.min(window.devicePixelRatio, window.matchMedia("(max-width: 620px)").matches ? 1.25 : 1.7);
      renderer.setPixelRatio(ratio);
      particleMaterial.uniforms.uPixelRatio.value = ratio;
      if (width / height < 0.9) {
        stage.position.x = 0.3;
        stage.scale.setScalar(0.83);
      } else {
        stage.position.x = 1.55;
        stage.scale.setScalar(1);
      }
      renderFrame(performance.now());
    };

    const renderFrame = (now: number) => {
      const time = (now - startTime) * 0.001;
      mouse.x += (target.x - mouse.x) * 0.035;
      mouse.y += (target.y - mouse.y) * 0.035;

      core.rotation.set(mouse.y * 0.13 + time * 0.055, mouse.x * 0.16 + time * 0.09, time * 0.025);
      shell.rotation.set(time * 0.08, time * 0.12, time * 0.035);
      innerShell.rotation.set(0.4 + time * 0.12, 0.2 - time * 0.16, 0.7 + time * 0.07);
      nucleus.rotation.set(time * 0.22, -time * 0.31, time * 0.16);
      orbitalGroup.rotation.set(mouse.y * 0.035, time * 0.035 + mouse.x * 0.05, time * -0.018);
      stars.rotation.y = time * 0.008;
      particleMaterial.uniforms.uTime.value = time;
      auraMaterial.uniforms.uTime.value = time;

      camera.position.x += (mouse.x * 0.17 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.12 - camera.position.y) * 0.025;
      camera.position.z += (7.7 + Math.min(window.scrollY / window.innerHeight, 2) * 0.12 - camera.position.z) * 0.025;
      camera.lookAt(0.45, 0, 0);

      satellites.forEach((satellite) => {
        if (!satellite.mesh) return;
        const angle = time * satellite.speed + satellite.phase;
        satellite.mesh.position.set(
          Math.cos(angle) * satellite.orbit,
          Math.sin(angle) * satellite.orbit * Math.cos(satellite.tilt),
          Math.sin(angle) * satellite.orbit * Math.sin(satellite.tilt),
        );
      });

      renderer.render(scene, camera);
    };

    const animate = (now: number) => {
      frameId = 0;
      if (!isVisible || document.hidden) return;
      renderFrame(now);
      if (!reducedMotion.matches) frameId = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const startAnimation = () => {
      if (!isVisible || document.hidden || frameId) return;
      if (reducedMotion.matches) {
        renderFrame(performance.now());
        return;
      }
      frameId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation();
      else startAnimation();
    };
    const handleMotionPreference = () => {
      stopAnimation();
      startAnimation();
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) startAnimation();
      else stopAnimation();
    });
    visibilityObserver.observe(mount);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", handleMotionPreference);
    resize();
    startAnimation();

    return () => {
      stopAnimation();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotion.removeEventListener("change", handleMotionPreference);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}

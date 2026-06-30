// Prototype "Hidden Globe" — Three.js scene logic, kept separate from
// GlobeOverlay.astro so the heavy WebGL code only ever loads via the
// dynamic import that fires when the overlay actually opens.
import * as THREE from 'three';
import type { RouteStop } from '../data/globeRoute';

const GLOBE_RADIUS = 2;
const SECONDS_PER_STOP = 3.5;
const AUTO_ROTATE_DAMPING = 0.02;
const CLOUD_ROTATE_SPEED = 0.015;

// Derived directly from SphereGeometry's vertex formula (uv stored as
// (u, 1-v)) composed with Texture's default flipY=true, then verified
// against real pixel samples of the actual texture file at known
// landmarks (Sahara, Australia) before trusting it here.
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  const phi = u * 2 * Math.PI;
  const theta = v * Math.PI;
  return new THREE.Vector3(
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export interface GlobeSceneOptions {
  canvas: HTMLCanvasElement;
  route: RouteStop[];
  reducedMotion: boolean;
  onStopChange: (index: number) => void;
}

export interface GlobeScene {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  resize: () => void;
}

export async function createGlobeScene({
  canvas,
  route,
  reducedMotion,
  onStopChange,
}: GlobeSceneOptions): Promise<GlobeScene> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Starfield — cheap, but does a lot of work for the "cinematic, dark" feel
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 1200;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 1) {
    starPositions[i] = (Math.random() - 0.5) * 60;
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, sizeAttenuation: true })
  );
  scene.add(stars);

  scene.add(new THREE.AmbientLight(0x404040, 1.4));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const textureLoader = new THREE.TextureLoader();
  const [dayMap, specularMap, cloudsMap] = await Promise.all([
    textureLoader.loadAsync('/textures/earth/earth-day.jpg'),
    textureLoader.loadAsync('/textures/earth/earth-specular.jpg'),
    textureLoader.loadAsync('/textures/earth/earth-clouds.png'),
  ]);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64),
    new THREE.MeshPhongMaterial({
      map: dayMap,
      specularMap,
      specular: new THREE.Color(0x333333),
      shininess: 8,
    })
  );
  globeGroup.add(earth);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.01, 64, 64),
    new THREE.MeshPhongMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  globeGroup.add(clouds);

  // Flight path: a smooth curve through every stop, sampled into a dashed line
  const pathPoints = route.map((stop) => latLonToVector3(stop.lat, stop.lon, GLOBE_RADIUS * 1.01));
  const curve = new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', 0.15);
  const sampled = curve.getPoints(pathPoints.length * 12);
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(sampled);
  const pathLine = new THREE.Line(
    pathGeometry,
    new THREE.LineDashedMaterial({
      color: 0xf2efe8,
      dashSize: 0.04,
      gapSize: 0.03,
      transparent: true,
      opacity: 0.7,
    })
  );
  pathLine.computeLineDistances();
  globeGroup.add(pathLine);

  // One marker per stop; the current stop gets a brighter, larger, pulsing dot
  const markerGeometry = new THREE.SphereGeometry(0.018, 12, 12);
  const idleMaterial = new THREE.MeshBasicMaterial({ color: 0xb9b6ad });
  const activeMaterial = new THREE.MeshBasicMaterial({ color: 0xf2efe8 });
  const markers = pathPoints.map((point) => {
    const marker = new THREE.Mesh(markerGeometry, idleMaterial);
    marker.position.copy(point);
    globeGroup.add(marker);
    return marker;
  });

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  }

  // Manual drag-to-rotate / wheel-to-zoom — pauses auto-follow while in use
  let userInteracting = false;
  let pointerId: number | null = null;
  let lastX = 0;
  let lastY = 0;

  function onPointerDown(event: PointerEvent) {
    userInteracting = true;
    pointerId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent) {
    if (!userInteracting || event.pointerId !== pointerId) return;
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    globeGroup.rotation.y += deltaX * 0.005;
    globeGroup.rotation.x += deltaY * 0.005;
    globeGroup.rotation.x = Math.max(-1.2, Math.min(1.2, globeGroup.rotation.x));
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== pointerId) return;
    userInteracting = false;
    pointerId = null;
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    camera.position.z = Math.max(3.2, Math.min(10, camera.position.z + event.deltaY * 0.003));
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  let currentIndex = 0;
  let stopElapsed = 0;
  let lastFrameTime = performance.now();
  let frameId = 0;
  let running = false;

  function targetQuaternionFor(index: number): THREE.Quaternion {
    // Rotates the stop's surface normal onto +Z, bringing it to face the camera.
    const point = pathPoints[index].clone().normalize();
    const targetNormal = new THREE.Vector3(0, 0, 1);
    return new THREE.Quaternion().setFromUnitVectors(point, targetNormal);
  }

  function tick() {
    frameId = requestAnimationFrame(tick);
    const now = performance.now();
    const delta = (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    if (!reducedMotion) {
      clouds.rotation.y += CLOUD_ROTATE_SPEED * delta;

      if (!userInteracting) {
        stopElapsed += delta;
        if (stopElapsed >= SECONDS_PER_STOP) {
          stopElapsed = 0;
          currentIndex = (currentIndex + 1) % route.length;
          onStopChange(currentIndex);
          markers.forEach((marker, i) => {
            marker.material = i === currentIndex ? activeMaterial : idleMaterial;
            marker.scale.setScalar(i === currentIndex ? 1.8 : 1);
          });
        }

        const target = targetQuaternionFor(currentIndex);
        globeGroup.quaternion.slerp(target, AUTO_ROTATE_DAMPING);

        // Gentle pulse on the active marker
        const pulse = 1.6 + Math.sin(now * 0.005) * 0.3;
        markers[currentIndex].scale.setScalar(pulse);
      }
    }

    renderer.render(scene, camera);
  }

  // Reduced motion: settle on the first stop immediately, no continuous spin
  if (reducedMotion) {
    markers[0].material = activeMaterial;
    markers[0].scale.setScalar(1.6);
    globeGroup.quaternion.copy(targetQuaternionFor(0));
    onStopChange(0);
  }

  return {
    start() {
      if (running) return;
      running = true;
      lastFrameTime = performance.now();
      tick();
    },
    stop() {
      running = false;
      cancelAnimationFrame(frameId);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(frameId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      pathGeometry.dispose();
      markerGeometry.dispose();
      idleMaterial.dispose();
      activeMaterial.dispose();
      earth.geometry.dispose();
      (earth.material as THREE.Material).dispose();
      clouds.geometry.dispose();
      (clouds.material as THREE.Material).dispose();
      dayMap.dispose();
      specularMap.dispose();
      cloudsMap.dispose();
      starGeometry.dispose();
      (stars.material as THREE.Material).dispose();
      renderer.dispose();
    },
    resize,
  };
}

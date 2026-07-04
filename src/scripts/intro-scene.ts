// First-visit cinematic intro — "The Line".
//
// One point of light draws the whole journey as a single hairline, faintly
// revealing slate terrain as it passes, then the camera pulls back, the full
// route bows with a whisper of globe curvature, and the line is pulled taut
// into the hero's rule while the homepage develops through beneath it.
//
// Canvas 2D on purpose: the entire piece is a polyline, a faux bloom, and a
// masked terrain reveal. Pulling Three.js into first page load would cost far
// more than it buys — that stays lazy inside the hidden-globe overlay.
//
// Everything is parameterised by a single timeline clock `t`, never by
// per-frame physics, so "skip" can compress time without breaking anything.

import type { RouteStop } from '../data/globeRoute';

export interface IntroSceneOptions {
  canvas: HTMLCanvasElement;
  route: RouteStop[];
  /** Reduced-motion variant: hold the finished composition, then fade. */
  staticOnly: boolean;
  /** Where the line docks — measured from the live hero rule at dock time. */
  getDockRect: () => DOMRect | null;
  /** Fires once when the dock begins (homepage should start developing in). */
  onDockStart: () => void;
  /** Fires once when the grain hand-off ends (overlay can be removed). */
  onFinished: () => void;
}

export interface IntroScene {
  start: () => void;
  skip: () => void;
  destroy: () => void;
}

// ---- Timeline (seconds) ----------------------------------------------------
// Only the opening beat is fixed. The travel beat's length is derived from
// the route data — a movement budget plus the sum of each stop's readable
// dwell — and every later beat is anchored to wherever travel ends, so
// adding a country (or lengthening a pause) re-times the whole film.
const BREATHE_END = 1.5; // stillness; the light fades in and breathes
const MOVE_SECONDS = 4.5; // total time actually in motion across the journey
const REVEAL_SECONDS = 1.4; // pull-back; curvature; terrain forgotten
const HOLD_SECONDS = 0.65; // the whole journey holds alone
const DOCK_TAUT = 0.65; // how long the taut-pull takes
const DEVELOP_DELAY = 0.4; // after the dock starts, when the photo begins
const DEVELOP_SECONDS = 0.9; // the photograph developing through
const TAIL_SECONDS = 1.45; // film grain lingering over the page
const SKIP_COMPRESS = 0.7; // a skip plays the remaining film in this long

// ---- Rhythm ----------------------------------------------------------------
// Leg duration ∝ √km, with overland legs slowed 1.6× per unit — flights
// sprint (each big ocean crossing gets a readable ~half-second sweep, not a
// teleport) while land travel ambles between the hesitations.
const FLIGHT_KM = 1200; // legs longer than this read as flights
const LAND_DRAG = 1.6;
const TRAIL_BRIGHT_SECONDS = 2; // the freshest trail stays at full intensity
const AFTERGLOW_SECONDS = 1.5; // terrain fades back to dark after the light

// ---- Palette (mirrors global.css tokens; canvas can't read custom props) ---
const BG = '#0c0c0d';
const CORE = '237, 232, 224'; // warm bone — the line itself
const HALO = '201, 194, 182'; // cooler falloff for the faux bloom
const SLATE: [number, number, number] = [56, 60, 65]; // terrain land tint
const COAST: [number, number, number] = [134, 138, 142]; // etched coastline edge

// ---- Terrain source --------------------------------------------------------
// The land/sea mask already shipped for the hidden globe. Loaded lazily; if
// it hasn't arrived by the time the light starts moving, the terrain simply
// joins in when ready — the line never waits for it.
const TEXTURE_URL = '/textures/earth/earth-specular.jpg';
const MAP_PPD = 6; // map-space pixels per degree for the terrain/reveal pair

// ---- Small helpers ----------------------------------------------------------
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

function easeInOutCubic(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

// Inverse of easeInOutSine — used to timestamp path samples so the trail's
// per-segment ages stay exact even though each leg is eased. Sine (not
// cubic) per leg: the light flows through the journey instead of pulsing.
function easeInOutSineInv(v: number): number {
  return Math.acos(1 - 2 * clamp(v, 0, 1)) / Math.PI;
}

// Inverse smoothstep: steep at the edges, nearly flat through the middle.
// Used to re-time the corner arc inside a dwell window — the light banks in
// fast, hovers almost still while the place name reads, and banks out fast.
function invSmoothstep(u: number): number {
  return 0.5 - Math.sin(Math.asin(1 - 2 * clamp(u, 0, 1)) / 3);
}

function smoothstep(edge0: number, edge1: number, v: number): number {
  const p = clamp((v - edge0) / (edge1 - edge0), 0, 1);
  return p * p * (3 - 2 * p);
}

const RAD = Math.PI / 180;

function toUnitVec(lat: number, lon: number): [number, number, number] {
  const phi = lat * RAD;
  const lam = lon * RAD;
  return [Math.cos(phi) * Math.cos(lam), Math.cos(phi) * Math.sin(lam), Math.sin(phi)];
}

function haversineKm(a: RouteStop, b: RouteStop): number {
  const va = toUnitVec(a.lat, a.lon);
  const vb = toUnitVec(b.lat, b.lon);
  const dot = clamp(va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2], -1, 1);
  return Math.acos(dot) * 6371;
}

// ---- Path model --------------------------------------------------------------
// Great-circle samples through every stop, each stamped with the moment the
// travelling light passes it and its normalised arc position (for the taut
// morph). Longitudes are unwrapped monotonically eastward so map-space x is
// continuous across the antimeridian (Australia → America).

interface PathSample {
  lon: number; // unwrapped degrees
  lat: number;
  time: number; // timeline seconds at which the light passes this sample
  s: number; // normalised cumulative arc length, 0 at Amsterdam, 1 at the end
}

interface StopEvent {
  label: string;
  lon: number; // where the light actually hovers (the corner's rounded apex)
  lat: number;
  arrive: number;
  depart: number;
}

interface JourneyPath {
  samples: PathSample[];
  stops: StopEvent[];
  travelEnd: number;
}

function buildPath(route: RouteStop[]): JourneyPath {
  // Unwrap stop longitudes relative to the previous stop.
  const lons: number[] = [];
  route.forEach((stop, i) => {
    if (i === 0) {
      lons.push(stop.lon);
      return;
    }
    const prev = lons[i - 1];
    lons.push(stop.lon + 360 * Math.round((prev - stop.lon) / 360));
  });

  // Dwell schedule: how long the light hovers at each stop while its name
  // reads. Only the first stop's dwell is folded into the breathe beat.
  const dwells = route.map((stop, i) => (i === 0 ? 0 : (stop.dwellMs ?? 700) / 1000));

  // Leg durations: flights sprint (strongly sublinear in distance), land
  // legs amble. Normalised so total in-motion time is exactly MOVE_SECONDS.
  const legKm: number[] = [];
  const legWeight: number[] = [];
  for (let i = 0; i < route.length - 1; i += 1) {
    const km = Math.max(1, haversineKm(route[i], route[i + 1]));
    legKm.push(km);
    legWeight.push(Math.sqrt(km) * (km > FLIGHT_KM ? 1 : LAND_DRAG));
  }
  const weightSum = legWeight.reduce((sum, w) => sum + w, 0);
  const moveTotal = MOVE_SECONDS;

  const samples: PathSample[] = [];
  const arrivals: number[] = [0];
  let cursor = BREATHE_END;

  for (let i = 0; i < route.length - 1; i += 1) {
    // The dwell is a gap in the schedule, not a frozen sample: after
    // smoothing, the corner's rounded arc inherits the gap's timestamps, so
    // the light banks slowly *through* each city during its hesitation
    // rather than stopping dead. (A duplicated "pin" sample here would also
    // anchor Chaikin's limit curve and keep every corner sharp.)
    const depart = cursor + dwells[i];
    const duration = (legWeight[i] / weightSum) * moveTotal;

    const va = toUnitVec(route[i].lat, route[i].lon);
    const vb = toUnitVec(route[i + 1].lat, route[i + 1].lon);
    const dot = clamp(va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2], -1, 1);
    const omega = Math.acos(dot);
    // Deliberately coarse: Chaikin's rounding radius is bounded by segment
    // length, so sparse base samples are what let the line *bank* through a
    // stop instead of ricocheting off it. Three smoothing passes re-densify.
    const count = clamp(Math.round(legKm[i] / 500), 3, 32);

    // k = 0 duplicates the previous leg's endpoint; skip it after the first leg.
    const kStart = i === 0 ? 0 : 1;
    let prevLon = i === 0 ? lons[0] : samples[samples.length - 1].lon;

    for (let k = kStart; k <= count; k += 1) {
      const f = k / count;
      let lat: number;
      let lonRaw: number;
      if (omega < 1e-6) {
        lat = route[i].lat;
        lonRaw = route[i].lon;
      } else {
        const wa = Math.sin((1 - f) * omega) / Math.sin(omega);
        const wb = Math.sin(f * omega) / Math.sin(omega);
        const x = wa * va[0] + wb * vb[0];
        const y = wa * va[1] + wb * vb[1];
        const z = wa * va[2] + wb * vb[2];
        lat = Math.asin(clamp(z, -1, 1)) / RAD;
        lonRaw = Math.atan2(y, x) / RAD;
      }
      const lon = lonRaw + 360 * Math.round((prevLon - lonRaw) / 360);
      prevLon = lon;
      samples.push({ lon, lat, time: depart + duration * easeInOutSineInv(f), s: 0 });
    }

    cursor = depart + duration;
    arrivals.push(cursor);
  }
  const travelEnd = cursor + dwells[route.length - 1];

  // Round the hard corners at each stop (Chaikin corner-cutting) so the line
  // banks through cities instead of ricocheting off them. Times interpolate
  // with the geometry, so the trail's age gradient stays exact.
  const smoothed = chaikin(chaikin(chaikin(samples)));

  // The dwell gap's timestamps land on the corner's rounded arc; re-time
  // them so the light genuinely hovers at the stop instead of drifting
  // through it for the whole pause.
  for (let i = 1; i < route.length; i += 1) {
    const arrive = arrivals[i];
    const dwell = dwells[i];
    if (dwell <= 0) continue;
    for (const sample of smoothed) {
      if (sample.time > arrive && sample.time < arrive + dwell) {
        sample.time = arrive + dwell * invSmoothstep((sample.time - arrive) / dwell);
      }
    }
  }

  // Normalised arc length for the taut morph.
  let total = 0;
  for (let i = 1; i < smoothed.length; i += 1) {
    const dx = smoothed[i].lon - smoothed[i - 1].lon;
    const dy = smoothed[i].lat - smoothed[i - 1].lat;
    total += Math.hypot(dx, dy);
  }
  let acc = 0;
  smoothed[0].s = 0;
  for (let i = 1; i < smoothed.length; i += 1) {
    const dx = smoothed[i].lon - smoothed[i - 1].lon;
    const dy = smoothed[i].lat - smoothed[i - 1].lat;
    acc += Math.hypot(dx, dy);
    smoothed[i].s = acc / Math.max(total, 1e-9);
  }

  // Each name anchors to the point the light actually hovers over — the
  // middle of its hold window — not the raw city coordinate, which the
  // rounded corner no longer touches.
  const stops: StopEvent[] = route.map((stop, i) => {
    const arrive = i === 0 ? 0.55 : arrivals[i];
    const depart = i === 0 ? BREATHE_END : arrivals[i] + dwells[i];
    const pos = pathAt(smoothed, (arrive + depart) / 2);
    return { label: stop.label, lon: pos.lon, lat: pos.lat, arrive, depart };
  });

  return { samples: smoothed, stops, travelEnd };
}

function chaikin(pts: PathSample[]): PathSample[] {
  if (pts.length < 3) return pts;
  const out: PathSample[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const a = pts[i];
    const b = pts[i + 1];
    out.push(
      { lon: lerp(a.lon, b.lon, 0.25), lat: lerp(a.lat, b.lat, 0.25), time: lerp(a.time, b.time, 0.25), s: 0 },
      { lon: lerp(a.lon, b.lon, 0.75), lat: lerp(a.lat, b.lat, 0.75), time: lerp(a.time, b.time, 0.75), s: 0 }
    );
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// Position of the travelling light at timeline t (binary search over samples).
function pathAt(samples: PathSample[], t: number): { lon: number; lat: number } {
  const first = samples[0];
  const last = samples[samples.length - 1];
  if (t <= first.time) return { lon: first.lon, lat: first.lat };
  if (t >= last.time) return { lon: last.lon, lat: last.lat };
  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].time <= t) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const span = b.time - a.time;
  const p = span > 1e-9 ? (t - a.time) / span : 0;
  return { lon: lerp(a.lon, b.lon, p), lat: lerp(a.lat, b.lat, p) };
}

// ---- Scene -------------------------------------------------------------------

export function createIntroScene(options: IntroSceneOptions): IntroScene {
  const { canvas, route, staticOnly, getDockRect, onDockStart, onFinished } = options;
  const ctx = canvas.getContext('2d');

  const { samples, stops, travelEnd: tTravelEnd } = buildPath(route);

  // Every beat after travel is anchored to the data-derived travel length.
  const tRevealEnd = tTravelEnd + REVEAL_SECONDS;
  const tDockStart = tRevealEnd + HOLD_SECONDS;
  const tDevelop = tDockStart + DEVELOP_DELAY;
  const tDockEnd = tDevelop + DEVELOP_SECONDS;
  const tTailEnd = tDockEnd + TAIL_SECONDS;

  // Route bounds (for the final fitted composition and the terrain map space).
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const s of samples) {
    minLon = Math.min(minLon, s.lon);
    maxLon = Math.max(maxLon, s.lon);
    minLat = Math.min(minLat, s.lat);
    maxLat = Math.max(maxLat, s.lat);
  }

  // Map space for the terrain pair: unwrapped equirectangular, padded.
  const mapLon0 = minLon - 8;
  const mapLat0 = maxLat + 10; // top edge
  const mapW = Math.ceil((maxLon + 8 - mapLon0) * MAP_PPD);
  const mapH = Math.ceil((mapLat0 - (minLat - 10)) * MAP_PPD);

  // Offscreen canvases: slate-tinted landmass, and where the light has been.
  let landCanvas: HTMLCanvasElement | null = null;
  const revealCanvas = document.createElement('canvas');
  revealCanvas.width = mapW;
  revealCanvas.height = mapH;
  const revealCtx = revealCanvas.getContext('2d');
  const scratchCanvas = document.createElement('canvas');
  const scratchCtx = scratchCanvas.getContext('2d');

  const mapX = (lon: number) => (lon - mapLon0) * MAP_PPD;
  const mapY = (lat: number) => (mapLat0 - lat) * MAP_PPD;

  // Build the slate land layer from the specular map (ocean and land have
  // opposite brightness; polarity is detected from two known points rather
  // than assumed, so a swapped source texture can't silently invert the world).
  function buildLand(img: HTMLImageElement) {
    const c = document.createElement('canvas');
    c.width = mapW;
    c.height = mapH;
    const cc = c.getContext('2d');
    if (!cc) return;
    // The texture spans lon -180..180; paint it at each 360° offset that
    // intersects our unwrapped domain.
    for (const offset of [-360, 0, 360]) {
      const dx = (-180 + offset - mapLon0) * MAP_PPD;
      if (dx > mapW || dx + 360 * MAP_PPD < 0) continue;
      cc.drawImage(img, dx, (mapLat0 - 90) * MAP_PPD, 360 * MAP_PPD, 180 * MAP_PPD);
    }
    const image = cc.getImageData(0, 0, mapW, mapH);
    const data = image.data;

    const lumAt = (lon: number, lat: number) => {
      const px = clamp(Math.round(mapX(lon)), 0, mapW - 1);
      const py = clamp(Math.round(mapY(lat)), 0, mapH - 1);
      const i = (py * mapW + px) * 4;
      return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    };
    const landLum = lumAt(105, 30); // central China — definitely land
    const oceanLum = lumAt(210, 0); // mid-Pacific (unwrapped) — definitely ocean
    const threshold = (landLum + oceanLum) / 2;
    const sign = landLum < oceanLum ? -1 : 1;

    // Land is a quiet slate fill, but the coastline — the landness ramp's
    // transition band — is etched a touch lighter, so the light passing
    // over reads as delicate cartography rather than grey fog.
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const landness = clamp(0.5 + (sign * (lum - threshold)) / 40, 0, 1);
      const edge = Math.pow(landness * (1 - landness) * 4, 1.5);
      data[i] = Math.round(lerp(SLATE[0], COAST[0], edge));
      data[i + 1] = Math.round(lerp(SLATE[1], COAST[1], edge));
      data[i + 2] = Math.round(lerp(SLATE[2], COAST[2], edge));
      data[i + 3] = Math.round(Math.max(landness * 0.55, edge * 0.9) * 255);
    }
    cc.putImageData(image, 0, 0);
    landCanvas = c;
  }

  const terrainImg = new Image();
  terrainImg.decoding = 'async';
  terrainImg.onload = () => buildLand(terrainImg);
  terrainImg.src = TEXTURE_URL;

  // ---- Viewport ---------------------------------------------------------------
  let vw = 0;
  let vh = 0;
  let dpr = 1;
  let vignette: CanvasGradient | null = null;

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (vw === w && vh === h && canvas.width === Math.round(w * dpr)) return;
    vw = w;
    vh = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    scratchCanvas.width = canvas.width;
    scratchCanvas.height = canvas.height;
    if (ctx) {
      const g = ctx.createRadialGradient(
        vw / 2, vh / 2, Math.min(vw, vh) * 0.35,
        vw / 2, vh / 2, Math.hypot(vw, vh) * 0.62
      );
      g.addColorStop(0, 'rgba(0, 0, 0, 0)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      vignette = g;
    }
  }

  // ---- Camera -------------------------------------------------------------------
  interface View {
    camLon: number;
    camLat: number;
    ppd: number; // screen pixels per degree
    warp: number; // 0 flat → 1 full whisper-of-globe bow
    cx: number;
    cy: number;
  }

  function travelPpd(): number {
    // Landscape shows ~55° of longitude, portrait ~38° — the mobile re-frame.
    return vw / (vw > vh ? 55 : 38);
  }

  function fitView(): View {
    const lonSpan = Math.max(1, maxLon - minLon);
    const latSpan = Math.max(1, maxLat - minLat);
    const ppd = Math.min((vw * 0.84) / lonSpan, (vh * 0.42) / latSpan);
    return {
      camLon: (minLon + maxLon) / 2,
      camLat: (minLat + maxLat) / 2,
      ppd,
      warp: 1,
      cx: vw / 2,
      cy: vh * 0.46,
    };
  }

  // Smoothed follow: the camera is a forward-shifted moving average of the
  // path, so it leads the light slightly and glides through the hesitations.
  function travelCamera(t: number): { lon: number; lat: number } {
    let lon = 0;
    let lat = 0;
    const taps = 9;
    for (let i = 0; i < taps; i += 1) {
      const tt = clamp(t - 0.45 + (0.75 * i) / (taps - 1), 0, tTravelEnd);
      const p = pathAt(samples, tt);
      lon += p.lon;
      lat += p.lat;
    }
    return { lon: lon / taps, lat: lat / taps };
  }

  function viewAt(t: number): View {
    const fit = fitView();
    if (t >= tRevealEnd) return fit;
    const follow = travelCamera(Math.min(t, tTravelEnd));
    const travel: View = {
      camLon: follow.lon,
      camLat: follow.lat,
      ppd: travelPpd(),
      warp: 0,
      cx: vw / 2,
      cy: vh / 2,
    };
    if (t <= tTravelEnd) return travel;
    const p = easeInOutCubic((t - tTravelEnd) / REVEAL_SECONDS);
    return {
      camLon: lerp(travel.camLon, fit.camLon, p),
      camLat: lerp(travel.camLat, fit.camLat, p),
      // Zoom blends in log space — perceptually constant, so the pull-back
      // doesn't spend its first half looking parked and its last half rushing.
      ppd: Math.exp(lerp(Math.log(travel.ppd), Math.log(fit.ppd), p)),
      warp: p,
      cx: vw / 2,
      cy: lerp(travel.cy, fit.cy, p),
    };
  }

  function project(lon: number, lat: number, v: View): [number, number] {
    const sx = v.cx + (lon - v.camLon) * v.ppd;
    let sy = v.cy + (v.camLat - lat) * v.ppd;
    if (v.warp > 0) {
      const ndx = (sx - vw / 2) / (vw / 2);
      sy += v.warp * ndx * ndx * vh * 0.07; // ends bow away — the curvature
    }
    return [sx, sy];
  }

  // ---- Trail intensity ------------------------------------------------------------
  // Freshly drawn line glows fully for 2s, relaxes to 0.4, rests at 0.25 —
  // then evens out to a uniform value as the pull-back shows the whole journey.
  function segmentAlpha(sampleTime: number, t: number): number {
    const age = t - sampleTime;
    let a: number;
    if (age < TRAIL_BRIGHT_SECONDS) a = lerp(1, 0.4, age / TRAIL_BRIGHT_SECONDS);
    else a = Math.max(0.28, lerp(0.4, 0.28, (age - TRAIL_BRIGHT_SECONDS) / 2));
    const revealP = smoothstep(tTravelEnd, tRevealEnd, t);
    return lerp(a, 0.7, revealP);
  }

  // ---- Sprites ----------------------------------------------------------------------
  function makeGlowSprite(size: number, rgb: string, inner: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const cc = c.getContext('2d');
    if (cc) {
      const g = cc.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, `rgba(${rgb}, ${inner})`);
      g.addColorStop(0.4, `rgba(${rgb}, ${inner * 0.35})`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      cc.fillStyle = g;
      cc.fillRect(0, 0, size, size);
    }
    return c;
  }
  const haloSprite = makeGlowSprite(96, HALO, 0.5);
  const coreSprite = makeGlowSprite(20, CORE, 1);

  // Film grain: a small tile regenerated at ~12fps of *timeline* time, so it
  // reads as film rather than video noise (and freezes when time freezes).
  const GRAIN_TILE = 192;
  const grainTile = document.createElement('canvas');
  grainTile.width = GRAIN_TILE;
  grainTile.height = GRAIN_TILE;
  const grainCtx = grainTile.getContext('2d');
  let grainFrame = -1;

  function updateGrain(t: number) {
    const frame = Math.floor(t * 12);
    if (frame === grainFrame || !grainCtx) return;
    grainFrame = frame;
    const img = grainCtx.createImageData(GRAIN_TILE, GRAIN_TILE);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 255;
    }
    grainCtx.putImageData(img, 0, 0);
  }

  // ---- Star dust ----------------------------------------------------------------------
  // A sparse, near-subliminal dust field behind everything. It counter-drifts
  // against the camera at 6% speed, which is what makes the pan feel like a
  // camera moving through space rather than a map scrolling.
  interface Star {
    u: number; // position in a 1.5×-viewport wrapping tile, 0..1
    v: number;
    base: number; // resting alpha
    size: number;
    twinkleW: number; // twinkle angular speed
    twinkleP: number; // twinkle phase
  }
  const stars: Star[] = [];
  {
    let seed = 1975; // fixed seed — the sky is the same film every visit
    const rand = () => {
      seed = (seed * 48271) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < 110; i += 1) {
      stars.push({
        u: rand(),
        v: rand(),
        base: 0.04 + rand() * 0.1,
        size: rand() < 0.85 ? 1 : 1.5,
        twinkleW: 0.8 + rand() * 1.6,
        twinkleP: rand() * Math.PI * 2,
      });
    }
  }

  function drawStars(t: number, v: View, bgAlpha: number) {
    if (!ctx) return;
    const fade = smoothstep(0.3, 1.5, t) * bgAlpha;
    if (fade <= 0) return;
    const tileW = vw * 1.5;
    const tileH = vh * 1.5;
    const driftX = -v.camLon * v.ppd * 0.06;
    const driftY = v.camLat * v.ppd * 0.06;
    for (const s of stars) {
      const sx = ((s.u * tileW + driftX) % tileW + tileW) % tileW - vw * 0.25;
      const sy = ((s.v * tileH + driftY) % tileH + tileH) % tileH - vh * 0.25;
      if (sx < -2 || sx > vw + 2 || sy < -2 || sy > vh + 2) continue;
      const twinkle = 0.65 + 0.35 * Math.sin(t * s.twinkleW + s.twinkleP);
      ctx.fillStyle = `rgba(${CORE}, ${(s.base * twinkle * fade).toFixed(3)})`;
      ctx.fillRect(sx, sy, s.size, s.size);
    }
  }

  // ---- Sparks -------------------------------------------------------------------------
  // Tiny warm embers shed by the travelling light — under a second of life
  // each, screen-space, so during a fast pan they stream behind the head
  // like dust off a comet.
  interface Spark {
    x: number;
    y: number;
    vx: number;
    vy: number;
    age: number;
    life: number;
  }
  const sparks: Spark[] = [];
  let sparkAccum = 0;
  let sparkSeed = 7;
  const sparkRand = () => {
    sparkSeed = (sparkSeed * 48271) % 2147483647;
    return sparkSeed / 2147483647;
  };

  function updateSparks(t: number, dt: number, headX: number, headY: number) {
    if (!ctx) return;
    if (t > BREATHE_END + 0.3 && t < tTravelEnd) {
      sparkAccum = Math.min(sparkAccum + dt * 22, 4);
      while (sparkAccum >= 1) {
        sparkAccum -= 1;
        sparks.push({
          x: headX + (sparkRand() - 0.5) * 4,
          y: headY + (sparkRand() - 0.5) * 4,
          vx: (sparkRand() - 0.5) * 34,
          vy: (sparkRand() - 0.5) * 34,
          age: 0,
          life: 0.4 + sparkRand() * 0.65,
        });
      }
      if (sparks.length > 120) sparks.splice(0, sparks.length - 120);
    }
    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const p = sparks[i];
      p.age += dt;
      if (p.age >= p.life) {
        sparks.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const a = Math.pow(1 - p.age / p.life, 2) * 0.7;
      ctx.fillStyle = `rgba(${CORE}, ${a.toFixed(3)})`;
      ctx.fillRect(p.x, p.y, 1.2, 1.2);
    }
  }

  // ---- Place names ----------------------------------------------------------------------
  // Each arrival is named in the site's label voice: small, uppercase,
  // generously tracked, with a soft warm glow. Names fade in on approach,
  // hold while the light hovers, and let go as it banks away.
  const LABEL_FONT =
    "300 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif";

  function drawLabels(t: number, v: View, bgAlpha: number) {
    if (!ctx || bgAlpha <= 0) return;
    ctx.font = LABEL_FONT;
    ctx.textAlign = 'center';
    const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    c.letterSpacing = '0.16em';
    for (const stop of stops) {
      const alpha =
        smoothstep(stop.arrive - 0.4, stop.arrive - 0.05, t) *
        (1 - smoothstep(stop.depart + 0.1, stop.depart + 0.5, t)) *
        bgAlpha;
      if (alpha <= 0.01) continue;
      const [x, y] = project(stop.lon, stop.lat, v);
      const text = stop.label.toUpperCase();
      const w = ctx.measureText(text).width;
      const tx = clamp(x, w / 2 + 24, vw - w / 2 - 24);
      const ty = y > vh * 0.2 ? y - 26 : y + 40;
      // A soft glow pass beneath a crisp pass.
      ctx.shadowColor = `rgba(${CORE}, ${(alpha * 0.9).toFixed(3)})`;
      ctx.shadowBlur = 16;
      ctx.fillStyle = `rgba(${CORE}, ${(alpha * 0.85).toFixed(3)})`;
      ctx.fillText(text, tx, ty);
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(${CORE}, ${alpha.toFixed(3)})`;
      ctx.fillText(text, tx, ty);
    }
    c.letterSpacing = '0em';
  }

  // ---- Dock state ---------------------------------------------------------------------
  let dockBase: [number, number][] | null = null;
  let dockRect: { x: number; y: number; w: number } | null = null;
  let dockStarted = false;

  function prepareDock() {
    const v = fitView();
    dockBase = samples.map((s) => project(s.lon, s.lat, v));
    const rect = getDockRect();
    dockRect = rect
      ? { x: rect.left, y: rect.top + rect.height / 2, w: Math.max(rect.width, 24) }
      : { x: vw / 2 - 24, y: vh * 0.62, w: 48 };
  }

  // ---- Render -------------------------------------------------------------------------
  function strokeTrail(
    pts: [number, number][],
    alphas: number[],
    lineFade: number,
    end = pts.length
  ) {
    if (!ctx || end < 2) return;
    // Alphas are quantised into buckets so the whole trail draws in a handful
    // of strokes per bloom pass instead of one per segment.
    const buckets = new Map<number, Path2D>();
    for (let i = 0; i < end - 1; i += 1) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      if (Math.abs(x0 - x1) + Math.abs(y0 - y1) < 0.05) continue;
      const q = Math.round(clamp(alphas[i], 0, 1) * 8);
      if (q === 0) continue;
      let path = buckets.get(q);
      if (!path) {
        path = new Path2D();
        buckets.set(q, path);
      }
      path.moveTo(x0, y0);
      path.lineTo(x1, y1);
    }
    const passes: [number, number, string][] = [
      [9, 0.09, HALO],
      [3, 0.16, HALO],
      [1.3, 0.92, CORE],
    ];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [width, passAlpha, rgb] of passes) {
      ctx.lineWidth = width;
      for (const [q, path] of buckets) {
        ctx.strokeStyle = `rgba(${rgb}, ${(q / 8) * passAlpha * lineFade})`;
        ctx.stroke(path);
      }
    }
  }

  // The freshest stretch of line is a comet: a soft under-glow and a bright
  // core that tapers from ~3px at the head down to the resting hairline.
  const FRESH_SECONDS = 0.45;

  function strokeComet(pts: [number, number][], alphas: number[], times: number[], from: number, t: number) {
    if (!ctx || pts.length - from < 2) return;
    const glow = new Path2D();
    glow.moveTo(pts[from][0], pts[from][1]);
    for (let i = from + 1; i < pts.length; i += 1) glow.lineTo(pts[i][0], pts[i][1]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 11;
    ctx.strokeStyle = `rgba(${HALO}, 0.1)`;
    ctx.stroke(glow);
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = `rgba(${HALO}, 0.16)`;
    ctx.stroke(glow);
    for (let i = from; i < pts.length - 1; i += 1) {
      const f = clamp((t - times[i + 1]) / FRESH_SECONDS, 0, 1); // 0 at the head
      ctx.lineWidth = lerp(3, 1.3, f);
      ctx.strokeStyle = `rgba(${CORE}, ${Math.min(1, alphas[i] * (1.15 - 0.2 * f)).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
      ctx.stroke();
    }
  }

  let lastRevealStamp = -1;

  function render(t: number, dt: number) {
    if (!ctx) return;
    resize();
    if (vw === 0) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);

    // The taut-pull happens on charcoal; only then does the photograph
    // develop up through the darkness beneath the landing line.
    const bgAlpha = t < tDevelop ? 1 : 1 - smoothstep(tDevelop, tDockEnd, t);
    if (bgAlpha > 0) {
      ctx.globalAlpha = bgAlpha;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, vw, vh);
      ctx.globalAlpha = 1;
    }

    const v = viewAt(t);
    const tip = pathAt(samples, Math.min(t, tTravelEnd));
    const [headX, headY] = project(tip.lon, tip.lat, v);

    drawStars(t, v, bgAlpha);

    // Terrain: stamp the reveal around the light, decay the memory, composite.
    const terrainAlpha = (1 - smoothstep(tTravelEnd, tTravelEnd + 0.7, t)) * 0.4;
    if (landCanvas && revealCtx && scratchCtx && terrainAlpha > 0 && t > BREATHE_END - 0.4) {
      if (t <= tTravelEnd + 0.2 && t !== lastRevealStamp) {
        lastRevealStamp = t;
        // Decay first (multiplicative, ~AFTERGLOW_SECONDS to darkness) …
        revealCtx.globalCompositeOperation = 'destination-out';
        revealCtx.fillStyle = `rgba(0, 0, 0, ${clamp(dt / AFTERGLOW_SECONDS, 0, 0.4)})`;
        revealCtx.fillRect(0, 0, mapW, mapH);
        // … then stamp where the light is now.
        revealCtx.globalCompositeOperation = 'source-over';
        const rScreen = Math.min(vw, vh) * 0.12;
        const rMap = (rScreen / v.ppd) * MAP_PPD;
        const gx = mapX(tip.lon);
        const gy = mapY(tip.lat);
        const g = revealCtx.createRadialGradient(gx, gy, 0, gx, gy, rMap);
        g.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        g.addColorStop(0.6, 'rgba(255, 255, 255, 0.25)');
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        revealCtx.fillStyle = g;
        revealCtx.fillRect(gx - rMap, gy - rMap, rMap * 2, rMap * 2);
      }
      // reveal (mask) → source-in → land, both under the same map→screen transform.
      const scale = (v.ppd / MAP_PPD) * dpr;
      scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      scratchCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
      scratchCtx.setTransform(
        scale, 0, 0, scale,
        (v.cx - mapX(v.camLon) * (scale / dpr)) * dpr,
        (v.cy - mapY(v.camLat) * (scale / dpr)) * dpr
      );
      scratchCtx.globalCompositeOperation = 'source-over';
      scratchCtx.drawImage(revealCanvas, 0, 0);
      scratchCtx.globalCompositeOperation = 'source-in';
      scratchCtx.drawImage(landCanvas, 0, 0);
      ctx.globalAlpha = terrainAlpha;
      ctx.drawImage(scratchCanvas, 0, 0, vw, vh);
      ctx.globalAlpha = 1;
    }

    // The line.
    if (t < tDockStart) {
      const pts: [number, number][] = [];
      const alphas: number[] = [];
      const times: number[] = [];
      for (let i = 0; i < samples.length; i += 1) {
        if (samples[i].time > t) break;
        pts.push(project(samples[i].lon, samples[i].lat, v));
        alphas.push(segmentAlpha(samples[i].time, t));
        times.push(samples[i].time);
      }
      if (t > BREATHE_END && pts.length > 0) {
        pts.push([headX, headY]); // partial segment to the tip
        alphas.push(1);
        times.push(Math.min(t, tTravelEnd));
      }
      // The aged trail is a bucketed hairline; the freshest stretch is drawn
      // as a tapering comet on top.
      let freshFrom = pts.length - 1;
      while (freshFrom > 0 && times[freshFrom - 1] > t - FRESH_SECONDS) freshFrom -= 1;
      strokeTrail(pts, alphas, 1, freshFrom + 1);
      strokeComet(pts, alphas, times, freshFrom, t);
    } else {
      // Dock: the journey pulled taut into the hero rule. Ends anchor first,
      // the slack in the middle eases out last.
      if (!dockBase || !dockRect) prepareDock();
      if (dockBase && dockRect) {
        const dockP = clamp((t - tDockStart) / DOCK_TAUT, 0, 1);
        const stagger = 0.7;
        const pts: [number, number][] = [];
        const alphas: number[] = [];
        for (let i = 0; i < samples.length; i += 1) {
          const s = samples[i].s;
          const bell = 4 * s * (1 - s);
          const e = easeInOutCubic(clamp(dockP * (1 + stagger) - stagger * bell, 0, 1));
          const base = dockBase[i];
          pts.push([
            lerp(base[0], dockRect.x + s * dockRect.w, e),
            lerp(base[1], dockRect.y, e),
          ]);
          alphas.push(0.7);
        }
        // Once taut, the canvas line hands over to the real .hero__rule.
        const lineFade =
          1 - smoothstep(tDockStart + DOCK_TAUT, tDockStart + DOCK_TAUT + 0.5, t);
        if (lineFade > 0) strokeTrail(pts, alphas, lineFade);
      }
    }

    // The travelling light — it lets go as the pull-back completes, leaving
    // the journey alone on the dark for the hold beat.
    const pointAlpha =
      smoothstep(0.4, 1.0, t) * (1 - smoothstep(tRevealEnd - 0.4, tRevealEnd, t));
    if (pointAlpha > 0) {
      const breathe = 1 + 0.06 * Math.sin((t / 2.2) * Math.PI * 2);
      ctx.globalAlpha = pointAlpha;
      const haloSize = 92 * breathe;
      ctx.drawImage(haloSprite, headX - haloSize / 2, headY - haloSize / 2, haloSize, haloSize);
      const midSize = 32 * breathe;
      ctx.drawImage(haloSprite, headX - midSize / 2, headY - midSize / 2, midSize, midSize);
      const coreSize = 9 * breathe;
      ctx.drawImage(coreSprite, headX - coreSize / 2, headY - coreSize / 2, coreSize, coreSize);
      ctx.globalAlpha = 1;
    }

    updateSparks(t, dt, headX, headY);

    // Vignette rides the background out.
    if (vignette && bgAlpha > 0) {
      ctx.globalAlpha = bgAlpha;
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, vw, vh);
      ctx.globalAlpha = 1;
    }

    drawLabels(t, v, bgAlpha);

    // Grain — the film's texture, lingering over the page after the dock.
    const grainAlpha = smoothstep(0, 0.5, t) * (1 - smoothstep(tDockEnd, tTailEnd, t)) * 0.032;
    if (grainAlpha > 0 && grainCtx) {
      updateGrain(t);
      const pattern = ctx.createPattern(grainTile, 'repeat');
      if (pattern) {
        // Shuffle the tile alignment every grain frame so the repeat never
        // settles into a perceivable pattern on large dark areas.
        const ox = (grainFrame * 137) % GRAIN_TILE;
        const oy = (grainFrame * 61) % GRAIN_TILE;
        ctx.save();
        ctx.translate(-ox, -oy);
        ctx.globalAlpha = grainAlpha;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, vw + GRAIN_TILE, vh + GRAIN_TILE);
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }
  }

  // ---- Clock / loop ----------------------------------------------------------------------
  let frameId = 0;
  let running = false;
  let t = 0;
  let speed = 1;
  let targetSpeed = 1;
  let lastNow = 0;
  let finished = false;

  function fireDockOnce() {
    if (dockStarted) return;
    dockStarted = true;
    onDockStart();
  }

  function finishOnce() {
    if (finished) return;
    finished = true;
    running = false;
    cancelAnimationFrame(frameId);
    onFinished();
  }

  function tick(now: number) {
    if (!running) return;
    frameId = requestAnimationFrame(tick);
    const dtReal = Math.min((now - lastNow) / 1000, 0.1);
    lastNow = now;
    speed += (targetSpeed - speed) * Math.min(1, dtReal * 8);
    const dt = dtReal * speed;
    t += dt;
    if (t >= tDockStart) fireDockOnce();
    render(t, dt);
    if (t >= tTailEnd) finishOnce();
  }

  // Reduced motion: the finished composition, held, then a gentle fade —
  // the same art, no journey. The fade is JS-driven so the global
  // reduced-motion CSS kill-switch doesn't turn it into a hard cut.
  function runStatic() {
    const HOLD = 1.4;
    const FADE = 0.5;
    let elapsed = 0;
    let last = performance.now();
    let dockFired = false;
    render(tRevealEnd + 0.01, 0); // the held, completed composition
    function staticTick(now: number) {
      if (!running) return;
      frameId = requestAnimationFrame(staticTick);
      elapsed += Math.min((now - last) / 1000, 0.1);
      last = now;
      if (targetSpeed > 1) elapsed = Math.max(elapsed, HOLD); // skip = jump to fade
      if (elapsed >= HOLD) {
        if (!dockFired) {
          dockFired = true;
          dockStarted = true;
          onDockStart();
        }
        canvas.style.opacity = String(clamp(1 - (elapsed - HOLD) / FADE, 0, 1));
        if (elapsed >= HOLD + FADE) finishOnce();
      }
    }
    frameId = requestAnimationFrame(staticTick);
  }

  const onResize = () => resize();
  window.addEventListener('resize', onResize);

  return {
    start() {
      if (running || finished) return;
      running = true;
      lastNow = performance.now();
      resize();
      if (staticOnly) runStatic();
      else frameId = requestAnimationFrame(tick);
    },
    skip() {
      if (finished) return;
      // Time-compress: the rest of the film plays out in ~0.7s rather than
      // jump-cutting — skipping should feel like fast-forward, not dismissal.
      const remaining = Math.max(tDockEnd - t, 0.15);
      targetSpeed = Math.max(targetSpeed, remaining / SKIP_COMPRESS);
    },
    destroy() {
      running = false;
      finished = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
    },
  };
}

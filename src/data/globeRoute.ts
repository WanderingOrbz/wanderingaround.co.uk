// Prototype "Hidden Globe" flight path — real route order as given, not the
// generic country list from the original mockup. A few stops aren't a
// single fixed place (a river cruise, an overnight train) or have no
// specific city named (Japan, America); `lat`/`lon` anchor those to a
// sensible real-world point for the globe. `label` is trimmed to fit the
// overlay's single-line box (e.g. "Sleeper Train", not "Overnight Sleeper
// Train") while still naming the real stop.
export interface RouteStop {
  label: string;
  lat: number;
  lon: number;
  /**
   * How long the first-visit intro's travelling light hovers here, in ms,
   * while the place name is shown — long enough to read comfortably, with
   * longer real-trip stays getting slightly longer pauses. Ignored by the
   * hidden-globe scene, which paces itself with SECONDS_PER_STOP instead.
   */
  dwellMs?: number;
}

export const globeRoute: RouteStop[] = [
  { label: 'Amsterdam', lat: 52.3676, lon: 4.9041, dwellMs: 1100 },
  { label: 'Rome, Italy', lat: 41.9028, lon: 12.4964, dwellMs: 900 },
  { label: 'Hong Kong', lat: 22.3193, lon: 114.1694, dwellMs: 900 },
  { label: 'Guilin', lat: 25.2342, lon: 110.1799, dwellMs: 600 },
  { label: 'Yangshuo', lat: 24.777, lon: 110.4994, dwellMs: 600 },
  { label: 'Yangtze River', lat: 30.684, lon: 111.287, dwellMs: 650 },
  { label: 'Chongqing', lat: 29.563, lon: 106.5516, dwellMs: 600 },
  { label: 'Chengdu', lat: 30.5728, lon: 104.0668, dwellMs: 650 },
  { label: "Xi'an", lat: 34.3416, lon: 108.9398, dwellMs: 650 },
  { label: 'Shanghai', lat: 31.2304, lon: 121.4737, dwellMs: 700 },
  { label: 'Wuzhen', lat: 30.7464, lon: 120.487, dwellMs: 600 },
  { label: 'Suzhou', lat: 31.2989, lon: 120.5853, dwellMs: 600 },
  { label: 'Sleeper Train', lat: 35.6, lon: 118.5, dwellMs: 600 },
  { label: 'Beijing', lat: 39.9042, lon: 116.4074, dwellMs: 800 },
  { label: 'Japan', lat: 35.6762, lon: 139.6503, dwellMs: 900 },
  { label: 'Singapore', lat: 1.3521, lon: 103.8198, dwellMs: 800 },
  { label: 'Bangkok', lat: 13.7563, lon: 100.5018, dwellMs: 800 },
  { label: 'Phuket', lat: 7.8804, lon: 98.3923, dwellMs: 850 },
  { label: 'New Zealand', lat: -36.8485, lon: 174.7633, dwellMs: 900 },
  { label: 'Australia', lat: -33.8688, lon: 151.2093, dwellMs: 950 },
  { label: 'America', lat: 34.0522, lon: -118.2437, dwellMs: 950 },
];

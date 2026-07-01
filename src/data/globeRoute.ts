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
}

export const globeRoute: RouteStop[] = [
  { label: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { label: 'Rome, Italy', lat: 41.9028, lon: 12.4964 },
  { label: 'Hong Kong', lat: 22.3193, lon: 114.1694 },
  { label: 'Guilin', lat: 25.2342, lon: 110.1799 },
  { label: 'Yangshuo', lat: 24.777, lon: 110.4994 },
  { label: 'Yangtze River', lat: 30.684, lon: 111.287 },
  { label: 'Chongqing', lat: 29.563, lon: 106.5516 },
  { label: 'Chengdu', lat: 30.5728, lon: 104.0668 },
  { label: "Xi'an", lat: 34.3416, lon: 108.9398 },
  { label: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  { label: 'Wuzhen', lat: 30.7464, lon: 120.487 },
  { label: 'Suzhou', lat: 31.2989, lon: 120.5853 },
  { label: 'Sleeper Train', lat: 35.6, lon: 118.5 },
  { label: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { label: 'Japan', lat: 35.6762, lon: 139.6503 },
  { label: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { label: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { label: 'Phuket', lat: 7.8804, lon: 98.3923 },
  { label: 'New Zealand', lat: -36.8485, lon: 174.7633 },
  { label: 'Australia', lat: -33.8688, lon: 151.2093 },
  { label: 'America', lat: 34.0522, lon: -118.2437 },
];

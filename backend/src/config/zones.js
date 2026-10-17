// Illustrative zone boundaries (NOT survey-accurate). Replace with official GIS data later.
const core = [
  [20.3, 79.3], [20.32, 79.42], [20.24, 79.5], [20.14, 79.44], [20.12, 79.32], [20.2, 79.26],
];
const outer = [
  [20.4, 79.2], [20.42, 79.46], [20.3, 79.6], [20.1, 79.58], [20.02, 79.38], [20.08, 79.18], [20.24, 79.14],
];

export const zones = [
  { key: 'reserve', name: 'Reserve Boundary', positions: [outer] },
  { key: 'buffer', name: 'Buffer Zone', positions: [outer, core] },
  { key: 'core', name: 'Core Zone', positions: [core] },
];

export const OPEN_DECK_DISCLAIMER =
  'Exclusively serving Open-Deck Freight: Standard Flatbeds (48 ft / 53 ft), Stepdecks, Dropdecks, Conestogas, and RGN Heavy Haul.';

export const OPEN_DECK_TAG = 'Specialized Flatbed & Stepdeck Operations · Landstar Agent GNV';

export const EQUIPMENT = [
  { code: 'FLATBED', label: 'Standard Flatbed (48 ft / 53 ft)' },
  { code: 'STEPDECK', label: 'Stepdeck / Single Drop (11 ft top / 37–42 ft bottom)' },
  { code: 'RGN', label: 'Double Drop / RGN (Removable Gooseneck)' },
  { code: 'CONESTOGA', label: 'Conestoga / Curtainside' },
] as const;

export const EQUIPMENT_CODES = EQUIPMENT.map((e) => e.code);

export const COMMODITIES = [
  'Structural Steel',
  'Machinery',
  'Building Materials',
  'Solar Panels',
  'Lumber',
  'Coils',
  'Other',
];

export const TARP_OPTIONS = [
  { code: 'NONE', label: 'No tarp (untarped)' },
  { code: '4FT', label: '4-ft steel tarps' },
  { code: '8FT', label: '8-ft lumber tarps' },
  { code: 'SHRINK', label: 'Full shrink wrap' },
];

export const LOADING_ACCESS = ['Crane / Overhead Crane', 'Side Forklift Loading', 'Drive-On / Ramp'];

export function equipmentLabel(code: string) {
  return EQUIPMENT.find((e) => e.code === code)?.label || code;
}

export function flagsForDims(widthFt: number, heightFt: number, equipment: string) {
  const oversize = widthFt > 8.5;
  const legalHeight = 13.6;
  const deck = equipment === 'STEPDECK' || equipment === 'RGN' ? 3.5 : 5;
  const stepdeckRequired = deck + heightFt > legalHeight && equipment === 'FLATBED';
  return { oversize, stepdeckRequired };
}

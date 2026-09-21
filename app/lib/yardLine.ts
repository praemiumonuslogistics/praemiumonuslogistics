export const MILESTONES = [
  { yards: 0, label: 'Accepted', detail: 'At origin / loading', status: 'ACCEPTED' },
  { yards: 25, label: 'Picked up', detail: 'Rolling', status: 'IN_TRANSIT' },
  { yards: 50, label: 'Midfield', detail: 'Halfway checkpoint', status: 'IN_TRANSIT' },
  { yards: 75, label: 'Red zone', detail: 'Entering destination', status: 'IN_TRANSIT' },
  { yards: 100, label: 'Touchdown', detail: 'POD on file', status: 'DELIVERED' },
] as const;

export function clampYardLine(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function milestoneForYards(yards: number) {
  const y = clampYardLine(yards);
  let current: (typeof MILESTONES)[number] = MILESTONES[0];
  for (const m of MILESTONES) {
    if (y >= m.yards) current = m;
  }
  return current;
}

export function inferYardLine(input: {
  yard_line?: number | null;
  status?: string | null;
  pickup_confirmed_at?: string | null;
  delivered_at?: string | null;
}) {
  if (typeof input.yard_line === 'number' && input.yard_line > 0) {
    return clampYardLine(input.yard_line);
  }
  if (input.status === 'DELIVERED' || input.delivered_at) return 100;
  if (input.status === 'IN_TRANSIT' || input.pickup_confirmed_at) return 50;
  if (input.status === 'ACCEPTED' || input.status === 'BOOKED') return 0;
  return 0;
}

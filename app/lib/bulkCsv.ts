export type BulkRow = {
  customer_id: string | null;
  origin_city: string | null;
  origin_zip: string;
  origin_country: string;
  destination_city: string | null;
  destination_zip: string;
  destination_country: string;
  pickup_date_from: string | null;
  pickup_date_thru: string | null;
  delivery_date_from: string | null;
  delivery_date_thru: string | null;
  equipment_1: string;
  freight_type: string;
  weight: string | null;
  rate_type: string;
  rate: number;
  commodity: string | null;
  load_comments: string | null;
};

function idx(headers: string[], name: string) {
  return headers.findIndex((h) => h.includes(name));
}

function cell(cols: string[], i: number) {
  if (i < 0 || i >= cols.length) return '';
  return (cols[i] || '').trim();
}

export function parseBulkCsv(text: string): BulkRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows: BulkRow[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(',');
    const originZip = cell(cols, idx(headers, 'origin zip')) || cell(cols, idx(headers, 'origin_zip'));
    const destZip = cell(cols, idx(headers, 'destination zip')) || cell(cols, idx(headers, 'dest zip'));
    if (!originZip || !destZip) continue;
    const equipment = (cell(cols, idx(headers, 'equipment 1')) || cell(cols, idx(headers, 'equipment')) || 'VAN').toUpperCase();
    const pickupFrom = cell(cols, idx(headers, 'pickup date (from)')) || cell(cols, idx(headers, 'pickup'));
    const pickupThru = cell(cols, idx(headers, 'pickup date (thru)')) || pickupFrom;
    rows.push({
      customer_id: cell(cols, idx(headers, 'customer')) || null,
      origin_city: cell(cols, idx(headers, 'origin city')) || null,
      origin_zip: originZip,
      origin_country: cell(cols, idx(headers, 'origin country')) || 'US',
      destination_city: cell(cols, idx(headers, 'destination city')) || null,
      destination_zip: destZip,
      destination_country: cell(cols, idx(headers, 'destination country')) || 'US',
      pickup_date_from: pickupFrom || null,
      pickup_date_thru: pickupThru || null,
      delivery_date_from: cell(cols, idx(headers, 'delivery date (from)')) || null,
      delivery_date_thru: cell(cols, idx(headers, 'delivery date (thru)')) || null,
      equipment_1: equipment,
      freight_type: equipment,
      weight: cell(cols, idx(headers, 'weight')) || null,
      rate_type: (cell(cols, idx(headers, 'rate type')) || 'F').toUpperCase(),
      rate: Number(cell(cols, idx(headers, 'rate')) || 0),
      commodity: cell(cols, idx(headers, 'commodity')) || null,
      load_comments: cell(cols, idx(headers, 'comments')) || null,
    });
  }
  return rows;
}

export const COMMODITIES = [
  'General Freight',
  'Auto Parts',
  'Building Materials',
  'Electronics',
  'Food / FSMA',
  'Machinery',
  'Metals',
  'Paper',
  'Plastics / Rubber',
  'Other',
];

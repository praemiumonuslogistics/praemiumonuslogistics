'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Lane = {
  id: string;
  origin: string;
  dest: string;
  from: [number, number];
  to: [number, number];
  highway: string;
  status: 'IN_TRANSIT' | 'AT_DOCK' | 'DELIVERED';
};

const LANES: Lane[] = [
  {
    id: 'HTX-CHI',
    origin: 'Houston, TX',
    dest: 'Chicago, IL',
    from: [29.7604, -95.3698],
    to: [41.8781, -87.6298],
    highway: 'I-55',
    status: 'IN_TRANSIT',
  },
  {
    id: 'MIA-ATL',
    origin: 'Miami, FL',
    dest: 'Atlanta, GA',
    from: [25.7617, -80.1918],
    to: [33.749, -84.388],
    highway: 'I-75',
    status: 'IN_TRANSIT',
  },
  {
    id: 'LAS-SLC',
    origin: 'Las Vegas, NV',
    dest: 'Salt Lake City, UT',
    from: [36.1699, -115.1398],
    to: [40.7608, -111.891],
    highway: 'I-15',
    status: 'AT_DOCK',
  },
];

function lerpPath(path: [number, number][], t: number): [number, number] {
  const x = Math.max(0, Math.min(0.999, t)) * (path.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = path[i];
  const b = path[i + 1] || path[i];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

function fallbackPath(from: [number, number], to: [number, number]): [number, number][] {
  const n = 48;
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
  });
}

export function LiveFleetMap({ focusId }: { focusId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const linesRef = useRef<Record<string, LeafletPolyline>>({});
  const [paths, setPaths] = useState<Record<string, [number, number][]>>({});
  const [active, setActive] = useState(focusId || LANES[0].id);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadRoutes() {
      const next: Record<string, [number, number][]> = {};
      await Promise.all(
        LANES.map(async (lane) => {
          try {
            const url = `https://router.project-osrm.org/route/v1/driving/${lane.from[1]},${lane.from[0]};${lane.to[1]},${lane.to[0]}?overview=simplified&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            const coords = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
            next[lane.id] = coords?.length
              ? coords.map(([lng, lat]) => [lat, lng] as [number, number])
              : fallbackPath(lane.from, lane.to);
          } catch {
            next[lane.id] = fallbackPath(lane.from, lane.to);
          }
        })
      );
      if (!cancelled) setPaths(next);
    }
    loadRoutes();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let map: LeafletMap;
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return;
      map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([37.5, -96], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);
      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 250);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const telemetry = useMemo(() => {
    return LANES.map((lane) => {
      const path = paths[lane.id] || fallbackPath(lane.from, lane.to);
      const progress = lane.status === 'DELIVERED' ? 1 : lane.status === 'AT_DOCK' ? 0.08 : (tick % 120) / 120;
      const pos = lerpPath(path, progress);
      const speed = lane.status === 'IN_TRANSIT' ? Math.round(58 + Math.sin(tick / 6 + progress * 8) * 7) : 0;
      const hoursLeft = (1 - progress) * (lane.id === 'HTX-CHI' ? 16 : 9);
      const eta = new Date(Date.now() + hoursLeft * 3600 * 1000);
      return { lane, path, pos, speed, progress, eta };
    });
  }, [paths, tick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    import('leaflet').then((L) => {
      telemetry.forEach(({ lane, path, pos }) => {
        if (!linesRef.current[lane.id]) {
          linesRef.current[lane.id] = L.polyline(path, {
            color: lane.id === active ? '#fbbf24' : '#64748b',
            weight: lane.id === active ? 5 : 3,
            opacity: 0.9,
          }).addTo(map);
        } else {
          linesRef.current[lane.id].setLatLngs(path);
          linesRef.current[lane.id].setStyle({
            color: lane.id === active ? '#fbbf24' : '#64748b',
            weight: lane.id === active ? 5 : 3,
          });
        }
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;border-radius:9999px;background:${lane.id === active ? '#fbbf24' : '#38bdf8'};border:2px solid #0f172a;box-shadow:0 0 0 4px rgba(15,23,42,0.5)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        if (!markersRef.current[lane.id]) {
          markersRef.current[lane.id] = L.marker(pos, { icon }).addTo(map);
        } else {
          markersRef.current[lane.id].setLatLng(pos);
          markersRef.current[lane.id].setIcon(icon);
        }
      });
    });
  }, [telemetry, active]);

  useEffect(() => {
    const row = telemetry.find((t) => t.lane.id === active);
    if (row && mapRef.current) mapRef.current.panTo(row.pos);
  }, [active]);

  const selected = telemetry.find((t) => t.lane.id === active) || telemetry[0];

  function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toUpperCase();
    const match = LANES.find((l) => l.id.includes(q) || l.origin.toUpperCase().includes(q) || l.dest.toUpperCase().includes(q));
    if (match) setActive(match.id);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-400">Demonstration — sample highway corridors, not live POL trucks</p>
      <form onSubmit={search} className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search demo load ID (HTX-CHI, MIA-ATL, LAS-SLC)"
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
        />
        <button className="bg-slate-800 border border-slate-700 font-bold px-5 py-3 rounded-xl text-sm">Center truck</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {LANES.map((lane) => (
          <button
            key={lane.id}
            type="button"
            onClick={() => setActive(lane.id)}
            className={`text-xs font-semibold px-3 py-2 rounded-lg border ${
              active === lane.id ? 'border-amber-400 text-amber-300 bg-amber-400/10' : 'border-slate-800 text-slate-400'
            }`}
          >
            {lane.id} · {lane.status.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <div ref={containerRef} className="absolute inset-0" />
      </div>
      {selected ? (
        <div className="grid sm:grid-cols-4 gap-3 text-sm">
          <div className="border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-500">Lane</div>
            <div className="font-semibold">
              {selected.lane.origin} → {selected.lane.dest}
            </div>
          </div>
          <div className="border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-500">Highway</div>
            <div className="font-semibold">
              {selected.lane.highway} · {selected.pos[0].toFixed(3)}, {selected.pos[1].toFixed(3)}
            </div>
          </div>
          <div className="border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-500">Speed</div>
            <div className="font-semibold">{selected.speed ? `${selected.speed} mph` : 'Stopped'}</div>
          </div>
          <div className="border border-slate-800 rounded-xl p-3">
            <div className="text-xs text-slate-500">ETA</div>
            <div className="font-semibold">
              {selected.eta.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

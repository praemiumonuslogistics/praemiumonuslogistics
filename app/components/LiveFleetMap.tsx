'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker, Polyline as LeafletPolyline } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Lane = {
  id: string;
  origin: string;
  dest: string;
  from: [number, number];
  to: [number, number];
  highway: string;
  hours: number;
};

const LANES: Lane[] = [
  { id: 'HTX-CHI', origin: 'Houston, TX', dest: 'Chicago, IL', from: [29.7604, -95.3698], to: [41.8781, -87.6298], highway: 'I-55', hours: 16 },
  { id: 'MIA-ATL', origin: 'Miami, FL', dest: 'Atlanta, GA', from: [25.7617, -80.1918], to: [33.749, -84.388], highway: 'I-75', hours: 9 },
  { id: 'LAS-SLC', origin: 'Las Vegas, NV', dest: 'Salt Lake City, UT', from: [36.1699, -115.1398], to: [40.7608, -111.891], highway: 'I-15', hours: 6 },
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
  return Array.from({ length: 48 }, (_, i) => {
    const t = i / 47;
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t] as [number, number];
  });
}

function letterIcon(L: typeof import('leaflet'), letter: string, bg: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:6px;background:${bg};color:#0f172a;font:700 12px/22px ui-sans-serif,system-ui,sans-serif;text-align:center;border:1px solid #0f172a">${letter}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function truckIcon(L: typeof import('leaflet'), active: boolean) {
  const bg = active ? '#fbbf24' : '#38bdf8';
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${bg};border:2px solid #0f172a;box-shadow:0 0 0 3px rgba(15,23,42,.45)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export function LiveFleetMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const LRef = useRef<typeof import('leaflet') | null>(null);
  const linesRef = useRef<Record<string, LeafletPolyline>>({});
  const trucksRef = useRef<Record<string, LeafletMarker>>({});
  const originRef = useRef<Record<string, LeafletMarker>>({});
  const destRef = useRef<Record<string, LeafletMarker>>({});
  const pathsRef = useRef<Record<string, [number, number][]>>({});
  const progressRef = useRef<Record<string, number>>({ 'HTX-CHI': 0.2, 'MIA-ATL': 0.45, 'LAS-SLC': 0.35 });
  const activeRef = useRef(LANES[0].id);
  const [active, setActive] = useState(LANES[0].id);
  const [query, setQuery] = useState('');
  const [overlay, setOverlay] = useState({ lat: 0, lng: 0, speed: 0, eta: '', highway: LANES[0].highway, lane: LANES[0] });

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let lastOverlay = 0;

    async function start() {
      const L = await import('leaflet');
      if (cancelled || !containerRef.current) return;
      LRef.current = L;
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([37.5, -96], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);
      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 200);

      await Promise.all(
        LANES.map(async (lane) => {
          try {
            const url = `https://router.project-osrm.org/route/v1/driving/${lane.from[1]},${lane.from[0]};${lane.to[1]},${lane.to[0]}?overview=simplified&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            const coords = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
            pathsRef.current[lane.id] = coords?.length
              ? coords.map(([lng, lat]) => [lat, lng] as [number, number])
              : fallbackPath(lane.from, lane.to);
          } catch {
            pathsRef.current[lane.id] = fallbackPath(lane.from, lane.to);
          }
        })
      );
      if (cancelled) return;

      LANES.forEach((lane) => {
        const path = pathsRef.current[lane.id];
        linesRef.current[lane.id] = L.polyline(path, { color: '#64748b', weight: 3, opacity: 0.85 }).addTo(map);
        originRef.current[lane.id] = L.marker(path[0], { icon: letterIcon(L, 'S', '#fbbf24'), zIndexOffset: 200 }).addTo(map);
        destRef.current[lane.id] = L.marker(path[path.length - 1], { icon: letterIcon(L, 'R', '#38bdf8'), zIndexOffset: 200 }).addTo(map);
        trucksRef.current[lane.id] = L.marker(lerpPath(path, progressRef.current[lane.id]), {
          icon: truckIcon(L, lane.id === activeRef.current),
          zIndexOffset: 400,
        }).addTo(map);
      });
      styleActive();
      fitActive();

      const step = (now: number) => {
        if (cancelled) return;
        LANES.forEach((lane) => {
          progressRef.current[lane.id] = (progressRef.current[lane.id] + 0.0018) % 1;
          const path = pathsRef.current[lane.id];
          const pos = lerpPath(path, progressRef.current[lane.id]);
          trucksRef.current[lane.id]?.setLatLng(pos);
        });
        if (now - lastOverlay > 250) {
          lastOverlay = now;
          const lane = LANES.find((l) => l.id === activeRef.current) || LANES[0];
          const t = progressRef.current[lane.id];
          const pos = lerpPath(pathsRef.current[lane.id], t);
          const speed = Math.round(58 + Math.sin(t * 12) * 7);
          const eta = new Date(Date.now() + (1 - t) * lane.hours * 3600 * 1000);
          setOverlay({
            lat: pos[0],
            lng: pos[1],
            speed,
            eta: eta.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
            highway: lane.highway,
            lane,
          });
        }
        raf = window.requestAnimationFrame(step);
      };
      raf = window.requestAnimationFrame(step);
    }

    start();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  function styleActive() {
    const L = LRef.current;
    if (!L) return;
    LANES.forEach((lane) => {
      const on = lane.id === activeRef.current;
      linesRef.current[lane.id]?.setStyle({ color: on ? '#fbbf24' : '#64748b', weight: on ? 5 : 3 });
      trucksRef.current[lane.id]?.setIcon(truckIcon(L, on));
    });
  }

  function fitActive() {
    const map = mapRef.current;
    const path = pathsRef.current[activeRef.current];
    if (!map || !path?.length) return;
    map.fitBounds(path as [number, number][], { padding: [40, 40], maxZoom: 7 });
  }

  function selectLane(id: string) {
    activeRef.current = id;
    setActive(id);
    progressRef.current[id] = 0.05;
    styleActive();
    fitActive();
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().toUpperCase();
    const match = LANES.find((l) => l.id.includes(q) || l.origin.toUpperCase().includes(q) || l.dest.toUpperCase().includes(q));
    if (match) selectLane(match.id);
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
            onClick={() => selectLane(lane.id)}
            className={`text-xs font-semibold px-3 py-2 rounded-lg border ${
              active === lane.id ? 'border-amber-400 text-amber-300 bg-amber-400/10' : 'border-slate-800 text-slate-400'
            }`}
          >
            {lane.origin.split(',')[0]} → {lane.dest.split(',')[0]}
          </button>
        ))}
      </div>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <div ref={containerRef} className="absolute inset-0" />
      </div>
      <div className="grid sm:grid-cols-4 gap-3 text-sm">
        <div className="border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-500">Lane</div>
          <div className="font-semibold">
            {overlay.lane.origin} → {overlay.lane.dest}
          </div>
        </div>
        <div className="border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-500">Location</div>
          <div className="font-semibold">
            {overlay.highway} · {overlay.lat.toFixed(3)}, {overlay.lng.toFixed(3)}
          </div>
        </div>
        <div className="border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-500">Speed</div>
          <div className="font-semibold">{overlay.speed} mph</div>
        </div>
        <div className="border border-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-500">ETA</div>
          <div className="font-semibold">{overlay.eta || '—'}</div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function TrackingMap({
  lat,
  lng,
  started,
  lastUpdate,
}: {
  lat?: number | null;
  lng?: number | null;
  started: boolean;
  lastUpdate?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!started || lat == null || lng == null || !containerRef.current) return;
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return;
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 10);
        return;
      }
      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([lat, lng], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);
      const icon = L.divIcon({
        className: '',
        html: '<div style="width:14px;height:14px;border-radius:9999px;background:#fbbf24;border:2px solid #0f172a"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([lat, lng], { icon }).addTo(map);
      mapRef.current = map;
    });
    return () => {
      cancelled = true;
    };
  }, [started, lat, lng]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (!started) {
    return (
      <div className="aspect-video rounded-xl border border-slate-800 bg-slate-900 px-4 py-8 flex items-center justify-center text-sm text-slate-400">
        Map opens when pickup is confirmed and the load starts moving.
      </div>
    );
  }

  if (lat == null || lng == null) {
    return (
      <div className="aspect-video rounded-xl border border-slate-800 bg-slate-900 px-4 py-8 flex items-center justify-center text-sm text-slate-400">
        Pickup confirmed. Waiting for the first GPS ping…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
        <div ref={containerRef} className="absolute inset-0" />
      </div>
      <p className="text-xs text-slate-500">
        {lat.toFixed(5)}, {lng.toFixed(5)}
        {lastUpdate ? ` · updated ${new Date(lastUpdate).toLocaleString()}` : ''}
      </p>
    </div>
  );
}

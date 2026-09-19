'use client';

export function TrackingMap({
  lat,
  lng,
  started,
}: {
  lat?: number | null;
  lng?: number | null;
  started: boolean;
}) {
  if (!started) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-8 text-center text-sm text-slate-400">
        Map opens when pickup is confirmed and the load starts moving.
      </div>
    );
  }

  if (lat == null || lng == null) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-8 text-center text-sm text-slate-400">
        Pickup confirmed. Waiting for the first GPS ping…
      </div>
    );
  }

  const delta = 0.08;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="space-y-2">
      <iframe
        title="Live load map"
        src={src}
        className="w-full h-64 md:h-80 rounded-xl border border-slate-800 bg-slate-900"
        loading="lazy"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-amber-400 hover:text-amber-300"
      >
        Open full map
      </a>
    </div>
  );
}

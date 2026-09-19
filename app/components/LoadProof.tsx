import { formatAddress } from '../lib/address';
import { trackingStarted, type LoadRecord } from '../lib/supabaseBrowser';

export function ProofChips({ load }: { load: LoadRecord }) {
  const live = Boolean(load.current_lat && load.current_lng);
  const photos = load.pickup_photo_urls?.length || 0;
  const chips = [
    { on: Boolean(load.pickup_confirmed_at) || trackingStarted(load), label: load.pickup_confirmed_at ? 'Pickup confirmed' : 'Awaiting pickup' },
    { on: live, label: live ? 'Live GPS' : 'Awaiting GPS' },
    { on: photos > 0, label: photos ? `Load photos (${photos})` : 'Load photos' },
    { on: Boolean(load.bol_url), label: 'BOL on file' },
    { on: Boolean(load.pod_url), label: 'POD on file' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            chip.on
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

export function LoadAddress({
  label,
  street,
  city,
  state,
  zip,
}: {
  label: string;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase">{label}</p>
      <p className="text-lg font-bold text-white whitespace-pre-line">
        {formatAddress({ street, city, state, zip }) || '—'}
      </p>
    </div>
  );
}

export function LoadDocs({ load }: { load: LoadRecord }) {
  const photos = load.pickup_photo_urls || [];
  return (
    <div className="space-y-4">
      {photos.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Load photos at pickup</p>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Load at pickup" className="w-full h-32 object-cover rounded-lg border border-slate-800 bg-slate-950" />
              </a>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <DocCard title="Origin BOL" url={load.bol_url} stamped={load.bol_uploaded_at} />
        <DocCard title="Destination POD" url={load.pod_url} stamped={load.pod_uploaded_at} />
      </div>
    </div>
  );
}

function DocCard({
  title,
  url,
  stamped,
}: {
  title: string;
  url: string | null;
  stamped: string | null;
}) {
  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="text-xs text-slate-500">{url ? 'On file' : 'Not uploaded'}</p>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={title} className="w-full max-h-64 object-contain bg-slate-950" />
          {stamped ? (
            <p className="px-4 py-2 text-xs text-slate-500">{new Date(stamped).toLocaleString()}</p>
          ) : null}
        </a>
      ) : (
        <p className="px-4 py-8 text-sm text-slate-500 text-center">Awaiting scan</p>
      )}
    </div>
  );
}

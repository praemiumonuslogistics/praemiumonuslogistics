'use client';

import type { AddressParts } from '../lib/address';
import { ZIP_PATTERN } from '../lib/address';

const inputClass =
  'w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400';

export function AddressFields({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: AddressParts;
  onChange: (next: AddressParts) => void;
}) {
  function set<K extends keyof AddressParts>(key: K, raw: string) {
    const next = key === 'state' ? raw.toUpperCase().slice(0, 2) : raw;
    onChange({ ...value, [key]: next });
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold uppercase tracking-wider text-amber-400">{legend}</legend>
      <input
        required
        className={inputClass}
        value={value.street || ''}
        onChange={(e) => set('street', e.target.value)}
        placeholder="Street address"
        autoComplete="street-address"
      />
      <div className="grid grid-cols-6 gap-2">
        <input
          required
          className={`${inputClass} col-span-3`}
          value={value.city || ''}
          onChange={(e) => set('city', e.target.value)}
          placeholder="City"
          autoComplete="address-level2"
        />
        <input
          required
          className={`${inputClass} col-span-1`}
          value={value.state || ''}
          onChange={(e) => set('state', e.target.value)}
          placeholder="ST"
          maxLength={2}
          autoComplete="address-level1"
        />
        <input
          required
          className={`${inputClass} col-span-2`}
          value={value.zip || ''}
          onChange={(e) => set('zip', e.target.value)}
          placeholder="ZIP"
          inputMode="numeric"
          pattern={ZIP_PATTERN}
          title="5-digit ZIP or ZIP+4"
          autoComplete="postal-code"
        />
      </div>
    </fieldset>
  );
}

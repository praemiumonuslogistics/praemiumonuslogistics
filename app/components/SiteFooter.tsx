import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 md:px-8 py-10 text-sm text-slate-400">
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-white font-bold tracking-wide">PRAEMIUM ONUS LOGISTICS</p>
          <p className="text-amber-400/90">Premium freight. Personal duty.</p>
          <p>
            Las Vegas freight brokerage. Landstar Agent GNV. We match shippers with
            top-tier carriers and stay on the details until the freight is delivered.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-white font-semibold">Pages</p>
          <div className="grid grid-cols-2 gap-1">
            <Link href="/" className="hover:text-amber-300">Home</Link>
            <Link href="/about" className="hover:text-amber-300">About</Link>
            <Link href="/services" className="hover:text-amber-300">Services</Link>
            <Link href="/shippers" className="hover:text-amber-300">Shippers</Link>
            <Link href="/carriers" className="hover:text-amber-300">Carriers</Link>
            <Link href="/quote" className="hover:text-amber-300">Request a Quote</Link>
            <Link href="/track/shipper" className="hover:text-amber-300">Shipper Tracking</Link>
            <Link href="/track/receiver" className="hover:text-amber-300">Receiver Portal</Link>
            <Link href="/track/driver" className="hover:text-amber-300">Driver App</Link>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-white font-semibold">Contact</p>
          <p>Las Vegas, Nevada</p>
          <p>
            <a href="tel:+17027446957" className="text-amber-400 hover:text-amber-300">
              (702) 744-6957
            </a>
          </p>
          <p>
            <a
              href="mailto:praemiumonuslogistics@gmail.com"
              className="text-amber-400 hover:text-amber-300"
            >
              praemiumonuslogistics@gmail.com
            </a>
          </p>
          <p>
            <a
              href="https://www.linkedin.com/company/praemiumonuslogistics"
              className="hover:text-amber-300"
              rel="noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
          </p>
          <p className="text-xs text-slate-500">
            Agent: Darrell L. Garner · Landstar Agent GNV
          </p>
          <p className="text-xs text-slate-500">
            Authority: Landstar Ranger, Inc. MC-166960 · USDOT 241572
          </p>
          <p className="text-xs text-slate-600">
            13410 Sutton Park Dr S, Jacksonville, FL 32224
          </p>
        </div>
      </div>
      <p className="max-w-6xl mx-auto mt-8 text-xs text-slate-600">
        © {new Date().getFullYear()} Praemium Onus Logistics. Landstar Agent GNV. All rights reserved.
      </p>
    </footer>
  );
}

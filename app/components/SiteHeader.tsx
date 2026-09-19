import Link from 'next/link';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/shippers', label: 'Shippers' },
  { href: '/carriers', label: 'Carriers' },
];

export function SiteHeader() {
  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-4">
      <div className="max-w-6xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="font-black text-lg tracking-tight text-white uppercase">
              PRAEMIUM ONUS <span className="text-amber-400">LOGISTICS</span>
            </span>
          </Link>
          <Link
            href="/quote"
            className="lg:hidden bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-sm"
          >
            Quote
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-slate-300 hover:text-amber-300 font-medium"
            >
              {item.label}
            </Link>
          ))}
          <span className="hidden xl:inline text-xs font-semibold px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
            Landstar Agent GNV
          </span>
          <a href="tel:+17027446957" className="hidden md:inline text-amber-400 hover:text-amber-300 font-semibold">
            (702) 744-6957
          </a>
          <Link
            href="/quote"
            className="hidden lg:inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm"
          >
            Request a Quote
          </Link>
        </div>
      </div>
    </nav>
  );
}

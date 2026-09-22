import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://praemiumonuslogistics.vercel.app'),
  title: {
    default: 'Praemium Onus Logistics | Flatbed & Stepdeck',
    template: '%s | Praemium Onus Logistics',
  },
  description:
    'Las Vegas open-deck brokerage. Flatbed, stepdeck, Conestoga, and RGN. Landstar Agent GNV.',
  keywords: [
    'Praemium Onus Logistics',
    'Flatbed Freight',
    'Stepdeck',
    'RGN Heavy Haul',
    'Landstar Agent',
    'Open Deck',
    'GPS Freight Tracking',
    'Las Vegas Freight Agent',
  ],
  authors: [{ name: 'Praemium Onus Logistics' }],
  creator: 'Praemium Onus Logistics',
  publisher: 'Praemium Onus Logistics',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Praemium Onus Logistics | Premium Freight & Landstar Agent Services',
    description:
      'Enterprise freight solutions backed by Landstar’s fleet network. Real-time GPS tracking and honest logistics.',
    url: 'https://praemiumonuslogistics.com',
    siteName: 'Praemium Onus Logistics',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Praemium Onus Logistics Freight Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Praemium Onus Logistics | Premium Freight Services',
    description: 'Enterprise freight capacity backed by Landstar network. Real-time GPS tracking.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-77N68S9D8R" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-77N68S9D8R');`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}

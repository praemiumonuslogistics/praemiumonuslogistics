import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://praemiumonuslogistics.com'),
  title: {
    default: 'Praemium Onus Logistics | Premium Freight & Landstar Agent Services',
    template: '%s | Praemium Onus Logistics',
  },
  description:
    'Praemium Onus Logistics offers premium freight transport, dry van, flatbed, and heavy haul logistics backed by Landstar’s safety-rated fleet network with real-time GPS tracking.',
  keywords: [
    'Praemium Onus Logistics',
    'Freight Broker',
    'Landstar Agent',
    'Logistics Services',
    'Dry Van Shipping',
    'Flatbed Freight',
    'GPS Freight Tracking',
    'Las Vegas Freight Agent',
    'Heavy Haul Transport',
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
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}

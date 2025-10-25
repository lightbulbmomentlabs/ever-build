import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'EverBuild - Construction Coordination Software for Spec-Home Builders',
  description:
    'Automate your construction scheduling and subcontractor coordination. EverBuild helps spec-home builders finish on time without the endless phone calls. Start free trial.',
  keywords: [
    'construction project management software',
    'spec home builder software',
    'subcontractor scheduling software',
    'construction coordination app',
    'automated construction scheduling',
  ],
  authors: [{ name: 'EverBuild' }],
  creator: 'EverBuild',
  publisher: 'EverBuild',
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/images/meta/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/meta/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/meta/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/images/meta/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/images/meta/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/images/meta/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://everbuild.app',
    siteName: 'EverBuild',
    title: 'Stop Chasing Subcontractors. Start Building Faster. | EverBuild',
    description:
      'Spec-home builders are saving 15+ hours/week with automated SMS coordination. No more phone tag, no more delays. Join 200+ builders finishing projects on time, every time.',
    images: [
      {
        url: 'https://everbuild.app/images/meta/EverBuild-Feat-Img.jpg',
        width: 1200,
        height: 630,
        alt: 'EverBuild - Automated Construction Coordination for Spec-Home Builders',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stop Chasing Subcontractors. Start Building Faster. | EverBuild',
    description:
      'Spec-home builders are saving 15+ hours/week with automated SMS coordination. Join 200+ builders finishing projects on time.',
    images: ['https://everbuild.app/images/meta/EverBuild-Feat-Img.jpg'],
    creator: '@everbuild',
    site: '@everbuild',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#F4F4F4',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SP1XC2MCYS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SP1XC2MCYS');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}

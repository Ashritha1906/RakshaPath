import type { Metadata } from 'next';
import './globals.css';
import SOSButton from '../components/SOSButton';
import VoiceCommand from '../components/VoiceCommand';

import Navbar from '../components/Navbar';
import NotificationSystem from '../components/NotificationSystem';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Raksha Path - AI Personal Safety Navigation',
  description: 'Your route should protect you, not just guide you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <NotificationSystem />
        {children}
        <VoiceCommand />
        <SOSButton />
        
        {/* Register PWA Service Worker for Offline Map Tile Caching */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MathPuzzle",
  description: "A cognitive math puzzle game for ages 10+",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Version-based cache management
                var STORAGE_KEY = 'mathpuzzle-app-version';

                // Check for version updates
                function checkVersion() {
                  fetch('/version.json?t=' + Date.now())
                    .then(function(r) { return r.json(); })
                    .then(function(data) {
                      var currentVersion = data.version;
                      var storedVersion = localStorage.getItem(STORAGE_KEY);

                      console.log('[App] Current version:', currentVersion);
                      console.log('[App] Stored version:', storedVersion);

                      if (storedVersion && storedVersion !== currentVersion) {
                        console.log('[App] Version mismatch! Clearing caches...');

                        // Clear all caches
                        if ('caches' in window) {
                          caches.keys().then(function(names) {
                            return Promise.all(names.map(function(name) {
                              console.log('[App] Deleting cache:', name);
                              return caches.delete(name);
                            }));
                          }).then(function() {
                            // Update stored version
                            localStorage.setItem(STORAGE_KEY, currentVersion);
                            // Reload to get fresh content
                            console.log('[App] Reloading for new version...');
                            window.location.reload();
                          });
                        } else {
                          localStorage.setItem(STORAGE_KEY, currentVersion);
                          window.location.reload();
                        }
                      } else {
                        // First visit or same version
                        localStorage.setItem(STORAGE_KEY, currentVersion);
                      }
                    })
                    .catch(function(err) {
                      console.log('[App] Version check failed:', err);
                    });
                }

                // Register service worker
                function registerSW() {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('[App] SW registered:', registration.scope);

                        // Listen for updates
                        registration.addEventListener('updatefound', function() {
                          var newWorker = registration.installing;
                          if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New SW installed, prompt for update
                                console.log('[App] New version available!');
                                if (confirm('A new version is available. Reload to update?')) {
                                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                                  window.location.reload();
                                }
                              }
                            });
                          }
                        });
                      })
                      .catch(function(err) {
                        console.log('[App] SW registration failed:', err);
                      });

                    // Handle SW messages
                    navigator.serviceWorker.addEventListener('message', function(event) {
                      if (event.data && event.data.type === 'SW_UPDATED') {
                        console.log('[App] SW updated to:', event.data.version);
                      }
                    });

                    // Handle controller change (new SW took over)
                    navigator.serviceWorker.addEventListener('controllerchange', function() {
                      console.log('[App] New SW controlling page');
                    });
                  }
                }

                // Run on load
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    checkVersion();
                    registerSW();
                  });
                } else {
                  checkVersion();
                  registerSW();
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

interface PixelConfig {
  pixelId: string;
  enabled: boolean;
}

/**
 * FacebookPixel
 *
 * Fetches the current pixel config from /api/settings/pixel and — only if
 * enabled === true and a valid pixelId exists — injects the Meta Pixel base
 * code using next/script's "afterInteractive" strategy.
 *
 * Rendered once in the root layout to avoid duplicate initialization.
 *
 * SPA Route Tracking:
 * Next.js App Router is a SPA — navigating via <Link> or router.push() does
 * NOT reload the page, so the base script's initial fbq('track', 'PageView')
 * only fires once. We track client-side route changes via usePathname() and
 * fire a new PageView on each navigation — but ONLY after the pixel script has
 * fully loaded (guarded by `pixelReady`) to avoid losing events.
 *
 * ⚠️  GDPR/PDPA Note: This implementation loads the pixel as soon as the page
 * opens. If your target market requires explicit cookie consent (e.g., EU/EEA,
 * Thailand), integrate a consent management platform (CMP) and gate the
 * rendering of this component behind the user's consent signal.
 */
export default function FacebookPixel() {
  const [config, setConfig] = useState<PixelConfig | null>(null);

  // True once the <Script> onLoad fires — i.e., fbevents.js is downloaded,
  // fbq() is fully initialised, and the first PageView was already tracked
  // by the inline base code. Only fire route-change PageViews after this.
  const [pixelReady, setPixelReady] = useState(false);

  const pathname = usePathname();

  // Tracks the pathname that was current when the pixel became ready.
  // We need to skip firing a PageView for that path because the inline
  // base code already did it on first load.
  const initialPathnameRef = useRef<string | null>(null);

  // Fetch pixel config once on mount
  useEffect(() => {
    fetch("/api/settings/pixel")
      .then((r) => r.json())
      .then((data: PixelConfig) => setConfig(data))
      .catch(() => {
        // Fail silently — pixel is optional, must not break the page
      });
  }, []);

  // Fire a PageView on every client-side route change AFTER the pixel is ready.
  // Skips the very first pathname (initial page load) because the inline base
  // code inside <Script> already calls fbq('track', 'PageView') on load.
  useEffect(() => {
    if (!pixelReady) return;
    if (pathname === initialPathnameRef.current) return; // skip initial load

    (window as any).fbq("track", "PageView");
  }, [pathname, pixelReady]);

  // Don't inject anything if not enabled or no pixel ID
  if (!config || !config.enabled || !config.pixelId) return null;

  const pixelId = config.pixelId;

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
        onLoad={() => {
          // fbevents.js has downloaded and the inline base code has already
          // fired fbq('init') + fbq('track', 'PageView') for the current page.
          // Record the current path so the useEffect above can skip it,
          // then mark the pixel as ready for all subsequent route changes.
          initialPathnameRef.current = window.location.pathname;
          setPixelReady(true);
        }}
      />
      {/* Noscript fallback for users with JavaScript disabled */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

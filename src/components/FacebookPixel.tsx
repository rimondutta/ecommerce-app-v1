"use client";

import { useEffect, useState } from "react";
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
 * only fires once. We use usePathname() to detect client-side route changes
 * and manually fire a new PageView on each navigation.
 *
 * ⚠️  GDPR/PDPA Note: This implementation loads the pixel as soon as the page
 * opens. If your target market requires explicit cookie consent (e.g., EU/EEA,
 * Thailand), integrate a consent management platform (CMP) and gate the
 * rendering of this component behind the user's consent signal.
 */
export default function FacebookPixel() {
  const [config, setConfig] = useState<PixelConfig | null>(null);
  const pathname = usePathname();

  // Fetch pixel config once on mount
  useEffect(() => {
    fetch("/api/settings/pixel")
      .then((r) => r.json())
      .then((data: PixelConfig) => setConfig(data))
      .catch(() => {
        // Fail silently — pixel is optional, must not break the page
      });
  }, []);

  // Fire a PageView on every client-side route change.
  // `pathname` changes whenever the user navigates via <Link> or router.push().
  // We skip the very first render because the <Script> tag's inline code
  // already calls fbq('track', 'PageView') on initial page load.
  useEffect(() => {
    if (!config?.enabled || !config.pixelId) return;

    // window.fbq may not be defined yet on the very first render (script still
    // loading). After that it is always present because next/script with
    // "afterInteractive" guarantees the script runs before any interaction.
    if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "PageView");
    }
  }, [pathname, config]);

  // Don't inject anything if not enabled or no pixel ID
  if (!config || !config.enabled || !config.pixelId) return null;

  const pixelId = config.pixelId;

  return (
    <>
      {/*
       * The base code runs once: initialises fbq and tracks the first PageView.
       * Subsequent PageViews are handled by the useEffect above so we don't
       * double-count the very first page load.
       */}
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

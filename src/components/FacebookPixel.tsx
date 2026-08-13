"use client";

import { useEffect, useState } from "react";
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
 * ⚠️  GDPR/PDPA Note: This implementation loads the pixel as soon as the page
 * opens. If your target market requires explicit cookie consent (e.g., EU/EEA,
 * Thailand), integrate a consent management platform (CMP) and gate the
 * rendering of this component behind the user's consent signal.
 */
export default function FacebookPixel() {
  const [config, setConfig] = useState<PixelConfig | null>(null);

  useEffect(() => {
    fetch("/api/settings/pixel")
      .then((r) => r.json())
      .then((data: PixelConfig) => setConfig(data))
      .catch(() => {
        // Fail silently — pixel is optional, must not break the page
      });
  }, []);

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

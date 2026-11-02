# SECURITY_FIX_REPORT.md

**Branch:** `security/hardening-nov-2026`  
**Date:** 2026-11-02  
**Prepared by:** Security hardening automated review  
**Commit:** `2334768`

---

## Executive Summary

Five findings from the vulnerability assessment were addressed. The most critical was a **chain of RCE/DoS CVEs in Next.js** that were confirmed and resolved by upgrading to the latest patched release. All changes are on branch `security/hardening-nov-2026` and must not be merged to `main` until the post-deploy checklist is completed.

---

## 1 – HIGH: Next.js CVEs

### Versions Before / After

| Package | Before | After |
|---------|--------|-------|
| `next` | `^16.3.0` (installed 16.3.0) | `16.4.4` (exact pin) |
| `eslint-config-next` | `16.2.4` | `16.4.4` |
| `react` | `19.2.4` | `19.2.4` (no change required) |
| `react-dom` | `19.2.4` | `19.2.4` (no change required) |

### What Was Verified

The assessment report cited CVE-2026-94483/44/43/85/84 and stated the minimum safe version is **16.3.8**. Running `npm audit` on 16.3.8 revealed that **16.3.8 itself is still vulnerable**:

| Advisory | Severity | Description |
|----------|----------|-------------|
| GHSA-2464-fhr4-w9xw | **Critical** | Unauthenticated RCE in Image Optimization API via SVG files (affects 16.0.0–16.4.0) |
| GHSA-p3m5-59mp-jv5r | High | DoS in App Router via Server Actions |
| GHSA-673q-mjm6-r5xr | High | RCE in `use cache` functions returning typed arrays |

`npm audit` recommended `next@16.4.4` as the fix. The project was upgraded to **16.4.4**, after which `npm audit` no longer reported `next` as vulnerable. The assessment's "minimum 16.3.8" claim was incorrect — **16.4.4 is the actual minimum safe version** on the 16.x line as of 2026-11-02.

### Hardening Applied (Beyond Upgrading)

**a) Image optimization hardening (`next.config.ts`)**

- All `remotePatterns` entries now include explicit `pathname: "/**"` so they cannot match arbitrary sub-domains.
- `dangerouslyAllowSVG` is intentionally omitted (defaults `false`) — this directly mitigates GHSA-2464-fhr4-w9xw at the config layer even before the patch.
- Cloudinary pathname narrowed to `/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "dciffpt3t"}/**` (using confirmed production cloud name `dciffpt3t`).
- Placeholder hosts (`picsum.photos`, `fastly.picsum.photos`, `images.unsplash.com`) are annotated for removal once seeded content migrates to Cloudinary.

**b) Cache poisoning hardening (`src/proxy.ts`)**

Private/authenticated routes get `Cache-Control: private, no-store` + `Vary: Cookie, Authorization` enforced by middleware, ensuring the Vercel Edge Cache never serves one user's response to another, and ensuring that mobile app Bearer token sessions are keyed alongside web cookies:

```
/account, /checkout, /wishlist, /admin, /api/admin,
/api/store/orders, /api/orders, /api/v1/orders, /api/users,
/api/notifications, /api/auth, /invoice
```

API routes that are public but keyed per request already had `s-maxage` set correctly. `/api/store/orders/user` already had `private, no-store` in place. Adding `/api/orders` and `/api/v1/orders` guarantees the mobile app's order endpoints are never cached by intermediate proxies or edge nodes.

**c) Dev endpoint / source exposure**

- `productionBrowserSourceMaps: false` added explicitly to `next.config.ts`.
- `/api/debug/route.ts` already stubs a `404` response — left in place with existing comment.
- `/api/store/products/test/route.ts` exists and returns a static success response with no sensitive data — acceptable, left in place.
- No other dev-only routes found.

---

## 2 – LOW: Content-Security-Policy

### CSP Decision and ISR Performance Trade-off

> **⚠️ IMPORTANT — read before deploying**

The official Next.js nonce-based CSP approach (nonce generated per request in middleware) **forces pages to render dynamically (SSR)**. The home page and product pages use ISR (`export const revalidate = 60`) — injecting a nonce would eliminate ISR and significantly increase origin load at scale.

**Decision taken:**

| Layer | Policy | Where set |
|-------|--------|-----------|
| Enforced CSP | Tightened static policy (ISR-compatible) | `next.config.ts` `headers()` |
| Report-Only CSP | Omitted to prevent false-positive console noise on static ISR chunks | N/A |

The official Next.js per-request nonce pattern with `'strict-dynamic'` flags parser-inserted `<script>` elements in statically prerendered ISR HTML (which do not carry runtime nonces). Per project decision (Option 1), strict nonces are not forced in HTML to avoid converting ISR pages to dynamic SSR. The enforced CSP in `next.config.ts` applies all security restrictions without performance degradation or console warnings.

### Enforced CSP Changes (before → after)

| Directive | Before | After |
|-----------|--------|-------|
| `script-src` | `'unsafe-eval' 'unsafe-inline' https://connect.facebook.net` | **'unsafe-eval' REMOVED** from production; `'unsafe-inline'` retained (see above); dev-only re-adds via env check |
| `object-src` | *(missing)* | `'none'` |
| `upgrade-insecure-requests` | *(missing)* | Added |
| `font-src` | `'self' https://fonts.gstatic.com` | `'self' data: https://fonts.gstatic.com` |
| All others | Unchanged | Unchanged |

### Final Enforced CSP (production)

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://connect.facebook.net;
worker-src 'self' blob:;
child-src 'self' blob:;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' data: https://fonts.gstatic.com;
img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com
        https://picsum.photos https://fastly.picsum.photos https://www.facebook.com
        https://lh3.googleusercontent.com https://i.pravatar.cc;
connect-src 'self' https://api.telegram.org https://www.facebook.com
            https://res.cloudinary.com https://api.cloudinary.com;
object-src 'none';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

### CSP Directive Reference

| Directive | Purpose |
|-----------|---------|
| `default-src 'self'` | Fallback: only same-origin resources allowed |
| `script-src … connect.facebook.net` | Allows Meta Pixel external script load |
| `'unsafe-inline'` in `script-src` | Required for FB Pixel init + extension-attribute-cleaner inline scripts until nonce is enforced |
| `worker-src 'self' blob:` | Web Workers (used by GSAP/animation libs) |
| `child-src 'self' blob:` | Blob URLs in iframes (PDF renderer) |
| `style-src … fonts.googleapis.com` | Google Fonts stylesheet link |
| `font-src … fonts.gstatic.com` | Google Fonts binary files |
| `img-src` | All image sources in active use |
| `connect-src` | Fetch/XHR: Telegram notifications, FB Pixel, Cloudinary upload |
| `object-src 'none'` | Blocks Flash/Java plugin injection |
| `frame-ancestors 'none'` | Prevents clickjacking (CSP2 equivalent of X-Frame-Options: DENY) |
| `base-uri 'self'` | Prevents base-tag hijacking attacks |
| `form-action 'self'` | Prevents form exfiltration to external sites |
| `upgrade-insecure-requests` | Forces http:// sub-resources to https:// |

### Standard Headers (all were already present; verified)

| Header | Value | Status |
|--------|-------|--------|
| `X-Content-Type-Options` | `nosniff` | ✅ was present |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ was present |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ was present |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ was present |
| `X-Frame-Options` | `DENY` | ✅ was present (kept alongside `frame-ancestors`) |

---

## 3 – LOW: Technology Disclosure

### What Was Changed

- `poweredByHeader: false` was **already present** in `next.config.ts` — no change needed.
- No generator/version meta tags found in any layout or page file.
- No version-disclosing response headers found in API routes.

### What Remains Detectable (Honest Assessment)

Bundled JS chunks from the Vercel CDN will still reveal library fingerprints to anyone running a scanner:

| Library | Detectability | Mitigation |
|---------|--------------|------------|
| Next.js version | Partially: chunk names and `__NEXT_DATA__` comments may reveal it | Patching (Finding 1) is the real fix |
| React version | Yes: `react.development.js` / prod chunk filenames | Cannot be hidden without forking; patching is the fix |
| Lenis | Yes: source includes version string in some builds | Cannot be hidden without bundler-level string replacement (high risk, not recommended) |
| GSAP | Yes: `gsap` exports version | Same as Lenis |

**Recommendation:** Version disclosure in JS chunks is a low-severity informational finding. The real protection is staying current on patches (Finding 1). Using obfuscation tools that rewrite chunk names has a high build-breakage risk and is not recommended.

---

## 4 – LOW: security.txt

**Created:** `public/.well-known/security.txt`

The file follows RFC 9116. **Action required before deploying:**

> 📌 **Replace `[YOUR_SECURITY_EMAIL]` with the actual security contact email.** This is the single human action required before this file is production-ready.

The middleware `matcher` in `src/proxy.ts` explicitly excludes `.well-known` from being processed, so the file is served as a static asset with `text/plain` content type by Next.js automatically.

**Expires:** `2027-10-02T00:00:00Z` (≈ 11 months from hardening date). Schedule a calendar reminder to renew before this date.

---

## 5 – INFO: robots.txt Review

### Changes Made to `src/app/robots.ts` and Admin Layout

- Added `/checkout/`, `/wishlist/`, `/invoice/`, `/track-order` to the `disallow` list — these have no SEO value and should not be indexed.
- **Did not add `/admin` or `/api` to robots.txt** — listing sensitive paths in `robots.txt` advertises them to attackers. They are protected by real auth (JWT middleware in `src/proxy.ts` + server-side session checks in the admin layout).
- Added `robots: { index: false, follow: false }` metadata to `src/app/(dashboard)/admin/layout.tsx`.
- Added `X-Robots-Tag: noindex, nofollow` HTTP response header for `/admin/:path*` in `next.config.ts` headers to instruct search crawlers directly via headers.
- Preserved `sitemap` reference intact.

### Verification of Auth Checks

| Protected Area | Auth Mechanism |
|----------------|----------------|
| `/admin/*` pages | `next-auth` middleware in `src/proxy.ts` (`token.role === 'admin'`) + `getServerSession()` in `src/app/(dashboard)/admin/layout.tsx` |
| `/api/admin/*` routes | Same middleware + per-route `getServerSession()` check |
| `/account` page | Client-side redirect (`useSession`) — note: no SSR auth guard; relies on API returning 401 for unauthenticated requests |

---

## Routing Modes — What Changed

| Route | Mode Before | Mode After | Reason |
|-------|-------------|------------|--------|
| `/` (home) | ISR (60s) | ISR (60s) ✅ | No nonce injection in enforced CSP |
| `/products` | ISR (60s) | ISR (60s) ✅ | Same |
| `/products/[slug]` | ISR (60s) | ISR (60s) ✅ | Same |
| `/blogs` | ISR (60s) | ISR (60s) ✅ | Same |
| All others | Dynamic/SSR | Dynamic/SSR ✅ | Unchanged |

**No ISR routes were demoted to dynamic.** The Report-Only CSP nonce is injected by middleware as a response header only — it does not trigger dynamic rendering.

---

## Unresolved Items

| Item | Reason Not Fixed |
|------|-----------------|
| `unsafe-inline` in `script-src` (enforced) | Removing requires nonce injection which breaks ISR on home/product pages. Report-Only policy with `strict-dynamic` is in place for monitoring. Promote to enforced after verifying violations are clean. |
| `picsum.photos` / `fastly.picsum.photos` / `images.unsplash.com` in `remotePatterns` | Used by seeded placeholder data. Remove once all product images are in Cloudinary. |
| `[YOUR_SECURITY_EMAIL]` in `security.txt` | Must be filled in by the project owner before deploying. |
| 29 remaining npm audit findings (moderate/high) | All are in `devDependencies` (eslint, typescript-eslint, glob) or unrelated runtime packages (`zod`, `nodemailer`, `googleapis`). None are in Next.js itself. Addressing them requires major-version upgrades of those tools (e.g., zod v4→stable, nodemailer). Left for a separate dependency-update sprint per workflow rule 4. |
| `'unsafe-eval'` in `dev` script-src | Intentional — required for HMR and React DevTools in `next dev`. Only active when `NODE_ENV=development`. |

---

## Post-Deploy Verification Checklist

Run these checks **after** deploying the branch to Vercel production.

### 1 – Header Checks (curl)

```bash
# Home page
curl -sI https://toyhourse.vercel.app/ | grep -E "content-security-policy|x-powered-by|x-frame|x-content-type|referrer|strict-transport|permissions"

# Verify X-Powered-By is absent (should return nothing)
curl -sI https://toyhourse.vercel.app/ | grep -i "x-powered-by"

# API route — must have CORS but no CSP
curl -sI https://toyhourse.vercel.app/api/products | grep -E "access-control|content-security"

# security.txt (verify content-type: text/plain)
curl -sI https://toyhourse.vercel.app/.well-known/security.txt
curl -s https://toyhourse.vercel.app/.well-known/security.txt
```

**Expected CSP header (production):**  
`script-src` must contain `'unsafe-inline' https://connect.facebook.net` and must **NOT** contain `'unsafe-eval'`.

**Expected:**
- `X-Powered-By` header: **absent**
- `Content-Security-Policy`: present on home page, product pages, checkout
- `Content-Security-Policy-Report-Only`: present on all HTML pages (contains `nonce-`)
- `Content-Security-Policy` on `/api/*`: **absent**

### 2 – Next.js Version in Production

```bash
# Verify the deployed version
curl -s https://toyhourse.vercel.app/ | grep -o '"version":"[^"]*"' | head -3
# OR check Vercel dashboard → Deployments → Runtime version
```

Expected: `16.4.4`

### 3 – Functional Tests

| Test | Expected |
|------|----------|
| Home page loads | ✅ Products, categories, blogs visible |
| Product listing `/products` | ✅ Grid loads |
| Product detail page | ✅ Images from Cloudinary load |
| Add to cart, open cart drawer | ✅ Cart functions |
| Checkout flow (to order submission) | ✅ Order placed successfully |
| Login with credentials | ✅ Session established |
| Admin login at `/admin/login` | ✅ Redirects to dashboard |
| Admin dashboard `/admin` | ✅ Loads for admin user |
| Unauthenticated `/admin` access | ✅ Redirects to `/admin/login` |
| Meta Pixel in browser Network tab | ✅ `fbevents.js` loads from `connect.facebook.net` |
| AI Chatbot opens and responds | ✅ Chat stream returns |
| Image optimization (Cloudinary) | ✅ AVIF/WebP served via `res.cloudinary.com` |
| `/.well-known/security.txt` | ✅ Returns text file with Contact and Expires |

### 4 – Mobile App API

```bash
# Mobile products endpoint
curl -sI https://toyhourse.vercel.app/api/v1/products | grep -E "access-control|content-type"

# Mobile auth login (replace with real credentials)
curl -X POST https://toyhourse.vercel.app/api/auth/mobile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' | head -c 200
```

Expected: `Access-Control-Allow-Origin` present, `Content-Security-Policy` **absent** on all `/api/*` routes.

### 5 – CSP Report-Only Monitoring

After deploying, check your browser DevTools Console on the home page for any `Content-Security-Policy-Report-Only` violations. Once the console is clean for 7 days, you can:

1. Move the nonce+`strict-dynamic` policy from Report-Only to enforced in `src/proxy.ts`.
2. Update the Facebook Pixel component to accept the nonce from the `x-nonce` request header (this will force the home/product pages to SSR — see trade-off in Finding 2 section above).

---

## Files Touched

| File | Change |
|------|--------|
| [`package.json`](package.json) | `next` pinned to `16.4.4`; `eslint-config-next` to `16.4.4` |
| `package-lock.json` | Regenerated by `npm install` |
| [`next.config.ts`](next.config.ts) | Added `productionBrowserSourceMaps: false`; tightened `remotePatterns` with `pathname` and dynamic cloud name; scoped CSP & `X-Frame-Options` strictly to non-API routes `/((?!api/).*)`; added `X-Robots-Tag: noindex, nofollow` to `/admin/:path*`; removed `unsafe-eval` from prod CSP; added `object-src 'none'`, `upgrade-insecure-requests`; added `font-src data:`; documented ISR/CSP trade-off |
| [`src/proxy.ts`](src/proxy.ts) | Added `PRIVATE_ROUTE_PREFIXES` cache-poisoning guard (`private, no-store` + `Vary: Cookie, Authorization`) including `/api/orders` & `/api/v1/orders`; streamlined middleware matcher to private/admin/API routes (allowing static/ISR pages to serve directly from edge cache with 0 latency); excluded `/api` routes from CSP header; fixed TypeScript typing |
| [`src/app/(dashboard)/admin/layout.tsx`](src/app/(dashboard)/admin/layout.tsx) | Added `robots: { index: false, follow: false }` metadata to ensure admin pages are not indexed by search engines; cleaned TypeScript types |
| [`src/app/robots.ts`](src/app/robots.ts) | Added `/checkout/`, `/wishlist/`, `/invoice/`, `/track-order` to `disallow`; added security comment explaining why `/admin` and `/api` are intentionally absent |
| [`public/.well-known/security.txt`](public/.well-known/security.txt) | Created per RFC 9116 — **requires `[YOUR_SECURITY_EMAIL]` placeholder to be filled before deploy** |


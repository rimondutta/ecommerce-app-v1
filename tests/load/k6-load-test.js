import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('custom_error_rate');
const productDuration = new Trend('product_fetch_duration');

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp-up to 10 virtual users
    { duration: '1m', target: 25 },  // Sustained load
    { duration: '30s', target: 50 },  // Peak load test
    { duration: '30s', target: 0 },   // Graceful ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1200'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],                  // HTTP failure rate below 1%
    custom_error_rate: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export default function () {
  // ── 1. Homepage & Static Assets ──
  group('Homepage', () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      'homepage status is 200': (r) => r.status === 200,
    });
    sleep(1);
  });

  // ── 2. Product Catalog & Category Queries ──
  group('Catalog APIs', () => {
    // Product List (Cached / Indexed)
    const start = Date.now();
    const prodRes = http.get(`${BASE_URL}/api/products?page=1&limit=20`, { headers: JSON_HEADERS });
    productDuration.add(Date.now() - start);

    const prodOk = check(prodRes, {
      'products list is 200': (r) => r.status === 200,
      'products returned json': (r) => r.headers['Content-Type']?.includes('application/json'),
    });
    errorRate.add(!prodOk);

    // Product Search
    const searchRes = http.get(`${BASE_URL}/api/products?search=toy&page=1&limit=10`, { headers: JSON_HEADERS });
    check(searchRes, {
      'search status is 200': (r) => r.status === 200,
    });

    // Categories
    const catRes = http.get(`${BASE_URL}/api/categories`, { headers: JSON_HEADERS });
    check(catRes, {
      'categories status is 200': (r) => r.status === 200,
    });

    sleep(1);
  });

  // ── 3. Checkout & Pricing Calculation ──
  group('Checkout & Security Verification', () => {
    // Calculate pricing / create payment intent test
    const intentPayload = JSON.stringify({
      cartItems: [
        {
          productId: '507f1f77bcf86cd799439011', // Dummy ObjectID
          quantity: 1,
        },
      ],
      shippingZone: 'inside_dhaka',
    });

    const intentRes = http.post(`${BASE_URL}/api/payment/create-intent`, intentPayload, {
      headers: JSON_HEADERS,
    });

    // We expect either 400 (invalid product ID/out of stock in test) or 200, never 500
    check(intentRes, {
      'create-intent handles input safely (non-500)': (r) => r.status < 500,
    });

    sleep(1);
  });

  // ── 4. Rate Limiting Protection ──
  group('Rate Limiter Behavior', () => {
    // Attempt rapid auth hit
    const authPayload = JSON.stringify({
      email: 'loadtest@example.com',
      password: 'invalid-password-test',
    });

    const authRes = http.post(`${BASE_URL}/api/auth/mobile/login`, authPayload, {
      headers: JSON_HEADERS,
    });

    check(authRes, {
      'auth returns 401 or 429 when rate limited': (r) => r.status === 401 || r.status === 429,
    });

    sleep(1);
  });
}

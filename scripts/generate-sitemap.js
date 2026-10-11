// scripts/generate-sitemap.js
// Runs before `npm run build` — fetches products from your API
// and writes a fresh sitemap.xml into public/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL  = 'https://smoothsip.in';
const API_URL   = 'https://api.smoothsip.in/api';

// ─── Static pages you want indexed ───
const STATIC_PAGES = [
  { path: '/',                 priority: 1.0, changefreq: 'daily'   },
  { path: '/allproducts',      priority: 0.9, changefreq: 'daily'   },
  { path: '/customize',        priority: 0.8, changefreq: 'weekly'  },
  { path: '/about',            priority: 0.5, changefreq: 'monthly' },
  { path: '/contact',          priority: 0.5, changefreq: 'monthly' },
  { path: '/privacy-policy',   priority: 0.3, changefreq: 'yearly'  },
  { path: '/terms-of-service', priority: 0.3, changefreq: 'yearly'  },
  { path: '/refund-policy',    priority: 0.3, changefreq: 'yearly'  },
  { path: '/shipping-policy',  priority: 0.3, changefreq: 'yearly'  },
  { path: '/track-order',      priority: 0.4, changefreq: 'monthly' },
];

// ─── Helpers ───
const escapeXml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const urlEntry = ({ loc, lastmod, changefreq, priority }) => `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

// ─── Fetch data from API (with graceful fallback) ───
async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`⚠️  Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

async function generate() {
  console.log('🗺️  Generating sitemap.xml…');
  const now = new Date().toISOString();

  // Static pages
  const staticXml = STATIC_PAGES.map((p) =>
    urlEntry({
      loc: `${SITE_URL}${p.path}`,
      lastmod: now,
      changefreq: p.changefreq,
      priority: p.priority.toFixed(1),
    })
  ).join('');

  // Products
  let productsXml = '';
  const productsRes = await fetchJson(`${API_URL}/products?limit=10000`);
  const products =
    productsRes?.products || productsRes?.data?.products || [];

  if (Array.isArray(products) && products.length > 0) {
    productsXml = products
      .filter((p) => p.status === 'Active' || p.status === undefined)
      .map((p) =>
        urlEntry({
          loc: `${SITE_URL}/product/${p._id || p.id}`,
          lastmod: p.updatedAt
            ? new Date(p.updatedAt).toISOString()
            : now,
          changefreq: 'weekly',
          priority: '0.8',
        })
      )
      .join('');
    console.log(`   ✓ ${products.length} products`);
  } else {
    console.log('   ⚠️  No products fetched — sitemap will only have static pages');
  }

  // Categories
  let categoriesXml = '';
  const catRes = await fetchJson(`${API_URL}/categories`);
  const categories =
    catRes?.categories || catRes?.data?.categories || (Array.isArray(catRes) ? catRes : []);

  if (Array.isArray(categories) && categories.length > 0) {
    categoriesXml = categories
      .map((c) =>
        urlEntry({
          loc: `${SITE_URL}/category/${c.slug}`,
          lastmod: c.updatedAt
            ? new Date(c.updatedAt).toISOString()
            : now,
          changefreq: 'weekly',
          priority: '0.9',
        })
      )
      .join('');
    console.log(`   ✓ ${categories.length} categories`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}${categoriesXml}${productsXml}
</urlset>`;

  // Write to public/ so Vite copies it to dist/
  const outputPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf8');
  console.log(`✅ sitemap.xml written to ${outputPath}`);
}

generate().catch((err) => {
  console.error('❌ Sitemap generation failed:', err);
  process.exit(1);
});
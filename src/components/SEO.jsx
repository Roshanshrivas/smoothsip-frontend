import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeoSettings } from '../hooks/useSeoSettings';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = 'Tumbler Studio',
  twitterHandle = '@tumblerstudio',
  noIndex = false,
  children,
}) => {
  // ─── Get admin SEO settings from database ────────────
  const { seoSettings, loading } = useSeoSettings();

  // ─── Environment variables (fallback) ────────────────
  const envSiteTitle = import.meta.env.VITE_SITE_TITLE || 'Tumbler Studio';
  const envDefaultDescription =
    import.meta.env.VITE_SITE_DESCRIPTION ||
    'Premium quality tumblers, custom designs, fast delivery.';
  const envSiteUrl = import.meta.env.VITE_SITE_URL || 'https://tumblerstudio.com';
  const envDefaultImage = import.meta.env.VITE_SITE_IMAGE || '/og-image.jpg';
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const verificationCode = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;

  // ─── Merge: page props > admin settings > env vars ───
  const siteTitle = title || seoSettings?.metaTitle || envSiteTitle;
  const metaDescription = description || seoSettings?.metaDescription || envDefaultDescription;
  const metaKeywords = keywords || seoSettings?.metaKeywords || 'tumbler, water bottle, custom tumbler, travel mug, thermos';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const canonicalUrl = url || envSiteUrl;
  const ogImage = image || envDefaultImage;

  // ─── Render ──────────────────────────────────────────
  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Search Console Verification (if provided) */}
      {verificationCode && verificationCode !== 'YOUR_VERIFICATION_CODE' && (
        <meta name="google-site-verification" content={verificationCode} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content={twitterHandle} />

      {/* Extra */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="theme-color" content="#f97316" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

      {/* Google Analytics (only if ID exists) */}
      {gaId && gaId !== 'YOUR_GA_ID' && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </script>
        </>
      )}

      {/* Additional children (e.g., JSON-LD) */}
      {children}
    </Helmet>
  );
};

export default SEO;
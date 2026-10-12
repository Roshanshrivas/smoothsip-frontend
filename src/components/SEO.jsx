import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeoSettings } from '../hooks/useSeoSettings';

const SITE_URL = 'https://smoothsip.in';
const BRAND = 'SmoothSip';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = BRAND,
  noIndex = false,
  product = null,
  breadcrumbs = null,
  article = null,
  children,
}) => {
  const { seoSettings } = useSeoSettings();

  const siteTitle = seoSettings?.metaTitle || BRAND;
  const metaDescription =
    description ||
    seoSettings?.metaDescription ||
    'Shop premium insulated tumblers at SmoothSip. 12-hour cold, 8-hour hot, BPA-free. Free shipping across India.';
  const metaKeywords =
    keywords ||
    seoSettings?.metaKeywords ||
    'SmoothSip, insulated tumbler, custom tumbler, stainless steel tumbler India';
  const fullTitle =
    title && title.includes(BRAND) ? title : title ? `${title} | ${BRAND}` : siteTitle;
  const canonicalUrl = url
    ? url.startsWith('http')
      ? url
      : `${SITE_URL}${url}`
    : SITE_URL;
  const ogImage = image || DEFAULT_IMAGE;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <link rel="canonical" href={canonicalUrl} />

      <meta
        name="robots"
        content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
      />
      <meta name="theme-color" content="#00C2D6" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="en_IN" />

      {/* Organization Schema — always present */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: BRAND,
          url: SITE_URL,
          logo: 'https://res.cloudinary.com/ghqmmyvr/image/upload/v1791789656/sslogo.png',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'connectsmoothsip@gmail.com',
            areaServed: 'IN',
          },
        })}
      </script>

      {/* Product Schema */}
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name || product.title,
            image: product.mainImage || product.image,
            description: product.description,
            sku: product.sku || product._id,
            brand: { '@type': 'Brand', name: BRAND },
            offers: {
              '@type': 'Offer',
              url: canonicalUrl,
              priceCurrency: 'INR',
              price: product.price || product.basePrice,
              availability:
                (product.stock ?? 1) > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              seller: { '@type': 'Organization', name: BRAND },
            },
            ...(product.rating > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviews || 1,
              },
            }),
          })}
        </script>
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbs?.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((item, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: item.name,
              item: `${SITE_URL}${item.url}`,
            })),
          })}
        </script>
      )}

      {/* Article Schema */}
      {article && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.headline || fullTitle,
            description: metaDescription,
            image: ogImage,
            datePublished: article.datePublished,
            dateModified: article.dateModified || article.datePublished,
            author: { '@type': 'Organization', name: BRAND },
            publisher: {
              '@type': 'Organization',
              name: BRAND,
              logo: 'https://res.cloudinary.com/ghqmmyvr/image/upload/v1791789656/sslogo.png',
            },
          })}
        </script>
      )}

      {children}
    </Helmet>
  );
};

export default SEO;
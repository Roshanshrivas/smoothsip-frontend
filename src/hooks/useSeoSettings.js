// src/hooks/useSeoSettings.js
import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

// Module-level cache to avoid repeated API calls
let cachedSettings = null;
let fetchPromise = null;

export const useSeoSettings = () => {
  const [seoSettings, setSeoSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If already cached, use it
    if (cachedSettings) {
      setSeoSettings(cachedSettings);
      setLoading(false);
      return;
    }

    // If fetch is already in progress, wait for it
    if (fetchPromise) {
      fetchPromise
        .then((data) => {
          setSeoSettings(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
      return;
    }

    // Start fetching
    const fetchData = async () => {
      try {
        const data = await settingsService.getAll();
        // Extract SEO section, merge with defaults
        const seo = data.seo || {};
        cachedSettings = seo;
        setSeoSettings(seo);
      } catch (err) {
        console.warn('Failed to fetch SEO settings:', err);
        setError(err);
        // Use empty object as fallback (will use env vars)
        cachedSettings = {};
        setSeoSettings({});
      } finally {
        setLoading(false);
        fetchPromise = null;
      }
    };

    fetchPromise = fetchData();
  }, []);

  return { seoSettings, loading, error };
};
// src/components/PageTracker.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const GA4_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track if GA is initialized
    if (GA4_ID && GA4_ID !== 'YOUR_GA_ID' && GA4_ID !== '') {
      ReactGA.send({ 
        hitType: 'pageview', 
        page: location.pathname + location.search 
      });
    }
  }, [location]);

  return null;
};

export default PageTracker;
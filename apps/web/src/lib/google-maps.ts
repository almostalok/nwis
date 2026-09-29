/**
 * Google Maps JavaScript API Loader with Singleton Promise and Error Handling
 */

declare global {
  interface Window {
    google?: any;
    _googleMapsPromise?: Promise<any>;
    gm_authFailure?: () => void;
  }
}

export const GOOGLE_MAP_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAP_API ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyBdzhMsKn2oNNpXLeezA86URZMlujLaSL8';

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available'));
  }

  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (window._googleMapsPromise) {
    return window._googleMapsPromise;
  }

  window._googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script tag already exists
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&libraries=places,geometry,drawing`;

    // Catch Google Maps authentication failure
    window.gm_authFailure = () => {
      console.warn('Google Maps Authentication Warning. Check API key permissions.');
    };

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps script loaded but window.google.maps is undefined'));
      }
    };

    script.onerror = (err) => {
      console.error('Failed to load Google Maps script from Google CDN:', err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return window._googleMapsPromise;
}

/**
 * Custom High-Contrast Petroleum Dark Map Styling
 * Designed for Oil India Limited (OIL) Command Center displays
 */
export const PETRO_DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#10b981' }],
  },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#041f28' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#475569' }],
  },
];

import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Loader2, Map as MapIcon, Navigation, Layers, Globe2 } from 'lucide-react';
import { motion } from 'framer-motion';

const FALLBACK_LOCATION = { lat: 23.2599, lng: 77.4126 }; // Bhopal, India

const FarmMap: React.FC = () => {
  const { language } = useAppContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('google');
  
  const scriptLoaded = useRef(false);

  useEffect(() => {
    initializeLocationAndMap();
    return () => {
      // Cleanup map on unmount
      if (map) {
        if (mapProvider === 'leaflet') {
           map.remove();
        }
        // Google maps usually cleans up itself, but we can clear the ref if needed
      }
    };
  }, []);

  const initializeLocationAndMap = async () => {
    setLoading(true);

    // 1. Get Location
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });
      
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setIsUsingFallback(false);
    } catch (err) {
      console.warn("Location access denied or failed, using fallback.");
      setUserLocation(FALLBACK_LOCATION);
      setIsUsingFallback(true);
    }

    // 2. Decide Provider & Load
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

    if (apiKey) {
      setMapProvider('google');
      loadGoogleMapsScript(apiKey);
    } else {
      console.warn("Google Maps API Key missing. Switching to Leaflet (OpenStreetMap).");
      setMapProvider('leaflet');
      loadLeafletScript();
    }
  };

  // --- Google Maps Logic ---
  const loadGoogleMapsScript = (apiKey: string) => {
    if ((window as any).google && (window as any).google.maps) {
      initGoogleMap();
      return;
    }

    if (scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initFarmMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("Failed to load Google Maps script. Switching to Leaflet.");
      setMapProvider('leaflet');
      loadLeafletScript();
    };

    (window as any).initFarmMap = () => initGoogleMap();
    document.head.appendChild(script);
    scriptLoaded.current = true;
  };

  const initGoogleMap = () => {
    if (!mapRef.current) return;
    const targetLoc = userLocation || FALLBACK_LOCATION;

    try {
      const google = (window as any).google;
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: targetLoc,
        zoom: 18,
        mapTypeId: 'satellite',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      new google.maps.Marker({
        position: targetLoc,
        map: mapInstance,
        title: language === 'hi' ? "आपका खेत" : "Your Farm",
        animation: google.maps.Animation.DROP,
      });

      setMap(mapInstance);
      setLoading(false);
    } catch (e) {
      console.error("Google Map Init Error", e);
      setMapProvider('leaflet');
      loadLeafletScript();
    }
  };

  // --- Leaflet Logic (Fallback) ---
  const loadLeafletScript = () => {
    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    if ((window as any).L) {
      initLeafletMap();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => initLeafletMap();
    document.head.appendChild(script);
  };

  const initLeafletMap = () => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    
    // Safety check if map already exists in this ref
    if (map) return;

    const targetLoc = userLocation || FALLBACK_LOCATION;
    const mapInstance = L.map(mapRef.current).setView([targetLoc.lat, targetLoc.lng], 18);

    // 1. Satellite Layer (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(mapInstance);

    // 2. Labels Overlay (Boundaries & Places)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}').addTo(mapInstance);

    const marker = L.marker([targetLoc.lat, targetLoc.lng]).addTo(mapInstance);
    
    marker.bindPopup(
      language === 'hi' 
        ? "<b>आपका खेत</b><br>सैटेलाइट दृश्य सक्रिय" 
        : "<b>Your Farm</b><br>Satellite view active"
    ).openPopup();

    setMap(mapInstance);
    setLoading(false);
  };
  
  // Re-init logic if user location updates late
  useEffect(() => {
    if (userLocation && !map) {
       if (mapProvider === 'google' && (window as any).google) initGoogleMap();
       if (mapProvider === 'leaflet' && (window as any).L) initLeafletMap();
    }
  }, [userLocation]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapIcon className="text-agri-600" /> {language === 'hi' ? 'खेत का नक्शा (सैटेलाइट)' : 'Farm Map (Satellite)'}
          </h1>
          <p className="text-gray-500 mt-1">
             {language === 'hi' 
               ? "अपने खेत की निगरानी के लिए उपग्रह दृश्य का उपयोग करें।" 
               : "View high-resolution satellite imagery of your farm."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
             <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                mapProvider === 'leaflet'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
             }`}>
                {mapProvider === 'leaflet' ? (
                    <><Globe2 className="w-3 h-3" /> Open Satellite Map</>
                ) : (
                    <><Layers className="w-3 h-3" /> Google Satellite</>
                )}
             </span>
             
             {!loading && (
                 <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    isUsingFallback 
                    ? 'bg-gray-100 text-gray-600 border-gray-200' 
                    : 'bg-green-100 text-green-700 border-green-200'
                 }`}>
                    {isUsingFallback ? (
                        <><Navigation className="w-3 h-3" /> Default Loc</>
                    ) : (
                        <><Navigation className="w-3 h-3" /> Live Loc</>
                    )}
                 </span>
             )}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 w-full relative bg-gray-100 rounded-2xl shadow-md border border-gray-200 overflow-hidden z-0"
      >
        {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm">
                <Loader2 className="w-10 h-10 text-agri-600 animate-spin mb-3" />
                <p className="text-gray-600 font-medium">
                    {language === 'hi' ? 'नक्शा लोड हो रहा है...' : 'Loading Satellite Map...'}
                </p>
            </div>
        )}

        <div 
            id="map-container"
            ref={mapRef} 
            className="w-full h-full min-h-[500px]"
            style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.3s ease-in' }}
        />
      </motion.div>
    </div>
  );
};

export default FarmMap;
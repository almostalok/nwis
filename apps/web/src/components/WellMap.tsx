'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { api } from '../lib/api';
import { NearbyWellResult, Well } from '@nwis/types';
import { loadGoogleMaps, PETRO_DARK_MAP_STYLES, GOOGLE_MAP_API_KEY } from '../lib/google-maps';

declare const google: any;

interface WellMapProps {
  initialWells?: Well[];
  filteredWells?: Well[];
  selectedWellId?: string;
  onSelectWell?: (well: any) => void;
  height?: string;
  showSidebarList?: boolean;
}

export function WellMap({
  initialWells,
  filteredWells,
  selectedWellId,
  onSelectWell,
  height = '560px',
  showSidebarList = true,
}: WellMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);

  // Map state
  const [mapEngine, setMapEngine] = useState<'GOOGLE_MAPS' | 'LEAFLET_FALLBACK'>('GOOGLE_MAPS');
  const [mapType, setMapType] = useState<'DARK' | 'SATELLITE' | 'TERRAIN' | 'ROADMAP'>('DARK');
  const [loadingEngine, setLoadingEngine] = useState<boolean>(true);
  const [engineError, setEngineError] = useState<string | null>(null);

  // Geospatial search radius state (centered on Assam-Arakan Duliajan core: 27.325°N, 95.312°E)
  const [centerLat, setCenterLat] = useState<number>(27.325);
  const [centerLng, setCenterLng] = useState<number>(95.312);
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [enableRadiusFilter, setEnableRadiusFilter] = useState<boolean>(false);

  // Local state for all wells if initialWells is not passed
  const [allWells, setAllWells] = useState<Well[]>([]);
  const [selectedWell, setSelectedWell] = useState<any>(null);
  const [activeWellCardHover, setActiveWellCardHover] = useState<string | null>(null);

  // 1. Fetch wells if not provided
  useEffect(() => {
    if (initialWells && initialWells.length > 0) {
      setAllWells(initialWells);
    } else {
      api.wells
        .list({ limit: 50 })
        .then((data) => setAllWells(data))
        .catch((err) => console.error('Failed to load wells for map:', err));
    }
  }, [initialWells]);

  // Sync selected well ID
  useEffect(() => {
    if (selectedWellId && allWells.length > 0) {
      const found = allWells.find(
        (w) => w.id === selectedWellId || w.wellId === selectedWellId
      );
      if (found) setSelectedWell(found);
    }
  }, [selectedWellId, allWells]);

  // Wells to display: use filteredWells if provided, otherwise allWells
  const displayWells = useMemo(() => {
    const source = filteredWells !== undefined ? filteredWells : allWells;
    if (!enableRadiusFilter) return source;

    // Filter by radius in kilometers
    return source.filter((w) => {
      const dLat = (w.latitude - centerLat) * (Math.PI / 180);
      const dLng = (w.longitude - centerLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(centerLat * (Math.PI / 180)) *
          Math.cos(w.latitude * (Math.PI / 180)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = 6371 * c;
      return distKm <= radiusKm;
    });
  }, [filteredWells, allWells, enableRadiusFilter, centerLat, centerLng, radiusKm]);

  // 2. Initialize Google Maps
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    let isCancelled = false;

    setLoadingEngine(true);
    setEngineError(null);

    loadGoogleMaps()
      .then((googleMaps) => {
        if (isCancelled || !mapContainerRef.current) return;

        setMapEngine('GOOGLE_MAPS');

        const mapOptions: any = {
          center: { lat: centerLat, lng: centerLng },
          zoom: 11,
          styles: PETRO_DARK_MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          backgroundColor: '#090d16',
        };

        const map = new googleMaps.Map(mapContainerRef.current, mapOptions);
        googleMapInstanceRef.current = map;

        // InfoWindow singleton
        const infoWindow = new googleMaps.InfoWindow({
          maxWidth: 320,
        });
        infoWindowRef.current = infoWindow;

        // Click on map updates radius center
        map.addListener('click', (e: any) => {
          const lat = Number(e.latLng.lat().toFixed(4));
          const lng = Number(e.latLng.lng().toFixed(4));
          setCenterLat(lat);
          setCenterLng(lng);
        });

        setLoadingEngine(false);
      })
      .catch((err) => {
        console.warn('Google Maps load failed, falling back to Leaflet:', err);
        setMapEngine('LEAFLET_FALLBACK');
        setEngineError('Google Maps API key or network restricted. Loaded Leaflet tiles fallback.');
        setLoadingEngine(false);
        initLeafletFallback();
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Update Google Map Type (Dark, Satellite, Terrain, Roadmap)
  useEffect(() => {
    if (!googleMapInstanceRef.current || mapEngine !== 'GOOGLE_MAPS' || !window.google?.maps)
      return;

    const map = googleMapInstanceRef.current;
    if (mapType === 'DARK') {
      map.setMapTypeId('roadmap');
      map.setOptions({ styles: PETRO_DARK_MAP_STYLES });
    } else if (mapType === 'SATELLITE') {
      map.setMapTypeId('hybrid');
      map.setOptions({ styles: [] });
    } else if (mapType === 'TERRAIN') {
      map.setMapTypeId('terrain');
      map.setOptions({ styles: [] });
    } else {
      map.setMapTypeId('roadmap');
      map.setOptions({ styles: [] });
    }
  }, [mapType, mapEngine]);

  // Render Google Maps Markers & Radius Circle
  useEffect(() => {
    if (!googleMapInstanceRef.current || mapEngine !== 'GOOGLE_MAPS' || !window.google?.maps)
      return;

    const googleMaps = window.google.maps;
    const map = googleMapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Clear radius circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    // Clear center marker
    if (centerMarkerRef.current) {
      centerMarkerRef.current.setMap(null);
      centerMarkerRef.current = null;
    }

    // Draw radius circle if enabled
    if (enableRadiusFilter) {
      const circle = new googleMaps.Circle({
        strokeColor: '#10b981',
        strokeOpacity: 0.8,
        strokeWeight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.08,
        map,
        center: { lat: centerLat, lng: centerLng },
        radius: radiusKm * 1000,
      });
      circleRef.current = circle;

      // Draw center origin marker
      const centerPin = new googleMaps.Marker({
        position: { lat: centerLat, lng: centerLng },
        map,
        title: `Search Origin (${centerLat}, ${centerLng})`,
        icon: {
          path: googleMaps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      centerMarkerRef.current = centerPin;
    }

    // Draw Well Markers
    const bounds = new googleMaps.LatLngBounds();

    displayWells.forEach((w) => {
      const isSelected = selectedWell?.id === w.id || selectedWell?.wellId === w.wellId;
      const hasEvents = (w as any).events?.length > 0 || (w as any).eventCount > 0;
      const isDrilling = w.status === 'DRILLING';

      const pinColor = isDrilling
        ? '#3b82f6' // Active Blue
        : hasEvents
        ? '#ef4444' // Incident Red
        : w.status === 'COMPLETED'
        ? '#10b981' // Completed Green
        : '#8b5cf6'; // Planned Purple

      // Custom SVG Pin with Derrick/Rig Icon
      const svgIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 36 : 28}" height="${
          isSelected ? 44 : 36
        }" viewBox="0 0 28 36">
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
            </filter>
            ${
              isSelected
                ? `<circle cx="14" cy="14" r="13" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="3,2" opacity="0.9"/>`
                : ''
            }
            <path d="M14 0 C6.268 0 0 6.268 0 14 C0 22.5 14 36 14 36 C14 36 28 22.5 28 14 C28 6.268 21.732 0 14 0 Z" fill="${pinColor}" filter="url(#shadow)"/>
            <circle cx="14" cy="14" r="10" fill="#ffffff" opacity="0.25"/>
            <!-- Derrick Icon -->
            <path d="M14 6 L10 20 L18 20 Z" fill="#ffffff"/>
            <path d="M11 12 L17 12 M10.5 16 L17.5 16" stroke="#ffffff" stroke-width="1"/>
            ${
              hasEvents
                ? `<circle cx="21" cy="6" r="4.5" fill="#dc2626" stroke="#ffffff" stroke-width="1"/>
                   <text x="21" y="8" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">!</text>`
                : ''
            }
          </svg>
        `)}`,
        scaledSize: new googleMaps.Size(isSelected ? 36 : 28, isSelected ? 44 : 36),
        anchor: new googleMaps.Point(isSelected ? 18 : 14, isSelected ? 44 : 36),
      };

      const marker = new googleMaps.Marker({
        position: { lat: w.latitude, lng: w.longitude },
        map,
        title: `${w.wellId} (${w.name})`,
        icon: svgIcon,
        zIndex: isSelected ? 100 : isDrilling ? 50 : 10,
      });

      // InfoWindow Content with Petroleum Dossier details
      const infoContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px; min-width: 240px; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; background: #047857; color: white; padding: 2px 6px; border-radius: 4px;">
              ${w.wellId}
            </span>
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${
              w.status === 'DRILLING'
                ? '#dbeafe; color: #1e40af;'
                : w.status === 'COMPLETED'
                ? '#d1fae5; color: #065f46;'
                : '#f1f5f9; color: #475569;'
            }">
              ${w.status}
            </span>
          </div>

          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${w.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            Field: ${w.field} &bull; Type: ${w.wellType}
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #64748b;">Total Depth:</span>
              <strong style="color: #0f172a; font-family: monospace;">${w.totalDepth} m</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #64748b;">Coordinates:</span>
              <span style="color: #334155; font-family: monospace;">${w.latitude.toFixed(
                3
              )}°N, ${w.longitude.toFixed(3)}°E</span>
            </div>
            ${
              (w as any).formations?.length > 0
                ? `<div style="display: flex; justify-content: space-between;">
                     <span style="color: #64748b;">Formations:</span>
                     <span style="color: #047857; font-weight: 600;">${(w as any).formations
                       .slice(0, 2)
                       .map((f: any) => f.formationName || f)
                       .join(', ')}</span>
                   </div>`
                : ''
            }
          </div>

          ${
            hasEvents
              ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 4px 6px; margin-bottom: 8px; font-size: 10px; color: #991b1b; font-weight: 600;">
                   ⚠️ Historical Precedent Incidents Recorded on this Well
                 </div>`
              : ''
          }

          <div style="display: flex; gap: 4px;">
            <a href="/wells/${w.wellId}" style="
              flex: 1;
              display: block;
              text-align: center;
              background: #0f172a;
              color: white;
              padding: 6px 8px;
              border-radius: 4px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
            ">View Full Dossier →</a>
          </div>
        </div>
      `;

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(infoContent);
        infoWindowRef.current.open(map, marker);
        setSelectedWell(w);
        if (onSelectWell) onSelectWell(w);
      });

      // If this well is currently selected, open InfoWindow automatically
      if (isSelected) {
        infoWindowRef.current.setContent(infoContent);
        infoWindowRef.current.open(map, marker);
      }

      markersRef.current.push(marker);
      bounds.extend({ lat: w.latitude, lng: w.longitude });
    });

    // Auto-fit bounds if we have wells and no specific well is selected
    if (displayWells.length > 0 && !selectedWellId && !enableRadiusFilter) {
      map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    }
  }, [displayWells, mapEngine, selectedWell, enableRadiusFilter, centerLat, centerLng, radiusKm]);

  // Leaflet Fallback initialization
  const initLeafletFallback = () => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    import('leaflet').then((L) => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (!mapContainerRef.current) return;
      mapContainerRef.current.innerHTML = '';
      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 11);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, &copy; CARTO',
      }).addTo(map);

      displayWells.forEach((w) => {
        const marker = L.marker([w.latitude, w.longitude]).addTo(map);
        marker.bindPopup(`<b>${w.wellId}</b><br/>${w.name}<br/>Status: ${w.status}`);
      });
    });
  };

  // Center on well helper
  const handleSelectWellFromList = (well: Well) => {
    setSelectedWell(well);
    if (onSelectWell) onSelectWell(well);

    if (googleMapInstanceRef.current && mapEngine === 'GOOGLE_MAPS') {
      googleMapInstanceRef.current.panTo({ lat: well.latitude, lng: well.longitude });
      googleMapInstanceRef.current.setZoom(13);

      // Trigger click on corresponding marker
      const marker = markersRef.current.find(
        (m) => m.getTitle() && m.getTitle().includes(well.wellId)
      );
      if (marker && infoWindowRef.current) {
        google.maps.event.trigger(marker, 'click');
      }
    }
  };

  // Fit bounds to all filtered wells
  const handleFitBounds = () => {
    if (
      !googleMapInstanceRef.current ||
      mapEngine !== 'GOOGLE_MAPS' ||
      !window.google?.maps ||
      displayWells.length === 0
    )
      return;

    const bounds = new window.google.maps.LatLngBounds();
    displayWells.forEach((w) => bounds.extend({ lat: w.latitude, lng: w.longitude }));
    googleMapInstanceRef.current.fitBounds(bounds, {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    });
  };

  // Center on Assam basin (Duliajan headquarters)
  const handleCenterDuliajan = () => {
    setCenterLat(27.325);
    setCenterLng(95.312);
    if (googleMapInstanceRef.current && mapEngine === 'GOOGLE_MAPS') {
      googleMapInstanceRef.current.panTo({ lat: 27.325, lng: 95.312 });
      googleMapInstanceRef.current.setZoom(11);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Top Map Toolbar */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Engine & Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">
              {mapEngine === 'GOOGLE_MAPS' ? 'Google Maps Enterprise' : 'OpenStreetMap'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {mapEngine === 'GOOGLE_MAPS' ? 'OIL GIS Live' : 'Fallback'}
            </span>
          </div>

          <span className="text-slate-400 hidden sm:inline">
            Center: <span className="font-mono text-slate-200">{centerLat.toFixed(3)}°N, {centerLng.toFixed(3)}°E</span>
          </span>

          {loadingEngine && (
            <span className="text-emerald-400 animate-pulse font-mono text-[11px]">
              Loading Google Maps API...
            </span>
          )}
        </div>

        {/* Right Map Controls: Style Switcher & Radius */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Map Type Switcher */}
          {mapEngine === 'GOOGLE_MAPS' && (
            <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[11px] font-medium">
              {(
                [
                  { id: 'DARK', label: 'Dark Petro' },
                  { id: 'SATELLITE', label: 'Satellite' },
                  { id: 'TERRAIN', label: 'Terrain' },
                  { id: 'ROADMAP', label: 'Roadmap' },
                ] as const
              ).map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMapType(type.id)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    mapType === type.id
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}

          {/* Radius Filter Toggle */}
          <button
            onClick={() => setEnableRadiusFilter(!enableRadiusFilter)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors flex items-center space-x-1.5 ${
              enableRadiusFilter
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <span>🎯 Radius Filter:</span>
            <span className="font-mono">{enableRadiusFilter ? `${radiusKm} km (ON)` : 'OFF'}</span>
          </button>

          {enableRadiusFilter && (
            <div className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {[5, 10, 15, 25, 50].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    radiusKm === r
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}k
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <button
            onClick={handleFitBounds}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-[11px]"
            title="Fit view to all filtered wells"
          >
            ⤢ Fit All
          </button>
          <button
            onClick={handleCenterDuliajan}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-[11px]"
            title="Center on Duliajan, Assam"
          >
            📍 Duliajan
          </button>
        </div>
      </div>

      {engineError && (
        <div className="bg-amber-950/60 border-b border-amber-800/60 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
          <span>⚠️ {engineError}</span>
          <span className="text-[10px] font-mono text-amber-400">Leaflet Active</span>
        </div>
      )}

      {/* Main Canvas + Interactive Sidebar Layout */}
      <div className="flex flex-col lg:flex-row relative flex-1">
        {/* Interactive Sidebar with Filtered Wells List */}
        {showSidebarList && (
          <div className="w-full lg:w-80 bg-slate-950/95 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col max-h-[560px]">
            {/* Sidebar Header */}
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Filtered Wells
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  Showing {displayWells.length} matching criteria
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {displayWells.length} Active
              </span>
            </div>

            {/* Scrollable Wells Card List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
              {displayWells.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No wells match the current spatial and parameter filters.
                </div>
              ) : (
                displayWells.map((w) => {
                  const isSelected = selectedWell?.id === w.id || selectedWell?.wellId === w.wellId;
                  const isHovered = activeWellCardHover === w.id;
                  const hasEvents = (w as any).events?.length > 0 || (w as any).eventCount > 0;

                  return (
                    <div
                      key={w.id}
                      onClick={() => handleSelectWellFromList(w)}
                      onMouseEnter={() => setActiveWellCardHover(w.id)}
                      onMouseLeave={() => setActiveWellCardHover(null)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all text-left ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                          : isHovered
                          ? 'bg-slate-900/80 border-slate-700'
                          : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {w.wellId}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          {hasEvents && (
                            <span className="w-2 h-2 rounded-full bg-rose-500" title="Historical Incident" />
                          )}
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              w.status === 'DRILLING'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : w.status === 'COMPLETED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {w.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-medium text-slate-200 truncate mt-1">
                        {w.name}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-800/60">
                        <span>Depth: <strong className="text-slate-200">{w.totalDepth}m</strong></span>
                        <span>Type: {w.wellType}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Footer Stats */}
            <div className="p-2.5 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-400 flex justify-between font-mono">
              <span>OIL-SYN-001..020</span>
              <span>Assam-Arakan Basin</span>
            </div>
          </div>
        )}

        {/* Map Canvas */}
        <div className="flex-1 relative" style={{ minHeight: height }}>
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

          {/* Floating Map Legend (Bottom Right) */}
          <div className="absolute bottom-3 right-3 z-10 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 shadow-xl space-y-1.5 hidden sm:block pointer-events-auto font-mono">
            <div className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">
              Rig & Well Status Legend
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
              <span>DRILLING (Active Real-Time Telemetry)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              <span>COMPLETED (Production / Shut-in)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-white" />
              <span>PLANNED / PROPOSED WELL</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
              <span>HAZARD / INCIDENT PRECEDENT (!)</span>
            </div>
          </div>

          {/* Floating Search Status Badge (Bottom Left) */}
          <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 shadow-lg pointer-events-auto">
            <span className="text-slate-400">Total Filtered: </span>
            <span className="font-bold text-emerald-400 font-mono">{displayWells.length}</span> wells{' '}
            {enableRadiusFilter && (
              <span className="text-slate-400">
                within <span className="font-mono text-emerald-400 font-semibold">{radiusKm} km</span> radius
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

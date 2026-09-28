'use client';

import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { NearbyWellResult, Well } from '@nwis/types';

interface WellMapProps {
  initialWells?: Well[];
  onSelectWell?: (well: any) => void;
  selectedWellId?: string;
}

export function WellMap({ initialWells, onSelectWell, selectedWellId }: WellMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const [centerLat, setCenterLat] = useState<number>(27.325);
  const [centerLng, setCenterLng] = useState<number>(95.312);
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [nearbyWells, setNearbyWells] = useState<NearbyWellResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formationFilter, setFormationFilter] = useState<string>('');

  // Fetch nearby wells using PostGIS / earthdistance backend
  const fetchNearby = async (lat: number, lng: number, rad: number, form?: string) => {
    setLoading(true);
    try {
      const results = await api.wells.getNearby({
        latitude: lat,
        longitude: lng,
        radiusKm: rad,
        formation: form || undefined,
        limit: 50,
      });
      setNearbyWells(results);
    } catch (err) {
      console.error('Failed to query nearby wells from PostGIS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby(centerLat, centerLng, radiusKm, formationFilter);
  }, [centerLat, centerLng, radiusKm, formationFilter]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Import Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 12);
        mapInstanceRef.current = map;

        // Dark-mode styled tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap, &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;

        // Map click updates radius center
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          setCenterLat(Number(lat.toFixed(4)));
          setCenterLng(Number(lng.toFixed(4)));
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Markers and Radius Circle when wells change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    import('leaflet').then((L) => {
      const layerGroup = layerGroupRef.current;
      layerGroup.clearLayers();

      // Draw Radius Circle
      if (circleRef.current) {
        mapInstanceRef.current.removeLayer(circleRef.current);
      }

      const circle = L.circle([centerLat, centerLng], {
        radius: radiusKm * 1000,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(mapInstanceRef.current);
      circleRef.current = circle;

      // Draw Center Marker
      const centerIcon = L.divIcon({
        className: 'center-marker',
        html: `<div style="width: 14px; height: 14px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 8px rgba(59,130,246,0.8);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([centerLat, centerLng], { icon: centerIcon })
        .bindTooltip(`Search Origin (${centerLat}, ${centerLng})`, { permanent: false })
        .addTo(layerGroup);

      // Render Well Pins
      nearbyWells.forEach((w) => {
        const isSelected = selectedWellId === w.id || selectedWellId === w.wellId;
        const pinColor =
          w.status === 'DRILLING'
            ? '#3b82f6'
            : w.eventCount > 0
            ? '#ef4444'
            : '#10b981';

        const customIcon = L.divIcon({
          className: 'well-marker',
          html: `<div style="
            background: ${pinColor};
            width: ${isSelected ? '24px' : '18px'};
            height: ${isSelected ? '24px' : '18px'};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: bold;
            color: white;
            cursor: pointer;
          ">${w.eventCount > 0 ? '!' : ''}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([w.latitude, w.longitude], { icon: customIcon }).addTo(layerGroup);

        const popupContent = `
          <div style="font-family: sans-serif; color: #0f172a; padding: 4px; min-width: 180px;">
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
              ${w.wellId}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${w.name}</div>
            <div style="font-size: 11px; margin-bottom: 2px;"><strong>Distance:</strong> ${w.distanceKm} km</div>
            <div style="font-size: 11px; margin-bottom: 2px;"><strong>Depth:</strong> ${w.totalDepth} m</div>
            <div style="font-size: 11px; margin-bottom: 2px;"><strong>Status:</strong> ${w.status}</div>
            <div style="font-size: 11px; margin-bottom: 6px;"><strong>Events:</strong> ${w.eventCount} recorded</div>
            <div style="font-size: 10px; color: #475569; margin-bottom: 8px;">
              <strong>Formations:</strong> ${w.formationSummary.slice(0, 3).join(', ')}...
            </div>
            <a href="/wells/${w.wellId}" style="
              display: block;
              text-align: center;
              background: #0f172a;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
            ">View Well Dossier</a>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectWell) onSelectWell(w);
        });
      });
    });
  }, [nearbyWells, centerLat, centerLng, radiusKm, selectedWellId]);

  return (
    <div className="bg-petro-900 border border-petro-800 rounded-xl overflow-hidden shadow-lg">
      {/* Map Control Bar */}
      <div className="p-3 bg-petro-950 border-b border-petro-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-emerald-400">PostGIS Geospatial Engine:</span>
          <span className="text-slate-300">
            Center: <span className="font-mono">{centerLat.toFixed(3)}°N, {centerLng.toFixed(3)}°E</span>
          </span>
          {loading && (
            <span className="text-emerald-400 animate-pulse font-mono">Querying PostGIS...</span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Radius selector */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Radius:</span>
            {[5, 10, 15, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors ${
                  radiusKm === r
                    ? 'bg-emerald-600 text-white'
                    : 'bg-petro-800 text-slate-300 hover:bg-petro-700'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>

          {/* Formation Filter */}
          <select
            value={formationFilter}
            onChange={(e) => setFormationFilter(e.target.value)}
            className="bg-petro-800 text-slate-200 border border-petro-700 rounded px-2 py-1 text-xs outline-none"
          >
            <option value="">All Formations</option>
            <option value="Barail">Barail Sandstone</option>
            <option value="Tipam">Tipam Sandstone</option>
            <option value="Girujan">Girujan Clay</option>
            <option value="Kopili">Kopili Shale</option>
            <option value="Jaintia">Jaintia Limestone</option>
          </select>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative">
        <div ref={mapContainerRef} className="h-[460px] w-full z-10" />

        {/* Floating results badge */}
        <div className="absolute bottom-3 left-3 z-20 bg-petro-950/90 backdrop-blur border border-petro-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 shadow-md">
          Found <span className="font-bold text-emerald-400">{nearbyWells.length}</span> wells within{' '}
          <span className="font-mono text-emerald-400">{radiusKm} km</span> radius
        </div>
      </div>
    </div>
  );
}

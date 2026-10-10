"use client";

import React, { useEffect, useRef } from "react";
import type { LiveStation } from "@/types/api";

interface DriverMobileMapProps {
  center: [number, number];
  zoom?: number;
  userLocation: [number, number];
  stations: LiveStation[];
  selectedStation: LiveStation | null;
  onStationSelect: (station: LiveStation) => void;
  navigationStation: LiveStation | null;
  isNavigating: boolean;
  navProgress: number; // 0 to 1
}

export default function DriverMobileMap({
  center,
  zoom = 13,
  userLocation,
  stations,
  selectedStation,
  onStationSelect,
  navigationStation,
  isNavigating,
  navProgress,
}: DriverMobileMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const carMarkerRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    let map: any = null;
    let isMounted = true;

    async function init() {
      if (!mapContainerRef.current) return;
      const L = (await import("leaflet")).default;
      if (!isMounted || mapInstanceRef.current) return;

      map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Ultra-clean CartoDB Positron tiles (light, minimal Apple-aesthetic cartography)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);
    }

    init();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center & Zoom
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (isNavigating && navigationStation) {
        import("leaflet").then(({ default: L }) => {
          const bounds = L.latLngBounds([userLocation, [navigationStation.latitude, navigationStation.longitude]]);
          mapInstanceRef.current.fitBounds(bounds.pad(0.25), { animate: true, duration: 0.8 });
        });
      } else {
        mapInstanceRef.current.setView(center, zoom, { animate: true, duration: 0.6 });
      }
    }
  }, [center[0], center[1], zoom, isNavigating, navigationStation]);

  // Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    import("leaflet").then(({ default: L }) => {
      markersLayerRef.current.clearLayers();

      // 1. User Location Marker
      const userHtml = `
        <div style="position:relative;width:24px;height:24px;transform:translate(-12px,-12px);">
          <div style="position:absolute;inset:-6px;border-radius:50%;background:rgba(0,113,227,0.2);animation:pulse-1 2s infinite;"></div>
          <div style="position:absolute;inset:0;border-radius:50%;background:#0071e3;border:3px solid #ffffff;box-shadow:0 3px 10px rgba(0,113,227,0.4);"></div>
        </div>
      `;
      const userIcon = L.divIcon({ html: userHtml, className: "", iconSize: [0, 0] });
      L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 }).addTo(markersLayerRef.current);

      // 2. Station Markers
      stations.forEach((st) => {
        const isSelected = selectedStation?.id === st.id;
        const isTarget = navigationStation?.id === st.id;
        const isFast = (st.power_kw ?? 0) >= 50;

        const pinColor = isTarget
          ? "#10b981"
          : isSelected
          ? "#151817"
          : isFast
          ? "#10b981"
          : "#4b5563";

        const bgGlow = isTarget
          ? "box-shadow: 0 0 16px rgba(16, 185, 129, 0.7);"
          : isSelected
          ? "box-shadow: 0 0 14px rgba(21, 24, 23, 0.5);"
          : "box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);";

        const scale = isSelected || isTarget ? "transform: scale(1.15) translate(-16px,-16px);" : "transform: translate(-14px,-14px);";

        const pinHtml = `
          <div style="position:relative;width:28px;height:28px;${scale}cursor:pointer;transition:transform 0.2s ease;">
            <div style="width:28px;height:28px;border-radius:50%;background:${pinColor};${bgGlow}display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({ html: pinHtml, className: "", iconSize: [0, 0] });
        const marker = L.marker([st.latitude, st.longitude], {
          icon,
          zIndexOffset: isSelected || isTarget ? 900 : 500,
        }).addTo(markersLayerRef.current);

        marker.on("click", () => {
          onStationSelect(st);
        });
      });
    });
  }, [stations, selectedStation?.id, navigationStation?.id, userLocation[0], userLocation[1]]);

  // Render Navigation Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    import("leaflet").then(({ default: L }) => {
      routeLayerRef.current.clearLayers();

      if (isNavigating && navigationStation) {
        const start = userLocation;
        const end: [number, number] = [navigationStation.latitude, navigationStation.longitude];

        // Generate curved realistic waypoint polyline
        const midLat = (start[0] + end[0]) / 2 + (end[1] - start[1]) * 0.15;
        const midLng = (start[1] + end[1]) / 2 - (end[0] - start[0]) * 0.15;

        // Base glow line
        L.polyline([start, [midLat, midLng], end], {
          color: "rgba(16, 185, 129, 0.25)",
          weight: 10,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(routeLayerRef.current);

        // Core route line
        L.polyline([start, [midLat, midLng], end], {
          color: "#10b981",
          weight: 5,
          dashArray: "8, 6",
          lineCap: "round",
          lineJoin: "round",
        }).addTo(routeLayerRef.current);

        // Vehicle icon moving along route
        const currentLat = start[0] + (end[0] - start[0]) * navProgress;
        const currentLng = start[1] + (end[1] - start[1]) * navProgress;

        const carHtml = `
          <div style="position:relative;width:32px;height:32px;transform:translate(-16px,-16px);">
            <div style="width:32px;height:32px;border-radius:50%;background:#151817;border:2.5px solid #C9F36A;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
              <span style="font-size:14px;">🏎️</span>
            </div>
          </div>
        `;
        const carIcon = L.divIcon({ html: carHtml, className: "", iconSize: [0, 0] });
        L.marker([currentLat, currentLng], { icon: carIcon, zIndexOffset: 1200 }).addTo(routeLayerRef.current);
      }
    });
  }, [isNavigating, navigationStation, userLocation, navProgress]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#F7F8F6",
        position: "relative",
      }}
    />
  );
}

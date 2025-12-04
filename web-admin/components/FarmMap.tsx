"use client";

import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "450px", borderRadius: "12px" };
const defaultCenter = { lat: 24.809065, lng: -107.394014 };

interface Farm {
  id: string;
  name: string;
  location: string;
  ownership_type: string; // own, rented, litigation
}

interface Props {
  farms: Farm[];
  onSelectLocation?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

// URLs de Iconos de Google (Colores)
const ICONS = {
  own: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  rented: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  litigation: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  default: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
};

export default function FarmMap({ farms, onSelectLocation, interactive = false }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (interactive && onSelectLocation && e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setTempMarker({ lat, lng });
      onSelectLocation(lat, lng);
    }
  }, [interactive, onSelectLocation]);

  if (!isLoaded) return <div className="h-[450px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">Cargando Satélite...</div>;

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={farms.length > 0 && farms[0].location.includes('{') ? JSON.parse(farms[0].location) : defaultCenter}
        zoom={11}
        onClick={handleMapClick}
        options={{ mapTypeId: "hybrid", streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}
      >
        {farms.map((farm) => {
          try {
            const position = JSON.parse(farm.location);
            // Selección de icono según estatus legal
            const iconUrl = ICONS[farm.ownership_type as keyof typeof ICONS] || ICONS.default;
            
            return (
              <Marker
                key={farm.id}
                position={position}
                title={`${farm.name} (${farm.ownership_type.toUpperCase()})`}
                icon={iconUrl}
              />
            );
          } catch (e) { return null; }
        })}

        {tempMarker && <Marker position={tempMarker} animation={google.maps.Animation.DROP} label="NUEVO" />}
      </GoogleMap>
      
      {/* Leyenda del Mapa */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-xs z-10 opacity-90">
        <div className="flex items-center gap-2 mb-1"><img src={ICONS.own} className="w-4"/> Propio</div>
        <div className="flex items-center gap-2 mb-1"><img src={ICONS.rented} className="w-4"/> Rentado</div>
        <div className="flex items-center gap-2"><img src={ICONS.litigation} className="w-4"/> En Litigio</div>
      </div>
    </div>
  );
}
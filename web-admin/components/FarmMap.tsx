"use client";

import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

// Configuración visual del mapa
const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
};

// Coordenadas por defecto (Sinaloa, el granero de México)
const defaultCenter = {
  lat: 24.809065,
  lng: -107.394014,
};

interface Farm {
  id: string;
  name: string;
  location: string; // JSON string "{lat: x, lng: y}"
}

interface Props {
  farms: Farm[];
  onSelectLocation?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

export default function FarmMap({ farms, onSelectLocation, interactive = false }: Props) {
  // Cargamos el script de Google Maps dinámicamente
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  // Estado local para el marcador temporal cuando estás registrando uno nuevo
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);

  // Manejador de clics en el mapa (Solo si es interactivo)
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (interactive && onSelectLocation && e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setTempMarker({ lat, lng }); // Poner marcador visual
      onSelectLocation(lat, lng);  // Avisar al padre
    }
  }, [interactive, onSelectLocation]);

  if (!isLoaded) {
    return (
      <div className="h-[400px] w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-500 font-medium">
        Cargando Satélite Google Maps...
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={10}
        onClick={handleMapClick}
        options={{
          mapTypeId: "hybrid", // VITAL: Satélite + Nombres de calles
          streetViewControl: false, // Quitamos el muñequito para limpiar la UI
          mapTypeControl: false,    // Quitamos el selector de "Mapa/Satélite"
          fullscreenControl: true,
        }}
      >
        {/* 1. Marcadores de Ranchos Guardados */}
        {farms.map((farm) => {
          try {
            const position = JSON.parse(farm.location);
            return (
              <Marker
                key={farm.id}
                position={position}
                title={farm.name} // Tooltip nativo de Google al pasar el mouse
              />
            );
          } catch (e) {
            return null;
          }
        })}

        {/* 2. Marcador Temporal (Cuando estás eligiendo dónde poner el rancho) */}
        {tempMarker && (
          <Marker
            position={tempMarker}
            animation={google.maps.Animation.DROP} // Animación bonita al caer
            label="NUEVO"
          />
        )}
      </GoogleMap>
    </div>
  );
}
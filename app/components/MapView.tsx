"use client";

import React from 'react';

interface MapViewProps {
  location: { lat: number; lng: number } | null;
}

export default function MapView({ location }: MapViewProps) {
  // Default: KCC Institute / Greater Noida
  const center = location || { lat: 28.4682, lng: 77.4933 };

  // OpenStreetMap embed URL — zero dependencies required
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.04}%2C${center.lat - 0.025}%2C${center.lng + 0.04}%2C${center.lat + 0.025}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;

  return (
    <iframe
      src={osmEmbedUrl}
      width="100%"
      height="100%"
      style={{
        border: 0,
        borderRadius: '28px',
        filter: 'contrast(1.05) saturate(1.1)',
      }}
      allowFullScreen
      loading="lazy"
      title="OpenStreetMap — Greater Noida"
    />
  );
}

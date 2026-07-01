
"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import type { StationResult, PointInfo } from "@/lib/types";

interface Props {
  point: PointInfo;
  top3: StationResult[];
  allCount: number;
}

// Iconos SVG para distinguir el punto y las 3 estaciones más cercanas
function makeIcon(color: string, label: string, size = 30): L.DivIcon {
  return L.divIcon({
    className: "magna-marker",
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="white" stroke-width="1.5"/>
        <text x="12" y="13" font-size="9" font-weight="700" text-anchor="middle" fill="white" font-family="sans-serif">${label}</text>
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const pointIcon = makeIcon("#dc2626", "P", 34);
const rankIcons = [
  makeIcon("#16a34a", "1", 32),
  makeIcon("#0d9488", "2", 32),
  makeIcon("#0891b2", "3", 32),
];

export default function MapInner({ point, top3 }: Props) {
  // Centro del mapa: promedio entre punto y estaciones más cercanas
  const lats = [point.lat, ...top3.map((s) => s.lat)];
  const lons = [point.lon, ...top3.map((s) => s.lon)];
  const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const centerLon = lons.reduce((a, b) => a + b, 0) / lons.length;

  // Ajuste de zoom según la mayor distancia (grados)
  const maxDelta = Math.max(
    Math.abs(point.lat - top3[top3.length - 1].lat),
    Math.abs(point.lon - top3[top3.length - 1].lon),
  );
  const zoom =
    maxDelta < 0.05 ? 14 : maxDelta < 0.2 ? 12 : maxDelta < 0.8 ? 10 : maxDelta < 2 ? 8 : 6;

  const lineColors = ["#16a34a", "#0d9488", "#0891b2"];

  return (
    <MapContainer
      center={[centerLat, centerLon]}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Líneas desde el punto a cada una de las 3 estaciones */}
      {top3.map((s, idx) => (
        <Polyline
          key={`line-${s.id}-${s.nombre}`}
          positions={[
            [point.lat, point.lon],
            [s.lat, s.lon],
          ]}
          pathOptions={{
            color: lineColors[idx],
            weight: 3,
            opacity: 0.7,
            dashArray: "6 6",
          }}
        />
      ))}

      {/* Marcador del punto a rastrear */}
      <Marker position={[point.lat, point.lon]} icon={pointIcon}>
        <Popup>
          <div>
            <strong>Punto a rastrear</strong>
            <br />
            Lat: {point.lat.toFixed(6)}°
            <br />
            Lon: {point.lon.toFixed(6)}°
            <br />
            <span style={{ color: "#666", fontSize: "0.78rem" }}>
              {point.latDms}
              <br />
              {point.lonDms}
            </span>
          </div>
        </Popup>
      </Marker>

      {/* Marcadores de las 3 estaciones más cercanas */}
      {top3.map((s, idx) => (
        <Marker key={`${s.id}-${s.nombre}`} position={[s.lat, s.lon]} icon={rankIcons[idx]}>
          <Popup>
            <div>
              <strong>
                #{idx + 1} — {s.nombre}
              </strong>
              <br />
              <span style={{ color: "#666" }}>IGS: {s.igs}</span>
              <br />
              Distancia: <strong>{s.distanceKm.toLocaleString("es-CO", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} km</strong>
              <br />
              Tiempo mín.: <strong>{s.trackingFormatted}</strong>
              <br />
              <span style={{ color: "#666", fontSize: "0.78rem" }}>
                {s.latDms}
                <br />
                {s.lonDms}
                <br />
                h = {s.h.toFixed(3)} m
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { NeraWithMeta } from "@/lib/nera/types";
import { getNeraTypeById, getShortDate } from "@/lib/nera/constants";

interface NeraMapProps {
  neras: NeraWithMeta[];
  onSelect: (nera: NeraWithMeta) => void;
  userLat: number | null;
  userLng: number | null;
}

export default function NeraMap({ neras, onSelect, userLat, userLng }: NeraMapProps) {
  const [ready, setReady] = useState(false);
  const [L, setLeaflet] = useState<any>(null);
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Popup, setPopup] = useState<any>(null);
  const [useMap, setUseMap] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("leaflet"), import("react-leaflet")]).then(([leafletMod, rlMod]) => {
      if (cancelled) return;
      setLeaflet(leafletMod.default);
      setMapContainer(() => rlMod.MapContainer);
      setTileLayer(() => rlMod.TileLayer);
      setMarker(() => rlMod.Marker);
      setPopup(() => rlMod.Popup);
      setUseMap(() => rlMod.useMap);
      setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const nerasWithCoords = useMemo(() => neras.filter((n) => n.lat != null && n.lng != null), [neras]);

  const center: [number, number] = userLat != null && userLng != null
    ? [userLat, userLng]
    : nerasWithCoords.length > 0
      ? [nerasWithCoords[0].lat!, nerasWithCoords[0].lng!]
      : [51.5074, -0.1278];

  function makeIcon(color: string, emoji: string, size: number) {
    if (!L) return undefined;
    return L.divIcon({
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
      html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size * 0.5}px;box-shadow:0 2px 8px ${color}60;border:2px solid white;">${emoji}</div>`,
    });
  }

  if (!ready || !MapContainer) {
    return (
      <div className="rounded-2xl h-72 sm:h-96 flex items-center justify-center" style={{ background: "var(--card-bg, rgba(0, 255, 136, 0.04))", border: "1px solid var(--border-subtle, rgba(0, 255, 136, 0.08))" }}>
        <p className="text-xs" style={{ color: "var(--text-dim, #94a3b8)" }}>Loading map...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1px solid var(--border-subtle, rgba(0, 255, 136, 0.08))",
        boxShadow: "0 1px 3px rgba(0, 255, 136, 0.04)",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ height: "24rem", width: "100%", position: "relative" }}>
        <MapContainer
          center={center}
          zoom={nerasWithCoords.length > 0 ? 12 : 5}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", background: "#f0fdf9" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <FitBoundsHook nerasWithCoords={nerasWithCoords} userLat={userLat} userLng={userLng} useMap={useMap} />

          {userLat != null && userLng != null && (
            <Marker position={[userLat, userLng]} icon={makeIcon("#00ff88", "\ud83d\udccd", 28)}>
              <Popup><div style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#0f172a" }}>You are here</div></Popup>
            </Marker>
          )}

          {nerasWithCoords.map((n) => {
            const neraType = getNeraTypeById(n.nera_type);
            const icon = makeIcon(neraType.color, neraType.icon, 24);
            if (!icon) return null;
            return (
              <Marker
                key={n.id}
                position={[n.lat!, n.lng!]}
                icon={icon}
                eventHandlers={{ click: () => onSelect(n) }}
              >
                <Popup>
                  <div style={{ fontFamily: "var(--font-body)", minWidth: "160px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a", marginBottom: "4px" }}>{n.title}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px" }}>{neraType.icon} {neraType.label}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "2px" }}>{getShortDate(n.date_time)}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>{n.current_participants}/{n.max_participants} people</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(n); }}
                      style={{ width: "100%", padding: "6px 12px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #00ff88, #00cc6a)", color: "#ffffff", fontSize: "11px", fontWeight: 500, cursor: "pointer" }}
                    >
                      View Nera
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {nerasWithCoords.length > 0 && (
        <div className="px-4 py-3 flex items-center gap-3 overflow-x-auto" style={{ background: "var(--card-bg, rgba(0, 255, 136, 0.03))", borderTop: "1px solid var(--border-subtle, rgba(0, 255, 136, 0.06))" }}>
          {nerasWithCoords.slice(0, 6).map((n) => {
            const t = getNeraTypeById(n.nera_type);
            return (
              <button
                key={n.id}
                onClick={() => onSelect(n)}
                className="flex-shrink-0 flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full transition-all"
                style={{ background: `${t.color}08`, color: t.color, border: `1px solid ${t.color}15`, cursor: "pointer" }}
              >
                <span>{t.icon}</span>
                <span style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
              </button>
            );
          })}
          {nerasWithCoords.length > 6 && (
            <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-dim, #94a3b8)" }}>+{nerasWithCoords.length - 6} more</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

function FitBoundsHook({ nerasWithCoords, userLat, userLng, useMap }: { nerasWithCoords: any[]; userLat: number | null; userLng: number | null; useMap: any }) {
  const map = useMap();
  useEffect(() => {
    if (nerasWithCoords.length === 0) return;
    const bounds = nerasWithCoords.map((n: any) => [n.lat, n.lng] as [number, number]);
    if (userLat != null && userLng != null) bounds.push([userLat, userLng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [nerasWithCoords, userLat, userLng, map, useMap]);
  return null;
}

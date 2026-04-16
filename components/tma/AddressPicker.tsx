"use client";

import { useState, useCallback } from "react";

interface AddressPickerProps {
  value: string;
  onChange: (addr: string) => void;
}

export default function AddressPicker({ value, onChange }: AddressPickerProps) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const handleGps = useCallback(async () => {
    if (!navigator.geolocation) {
      setGpsError("Геолокация не поддерживается браузером");
      return;
    }
    setGpsLoading(true);
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Nominatim reverse geocoding — free, no key needed
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ru`,
            { headers: { "User-Agent": "PrimeClean-TMA/1.0" } }
          );
          const data = await res.json();
          if (data?.display_name) {
            // Format: "ул. Название, Дом, Минск"
            const a = data.address;
            const parts: string[] = [];
            if (a?.road) parts.push(a.road);
            if (a?.house_number) parts.push(a.house_number);
            if (a?.city || a?.town || a?.village) parts.push(a.city ?? a.town ?? a.village);
            const formatted = parts.length > 0 ? parts.join(", ") : data.display_name.split(",").slice(0, 3).join(",").trim();
            onChange(formatted);
          }
        } catch {
          // Fallback: just show coords
          onChange(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError("Нет доступа к геолокации. Разрешите в настройках.");
        } else {
          setGpsError("Не удалось определить местоположение");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [onChange]);

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1.5px solid #E2EDF4",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 15,
    color: "#1A2332",
    background: "white",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>Адрес</label>

      {/* Input row */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ул. Ленина, 1, кв. 5, Минск"
          style={{ ...inputStyle, flex: 1 }}
        />
        {/* GPS button */}
        <button
          type="button"
          onClick={handleGps}
          disabled={gpsLoading}
          title="Определить по GPS"
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            border: "1.5px solid #E2EDF4",
            background: gpsLoading ? "#F0FDFF" : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: gpsLoading ? "not-allowed" : "pointer",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          {gpsLoading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00B4D8" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0077B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" strokeOpacity="0.3"/>
            </svg>
          )}
        </button>
      </div>

      {/* Hint */}
      {!gpsError && (
        <p style={{ color: "#94A3B8", fontSize: 11, marginTop: 5 }}>
          📍 Нажмите на иконку для автоопределения адреса по GPS
        </p>
      )}

      {/* GPS error */}
      {gpsError && (
        <p style={{ color: "#DC2626", fontSize: 12, marginTop: 5 }}>{gpsError}</p>
      )}

      {/* Yandex Maps link to verify */}
      {value && (
        <a
          href={`https://yandex.by/maps/?text=${encodeURIComponent(value)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginTop: 6,
            color: "#0077B6",
            fontSize: 12,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          🗺 Проверить на Яндекс Картах
        </a>
      )}
    </div>
  );
}

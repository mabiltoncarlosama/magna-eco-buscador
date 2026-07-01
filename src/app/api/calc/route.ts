import { NextResponse } from "next/server";
import { STATIONS, type Station } from "@/lib/stations";
import {
  vincentyInverse,
  trackingTime,
  mToKm,
  ddToDms,
  formatDms,
  validateColombia,
  type DMS,
} from "@/lib/geodesy";

export const runtime = "nodejs";

interface StationResult {
  id: number;
  nombre: string;
  igs: string;
  lat: number;
  lon: number;
  h: number;
  latDms: string;
  lonDms: string;
  distanceKm: number;
  distanceM: number;
  azimuth1: number;
  trackingMinutes: number;
  trackingFormatted: string;
  iterations: number;
}

interface CalcResponse {
  ok: boolean;
  error?: string;
  errors?: string[];
  point?: {
    lat: number;
    lon: number;
    latDms: string;
    lonDms: string;
  };
  total?: number;
  top3?: StationResult[];
  all?: StationResult[];
}

function dmsString(d: DMS): string {
  return formatDms(d);
}

export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<CalcResponse>(
      { ok: false, error: "JSON inválido en el cuerpo de la peticion." },
      { status: 400 },
    );
  }

  const data = body as { lat?: number; lon?: number };
  const lat = Number(data?.lat);
  const lon = Number(data?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json<CalcResponse>(
      {
        ok: false,
        error: "Latitud y longitud son obligatorias y deben ser numericas.",
      },
      { status: 400 },
    );
  }

  const v = validateColombia(lat, lon);
  if (!v.ok) {
    return NextResponse.json<CalcResponse>(
      { ok: false, errors: v.errors },
      { status: 400 },
    );
  }

  const results: StationResult[] = STATIONS.map((s: Station) => {
    const r = vincentyInverse(lat, lon, s.lat, s.lon);
    const distKm = mToKm(r.distanceMeters);
    const tt = trackingTime(distKm);
    const latDms = ddToDms(s.lat, "lat");
    const lonDms = ddToDms(s.lon, "lon");
    return {
      id: s.id,
      nombre: s.nombre,
      igs: s.igs,
      lat: s.lat,
      lon: s.lon,
      h: s.h,
      latDms: dmsString(latDms),
      lonDms: dmsString(lonDms),
      distanceKm: distKm,
      distanceM: Math.round(r.distanceMeters * 1000) / 1000,
      azimuth1: Math.round(r.azimuth1 * 1000) / 1000,
      trackingMinutes: tt.minutes,
      trackingFormatted: tt.formatted,
      iterations: r.iterations,
    };
  });

  results.sort((a, b) => a.distanceKm - b.distanceKm);

  const pointLatDms = ddToDms(lat, "lat");
  const pointLonDms = ddToDms(lon, "lon");

  return NextResponse.json<CalcResponse>({
    ok: true,
    point: {
      lat,
      lon,
      latDms: dmsString(pointLatDms),
      lonDms: dmsString(pointLonDms),
    },
    total: results.length,
    top3: results.slice(0, 3),
    all: results,
  });
}

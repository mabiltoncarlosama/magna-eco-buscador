// Tipos compartidos entre la API y los componentes cliente
export interface StationResult {
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

export interface PointInfo {
  lat: number;
  lon: number;
  latDms: string;
  lonDms: string;
}

export interface CalcResponse {
  ok: boolean;
  error?: string;
  errors?: string[];
  point?: PointInfo;
  total?: number;
  top3?: StationResult[];
  all?: StationResult[];
}

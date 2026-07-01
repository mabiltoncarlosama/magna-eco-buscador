/**
 * Librería geodésica para el Proyecto 2 — Geodesia Geométrica.
 *
 * Incluye:
 *  - Implementación propia del método iterativo de Vincenty (problema inverso)
 *    sobre el elipsoide WGS84.
 *  - Conversión entre grados decimales (DD) y grados, minutos, segundos (GMS).
 *  - Fórmula de tiempo mínimo de rastreo GNSS (Resolución IGAC 643/2018).
 *  - Validación de coordenadas para el territorio colombiano.
 *
 * El elipsoide WGS84 utilizado tiene:
 *   a = 6 378 137.0 m  (semieje mayor)
 *   1/f = 298.257 223 563  (achatamiento inverso)
 *   b = a * (1 - f) = 6 356 752.314 245 m  (semieje menor, derivado)
 */

// ---------------------------------------------------------------------------
// Parámetros del elipsoide WGS84
// ---------------------------------------------------------------------------
export const WGS84 = {
  a: 6378137.0, // semieje mayor [m]
  invF: 298.257223563, // achatamiento inverso
} as const;

export const WGS84_DERIVED = {
  b: WGS84.a * (1 - 1 / WGS84.invF), // semieje menor [m]
  f: 1 / WGS84.invF,
} as const;

// ---------------------------------------------------------------------------
// Límites del territorio colombiano (validación)
// ---------------------------------------------------------------------------
export const COLOMBIA_BOUNDS = {
  latMin: -4.5,
  latMax: 13.5,
  lonMin: -79.5,
  lonMax: -66.5,
} as const;

export interface CoordValidation {
  ok: boolean;
  errors: string[];
}

/** Verifica que lat/lon caigan dentro del territorio colombiano. */
export function validateColombia(lat: number, lon: number): CoordValidation {
  const errors: string[] = [];
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    errors.push("Las coordenadas deben ser valores numéricos.");
    return { ok: false, errors };
  }
  if (lat < COLOMBIA_BOUNDS.latMin || lat > COLOMBIA_BOUNDS.latMax) {
    errors.push(
      `Latitud fuera de rango. Colombia: ${COLOMBIA_BOUNDS.latMin}° a ${COLOMBIA_BOUNDS.latMax}°.`,
    );
  }
  if (lon < COLOMBIA_BOUNDS.lonMin || lon > COLOMBIA_BOUNDS.lonMax) {
    errors.push(
      `Longitud fuera de rango. Colombia: ${COLOMBIA_BOUNDS.lonMin}° a ${COLOMBIA_BOUNDS.lonMax}°.`,
    );
  }
  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Conversión DD ↔ GMS
// ---------------------------------------------------------------------------
export interface DMS {
  degrees: number;
  minutes: number;
  seconds: number;
  hemisphere: "N" | "S" | "E" | "W";
}

/** Convierte grados decimales a grados/minutos/segundos con hemisferio. */
export function ddToDms(
  value: number,
  axis: "lat" | "lon",
): DMS {
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutesFull = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFull);
  const seconds = (minutesFull - minutes) * 60;
  const hemisphere =
    axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return { degrees, minutes, seconds, hemisphere };
}

/** Formatea un DMS como cadena GG° MM' SS.ss". */
export function formatDms(dms: DMS, secondsDecimals = 2): string {
  const s = dms.seconds.toFixed(secondsDecimals).padStart(5, "0");
  const m = String(dms.minutes).padStart(2, "0");
  const g = String(dms.degrees).padStart(2, "0");
  return `${g}° ${m}' ${s}" ${dms.hemisphere}`;
}

/** Convierte GMS a grados decimales. Los componentes G y M son no negativos. */
export function dmsToDd(
  degrees: number,
  minutes: number,
  seconds: number,
  hemisphere: "N" | "S" | "E" | "W",
): number {
  const abs = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  return hemisphere === "S" || hemisphere === "W" ? -abs : abs;
}

// ---------------------------------------------------------------------------
// Vincenty — Problema inverso (cálculo de distancia geodésica)
// ---------------------------------------------------------------------------
//
// Implementación basada en:
//   Vincenty, T. (1975). "Direct and Inverse Solutions of Geodesics on the
//   Ellipsoid with Application of Nested Equations".
//   Survey Review, 23(176), 88-93.
//
// Devuelve la distancia elipsoidal s [m] entre dos puntos sobre WGS84
// con convergencia iterativa típica < 1e-12 tras 5-10 iteraciones.
//
export interface VincentyResult {
  /** Distancia geodésica en metros. */
  distanceMeters: number;
  /** Número de iteraciones realizadas. */
  iterations: number;
  /** Acimut en el punto 1 (grados, 0..360 medido desde el norte). */
  azimuth1: number;
  /** Acimut inverso en el punto 2 (grados, 0..360). */
  azimuth2: number;
  /** True si el método convergió; false si se alcanzó el máximo de iteraciones. */
  converged: boolean;
}

/**
 * Calcula la distancia geodésica entre (lat1, lon1) y (lat2, lon2) en grados
 * usando el método iterativo de Vincenty sobre WGS84.
 *
 * Para puntos antipodales el método puede no converger; en ese caso se
 * devuelve la distancia aproximada y `converged = false`.
 */
export function vincentyInverse(
  lat1Deg: number,
  lon1Deg: number,
  lat2Deg: number,
  lon2Deg: number,
): VincentyResult {
  const { a, f } = { a: WGS84.a, f: WGS84_DERIVED.f };
  const b = WGS84_DERIVED.b;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const phi1 = toRad(lat1Deg);
  const phi2 = toRad(lat2Deg);
  const L = toRad(lon2Deg - lon1Deg); // diferencia de longitud

  // Reducción latitudinal: U = arctan((1-f) * tan(phi))
  const tanU1 = (1 - f) * Math.tan(phi1);
  const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
  const sinU1 = tanU1 * cosU1;

  const tanU2 = (1 - f) * Math.tan(phi2);
  const cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2);
  const sinU2 = tanU2 * cosU2;

  // Lambda es la diferencia de longitud sobre el plano auxiliar esférico.
  let lambda = L;
  let lambdaP: number;
  let sinSigma: number;
  let cosSigma: number;
  let sigma: number;
  let sinAlpha: number;
  let cosSqAlpha: number;
  let cos2SigmaM: number;
  let C: number;

  let iter = 0;
  const maxIter = 200;
  const tol = 1e-12;
  let converged = false;

  do {
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt(
      (cosU2 * sinLambda) * (cosU2 * sinLambda) +
        (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) *
          (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda),
    );
    if (sinSigma === 0) {
      // puntos coincidentes
      return {
        distanceMeters: 0,
        iterations: 0,
        azimuth1: 0,
        azimuth2: 0,
        converged: true,
      };
    }
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);

    sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma;
    cosSqAlpha = 1 - sinAlpha * sinAlpha;
    if (cosSqAlpha === 0) {
      // línea ecuatorial
      cos2SigmaM = 0;
    } else {
      cos2SigmaM = cosSigma - (2 * sinU1 * sinU2) / cosSqAlpha;
    }
    C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    lambdaP = lambda;
    lambda =
      L +
      (1 - C) *
        f *
        sinAlpha *
        (sigma +
          C *
            sinSigma *
            (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    iter++;
    const delta = Math.abs(lambda - lambdaP);
    if (delta <= tol) {
      converged = true;
      break;
    }
  } while (iter < maxIter);

  if (!converged) {
    // no convergió — devolvemos NaN y se maneja externamente
    return {
      distanceMeters: NaN,
      iterations: iter,
      azimuth1: NaN,
      azimuth2: NaN,
      converged: false,
    };
  }

  const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
  const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  const deltaSigma =
    B *
    sinSigma *
    (cos2SigmaM +
      (B / 4) *
        (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
          (B / 6) *
            cos2SigmaM *
            (-3 + 4 * sinSigma * sinSigma) *
            (-3 + 4 * cos2SigmaM * cos2SigmaM)));

  const s = b * A * (sigma - deltaSigma);

  // Acimut directo en P1 (alfa1) y acimut inverso en P2 (alfa2)
  const alpha1 = Math.atan2(
    cosU2 * Math.sin(lambda),
    cosU1 * sinU2 - sinU1 * cosU2 * Math.cos(lambda),
  );
  const alpha2 = Math.atan2(
    cosU1 * Math.sin(lambda),
    -sinU1 * cosU2 + cosU1 * sinU2 * Math.cos(lambda),
  );

  const norm = (x: number) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  return {
    distanceMeters: s,
    iterations: iter,
    azimuth1: toDeg(norm(alpha1)),
    azimuth2: toDeg(norm(alpha2)),
    converged,
  };
}

// ---------------------------------------------------------------------------
// Tiempo mínimo de rastreo GNSS — Resolución IGAC 643/2018
// ---------------------------------------------------------------------------
//
//   t [min] = 65 + 3 * |d - 10|
//
// donde d es la distancia geodésica en kilómetros entre el punto a rastrear
// y la estación MAGNA-ECO de referencia.
//
export interface TrackingTime {
  /** Tiempo en minutos (con un decimal). */
  minutes: number;
  /** Tiempo formateado como "Xh YYmin" o "YY min". */
  formatted: string;
  /** Tiempo en horas decimales. */
  hours: number;
}

export function trackingTime(distanceKm: number): TrackingTime {
  const minutes = 65 + 3 * Math.abs(distanceKm - 10);
  const totalMinutesRounded = Math.round(minutes * 10) / 10;
  let hrs = Math.floor(totalMinutesRounded / 60);
  let mins = Math.round(totalMinutesRounded - hrs * 60);
  // Si los minutos redondearon a 60, propagar a la hora siguiente
  if (mins >= 60) {
    hrs += 1;
    mins = 0;
  }
  const formatted =
    hrs > 0
      ? `${hrs} h ${String(mins).padStart(2, "0")} min`
      : `${totalMinutesRounded.toFixed(1)} min`;
  return {
    minutes: totalMinutesRounded,
    formatted,
    hours: totalMinutesRounded / 60,
  };
}

// ---------------------------------------------------------------------------
// Funciones utilitarias
// ---------------------------------------------------------------------------

/** Convierte metros a kilómetros con 3 decimales. */
export function mToKm(m: number): number {
  return Math.round((m / 1000) * 1000) / 1000;
}

/** Formatea un número con separador de miles y N decimales (es-CO). */
export function fmt(n: number, decimals = 3): string {
  return n.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Datos de las 50 estaciones MAGNA-ECO activas operadas por el IGAC.
// Fuente: archivo coord_estaciones.xlsx suministrado por el docente.
// Datum: WGS84 / MAGNA-SIRGAS.

export interface Station {
  /** Identificador numerico de la estacion */
  id: number;
  /** Codigo alfanumerico de la estacion (4 letras) */
  nombre: string;
  /** Identificador internacional IGS (DOMES) */
  igs: string;
  /** Latitud geografica en grados decimales (WGS84) */
  lat: number;
  /** Longitud geografica en grados decimales (WGS84) */
  lon: number;
  /** Altura elipsoidal en metros (WGS84) */
  h: number;
}

export const STATIONS: Station[] = [
  { id: 9, nombre: "ABCC", igs: "41939M001", lat: 4.661236134, lon: -74.126922261, h: 2576.159 },
  { id: 12, nombre: "ABPD", igs: "41941M001", lat: 4.476568291, lon: -74.098868122, h: 2958.37 },
  { id: 36, nombre: "ALBE", igs: "41943M001", lat: 7.7605206, lon: -73.389435865, h: 132.457 },
  { id: 74, nombre: "APTO", igs: "41933S001", lat: 7.877789091, lon: -76.632388774, h: 45.086 },
  { id: 76, nombre: "ARCA", igs: "41909S001", lat: 7.084277687, lon: -70.758534051, h: 133.332 },
  { id: 123, nombre: "BECE", igs: "41951M001", lat: 9.702100558, lon: -73.279261322, h: 120.771 },
  { id: 124, nombre: "BEJA", igs: "41947M001", lat: 7.060637404, lon: -73.875591221, h: 93.45 },
  { id: 128, nombre: "BERR", igs: "41910S001", lat: 6.492685967, lon: -74.410308936, h: 159.082 },
  { id: 145, nombre: "BOGA", igs: "41901M002", lat: 4.638683777, lon: -74.079949654, h: 2609.675 },
  { id: 148, nombre: "BOGT", igs: "41901M001", lat: 4.640075646, lon: -74.0809396, h: 2576.166 },
  { id: 151, nombre: "BOSC", igs: "41948M001", lat: 9.966892929, lon: -73.886226888, h: 85.58 },
  { id: 152, nombre: "BQLA", igs: "41934S001", lat: 11.019711004, lon: -74.849639498, h: 47.538 },
  { id: 170, nombre: "BUEN", igs: "41912S001", lat: 3.882025128, lon: -77.01041953, h: 57.763 },
  { id: 176, nombre: "CALI", igs: "41903S001", lat: 3.375788998, lon: -76.532564012, h: 1027.492 },
  { id: 184, nombre: "CASI", igs: "41914S001", lat: 7.988841592, lon: -75.2000327, h: 69.106 },
  { id: 233, nombre: "CN19", igs: "80101M001", lat: 12.611849702, lon: -70.048499902, h: -0.369 },
  { id: 243, nombre: "COEC", igs: "42023M001", lat: 0.716068786, lon: -77.786984835, h: 3656.942 },
  { id: 268, nombre: "CUCU", igs: "41904S001", lat: 7.898460464, lon: -72.487939138, h: 311.166 },
  { id: 294, nombre: "DORA", igs: "41915S001", lat: 5.45384693, lon: -74.66331277, h: 204.474 },
  { id: 307, nombre: "EBPT", igs: "44469M001", lat: 7.591816231, lon: -74.791489996, h: 119.9 },
  { id: 326, nombre: "ESEC", igs: "42011M002", lat: 0.892267044, lon: -79.619737508, h: 46.954 },
  { id: 344, nombre: "FOEC", igs: "42041M001", lat: -0.463317881, lon: -76.989915964, h: 286.339 },
  { id: 346, nombre: "FQNE", igs: "41936S001", lat: 5.467345516, lon: -73.734808418, h: 2602.031 },
  { id: 354, nombre: "GARA", igs: "41945M001", lat: 5.081335019, lon: -73.360037628, h: 1750.933 },
  { id: 428, nombre: "IBAG", igs: "41918S001", lat: 4.428046992, lon: -75.214723344, h: 1216.074 },
  { id: 429, nombre: "IBEC", igs: "42024M001", lat: 0.350158392, lon: -78.11568673, h: 2246.177 },
  { id: 440, nombre: "IGN1", igs: "41303M001", lat: 8.98488748, lon: -79.535752581, h: 47.581 },
  { id: 512, nombre: "LAEC", igs: "42052M001", lat: 0.082898026, lon: -76.873566273, h: 324.351 },
  { id: 532, nombre: "LIPA", igs: "44470M001", lat: 6.787874735, lon: -71.025274616, h: 129.442 },
  { id: 585, nombre: "MEDE", igs: "41921S001", lat: 6.199406662, lon: -75.578916042, h: 1553.472 },
  { id: 665, nombre: "MUEC", igs: "42054M001", lat: 0.604640732, lon: -80.023760273, h: 18.994 },
  { id: 686, nombre: "NEVA", igs: "41923S001", lat: 2.937302652, lon: -75.293031557, h: 472.686 },
  { id: 781, nombre: "PERA", igs: "41905S001", lat: 4.792498169, lon: -75.689509102, h: 1496.737 },
  { id: 789, nombre: "PIEC", igs: "42053M001", lat: 0.395601753, lon: -77.9395801, h: 2149.86 },
  { id: 809, nombre: "POPA", igs: "41924S001", lat: 2.443116109, lon: -76.601205508, h: 1782.186 },
  { id: 824, nombre: "PSEC", igs: "42061M001", lat: 0.071402921, lon: -80.041357398, h: 54.007 },
  { id: 825, nombre: "PSTO", igs: "41925S001", lat: 1.211713196, lon: -77.277080315, h: 2569.088 },
  { id: 842, nombre: "QNEC", igs: "42058M001", lat: 0.334036011, lon: -79.46927698, h: 118.957 },
  { id: 899, nombre: "RVEC", igs: "42059M001", lat: 1.074296674, lon: -79.413038376, h: 31.43 },
  { id: 906, nombre: "SAMA", igs: "41928S001", lat: 11.225249456, lon: -74.1870917, h: 22.654 },
  { id: 929, nombre: "SDTA", igs: "44482M001", lat: 8.083456076, lon: -72.802285618, h: 310.862 },
  { id: 949, nombre: "SJNE", igs: "44472M001", lat: 9.956734809, lon: -75.074995651, h: 176.758 },
  { id: 961, nombre: "SNLR", igs: "42021M001", lat: 1.292516999, lon: -78.847004529, h: 23.073 },
  { id: 963, nombre: "SOCB", igs: "44473M001", lat: 5.996694367, lon: -72.698526785, h: 2692.168 },
  { id: 968, nombre: "SONE", igs: "44474M001", lat: 9.728131167, lon: -75.524938797, h: 23.927 },
  { id: 19, nombre: "TARZ", igs: "44477M001", lat: 7.571786535, lon: -75.407248091, h: 198.709 },
  { id: 61, nombre: "TPEC", igs: "42049M001", lat: -0.789772998, lon: -75.52704743, h: 214.103 },
  { id: 74, nombre: "TUMA", igs: "41929S001", lat: 1.822275818, lon: -78.730411702, h: 25.847 },
  { id: 75, nombre: "TUNA", igs: "41930S001", lat: 5.53133093, lon: -73.363881879, h: 2831.842 },
  { id: 207, nombre: "ZARZ", igs: "41950M001", lat: 4.396577037, lon: -76.067567014, h: 954.458 },
];

export const STATION_COUNT = 50;
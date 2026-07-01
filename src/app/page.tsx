"use client";

import { useMemo, useState } from "react";
import {
  Satellite,
  MapPin,
  Clock,
  Radio,
  Download,
  Loader2,
  Search,
  Info,
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StationMap from "@/components/station-map";
import type { CalcResponse, StationResult } from "@/lib/types";
import { fmt } from "@/lib/geodesy";
import { STATION_COUNT } from "@/lib/stations";

// Coordenadas de ejemplo (campus U. Nacional - Bogotá) — botón de ejemplo rápido
const EXAMPLES = [
  { label: "Bogotá (UNAL)", lat: 4.638289, lon: -74.084058 },
  { label: "Cali (Paseo Bolívar)", lat: 3.451608, lon: -76.532034 },
  { label: "Medellín (P. Botero)", lat: 6.251364, lon: -75.568099 },
  { label: "Barranquilla", lat: 10.96854, lon: -74.781318 },
];

interface FormState {
  // DD
  latDd: string;
  lonDd: string;
  // GMS
  latG: string;
  latM: string;
  latS: string;
  latHemi: "N" | "S";
  lonG: string;
  lonM: string;
  lonS: string;
  lonHemi: "E" | "W";
}

const initialForm: FormState = {
  latDd: "",
  lonDd: "",
  latG: "",
  latM: "",
  latS: "",
  latHemi: "N",
  lonG: "",
  lonM: "",
  lonS: "",
  lonHemi: "W",
};

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [tab, setTab] = useState<"dd" | "gms">("dd");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CalcResponse | null>(null);
  const [clientErrors, setClientErrors] = useState<string[]>([]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const gmsToDd = (
    g: string,
    m: string,
    s: string,
    hemi: "N" | "S" | "E" | "W",
  ): number => {
    const gd = parseFloat(g);
    const md = parseFloat(m) || 0;
    const sd = parseFloat(s) || 0;
    const abs = Math.abs(gd) + md / 60 + sd / 3600;
    return hemi === "S" || hemi === "W" ? -abs : abs;
  };

  const handleSubmit = async (lat: number, lon: number) => {
    setLoading(true);
    setClientErrors([]);
    setData(null);
    try {
      const r = await fetch("/api/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      const json = (await r.json()) as CalcResponse;
      if (!r.ok || !json.ok) {
        setClientErrors(json.errors ?? [json.error ?? "Error desconocido"]);
      } else {
        setData(json);
      }
    } catch (e) {
      setClientErrors([
        e instanceof Error ? e.message : "Error de red al contactar con /api/calc",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    let lat: number;
    let lon: number;
    if (tab === "dd") {
      lat = parseFloat(form.latDd);
      lon = parseFloat(form.lonDd);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        setClientErrors(["Latitud y longitud en grados decimales deben ser valores numéricos."]);
        return;
      }
    } else {
      if (!form.latG || !form.lonG) {
        setClientErrors(["Los grados de latitud y longitud son obligatorios en GMS."]);
        return;
      }
      lat = gmsToDd(form.latG, form.latM, form.latS, form.latHemi);
      lon = gmsToDd(form.lonG, form.lonM, form.lonS, form.lonHemi);
    }
    void handleSubmit(lat, lon);
  };

  const loadExample = (lat: number, lon: number) => {
    setForm({
      ...initialForm,
      latDd: lat.toString(),
      lonDd: lon.toString(),
    });
    setTab("dd");
    void handleSubmit(lat, lon);
  };

  const csvHref = useMemo(() => {
    if (!data?.all) return "";
    const rows = [
      ["ID", "Nombre", "Codigo_IGS", "Latitud_DD", "Longitud_DD", "Latitud_GMS", "Longitud_GMS", "Altura_Elipsoidal_m", "Distancia_km", "Acimut_grados", "Tiempo_min", "Tiempo_formateado"],
      ...data.all.map((s) => [
        String(s.id),
        s.nombre,
        s.igs,
        s.lat.toString(),
        s.lon.toString(),
        s.latDms,
        s.lonDms,
        s.h.toString(),
        s.distanceKm.toString(),
        s.azimuth1.toString(),
        s.trackingMinutes.toString(),
        s.trackingFormatted,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }, [data]);

  const top3 = data?.top3 ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
              <Satellite className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold leading-tight">
                Buscador de Estaciones MAGNA-ECO
              </h1>
              <p className="text-xs text-muted-foreground">
                Tiempo mínimo de rastreo GNSS · Resolución IGAC 643/2018
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            <Radio className="h-3 w-3 mr-1.5" />
            {STATION_COUNT} estaciones activas
          </Badge>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Hero / descripción del proyecto */}
        <section className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                ¿Qué hace esta aplicación?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Calcula la <strong>distancia geodésica</strong> entre un punto que ingreses y las{" "}
                <strong>{STATION_COUNT} estaciones MAGNA-ECO</strong> operadas por el IGAC, usando el
                método iterativo de <strong>Vincenty sobre el elipsoide WGS84</strong> (a = 6 378 137.0 m, 1/f = 298.257 223 563).
              </p>
              <p>
                Luego estima el <strong>tiempo mínimo de rastreo GNSS</strong> según la
                Resolución 643 del 30 de mayo de 2018 del IGAC:{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">t = 65 min + 3 min × |d − 10|</code>
                {" "}donde <em>d</em> es la distancia en kilómetros.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                Ejemplo IGAC
              </CardTitle>
              <CardDescription className="text-xs">
                Punto cerca al proyecto Florentino, estación CALI a 3.4 km
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <code className="block bg-muted p-2 rounded text-xs leading-relaxed">
                t = 65 + 3 × |3.4 − 10|<br />
                t = 65 + 19.8 = 84.8 min<br />
                t ≈ 1 h 25 min
              </code>
            </CardContent>
          </Card>
        </section>

        {/* Formulario de coordenadas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Ingrese las coordenadas del punto a rastrear
            </CardTitle>
            <CardDescription>
              Datum: MAGNA-SIRGAS / WGS84. Territorio colombiano: lat 4.5°S a 13.5°N, lon 79.5°O a 66.5°O.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "dd" | "gms")}>
              <TabsList>
                <TabsTrigger value="dd">Grados decimales (DD)</TabsTrigger>
                <TabsTrigger value="gms">GMS (° ′ ″)</TabsTrigger>
              </TabsList>

              {/* Pestaña DD */}
              <TabsContent value="dd" className="mt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latDd">Latitud (°)</Label>
                    <Input
                      id="latDd"
                      type="number"
                      step="0.000001"
                      placeholder="Ej: 4.638289"
                      value={form.latDd}
                      onChange={(e) => set("latDd", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSubmit();
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Rango válido: −4.5 a 13.5</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lonDd">Longitud (°)</Label>
                    <Input
                      id="lonDd"
                      type="number"
                      step="0.000001"
                      placeholder="Ej: -74.084058"
                      value={form.lonDd}
                      onChange={(e) => set("lonDd", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSubmit();
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Rango válido: −79.5 a −66.5</p>
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña GMS */}
              <TabsContent value="gms" className="mt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Latitud GMS */}
                  <div className="space-y-2">
                    <Label>Latitud (GMS)</Label>
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                      <Input
                        type="number"
                        step="1"
                        placeholder="°"
                        value={form.latG}
                        onChange={(e) => set("latG", e.target.value)}
                      />
                      <Input
                        type="number"
                        step="1"
                        placeholder="′"
                        value={form.latM}
                        onChange={(e) => set("latM", e.target.value)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="″"
                        value={form.latS}
                        onChange={(e) => set("latS", e.target.value)}
                      />
                      <Select
                        value={form.latHemi}
                        onValueChange={(v) => set("latHemi", v as "N" | "S")}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N">N</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Longitud GMS */}
                  <div className="space-y-2">
                    <Label>Longitud (GMS)</Label>
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                      <Input
                        type="number"
                        step="1"
                        placeholder="°"
                        value={form.lonG}
                        onChange={(e) => set("lonG", e.target.value)}
                      />
                      <Input
                        type="number"
                        step="1"
                        placeholder="′"
                        value={form.lonM}
                        onChange={(e) => set("lonM", e.target.value)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="″"
                        value={form.lonS}
                        onChange={(e) => set("lonS", e.target.value)}
                      />
                      <Select
                        value={form.lonHemi}
                        onValueChange={(v) => set("lonHemi", v as "E" | "W")}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="E">E</SelectItem>
                          <SelectItem value="W">O</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Ejemplos rápidos */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Probar con:</span>
              {EXAMPLES.map((ex) => (
                <Button
                  key={ex.label}
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample(ex.lat, ex.lon)}
                  disabled={loading}
                >
                  {ex.label}
                </Button>
              ))}
            </div>

            {clientErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error de validación</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {clientErrors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2 border-t bg-muted/30">
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculando…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Calcular distancias y tiempos
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Resultados */}
        {data && data.ok && data.point && data.top3 && data.all && (
          <ResultsView
            point={data.point}
            top3={data.top3}
            all={data.all}
            csvHref={csvHref}
          />
        )}
      </main>

      <footer className="border-t mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>
            Proyecto Final · Geodesia Geométrica · Semestre I-2026
          </span>
          <span className="font-mono">
            Vincenty (WGS84) · IGAC Res. 643/2018
          </span>
        </div>
      </footer>
    </div>
  );
}

// -----------------------------------------------------------------------
// Vista de resultados
// -----------------------------------------------------------------------
function ResultsView({
  point,
  top3,
  all,
  csvHref,
}: {
  point: CalcResponse["point"];
  top3: StationResult[];
  all: StationResult[];
  csvHref: string;
}) {
  if (!point) return null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="space-y-6">
      {/* Resumen del punto */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Punto procesado
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Latitud (DD)</p>
            <p className="font-mono">{point.lat.toFixed(6)}°</p>
            <p className="text-xs text-muted-foreground mt-1">{point.latDms}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Longitud (DD)</p>
            <p className="font-mono">{point.lon.toFixed(6)}°</p>
            <p className="text-xs text-muted-foreground mt-1">{point.lonDms}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estaciones analizadas</p>
            <p className="font-mono text-lg">{all.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Datum</p>
            <p className="font-mono">WGS84 / MAGNA-SIRGAS</p>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 estaciones más cercanas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              Top 3 estaciones MAGNA-ECO más cercanas
            </h2>
            <p className="text-xs text-muted-foreground">
              Ranking según distancia geodésica Vincenty sobre WGS84
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {top3.map((s, idx) => (
            <StationRankCard key={`${s.id}-${s.nombre}`} station={s} rank={idx + 1} />
          ))}
        </div>
      </div>

      {/* Mapa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Mapa de localización
          </CardTitle>
          <CardDescription>
            Punto a rastrear (rojo) y las tres estaciones MAGNA-ECO más cercanas con líneas geodésicas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] sm:h-[480px] rounded-xl overflow-hidden border">
            <StationMap point={point} top3={top3} allCount={all.length} />
          </div>
        </CardContent>
      </Card>

      {/* Tabla completa + exportación */}
      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">Distancias a todas las estaciones</CardTitle>
            <CardDescription>
              Las {all.length} estaciones MAGNA-ECO ordenadas de menor a mayor distancia.
            </CardDescription>
          </div>
          <Button asChild size="sm">
            <a
              href={csvHref}
              download={`magna-eco_resultados_${today}.csv`}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-h-[480px] overflow-auto thin-scroll rounded-md border">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Estación</th>
                  <th className="px-3 py-2 font-medium">IGS</th>
                  <th className="px-3 py-2 font-medium text-right">Distancia (km)</th>
                  <th className="px-3 py-2 font-medium text-right">Tiempo mín.</th>
                  <th className="px-3 py-2 font-medium text-right">Acimut (°)</th>
                  <th className="px-3 py-2 font-medium">Latitud</th>
                  <th className="px-3 py-2 font-medium">Longitud</th>
                </tr>
              </thead>
              <tbody>
                {all.map((s, idx) => (
                  <tr
                    key={`${s.id}-${s.nombre}`}
                    className={`border-t hover:bg-muted/40 ${idx < 3 ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""}`}
                  >
                    <td className="px-3 py-2 font-mono">{idx + 1}</td>
                    <td className="px-3 py-2 font-semibold">{s.nombre}</td>
                    <td className="px-3 py-2 text-muted-foreground font-mono">{s.igs}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmt(s.distanceKm, 3)}</td>
                    <td className="px-3 py-2 text-right font-mono">{s.trackingFormatted}</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">{fmt(s.azimuth1, 2)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{s.lat.toFixed(6)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{s.lon.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function StationRankCard({ station, rank }: { station: StationResult; rank: number }) {
  const palette = [
    { bg: "bg-emerald-500", soft: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-200 dark:ring-emerald-900" },
    { bg: "bg-teal-500", soft: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-700 dark:text-teal-300", ring: "ring-teal-200 dark:ring-teal-900" },
    { bg: "bg-cyan-600", soft: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-700 dark:text-cyan-300", ring: "ring-cyan-200 dark:ring-cyan-900" },
  ];
  const c = palette[rank - 1];
  return (
    <Card className={`relative overflow-hidden ring-1 ${c.ring} ${c.soft}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${c.bg}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`grid place-items-center h-7 w-7 rounded-full ${c.bg} text-white text-xs font-bold`}>
                {rank}
              </span>
              <CardTitle className="text-lg font-bold tracking-wide">{station.nombre}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">IGS: {station.igs}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Distancia</p>
            <p className={`font-mono font-semibold ${c.text}`}>
              {fmt(station.distanceKm, 3)} km
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {fmt(station.distanceM, 0)} m
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Tiempo mín.
            </p>
            <p className={`font-mono font-semibold ${c.text}`}>
              {station.trackingFormatted}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {station.trackingMinutes.toFixed(1)} min
            </p>
          </div>
        </div>
        <Separator />
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Latitud</span>
            <span className="font-mono">{station.lat.toFixed(6)}°</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Longitud</span>
            <span className="font-mono">{station.lon.toFixed(6)}°</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Alt. elipsoidal</span>
            <span className="font-mono">{fmt(station.h, 3)} m</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Acimut P→E</span>
            <span className="font-mono">{fmt(station.azimuth1, 2)}°</span>
          </div>
        </div>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">Ver coordenadas en GMS</summary>
          <div className="mt-2 space-y-1 font-mono">
            <p>Lat: {station.latDms}</p>
            <p>Lon: {station.lonDms}</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

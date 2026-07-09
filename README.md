#  Buscador de Estaciones MAGNA-ECO

Aplicación web para buscar las estaciones MAGNA-ECO del IGAC más cercanas a un punto y estimar el tiempo mínimo de rastreo GNSS según la **Resolución IGAC 643/2018**. 
> Presentado por Mabilton Estiven Carlosama - Cod. 2438826

> **Proyecto Final — Geodesia Geométrica (Cód. 720055C) — Semestre I-2026**
> Profesor: Julián Esteban Londoño Vélez

---

##  Tabla de contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Uso de la aplicación](#uso-de-la-aplicación)
- [Modelos geodésicos](#modelos-geodésicos)
- [API](#api)
- [Pruebas](#pruebas)
- [Licencia](#licencia)

---

## Descripción

En los levantamientos topográficos y geodésicos con tecnología GNSS, el posicionamiento diferencial requiere la corrección de las observaciones del punto de interés a partir de una estación de referencia de observación continua. En Colombia, esta función la cumplen las **estaciones MAGNA-ECO** operadas por el IGAC.

El tiempo mínimo de rastreo en campo depende directamente de la distancia entre el punto a levantar y la estación de referencia seleccionada, tal como lo establece la Resolución 643 del 30 de mayo de 2018 del IGAC. Esta aplicación automatiza ese cálculo, facilitando la planificación de campañas GNSS.

## Características

-  **Ingreso de coordenadas** en grados decimales (DD) o grados, minutos y segundos (GMS)
-  **Validación de territorio colombiano** (lat −4.5° a 13.5°, lon −79.5° a −66.5°)
-  **Cálculo de distancia geodésica** a las 50 estaciones MAGNA-ECO con el método iterativo de Vincenty sobre el elipsoide WGS84
-  **Top 3 estaciones más cercanas** con nombre, código IGS, distancia, tiempo mínimo de rastreo, coordenadas y acimut
- **Mapa interactivo** (Leaflet) con marcadores y líneas geodésicas
-  **Tabla completa** con las 50 estaciones ordenadas por distancia
- **Exportación CSV** de todos los resultados
- **Diseño responsive** (móvil y escritorio) 

## Stack tecnológico

| Componente | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 + shadcn/ui |
| Mapa | Leaflet + react-leaflet |
| Cálculo geodésico | Implementación propia de Vincenty (WGS84) |
| Datos | Archivo TypeScript con las 50 estaciones (extraídas del Excel del IGAC) |

## Estructura del proyecto

```
magna-eco-buscador/
├── src/
│   ├── app/
│   │   ├── api/calc/route.ts    ← API REST: POST /api/calc
│   │   ├── globals.css          ← Estilos globales + Leaflet CSS
│   │   ├── layout.tsx           ← Layout raíz
│   │   └── page.tsx             ← Página principal (UI)
│   ├── components/
│   │   ├── map-inner.tsx        ← Mapa Leaflet (client-only)
│   │   ├── station-map.tsx      ← Wrapper con dynamic import
│   │   └── ui/                  ← Componentes shadcn/ui
│   ├── lib/
│   │   ├── geodesy.ts           ← Vincenty + GMS + IGAC 643/2018
│   │   ├── stations.ts          ← 50 estaciones MAGNA-ECO
│   │   ├── types.ts             ← Tipos compartidos
│   │   ├── db.ts                ← Cliente Prisma (no usado en este proyecto)
│   │   └── utils.ts             ← Utilidades
│   └── hooks/
├── public/                      ← Logo y assets estáticos
├── prisma/schema.prisma         ← Schema Prisma (no usado en este proyecto)
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── eslint.config.mjs
└── README.md (este archivo)
```

## Instalación y ejecución

##Requisitos previos Para la ejecución de Forma Local Es necesario lo siguiente:

- **Node.js** 18.17 o superior — descárgalo de https://nodejs.org (versión LTS recomendada)
- **npm** (incluido con Node.js)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/magna-eco-buscador.git
cd magna-eco-buscador

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abrir **http://localhost:3000** en el navegador (Chrome, Firefox o Edge).

>  **Importante para Windows:** si al ejecutar `npm run dev` ves el error `"tee" no se reconoce como un comando`, abre `package.json` y verifica que el script `dev` sea `"dev": "next dev -p 3000"` (sin `tee` ni `2>&1`). La versión actual del repositorio ya está corregida.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Compila la app para producción |
| `npm run start` | Servidor de producción (después de `build`) |
| `npm run lint` | Verifica la calidad del código con ESLint |

#Para ser usado de Formal remota sin la instalacion de Ningun documento 

se requiere ingresar al link 
https://magna-eco-buscador-19k7f3kid-mabilton-estiven.vercel.app/

Es necesario la creación de una cuenta en vercel que es donde está alojado el servidor

## Uso de la aplicación

1. **Ingresa las coordenadas** del punto a rastrear (datum WGS84 / MAGNA-SIRGAS):
   - En la pestaña **DD** (grados decimales): p. ej. `4.638289` latitud, `-74.084058` longitud
   - En la pestaña **GMS**: p. ej. `4° 3 yo8' 17.84" N, 74° 05' 02.61" O`
2. Haz clic en **"Calcular distancias y tiempos"** o usa uno de los botones de ejemplo (Bogotá, Cali, Medellín, Barranquilla).
3. **Revisa los resultados:**
   - Tarjetas **Top 3 estaciones más cercanas** con distancia, tiempo y coordenadas.
   - **Mapa interactivo** con el punto (rojo) y las tres estaciones más cercanas (numeradas).
   - **Tabla completa** con las 50 estaciones ordenadas por distancia.
4. Haz clic en **"Exportar CSV"** para descargar todos los resultados en formato CSV.

## Modelos geodésicos

### Elipsoide WGS84

| Parámetro | Valor |
|---|---|
| Semieje mayor (a) | 6 378 137.0 m |
| Achatamiento inverso (1/f) | 298.257 223 563 |
| Semieje menor (b, derivado) | 6 356 752.314 245 m |

### Distancia geodésica — Método de Vincenty (1975)

Implementación propia del método iterativo de Vincenty (problema inverso) con tolerancia de convergencia 10⁻¹². Referencia: Vincenty, T. (1975). *Direct and Inverse Solutions of Geodesics on the Ellipsoid with Application of Nested Equations*. Survey Review, 23(176), 88-93.

### Tiempo mínimo de rastreo — Resolución IGAC 643/2018

```
t [min] = 65 + 3 × |d − 10|
```

donde `d` es la distancia geodésica en kilómetros entre el punto y la estación MAGNA-ECO de referencia.

**Ejemplo:** punto a 3.4 km de la estación CALI → t = 65 + 3 × |3.4 − 10| = 84.8 min ≈ 1 h 25 min.

## API

### `POST /api/calc`

Calcula la distancia geodésica y el tiempo mínimo de rastreo desde un punto a las 50 estaciones MAGNA-ECO.

**Petición:**

```json
{
  "lat": 4.638289,
  "lon": -74.084058
}
```

**Respuesta exitosa (200):**

```json
{
  "ok": true,
  "point": {
    "lat": 4.638289,
    "lon": -74.084058,
    "latDms": "04° 38' 17.84\" N",
    "lonDms": "74° 05' 02.61\" W"
  },
  "total": 50,
  "top3": [ /* 3 estaciones más cercanas */ ],
  "all":   [ /* 50 estaciones ordenadas por distancia */ ]
}
```

**Respuesta de error (400):**

```json
{
  "ok": false,
  "errors": ["Latitud fuera de rango. Colombia: -4.5° a 13.5°."]
}
```

## Pruebas

| # | Caso de prueba | Entrada | Salida esperada | Salida obtenida | Estado |
|---|---|---|---|---|---|
| 1 | Ejemplo del PDF (3.4 km de CALI) | 3.406, -76.533 | 84.8 min | 84.8 min | 
| 2 | Distancia Bogotá-CALI | 4.638, -74.084 | ≈ 305 km | 305.645 km | 
| 3 | Bogotá → Top-3 | 4.638, -74.084 | BOGT, BOGA, ABCC | BOGT, BOGA, ABCC | 
| 4 | Coordenadas fuera de Colombia | 40.0, -100.0 | HTTP 400 | HTTP 400 | 
| 5 | GMS → CALI exacta | 3°22'32.84"N 76°31'57.23"O | CALI 0.000 km | CALI 0.000 km | 

## Licencia

Proyecto académico para el curso de Geodesia Geométrica — Universidad del Valle

---

**Datos de las estaciones:** archivo `coord_estaciones.xlsx` suministrado por el docente (50 estaciones MAGNA-ECO activas operadas por el IGAC).

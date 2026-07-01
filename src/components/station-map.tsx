"use client";

import dynamic from "next/dynamic";
import type { StationResult, PointInfo } from "@/lib/types";

interface StationMapProps {
  point: PointInfo;
  top3: StationResult[];
  allCount: number;
}

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full animate-pulse rounded-xl bg-muted" />
  ),
});

export default function StationMap(props: StationMapProps) {
  return <MapInner {...props} />;
}

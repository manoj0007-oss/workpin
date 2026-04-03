"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Job, Profile } from "@/lib/types";
import { formatDistance, haversineDistance } from "@/lib/geo";

interface MapViewProps {
    center: [number, number]; // [lng, lat]
    jobs: Job[];
    workers?: Profile[];
    radius: number; // in km
    onJobClick?: (job: Job) => void;
    onWorkerClick?: (worker: Profile) => void;
    userRole?: string;
}

export function MapView({ center, jobs, workers = [], radius, onJobClick, onWorkerClick, userRole }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    const clearMarkers = useCallback(() => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
    }, []);

    useEffect(() => {
        if (!mapContainer.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: center,
            zoom: 13,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        // User marker
        const userEl = document.createElement("div");
        userEl.className = "user-marker";
        userEl.innerHTML = `<div style="width:20px;height:20px;background:#1352ab;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`;
        new mapboxgl.Marker({ element: userEl })
            .setLngLat(center)
            .addTo(map.current);

        return () => {
            clearMarkers();
            map.current?.remove();
        };
    }, [center, clearMarkers]);

    // Add job/worker markers
    useEffect(() => {
        if (!map.current) return;
        clearMarkers();

        // Job markers (for workers)
        if (userRole !== "client") {
            jobs.forEach((job) => {
                const dist = haversineDistance(center[1], center[0], job.lat, job.lng);
                if (dist > radius) return;

                const el = document.createElement("div");
                el.style.cssText = "cursor:pointer;";
                el.innerHTML = `
          <div style="background:#1352ab;color:white;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:flex;align-items:center;gap:4px;">
            <span>₹${job.pay}</span>
            <span style="opacity:0.7;font-size:10px;">• ${formatDistance(dist)}</span>
          </div>
        `;

                el.addEventListener("click", () => onJobClick?.(job));

                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat([job.lng, job.lat])
                    .addTo(map.current!);

                markersRef.current.push(marker);
            });
        }

        // Worker markers (for clients)
        if (userRole === "client") {
            workers.forEach((worker) => {
                if (!worker.lat || !worker.lng) return;
                const dist = haversineDistance(center[1], center[0], worker.lat, worker.lng);
                if (dist > radius) return;

                const el = document.createElement("div");
                el.style.cssText = "cursor:pointer;";
                el.innerHTML = `
          <div style="background:${worker.is_available ? '#22c55e' : '#f59e0b'};color:white;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
            ${worker.full_name.split(" ")[0]} • ${formatDistance(dist)}
            ${!worker.is_available ? '<span style="font-size:10px;opacity:0.8;"> (busy)</span>' : ''}
          </div>
        `;

                el.addEventListener("click", () => onWorkerClick?.(worker));

                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat([worker.lng, worker.lat])
                    .addTo(map.current!);

                markersRef.current.push(marker);
            });
        }
    }, [jobs, workers, center, radius, onJobClick, onWorkerClick, userRole, clearMarkers]);

    return (
        <div ref={mapContainer} className="w-full h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] rounded-xl overflow-hidden" />
    );
}

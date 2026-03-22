"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { LocationPrompt } from "@/components/map/location-prompt";
import { MapView } from "@/components/map/map-view";
import { ListView } from "@/components/map/list-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, List, SlidersHorizontal } from "lucide-react";
import { haversineDistance } from "@/lib/geo";
import type { Job, Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function HomePage() {
    const { t } = useI18n();
    const router = useRouter();
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [viewMode, setViewMode] = useState<"map" | "list">("map");
    const [radius, setRadius] = useState(5);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [workers, setWorkers] = useState<Profile[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showRadius, setShowRadius] = useState(false);

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileData) {
                setProfile(profileData as Profile);
                if (profileData.lat && profileData.lng) {
                    setLocation({ lat: profileData.lat, lng: profileData.lng });
                }
            }
        };
        init();
    }, []);

    const fetchNearbyData = useCallback(async () => {
        if (!location || !profile) return;
        const supabase = createClient();

        if (profile.role === "worker") {
            const { data } = await supabase
                .from("jobs")
                .select("*, client:profiles!jobs_client_id_fkey(*)")
                .eq("status", "open");

            if (data) {
                const withDistance = (data as Job[])
                    .map((job) => ({
                        ...job,
                        distance: haversineDistance(location.lat, location.lng, job.lat, job.lng),
                    }))
                    .filter((job) => job.distance <= radius)
                    .sort((a, b) => a.distance - b.distance);
                setJobs(withDistance);
            }
        } else {
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "worker");

            if (data) {
                const withDistance = (data as Profile[])
                    .filter((w) => w.lat && w.lng)
                    .map((w) => ({
                        ...w,
                        distance: haversineDistance(location.lat, location.lng, w.lat!, w.lng!),
                    }))
                    .filter((w) => (w as Profile & { distance: number }).distance <= radius);
                setWorkers(withDistance);
            }

            // Also fetch jobs for client
            const { data: jobData } = await supabase
                .from("jobs")
                .select("*")
                .eq("client_id", profile.id);
            if (jobData) setJobs(jobData as Job[]);
        }
    }, [location, profile, radius]);

    useEffect(() => {
        fetchNearbyData();
    }, [fetchNearbyData]);

    const handleLocationGranted = async (lat: number, lng: number) => {
        setLocation({ lat, lng });
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from("profiles").update({ lat, lng }).eq("id", user.id);
        }
    };

    const handleJobClick = (job: Job) => {
        router.push(`/jobs/${job.id}`);
    };

    if (!location) {
        return <LocationPrompt onLocationGranted={handleLocationGranted} />;
    }

    return (
        <div className="flex flex-col">
            {/* Controls bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === "map" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("map")}
                        className="gap-1.5"
                    >
                        <Map className="h-4 w-4" />
                        {t("map_view")}
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="gap-1.5"
                    >
                        <List className="h-4 w-4" />
                        {t("list_view")}
                    </Button>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRadius(!showRadius)}
                    className="gap-1.5"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    {radius} km
                </Button>
            </div>

            {/* Radius slider */}
            {showRadius && (
                <div className="px-4 py-3 border-b bg-muted/30">
                    <label className="text-sm font-medium text-muted-foreground">
                        {t("search_radius")}: {radius} km
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={50}
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="w-full mt-2 accent-primary"
                    />
                </div>
            )}

            {/* Map or List */}
            {viewMode === "map" ? (
                <div className="px-4 py-3">
                    <MapView
                        center={[location.lng, location.lat]}
                        jobs={jobs}
                        workers={workers}
                        radius={radius}
                        onJobClick={handleJobClick}
                        userRole={profile?.role}
                    />
                </div>
            ) : (
                <ListView jobs={jobs} onJobClick={handleJobClick} />
            )}
        </div>
    );
}

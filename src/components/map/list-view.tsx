"use client";

import { useI18n } from "@/lib/i18n/context";
import type { Job } from "@/lib/types";
import { JobCard } from "@/components/jobs/job-card";
import { MapPin } from "lucide-react";

interface ListViewProps {
    jobs: Job[];
    onJobClick?: (job: Job) => void;
}

export function ListView({ jobs, onJobClick }: ListViewProps) {
    const { t } = useI18n();

    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">{t("no_jobs_nearby")}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4">
            {jobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => onJobClick?.(job)} />
            ))}
        </div>
    );
}

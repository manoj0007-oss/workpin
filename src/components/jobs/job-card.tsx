"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, IndianRupee } from "lucide-react";
import { formatDistance } from "@/lib/geo";
import type { Job } from "@/lib/types";

const categoryColors: Record<string, string> = {
    electrical: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    plumbing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    cleaning: "bg-green-500/10 text-green-600 dark:text-green-400",
    delivery: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    carpenter: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    general: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

interface JobCardProps {
    job: Job;
    onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
    const { t } = useI18n();

    const catKey = `cat_${job.category}` as string;

    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 border-0 shadow-md"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{job.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{job.description}</p>
                    </div>
                    <Badge variant="secondary" className={categoryColors[job.category] || ""}>
                        {t(catKey)}
                    </Badge>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1 font-semibold text-primary">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {job.pay}
                    </span>
                    {job.distance !== undefined && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {formatDistance(job.distance)}
                        </span>
                    )}
                    {job.client?.rating_avg ? (
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {job.client.rating_avg.toFixed(1)}
                        </span>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

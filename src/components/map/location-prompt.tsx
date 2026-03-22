"use client";

import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";

interface LocationPromptProps {
    onLocationGranted: (lat: number, lng: number) => void;
}

export function LocationPrompt({ onLocationGranted }: LocationPromptProps) {
    const { t } = useI18n();
    const [showManual, setShowManual] = useState(false);
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [loading, setLoading] = useState(false);

    const requestLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    onLocationGranted(pos.coords.latitude, pos.coords.longitude);
                    setLoading(false);
                },
                () => {
                    setShowManual(true);
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setShowManual(true);
            setLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        if (!isNaN(latNum) && !isNaN(lngNum)) {
            onLocationGranted(latNum, lngNum);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="w-full max-w-sm border-0 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>{t("location_permission")}</CardTitle>
                    <CardDescription>{t("location_permission_desc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!showManual ? (
                        <>
                            <Button onClick={requestLocation} className="w-full gap-2" disabled={loading}>
                                <Navigation className="h-4 w-4" />
                                {t("allow_location")}
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => setShowManual(true)}>
                                {t("enter_manually")}
                            </Button>
                        </>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <p className="text-sm text-muted-foreground text-center">{t("enter_location")}</p>
                            <div className="space-y-2">
                                <Label htmlFor="lat">{t("latitude")}</Label>
                                <Input
                                    id="lat"
                                    type="number"
                                    step="any"
                                    value={lat}
                                    onChange={(e) => setLat(e.target.value)}
                                    placeholder="17.3850"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lng">{t("longitude")}</Label>
                                <Input
                                    id="lng"
                                    type="number"
                                    step="any"
                                    value={lng}
                                    onChange={(e) => setLng(e.target.value)}
                                    placeholder="78.4867"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">{t("save_location")}</Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

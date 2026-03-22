import React from "react";

export function Logo({ className = "", size = 32 }: { className?: string; size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Map pin shape */}
            <path
                d="M24 4C16.268 4 10 10.268 10 18c0 10.5 14 26 14 26s14-15.5 14-26c0-7.732-6.268-14-14-14z"
                fill="#6366f1"
            />
            {/* Inner circle */}
            <circle cx="24" cy="18" r="8" fill="white" opacity="0.95" />
            {/* W letterform */}
            <path
                d="M19 14l2.5 8 2.5-5 2.5 5 2.5-8"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}

export function LogoWithText({ className = "", size = 32 }: { className?: string; size?: number }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Logo size={size} />
            <span
                className="font-bold tracking-tight text-foreground"
                style={{ fontSize: size * 0.65 }}
            >
                Work<span className="text-primary">pin</span>
            </span>
        </div>
    );
}

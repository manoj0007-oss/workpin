import { LogoWithText } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="mb-8">
                <LogoWithText size={48} />
            </div>
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}

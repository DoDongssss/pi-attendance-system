// resources/js/layouts/kiosk-layout.tsx
import { ReactNode, useEffect, useState } from 'react';

export default function KioskLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top bar */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PI</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 leading-none">
                            PI Attendance System
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Attendance Kiosk</p>
                    </div>
                </div>
                <LiveClock />
            </header>

            {/* Main */}
            <main className="flex-1 flex overflow-hidden">
                {children}
            </main>
        </div>
    );
}

export function LiveClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="text-right">
            <p className="text-sm font-semibold text-gray-800 font-mono">
                {time.toLocaleTimeString('en-PH', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
                {time.toLocaleDateString('en-PH', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                })}
            </p>
        </div>
    );
}
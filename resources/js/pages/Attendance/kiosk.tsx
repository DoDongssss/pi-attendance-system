// resources/js/pages/Attendance/Kiosk.tsx
import KioskLayout from '@/layouts/kiosk-layout';
import { usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface KioskFlash {
    status: 'success' | 'error';
    action?: 'check-in' | 'check-out';
    badge?: 'present' | 'late';
    message: string;
    name?: string;
    code?: string;
    time?: string;
    date?: string;
    detail?: string;
    threshold?: string;
}

interface PageProps {
    flash: { kiosk?: KioskFlash };
    [key: string]: unknown;
}

const RESET_SECONDS = 10;

export default function Kiosk() {
    const { flash } = usePage<PageProps>().props;
    const kiosk = flash?.kiosk ?? null;

    const [code, setCode]                   = useState('');
    const [scanning, setScanning]           = useState(false);
    const [submitting, setSubmitting]       = useState(false);
    const [countdown, setCountdown]         = useState(RESET_SECONDS);
    const [lastResult, setLastResult]       = useState<KioskFlash | null>(null);
    const [justSubmitted, setJustSubmitted] = useState(false);

    const inputRef  = useRef<HTMLInputElement>(null);
    const videoRef  = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef    = useRef<number | null>(null);

    // When new kiosk flash arrives, store as lastResult
    useEffect(() => {
        if (kiosk) {
            setLastResult(kiosk);
            setJustSubmitted(true);
            setCountdown(RESET_SECONDS);
        }
    }, [kiosk]);

    // Countdown — clears input and refocuses, but keeps lastResult
    useEffect(() => {
        if (!justSubmitted) return;
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setJustSubmitted(false);
                    setCode('');
                    inputRef.current?.focus();
                    return RESET_SECONDS;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [justSubmitted]);

    // Focus input on load
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    function handleSubmit() {
        if (!code.trim() || submitting) return;
        setSubmitting(true);
        router.post('/attendance/kiosk', { code: code.trim() }, {
            onFinish: () => setSubmitting(false),
        });
    }

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            streamRef.current = stream;
            setScanning(true);

            // Wait for next render tick so videoRef is mounted
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().then(() => {
                        scanFrame();
                    }).catch(() => {
                        scanFrame(); // fallback if play() promise fails
                    });
                }
            }, 100);
        } catch {
            alert('Camera not accessible. Make sure you are on HTTPS or localhost.');
        }
    }

    function stopCamera() {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setScanning(false);
    }

    function scanFrame() {
        const video  = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !streamRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scan = () => {
            if (!streamRef.current) return;

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width  = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const result    = jsQR(imageData.data, imageData.width, imageData.height);

                if (result?.data) {
                    // Extract PI code — handles both raw code and full URL
                    const parts     = result.data.split('/');
                    const extracted = parts[parts.length - 1];
                    stopCamera();
                    setCode(extracted);
                    router.post('/attendance/kiosk', { code: extracted });
                    return;
                }
            }

            rafRef.current = requestAnimationFrame(scan);
        };

        rafRef.current = requestAnimationFrame(scan);
    }

    const isSuccess = lastResult?.status === 'success';

    return (
        <KioskLayout>
            {/* ── Left — Input panel ── */}
            <div className="w-full max-w-sm border-r border-gray-200 bg-white flex flex-col p-8 gap-6">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Record Attendance</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Enter PI number or scan QR code
                    </p>
                </div>

                {/* Manual input */}
                <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        PI Number
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        placeholder="PI-2025-000001"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm font-mono placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest bg-gray-50"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !code.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : 'Submit'}
                    </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-gray-100" />
                    <span className="text-gray-300 text-xs">or</span>
                    <div className="flex-1 border-t border-gray-100" />
                </div>

                {/* QR Scanner */}
                <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        QR Code
                    </label>

                    {scanning ? (
                        <div className="space-y-2">
                            <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-square">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                {/* Hidden canvas for jsQR processing */}
                                <canvas ref={canvasRef} className="hidden" />

                                {/* Corner guide brackets */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-40 h-40 relative">
                                        <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blue-400 rounded-tl" />
                                        <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blue-400 rounded-tr" />
                                        <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blue-400 rounded-bl" />
                                        <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blue-400 rounded-br" />
                                    </div>
                                </div>
                                <p className="absolute bottom-2 left-0 right-0 text-center text-white/50 text-xs">
                                    Align QR within frame
                                </p>
                            </div>
                            <button
                                onClick={stopCamera}
                                className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                Cancel Scan
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={startCamera}
                            className="w-full py-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <span>📷</span> Open Camera
                        </button>
                    )}
                </div>

                {/* Bottom hint */}
                <p className="text-xs text-gray-300 text-center mt-auto">
                    Press Enter or click Submit after typing
                </p>
            </div>

            {/* ── Right — Result panel ── */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-10">
                {lastResult ? (
                    <div className="w-full max-w-md space-y-5">

                        {/* Avatar + Name card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center gap-4">

                            {/* Avatar */}
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white ${
                                isSuccess ? 'bg-blue-500' : 'bg-red-400'
                            }`}>
                                {lastResult.name
                                    ? lastResult.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
                                    : '?'
                                }
                            </div>

                            {/* Name & code */}
                            <div>
                                <p className="text-2xl font-bold text-gray-900 leading-tight">
                                    {lastResult.name ?? 'Unknown'}
                                </p>
                                <span className="inline-block mt-1 font-mono text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                    {lastResult.code}
                                </span>
                            </div>

                            {/* Action badge */}
                            {lastResult.action && (
                                <span className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ${
                                    lastResult.action === 'check-in'
                                        ? 'bg-green-50 text-green-700 border border-green-100'
                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                }`}>
                                    {lastResult.action === 'check-in' ? 'Checked In' : 'Checked Out'}
                                </span>
                            )}

                            {/* Error message */}
                            {!isSuccess && (
                                <div className="space-y-1">
                                    <p className="text-red-500 text-sm font-semibold">
                                        {lastResult.message}
                                    </p>
                                    {lastResult.detail && (
                                        <p className="text-red-400 text-xs">{lastResult.detail}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Detail rows — success only */}
                        {isSuccess && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">

                                <div className="flex items-center justify-between px-6 py-4">
                                    <span className="text-sm text-gray-400">Time</span>
                                    <span className="text-xl font-mono font-bold text-gray-900">
                                        {lastResult.time}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between px-6 py-4">
                                    <span className="text-sm text-gray-400">Date</span>
                                    <span className="text-sm font-medium text-gray-700">
                                        {lastResult.date}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between px-6 py-4">
                                    <span className="text-sm text-gray-400">Status</span>
                                    <span className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                                        lastResult.badge === 'present'
                                            ? 'bg-green-50 text-green-600 border border-green-100'
                                            : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                                    }`}>
                                        {lastResult.badge}
                                    </span>
                                </div>

                                {lastResult.badge === 'late' && lastResult.threshold && (
                                    <div className="flex items-center justify-between px-6 py-4">
                                        <span className="text-sm text-gray-400">Threshold</span>
                                        <span className="text-sm font-medium text-yellow-600">
                                            {lastResult.threshold}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Countdown bar */}
                        {justSubmitted && (
                            <div className="space-y-1.5 px-1">
                                <div className="w-full bg-gray-200 rounded-full h-0.5">
                                    <div
                                        className="h-0.5 rounded-full bg-blue-400 transition-all duration-1000"
                                        style={{ width: `${(countdown / RESET_SECONDS) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-300 text-center">
                                    Ready for next person in {countdown}s
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                            <span className="text-2xl font-bold text-gray-300">PI</span>
                        </div>
                        <p className="text-sm text-gray-300 font-medium">
                            No attendance recorded yet
                        </p>
                    </div>
                )}
            </div>
        </KioskLayout>
    );
}